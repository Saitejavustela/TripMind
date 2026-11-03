import { NextRequest, NextResponse } from 'next/server';
import { getMockTripById, updateMockTrip, deleteMockTrip } from '@/lib/travel-data';

// GET /api/trips/[id] - Get a specific trip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const trip = getMockTripById(id);

  if (!trip) {
    return NextResponse.json(
      { success: false, error: 'Trip not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: trip });
}

// PUT /api/trips/[id] - Update a trip
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedTrip = updateMockTrip(id, body);

    if (!updatedTrip) {
      return NextResponse.json(
        { success: false, error: 'Trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTrip,
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/[id] - Delete a trip
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const success = deleteMockTrip(id);

  if (!success) {
    return NextResponse.json(
      { success: false, error: 'Trip not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { success: true, message: 'Trip deleted successfully' }
  );
}