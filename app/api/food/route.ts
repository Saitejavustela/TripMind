import { NextRequest, NextResponse } from 'next/server';
import { foodEngine } from '@/lib/food-discovery';

/**
 * GET /api/food - Get restaurant recommendations
 * Query params: destination, cuisine, dietaryRestrictions, priceRange
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const destination = searchParams.get('destination');

    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'Destination is required' },
        { status: 400 }
      );
    }

    const discoveryReq = {
      destination,
      preferences: {
        cuisine: searchParams.get('cuisine')?.split(',') || undefined,
        dietaryRestrictions: searchParams.get('dietaryRestrictions')?.split(',') || undefined,
        priceRange: (searchParams.get('priceRange') as 'budget' | 'moderate' | 'expensive' | 'luxury') || undefined,
      },
    };

    const recommendations = foodEngine.getRecommendations(discoveryReq);
    const openRestaurants = foodEngine.getCurrentlyOpen(recommendations);

    return NextResponse.json({
      success: true,
      data: {
        all: recommendations,
        currentlyOpen: openRestaurants,
      },
    });
  } catch (error) {
    console.error('Error getting food recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get food recommendations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/food - Get recommendations with full parameters
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, preferences } = body;

    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'Destination is required' },
        { status: 400 }
      );
    }

    const discoveryReq = {
      destination,
      preferences: preferences || {},
    };

    const recommendations = foodEngine.getRecommendations(discoveryReq);

    // Get currently open restaurants
    const openRestaurants = foodEngine.getCurrentlyOpen(recommendations);

    return NextResponse.json({
      success: true,
      data: {
        all: recommendations,
        currentlyOpen: openRestaurants,
      },
    });
  } catch (error) {
    console.error('Error getting food recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get food recommendations' },
      { status: 500 }
    );
  }
}