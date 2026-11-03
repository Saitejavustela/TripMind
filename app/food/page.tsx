'use client';

import React, { useEffect, useState, useRef } from 'react';
import { GlobalDestination, GLOBAL_DESTINATIONS } from '@/lib/destination-service';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: 'budget' | 'moderate' | 'expensive' | 'luxury';
  address: string;
  specialties: string[];
  dietaryOptions: string[];
  openingHours: string;
  location: [number, number];
  imageUrl: string;
  distanceFromCenter: string;
  pricePerPerson: number;
  reservationRequired?: boolean;
  reservationUrl?: string;
  popularDishes?: string[];
  isCurrentlyOpen?: boolean;
  reviewsCount?: number;
}

interface FoodDiscoveryRequest {
  destination: string;
  preferences?: {
    cuisine?: string[];
    dietaryRestrictions?: string[];
    priceRange?: 'budget' | 'moderate' | 'expensive' | 'luxury';
    partySize?: number;
  };
}

const POPULAR_DESTINATION_PILLS = [
  { label: 'Paris', full: 'Paris, France', flag: '🇫🇷', icon: '🗼' },
  { label: 'Tokyo', full: 'Tokyo, Japan', flag: '🇯🇵', icon: '🍣' },
  { label: 'New York', full: 'New York, USA', flag: '🇺🇸', icon: '🗽' },
  { label: 'Mumbai', full: 'Mumbai, India', flag: '🇮🇳', icon: '🕌' },
  { label: 'Rome', full: 'Rome, Italy', flag: '🇮🇹', icon: '🏛️' },
  { label: 'London', full: 'London, United Kingdom', flag: '🇬🇧', icon: '🎡' },
  { label: 'Barcelona', full: 'Barcelona, Spain', flag: '🇪🇸', icon: '🏖️' },
  { label: 'Bangkok', full: 'Bangkok, Thailand', flag: '🇹🇭', icon: '🍲' },
  { label: 'Bali', full: 'Bali, Indonesia', flag: '🇮🇩', icon: '🌴' },
  { label: 'Dubai', full: 'Dubai, UAE', flag: '🇦🇪', icon: '🏙️' },
  { label: 'Singapore', full: 'Singapore, Singapore', flag: '🇸🇬', icon: '🦁' },
  { label: 'Sydney', full: 'Sydney, Australia', flag: '🇦🇺', icon: '🦘' },
];

export default function FoodDiscoveryPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [openRestaurants, setOpenRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDestination, setActiveDestination] = useState<GlobalDestination | null>(null);

  const [search, setSearch] = useState<FoodDiscoveryRequest>({
    destination: 'Rome, Italy',
  });

  // Autocomplete suggestions
  const [inputValue, setInputValue] = useState(search.destination);
  const [suggestions, setSuggestions] = useState<GlobalDestination[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions when input changes
  useEffect(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setSuggestions(GLOBAL_DESTINATIONS.slice(0, 8));
      return;
    }

    const matched = GLOBAL_DESTINATIONS.filter((d) => {
      const q = trimmed.toLowerCase();
      return (
        d.city.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.fullName.toLowerCase().includes(q)
      );
    });

    if (matched.length > 0) {
      setSuggestions(matched.slice(0, 8));
    } else {
      // Dynamic fallback preview
      setSuggestions([
        {
          id: 'custom-' + trimmed.toLowerCase(),
          city: trimmed,
          country: 'Global Destination',
          fullName: trimmed,
          region: 'International',
          flag: '✈️',
          coordinates: [40, 10],
          currency: 'USD',
          popularCuisines: ['Local Cuisine', 'Specialties'],
          signatureDishes: [`${trimmed} House Special`, 'Regional Delicacies'],
          iconicAttractions: [`Explore ${trimmed}`],
          tagline: `Search restaurants and authentic culinary gems in ${trimmed}`,
        },
      ]);
    }
  }, [inputValue]);

  // Fetch restaurants when search query changes
  const fetchRestaurants = async (targetDest?: string) => {
    const dest = (targetDest !== undefined ? targetDest : search.destination)?.trim();
    if (!dest) {
      setRestaurants([]);
      setOpenRestaurants([]);
      setActiveDestination(null);
      return;
    }

    // Match destination metadata for banner
    const matched = GLOBAL_DESTINATIONS.find(
      (d) =>
        d.fullName.toLowerCase() === dest.toLowerCase() ||
        d.city.toLowerCase() === dest.toLowerCase() ||
        dest.toLowerCase().includes(d.city.toLowerCase())
    );
    if (matched) {
      setActiveDestination(matched);
    } else {
      setActiveDestination({
        id: 'dest-' + dest.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        city: dest.split(',')[0].trim(),
        country: dest.includes(',') ? dest.split(',')[1].trim() : 'Worldwide',
        fullName: dest,
        region: 'Global',
        flag: '📍',
        coordinates: [0, 0],
        currency: 'USD',
        popularCuisines: ['Authentic Cuisine', 'Bistros & Cafes', 'Street Food'],
        signatureDishes: ['Local Signature Dish', 'Regional Specialties'],
        iconicAttractions: ['City Center', 'Historic Quarter'],
        tagline: `Discover the flavors, dining scene, and culinary culture of ${dest}`,
      });
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({ destination: dest });
      if (search.preferences?.cuisine && search.preferences.cuisine.length > 0) {
        params.set('cuisine', search.preferences.cuisine.join(','));
      }
      if (search.preferences?.priceRange) {
        params.set('priceRange', search.preferences.priceRange);
      }

      const response = await fetch('/api/food?' + params.toString());
      const result = await response.json();

      if (result.success && result.data) {
        const allList: Restaurant[] = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.data.all)
            ? result.data.all
            : [];
        const openList: Restaurant[] = Array.isArray(result.data.currentlyOpen)
          ? result.data.currentlyOpen
          : allList.filter((r) => r.isCurrentlyOpen !== false);

        setRestaurants(allList);
        setOpenRestaurants(openList);
      } else {
        setRestaurants([]);
        setOpenRestaurants([]);
      }
    } catch (err) {
      console.error('Error fetching food:', err);
      setRestaurants([]);
      setOpenRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRestaurants(search.destination);
  }, [search]);

  const selectDestination = (destName: string) => {
    setInputValue(destName);
    setShowSuggestions(false);
    setSearch((prev) => ({
      ...prev,
      destination: destName,
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowSuggestions(false);
    setSearch((prev) => ({
      ...prev,
      destination: inputValue,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <header className="mb-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Global Food Discovery
        </h1>
        <p className="text-gray-600 mt-1">
          Explore authentic cuisine, top-rated local restaurants, and hidden culinary spots in any destination worldwide.
        </p>
      </header>

      {/* Quick-Select Destination Pills */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Popular Destinations
        </label>
        <div className="flex flex-wrap gap-2">
          {POPULAR_DESTINATION_PILLS.map((pill) => (
            <button
              key={pill.full}
              type="button"
              onClick={() => selectDestination(pill.full)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                search.destination.toLowerCase().includes(pill.label.toLowerCase())
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{pill.flag}</span>
              <span>{pill.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 relative">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Destination Autocomplete */}
          <div className="relative" ref={suggestionsRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search any city or country (e.g. Rome, Tokyo, Mumbai...)"
                value={inputValue}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowSuggestions(true);
                }}
                required
                className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto divide-y divide-gray-100">
                {suggestions.map((dest) => (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => selectDestination(dest.fullName)}
                    className="w-full text-left px-3 py-2.5 hover:bg-blue-50 flex items-center justify-between text-sm transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{dest.flag}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{dest.city}</div>
                        <div className="text-xs text-gray-500">{dest.country}</div>
                      </div>
                    </div>
                    {dest.signatureDishes?.length > 0 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full hidden sm:inline-block">
                        {dest.signatureDishes[0]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cuisine Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cuisine
            </label>
            <select
              value={search.preferences?.cuisine?.join(',') || ''}
              onChange={(e) =>
                setSearch({
                  ...search,
                  preferences: {
                    ...search.preferences,
                    cuisine: e.target.value
                      ? e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      : undefined,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All cuisines</option>
              <option value="French">French</option>
              <option value="Japanese">Japanese</option>
              <option value="Italian">Italian</option>
              <option value="Indian">Indian</option>
              <option value="Thai">Thai</option>
              <option value="Spanish">Spanish</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="American">American</option>
              <option value="Street Food">Street Food</option>
              <option value="Seafood">Seafood</option>
              <option value="Vegan">Vegan</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Range
            </label>
            <select
              value={search.preferences?.priceRange || ''}
              onChange={(e) =>
                setSearch({
                  ...search,
                  preferences: {
                    ...search.preferences,
                    priceRange: (e.target.value as 'budget' | 'moderate' | 'expensive' | 'luxury') || undefined,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All price ranges</option>
              <option value="budget">Budget ($)</option>
              <option value="moderate">Moderate ($$)</option>
              <option value="expensive">Expensive ($$$)</option>
              <option value="luxury">Fine Dining / Luxury ($$$$)</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm text-sm"
            >
              {isLoading ? 'Searching...' : 'Explore Food'}
            </button>
          </div>
        </form>
      </div>

      {/* Destination Cultural Overview Banner */}
      {activeDestination && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-amber-50 rounded-xl p-5 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeDestination.flag}</span>
              <h2 className="text-xl font-bold text-gray-900">{activeDestination.fullName}</h2>
              <span className="text-xs bg-white text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                {activeDestination.region}
              </span>
            </div>
            <p className="text-sm text-gray-600">{activeDestination.tagline}</p>
          </div>

          {activeDestination.signatureDishes?.length > 0 && (
            <div className="flex flex-col md:items-end">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Must-Try Dishes
              </span>
              <div className="flex flex-wrap gap-1.5 justify-start md:justify-end">
                {activeDestination.signatureDishes.map((dish, i) => (
                  <span
                    key={i}
                    className="text-xs bg-white text-gray-800 border border-amber-200 px-2.5 py-1 rounded-md font-medium shadow-2xs"
                  >
                    🍴 {dish}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-600 text-sm">Discovering top restaurants and food spots...</p>
        </div>
      )}

      {/* Results */}
      {search.destination && !isLoading && (
        <div className="space-y-8">
          {/* All Restaurants */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {(restaurants || []).length} Restaurants Found
                </h2>
                <p className="text-gray-600 text-sm">
                  Handpicked eateries and culinary hotspots in {search.destination}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Showing top rated
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(restaurants || []).map((rest) => (
                <div
                  key={rest.id}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-t-4 overflow-hidden border ${
                    rest.isCurrentlyOpen ? 'border-t-green-500' : 'border-t-gray-400'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                          {rest.name}
                        </h3>
                        <p className="text-xs text-blue-600 font-medium mt-0.5">{rest.cuisine}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          ★ {rest.rating}
                        </span>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {rest.reviewsCount || 120} reviews
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-1">
                      📍 {rest.address}
                    </p>

                    {(rest.specialties?.length ?? 0) > 0 && (
                      <div className="mt-3">
                        <span className="text-xs font-semibold text-gray-500">Specialties: </span>
                        <span className="text-xs text-gray-700">
                          {rest.specialties.slice(0, 3).join(' • ')}
                        </span>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                      <div>
                        <span className="font-semibold text-gray-900">
                          ~${rest.pricePerPerson}
                        </span>
                        <span> / person</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            rest.isCurrentlyOpen ? 'bg-green-500' : 'bg-red-400'
                          }`}
                        />
                        <span>{rest.isCurrentlyOpen ? 'Open Now' : 'Closed'}</span>
                        <span className="text-gray-400">({rest.openingHours})</span>
                      </div>
                    </div>

                    {/* Dietary badges */}
                    {(rest.dietaryOptions || []).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {rest.dietaryOptions.map((opt, idx) => (
                          <span
                            key={idx}
                            className="text-2xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <a
                        href={rest.reservationUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {rest.reservationRequired ? 'Reserve Table →' : 'View Details →'}
                      </a>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          rest.name + ' ' + rest.address
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-700 hover:text-green-900 font-medium flex items-center gap-1"
                      >
                        <span>🗺️ Directions</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Currently Open Highlight Section */}
          {(openRestaurants || []).length > 0 && (
            <section className="bg-green-50/50 rounded-xl p-5 border border-green-100">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>🍽️</span>
                <span>Open Right Now ({(openRestaurants || []).length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {(openRestaurants || []).map((rest) => (
                  <div
                    key={rest.id}
                    className="bg-white rounded-lg p-3 shadow-2xs border border-green-200 hover:border-green-400 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{rest.name}</h4>
                      <span className="text-xs text-amber-600 font-bold shrink-0">★ {rest.rating}</span>
                    </div>
                    <p className="text-xs text-green-700 font-medium mt-0.5">{rest.cuisine}</p>
                    <p className="text-xs text-gray-500 mt-1">${rest.pricePerPerson}/person • {rest.openingHours}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* No results */}
      {search.destination && (restaurants || []).length === 0 && !isLoading && (
        <div className="bg-yellow-50 rounded-xl p-8 text-center text-gray-700 border border-yellow-200">
          <h3 className="text-lg font-bold mb-1">No restaurants match your filters</h3>
          <p className="text-sm text-gray-600 mb-4">
            Try loosening your cuisine or price filters, or search for another destination.
          </p>
          <button
            type="button"
            onClick={() => setSearch({ destination: search.destination })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
