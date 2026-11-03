'use client';

import Link from 'next/link';
import BudgetDashboard from '@/components/BudgetDashboard';
import MapViewer from '@/components/MapViewer';
import LiveAdjustmentsPanel from '@/components/LiveAdjustmentsPanel';
import { useState, useEffect } from 'react';
import { useTrips } from '@/hooks/use-trip-data';
import { WeatherService, type TripWeatherPlan, useWeatherForTrip } from '@/lib/weather-service';

export default function ItineraryBuilderPage() {
  const { trips, isLoading, error } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [weatherPlan, setWeatherPlan] = useState<TripWeatherPlan | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  // Fetch weather plan from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tripIdFromUrl = params.get('tripId');
    const destination = params.get('destination');
    const startDate = params.get('startDate');
    const endDate = params.get('endDate');

    if (tripIdFromUrl && destination && startDate && endDate) {
      setIsWeatherLoading(true);
      WeatherService.generateWeatherPlan(tripIdFromUrl, destination, {
        start: startDate,
        end: endDate,
      }).then((plan) => {
        setWeatherPlan(plan);
        setIsWeatherLoading(false);
      });
    }
  }, [selectedTripId]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Itineraries</h1>
      </header>

      {isLoading ? (
        <p>Loading itineraries...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              onClick={() => setSelectedTripId(trip.id)}
            >
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute inset-0 bg-black/30 flex items-end p-4">
                  <h3 className="text-xl font-bold text-white">{trip.title}</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-600 mb-3">{trip.destination}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">
                    {new Date(trip.dates.start).toLocaleDateString()} -{' '}
                    {new Date(trip.dates.end).toLocaleDateString()}
                  </span>
                  <span className="text-yellow-500">★ {trip.rating?.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {trip.itinerary?.duration || 0} days • {trip.budget?.total
                    ? `$${trip.budget.total.toLocaleString()}`
                    : 'Budget not set'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Trip Detail */}
      {selectedTripId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-2xl font-bold">Trip Details</h2>
              <button
                onClick={() => setSelectedTripId(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              <BudgetDashboard tripId={selectedTripId} />

              {/* Weather-Aware Planning Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Weather-Aware Planning</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Get weather-based recommendations for your trip dates
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    id="tripDestination"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Paris, France">Paris, France</option>
                    <option value="Tokyo, Japan">Tokyo, Japan</option>
                    <option value="New York, USA">New York, USA</option>
                    <option value="Rome, Italy">Rome, Italy</option>
                  </select>
                  <select
                    id="tripStartDate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2026-07-15">July 15, 2026</option>
                    <option value="2026-08-10">Aug 10, 2026</option>
                    <option value="2026-09-01">Sept 1, 2026</option>
                  </select>
                  <select
                    id="tripEndDate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2026-07-22">July 22, 2026</option>
                    <option value="2026-08-17">Aug 17, 2026</option>
                    <option value="2026-09-08">Sept 8, 2026</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    const dest = (document.getElementById('tripDestination') as HTMLSelectElement).value;
                    const start = (document.getElementById('tripStartDate') as HTMLSelectElement).value;
                    const end = (document.getElementById('tripEndDate') as HTMLSelectElement).value;
                    const trip = useTrips().trips.find(t => t.id === selectedTripId);
                    if (trip && dest && start && end) {
                      window.location.href = `/weather?tripId=${selectedTripId}&destination=${dest}&startDate=${start}&endDate=${end}`;
                    }
                  }}
                  className="mt-3 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Get Weather Plan
                </button>
              </div>

              <div id="weatherPlanContainer" className="mt-6 hidden">
                {/* Weather plan will be injected here */}
              </div>
              {/* End Weather-Aware Planning Section */}
              {/* End Weather-Aware Planning Section */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}