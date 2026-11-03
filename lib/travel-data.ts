import { Trip, TripPreferences, Budget } from '@/types/travel';

// Mock database - in a real app this would be a real database
let mockTrips: Trip[] = [
  {
    id: 'paris-summer',
    title: 'Paris Summer Escape',
    destination: 'Paris, France',
    dates: {
      start: '2026-07-15',
      end: '2026-07-22',
    },
    isPublic: true,
    createdBy: 'user-123',
    downloadLink: '/trips/paris-summer/itinerary.pdf',
    itinerary: {
      duration: 7,
      dayPlan: [
        {
          day: 1,
          activities: [
            {
              name: 'Eiffel Tower',
              type: 'attraction',
              startTime: '09:00',
              endTime: '12:00',
              description: 'Iconic views from the tower',
              estimatedDuration: '3 hours',
              transport: 'walking',
            },
            {
              name: 'Louvre Museum',
              type: 'attraction',
              startTime: '13:00',
              endTime: '16:00',
              description: 'World-renowned art museum',
              estimatedDuration: '3 hours',
              transport: 'metro',
              transportDetails: 'Take metro line 1 to Palais Royal',
            },
            {
              name: 'Dinner at Le Comptoir',
              type: 'dining',
              startTime: '19:30',
              endTime: '21:30',
              description: 'Bistro dinner reservation',
              estimatedDuration: '2 hours',
              transport: 'walking',
              reservationLink: 'https://www.lecomptoir.fr',
            },
          ],
        },
        // Additional days would be added here...
      ],
    },
    budget: {
      total: 3200,
      breakdown: {
        transportation: 400,
        accommodation: 1600,
        food: 600,
        activities: 400,
        miscellaneous: 200,
      },
      currency: 'EUR',
    },
    rating: 4.8,
  },
  {
    id: 'tokyo-food',
    title: 'Tokyo Food Tour',
    destination: 'Tokyo, Japan',
    dates: {
      start: '2026-08-10',
      end: '2026-08-17',
    },
    isPublic: true,
    createdBy: 'user-456',
    downloadLink: '/trips/tokyo-food/itinerary.pdf',
    itinerary: {
      duration: 8,
      dayPlan: [
        {
          day: 1,
          activities: [
            {
              name: 'Tsukiji Outer Market',
              type: 'market',
              startTime: '06:00',
              endTime: '09:00',
              description: 'Fresh sushi and street food',
              estimatedDuration: '3 hours',
              transport: 'metro',
              transportDetails: 'Take metro Hibiya Line to Tsukiji Station',
            },
            {
              name: 'Sushi Making Class',
              type: 'cooking',
              startTime: '11:00',
              endTime: '14:00',
              description: 'Learn to make authentic sushi',
              estimatedDuration: '3 hours',
              transport: 'taxi',
              location: 'Tsukiji',
            },
          ],
        },
      ],
    },
    budget: {
      total: 2800,
      breakdown: {
        transportation: 300,
        accommodation: 1400,
        food: 800,
        activities: 500,
        miscellaneous: 200,
      },
      currency: 'JPY',
    },
    rating: 4.6,
  },
];

export function getMockTrips(): Trip[] {
  return [...mockTrips]; // Return a copy
}

export function getMockTripById(id: string): Trip | undefined {
  return mockTrips.find(trip => trip.id === id);
}

export function createMockTrip(tripData: {
  title: string;
  destination: string;
  dates: { start: string; end: string };
  budget?: number | Budget;
  preferences?: TripPreferences;
}): Trip {
  const id = generateId();
  const budgetObj: Budget | undefined =
    typeof tripData.budget === 'number'
      ? {
          total: tripData.budget,
          currency: 'USD',
          breakdown: {
            accommodation: Math.round(tripData.budget * 0.4),
            food: Math.round(tripData.budget * 0.25),
            activities: Math.round(tripData.budget * 0.2),
            transportation: Math.round(tripData.budget * 0.1),
            miscellaneous: Math.round(tripData.budget * 0.05),
          },
        }
      : tripData.budget;

  const newTrip: Trip = {
    title: tripData.title,
    destination: tripData.destination,
    dates: tripData.dates,
    budget: budgetObj,
    id,
    createdBy: 'current-user',
    rating: 4.5 + Math.random(), // Random rating for demo
  };

  mockTrips.push(newTrip);
  return {...newTrip};
}

export function updateMockTrip(id: string, updates: any): Trip | undefined {
  const index = mockTrips.findIndex(trip => trip.id === id);
  if (index === -1) return undefined;

  mockTrips[index] = {
    ...mockTrips[index],
    ...updates,
    // If updating rating, clamp between 1-5
    ...(updates.rating !== undefined &&
      updates.rating > 5 ? { rating: 5 } :
      updates.rating < 1 ? { rating: 1 } : updates),
  };

  return { ...mockTrips[index] };
}

export function deleteMockTrip(id: string): boolean {
  const index = mockTrips.findIndex(trip => trip.id === id);
  if (index === -1) return false;

  mockTrips.splice(index, 1);
  return true;
}

// Helper function to generate ID
function generateId(): string {
  return 'trip-' + Math.random().toString(36).substr(2, 9);
}

export default { getMockTrips, getMockTripById, createMockTrip, updateMockTrip, deleteMockTrip };