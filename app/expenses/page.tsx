'use client';

import React from 'react';
import { useExpenseTracking } from '@/lib/expense-service';
import type { Expense, Budget } from '@/types/travel';

const DEFAULT_BUDGET: Budget = {
  total: 2500,
  currency: 'USD',
  breakdown: {
    accommodation: 1000,
    food: 600,
    activities: 400,
    transportation: 300,
    miscellaneous: 200,
  },
};

interface ExpensesPageProps {
  tripId?: string;
  initialBudget?: Budget;
}

export default function ExpensesPage({
  tripId = 'paris-summer',
  initialBudget = DEFAULT_BUDGET,
}: ExpensesPageProps) {
  const {
    expenses,
    isTracking,
    budgetSummary,
    categoryPercentages,
    addExpense,
    removeExpense,
  } = useExpenseTracking(tripId, initialBudget);

  if (isTracking) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Saving Expense...</h2>
        <p className="text-gray-600">Please wait while your expense is saved.</p>
        <div className="animate-spin h-6 w-6 mx-auto my-4 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Expense Tracking</h1>
        <p className="text-gray-600 mt-1">Track and manage expenses across your trip itinerary</p>
      </header>

      {/* Budget Summary */}
      {budgetSummary && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Budget Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${budgetSummary.totalBudget.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Spent</p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  budgetSummary.totalSpent > budgetSummary.totalBudget
                    ? 'text-red-500'
                    : 'text-gray-900'
                }`}
              >
                ${budgetSummary.totalSpent.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Remaining</p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  budgetSummary.remaining >= 0 ? 'text-green-600' : 'text-red-500'
                }`}
              >
                ${budgetSummary.remaining.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Usage</span>
              <span>
                {Math.min(
                  100,
                  Math.round((budgetSummary.totalSpent / Math.max(1, budgetSummary.totalBudget)) * 100)
                )}
                %
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  budgetSummary.remaining >= 0 ? 'bg-blue-600' : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((budgetSummary.totalSpent / Math.max(1, budgetSummary.totalBudget)) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {budgetSummary && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Spending by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 font-medium">Transportation</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                ${budgetSummary.byCategory.transportation.toLocaleString()}
              </p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(100, categoryPercentages.transportation)}%` }}
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 font-medium">Accommodation</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                ${budgetSummary.byCategory.accommodation.toLocaleString()}
              </p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${Math.min(100, categoryPercentages.accommodation)}%` }}
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 font-medium">Food</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                ${budgetSummary.byCategory.food.toLocaleString()}
              </p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${Math.min(100, categoryPercentages.food)}%` }}
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 font-medium">Activities</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                ${budgetSummary.byCategory.activities.toLocaleString()}
              </p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, categoryPercentages.activities)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Form */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Expense</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            const amount = parseFloat(formData.get('amount') as string);
            const category = formData.get('category') as Expense['category'];
            const description = formData.get('description') as string;
            const date = formData.get('date') as string;

            if (amount > 0 && category && description) {
              addExpense(
                amount,
                category,
                description,
                date || new Date().toISOString().split('T')[0]
              );
              form.reset();
            }
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Category</label>
              <select
                name="category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="food">Food & Dining</option>
                <option value="accommodation">Accommodation</option>
                <option value="transportation">Transportation</option>
                <option value="activities">Activities & Sightseeing</option>
                <option value="miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
              <input
                type="text"
                name="description"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="e.g. Lunch at Le Bistro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            Add Expense
          </button>
        </form>
      </section>

      {/* Expense List */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recorded Expenses</h2>
        {expenses.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No expenses recorded yet. Use the form above to add your first expense.</p>
        ) : (
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {expenses.map((expense: Expense) => (
              <div
                key={expense.id}
                className="py-3 flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">{expense.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(expense.date).toLocaleDateString()} • {expense.category}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">
                    ${expense.amount.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExpense(expense.id)}
                    className="text-gray-400 hover:text-red-500 text-xs px-1"
                    title="Remove expense"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
