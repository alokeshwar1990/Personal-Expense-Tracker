import { useState, useEffect, useMemo, useCallback } from 'react';
import { Expense } from './types/expense';
import { loadExpenses, saveExpenses, clearExpenses, resetToDemoExpenses, getStoredTheme, saveStoredTheme } from './utils/storage';
import { computeExpenseStatistics } from './utils/statistics';
import { mlPipeline } from './ml/pipeline';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { AddExpensePage } from './pages/AddExpensePage';
import { ExpensesPage } from './pages/ExpensesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MLAssistantPage } from './pages/MLAssistantPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getStoredTheme());
  const [mlMetrics, setMlMetrics] = useState(() => mlPipeline.getMetrics());

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveStoredTheme(theme);
  }, [theme]);

  // Sync expenses with storage
  const updateAndPersistExpenses = useCallback((newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    saveExpenses(newExpenses);
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [newExpense, ...expenses];
    updateAndPersistExpenses(updated);
  };

  const handleUpdateExpense = (id: string, updatedData: Omit<Expense, 'id'>) => {
    const updated = expenses.map((item) =>
      item.id === id ? { ...updatedData, id } : item
    );
    updateAndPersistExpenses(updated);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((item) => item.id !== id);
    updateAndPersistExpenses(updated);
  };

  const handleImportExpenses = (importedList: Expense[]) => {
    const updated = [...importedList, ...expenses];
    updateAndPersistExpenses(updated);
  };

  const handleResetDemo = () => {
    const demo = resetToDemoExpenses();
    setExpenses(demo);
  };

  const handleClearAll = () => {
    clearExpenses();
    setExpenses([]);
  };

  // Compute live statistics whenever expenses change
  const stats = useMemo(() => {
    return computeExpenseStatistics(expenses);
  }, [expenses]);

  return (
    <div className="min-h-screen bg-zinc-100/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors antialiased flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSidebarOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        totalExpensesCount={expenses.length}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onToggleMobileNav={() => setSidebarOpen((prev) => !prev)}
          onNavigateAdd={() => setCurrentTab('add-expense')}
          accuracy={mlMetrics.validationAccuracy}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              expenses={expenses}
              stats={stats}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onQuickAdd={() => setCurrentTab('add-expense')}
            />
          )}

          {currentTab === 'add-expense' && (
            <AddExpensePage
              onAddExpense={handleAddExpense}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesPage
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              onImportExpenses={handleImportExpenses}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage stats={stats} />
          )}

          {currentTab === 'ml-assistant' && (
            <MLAssistantPage />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              expenses={expenses}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onResetDemo={handleResetDemo}
              onClearAll={handleClearAll}
              onImportExpenses={handleImportExpenses}
            />
          )}
        </main>
      </div>
    </div>
  );
}
