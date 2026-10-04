import React, { useState } from 'react';
import { Expense } from '../types/expense';
import { ExpenseForm } from '../components/ExpenseForm';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface AddExpensePageProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const AddExpensePage: React.FC<AddExpensePageProps> = ({
  onAddExpense,
  onNavigateTab,
}) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<{ description: string; amount: string } | null>(null);

  const handleSubmit = (expenseData: Omit<Expense, 'id'>) => {
    onAddExpense(expenseData);
    setPrefill(null);
    setSuccessMessage(`Expense "${expenseData.description}" added successfully!`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const sampleDescriptions = [
    { text: 'pizza with friends', amount: '450' },
    { text: 'uber ride to college campus', amount: '180' },
    { text: 'monthly electricity bill', amount: '1250' },
    { text: 'bought new running shoes', amount: '2499' },
    { text: 'movie ticket pvr inox', amount: '350' },
    { text: 'new python course certificate', amount: '499' },
    { text: 'doctor consultation fee', amount: '600' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Add New Expense
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Record your financial transactions with automated local Machine Learning classification.
        </p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => onNavigateTab('expenses')}
            className="font-bold underline hover:text-emerald-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>View Expenses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Card with Expense Form */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <ExpenseForm prefill={prefill} onSubmit={handleSubmit} />
      </div>

      {/* Quick Test Preset Ideas for Academic Demonstration */}
      <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl p-5 border border-zinc-200/70 dark:border-zinc-800">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Quick Demonstration Prompts (Click to Auto-Fill &amp; Predict)
          </h4>
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3">
          Click any prompt below to automatically populate the form and run the active Machine Learning model:
        </p>
        <div className="flex flex-wrap gap-2">
          {sampleDescriptions.map((item) => (
            <button
              key={item.text}
              type="button"
              onClick={() => setPrefill({ description: item.text, amount: item.amount })}
              className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>&ldquo;{item.text}&rdquo;</span>
              <span className="text-[10px] text-zinc-400">₹{item.amount}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
