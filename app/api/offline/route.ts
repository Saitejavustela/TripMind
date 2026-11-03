import { NextRequest, NextResponse } from 'next/server';
import { offlinePackager } from '@/lib/offline-packager';
import { getMockTripById } from '@/lib/travel-data';

/**
 * GET /api/offline - Download or retrieve an offline travel package
 * Query params: tripId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId') || 'paris-summer';

    const trip = getMockTripById(tripId);

    const bundle = offlinePackager.createOfflineBundle({
      tripId,
      title: trip?.title || 'Paris Summer Escape',
      destination: trip?.destination || 'Paris, France',
      startDate: trip?.dates.start || '2026-07-15',
      endDate: trip?.dates.end || '2026-07-22',
    });

    return NextResponse.json({
      success: true,
      data: bundle,
    });
  } catch (error) {
    console.error('Error generating offline bundle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate offline bundle' },
      { status: 500 }
    );
  }
}
