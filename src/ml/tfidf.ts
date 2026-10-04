import { PreprocessedResult, TFIDFFeature } from './types';
import { preprocessText, stemWord } from './textPreprocessing';

export class TFIDFVectorizer {
  vocabulary: Map<string, number> = new Map();
  reverseVocabulary: string[] = [];
  idfValues: Float64Array = new Float64Array(0);
  docCount: number = 0;

  /**
   * Fit the vectorizer on a corpus of text documents.
   */
  fit(documents: string[]): void {
    this.docCount = documents.length;
    const termDocFreq: Map<string, number> = new Map();

    // 1. Tokenize and count document frequencies
    for (const doc of documents) {
      const { tokens } = preprocessText(doc);
      const uniqueTerms = new Set<string>();

      // Unigrams (surface + stemmed)
      for (const token of tokens) {
        uniqueTerms.add(token);
        const stem = stemWord(token);
        if (stem !== token) {
          uniqueTerms.add(stem);
        }
      }

      // Bigrams (for phrases like "fastag recharge", "movie ticket", "electricity bill", "uber ride")
      for (let i = 0; i < tokens.length - 1; i++) {
        uniqueTerms.add(`${tokens[i]}_${tokens[i + 1]}`);
        const stem1 = stemWord(tokens[i]);
        const stem2 = stemWord(tokens[i + 1]);
        if (stem1 !== tokens[i] || stem2 !== tokens[i + 1]) {
          uniqueTerms.add(`${stem1}_${stem2}`);
        }
      }

      for (const term of uniqueTerms) {
        termDocFreq.set(term, (termDocFreq.get(term) || 0) + 1);
      }
    }

    // 2. Build vocabulary (all extracted terms sorted alphabetically)
    this.vocabulary.clear();
    this.reverseVocabulary = [];

    const sortedTerms = Array.from(termDocFreq.keys()).sort();
    sortedTerms.forEach((term, index) => {
      this.vocabulary.set(term, index);
      this.reverseVocabulary.push(term);
    });

    const vocabSize = this.reverseVocabulary.length;
    this.idfValues = new Float64Array(vocabSize);

    // 3. Compute smooth IDF: idf(t) = ln((1 + N) / (1 + df(t))) + 1.0
    for (let i = 0; i < vocabSize; i++) {
      const term = this.reverseVocabulary[i];
      const df = termDocFreq.get(term) || 1;
      this.idfValues[i] = Math.log((1 + this.docCount) / (1 + df)) + 1.0;
    }
  }

  /**
   * Transform a document string into an L2-normalized Sublinear TF-IDF vector.
   * sublinear tf: tf = 1 + ln(count) for count > 0
   */
  transform(text: string): Float64Array {
    const vocabSize = this.reverseVocabulary.length;
    const vector = new Float64Array(vocabSize);
    if (vocabSize === 0) return vector;

    const { tokens } = preprocessText(text);
    if (tokens.length === 0) return vector;

    // Count term frequencies in this document
    const termCounts: Map<number, number> = new Map();

    // 1. Unigrams
    for (const token of tokens) {
      const termIdx = this.vocabulary.get(token);
      if (termIdx !== undefined) {
        termCounts.set(termIdx, (termCounts.get(termIdx) || 0) + 1);
      }
      const stem = stemWord(token);
      if (stem !== token) {
        const stemIdx = this.vocabulary.get(stem);
        if (stemIdx !== undefined) {
          termCounts.set(stemIdx, (termCounts.get(stemIdx) || 0) + 1);
        }
      }
    }

    // 2. Bigrams
    for (let i = 0; i < tokens.length - 1; i++) {
      const bigram = `${tokens[i]}_${tokens[i + 1]}`;
      const termIdx = this.vocabulary.get(bigram);
      if (termIdx !== undefined) {
        termCounts.set(termIdx, (termCounts.get(termIdx) || 0) + 1.5);
      }
      const stemBigram = `${stemWord(tokens[i])}_${stemWord(tokens[i + 1])}`;
      if (stemBigram !== bigram) {
        const sIdx = this.vocabulary.get(stemBigram);
        if (sIdx !== undefined) {
          termCounts.set(sIdx, (termCounts.get(sIdx) || 0) + 1.5);
        }
      }
    }

    // 3. Fallback for substring/partial prefix match if no exact match
    if (termCounts.size === 0) {
      for (const token of tokens) {
        const stem = stemWord(token);
        for (const [term, idx] of this.vocabulary.entries()) {
          if (term.includes(stem) || (stem.length > 3 && term.startsWith(stem.slice(0, 4)))) {
            termCounts.set(idx, 0.7);
            break;
          }
        }
      }
    }

    if (termCounts.size === 0) {
      return vector;
    }

    // Compute Sublinear TF * IDF: (1 + ln(count)) * IDF
    let sumSquares = 0;
    for (const [termIdx, count] of termCounts.entries()) {
      const sublinearTf = 1 + Math.log(count);
      const idf = this.idfValues[termIdx];
      const val = sublinearTf * idf;
      vector[termIdx] = val;
      sumSquares += val * val;
    }

    // L2 Cosine Normalization
    if (sumSquares > 0) {
      const norm = Math.sqrt(sumSquares);
      for (let i = 0; i < vocabSize; i++) {
        if (vector[i] > 0) {
          vector[i] /= norm;
        }
      }
    }

    return vector;
  }

  /**
   * Extract top non-zero TF-IDF features with their term names and scores for display.
   */
  getTopFeatures(text: string, limit = 8): TFIDFFeature[] {
    const vector = this.transform(text);
    const features: TFIDFFeature[] = [];

    for (let i = 0; i < vector.length; i++) {
      if (vector[i] > 0) {
        features.push({
          term: this.reverseVocabulary[i].replace(/_/g, ' '),
          tfidf: parseFloat(vector[i].toFixed(4))
        });
      }
    }

    // Deduplicate near-identical stemmed representations for clean UI
    const seen = new Set<string>();
    const filtered: TFIDFFeature[] = [];
    features.sort((a, b) => b.tfidf - a.tfidf);

    for (const f of features) {
      if (!seen.has(f.term)) {
        seen.add(f.term);
        filtered.push(f);
      }
      if (filtered.length >= limit) break;
    }

    return filtered;
  }
}
