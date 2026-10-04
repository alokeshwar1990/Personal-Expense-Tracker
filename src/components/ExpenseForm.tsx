import React, { useState, useEffect } from 'react';
import { Expense, Category, CATEGORIES } from '../types/expense';
import { mlPipeline } from '../ml/pipeline';
import { MLPredictionResult } from '../ml/types';
import { CategoryBadge } from './CategoryBadge';
import { Sparkles, Check, AlertCircle, RefreshCw, Layers } from 'lucide-react';

interface ExpenseFormProps {
  initialExpense?: Expense | null;
  prefill?: { description: string; amount?: string } | null;
  onSubmit: (expense: Omit<Expense, 'id'>, id?: string) => void;
  onCancel?: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialExpense,
  prefill,
  onSubmit,
  onCancel,
}) => {
  const [date, setDate] = useState<string>(
    initialExpense ? initialExpense.date : new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState<string>(
    initialExpense ? initialExpense.description : prefill?.description || ''
  );
  const [amount, setAmount] = useState<string>(
    initialExpense ? initialExpense.amount.toString() : prefill?.amount || ''
  );
  const [category, setCategory] = useState<Category>(
    initialExpense ? initialExpense.category : 'Food'
  );
  const [predictionSource, setPredictionSource] = useState<'ml' | 'manual'>(
    initialExpense?.predictionSource || 'manual'
  );
  const [predictionResult, setPredictionResult] = useState<MLPredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [overrideManual, setOverrideManual] = useState<boolean>(
    initialExpense ? initialExpense.predictionSource === 'manual' : false
  );

  useEffect(() => {
    if (initialExpense) {
      setDate(initialExpense.date);
      setDescription(initialExpense.description);
      setAmount(initialExpense.amount.toString());
      setCategory(initialExpense.category);
      setPredictionSource(initialExpense.predictionSource || 'manual');
      setOverrideManual(initialExpense.predictionSource === 'manual');
    }
  }, [initialExpense]);

  useEffect(() => {
    if (prefill) {
      setDescription(prefill.description);
      if (prefill.amount) setAmount(prefill.amount);
      try {
        const res = mlPipeline.predict(prefill.description);
        setPredictionResult(res);
        setCategory(res.category);
        setPredictionSource('ml');
        setOverrideManual(false);
      } catch {
        // ignore
      }
    }
  }, [prefill]);

  const handlePredictML = () => {
    if (!description.trim()) {
      setErrors((prev) => ({ ...prev, description: 'Enter a description first to predict category.' }));
      return;
    }

    setIsPredicting(true);
    setErrors((prev) => {
      const rest = { ...prev };
      delete rest.description;
      return rest;
    });

    try {
      const result = mlPipeline.predict(description.trim());
      setPredictionResult(result);
      setCategory(result.category);
      setPredictionSource('ml');
      setOverrideManual(false);
    } catch (err) {
      console.error('ML Prediction failed:', err);
    } finally {
      setIsPredicting(false);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!date || !date.trim()) {
      errs.date = 'Please select a valid date.';
    }

    if (!description || !description.trim()) {
      errs.description = 'Expense description is required.';
    } else if (description.trim().length < 2) {
      errs.description = 'Description must be at least 2 characters.';
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount)) {
      errs.amount = 'Please enter a valid expense amount.';
    } else if (parsedAmount <= 0) {
      errs.amount = 'Amount must be greater than ₹0.';
    }

    if (!CATEGORIES.includes(category)) {
      errs.category = 'Please choose a valid category.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const numAmount = parseFloat(amount);
    const finalConfidence = predictionResult && predictionSource === 'ml' 
      ? predictionResult.confidence 
      : initialExpense?.confidence;

    onSubmit(
      {
        date,
        description: description.trim(),
        amount: Math.round(numAmount * 100) / 100,
        category,
        predictionSource: overrideManual ? 'manual' : predictionSource,
        confidence: overrideManual ? undefined : finalConfidence,
      },
      initialExpense?.id
    );

    if (!initialExpense) {
      // Reset form if creating new
      setDescription('');
      setAmount('');
      setPredictionResult(null);
      setPredictionSource('manual');
      setOverrideManual(false);
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Date & Amount Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date Field */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (errors.date) {
                setErrors((prev) => {
                  const rest = { ...prev };
                  delete rest.date;
                  return rest;
                });
              }
            }}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 ${
              errors.date
                ? 'border-rose-400 focus:ring-rose-500/20'
                : 'border-zinc-200 dark:border-zinc-700 focus:ring-indigo-500/20 focus:border-indigo-500'
            }`}
          />
          {errors.date && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.date}</span>
            </p>
          )}
        </div>

        {/* Amount Field */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Amount (₹) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-sm">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) {
                  setErrors((prev) => {
                    const rest = { ...prev };
                    delete rest.amount;
                    return rest;
                  });
                }
              }}
              className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 ${
                errors.amount
                  ? 'border-rose-400 focus:ring-rose-500/20'
                  : 'border-zinc-200 dark:border-zinc-700 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.amount}</span>
            </p>
          )}
        </div>
      </div>

      {/* Description Field */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Description <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-zinc-400">e.g. &quot;Lunch at canteen&quot;, &quot;Uber cab&quot;</span>
        </div>
        <input
          type="text"
          placeholder="Enter expense details..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) {
              setErrors((prev) => {
                const rest = { ...prev };
                delete rest.description;
                return rest;
              });
            }
          }}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 ${
            errors.description
              ? 'border-rose-400 focus:ring-rose-500/20'
              : 'border-zinc-200 dark:border-zinc-700 focus:ring-indigo-500/20 focus:border-indigo-500'
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.description}</span>
          </p>
        )}
      </div>

      {/* Predict Button Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-emerald-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-emerald-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Machine Learning Auto-Categorizer
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Evaluates text with TF-IDF vectorizer &amp;{' '}
              {mlPipeline.getActiveAlgorithm() === 'neural_network'
                ? 'Neural Network'
                : 'Logistic Regression (Baseline)'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePredictML}
          disabled={isPredicting || !description.trim()}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          {isPredicting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Predicting...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Predict Category with ML</span>
            </>
          )}
        </button>
      </div>

      {/* ML Prediction Result Banner */}
      {predictionResult && (
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 space-y-3 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Predicted Category:
              </span>
              <CategoryBadge category={predictionResult.category} size="md" />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Confidence:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700">
                {(predictionResult.confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Top TF-IDF Terms Used */}
          {predictionResult.topFeatures.length > 0 && (
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center gap-1 pt-1 border-t border-emerald-200/50 dark:border-emerald-900/40">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">TF-IDF Signals:</span>
              {predictionResult.topFeatures.slice(0, 4).map((f) => (
                <span
                  key={f.term}
                  className="px-1.5 py-0.5 bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                >
                  {f.term} ({f.tfidf})
                </span>
              ))}
            </div>
          )}

          {/* Options: Use Prediction vs Choose Manually */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setCategory(predictionResult.category);
                setPredictionSource('ml');
                setOverrideManual(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                !overrideManual && category === predictionResult.category
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              Use Prediction
            </button>

            <button
              type="button"
              onClick={() => {
                setOverrideManual(true);
                setPredictionSource('manual');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                overrideManual
                  ? 'bg-zinc-800 dark:bg-zinc-700 text-white border-zinc-800 dark:border-zinc-700'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Choose Manually
            </button>
          </div>
        </div>
      )}

      {/* Category Selection (Always available or when override chosen) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Category <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-zinc-400">
            Source: {predictionSource === 'ml' && !overrideManual ? 'ML Prediction' : 'Manual'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setOverrideManual(true);
                  setPredictionSource('manual');
                  if (errors.category) {
                    setErrors((prev) => {
                      const rest = { ...prev };
                      delete rest.category;
                      return rest;
                    });
                  }
                }}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <CategoryBadge category={cat} size="sm" showIcon={false} />
              </button>
            );
          })}
        </div>
        {errors.category && (
          <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.category}</span>
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          {initialExpense ? 'Update Expense' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
};
