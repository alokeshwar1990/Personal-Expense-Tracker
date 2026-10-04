import React, { useState } from 'react';
import { Expense } from '../types/expense';
import { exportExpensesToCSV, parseAndValidateCSV } from '../utils/csv';
import { downloadPdfReport, downloadPresentationPPTX } from '../utils/downloadDocuments';
import {
  Sun,
  Moon,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Database,
  Coins,
  GraduationCap,
  FileText,
  Presentation,
  Loader2,
} from 'lucide-react';

interface SettingsPageProps {
  expenses: Expense[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onResetDemo: () => void;
  onClearAll: () => void;
  onImportExpenses: (imported: Expense[]) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  expenses,
  theme,
  onToggleTheme,
  onResetDemo,
  onClearAll,
  onImportExpenses,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState<'pdf' | 'pptx' | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; text: string } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingDoc('pdf');
      showToast('Compiling 20-page Technical PDF Report with live ML metrics...');
      await downloadPdfReport();
      showToast('Technical Report PDF downloaded successfully!');
    } catch (err) {
      showToast('Error generating PDF report.', 'info');
    } finally {
      setIsGeneratingDoc(null);
    }
  };

  const handleDownloadPptx = async () => {
    try {
      setIsGeneratingDoc('pptx');
      showToast('Generating 14-slide 16:9 Widescreen PowerPoint Presentation...');
      await downloadPresentationPPTX();
      showToast('Internship Presentation (.pptx) downloaded successfully!');
    } catch (err) {
      showToast('Error generating PowerPoint presentation.', 'info');
    } finally {
      setIsGeneratingDoc(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const res = parseAndValidateCSV(text, expenses);
      if (res.success && res.imported.length > 0) {
        onImportExpenses(res.imported);
        showToast(`Imported ${res.imported.length} expenses from CSV.`);
      } else {
        showToast(`Failed to import CSV: ${res.errors.join('; ')}`, 'info');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Settings &amp; Data Management
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Configure application preferences, currency display, data import/export and system storage.
        </p>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Preferences Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Coins className="w-4 h-4 text-indigo-600" />
          <span>Regional &amp; Display Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Currency Display */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Active Currency
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Indian Rupee standard notation
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <span className="text-indigo-600 font-black">₹</span>
              <span>INR (Rupees)</span>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Appearance Theme
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </p>
            </div>
            <button
              onClick={onToggleTheme}
              className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Switch to Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Switch to Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          <span>Data Storage &amp; Backup</span>
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Transactions are stored in browser <code className="font-mono text-zinc-700 dark:text-zinc-300">localStorage</code>. You can back them up to CSV or restore sample benchmarks at any time.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Export CSV */}
          <button
            onClick={() => {
              exportExpensesToCSV(expenses);
              showToast(`Exported ${expenses.length} expenses to CSV file.`);
            }}
            disabled={expenses.length === 0}
            className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left transition-all disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-5 h-5 text-indigo-600 mb-2" />
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Export CSV</h4>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Save {expenses.length} records to a .csv spreadsheet
            </p>
          </button>

          {/* Import CSV */}
          <label className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left transition-all cursor-pointer block">
            <Upload className="w-5 h-5 text-purple-600 mb-2" />
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Import CSV</h4>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Upload expenses from formatted file
            </p>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Load Demo Data */}
          <button
            onClick={() => {
              onResetDemo();
              showToast('Sample expenses reloaded successfully.');
            }}
            className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Load Demo Data</h4>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Reset to 16 realistic benchmark expenses
            </p>
          </button>

          {/* Clear All Data */}
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={expenses.length === 0}
            className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 text-left transition-all disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="w-5 h-5 text-rose-600 mb-2" />
            <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300">Clear All Data</h4>
            <p className="text-[10px] text-rose-600/70 dark:text-rose-400/70 mt-0.5">
              Erase all {expenses.length} records from storage
            </p>
          </button>
        </div>
      </div>

      {/* Internship Project Submission Materials */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-indigo-200 dark:border-indigo-900/60 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Internship Project Deliverables &amp; Review Documents
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Officially generated reports containing actual application metrics, confusion matrices, and architecture.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
            Live Verified Metrics
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* PDF Report Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-50 to-indigo-50/40 dark:from-zinc-800/60 dark:to-indigo-950/20 border border-zinc-200/90 dark:border-zinc-700/80 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 font-semibold">
                  A4 • 20 Pages
                </span>
              </div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Technical Project Report (PDF)
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Comprehensive 20-page engineering report covering Executive Abstract, Architecture, Module Decomposition, TF-IDF formulation, Baseline Logistic Regression, Wide &amp; Deep ResNet, Classification Report, Confusion Matrix, and 12 Test Cases.
              </p>
            </div>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingDoc !== null}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingDoc === 'pdf' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compiling PDF Report...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Report (PDF)</span>
                </>
              )}
            </button>
          </div>

          {/* PPTX Presentation Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-50 to-purple-50/40 dark:from-zinc-800/60 dark:to-purple-950/20 border border-zinc-200/90 dark:border-zinc-700/80 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Presentation className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 font-semibold">
                  16:9 • 14 Slides
                </span>
              </div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Internship Review Presentation (.pptx)
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Professional 14-slide widescreen presentation designed for corporate and academic evaluation: System architecture, comparative benchmark tables, per-class breakdown, scientific error analysis, and 7-step reviewer demo script.
              </p>
            </div>

            <button
              onClick={handleDownloadPptx}
              disabled={isGeneratingDoc !== null}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingDoc === 'pptx' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Presentation...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Presentation (.pptx)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Project Attribution Card */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
          <GraduationCap className="w-5 h-5" />
          <h4 className="text-xs font-extrabold uppercase tracking-wider">
            Machine Learning Internship Project
          </h4>
        </div>
        <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
          Personal Expense Tracker – ML-Based Categorization
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Engineered as a full-stack personal finance application with a complete in-browser Machine Learning pipeline: text cleaning, sublinear TF-IDF feature extraction, stratified train/test split, baseline Multiclass Logistic Regression, and Wide &amp; Deep Residual Neural Network models with empirical confusion matrices and classification reports.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono">
            React 19 + TypeScript
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono">
            Sublinear TF-IDF
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono">
            Logistic Regression (Baseline)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono">
            Wide &amp; Deep ResNet (Advanced)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono">
            Stratified Holdout Evaluation
          </span>
        </div>
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Clear All Expenses?
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  This will delete all {expenses.length} transaction records from your browser storage. This cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                  showToast('All expense records cleared.', 'info');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
