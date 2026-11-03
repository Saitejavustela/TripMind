'use client';

import React from 'react';
import {
  type TripWeatherPlan,
  type DailyWeatherPlan,
  type WeatherRecommendation,
  type WeatherAlert,
  useWeatherForTrip,
} from '@/lib/weather-service';

interface WeatherPageProps {
  tripId?: string;
  destination?: string;
  dates?: { start: string; end: string };
}

export default function WeatherPage({
  tripId = 'paris-summer',
  destination = 'Paris, France',
  dates = { start: '2026-10-01', end: '2026-10-06' },
}: WeatherPageProps) {
  const { weatherPlan, isLoading, error } = useWeatherForTrip(tripId, destination, dates);

  if (isLoading) {
    return (
      <div className="p-8 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Weather-Aware Planning</h2>
        <p className="text-gray-600">Loading weather forecast...</p>
        <div className="animate-spin h-6 w-6 mx-auto my-4 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Weather-Aware Planning</h2>
        <p className="text-red-500">Error loading weather data.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!weatherPlan) {
    return (
      <div className="p-8 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Weather-Aware Planning</h2>
        <p className="text-gray-600">No weather data available for this trip.</p>
      </div>
    );
  }

  const avgTemp = weatherPlan.dailyForecasts.length > 0
    ? Math.round(
        weatherPlan.dailyForecasts.reduce((sum: number, f: DailyWeatherPlan) => sum + f.forecast.temperature, 0) /
          weatherPlan.dailyForecasts.length
      )
    : 20;

  const avgPrecip = weatherPlan.dailyForecasts.length > 0
    ? Math.round(
        weatherPlan.dailyForecasts.reduce((sum: number, f: DailyWeatherPlan) => sum + f.forecast.precipitation, 0) /
          weatherPlan.dailyForecasts.length
      )
    : 10;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{destination} - Weather Planning</h1>
        <p className="text-gray-600 mt-1">
          {weatherPlan.dates.start} to {weatherPlan.dates.end}
        </p>
      </header>

      {/* Weather Summary */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Weather Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50/50 border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Average Temp</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{avgTemp}°C</p>
          </div>
          <div className="p-4 rounded-lg border-l-4 border-green-500 bg-green-50/50 border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Primary Condition</p>
            <p className="text-2xl font-bold capitalize text-gray-900 mt-1">
              {weatherPlan.dailyForecasts[0]?.forecast?.condition || 'Clear'}
            </p>
          </div>
          <div className="p-4 rounded-lg border-l-4 border-purple-500 bg-purple-50/50 border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Precip Chance</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{avgPrecip}%</p>
          </div>
          <div className="p-4 rounded-lg border-l-4 border-orange-500 bg-orange-50/50 border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Wind Speed</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">12 km/h</p>
          </div>
        </div>

        {/* Active Alerts */}
        {weatherPlan.alerts.length > 0 ? (
          <div className="mt-6 p-4 rounded-lg border-l-4 border-red-500 bg-red-50/50 border border-gray-100">
            <h3 className="font-medium mb-3 text-red-900">Weather Alerts</h3>
            <ul className="space-y-2 text-sm">
              {weatherPlan.alerts.map((alert: WeatherAlert) => (
                <li
                  key={alert.id}
                  className={`flex items-start ${
                    alert.severity === 'critical'
                      ? 'text-red-700'
                      : alert.severity === 'high'
                        ? 'text-orange-700'
                        : alert.severity === 'medium'
                          ? 'text-blue-700'
                          : 'text-green-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full mr-2 mt-1.5 bg-red-500" />
                  <span>
                    <strong>{alert.title}:</strong> {alert.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No weather alerts for your travel dates.</p>
        )}
      </section>

      {/* Daily Forecasts */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Forecasts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weatherPlan.dailyForecasts.map((daily: DailyWeatherPlan) => (
            <div
              key={daily.day}
              className={`p-4 rounded-lg border ${
                daily.adjustedActivities.length > 0
                  ? 'border-yellow-400 bg-yellow-50/40'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{`Day ${daily.day} - ${daily.date}`}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(daily.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{Math.round(daily.forecast.temperature)}°C</p>
                  <p className="text-xs text-gray-500 capitalize">{daily.forecast.condition}</p>
                  <p className="text-xs text-blue-600 font-medium">{Math.round(daily.forecast.precipitation)}% rain</p>
                </div>
              </div>

              {/* Adjusted activities */}
              {daily.adjustedActivities.length > 0 ? (
                <div className="mt-3 p-2.5 rounded bg-yellow-100/70 border border-yellow-200">
                  <p className="text-xs text-yellow-800 font-medium">⚠️ Adjusted activities:</p>
                  <ul className="text-xs text-yellow-800 space-y-1 mt-1">
                    {daily.adjustedActivities.map((act: string) => (
                      <li key={act}>• {act}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-3">No adjustments needed</p>
              )}

              {/* Suggestions */}
              {daily.suggestions.length > 0 && (
                <div className="mt-3 p-2.5 rounded bg-green-50 border border-green-200">
                  <p className="text-xs text-green-800 font-medium">💡 Suggestion:</p>
                  <ul className="text-xs text-green-800 space-y-1 mt-1">
                    {daily.suggestions.map((sug: string) => (
                      <li key={sug}>• {sug}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Weather Recommendations */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Weather Recommendations</h2>
        <div className="space-y-3">
          {weatherPlan.recommendations.map((rec: WeatherRecommendation, idx: number) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-l-4 bg-white border border-gray-100 ${
                rec.priority === 'high'
                  ? 'border-l-red-500'
                  : rec.priority === 'medium'
                    ? 'border-l-yellow-500'
                    : 'border-l-green-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900">{rec.title}</h3>
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">{rec.type}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Export/Share */}
      <section className="p-6 rounded-lg border border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-2">Share Weather Plan</h3>
        <p className="text-sm text-gray-600 mb-4">
          Share this weather-aware plan with your travel companions to ensure everyone is prepared.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(JSON.stringify(weatherPlan, null, 2));
                alert('Weather plan copied to clipboard!');
              }
            }}
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            Copy JSON Plan
          </button>
        </div>
      </section>
    </div>
  );
}
