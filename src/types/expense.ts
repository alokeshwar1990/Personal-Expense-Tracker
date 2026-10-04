export type Category =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Healthcare'
  | 'Education'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Other',
];

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  category: Category;
  predictionSource?: 'ml' | 'manual';
  confidence?: number;
}

export type SortField = 'date' | 'amount' | 'description' | 'category';
export type SortOrder = 'asc' | 'desc';

export interface ExpenseFilter {
  search: string;
  category: string;
  month: string; // YYYY-MM or 'all'
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}
