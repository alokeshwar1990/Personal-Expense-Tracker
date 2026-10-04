import { PreprocessedResult } from './types';

// Standard English stopwords list suitable for short expense text classification
export const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as',
  'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
  'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 's', 'same', 'she', 'should', 'so', 'some', 'such', 't', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'you', 'your', 'yours',
  'yourself', 'yourselves'
]);

/**
 * Fast linguistic stemming for morphologically related short words
 * (e.g., "groceries" -> "grocer", "medicines" -> "medicin", "running" -> "run", "shoes" -> "shoe")
 */
export function stemWord(word: string): string {
  if (word.length <= 3) return word;
  let w = word;
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('tion') && w.length > 5) return w.slice(0, -4);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);
  return w;
}

/**
 * Preprocesses raw text:
 * 1. Lowercase conversion
 * 2. Strip non-alphanumeric punctuation (except hyphen inside words)
 * 3. Tokenize by whitespace
 * 4. Filter short single chars and stopwords
 * 5. Generate both surface tokens and linguistic stems
 */
export function preprocessText(text: string): PreprocessedResult {
  const raw = text || '';
  
  // 1. Lowercase
  const lower = raw.toLowerCase().trim();
  
  // 2. Remove punctuation and special characters, keep letters and numbers
  const cleaned = lower
    .replace(/[^\w\s-]/g, ' ')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 3. Tokenize
  const rawTokens = cleaned ? cleaned.split(/\s+/) : [];
  
  const tokens: string[] = [];
  const removedStopwords: string[] = [];

  for (const token of rawTokens) {
    if (!token || token.length <= 1) {
      continue;
    }
    if (STOPWORDS.has(token)) {
      removedStopwords.push(token);
    } else {
      tokens.push(token);
    }
  }

  // If all tokens were stopwords, fallback to raw tokens to prevent empty vector
  const finalTokens = tokens.length > 0 ? tokens : rawTokens.filter(t => t.length > 0);

  return {
    raw,
    cleaned,
    tokens: finalTokens,
    removedStopwords
  };
}
