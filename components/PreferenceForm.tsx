'use client';

import React, { useState } from 'react';

interface Preference {
  travelStyle: 'budget' | 'moderate' | 'luxury';
  pace: 'relaxed' | 'moderate' | 'packed';
  accommodationType: 'hotel' | 'hostel' | 'airbnb' | 'resort' | 'any';
  transportationPreference: 'public' | 'private' | 'mixed';
  interests?: string[];
  dietaryRestrictions?: string[];
  groupType?: 'solo' | 'couple' | 'family' | 'friends' | 'business';
  specialRequirements?: string[];
}

const initialPreference: Preference = {
  travelStyle: 'moderate',
  pace: 'moderate',
  accommodationType: 'any',
  transportationPreference: 'mixed',
};

const interestOptions = ['Historic Sites', 'Food & Dining', 'Art & Culture', 'Nature & Outdoors', 'Adventure', 'Shopping'];
const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher', 'Other'];
const accommodationOptions: Preference['accommodationType'][] = ['hotel', 'hostel', 'airbnb', 'resort', 'any'];
const transportOptions: Preference['transportationPreference'][] = ['public', 'private', 'mixed'];

export default function PreferenceForm({ onSave }: { onSave: (prefs: Preference) => void }) {
  const [prefs, setPrefs] = useState<Preference>(initialPreference);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (
    field: keyof Preference,
    value: string,
  ) => {
    setPrefs((prev) => ({
      ...prev,
      [field]: value as (string & typeof value),
    }));
  };

  const handleToggle = (
    field: 'interests' | 'dietaryRestrictions',
    value: string,
  ) => {
    setPrefs((prev) => {
      const current = prev[field] ?? [];
      const exists = current.includes(value);
      const updated = exists
        ? current.filter((item) => item !== value)
        : [...current, value];

      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });

      if (!response.ok) throw new Error('Failed to save preferences');

      const data = await response.json();
      if (data.success) {
        onSave(data.preferences);
      } else {
        throw new Error(data.error || 'Failed to save preferences');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Travel Preferences</h2>

      {error && (
        <p className="text-red-600 mb-3">Error: {error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Travel Style */}
        <div className="flex items-end">
          <label className="block text-sm font-medium text-gray-700 w-20 mb-3">
            Style
          </label>
          <div className="flex gap-2">
            {(['budget', 'moderate', 'luxury'] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => handleSelect('travelStyle', style)}
                className={
                  prefs.travelStyle === style
                    ? 'px-3 py-1 bg-blue-600 text-white rounded'
                    : 'px-3 py-1 bg-gray-200 rounded hover:bg-gray-300'
                }
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Pace */}
        <div className="flex items-end">
          <label className="block text-sm font-medium text-gray-700 w-20 mb-3">
            Pace
          </label>
          <div className="flex gap-2">
            {(['relaxed', 'moderate', 'packed'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleSelect('pace', p)}
                className={
                  prefs.pace === p
                    ? 'px-3 py-1 bg-blue-600 text-white rounded'
                    : 'px-3 py-1 bg-gray-200 rounded hover:bg-gray-300'
                }
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Accommodation Type */}
        <div className="flex items-end">
          <label className="block text-sm font-medium text-gray-700 w-25 mb-3">
            Lodging Type
          </label>
          <select
            value={prefs.accommodationType}
            onChange={(e) => handleSelect('accommodationType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {accommodationOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Interests */}
        <div className="flex flex-col mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interests
          </label>
          <div className="flex flex-wrap gap-1">
            {interestOptions.map((interest) => {
              const isSelected = prefs.interests?.includes(interest) ?? false;
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleToggle('interests', interest)}
                  className={
                    isSelected
                      ? 'px-3 py-1 bg-blue-600 text-white rounded'
                      : 'px-3 py-1 bg-gray-200 rounded hover:bg-blue-100'
                  }
                >
                  {interest}
                </button>
              );
            })}
          </div>
          {prefs.interests && prefs.interests.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Selected: {prefs.interests.join(', ')}
            </p>
          )}
        </div>

        {/* Dietary Restrictions */}
        <div className="flex flex-col mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dietary Restrictions
          </label>
          <div className="flex flex-wrap gap-1">
            {dietaryOptions.map((restriction) => {
              const isSelected =
                prefs.dietaryRestrictions?.includes(restriction) ?? false;
              return (
                <button
                  key={restriction}
                  type="button"
                  onClick={() => handleToggle('dietaryRestrictions', restriction)}
                  className={
                    isSelected
                      ? 'px-3 py-1 bg-blue-600 text-white rounded'
                      : 'px-3 py-1 bg-gray-200 rounded hover:bg-blue-100'
                  }
                >
                  {restriction}
                </button>
              );
            })}
          </div>
          {prefs.dietaryRestrictions && prefs.dietaryRestrictions.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Selected: {prefs.dietaryRestrictions.join(', ')}
            </p>
          )}
        </div>

        {/* Transportation Preference */}
        <div className="flex items-end">
          <label className="block text-sm font-medium text-gray-700 w-25 mb-3">
            Transport
          </label>
          <select
            value={prefs.transportationPreference}
            onChange={(e) =>
              handleSelect('transportationPreference', e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {transportOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}