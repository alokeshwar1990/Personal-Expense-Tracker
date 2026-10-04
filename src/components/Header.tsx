import React from 'react';
import { Menu, Sun, Moon, Plus, Sparkles } from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  onToggleMobileNav: () => void;
  onNavigateAdd: () => void;
  currentTab: NavTab;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  accuracy: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileNav,
  onNavigateAdd,
  theme,
  onToggleTheme,
  accuracy,
}) => {
  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
            Personal Expense Tracker
          </h1>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
            Track, analyze and understand your spending with Machine Learning
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* ML Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>ML Accuracy: {(accuracy * 100).toFixed(1)}%</span>
        </div>

        {/* Quick Add Expense button */}
        <button
          onClick={onNavigateAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Expense</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-600" />
          )}
        </button>
      </div>
    </header>
  );
};
