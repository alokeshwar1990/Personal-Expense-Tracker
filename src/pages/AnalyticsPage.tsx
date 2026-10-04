import React from 'react';
import { ExpenseStatistics } from '../utils/statistics';
import { CategoryPieChart, MonthlyBarChart, CategoryBarChart, SpendingTimelineChart } from '../components/Charts';
import { CategoryBadge } from '../components/CategoryBadge';
import { formatINR } from '../utils/currency';
import { StatCard } from '../components/StatCard';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpRight,
  Printer,
  Calendar,
} from 'lucide-react';

interface AnalyticsPageProps {
  stats: ExpenseStatistics;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ stats }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Financial Reports &amp; Analytics
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            In-depth statistical breakdown, monthly expenditure distribution and category analytics.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save Report</span>
        </button>
      </div>

      {/* Analytical Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Spending"
          value={formatINR(stats.totalSpending)}
          subtitle={`Across ${stats.transactionCount} entries`}
          icon={Wallet}
          iconBg="bg-indigo-50 dark:bg-indigo-950/60"
          iconColor="text-indigo-600 dark:text-indigo-400"
        />

        <StatCard
          title="Average Expense"
          value={formatINR(stats.averageExpense)}
          subtitle="Mean cost per recorded purchase"
          icon={Layers}
          iconBg="bg-blue-50 dark:bg-blue-950/60"
          iconColor="text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title="Highest Expense"
          value={stats.highestExpense ? formatINR(stats.highestExpense.amount) : '₹0.00'}
          subtitle={stats.highestExpense ? `${stats.highestExpense.description} (${stats.highestExpense.date})` : 'None'}
          icon={TrendingUp}
          iconBg="bg-rose-50 dark:bg-rose-950/60"
          iconColor="text-rose-600 dark:text-rose-400"
        />

        <StatCard
          title="Lowest Expense"
          value={stats.lowestExpense ? formatINR(stats.lowestExpense.amount) : '₹0.00'}
          subtitle={stats.lowestExpense ? `${stats.lowestExpense.description}` : 'None'}
          icon={TrendingDown}
          iconBg="bg-emerald-50 dark:bg-emerald-950/60"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Secondary Quick Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Top Spending Category
          </p>
          <div className="flex items-center gap-2 mt-2">
            {stats.topCategory ? (
              <>
                <CategoryBadge category={stats.topCategory.category} size="md" />
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {formatINR(stats.topCategory.total)} ({stats.topCategory.percentage}%)
                </span>
              </>
            ) : (
              <span className="text-xs text-zinc-400">No data</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Average Monthly Spending
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {formatINR(stats.averageMonthlySpending)}
            </span>
            <span className="text-[11px] text-zinc-400">
              / month ({stats.monthlyBreakdown.length} months logged)
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Current Month Expense Count
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {stats.thisMonthCount}
            </span>
            <span className="text-[11px] text-zinc-400">
              transactions totaling {formatINR(stats.thisMonthSpending)}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Analytics 4-Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Pie/Donut Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            1. Spending by Category (Donut Chart)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            Relative proportion of each expenditure domain
          </p>
          <CategoryPieChart data={stats.categoryBreakdown} />
        </div>

        {/* 2. Monthly Bar Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            2. Monthly Spending (Bar Chart)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            Month-over-month total expense aggregation
          </p>
          <MonthlyBarChart data={stats.monthlyBreakdown} />
        </div>

        {/* 3. Category-wise Bar Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            3. Category-wise Spending (Ranking Bar Chart)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            Absolute rupee volume per category ranked descending
          </p>
          <CategoryBarChart data={stats.categoryBreakdown} />
        </div>

        {/* 4. Spending Over Time Line Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            4. Spending Over Time (Cumulative Growth Curve)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            Progression curve tracking cumulative expenditure
          </p>
          <SpendingTimelineChart data={stats.timelineData} />
        </div>
      </div>

      {/* Tabular Reports: Category Report & Monthly Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Report Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Category Breakdown Report
            </h3>
            <span className="text-[11px] text-zinc-400">8 Categories</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                  <th className="py-2.5 px-3 text-right">Share (%)</th>
                  <th className="py-2.5 px-3 text-right">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {stats.categoryBreakdown.map((row) => (
                  <tr key={row.category} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40">
                    <td className="py-2.5 px-3 font-medium">
                      <CategoryBadge category={row.category} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-zinc-900 dark:text-zinc-100">
                      {formatINR(row.total)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${Math.min(row.percentage, 100)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {row.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-zinc-500 dark:text-zinc-400">
                      {row.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Report Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Monthly Spending Report
            </h3>
            <span className="text-[11px] text-zinc-400">
              {stats.monthlyBreakdown.length} Active Periods
            </span>
          </div>

          {stats.monthlyBreakdown.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              No monthly activity logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3 text-right">Total Spending (₹)</th>
                    <th className="py-2.5 px-3 text-right">Transactions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {stats.monthlyBreakdown.map((m) => (
                    <tr key={m.monthKey} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40">
                      <td className="py-3 px-3 font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{m.label}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                        {formatINR(m.total)}
                      </td>
                      <td className="py-3 px-3 text-right text-zinc-500 dark:text-zinc-400">
                        {m.count} expenses
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
