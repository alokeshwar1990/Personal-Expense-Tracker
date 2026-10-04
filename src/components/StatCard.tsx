import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  badge?: {
    text: string;
    variant: 'positive' | 'negative' | 'neutral' | 'info';
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = 'bg-blue-50 dark:bg-blue-950/50',
  iconColor = 'text-blue-600 dark:text-blue-400',
  badge,
}) => {
  const badgeClasses = {
    positive: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    negative: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    neutral: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
    info: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  }[badge?.variant || 'neutral'];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1.5 tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      {(subtitle || badge) && (
        <div className="mt-3.5 flex items-center justify-between text-xs pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          {subtitle && (
            <span className="text-zinc-500 dark:text-zinc-400 truncate max-w-[180px]">
              {subtitle}
            </span>
          )}
          {badge && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeClasses}`}>
              {badge.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
