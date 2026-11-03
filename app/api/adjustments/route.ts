import { NextRequest, NextResponse } from 'next/server';
import { liveEngine } from '@/lib/live-adjustments';

/**
 * GET /api/adjustments - Get adjustments for a trip
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

    const adjustments = liveEngine.getUnresolvedAdjustments(tripId);
    const tripState = liveEngine.getTripState(tripId);

    return NextResponse.json({
      success: true,
      data: {
        adjustments,
        tripState,
      },
    });
  } catch (error) {
    console.error('Error getting adjustments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get adjustments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/adjustments - Record a new adjustment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tripId,
      type,
      title,
      description,
      severity,
      affectedArea,
      originalValue,
      newValue,
    } = body;

    if (!tripId || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: tripId, title' },
        { status: 400 }
      );
    }

    const adjustment = liveEngine.recordAdjustment({
      tripId,
      type,
      title,
      description: description || '',
      severity: severity || 'medium',
      affectedArea: affectedArea || 'itinerary',
      originalValue: originalValue || '',
      newValue: newValue || '',
    });

    return NextResponse.json({
      success: true,
      data: adjustment,
    });
  } catch (error) {
    console.error('Error recording adjustment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record adjustment' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/adjustments - Mark adjustment as resolved
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { adjustmentId, resolution } = body;

    if (!adjustmentId) {
      return NextResponse.json(
        { success: false, error: 'Adjustment ID is required' },
        { status: 400 }
      );
    }

    liveEngine.markResolved(adjustmentId, resolution || '');

    const adjustment = liveEngine.adjustments.find(
      (adj: any) => adj.id === adjustmentId
    );

    return NextResponse.json({
      success: true,
      data: adjustment,
    });
  } catch (error) {
    console.error('Error marking adjustment as resolved:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark adjustment as resolved' },
      { status: 500 }
    );
  }
}