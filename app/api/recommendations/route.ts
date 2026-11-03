import { NextRequest, NextResponse } from 'next/server';
import { recommendationEngine } from '@/lib/recommendations';
import { RecommendationRequest } from '@/types/travel';

/**
 * GET /api/recommendations - Get recommendations for a trip
 * Query params: destination, dates, budget, preferences
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const destination = searchParams.get('destination');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const budget = parseFloat(searchParams.get('budget') || '0');

    if (!destination || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required query parameters: destination, startDate, endDate',
        },
        { status: 400 }
      );
    }

    const req: RecommendationRequest = {
      destination,
      dates: { start: startDate, end: endDate },
      preferences: {
        travelStyle: 'comfort' as const,
        pace: 'moderate' as const,
        accommodationType: 'any' as const,
        transportationPreference: 'mixed' as const,
      },
      budget,
      currency: 'USD',
    };

    const recommendations = await recommendationEngine.getRecommendations(req);

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendations - Get recommendations with full preference object
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, dates, budget, currency, preferences } = body;

    if (!destination || !dates || !budget) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: destination, dates, budget',
        },
        { status: 400 }
      );
    }

    const req: RecommendationRequest = {
      destination,
      dates,
      budget,
      currency: currency || 'USD',
      preferences: preferences || {
        travelStyle: 'moderate',
        pace: 'moderate',
        accommodationType: 'any',
        transportationPreference: 'mixed',
      },
    };

    const recommendations = await recommendationEngine.getRecommendations(req);

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}