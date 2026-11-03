'use client';

import React, { useEffect, useState } from 'react';

interface TrendSignal {
  id: string;
  title: string;
  description: string;
  category: 'cafe' | 'restaurant' | 'attraction' | 'event' | 'activity';
  location: [number, number];
  popularityScore: number;
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

interface TrendsPageProps {
  destination: string;
}

export default function TrendsPage({ destination }: TrendsPageProps) {
  const [trends, setTrends] = useState<TrendSignal[]>([]);
  const [risingTrends, setRisingTrends] = useState<TrendSignal[]>([]);
  const [decliningTrends, setDecliningTrends] = useState<TrendSignal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTrends();
  }, [destination]);

  const fetchTrends = async () => {
    if (!destination) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/trends?destination=${encodeURIComponent(destination)}`
      );
      const result = await response.json();

      if (result.success) {
        setTrends(result.data.allTrends);
        setRisingTrends(result.data.risingTrends);
        setDecliningTrends(result.data.decliningTrends);
      }
    } catch (err) {
      console.error('Error fetching trends:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!destination) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Social Media Trend Analysis</h2>
        <p className="text-gray-600">
          Enter a destination to discover trending experiences, cafes, and attractions
          based on social media signals.
        </p>
        <div className="mt-8 bg-white p-6 rounded-lg max-w-md mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const input = form.elements.namedItem(
                'destination'
              ) as HTMLInputElement | null;
              // In a real app, navigate or update state
            }}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Destination
              </label>
              <input
                type="text"
                placeholder="e.g., Paris, France"
                defaultValue="Paris"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="mt-3 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Analyze Trends
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Social Media Trend Analysis</h2>
        <p className="text-gray-600">Loading trends...</p>
        <div className="animate-spin h-6 w-6 mx-auto my-4"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Trending in {destination}
        </h1>
        <p className="text-gray-600">
          Discover what's currently trending on social media and among locals
        </p>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{risingTrends.length}</div>
          <p className="text-sm text-gray-500">Rising Trends</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{trends.length}</div>
          <p className="text-sm text-gray-500">Total Trends</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{decliningTrends.length}</div>
          <p className="text-sm text-gray-500">Declining</p>
        </div>
      </div>

      {/* Rising Trends */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          📈 Rising Trends ({risingTrends.length})
        </h2>

        {risingTrends.length === 0 ? (
          <p className="text-gray-500">No rising trends found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {risingTrends.map((trend) => (
              <div
                key={trend.id}
                className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-green-500 hover:shadow-lg transition-shadow"
              >
                {trend.imageUrl && (
                  <div className="h-48 bg-gray-200">
                    <img
                      src={trend.imageUrl}
                      alt={trend.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-2">{trend.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{trend.description}</p>

                  {/* Trend metadata */}
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {trend.trendDirection.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(trend.popularityScore)}% popularity
                    </span>
                  </div>

                  {/* Engagement metrics */}
                  {trend.engagementMetrics && (
                    <div className="text-xs text-gray-500 mb-3">
                      <span className="font-medium">Engagement:</span>
                      <span>
                        {trend.engagementMetrics.likes} likes •{' '}
                        {trend.engagementMetrics.shares} shares •{' '}
                        {trend.engagementMetrics.comments} comments
                      </span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-3 pt-3 border-t">
                    <a
                      href={`https://www.instagram.com/search/${trend.hashtag?.replace('#', '')}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block py-1 px-2 text-xs text-green-600 hover:text-green-800 rounded"
                    >
                      {' '}{trend.hashtag}{' '}
                    </a>
                    <span className="inline-block py-1 px-2 text-xs text-gray-400 ml-2">
                      discovered {new Date(trend.discoveredAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Declining Trends */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          📉 Declining Trends ({decliningTrends.length})
        </h2>

        {decliningTrends.length === 0 ? (
          <p className="text-gray-500">No declining trends found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decliningTrends.map((trend) => (
              <div
                key={trend.id}
                className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-red-500 hover:shadow-lg transition-shadow"
              >
                {trend.imageUrl && (
                  <div className="h-48 bg-gray-200">
                    <img
                      src={trend.imageUrl}
                      alt={trend.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-2">{trend.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{trend.description}</p>

                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      {trend.trendDirection.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(trend.popularityScore)}% popularity
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mb-3">
                    <span className="font-medium">Engagement:</span>
                    <span>
                      {trend.engagementMetrics?.likes || 0} likes
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <span className="inline-block py-1 px-2 text-xs text-gray-400">
                      discontinued {new Date(trend.discoveredAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}