import { NextRequest, NextResponse } from 'next/server';
import { destinationService, GLOBAL_DESTINATIONS } from '@/lib/destination-service';

/**
 * GET /api/destinations - Search destinations worldwide
 * Query params:
 *   q: search term (city, country, landmark)
 *   popular: 'true' to get popular destinations
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const isPopular = searchParams.get('popular') === 'true';

    if (isPopular && !query) {
      return NextResponse.json({
        success: true,
        data: GLOBAL_DESTINATIONS.slice(0, 12),
      });
    }

    const destinations = destinationService.search(query, 10);

    return NextResponse.json({
      success: true,
      data: destinations,
    });
  } catch (error) {
    console.error('Error searching destinations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search destinations' },
      { status: 500 }
    );
  }
}

