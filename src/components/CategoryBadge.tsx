import React from 'react';
import { Category } from '../types/expense';
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Package,
} from 'lucide-react';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const CATEGORY_COLORS: Record<
  Category,
  { bg: string; text: string; border: string; hex: string }
> = {
  Food: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    hex: '#10b981',
  },
  Transport: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    hex: '#3b82f6',
  },
  Shopping: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    hex: '#a855f7',
  },
  Bills: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    hex: '#f59e0b',
  },
  Entertainment: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    hex: '#f43f5e',
  },
  Healthcare: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-800',
    hex: '#06b6d4',
  },
  Education: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    hex: '#6366f1',
  },
  Other: {
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-700 dark:text-zinc-300',
    border: 'border-zinc-200 dark:border-zinc-700',
    hex: '#71717a',
  },
};

export const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  Food: Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Entertainment: Film,
  Healthcare: HeartPulse,
  Education: GraduationCap,
  Other: Package,
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  showIcon = true,
}) => {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  const Icon = CATEGORY_ICONS[category] || Package;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-medium px-3 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors ${color.bg} ${color.text} ${color.border} ${sizeClasses}`}
    >
      {showIcon && <Icon className={iconSizes} />}
      <span>{category}</span>
    </span>
  );
};
