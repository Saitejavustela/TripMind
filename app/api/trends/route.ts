import { NextRequest, NextResponse } from 'next/server';
import { trendEngine, type TrendAnalysisRequest } from '@/lib/trend-analysis';

/**
 * GET /api/trends - Get trending signals for a destination
 * Query params: destination, categories, radiusKm
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');
    const categoriesParam = searchParams.get('categories');
    const radiusKm = parseInt(searchParams.get('radiusKm') || '10');

    let categories: ('cafe' | 'restaurant' | 'attraction' | 'event' | 'activity')[] | undefined;

    if (categoriesParam) {
      categories = categoriesParam
        .split(',')
        .map((c) => c.trim() as ('cafe' | 'restaurant' | 'attraction' | 'event' | 'activity'))
        .filter((c) => c);
    }

    const trendReq: TrendAnalysisRequest = {
      destination: destination || '',
      radiusKm,
      categories,
    };

    const trends = trendEngine.getTrends(trendReq);
    const risingTrends = trendEngine.getRisingTrends(trendReq);
    const decliningTrends = trendEngine.getDecliningTrends(trendReq);

    return NextResponse.json({
      success: true,
      data: {
        allTrends: trends,
        risingTrends,
        decliningTrends,
        totalCount: trends.length,
        risingCount: risingTrends.length,
        decliningCount: decliningTrends.length,
      },
    });
  } catch (error) {
    console.error('Error getting trends:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get trend analysis' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trends - Get trends with full parameters
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, categories, radiusKm } = body;

    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'Destination is required' },
        { status: 400 }
      );
    }

    const trendReq: TrendAnalysisRequest = {
      destination,
      categories,
      radiusKm,
    };

    const trends = trendEngine.getTrends(trendReq);
    const risingTrends = trendEngine.getRisingTrends(trendReq);

    return NextResponse.json({
      success: true,
      data: {
        allTrends: trends,
        risingTrends,
        totalCount: trends.length,
        risingCount: risingTrends.length,
      },
    });
  } catch (error) {
    console.error('Error getting trends:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get trend analysis' },
      { status: 500 }
    );
  }
}