import { NextRequest, NextResponse } from 'next/server';
import { WeatherService } from '@/lib/weather-service';

/**
 * GET /api/weather - Get weather forecast and plan for a trip
 * Query params: tripId, destination, startDate, endDate
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');
    const destination = searchParams.get('destination');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!tripId || !destination || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Trip ID, destination, and date range are required' },
        { status: 400 }
      );
    }

    const dates = { start: startDate, end: endDate };
    const weatherPlan = await WeatherService.generateWeatherPlan(
      tripId,
      destination,
      dates
    );

    return NextResponse.json({
      success: true,
      data: weatherPlan,
    });
  } catch (error) {
    console.error('Error getting weather data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get weather data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/weather - Record a weather-related adjustment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, adjustment } = body;

    if (!tripId || !adjustment) {
      return NextResponse.json(
        { success: false, error: 'Trip ID and adjustment data are required' },
        { status: 400 }
      );
    }

    // In a real app, this would record the adjustment in the live adjustments system
    // For now, we'll just confirm receipt
    return NextResponse.json({
      success: true,
      data: { recorded: true },
    });
  } catch (error) {
    console.error('Error recording weather adjustment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record weather adjustment' },
      { status: 500 }
    );
  }
}