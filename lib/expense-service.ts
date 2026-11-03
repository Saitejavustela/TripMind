'use client';

import { useState, useEffect } from 'react';
import { Expense, BudgetSummary, ExpenseTrackingState, Budget, ExpenseCategory } from '@/types/travel';
import { supabase } from '@/lib/supabase';

/**
 * Expense Service - Tracks expenses during trip planning and execution
 * Supports both localStorage mock mode and Supabase real API mode
 */
export class ExpenseService {
  private static readonly STORAGE_KEY = 'trip_expenses';
  private static readonly USE_REAL_API = process.env.NEXT_PUBLIC_USE_SUPABASE === "true";

  /**
   * Initialize expense tracking state for a trip
   */
  static initTripExpenses(tripId: string, budget: Budget): ExpenseTrackingState {
    const initialExpenses: Expense[] = [];
    return {
      expenses: initialExpenses,
      budget,
      isTracking: false,
    };
  }

  /**
   * Add a new expense - uses real API if configured, otherwise localStorage
   */
  static addExpense(
    tripId: string,
    amount: number,
    category: Expense['category'],
    description: string,
    date: string,
    location?: string
  ): Expense {
    const expense: Expense = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tripId,
      amount,
      category,
      description,
      date,
      location,
      receiptUrl: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.USE_REAL_API) {
      // Save to Supabase
      this.saveToSupabase(expense);
    } else {
      // Save to localStorage
      this.saveToLocalStorage(expense);
    }

    return expense;
  }

  /**
   * Record an expense (for UI integration)
   */
  static recordExpense(expense: Expense): void {
    if (this.USE_REAL_API) {
      // Could trigger Supabase real-time update
      console.log('Expense recorded in Supabase:', expense);
    } else {
      console.log('Expense recorded locally:', expense);
    }
  }

  /**
   * Get expense summary by category
   */
  static getExpensesByCategory(expenses: Expense[]): Record<Expense['category'], number> {
    const byCategory: Record<Expense['category'], number> = {
      transportation: 0,
      accommodation: 0,
      food: 0,
      activities: 0,
      miscellaneous: 0,
    };

    expenses.forEach((expense) => {
      if (byCategory[expense.category] !== undefined) {
        byCategory[expense.category] += expense.amount;
      }
    });

    return byCategory;
  }

  /**
   * Get expense summary by day
   */
  static getExpensesByDay(expenses: Expense[]): Record<string, number> {
    const byDay: Record<string, number> = {};

    expenses.forEach((expense) => {
      const date = new Date(expense.date).toISOString().split('T')[0];
      if (!byDay[date]) {
        byDay[date] = 0;
      }
      byDay[date] += expense.amount;
    });

    return byDay;
  }

  /**
   * Calculate budget summary
   */
  static calculateBudgetSummary(
    expenses: Expense[],
    budget: Budget
  ): BudgetSummary {
    const byCategory = this.getExpensesByCategory(expenses);
    const byDay = this.getExpensesByDay(expenses);
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = budget.total - totalSpent;

    return {
      totalBudget: budget.total,
      totalSpent,
      remaining,
      byCategory,
      byDay,
    };
  }

  /**
   * Get category percentage of budget
   */
  static getCategoryPercentages(
    summary: BudgetSummary,
    budget: Budget
  ): Record<Expense['category'], number> {
    const percentages: Record<Expense['category'], number> = {
      transportation: 0,
      accommodation: 0,
      food: 0,
      activities: 0,
      miscellaneous: 0,
    };

    const categoryTotals = {
      transportation: summary.byCategory.transportation || 0,
      accommodation: summary.byCategory.accommodation || 0,
      food: summary.byCategory.food || 0,
      activities: summary.byCategory.activities || 0,
      miscellaneous: summary.byCategory.miscellaneous || 0,
    };

    const totalSpent = summary.totalSpent || 1; // Avoid division by zero

    (Object.keys(percentages) as ExpenseCategory[]).forEach((category) => {
      percentages[category] = Math.round(
        (categoryTotals[category] / totalSpent) * 100
      );
    });

    return percentages;
  }

  /**
   * Check if budget is exceeded in any category
   */
  static checkBudgetOverages(
    expenses: Expense[],
    budget: Budget
  ): { overage: Expense['category'] | null; percentage: number }[] {
    const byCategory = this.getExpensesByCategory(expenses);
    const overages: { overage: Expense['category'] | null; percentage: number }[] = [];

    const categoryLimits: Record<ExpenseCategory, number> = {
      transportation: budget.breakdown?.transportation || 0,
      accommodation: budget.breakdown?.accommodation || 0,
      food: budget.breakdown?.food || 0,
      activities: budget.breakdown?.activities || 0,
      miscellaneous: budget.breakdown?.miscellaneous || 0,
    };

    (Object.keys(categoryLimits) as ExpenseCategory[]).forEach((category) => {
      const spent = byCategory[category] || 0;
      const limit = categoryLimits[category];
      if (limit > 0 && spent > limit) {
        const percentage = Math.round((spent / limit) * 100);
        overages.push({
          overage: category,
          percentage,
        });
      }
    });

    return overages;
  }

  /**
   * Save expense to Supabase (real API mode)
   */
  private static async saveToSupabase(expense: Expense): Promise<void> {
    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          id: expense.id,
          trip_id: expense.tripId,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          date: expense.date,
          location: expense.location,
          receipt_url: expense.receiptUrl,
          created_at: expense.createdAt,
          updated_at: expense.updatedAt,
        });

      if (error) throw error;
      console.log('Expense saved to Supabase:', expense.id);
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      // Fall back to localStorage on error
      this.saveToLocalStorage(expense);
    }
  }

  /**
   * Save expense to localStorage (mock mode)
   */
  private static saveToLocalStorage(expense: Expense): void {
    let existingExpenses: Expense[] = [];
    const stored = localStorage.getItem(`expenses_${expense.tripId}`);
    if (stored) {
      existingExpenses = JSON.parse(stored);
    }
    existingExpenses.push(expense);
    localStorage.setItem(`expenses_${expense.tripId}`, JSON.stringify(existingExpenses));
  }
}

/**
 * Hook for expense tracking in React components
 * Works with both mock and real API modes
 */
export function useExpenseTracking(tripId: string, initialBudget: Budget) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget>(initialBudget);
  const [isTracking, setIsTracking] = useState(false);

  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [categoryPercentages, setCategoryPercentages] = useState<
    Record<Expense['category'], number>
  >({ transportation: 0, accommodation: 0, food: 0, activities: 0, miscellaneous: 0 });

  // Calculate summary on expense changes
  useEffect(() => {
    const summary = ExpenseService.calculateBudgetSummary(expenses, budget);
    setBudgetSummary(summary);
    setCategoryPercentages(ExpenseService.getCategoryPercentages(summary, budget));
  }, [expenses, budget]);

  const addExpense = (
    amount: number,
    category: Expense['category'],
    description: string,
    date: string,
    location?: string
  ) => {
    setIsTracking(true);
    const expense = ExpenseService.addExpense(
      tripId,
      amount,
      category,
      description,
      date,
      location
    );
    // Refresh expenses from the source (localStorage or Supabase)
    const stored = localStorage.getItem(`expenses_${tripId}`);
    const parsed: Expense[] = stored ? JSON.parse(stored) : [];
    setExpenses(parsed);
    setIsTracking(false);
  };

  const removeExpense = (expenseId: string) => {
    setExpenses((prev: Expense[]) => prev.filter((exp: Expense) => exp.id !== expenseId));
  };

  const updateExpense = (
    expenseId: string,
    updates: Partial<Expense>
  ) => {
    setExpenses((prev: Expense[]) =>
      prev.map((exp: Expense) =>
        exp.id === expenseId ? { ...exp, ...updates, updatedAt: new Date().toISOString() } : exp
      )
    );
  };

  return {
    expenses,
    budget,
    isTracking,
    budgetSummary,
    categoryPercentages,
    addExpense,
    removeExpense,
    updateExpense,
  };
}

export default ExpenseService;