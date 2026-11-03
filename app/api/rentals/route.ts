import { NextRequest, NextResponse } from 'next/server';
import { RentalRecommendationEngine } from '@/lib/rentals';

/**
 * GET /api/rentals - Get rental service recommendations
 * Query params: destination, vehicleType, pickupLocation, dates, duration
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const destination = searchParams.get('destination');
    const vehicleType = (searchParams.get('vehicleType') || 'car') as
      | 'car' | 'bike' | 'scooter' | 'bicycle' | 'camper-van';

    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'Destination is required' },
        { status: 400 }
      );
    }

    const recommendations = RentalRecommendationEngine.getRecommendations({
      destination,
      vehicleType,
      pickupLocation: searchParams.get('pickupLocation') || 'airport',
      dates: {
        pickup: searchParams.get('pickupDate') || '',
        return: searchParams.get('returnDate') || '',
      },
      duration: parseInt(searchParams.get('duration') || '1'),
    });

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Error getting rentals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get rental recommendations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rentals - Get recommendations with full parameters
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, vehicleType, pickupLocation, dates, duration, budget } = body;

    if (!destination || !dates || !dates.pickup || !dates.return) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: destination, dates' },
        { status: 400 }
      );
    }

    const recommendations = RentalRecommendationEngine.getRecommendations({
      destination,
      vehicleType: (vehicleType || 'car') as any,
      pickupLocation: pickupLocation || 'airport',
      dates: {
        pickup: dates.pickup,
        return: dates.return,
      },
      duration: duration || 1,
    });

    // Filter by budget if provided
    let filtered = recommendations;
    if (budget) {
      filtered = recommendations.filter(r => r.totalCost <= budget);
    }

    return NextResponse.json({
      success: true,
      data: filtered,
    });
  } catch (error) {
    console.error('Error getting rentals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get rental recommendations' },
      { status: 500 }
    );
  }
}