'use client';

import { useState, useEffect } from 'react';
import { Trip } from '@/types/travel';

/**
 * Custom hook for fetching trip data from the API
 */
export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/trips');
      const result = await response.json();
      if (result.success) {
        setTrips(result.data);
      } else {
        setError(result.error || 'Failed to fetch trips');
      }
    } catch (err) {
      setError('Failed to fetch trips');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return { trips, isLoading, error, refetch: fetchTrips };
}

/**
 * Custom hook for fetching a single trip by ID
 */
export function useTrip(id: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrip = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/trips/${id}`);
      const result = await response.json();
      if (result.success) {
        setTrip(result.data);
      } else {
        setError(result.error || 'Trip not found');
      }
    } catch (err) {
      setError('Failed to fetch trip');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTrip();
  }, [id]);

  return { trip, isLoading, error, refetch: fetchTrip };
}

/**
 * Custom hook for creating a trip
 */
export function useCreateTrip() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTrip = async (tripData: {
    title: string;
    destination: string;
    dates: { start: string; end: string };
    budget?: number;
    preferences?: any;
  }) => {
    setIsCreating(true);
    setError(null);
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to create trip');
      }
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create trip';
      setError(message);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  return { createTrip, isCreating, error };
}

/**
 * Custom hook for updating a trip
 */
export function useUpdateTrip() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTrip = async (id: string, updates: any) => {
    setIsUpdating(true);
    setError(null);
    try {
      const response = await fetch(`/api/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update trip');
      }
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update trip';
      setError(message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateTrip, isUpdating, error };
}

/**
 * Custom hook for deleting a trip
 */
export function useDeleteTrip() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTrip = async (id: string) => {
    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/trips/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete trip');
      }
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete trip';
      setError(message);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteTrip, isDeleting, error };
}