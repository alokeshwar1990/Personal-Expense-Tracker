import React, { useState, useMemo } from 'react';
import { Expense, Category, CATEGORIES, SortField, SortOrder } from '../types/expense';
import { CategoryBadge } from './CategoryBadge';
import { formatINR } from '../utils/currency';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Sparkles,
  User,
  Download,
  Calendar,
  AlertTriangle,
  X,
} from 'lucide-react';
import { exportExpensesToCSV } from '../utils/csv';

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onNavigateAdd?: () => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  onEdit,
  onDelete,
  onNavigateAdd,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Available months from current expenses
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    expenses.forEach((e) => {
      if (e.date) months.add(e.date.substring(0, 7));
    });
    return Array.from(months).sort().reverse();
  }, [expenses]);

  // Filtered and Sorted Expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        // Search filter
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchDesc = e.description.toLowerCase().includes(query);
          const matchCat = e.category.toLowerCase().includes(query);
          const matchAmount = e.amount.toString().includes(query);
          if (!matchDesc && !matchCat && !matchAmount) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && e.category !== selectedCategory) {
          return false;
        }

        // Month filter
        if (selectedMonth !== 'all' && !e.date.startsWith(selectedMonth)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let compare = 0;
        if (sortField === 'date') {
          compare = a.date.localeCompare(b.date);
        } else if (sortField === 'amount') {
          compare = a.amount - b.amount;
        } else if (sortField === 'description') {
          compare = a.description.localeCompare(b.description);
        } else if (sortField === 'category') {
          compare = a.category.localeCompare(b.category);
        }
        return sortOrder === 'asc' ? compare : -compare;
      });
  }, [expenses, searchTerm, selectedCategory, selectedMonth, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 opacity-60" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedMonth('all');
  };

  const isFiltering = searchTerm !== '' || selectedCategory !== 'all' || selectedMonth !== 'all';

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search, Category, Month, Export */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search expenses by description, amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative min-w-[140px]">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-8 pr-7 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Month Dropdown */}
          <div className="relative min-w-[130px]">
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full pl-8 pr-7 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer"
            >
              <option value="all">All Months</option>
              {availableMonths.map((m) => {
                const [year, month] = m.split('-');
                const label = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString(
                  'en-US',
                  { month: 'short', year: 'numeric' }
                );
                return (
                  <option key={m} value={m}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Action Buttons: Clear Filter & Export */}
        <div className="flex items-center gap-2">
          {isFiltering && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Clear Filters
            </button>
          )}

          <button
            onClick={() => exportExpensesToCSV(filteredExpenses)}
            disabled={filteredExpenses.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-200 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-40 cursor-pointer"
            title="Export shown expenses to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {expenses.length === 0 ? 'No expenses yet.' : 'No matching expenses found'}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              {expenses.length === 0
                ? 'Start tracking your spending by adding your first expense.'
                : 'Try adjusting your search terms or category filters.'}
            </p>
            {expenses.length === 0 && onNavigateAdd && (
              <button
                onClick={onNavigateAdd}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                Add Your First Expense
              </button>
            )}
            {expenses.length > 0 && isFiltering && (
              <button
                onClick={resetFilters}
                className="mt-3 px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/75 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200"
                    onClick={() => toggleSort('date')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date</span>
                      {getSortIcon('date')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200"
                    onClick={() => toggleSort('description')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Description</span>
                      {getSortIcon('description')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200"
                    onClick={() => toggleSort('category')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Category</span>
                      {getSortIcon('category')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 text-right cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200"
                    onClick={() => toggleSort('amount')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Amount</span>
                      {getSortIcon('amount')}
                    </div>
                  </th>
                  <th className="py-3 px-4">Prediction Source</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredExpenses.map((expense) => {
                  const isML = expense.predictionSource === 'ml';
                  return (
                    <tr
                      key={expense.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                        {expense.date}
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 text-zinc-900 dark:text-zinc-100 font-medium max-w-xs truncate">
                        {expense.description}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <CategoryBadge category={expense.category} size="sm" />
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-bold text-zinc-900 dark:text-zinc-50 whitespace-nowrap">
                        {formatINR(expense.amount)}
                      </td>

                      {/* Prediction Source */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isML ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                            title={
                              expense.confidence
                                ? `Model Confidence: ${(expense.confidence * 100).toFixed(1)}%`
                                : 'Predicted via local ML model'
                            }
                          >
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span>ML Prediction</span>
                            {expense.confidence && (
                              <span className="text-[9px] opacity-75">
                                ({(expense.confidence * 100).toFixed(0)}%)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                            <User className="w-3 h-3" />
                            <span>Manual</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEdit(expense)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit expense"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(expense.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Delete expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary */}
        {filteredExpenses.length > 0 && (
          <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              Showing <strong className="text-zinc-800 dark:text-zinc-200">{filteredExpenses.length}</strong> of{' '}
              <strong className="text-zinc-800 dark:text-zinc-200">{expenses.length}</strong> transactions
            </span>
            <span>
              Subtotal:{' '}
              <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                {formatINR(filteredExpenses.reduce((sum, e) => sum + e.amount, 0))}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-5 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Delete Expense?
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  This transaction will be removed from your records.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
