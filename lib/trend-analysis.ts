export interface TrendSignal {
  id: string;
  title: string;
  description: string;
  category: 'cafe' | 'restaurant' | 'attraction' | 'event' | 'activity';
  location: [number, number]; // [lat, lng]
  popularityScore: number; // 0-100
  trendDirection: 'rising' | 'stable' | 'declining';
  source: 'social-media' | 'local-reports' | 'user-generated';
  discoveredAt: string;
  imageUrl?: string;
  hashtag?: string;
  engagementMetrics?: {
    likes: number;
    shares: number;
    comments: number;
    views: number;
  };
}

export interface TrendAnalysisRequest {
  destination: string;
  radiusKm?: number; // Search radius from center point
  categories?: ('cafe' | 'restaurant' | 'attraction' | 'event' | 'activity')[];
}

/**
 * Social Media Trend Analysis Engine - Identifies trending experiences,
 * cafes, restaurants, and activities based on social media signals
 */
export class TrendAnalysisEngine {
  private static trendDatabase: TrendSignal[] = [
    {
      id: 'trend-1',
      title: 'Rooftop Coffee Bar',
      description: 'Newly opened rooftop cafe with panoramic city views, viral on Instagram',
      category: 'cafe',
      location: [48.8606, 2.3376],
      popularityScore: 87,
      trendDirection: 'rising',
      source: 'social-media',
      discoveredAt: '2026-08-15',
      imageUrl: '/images/trend-1.jpg',
      hashtag: '#ParisRooftopCafe',
      engagementMetrics: { likes: 2847, shares: 512, comments: 189, views: 12456 },
    },
    {
      id: 'trend-2',
      title: 'Hidden Garden Restaurant',
      description: 'Secret garden restaurant serving organic French cuisine, featured in travel blogs',
      category: 'restaurant',
      location: [48.8456, 2.3234],
      popularityScore: 73,
      trendDirection: 'rising',
      source: 'local-reports',
      discoveredAt: '2026-08-10',
      imageUrl: '/images/trend-2.jpg',
      hashtag: '#HiddenGardenParis',
      engagementMetrics: { likes: 1562, shares: 342, comments: 97, views: 8934 },
    },
    {
      id: 'trend-3',
      title: 'Sunset Photo Spot',
      description: 'Best location for sunset photography, trending on TikTok travel community',
      category: 'activity',
      location: [48.8738, 2.2916],
      popularityScore: 92,
      trendDirection: 'rising',
      source: 'social-media',
      discoveredAt: '2026-08-14',
      imageUrl: '/images/trend-3.jpg',
      hashtag: '#ParisSunset',
      engagementMetrics: { likes: 5213, shares: 894, comments: 312, views: 45678 },
    },
    {
      id: 'trend-4',
      title: 'Vintage Market',
      description: 'Weekly vintage market with local designers, trending on Twitter',
      category: 'event',
      location: [48.8722, 2.2952],
      popularityScore: 65,
      trendDirection: 'stable',
      source: 'social-media',
      discoveredAt: '2026-08-12',
      imageUrl: '/images/trend-4.jpg',
      hashtag: '#ParisVintage',
      engagementMetrics: { likes: 892, shares: 213, comments: 67, views: 3456 },
    },
    {
      id: 'trend-5',
      title: 'Underground Jazz Club',
      description: 'Intimate jazz club with live performances, trending on local forums',
      category: 'event',
      location: [48.8534, 2.3488],
      popularityScore: 58,
      trendDirection: 'declining',
      source: 'local-reports',
      discoveredAt: '2026-08-08',
      imageUrl: '/images/trend-5.jpg',
      hashtag: '#ParisJazzClub',
      engagementMetrics: { likes: 421, shares: 89, comments: 34, views: 1234 },
    },
    {
      id: 'trend-6',
      title: 'Street Art Tour',
      description: 'Self-guided street art tour, featured on TikTok "hidden gems" series',
      category: 'activity',
      location: [48.8606, 2.3522],
      popularityScore: 79,
      trendDirection: 'rising',
      source: 'social-media',
      discoveredAt: '2026-08-13',
      imageUrl: '/images/trend-6.jpg',
      hashtag: '#ParisStreetArt',
      engagementMetrics: { likes: 3124, shares: 678, comments: 234, views: 23456 },
    },
    {
      id: 'trend-7',
      title: 'Rooftop Bar at Sunset',
      description: 'New rooftop bar with signature cocktails, Instagram trending',
      category: 'cafe',
      location: [48.8606, 2.3376],
      popularityScore: 81,
      trendDirection: 'rising',
      source: 'social-media',
      discoveredAt: '2026-08-16',
      imageUrl: '/images/trend-7.jpg',
      hashtag: '#ParisRooftopBar',
      engagementMetrics: { likes: 4567, shares: 1234, comments: 456, views: 34567 },
    },
  ];

  /**
   * Get trending signals for a destination
   */
  static getTrends(request: TrendAnalysisRequest): TrendSignal[] {
    const { destination, categories, radiusKm = 10 } = request;

    // Get all trends for destination (or default to database)
    let trends = this.trendDatabase.filter(
      (trend) => trend.location
    );

    // Filter by categories if specified
    if (categories && categories.length > 0) {
      trends = trends.filter((trend) =>
        categories.includes(trend.category)
      );
    }

    // Sort by popularity score descending
    return trends.sort((a, b) => b.popularityScore - a.popularityScore);
  }

  /**
   * Get rising trends (trendDirection === 'rising')
   */
  static getRisingTrends(request: TrendAnalysisRequest): TrendSignal[] {
    const trends = this.getTrends(request);
    return trends.filter((trend) => trend.trendDirection === 'rising');
  }

  /**
   * Get declining trends
   */
  static getDecliningTrends(request: TrendAnalysisRequest): TrendSignal[] {
    const trends = this.getTrends(request);
    return trends.filter((trend) => trend.trendDirection === 'declining');
  }

  /**
   * Get trending cafes specifically
   */
  static getTrendingCafes(destination: string): TrendSignal[] {
    return this.getTrends({
      destination,
      categories: ['cafe'],
    }).filter((trend) => trend.trendDirection === 'rising');
  }

  /**
   * Get trending attractions
   */
  static getTrendingAttractions(destination: string): TrendSignal[] {
    return this.getTrends({
      destination,
      categories: ['attraction', 'activity', 'event'],
    }).filter((trend) => trend.trendDirection === 'rising');
  }

  getTrends = TrendAnalysisEngine.getTrends.bind(TrendAnalysisEngine);
  getRisingTrends = TrendAnalysisEngine.getRisingTrends.bind(TrendAnalysisEngine);
  getDecliningTrends = TrendAnalysisEngine.getDecliningTrends.bind(TrendAnalysisEngine);
  getTrendingCafes = TrendAnalysisEngine.getTrendingCafes.bind(TrendAnalysisEngine);
  getTrendingAttractions = TrendAnalysisEngine.getTrendingAttractions.bind(TrendAnalysisEngine);
}

export const trendEngine = new TrendAnalysisEngine();