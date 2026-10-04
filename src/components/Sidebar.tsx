import React, { useState } from 'react';
import { downloadPdfReport, downloadPresentationPPTX } from '../utils/downloadDocuments';
import {
  LayoutDashboard,
  PlusCircle,
  ReceiptText,
  BarChart3,
  BrainCircuit,
  Settings,
  X,
  Sparkles,
  FileText,
  Presentation,
  Loader2,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'add-expense'
  | 'expenses'
  | 'analytics'
  | 'ml-assistant'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
  totalExpensesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  totalExpensesCount,
}) => {
  const [isDownloading, setIsDownloading] = useState<'pdf' | 'pptx' | null>(null);

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading('pdf');
      await downloadPdfReport();
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadPptx = async () => {
    try {
      setIsDownloading('pptx');
      await downloadPresentationPPTX();
    } finally {
      setIsDownloading(null);
    }
  };
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'add-expense' as NavTab,
      label: 'Add Expense',
      icon: PlusCircle,
      badge: undefined,
    },
    {
      id: 'expenses' as NavTab,
      label: 'Expenses',
      icon: ReceiptText,
      badge: totalExpensesCount > 0 ? totalExpensesCount.toString() : undefined,
    },
    {
      id: 'analytics' as NavTab,
      label: 'Analytics & Reports',
      icon: BarChart3,
      badge: undefined,
    },
    {
      id: 'ml-assistant' as NavTab,
      label: 'ML Assistant',
      icon: BrainCircuit,
      badge: 'ML',
      highlight: true,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings & Data',
      icon: Settings,
      badge: undefined,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-xs">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1">
                ExpenseAI
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800">
                  ML
                </span>
              </span>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Personal Expense Tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-indigo-700 text-white'
                        : item.highlight
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Academic Project Info Box */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100">
                Internship Deliverables
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Complete project documentation generated from live application metrics.
            </p>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloading !== null}
                className="py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-850 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                title="Download 20-page Technical PDF Report"
              >
                {isDownloading === 'pdf' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <FileText className="w-3 h-3" />
                )}
                <span>Report (PDF)</span>
              </button>

              <button
                onClick={handleDownloadPptx}
                disabled={isDownloading !== null}
                className="py-1.5 px-2 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-850 text-[10px] font-semibold text-purple-700 dark:text-purple-300 flex items-center justify-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                title="Download 14-slide 16:9 Presentation"
              >
                {isDownloading === 'pptx' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Presentation className="w-3 h-3" />
                )}
                <span>Slides (.pptx)</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
