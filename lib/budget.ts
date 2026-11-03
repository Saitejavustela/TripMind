import { Trip } from '@/types/travel';

/**
 * Budget Calculator - Calculates optimal budget allocation based on trip duration,
 * preferences, and destination cost index
 */
export class BudgetCalculator {
  private static costIndex: Record<string, number> = {
    'Paris': 1.2,
    'Tokyo': 1.3,
    'Rome': 1.1,
    'Bangkok': 0.8,
    'Bali': 0.7,
    'New York': 1.4,
    'London': 1.3,
    'default': 1.0,
  };

  private static getDestinationCostIndex(destination: string): number {
    const city = destination.split(',')[0].trim();
    return BudgetCalculator.costIndex[city] || BudgetCalculator.costIndex.default;
  }

  /**
   * Calculate budget allocation based on travel style
   * Percentages vary by travel style:
   * - Budget: 50% accommodation, 25% food, 15% transport, 10% activities
   * - Moderate: 40% accommodation, 30% food, 15% transport, 15% activities
   * - Luxury: 30% accommodation, 20% food, 10% transport, 40% activities
   */
  static calculateAllocation(total: number, preferences: any = {}) {
    const { travelStyle = 'moderate' } = preferences;
    const days = preferences.tripDuration || 7;

    // Base allocation percentages by travel style
    const allocations: Record<string, {
      transportation: number;
      accommodation: number;
      food: number;
      activities: number;
      miscellaneous: number;
    }> = {
      budget: {
        transportation: 0.15,
        accommodation: 0.50,
        food: 0.25,
        activities: 0.10,
        miscellaneous: 0.00,
      },
      moderate: {
        transportation: 0.15,
        accommodation: 0.40,
        food: 0.30,
        activities: 0.15,
        miscellaneous: 0.00,
      },
      luxury: {
        transportation: 0.10,
        accommodation: 0.30,
        food: 0.20,
        activities: 0.40,
        miscellaneous: 0.00,
      },
    };

    const allocation = allocations[travelStyle] || allocations.moderate;

    // Calculate amounts
    const breakdown = {
      transportation: total * allocation.transportation,
      accommodation: total * allocation.accommodation,
      food: total * allocation.food,
      activities: total * allocation.activities,
      miscellaneous: total * allocation.miscellaneous,
    };

    // Adjust for destination cost
    const costIndex = this.getDestinationCostIndex(preferences.destination || 'default');
    const adjusted = {
      transportation: breakdown.transportation * costIndex,
      accommodation: breakdown.accommodation * costIndex,
      food: breakdown.food * costIndex,
      activities: breakdown.activities * costIndex,
      miscellaneous: breakdown.miscellaneous * costIndex,
    };

    // Recalculate total to maintain original budget
    const adjustedTotal = Object.values(adjusted).reduce((sum, val) => sum + val, 0);
    const scaleFactor = total / adjustedTotal;

    const finalBreakdown = {
      transportation: adjusted.transportation * scaleFactor,
      accommodation: adjusted.accommodation * scaleFactor,
      food: adjusted.food * scaleFactor,
      activities: adjusted.activities * scaleFactor,
      miscellaneous: adjusted.miscellaneous * scaleFactor,
    };

    const daily = {
      transportation: finalBreakdown.transportation / days,
      accommodation: finalBreakdown.accommodation / days,
      food: finalBreakdown.food / days,
      activities: finalBreakdown.activities / days,
      miscellaneous: finalBreakdown.miscellaneous / days,
    };

    return {
      total,
      daily,
      breakdown: finalBreakdown,
      percentages: {
        transportation: (finalBreakdown.transportation / total) * 100,
        accommodation: (finalBreakdown.accommodation / total) * 100,
        food: (finalBreakdown.food / total) * 100,
        activities: (finalBreakdown.activities / total) * 100,
        miscellaneous: (finalBreakdown.miscellaneous / total) * 100,
      },
      destinationCostIndex: costIndex,
    };
  }
}

/**
 * Expense Tracker - Tracks expenses during the trip
 */
export class ExpenseTracker {
  private static expenses: Record<string, any[]> = {}; // tripId -> expenses

  addExpense(expense: {
    tripId: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    currency?: string;
  }) {
    return ExpenseTracker.addExpense(expense);
  }

  getExpenses(tripId: string) {
    return ExpenseTracker.getExpenses(tripId);
  }

  getSummary(tripId: string) {
    return ExpenseTracker.getSummary(tripId);
  }

  getRemainingBudget(tripId: string, allocatedBudget: number) {
    return ExpenseTracker.getRemainingBudget(tripId, allocatedBudget);
  }

  clearExpenses(tripId: string) {
    return ExpenseTracker.clearExpenses(tripId);
  }

  /**
   * Add an expense for a trip
   */
  static addExpense(expense: {
    tripId: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    currency?: string;
  }) {
    if (!this.expenses[expense.tripId]) {
      this.expenses[expense.tripId] = [];
    }

    const newExpense = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...expense,
    };

    this.expenses[expense.tripId].push(newExpense);
    return newExpense;
  }

  /**
   * Get all expenses for a trip
   */
  static getExpenses(tripId: string) {
    return this.expenses[tripId] || [];
  }

  /**
   * Get expense summary for a trip
   */
  static getSummary(tripId: string) {
    const expenses = this.getExpenses(tripId);

    const summary = expenses.reduce((acc, exp) => {
      acc.total += exp.amount;
      acc.byCategory[exp.category] = (acc.byCategory[exp.category] || 0) + exp.amount;
      return acc;
    }, { total: 0, byCategory: {} as Record<string, number> });

    return {
      total: summary.total,
      byCategory: summary.byCategory,
      count: expenses.length,
    };
  }

  /**
   * Get remaining budget for a trip
   */
  static getRemainingBudget(tripId: string, allocatedBudget: number) {
    const summary = this.getSummary(tripId);
    return {
      allocated: allocatedBudget,
      spent: summary.total,
      remaining: allocatedBudget - summary.total,
      percentageUsed: (summary.total / allocatedBudget) * 100,
    };
  }

  /**
   * Clear all expenses for a trip (for testing)
   */
  static clearExpenses(tripId: string) {
    delete this.expenses[tripId];
  }
}

export const budgetCalculator = new BudgetCalculator();
export const expenseTracker = new ExpenseTracker();