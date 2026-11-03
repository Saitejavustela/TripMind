import { NextRequest, NextResponse } from 'next/server';
import { BudgetCalculator, ExpenseTracker } from '@/lib/budget';

/**
 * GET /api/budget - Calculate budget allocation
 * Query params: total, preferences
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const total = parseFloat(searchParams.get('total') || '0');
    const preferences = {
      travelStyle: searchParams.get('travelStyle') || 'moderate',
      accommodationType: searchParams.get('accommodationType') || 'any',
    };

    if (!total || total <= 0) {
      return NextResponse.json(
        { success: false, error: 'Total budget amount is required' },
        { status: 400 }
      );
    }

    const budgetAllocation = BudgetCalculator.calculateAllocation(total, preferences);

    return NextResponse.json({
      success: true,
      data: budgetAllocation,
    });
  } catch (error) {
    console.error('Budget calculation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate budget' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/budget/calculate - Calculate budget with detailed preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { total, tripDuration, preferences } = body;

    if (!total || total <= 0) {
      return NextResponse.json(
        { success: false, error: 'Total budget amount is required' },
        { status: 400 }
      );
    }

    const budgetAllocation = BudgetCalculator.calculateAllocation(total, preferences);

    return NextResponse.json({
      success: true,
      data: budgetAllocation,
    });
  } catch (error) {
    console.error('Budget calculation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate budget' },
      { status: 500 }
    );
  }
}