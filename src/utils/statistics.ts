import { Expense, Category, CATEGORIES } from '../types/expense';

export interface CategorySummary {
  category: Category;
  total: number;
  percentage: number;
  count: number;
}

export interface MonthlySummary {
  monthKey: string; // "2026-09"
  label: string;    // "Sep 2026"
  total: number;
  count: number;
}

export interface ExpenseStatistics {
  totalSpending: number;
  averageExpense: number;
  highestExpense: Expense | null;
  lowestExpense: Expense | null;
  transactionCount: number;
  thisMonthSpending: number;
  thisMonthCount: number;
  topCategory: { category: Category; total: number; percentage: number } | null;
  averageMonthlySpending: number;
  categoryBreakdown: CategorySummary[];
  monthlyBreakdown: MonthlySummary[];
  timelineData: { date: string; amount: number; cumulative: number }[];
}

export function computeExpenseStatistics(expenses: Expense[]): ExpenseStatistics {
  if (expenses.length === 0) {
    return {
      totalSpending: 0,
      averageExpense: 0,
      highestExpense: null,
      lowestExpense: null,
      transactionCount: 0,
      thisMonthSpending: 0,
      thisMonthCount: 0,
      topCategory: null,
      averageMonthlySpending: 0,
      categoryBreakdown: CATEGORIES.map(c => ({ category: c, total: 0, percentage: 0, count: 0 })),
      monthlyBreakdown: [],
      timelineData: []
    };
  }

  let totalSpending = 0;
  let highestExpense: Expense = expenses[0];
  let lowestExpense: Expense = expenses[0];

  const categoryTotals: Record<Category, { total: number; count: number }> = {} as any;
  CATEGORIES.forEach(c => {
    categoryTotals[c] = { total: 0, count: 0 };
  });

  const monthlyTotals: Map<string, { total: number; count: number }> = new Map();
  const dailyTotals: Map<string, number> = new Map();

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  let thisMonthSpending = 0;
  let thisMonthCount = 0;

  for (const exp of expenses) {
    totalSpending += exp.amount;

    if (exp.amount > highestExpense.amount) {
      highestExpense = exp;
    }
    if (exp.amount < lowestExpense.amount) {
      lowestExpense = exp;
    }

    // Category
    if (categoryTotals[exp.category]) {
      categoryTotals[exp.category].total += exp.amount;
      categoryTotals[exp.category].count += 1;
    }

    // Month
    const monthKey = exp.date.substring(0, 7);
    if (!monthlyTotals.has(monthKey)) {
      monthlyTotals.set(monthKey, { total: 0, count: 0 });
    }
    const m = monthlyTotals.get(monthKey)!;
    m.total += exp.amount;
    m.count += 1;

    if (monthKey === currentMonthKey) {
      thisMonthSpending += exp.amount;
      thisMonthCount += 1;
    }

    // Day for timeline
    dailyTotals.set(exp.date, (dailyTotals.get(exp.date) || 0) + exp.amount);
  }

  const averageExpense = totalSpending / expenses.length;

  // Category breakdown
  const categoryBreakdown: CategorySummary[] = CATEGORIES.map(c => {
    const data = categoryTotals[c];
    const percentage = totalSpending > 0 ? (data.total / totalSpending) * 100 : 0;
    return {
      category: c,
      total: Math.round(data.total * 100) / 100,
      percentage: parseFloat(percentage.toFixed(1)),
      count: data.count
    };
  }).sort((a, b) => b.total - a.total);

  const topCategory = categoryBreakdown.length > 0 && categoryBreakdown[0].total > 0
    ? {
        category: categoryBreakdown[0].category,
        total: categoryBreakdown[0].total,
        percentage: categoryBreakdown[0].percentage
      }
    : null;

  // Monthly breakdown sorted chronologically
  const sortedMonthKeys = Array.from(monthlyTotals.keys()).sort();
  const monthlyBreakdown: MonthlySummary[] = sortedMonthKeys.map(k => {
    const data = monthlyTotals.get(k)!;
    const [year, month] = k.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
    const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return {
      monthKey: k,
      label,
      total: Math.round(data.total * 100) / 100,
      count: data.count
    };
  });

  const averageMonthlySpending = monthlyBreakdown.length > 0
    ? totalSpending / monthlyBreakdown.length
    : totalSpending;

  // Timeline cumulative data sorted by date
  const sortedDates = Array.from(dailyTotals.keys()).sort();
  let cumulative = 0;
  const timelineData = sortedDates.map(date => {
    const amount = dailyTotals.get(date)!;
    cumulative += amount;
    return {
      date,
      amount: Math.round(amount * 100) / 100,
      cumulative: Math.round(cumulative * 100) / 100
    };
  });

  return {
    totalSpending: Math.round(totalSpending * 100) / 100,
    averageExpense: Math.round(averageExpense * 100) / 100,
    highestExpense,
    lowestExpense,
    transactionCount: expenses.length,
    thisMonthSpending: Math.round(thisMonthSpending * 100) / 100,
    thisMonthCount,
    topCategory,
    averageMonthlySpending: Math.round(averageMonthlySpending * 100) / 100,
    categoryBreakdown,
    monthlyBreakdown,
    timelineData
  };
}
