import React, { useState } from 'react';
import { Expense } from '../types/expense';
import { ExpenseStatistics } from '../utils/statistics';
import { StatCard } from '../components/StatCard';
import { CategoryPieChart, MonthlyBarChart, SpendingTimelineChart } from '../components/Charts';
import { CategoryBadge } from '../components/CategoryBadge';
import { formatINR } from '../utils/currency';
import { mlPipeline } from '../ml/pipeline';
import { MLPredictionResult } from '../ml/types';
import {
  Wallet,
  CalendarDays,
  TrendingUp,
  Receipt,
  Sparkles,
  ArrowRight,
  Plus,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface DashboardProps {
  expenses: Expense[];
  stats: ExpenseStatistics;
  onNavigateTab: (tab: NavTab) => void;
  onQuickAdd: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  expenses,
  stats,
  onNavigateTab,
  onQuickAdd,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [quickResult, setQuickResult] = useState<MLPredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handleQuickPredict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    setIsPredicting(true);
    try {
      const res = mlPipeline.predict(quickInput.trim());
      setQuickResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPredicting(false);
    }
  };

  const recentExpenses = expenses.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold tracking-wide text-indigo-200 border border-white/10 mb-2.5">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Machine Learning Enhanced Spending Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Personal Expense Tracker
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200/90 mt-1 max-w-xl">
            Track, analyze and understand your spending with real local machine learning classification.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onQuickAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => onNavigateTab('ml-assistant')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-medium text-xs border border-white/20 transition-all cursor-pointer"
          >
            <span>ML Inspector</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Expenses"
          value={formatINR(stats.totalSpending)}
          subtitle={`${stats.transactionCount} transactions recorded`}
          icon={Wallet}
          iconBg="bg-indigo-50 dark:bg-indigo-950/60"
          iconColor="text-indigo-600 dark:text-indigo-400"
        />

        <StatCard
          title="This Month"
          value={formatINR(stats.thisMonthSpending)}
          subtitle={`${stats.thisMonthCount} expenses this calendar month`}
          icon={CalendarDays}
          iconBg="bg-emerald-50 dark:bg-emerald-950/60"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Highest Expense"
          value={stats.highestExpense ? formatINR(stats.highestExpense.amount) : '₹0.00'}
          subtitle={stats.highestExpense ? stats.highestExpense.description : 'No records yet'}
          icon={TrendingUp}
          iconBg="bg-rose-50 dark:bg-rose-950/60"
          iconColor="text-rose-600 dark:text-rose-400"
          badge={
            stats.highestExpense
              ? { text: stats.highestExpense.category, variant: 'neutral' }
              : undefined
          }
        />

        <StatCard
          title="Number of Transactions"
          value={stats.transactionCount.toString()}
          subtitle={
            stats.topCategory
              ? `Top Category: ${stats.topCategory.category} (${stats.topCategory.percentage}%)`
              : 'Add expenses to see top category'
          }
          icon={Receipt}
          iconBg="bg-amber-50 dark:bg-amber-950/60"
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Section 1 & 2: Charts Row (Category Distribution & Monthly Spending) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Category Distribution
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Share of wallet by expense category
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Report</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <CategoryPieChart data={stats.categoryBreakdown} />
        </div>

        {/* Monthly Spending */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Monthly Spending
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Expenditure trends over calendar months
              </p>
            </div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Avg: {formatINR(stats.averageMonthlySpending, false)}/mo
            </span>
          </div>
          <MonthlyBarChart data={stats.monthlyBreakdown} />
        </div>
      </div>

      {/* Section 3: Spending Overview Timeline */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Spending Overview &amp; Cumulative Curve
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Cumulative expense growth across days
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Total {formatINR(stats.totalSpending)}
          </span>
        </div>
        <SpendingTimelineChart data={stats.timelineData} />
      </div>

      {/* Section 4 & 5: Recent Transactions & ML Category Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Recent Transactions
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Latest expenses and classification details
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>See All ({expenses.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-400">
              No transactions recorded yet. Click &quot;Add Expense&quot; above.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {recentExpenses.map((e) => (
                <div key={e.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {e.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-zinc-400">{e.date}</span>
                      <CategoryBadge category={e.category} size="sm" />
                      {e.predictionSource === 'ml' && (
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>ML</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {formatINR(e.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ML Category Assistant Quick Widget */}
        <div className="bg-gradient-to-b from-indigo-50/60 to-white dark:from-zinc-900 dark:to-zinc-900 rounded-2xl p-5 border border-indigo-100 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                ML Category Assistant
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
              Type any expense description to test the local machine-learning classifier in real-time.
            </p>

            <form onSubmit={handleQuickPredict} className="space-y-2.5">
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="e.g. Domino's pizza delivery"
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isPredicting || !quickInput.trim()}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isPredicting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Test ML Classification</span>
              </button>
            </form>

            {quickResult && (
              <div className="mt-3 p-3 rounded-xl bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-zinc-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Predicted:</span>
                  <CategoryBadge category={quickResult.category} size="sm" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">Confidence:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {(quickResult.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                {quickResult.topFeatures.length > 0 && (
                  <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-700/60 truncate">
                    Signal: {quickResult.topFeatures.map((f) => f.term).join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => onNavigateTab('ml-assistant')}
              className="w-full text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1"
            >
              <span>Explore Full ML Architecture &amp; Metrics</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
