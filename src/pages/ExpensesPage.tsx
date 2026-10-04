import React, { useState } from 'react';
import { Expense } from '../types/expense';
import { ExpenseTable } from '../components/ExpenseTable';
import { ExpenseForm } from '../components/ExpenseForm';
import { Plus, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { parseAndValidateCSV } from '../utils/csv';
import { NavTab } from '../components/Sidebar';

interface ExpensesPageProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  onImportExpenses: (imported: Expense[]) => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({
  expenses,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onImportExpenses,
  onNavigateTab,
}) => {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    message: string;
    errors?: string[];
    count?: number;
  } | null>(null);

  const handleEditSubmit = (data: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      onUpdateExpense(editingExpense.id, data);
      setEditingExpense(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setImportStatus(null);
    }
  };

  const handleProcessCSV = () => {
    if (!csvFile) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) {
        setImportStatus({
          success: false,
          message: 'The selected file is empty.',
        });
        return;
      }

      const result = parseAndValidateCSV(text, expenses);
      if (result.success && result.imported.length > 0) {
        onImportExpenses(result.imported);
        setImportStatus({
          success: true,
          message: `Successfully imported ${result.imported.length} valid expense record${
            result.imported.length > 1 ? 's' : ''
          }.`,
          errors: result.errors.length > 0 ? result.errors : undefined,
          count: result.imported.length,
        });
      } else {
        setImportStatus({
          success: false,
          message: 'Could not import any valid records from CSV.',
          errors: result.errors,
        });
      }
    };
    reader.readAsText(csvFile);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Expense Records
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Search, filter, edit and manage all logged transactions with ML origin indicators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowImportModal(true);
              setImportStatus(null);
              setCsvFile(null);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => onNavigateTab('add-expense')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Main Expense Table */}
      <ExpenseTable
        expenses={expenses}
        onEdit={(exp) => setEditingExpense(exp)}
        onDelete={onDeleteExpense}
        onNavigateAdd={() => onNavigateTab('add-expense')}
      />

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Edit Expense Transaction
              </h3>
              <button
                onClick={() => setEditingExpense(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ExpenseForm
              initialExpense={editingExpense}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingExpense(null)}
            />
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Import Expenses from CSV
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Upload comma-separated values with headers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                The CSV file should contain columns for{' '}
                <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px]">
                  date,description,amount,category
                </code>
                . (The <code className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px]">id</code> column is optional).
              </p>

              <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-file-input"
                />
                <label
                  htmlFor="csv-file-input"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-zinc-400 hover:text-indigo-600" />
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {csvFile ? csvFile.name : 'Click to select CSV file'}
                  </span>
                  <span className="text-[11px] text-zinc-400">Supported format: .csv</span>
                </label>
              </div>

              {/* Status Message */}
              {importStatus && (
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    importStatus.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {importStatus.success ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>{importStatus.message}</span>
                  </div>

                  {importStatus.errors && importStatus.errors.length > 0 && (
                    <div className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-300 max-h-32 overflow-y-auto space-y-1">
                      <p className="font-semibold text-rose-700 dark:text-rose-300">
                        Row Warnings / Errors ({importStatus.errors.length}):
                      </p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {importStatus.errors.slice(0, 5).map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                        {importStatus.errors.length > 5 && (
                          <li>...and {importStatus.errors.length - 5} more issues.</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleProcessCSV}
                disabled={!csvFile}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-xs"
              >
                Parse &amp; Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
