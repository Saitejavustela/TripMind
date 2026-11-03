import { NextRequest, NextResponse } from 'next/server';
import { ExpenseService } from '@/lib/expense-service';
import type { Expense, Budget, BudgetSummary } from '@/types/travel';

/**
 * GET /api/expenses - Get expenses for a trip
 * Query param: tripId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');

    if (!tripId) {
      return NextResponse.json(
        { success: false, error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    // In a real app, this would fetch from database
    // For now, return mock data or empty state
    const expenses: Expense[] = [];
    // Try to get from localStorage or session
    // const stored = localStorage.getItem(`expenses_${tripId}`);
    // const parsed = stored ? JSON.parse(stored) : [];

    return NextResponse.json({
      success: true,
      data: {
        expenses,
        // budget: storedBudget,
      },
    });
  } catch (error) {
    console.error('Error getting expenses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get expenses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/expenses - Add a new expense
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, amount, category, description, date, location } = body;

    if (!tripId || !amount || !category || !description || !date) {
      return NextResponse.json(
        { success: false, error: 'Missing required expense fields' },
        { status: 400 }
      );
    }

    const expense = ExpenseService.addExpense(
      tripId,
      amount,
      category,
      description,
      date,
      location
    );

    // In a real app, this would save to database
    // localStorage.setItem(`expenses_${tripId}`, JSON.stringify([...existingExpenses, expense]));

    return NextResponse.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add expense' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/expenses - Update an existing expense
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { expenseId, updates } = body;

    if (!expenseId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Expense ID and updates are required' },
        { status: 400 }
      );
    }

    // In a real app, this would update in database
    // const updated = ExpenseService.updateExpense(expenseId, updates);

    return NextResponse.json({
      success: true,
      data: { updated: true },
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/expenses/summary - Get budget summary for a trip
 * Query param: tripId
 */
export async function GET_summary(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');

    if (!tripId) {
      return NextResponse.json(
        { success: false, error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    // In a real app, this would fetch expenses and budget from database
    // const expenses = await ExpenseService.getExpenses(tripId);
    // const budget = await ExpenseService.getBudget(tripId);

    // For now, return empty summary
    const summary: BudgetSummary = {
      totalBudget: 0,
      totalSpent: 0,
      remaining: 0,
      byCategory: {
        transportation: 0,
        accommodation: 0,
        food: 0,
        activities: 0,
        miscellaneous: 0,
      },
      byDay: {},
    };

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error getting expense summary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get expense summary' },
      { status: 500 }
    );
  }
}