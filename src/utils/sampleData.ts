import { Expense } from '../types/expense';

export const INITIAL_SAMPLE_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    date: '2026-09-27',
    description: 'Lunch at college canteen with friends',
    amount: 180,
    category: 'Food',
    predictionSource: 'ml',
    confidence: 0.94
  },
  {
    id: 'exp-2',
    date: '2026-09-26',
    description: 'Uber cab ride to college campus',
    amount: 240,
    category: 'Transport',
    predictionSource: 'ml',
    confidence: 0.96
  },
  {
    id: 'exp-3',
    date: '2026-09-24',
    description: 'Monthly electricity bill payment state board',
    amount: 1450,
    category: 'Bills',
    predictionSource: 'ml',
    confidence: 0.98
  },
  {
    id: 'exp-4',
    date: '2026-09-22',
    description: 'Netflix 4K monthly streaming plan',
    amount: 649,
    category: 'Entertainment',
    predictionSource: 'ml',
    confidence: 0.95
  },
  {
    id: 'exp-5',
    date: '2026-09-20',
    description: 'Bought new running shoes from store',
    amount: 2899,
    category: 'Shopping',
    predictionSource: 'ml',
    confidence: 0.93
  },
  {
    id: 'exp-6',
    date: '2026-09-18',
    description: 'Python and Machine Learning course certificate',
    amount: 549,
    category: 'Education',
    predictionSource: 'ml',
    confidence: 0.96
  },
  {
    id: 'exp-7',
    date: '2026-09-15',
    description: 'Doctor consultation fee at clinic',
    amount: 500,
    category: 'Healthcare',
    predictionSource: 'ml',
    confidence: 0.97
  },
  {
    id: 'exp-8',
    date: '2026-09-12',
    description: 'Zomato weekend dinner biryani order',
    amount: 420,
    category: 'Food',
    predictionSource: 'ml',
    confidence: 0.95
  },
  {
    id: 'exp-9',
    date: '2026-09-10',
    description: 'Mobile 5G prepaid recharge',
    amount: 299,
    category: 'Bills',
    predictionSource: 'ml',
    confidence: 0.96
  },
  {
    id: 'exp-10',
    date: '2026-09-06',
    description: 'Petrol refill for bike',
    amount: 650,
    category: 'Transport',
    predictionSource: 'ml',
    confidence: 0.94
  },
  {
    id: 'exp-11',
    date: '2026-09-03',
    description: 'Birthday gift watch for friend',
    amount: 1200,
    category: 'Other',
    predictionSource: 'manual'
  },
  {
    id: 'exp-12',
    date: '2026-08-28',
    description: 'PVR cinema movie ticket and popcorn',
    amount: 480,
    category: 'Entertainment',
    predictionSource: 'ml',
    confidence: 0.92
  },
  {
    id: 'exp-13',
    date: '2026-08-22',
    description: 'Antibiotics and paracetamol medicine at pharmacy',
    amount: 320,
    category: 'Healthcare',
    predictionSource: 'ml',
    confidence: 0.95
  },
  {
    id: 'exp-14',
    date: '2026-08-16',
    description: 'College semester exam fee payment',
    amount: 1500,
    category: 'Education',
    predictionSource: 'ml',
    confidence: 0.98
  },
  {
    id: 'exp-15',
    date: '2026-08-10',
    description: 'Flipkart wireless earbuds sale',
    amount: 1799,
    category: 'Shopping',
    predictionSource: 'ml',
    confidence: 0.92
  },
  {
    id: 'exp-16',
    date: '2026-08-04',
    description: 'Jio fiber broadband wifi bill',
    amount: 825,
    category: 'Bills',
    predictionSource: 'ml',
    confidence: 0.97
  }
];
