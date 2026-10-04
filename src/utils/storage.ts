import { Expense } from '../types/expense';
import { INITIAL_SAMPLE_EXPENSES } from './sampleData';

const EXPENSES_STORAGE_KEY = 'ml_expense_tracker_data_v1';
const THEME_STORAGE_KEY = 'ml_expense_tracker_theme';

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) {
      // First launch: initialize with sample data
      saveExpenses(INITIAL_SAMPLE_EXPENSES);
      return INITIAL_SAMPLE_EXPENSES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_SAMPLE_EXPENSES;
  } catch (error) {
    console.error('Failed to parse expenses from localStorage, recovering with sample data', error);
    return INITIAL_SAMPLE_EXPENSES;
  }
}

export function saveExpenses(expenses: Expense[]): boolean {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
    window.dispatchEvent(new Event('expenses_updated'));
    return true;
  } catch (error) {
    console.error('Failed to write expenses to localStorage', error);
    return false;
  }
}

export function clearExpenses(): void {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event('expenses_updated'));
  } catch (error) {
    console.error('Failed to clear expenses', error);
  }
}

export function resetToDemoExpenses(): Expense[] {
  saveExpenses(INITIAL_SAMPLE_EXPENSES);
  return INITIAL_SAMPLE_EXPENSES;
}

export function getStoredTheme(): 'light' | 'dark' {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveStoredTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}
