import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { CategorySummary, MonthlySummary } from '../utils/statistics';
import { CATEGORY_COLORS } from './CategoryBadge';
import { formatINR } from '../utils/currency';

interface CategoryPieProps {
  data: CategorySummary[];
}

export const CategoryPieChart: React.FC<CategoryPieProps> = ({ data }) => {
  const filteredData = data.filter((d) => d.total > 0);

  if (filteredData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-zinc-400">
        No expense data available for category chart
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as CategorySummary;
                return (
                  <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 text-xs">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.category}
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-300 font-medium">
                      {formatINR(item.total)} ({item.percentage}%)
                    </p>
                    <p className="text-[10px] text-zinc-400">{item.count} transactions</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="total"
            nameKey="category"
          >
            {filteredData.map((entry) => (
              <Cell
                key={`cell-${entry.category}`}
                fill={CATEGORY_COLORS[entry.category]?.hex || '#6366f1'}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface MonthlyBarProps {
  data: MonthlySummary[];
}

export const MonthlyBarChart: React.FC<MonthlyBarProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-zinc-400">
        No monthly trends yet
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" opacity={0.5} />
          <XAxis
            dataKey="label"
            stroke="#a1a1aa"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#a1a1aa"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₹${val}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as MonthlySummary;
                return (
                  <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 text-xs">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{item.label}</p>
                    <p className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {formatINR(item.total)}
                    </p>
                    <p className="text-[10px] text-zinc-400">{item.count} expenses</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="total"
            fill="#6366f1"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface CategoryBarProps {
  data: CategorySummary[];
}

export const CategoryBarChart: React.FC<CategoryBarProps> = ({ data }) => {
  const sorted = [...data].sort((a, b) => b.total - a.total).filter((d) => d.total > 0);

  if (sorted.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-zinc-400">
        No category data available
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={sorted}
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" opacity={0.5} />
          <XAxis
            type="number"
            stroke="#a1a1aa"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₹${val}`}
          />
          <YAxis
            type="category"
            dataKey="category"
            stroke="#a1a1aa"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as CategorySummary;
                return (
                  <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 text-xs">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{item.category}</p>
                    <p className="text-zinc-700 dark:text-zinc-200 font-bold">
                      {formatINR(item.total)}
                    </p>
                    <p className="text-[10px] text-zinc-400">{item.percentage}% of total</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="total" radius={[0, 6, 6, 0]}>
            {sorted.map((entry) => (
              <Cell
                key={`bar-cell-${entry.category}`}
                fill={CATEGORY_COLORS[entry.category]?.hex || '#6366f1'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface SpendingTimelineProps {
  data: { date: string; amount: number; cumulative: number }[];
}

export const SpendingTimelineChart: React.FC<SpendingTimelineProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-zinc-400">
        No spending timeline available
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" opacity={0.5} />
          <XAxis
            dataKey="date"
            stroke="#a1a1aa"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => {
              const parts = val.split('-');
              return `${parts[1]}/${parts[2]}`;
            }}
          />
          <YAxis
            stroke="#a1a1aa"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₹${val}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-white dark:bg-zinc-800 p-2.5 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 text-xs">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{item.date}</p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Day: {formatINR(item.amount)}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[10px]">
                      Cumulative: {formatINR(item.cumulative)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#spendingGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
