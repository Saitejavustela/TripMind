'use client';

import React, { useEffect, useState } from 'react';

interface LiveAdjustment {
  id: string;
  type: 'schedule-change' | 'route-change' | 'attraction-closure' | 'weather-alert' | 'transport-delay';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedArea: 'itinerary' | 'budget' | 'route' | 'accommodation' | 'activities';
  originalValue: string;
  newValue: string;
  timestamp: string;
  resolved: boolean;
  resolution?: string;
}

interface LiveTripState {
  itineraryId: string;
  currentDay: number;
  currentActivityIndex: number;
  isPaused: boolean;
  adjustments: LiveAdjustment[];
  lastUpdated: string;
}

interface LiveAdjustmentsPanelProps {
  tripId: string;
}

export default function LiveAdjustmentsPanel({ tripId }: LiveAdjustmentsPanelProps) {
  const [adjustments, setAdjustments] = useState<LiveAdjustment[]>([]);
  const [tripState, setTripState] = useState<LiveTripState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    fetchAdjustments();
    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchAdjustments();
    }, 30000);
    setPolling(true);
    return () => {
      clearInterval(interval);
      setPolling(false);
    };
  }, [tripId]);

  const fetchAdjustments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/adjustments?tripId=${tripId}`);
      const result = await response.json();

      if (result.success) {
        setAdjustments(result.data.adjustments.filter((a: any) => !a.resolved));
        setTripState(result.data.tripState);
      }
    } catch (err) {
      console.error('Error fetching adjustments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading live adjustments...</div>;
  }

  if (!tripId) {
    return <div className="p-4 text-center">Select a trip to view adjustments</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <header className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Live Trip Adjustments
        </h2>
        <div className="text-sm text-gray-500">
          Last updated:{' '}
          {tripState?.lastUpdated
            ? new Date(tripState.lastUpdated).toLocaleTimeString()
            : 'just now'}
        </div>
      </header>

      {/* Trip State Summary */}
      {tripState && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-3">Trip Overview</h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-sm text-gray-500">Day</p>
              <p className="text-2xl font-bold">{tripState.currentDay}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Activity</p>
              <p className="text-2xl font-bold">{tripState.currentActivityIndex + 1}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className={tripState.isPaused ? 'text-yellow-500' : 'text-green-500'}>
                {tripState.isPaused ? 'Paused' : 'Active'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Unresolved Adjustments */}
      {adjustments.length > 0 ? (
        <div className="space-y-4">
          {adjustments.map((adjustment) => (
            <div
              key={adjustment.id}
              className={`p-4 rounded-lg border-l-4 ${
                adjustment.severity === 'critical'
                  ? 'border-red-500 bg-red-50'
                  : adjustment.severity === 'high'
                    ? 'border-orange-500 bg-orange-50'
                    : adjustment.severity === 'medium'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-green-500 bg-green-50'
            }`}
            >
              {/* Severity badge */}
              <div className="flex items-start mb-3">
                <div
                  className={`w-2 h-2 rounded-full mr-3 ${
                    adjustment.severity === 'critical'
                      ? 'bg-red-500'
                      : adjustment.severity === 'high'
                        ? 'bg-orange-500'
                        : adjustment.severity === 'medium'
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                  }`}
                />
                <div>
                  <h3 className="font-medium">{adjustment.title}</h3>
                  <p className="text-sm text-gray-500">{adjustment.description}</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500 original">Original:</p>
                  <p className="font-mono text-xs">{adjustment.originalValue}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 new">New:</p>
                  <p className="font-mono text-xs">{adjustment.newValue}</p>
                </div>
              </div>

              {/* Severity and metadata */}
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`font-medium ${
                    adjustment.severity === 'critical'
                      ? 'text-red-600'
                  : adjustment.severity === 'high'
                    ? 'text-orange-600'
                  : adjustment.severity === 'medium'
                    ? 'text-blue-600'
                    : 'text-green-600'
                  }`}
                   >{adjustment.severity.toUpperCase()}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">
                    {new Date(adjustment.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {adjustment.resolution && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-gray-500">Resolved with:</p>
                    <p className="font-mono text-xs">{adjustment.resolution}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          No active adjustments
        </div>
      )}
    </div>
  );
}