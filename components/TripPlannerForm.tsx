'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCreateTrip } from '@/hooks/use-trip-data';
import { TripPreferences } from '@/types/travel';
import { GLOBAL_DESTINATIONS, GlobalDestination } from '@/lib/destination-service';

interface TripPlannerFormProps {
  onTripCreated: (tripId: string) => void;
}

/**
 * Trip Planner Form - Main form for users to input trip preferences
 */
export default function TripPlannerForm({ onTripCreated }: TripPlannerFormProps) {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: 0,
    numberOfTravelers: 1,
    interests: [] as string[],
    dietaryRestrictions: [] as string[],
    accommodationType: 'hotel' as 'hotel' | 'hostel' | 'airbnb' | 'resort',
    transportationPreference: 'mixed' as 'public' | 'private' | 'mixed',
  });

  const [destSuggestions, setDestSuggestions] = useState<GlobalDestination[]>([]);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const destRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const q = formData.destination.trim().toLowerCase();
    if (!q) {
      setDestSuggestions(GLOBAL_DESTINATIONS.slice(0, 6));
      return;
    }
    const matched = GLOBAL_DESTINATIONS.filter(
      (d) =>
        d.city.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.fullName.toLowerCase().includes(q)
    );
    setDestSuggestions(matched.slice(0, 6));
  }, [formData.destination]);

  const { createTrip, isCreating, error } = useCreateTrip();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.destination || !formData.startDate || !formData.endDate) {
      return;
    }

    const tripData = {
      title: `Trip to ${formData.destination}`,
      destination: formData.destination,
      dates: {
        start: formData.startDate,
        end: formData.endDate,
      },
      budget: formData.budget,
      preferences: {
        travelStyle: 'moderate',
        pace: formData.interests.length > 0 ? 'packed' : 'moderate',
        accommodationType: formData.accommodationType,
        transportationPreference: formData.transportationPreference,
        interests: formData.interests,
        dietaryRestrictions: formData.dietaryRestrictions,
      },
    };

    try {
      const newTrip = await createTrip(tripData);
      onTripCreated(newTrip.id);
    } catch (err) {
      console.error('Trip creation error:', err);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Plan Your Trip</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-md">
        {/* Destination */}
        <div className="mb-4 relative" ref={destRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search any destination (e.g., Rome, Tokyo, Mumbai, London...)"
              value={formData.destination}
              onFocus={() => setShowDestSuggestions(true)}
              onChange={(e) => {
                setFormData({ ...formData, destination: e.target.value });
                setShowDestSuggestions(true);
              }}
              required
              className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs">📍</span>
          </div>

          {showDestSuggestions && destSuggestions.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
              {destSuggestions.map((dest) => (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, destination: dest.fullName });
                    setShowDestSuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span>{dest.flag}</span>
                    <span className="font-medium text-gray-900">{dest.city}</span>
                    <span className="text-gray-400 text-xs">{dest.country}</span>
                  </span>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {dest.region}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Budget */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget (USD)
          </label>
          <input
            type="number"
            value={formData.budget}
            onChange={(e) =>
              setFormData({ ...formData, budget: Number(e.target.value) })}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Number of travelers */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Travelers
          </label>
          <select
            value={formData.numberOfTravelers}
            onChange={(e) =>
              setFormData({
                ...formData,
                numberOfTravelers: Number(e.target.value),
              })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5+</option>
          </select>
        </div>

        {/* Interests */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interests
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={() =>
                setFormData({
                  ...formData,
                  interests: [...formData.interests, 'Historic Sites'],
                })
              }
            >
              Historic Sites
            </button>
            <button
              type="button"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={() =>
                setFormData({
                  ...formData,
                  interests: [...formData.interests, 'Food & Dining'],
                })
              }
            >
              Food & Dining
            </button>
            <button
              type="button"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={() =>
                setFormData({
                  ...formData,
                  interests: [...formData.interests, 'Art & Culture'],
                })
              }
            >
              Art & Culture
            </button>
            <button
              type="button"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={() =>
                setFormData({
                  ...formData,
                  interests: [...formData.interests, 'Nature & Outdoors'],
                })
              }
            >
              Nature & Outdoors
            </button>
          </div>
        </div>

        {/* Dietary restrictions */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dietary Restrictions
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={() =>
                setFormData({
                  ...formData,
                  dietaryRestrictions: [...formData.dietaryRestrictions, 'Vegetarian'],
                })
              }
            >
              Vegetarian
            </button>
            <button
              type="button"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={() =>
                setFormData({
                  ...formData,
                  dietaryRestrictions: [...formData.dietaryRestrictions, 'Vegan'],
                })
              }
            >
              Vegan
            </button>
            <button
              type="button"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={() =>
                setFormData({
                  ...formData,
                  dietaryRestrictions: [...formData.dietaryRestrictions, 'Gluten-free'],
                })
              }
            >
              Gluten-free
            </button>
          </div>
        </div>

        {/* Accommodation type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accommodation Type
          </label>
          <select
            value={formData.accommodationType}
            onChange={(e) =>
              setFormData({ ...formData, accommodationType: e.target.value as 'hotel' | 'hostel' | 'airbnb' | 'resort' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="hotel">Hotel</option>
            <option value="hostel">Hostel</option>
            <option value="airbnb">Airbnb</option>
            <option value="resort">Resort</option>
          </select>
        </div>

        {/* Transportation preference */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transportation Preference
          </label>
          <select
            value={formData.transportationPreference}
            onChange={(e) =>
              setFormData({ ...formData, transportationPreference: e.target.value as 'public' | 'private' | 'mixed' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="public">Public transport</option>
            <option value="private">Private transport</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Generating Itinerary...' : 'Generate My AI Itinerary'}
        </button>
      </form>
    </div>
  );
}