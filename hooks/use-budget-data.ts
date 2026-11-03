'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook for budget calculation
 */
export function useBudgetCalculation(total: number, preferences: any = {}) {
  const [allocation, setAllocation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async () => {
    if (!total || total <= 0) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total, preferences }),
      });
      const result = await response.json();
      if (result.success) {
        setAllocation(result.data);
      } else {
        throw new Error(result.error || 'Failed to calculate budget');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate budget';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [total, JSON.stringify(preferences)]);

  return { allocation, isLoading, error, recalculate: calculate };
}

/**
 * Custom hook for expense tracking
 */
export function useExpenses(tripId: string) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState({ total: 0, byCategory: {}, count: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    if (!tripId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/expenses?tripId=${tripId}`);
      const result = await response.json();
      if (result.success) {
        setExpenses(result.data.expenses);
        setSummary(result.data.summary);
      } else {
        throw new Error(result.error || 'Failed to fetch expenses');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch expenses';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [tripId]);

  const addExpense = async (expenseData: {
    amount: number;
    category: string;
    description: string;
    date?: string;
    currency?: string;
  }) => {
    if (!tripId) throw new Error('Trip ID is required');

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, ...expenseData }),
      });
      const result = await response.json();
      if (result.success) {
        // Update local state optimistically
        setExpenses([result.data, ...expenses]);
        fetchExpenses(); // Refresh summary
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to add expense');
      }
    } catch (err) {
      throw err;
    }
  };

  return {
    expenses,
    summary,
    isLoading,
    error,
    addExpense,
    refetch: fetchExpenses,
  };
}