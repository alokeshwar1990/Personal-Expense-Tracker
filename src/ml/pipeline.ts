import { Category, CATEGORIES } from '../types/expense';
import { TRAINING_DATASET } from './trainingData';
import { preprocessText } from './textPreprocessing';
import { TFIDFVectorizer } from './tfidf';
import { WideAndDeepNeuralNetwork } from './neuralNetwork';
import { MulticlassLogisticRegression } from './logisticRegression';
import {
  ClassEvaluationDetail,
  MLModelType,
  MLPredictionResult,
  ModelEvaluationSummary,
  ModelMetrics,
  TrainingExample,
} from './types';

/**
 * Computes exact confusion matrix, per-class Precision/Recall/F1/Support,
 * and macro-averaged metrics on unseen holdout test data.
 */
function evaluateModelOnTestSet(
  model: { predict: (vector: Float64Array) => { category: Category } },
  vectorizer: TFIDFVectorizer,
  testSet: TrainingExample[],
  modelName: string,
  modelType: MLModelType
): ModelEvaluationSummary {
  const confusionMatrix: Record<Category, Record<Category, number>> = {} as any;
  const tp: Record<Category, number> = {} as any;
  const fp: Record<Category, number> = {} as any;
  const fn: Record<Category, number> = {} as any;
  const support: Record<Category, number> = {} as any;

  CATEGORIES.forEach((c1) => {
    confusionMatrix[c1] = {} as any;
    tp[c1] = 0;
    fp[c1] = 0;
    fn[c1] = 0;
    support[c1] = 0;
    CATEGORIES.forEach((c2) => {
      confusionMatrix[c1][c2] = 0;
    });
  });

  let totalCorrect = 0;

  for (const item of testSet) {
    const vec = vectorizer.transform(item.text);
    const pred = model.predict(vec).category;
    const actual = item.category;

    support[actual]++;
    confusionMatrix[actual][pred]++;

    if (pred === actual) {
      totalCorrect++;
      tp[actual]++;
    } else {
      fn[actual]++;
      fp[pred]++;
    }
  }

  const accuracy = testSet.length > 0 ? parseFloat((totalCorrect / testSet.length).toFixed(4)) : 0;

  const perClass: Record<Category, ClassEvaluationDetail> = {} as any;
  let sumPrecision = 0;
  let sumRecall = 0;
  let sumF1 = 0;

  CATEGORIES.forEach((cat) => {
    const p = tp[cat] + fp[cat] > 0 ? tp[cat] / (tp[cat] + fp[cat]) : 0;
    const r = support[cat] > 0 ? tp[cat] / support[cat] : 0;
    const f1 = p + r > 0 ? (2 * p * r) / (p + r) : 0;

    perClass[cat] = {
      precision: parseFloat(p.toFixed(4)),
      recall: parseFloat(r.toFixed(4)),
      f1: parseFloat(f1.toFixed(4)),
      support: support[cat],
      truePositives: tp[cat],
      falsePositives: fp[cat],
      falseNegatives: fn[cat],
    };

    sumPrecision += p;
    sumRecall += r;
    sumF1 += f1;
  });

  const macroPrecision = parseFloat((sumPrecision / CATEGORIES.length).toFixed(4));
  const macroRecall = parseFloat((sumRecall / CATEGORIES.length).toFixed(4));
  const macroF1 = parseFloat((sumF1 / CATEGORIES.length).toFixed(4));

  return {
    modelName,
    modelType,
    accuracy,
    macroPrecision,
    macroRecall,
    macroF1,
    perClass,
    confusionMatrix,
  };
}

class MLPipelineService {
  private vectorizer: TFIDFVectorizer = new TFIDFVectorizer();
  private nnModel: WideAndDeepNeuralNetwork = new WideAndDeepNeuralNetwork(0, 96, 48);
  private lrModel: MulticlassLogisticRegression = new MulticlassLogisticRegression();
  private metrics: ModelMetrics | null = null;
  private isInitialized: boolean = false;
  private activeAlgorithm: MLModelType = 'logistic_regression'; // Baseline by default or toggleable

  private customDataset: TrainingExample[] = [];

  constructor() {
    this.train();
  }

  public getActiveAlgorithm(): MLModelType {
    return this.activeAlgorithm;
  }

  public setActiveAlgorithm(algorithm: MLModelType): ModelMetrics {
    this.activeAlgorithm = algorithm;
    if (this.metrics) {
      this.metrics.activeAlgorithm = algorithm;
      this.metrics.activeEvaluation =
        algorithm === 'neural_network' ? this.metrics.nnMetrics : this.metrics.lrMetrics;
      this.metrics.validationAccuracy = this.metrics.activeEvaluation.accuracy;
      this.metrics.confusionMatrix = this.metrics.activeEvaluation.confusionMatrix;
      this.metrics.architecture.type =
        algorithm === 'neural_network'
          ? 'Wide & Deep Residual Neural Network (Wide & Deep ResNet)'
          : 'Multiclass Logistic Regression (Softmax Linear Classifier)';
      this.metrics.architecture.optimizer =
        algorithm === 'neural_network'
          ? 'AdamW (Cosine Annealing & Label Smoothing)'
          : 'Mini-batch Gradient Descent with Momentum & L2';
    }
    return this.getMetrics();
  }

  /**
   * Train and evaluate BOTH the Wide & Deep Residual Neural Network and
   * Multiclass Logistic Regression using the exact same stratified 80/20 train/test split.
   */
  public train(extraExamples: TrainingExample[] = []): ModelMetrics {
    if (extraExamples.length > 0) {
      this.customDataset = [...this.customDataset, ...extraExamples];
    }
    const dataset: TrainingExample[] = [...TRAINING_DATASET, ...this.customDataset];
    const classCategoryMap = new Map<Category, number>();
    CATEGORIES.forEach((cat, idx) => classCategoryMap.set(cat, idx));

    // 1. Group examples by category for stratified 80/20 split
    const groupedByCategory: Record<Category, TrainingExample[]> = {
      Food: [],
      Transport: [],
      Shopping: [],
      Bills: [],
      Entertainment: [],
      Healthcare: [],
      Education: [],
      Other: [],
    };

    dataset.forEach((ex) => {
      if (groupedByCategory[ex.category]) {
        groupedByCategory[ex.category].push(ex);
      }
    });

    const trainSet: TrainingExample[] = [];
    const testSet: TrainingExample[] = [];

    // Deterministic pseudo-random seed shuffle for reproducible evaluation
    Object.keys(groupedByCategory).forEach((catKey) => {
      const cat = catKey as Category;
      const list = [...groupedByCategory[cat]];
      for (let i = list.length - 1; i > 0; i--) {
        const j = (i * 31 + 17) % (i + 1);
        [list[i], list[j]] = [list[j], list[i]];
      }

      // 80% train, 20% test split
      const splitIdx = Math.floor(list.length * 0.8);
      trainSet.push(...list.slice(0, splitIdx));
      testSet.push(...list.slice(splitIdx));
    });

    // 2. Fit TF-IDF Vectorizer on full training corpus
    this.vectorizer = new TFIDFVectorizer();
    this.vectorizer.fit(dataset.map((e) => e.text));
    const inputDim = this.vectorizer.reverseVocabulary.length;

    const X_train = trainSet.map((e) => this.vectorizer.transform(e.text));
    const y_train = trainSet.map((e) => classCategoryMap.get(e.category)!);

    // 3. Train evaluation Neural Network on trainSet
    this.nnModel = new WideAndDeepNeuralNetwork(inputDim, 96, 48);
    const lossHistory = this.nnModel.fit(X_train, y_train, 24, 0.02, 16, 0.0001);

    // 4. Train evaluation Logistic Regression on trainSet
    this.lrModel = new MulticlassLogisticRegression();
    this.lrModel.fit(X_train, y_train, 50, 1.2, 0.0001, 32);

    // 5. Evaluate both models on holdout testSet (unseen 20% stratified test set)
    const lrMetrics = evaluateModelOnTestSet(
      this.lrModel,
      this.vectorizer,
      testSet,
      'TF-IDF + Logistic Regression (Baseline)',
      'logistic_regression'
    );

    const nnMetrics = evaluateModelOnTestSet(
      this.nnModel,
      this.vectorizer,
      testSet,
      'TF-IDF + Wide & Deep ResNet (Advanced)',
      'neural_network'
    );

    const activeEvaluation = this.activeAlgorithm === 'neural_network' ? nnMetrics : lrMetrics;

    const perCategoryAccuracy: Record<
      Category,
      { total: number; correct: number; accuracy: number }
    > = {} as any;

    CATEGORIES.forEach((cat) => {
      const cls = activeEvaluation.perClass[cat];
      perCategoryAccuracy[cat] = {
        total: cls.support,
        correct: cls.truePositives,
        accuracy: cls.recall,
      };
    });

    this.metrics = {
      totalExamples: dataset.length,
      trainCount: trainSet.length,
      testCount: testSet.length,
      vocabularySize: inputDim,
      validationAccuracy: activeEvaluation.accuracy,
      activeAlgorithm: this.activeAlgorithm,
      lrMetrics,
      nnMetrics,
      activeEvaluation,
      perCategoryAccuracy,
      confusionMatrix: activeEvaluation.confusionMatrix,
      iterations: 24,
      trainedAt: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      nnAccuracy: nnMetrics.accuracy,
      lrAccuracy: lrMetrics.accuracy,
      architecture: {
        type:
          this.activeAlgorithm === 'neural_network'
            ? 'Wide & Deep Residual Neural Network (Wide & Deep ResNet)'
            : 'Multiclass Logistic Regression (Softmax Linear Classifier)',
        inputDim,
        wideDim: inputDim,
        hiddenLayers: this.activeAlgorithm === 'neural_network' ? [96, 48] : [],
        outputDim: CATEGORIES.length,
        optimizer:
          this.activeAlgorithm === 'neural_network'
            ? 'AdamW (Cosine Annealing & Label Smoothing)'
            : 'Mini-batch Gradient Descent with Momentum & L2',
      },
      totalParameters: this.nnModel.getTotalParameters(),
      lossHistory,
    };

    this.isInitialized = true;
    return this.metrics;
  }

  /**
   * Predict category for an expense description using active ML model
   */
  public predict(description: string): MLPredictionResult {
    if (!this.isInitialized) {
      this.train();
    }

    const preprocessed = preprocessText(description);
    const vector = this.vectorizer.transform(description);
    const topFeatures = this.vectorizer.getTopFeatures(description, 6);

    if (this.activeAlgorithm === 'logistic_regression') {
      const lrPred = this.lrModel.predict(vector);
      return {
        category: lrPred.category,
        confidence: lrPred.confidence,
        classProbabilities: lrPred.classProbabilities,
        preprocessed,
        topFeatures,
      };
    }

    // Neural Network
    const nnPred = this.nnModel.predict(vector);
    return {
      category: nnPred.category,
      confidence: nnPred.confidence,
      classProbabilities: nnPred.classProbabilities,
      preprocessed,
      topFeatures,
      layerActivations: nnPred.layerActivations,
    };
  }

  public getMetrics(): ModelMetrics {
    if (!this.metrics) {
      this.train();
    }
    return this.metrics!;
  }

  public getVocabulary(): string[] {
    return this.vectorizer.reverseVocabulary;
  }

  public addCustomExample(text: string, category: Category): ModelMetrics {
    const trimmed = text.trim();
    if (trimmed && CATEGORIES.includes(category)) {
      this.customDataset.push({ text: trimmed, category });
      return this.train();
    }
    return this.getMetrics();
  }

  public getCustomDataset(): TrainingExample[] {
    return this.customDataset;
  }
}

export const mlPipeline = new MLPipelineService();
