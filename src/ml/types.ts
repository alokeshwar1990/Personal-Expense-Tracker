import { Category } from '../types/expense';

export interface TrainingExample {
  text: string;
  category: Category;
}

export interface PreprocessedResult {
  raw: string;
  cleaned: string;
  tokens: string[];
  removedStopwords: string[];
}

export interface TFIDFFeature {
  term: string;
  tfidf: number;
}

export interface ClassProbability {
  category: Category;
  probability: number;
}

export interface LayerActivationSummary {
  inputDim: number;
  wideChannels: number;
  hidden1Dim: number;
  hidden1ActiveCount: number;
  hidden1TopNeurons: { index: number; activation: number }[];
  hidden2Dim: number;
  hidden2ActiveCount: number;
  hidden2TopNeurons: { index: number; activation: number }[];
  outputDim: number;
}

export interface MLPredictionResult {
  category: Category;
  confidence: number;
  classProbabilities: ClassProbability[];
  preprocessed: PreprocessedResult;
  topFeatures: TFIDFFeature[];
  layerActivations?: LayerActivationSummary;
}

export interface TrainingEpochMetric {
  epoch: number;
  loss: number;
  accuracy: number;
}

export type MLModelType = 'neural_network' | 'logistic_regression';

export interface ClassEvaluationDetail {
  precision: number;
  recall: number;
  f1: number;
  support: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
}

export interface ModelEvaluationSummary {
  modelName: string;
  modelType: MLModelType;
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  perClass: Record<Category, ClassEvaluationDetail>;
  confusionMatrix: Record<Category, Record<Category, number>>;
}

export interface ModelMetrics {
  totalExamples: number;
  trainCount: number;
  testCount: number;
  vocabularySize: number;
  validationAccuracy: number; // calculated on holdout test set for active model
  activeAlgorithm: MLModelType;
  lrMetrics: ModelEvaluationSummary;
  nnMetrics: ModelEvaluationSummary;
  activeEvaluation: ModelEvaluationSummary;
  perCategoryAccuracy: Record<Category, { total: number; correct: number; accuracy: number }>;
  confusionMatrix: Record<Category, Record<Category, number>>;
  iterations: number;
  trainedAt: string;
  lrAccuracy: number;
  nnAccuracy: number;
  architecture: {
    type: string;
    inputDim: number;
    wideDim: number;
    hiddenLayers: number[];
    outputDim: number;
    optimizer: string;
  };
  totalParameters: number;
  lossHistory: TrainingEpochMetric[];
}
