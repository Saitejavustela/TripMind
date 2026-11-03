'use client';

import { useState, useEffect } from 'react';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
  });

  const fetchRecommendations = async () => {
    if (!searchParams.destination) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        destination: searchParams.destination,
        startDate: searchParams.startDate,
        endDate: searchParams.endDate,
        budget: searchParams.budget,
      });

      const response = await fetch(`/api/recommendations?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setRecommendations(result.data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Recommendations</h1>
        <p className="text-gray-600">
          Get AI-powered recommendations for hotels, restaurants, attractions, and transportation.
        </p>
      </header>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <input
              type="text"
              placeholder="e.g., Paris, France"
              value={searchParams.destination}
              onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={searchParams.startDate}
              onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={searchParams.endDate}
              onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget (USD)
            </label>
            <input
              type="number"
              placeholder="0"
              value={searchParams.budget}
              onChange={(e) => setSearchParams({ ...searchParams, budget: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchRecommendations}
              disabled={isLoading || !searchParams.destination}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Loading...' : 'Get Recommendations'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && <p className="text-center py-12">Finding the best recommendations...</p>}

      {/* Recommendations Results */}
      {recommendations && !isLoading && (
        <div className="space-y-8">
          {/* Hotels */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🏨 Hotel Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.hotels.map((hotel: any) => (
                <div key={hotel.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Hotel Image</span>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold">{hotel.name}</h3>
                      <span className="text-yellow-500">★ {hotel.rating}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{hotel.address}</p>
                    <p className="text-lg font-semibold text-blue-600">{hotel.pricePerNight}/night</p>
                    <div className="mt-2">
                      <p className="text-sm font-medium">Amenities:</p>
                      <div className="flex flex-wrap gap-1">
                        {hotel.amenities.slice(0, 4).map((amenity: string, idx: number) => (
                          <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Restaurants */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🍽️ Restaurant Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.restaurants.map((rest: any) => (
                <div key={rest.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold">{rest.name}</h3>
                      <span className="text-yellow-500">★ {rest.rating}</span>
                    </div>
                    <p className="text-gray-600">{rest.cuisine}</p>
                    <p className="text-sm text-gray-500 mb-2">{rest.address}</p>
                    <p className="font-medium">Specialties: {rest.specialties.join(', ')}</p>
                    <p className="text-sm text-gray-600 mt-1">Price: {rest.priceRange}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Attractions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🏛️ Top Attractions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.attractions.map((attr: any) => (
                <div key={attr.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold">{attr.name}</h3>
                      <span className="text-yellow-500">★ {attr.rating}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{attr.type}</p>
                    <p className="text-sm text-gray-500">{attr.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm">Est. {attr.estimatedDuration}</span>
                      <span className="font-medium">€{attr.cost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Route Optimization */}
          {recommendations.optimizedRoute && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🗺️ Optimized Route</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="mb-4">
                  Total distance: <strong>{recommendations.optimizedRoute.totalDistance.toFixed(1)} km</strong>
                </p>
                <p className="mb-4">
                  Total time: <strong>{recommendations.optimizedRoute.totalTime} minutes</strong>
                </p>
                <div className="space-y-4">
                  {recommendations.optimizedRoute.dailyRoutes.map((day: any) => (
                    <div key={day.day} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="text-lg font-semibold mb-2">Day {day.day}</h4>
                      <ul className="space-y-1">
                        {day.activities.map((activity: string) => (
                          <li key={activity} className="text-sm">• {activity}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}