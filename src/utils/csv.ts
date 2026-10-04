import { Expense, Category, CATEGORIES } from '../types/expense';

export interface CSVImportResult {
  success: boolean;
  imported: Expense[];
  errors: string[];
  totalRows: number;
}

/**
 * Escapes a cell for CSV formatting
 */
function escapeCSVCell(value: string | number | undefined): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports an array of expenses as a CSV file and triggers download.
 */
export function exportExpensesToCSV(expenses: Expense[]): void {
  const headers = ['id', 'date', 'description', 'amount', 'category'];
  const rows = expenses.map(e => [
    escapeCSVCell(e.id),
    escapeCSVCell(e.date),
    escapeCSVCell(e.description),
    escapeCSVCell(e.amount),
    escapeCSVCell(e.category)
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const now = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `personal_expenses_${now}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Robust CSV Line Parser handling quotes and commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses and validates CSV content for expenses
 */
export function parseAndValidateCSV(content: string, existingExpenses: Expense[] = []): CSVImportResult {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const errors: string[] = [];
  const imported: Expense[] = [];

  if (lines.length < 2) {
    return {
      success: false,
      imported: [],
      errors: ['The CSV file is empty or does not contain header and data rows.'],
      totalRows: 0
    };
  }

  // Parse header
  const headerCols = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/['"]/g, '').trim());
  const dateColIdx = headerCols.findIndex(h => h === 'date');
  const descColIdx = headerCols.findIndex(h => h === 'description' || h === 'desc');
  const amountColIdx = headerCols.findIndex(h => h === 'amount' || h === 'price' || h === 'cost');
  const catColIdx = headerCols.findIndex(h => h === 'category' || h === 'cat');
  const idColIdx = headerCols.findIndex(h => h === 'id');

  const missingHeaders: string[] = [];
  if (dateColIdx === -1) missingHeaders.push('date');
  if (descColIdx === -1) missingHeaders.push('description');
  if (amountColIdx === -1) missingHeaders.push('amount');
  if (catColIdx === -1) missingHeaders.push('category');

  if (missingHeaders.length > 0) {
    return {
      success: false,
      imported: [],
      errors: [`Missing required column headers: ${missingHeaders.join(', ')}. Expected: id,date,description,amount,category`],
      totalRows: lines.length - 1
    };
  }

  const validCategoriesMap = new Map<string, Category>();
  CATEGORIES.forEach(c => validCategoriesMap.set(c.toLowerCase(), c));

  const existingIds = new Set(existingExpenses.map(e => e.id));

  // Process data lines
  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1;
    const cols = parseCSVLine(lines[i]);
    
    // Ignore empty lines
    if (cols.length === 1 && cols[0] === '') continue;

    const rawDate = cols[dateColIdx];
    const rawDesc = cols[descColIdx];
    const rawAmount = cols[amountColIdx];
    const rawCat = cols[catColIdx];
    const rawId = idColIdx !== -1 ? cols[idColIdx] : '';

    // 1. Validate Date
    if (!rawDate) {
      errors.push(`Row ${rowNum}: Date is required.`);
      continue;
    }
    const parsedDate = new Date(rawDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push(`Row ${rowNum}: Invalid date format "${rawDate}". Use YYYY-MM-DD.`);
      continue;
    }
    // Normalize to YYYY-MM-DD
    const isoDate = rawDate.match(/^\d{4}-\d{2}-\d{2}$/) 
      ? rawDate 
      : parsedDate.toISOString().split('T')[0];

    // 2. Validate Description
    if (!rawDesc || rawDesc.trim().length === 0) {
      errors.push(`Row ${rowNum}: Description cannot be empty.`);
      continue;
    }

    // 3. Validate Amount
    const cleanAmountStr = rawAmount ? rawAmount.replace(/[₹,$\s]/g, '') : '';
    const numAmount = parseFloat(cleanAmountStr);
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.push(`Row ${rowNum}: Amount must be a positive number (found "${rawAmount}").`);
      continue;
    }

    // 4. Validate Category
    const normalizedCat = rawCat ? validCategoriesMap.get(rawCat.toLowerCase()) : undefined;
    if (!normalizedCat) {
      errors.push(`Row ${rowNum}: Invalid category "${rawCat}". Must be one of: ${CATEGORIES.join(', ')}.`);
      continue;
    }

    // 5. Generate or assign ID
    let finalId = rawId && rawId.trim() ? rawId.trim() : '';
    if (!finalId || existingIds.has(finalId)) {
      finalId = `exp-imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    }
    existingIds.add(finalId);

    imported.push({
      id: finalId,
      date: isoDate,
      description: rawDesc.trim(),
      amount: Math.round(numAmount * 100) / 100,
      category: normalizedCat,
      predictionSource: 'manual'
    });
  }

  return {
    success: imported.length > 0,
    imported,
    errors,
    totalRows: lines.length - 1
  };
}
