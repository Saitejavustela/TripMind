'use client';

import React, { useState, useEffect } from 'react';
import { useTrip } from '@/hooks/use-trip-data';
import { expenseTracker } from '@/lib/budget';

interface BudgetDashboardProps {
  tripId: string;
}

/**
 * Budget Dashboard - Displays budget allocation and expense tracking
 */
export default function BudgetDashboard({ tripId }: BudgetDashboardProps) {
  const { trip, isLoading, error } = useTrip(tripId);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [summary, setSummary] = useState({ total: 0, byCategory: {}, count: 0 });
  const [remaining, setRemaining] = useState({
    allocated: 0,
    spent: 0,
    remaining: 0,
    percentageUsed: 0,
  });

  useEffect(() => {
    fetchExpenses();
  }, [tripId]);

  const fetchExpenses = async () => {
    setIsLoadingExpenses(true);
    try {
      const tripExpenses = expenseTracker.getExpenses(tripId);
      setExpenses(tripExpenses);

      const expenseSummary = expenseTracker.getSummary(tripId);
      setSummary(expenseSummary);

      if (trip?.budget) {
        const remainingBudget = expenseTracker.getRemainingBudget(tripId, trip.budget.total);
        setRemaining(remainingBudget);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  if (isLoading) return <div>Loading trip data...</div>;
  if (isLoadingExpenses) return <div>Loading expenses...</div>;
  if (!trip) return <div>Trip not found</div>;
  if (!trip.budget) return <div className="p-4 text-gray-500">No budget configured for this trip</div>;

  const totalBudget = trip.budget.total;
  const duration = trip.itinerary?.duration || 1;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: trip.budget?.currency || 'USD',
  }).format(amount);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Budget Overview</h2>

      {/* Budget Allocation */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Budget Allocation</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Total Budget</p>
            <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Daily Average</p>
            <p className="text-2xl font-bold">
              {formatCurrency(totalBudget / duration)}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-lg font-medium mb-2">Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(trip.budget.breakdown || {}).map(([category, amount]) => (
              <div key={category} className="flex justify-between text-sm">
                <span>{category.charAt(0).toUpperCase() + category.slice(1)}:</span>
                <span>{formatCurrency(amount)} ({((amount / Math.max(1, totalBudget)) * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expense Tracking */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Expense Tracking</h3>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(remaining.spent)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className="text-xl font-bold {remaining.remaining >= 0 ? 'text-green-600' : 'text-red-600'}">
                {formatCurrency(remaining.remaining)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Percentage Used</p>
              <p className="text-xl font-bold {remaining.percentageUsed <= 80 ? 'text-green-600' : remaining.percentageUsed <= 95 ? 'text-yellow-600' : 'text-red-600'}">
                {remaining.percentageUsed.toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Expenses Count</p>
              <p className="text-xl font-bold">{summary.count}</p>
            </div>
          </div>
        </div>

        {/* Expense List */}
        {expenses.length > 0 ? (
          <div className="mt-4">
            <h4 className="text-lg font-medium mb-3">Recent Expenses</h4>
            <div className="space-y-3">
              {expenses.slice(-5).reverse().map((exp) => (
                <div key={exp.id} className="p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{exp.description}</p>
                      <p className="text-sm text-gray-500">{exp.category} • {new Date(exp.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(exp.amount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No expenses recorded yet</p>
        )}
      </div>

      {/* Add Expense Button */}
      <div className="mt-6">
        <button
          onClick={() => alert('Expense form would open here in a full implementation')}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Expense
        </button>
      </div>
    </div>
  );
}