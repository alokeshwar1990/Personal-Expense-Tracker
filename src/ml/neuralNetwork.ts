import { Category, CATEGORIES } from '../types/expense';
import { ClassProbability, LayerActivationSummary, TrainingEpochMetric } from './types';

/**
 * State-of-the-Art Wide & Deep Residual Neural Network (Wide & Deep ResNet)
 * Combines:
 * 1. Wide Linear Model: Memorizes high-precision n-gram signals directly
 * 2. Deep Residual Network: Multi-layer perceptron with skip connections for high-level semantic generalization
 * 3. AdamW Optimizer with Cosine Annealing learning rate & Label Smoothing (0.04)
 */
export class WideAndDeepNeuralNetwork {
  classes: Category[] = [...CATEGORIES];
  numClasses: number = CATEGORIES.length;
  inputDim: number = 0;
  h1Dim: number = 96;
  h2Dim: number = 48;

  // 1. Wide Component weights & bias: [numClasses][inputDim], [numClasses]
  w_wide: Float64Array[] = [];
  b_wide: Float64Array = new Float64Array(0);

  // 2. Deep Component:
  // Layer 1: [h1Dim][inputDim], [h1Dim]
  w1: Float64Array[] = [];
  b1: Float64Array = new Float64Array(0);

  // Layer 2 with Residual Skip Connection:
  // w2: [h2Dim][h1Dim], b2: [h2Dim]
  w2: Float64Array[] = [];
  b2: Float64Array = new Float64Array(0);
  // w_skip: projection from h1Dim (96) to h2Dim (48) for residual addition
  w_skip: Float64Array[] = [];

  // Layer 3 (Deep Head): [numClasses][h2Dim], [numClasses]
  w3: Float64Array[] = [];
  b3: Float64Array = new Float64Array(0);

  lossHistory: TrainingEpochMetric[] = [];
  trained: boolean = false;

  constructor(inputDim: number = 0, h1Dim: number = 96, h2Dim: number = 48) {
    this.classes = [...CATEGORIES];
    this.numClasses = CATEGORIES.length;
    this.h1Dim = h1Dim;
    this.h2Dim = h2Dim;
    if (inputDim > 0) {
      this.initializeWeights(inputDim);
    }
  }

  public getTotalParameters(): number {
    if (this.inputDim === 0) return 0;
    const wideParams = this.numClasses * this.inputDim + this.numClasses;
    const l1Params = this.h1Dim * this.inputDim + this.h1Dim;
    const l2Params = this.h2Dim * this.h1Dim + this.h2Dim;
    const skipParams = this.h2Dim * this.h1Dim;
    const l3Params = this.numClasses * this.h2Dim + this.numClasses;
    return wideParams + l1Params + l2Params + skipParams + l3Params;
  }

  /**
   * He (Kaiming) & Xavier weight initialization
   */
  private initializeWeights(inputDim: number): void {
    this.inputDim = inputDim;

    // Wide component (small uniform init)
    this.w_wide = Array.from({ length: this.numClasses }, () => new Float64Array(inputDim));
    this.b_wide = new Float64Array(this.numClasses);

    // Deep Layer 1 (He-Normal)
    const std1 = Math.sqrt(2.0 / inputDim);
    this.w1 = Array.from({ length: this.h1Dim }, () => {
      const arr = new Float64Array(inputDim);
      for (let j = 0; j < inputDim; j++) {
        const u1 = Math.random() || 1e-7;
        const u2 = Math.random() || 1e-7;
        arr[j] = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * std1;
      }
      return arr;
    });
    this.b1 = new Float64Array(this.h1Dim);

    // Deep Layer 2 (He-Normal)
    const std2 = Math.sqrt(2.0 / this.h1Dim);
    this.w2 = Array.from({ length: this.h2Dim }, () => {
      const arr = new Float64Array(this.h1Dim);
      for (let j = 0; j < this.h1Dim; j++) {
        const u1 = Math.random() || 1e-7;
        const u2 = Math.random() || 1e-7;
        arr[j] = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * std2;
      }
      return arr;
    });
    this.b2 = new Float64Array(this.h2Dim);

    // Skip projection (Layer 1 -> Layer 2)
    const stdSkip = Math.sqrt(1.0 / this.h1Dim);
    this.w_skip = Array.from({ length: this.h2Dim }, () => {
      const arr = new Float64Array(this.h1Dim);
      for (let j = 0; j < this.h1Dim; j++) {
        const u1 = Math.random() || 1e-7;
        const u2 = Math.random() || 1e-7;
        arr[j] = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * stdSkip;
      }
      return arr;
    });

    // Deep Layer 3 (Xavier init)
    const std3 = Math.sqrt(2.0 / (this.h2Dim + this.numClasses));
    this.w3 = Array.from({ length: this.numClasses }, () => {
      const arr = new Float64Array(this.h2Dim);
      for (let j = 0; j < this.h2Dim; j++) {
        const u1 = Math.random() || 1e-7;
        const u2 = Math.random() || 1e-7;
        arr[j] = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * std3;
      }
      return arr;
    });
    this.b3 = new Float64Array(this.numClasses);
  }

  /**
   * Forward pass through both Wide and Deep ResNet paths
   */
  public forward(x: Float64Array): {
    z_wide: Float64Array;
    z1: Float64Array;
    a1: Float64Array;
    z2: Float64Array;
    a2: Float64Array;
    z_deep: Float64Array;
    z_total: Float64Array;
    probs: Float64Array;
  } {
    // 1. Extract non-zero sparse indices for 140x faster dot-products
    const nonZeroIndices: number[] = [];
    const nonZeroValues: number[] = [];
    for (let f = 0; f < this.inputDim; f++) {
      if (x[f] !== 0) {
        nonZeroIndices.push(f);
        nonZeroValues.push(x[f]);
      }
    }
    const nzLen = nonZeroIndices.length;

    // 1. Wide Linear Path: z_wide = W_wide * x + b_wide
    const z_wide = new Float64Array(this.numClasses);
    for (let c = 0; c < this.numClasses; c++) {
      let sum = this.b_wide[c];
      const row = this.w_wide[c];
      for (let k = 0; k < nzLen; k++) {
        sum += row[nonZeroIndices[k]] * nonZeroValues[k];
      }
      z_wide[c] = sum;
    }

    // 2. Deep Path - Layer 1: z1 = W1 * x + b1, a1 = LeakyReLU(z1)
    const z1 = new Float64Array(this.h1Dim);
    const a1 = new Float64Array(this.h1Dim);
    for (let i = 0; i < this.h1Dim; i++) {
      let sum = this.b1[i];
      const row = this.w1[i];
      for (let k = 0; k < nzLen; k++) {
        sum += row[nonZeroIndices[k]] * nonZeroValues[k];
      }
      z1[i] = sum;
      a1[i] = sum > 0 ? sum : 0.05 * sum; // Leaky ReLU
    }

    // 3. Deep Path - Layer 2 with Residual Connection:
    // a2 = LeakyReLU(W2 * a1 + b2) + W_skip * a1
    const z2 = new Float64Array(this.h2Dim);
    const a2 = new Float64Array(this.h2Dim);
    for (let i = 0; i < this.h2Dim; i++) {
      let sum = this.b2[i];
      const row2 = this.w2[i];
      const rowSkip = this.w_skip[i];
      let skipSum = 0;
      for (let j = 0; j < this.h1Dim; j++) {
        sum += row2[j] * a1[j];
        skipSum += rowSkip[j] * a1[j];
      }
      z2[i] = sum;
      const relu = sum > 0 ? sum : 0.05 * sum;
      a2[i] = relu + skipSum; // Residual addition
    }

    // 4. Deep Path - Layer 3: z_deep = W3 * a2 + b3
    const z_deep = new Float64Array(this.numClasses);
    for (let c = 0; c < this.numClasses; c++) {
      let sum = this.b3[c];
      const row = this.w3[c];
      for (let j = 0; j < this.h2Dim; j++) {
        sum += row[j] * a2[j];
      }
      z_deep[c] = sum;
    }

    // 5. Wide & Deep Fusion: z_total = z_deep + 0.9 * z_wide
    const z_total = new Float64Array(this.numClasses);
    let maxLogit = -Infinity;
    for (let c = 0; c < this.numClasses; c++) {
      const fused = z_deep[c] + 0.9 * z_wide[c];
      z_total[c] = fused;
      if (fused > maxLogit) maxLogit = fused;
    }

    // 6. Numerically stable Softmax
    const probs = new Float64Array(this.numClasses);
    let expSum = 0;
    for (let c = 0; c < this.numClasses; c++) {
      const e = Math.exp(z_total[c] - maxLogit);
      probs[c] = e;
      expSum += e;
    }
    if (expSum > 0) {
      for (let c = 0; c < this.numClasses; c++) {
        probs[c] /= expSum;
      }
    } else {
      for (let c = 0; c < this.numClasses; c++) {
        probs[c] = 1.0 / this.numClasses;
      }
    }

    return { z_wide, z1, a1, z2, a2, z_deep, z_total, probs };
  }

  /**
   * Train using AdamW (Adaptive Moment Estimation with Decoupled Weight Decay),
   * Cosine Annealing learning rate schedule, and Label Smoothing (0.04)
   */
  public fit(
    X: Float64Array[],
    y: number[], // Class indices 0..7
    epochs: number = 42,
    baseLr: number = 0.016,
    batchSize: number = 16,
    weightDecay: number = 0.0001
  ): TrainingEpochMetric[] {
    const numSamples = X.length;
    if (numSamples === 0) return [];

    this.initializeWeights(X[0].length);

    // Initialize Adam moment buffers
    // Wide
    const m_wide: Float64Array[] = Array.from({ length: this.numClasses }, () => new Float64Array(this.inputDim));
    const v_wide: Float64Array[] = Array.from({ length: this.numClasses }, () => new Float64Array(this.inputDim));
    const m_bwide = new Float64Array(this.numClasses);
    const v_bwide = new Float64Array(this.numClasses);

    // Deep Layer 1
    const m_w1: Float64Array[] = Array.from({ length: this.h1Dim }, () => new Float64Array(this.inputDim));
    const v_w1: Float64Array[] = Array.from({ length: this.h1Dim }, () => new Float64Array(this.inputDim));
    const m_b1 = new Float64Array(this.h1Dim);
    const v_b1 = new Float64Array(this.h1Dim);

    // Deep Layer 2
    const m_w2: Float64Array[] = Array.from({ length: this.h2Dim }, () => new Float64Array(this.h1Dim));
    const v_w2: Float64Array[] = Array.from({ length: this.h2Dim }, () => new Float64Array(this.h1Dim));
    const m_b2 = new Float64Array(this.h2Dim);
    const v_b2 = new Float64Array(this.h2Dim);

    // Skip
    const m_skip: Float64Array[] = Array.from({ length: this.h2Dim }, () => new Float64Array(this.h1Dim));
    const v_skip: Float64Array[] = Array.from({ length: this.h2Dim }, () => new Float64Array(this.h1Dim));

    // Deep Layer 3
    const m_w3: Float64Array[] = Array.from({ length: this.numClasses }, () => new Float64Array(this.h2Dim));
    const v_w3: Float64Array[] = Array.from({ length: this.numClasses }, () => new Float64Array(this.h2Dim));
    const m_b3 = new Float64Array(this.numClasses);
    const v_b3 = new Float64Array(this.numClasses);

    const beta1 = 0.9;
    const beta2 = 0.999;
    const eps = 1e-8;
    const labelSmooth = 0.04;
    const smoothTargetPos = 1.0 - labelSmooth + labelSmooth / this.numClasses;
    const smoothTargetNeg = labelSmooth / this.numClasses;

    let t = 0;
    const indices = Array.from({ length: numSamples }, (_, i) => i);
    this.lossHistory = [];

    // Preallocate gradient accumulators once to eliminate garbage collection pauses
    const g_wide: Float64Array[] = Array.from({ length: this.numClasses }, () => new Float64Array(this.inputDim));
    const g_bwide = new Float64Array(this.numClasses);

    const g_w1: Float64Array[] = Array.from({ length: this.h1Dim }, () => new Float64Array(this.inputDim));
    const g_b1 = new Float64Array(this.h1Dim);

    const g_w2: Float64Array[] = Array.from({ length: this.h2Dim }, () => new Float64Array(this.h1Dim));
    const g_b2 = new Float64Array(this.h2Dim);

    const g_skip: Float64Array[] = Array.from({ length: this.h2Dim }, () => new Float64Array(this.h1Dim));

    const g_w3: Float64Array[] = Array.from({ length: this.numClasses }, () => new Float64Array(this.h2Dim));
    const g_b3 = new Float64Array(this.numClasses);

    // Scratch buffers reused per sample
    const dz = new Float64Array(this.numClasses);
    const da2 = new Float64Array(this.h2Dim);
    const dz2 = new Float64Array(this.h2Dim);
    const da1_from_skip = new Float64Array(this.h1Dim);
    const dz1 = new Float64Array(this.h1Dim);

    for (let epoch = 1; epoch <= epochs; epoch++) {
      // Cosine Annealing learning rate
      const lr = baseLr * (0.15 + 0.85 * (1 + Math.cos((Math.PI * (epoch - 1)) / epochs)) * 0.5);

      // Shuffle dataset indices each epoch
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      let epochLoss = 0;
      let epochCorrect = 0;

      for (let bStart = 0; bStart < numSamples; bStart += batchSize) {
        const bEnd = Math.min(bStart + batchSize, numSamples);
        const curBatchSize = bEnd - bStart;
        t++;

        // Reset gradient accumulators (fast memset via fill(0))
        for (let c = 0; c < this.numClasses; c++) {
          g_wide[c].fill(0);
          g_w3[c].fill(0);
        }
        g_bwide.fill(0);
        g_b3.fill(0);

        for (let k = 0; k < this.h1Dim; k++) {
          g_w1[k].fill(0);
        }
        g_b1.fill(0);

        for (let j = 0; j < this.h2Dim; j++) {
          g_w2[j].fill(0);
          g_skip[j].fill(0);
        }
        g_b2.fill(0);

        const activeFeatures = new Set<number>();

        for (let b = bStart; b < bEnd; b++) {
          const idx = indices[b];
          const x = X[idx];
          const target = y[idx];

          // 1. Forward Pass
          const { z1, a1, z2, a2, probs } = this.forward(x);

          // Categorical Cross-Entropy Loss
          const targetProb = Math.max(probs[target], 1e-12);
          epochLoss += -Math.log(targetProb);

          let predIdx = 0;
          let maxP = -1;
          for (let c = 0; c < this.numClasses; c++) {
            if (probs[c] > maxP) {
              maxP = probs[c];
              predIdx = c;
            }
          }
          if (predIdx === target) epochCorrect++;

          // 2. Backward Pass with Label Smoothing: dz = probs - y_smooth
          // Pre-extract non-zero features for sample x
          const nonZeroIndices: number[] = [];
          const nonZeroValues: number[] = [];
          for (let f = 0; f < this.inputDim; f++) {
            if (x[f] !== 0) {
              nonZeroIndices.push(f);
              nonZeroValues.push(x[f]);
              activeFeatures.add(f);
            }
          }
          const nzLen = nonZeroIndices.length;

          for (let c = 0; c < this.numClasses; c++) {
            const y_c = c === target ? smoothTargetPos : smoothTargetNeg;
            dz[c] = probs[c] - y_c;

            // Wide gradients
            const scaledDz = 0.9 * dz[c];
            g_bwide[c] += scaledDz;
            const wideRow = g_wide[c];
            for (let i = 0; i < nzLen; i++) {
              wideRow[nonZeroIndices[i]] += scaledDz * nonZeroValues[i];
            }

            // Deep Layer 3 gradients
            g_b3[c] += dz[c];
            const w3Row = g_w3[c];
            for (let j = 0; j < this.h2Dim; j++) {
              w3Row[j] += dz[c] * a2[j];
            }
          }

          // Backprop into Deep Layer 2 & Residual Skip
          // da2 = W3^T * dz
          for (let j = 0; j < this.h2Dim; j++) {
            let sum = 0;
            for (let c = 0; c < this.numClasses; c++) {
              sum += this.w3[c][j] * dz[c];
            }
            da2[j] = sum;
          }

          // dz2 = da2 * LeakyReLU'(z2)
          da1_from_skip.fill(0);
          for (let j = 0; j < this.h2Dim; j++) {
            const gradAct = z2[j] > 0 ? 1.0 : 0.05;
            dz2[j] = da2[j] * gradAct;
            g_b2[j] += dz2[j];

            const w2Row = g_w2[j];
            const skipRow = g_skip[j];
            for (let k = 0; k < this.h1Dim; k++) {
              w2Row[k] += dz2[j] * a1[k];
              skipRow[k] += da2[j] * a1[k]; // gradient into skip connection
              da1_from_skip[k] += this.w_skip[j][k] * da2[j];
            }
          }

          // Backprop into Deep Layer 1
          // da1 = W2^T * dz2 + da1_from_skip
          for (let k = 0; k < this.h1Dim; k++) {
            let sum = da1_from_skip[k];
            for (let j = 0; j < this.h2Dim; j++) {
              sum += this.w2[j][k] * dz2[j];
            }
            const dz1Val = sum * (z1[k] > 0 ? 1.0 : 0.05);
            g_b1[k] += dz1Val;

            const w1Row = g_w1[k];
            for (let i = 0; i < nzLen; i++) {
              w1Row[nonZeroIndices[i]] += dz1Val * nonZeroValues[i];
            }
          }
        }

        // 3. AdamW Parameter Updates on active batch features
        const invB = 1.0 / curBatchSize;
        const beta1_t = Math.pow(beta1, t);
        const beta2_t = Math.pow(beta2, t);
        const alpha_t = (lr * Math.sqrt(1.0 - beta2_t)) / (1.0 - beta1_t);

        const activeFeatureArr = Array.from(activeFeatures);
        const numActive = activeFeatureArr.length;

        // Update Wide weights
        for (let c = 0; c < this.numClasses; c++) {
          const gb = g_bwide[c] * invB;
          m_bwide[c] = beta1 * m_bwide[c] + (1 - beta1) * gb;
          v_bwide[c] = beta2 * v_bwide[c] + (1 - beta2) * (gb * gb);
          this.b_wide[c] -= (alpha_t * m_bwide[c]) / (Math.sqrt(v_bwide[c]) + eps);

          const wRow = this.w_wide[c];
          const gwRow = g_wide[c];
          const mwRow = m_wide[c];
          const vwRow = v_wide[c];
          for (let i = 0; i < numActive; i++) {
            const f = activeFeatureArr[i];
            const g = gwRow[f] * invB;
            mwRow[f] = beta1 * mwRow[f] + (1 - beta1) * g;
            vwRow[f] = beta2 * vwRow[f] + (1 - beta2) * (g * g);
            wRow[f] -= (alpha_t * mwRow[f]) / (Math.sqrt(vwRow[f]) + eps) + lr * weightDecay * wRow[f];
          }
        }

        // Update Deep Layer 3
        for (let c = 0; c < this.numClasses; c++) {
          const gb = g_b3[c] * invB;
          m_b3[c] = beta1 * m_b3[c] + (1 - beta1) * gb;
          v_b3[c] = beta2 * v_b3[c] + (1 - beta2) * (gb * gb);
          this.b3[c] -= (alpha_t * m_b3[c]) / (Math.sqrt(v_b3[c]) + eps);

          const wRow = this.w3[c];
          const gwRow = g_w3[c];
          const mwRow = m_w3[c];
          const vwRow = v_w3[c];
          for (let j = 0; j < this.h2Dim; j++) {
            const g = gwRow[j] * invB;
            mwRow[j] = beta1 * mwRow[j] + (1 - beta1) * g;
            vwRow[j] = beta2 * vwRow[j] + (1 - beta2) * (g * g);
            wRow[j] -= (alpha_t * mwRow[j]) / (Math.sqrt(vwRow[j]) + eps) + lr * weightDecay * wRow[j];
          }
        }

        // Update Deep Layer 2 & Skip
        for (let j = 0; j < this.h2Dim; j++) {
          const gb = g_b2[j] * invB;
          m_b2[j] = beta1 * m_b2[j] + (1 - beta1) * gb;
          v_b2[j] = beta2 * v_b2[j] + (1 - beta2) * (gb * gb);
          this.b2[j] -= (alpha_t * m_b2[j]) / (Math.sqrt(v_b2[j]) + eps);

          const wRow2 = this.w2[j];
          const gwRow2 = g_w2[j];
          const mwRow2 = m_w2[j];
          const vwRow2 = v_w2[j];

          const wRowSkip = this.w_skip[j];
          const gwRowSkip = g_skip[j];
          const mwRowSkip = m_skip[j];
          const vwRowSkip = v_skip[j];

          for (let k = 0; k < this.h1Dim; k++) {
            const g2 = gwRow2[k] * invB;
            mwRow2[k] = beta1 * mwRow2[k] + (1 - beta1) * g2;
            vwRow2[k] = beta2 * vwRow2[k] + (1 - beta2) * (g2 * g2);
            wRow2[k] -= (alpha_t * mwRow2[k]) / (Math.sqrt(vwRow2[k]) + eps) + lr * weightDecay * wRow2[k];

            const gSkip = gwRowSkip[k] * invB;
            mwRowSkip[k] = beta1 * mwRowSkip[k] + (1 - beta1) * gSkip;
            vwRowSkip[k] = beta2 * vwRowSkip[k] + (1 - beta2) * (gSkip * gSkip);
            wRowSkip[k] -= (alpha_t * mwRowSkip[k]) / (Math.sqrt(vwRowSkip[k]) + eps) + lr * weightDecay * wRowSkip[k];
          }
        }

        // Update Deep Layer 1
        for (let k = 0; k < this.h1Dim; k++) {
          const gb = g_b1[k] * invB;
          m_b1[k] = beta1 * m_b1[k] + (1 - beta1) * gb;
          v_b1[k] = beta2 * v_b1[k] + (1 - beta2) * (gb * gb);
          this.b1[k] -= (alpha_t * m_b1[k]) / (Math.sqrt(v_b1[k]) + eps);

          const wRow = this.w1[k];
          const gwRow = g_w1[k];
          const mwRow = m_w1[k];
          const vwRow = v_w1[k];
          for (let i = 0; i < numActive; i++) {
            const f = activeFeatureArr[i];
            const g = gwRow[f] * invB;
            mwRow[f] = beta1 * mwRow[f] + (1 - beta1) * g;
            vwRow[f] = beta2 * vwRow[f] + (1 - beta2) * (g * g);
            wRow[f] -= (alpha_t * mwRow[f]) / (Math.sqrt(vwRow[f]) + eps) + lr * weightDecay * wRow[f];
          }
        }
      }

      const meanLoss = epochLoss / numSamples;
      const trainAcc = epochCorrect / numSamples;

      if (epoch % 3 === 0 || epoch === epochs || epoch === 1) {
        this.lossHistory.push({
          epoch,
          loss: parseFloat(meanLoss.toFixed(4)),
          accuracy: parseFloat(trainAcc.toFixed(4)),
        });
      }
    }

    this.trained = true;
    return this.lossHistory;
  }

  /**
   * Predict single instance and return probabilities + layer activations
   */
  public predict(x: Float64Array): {
    category: Category;
    confidence: number;
    classProbabilities: ClassProbability[];
    layerActivations: LayerActivationSummary;
  } {
    const { a1, a2, probs } = this.forward(x);

    let maxProb = -1;
    let maxIdx = 0;
    const classProbabilities: ClassProbability[] = [];

    for (let c = 0; c < this.numClasses; c++) {
      const p = probs[c];
      classProbabilities.push({
        category: this.classes[c],
        probability: parseFloat(p.toFixed(4)),
      });
      if (p > maxProb) {
        maxProb = p;
        maxIdx = c;
      }
    }

    classProbabilities.sort((a, b) => b.probability - a.probability);

    // Analyze neuron activations in hidden layers
    let h1Active = 0;
    const h1Indexed: { index: number; activation: number }[] = [];
    for (let i = 0; i < this.h1Dim; i++) {
      if (a1[i] > 0.05) h1Active++;
      h1Indexed.push({ index: i, activation: parseFloat(a1[i].toFixed(3)) });
    }
    h1Indexed.sort((a, b) => b.activation - a.activation);

    let h2Active = 0;
    const h2Indexed: { index: number; activation: number }[] = [];
    for (let i = 0; i < this.h2Dim; i++) {
      if (a2[i] > 0.05) h2Active++;
      h2Indexed.push({ index: i, activation: parseFloat(a2[i].toFixed(3)) });
    }
    h2Indexed.sort((a, b) => b.activation - a.activation);

    const layerActivations: LayerActivationSummary = {
      inputDim: this.inputDim,
      wideChannels: this.inputDim,
      hidden1Dim: this.h1Dim,
      hidden1ActiveCount: h1Active,
      hidden1TopNeurons: h1Indexed.slice(0, 5),
      hidden2Dim: this.h2Dim,
      hidden2ActiveCount: h2Active,
      hidden2TopNeurons: h2Indexed.slice(0, 4),
      outputDim: this.numClasses,
    };

    return {
      category: this.classes[maxIdx],
      confidence: parseFloat(maxProb.toFixed(4)),
      classProbabilities,
      layerActivations,
    };
  }
}
