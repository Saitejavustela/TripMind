import { NextRequest, NextResponse } from 'next/server';
import { getMockTrips, createMockTrip } from '@/lib/travel-data';

// GET /api/trips - List all trips
export async function GET(request: NextRequest) {
  const trips = getMockTrips();
  return NextResponse.json({ success: true, data: trips });
}

// POST /api/trips - Create a new itinerary
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, destination, dates, budget, preferences } = body;

    if (!title || !destination || !dates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, destination, dates' },
        { status: 400 }
      );
    }

    const newTrip = createMockTrip({
      title,
      destination,
      dates,
      budget,
      preferences,
    });

    return NextResponse.json(
      { success: true, data: newTrip },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}