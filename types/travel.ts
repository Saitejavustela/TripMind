// Core travel types for TripMind AI

export interface Trip {
  id: string;
  title: string;
  destination: string;
  dates: {
    start: string; // ISO date string
    end: string;
  };
  isPublic?: boolean;
  createdBy: string;
  downloadLink?: string;
  itinerary?: Itinerary;
  budget?: Budget;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Itinerary {
  duration: number; // in days
  dayPlan: DayPlan[];
}

export interface DayPlan {
  day: number;
  date?: string; // ISO date string
  activities: Activity[];
}

export interface Activity {
  name: string;
  type: 'attraction' | 'dining' | 'transport' | 'accommodation' | 'activity' | 'market' | 'cooking' | 'shopping' | 'other';
  startTime: string; // HH:MM format
  endTime: string;
  description: string;
  estimatedDuration: string;
  transport?: 'walking' | 'taxi' | 'metro' | 'bus' | 'train' | 'flight' | 'bike' | 'car';
  transportDetails?: string;
  location?: string;
  reservationLink?: string;
  bookingRequired?: boolean;
  cost?: number;
}

export interface Budget {
  total: number;
  breakdown: {
    transportation: number;
    accommodation: number;
    food: number;
    activities: number;
    miscellaneous: number;
  };
  currency: string;
}

export interface TripPreferences {
  travelStyle?: 'budget' | 'comfort' | 'luxury';
  interests?: string[];
  dietaryRestrictions?: string[];
  pace?: 'relaxed' | 'moderate' | 'packed';
  accommodationType?: 'hotel' | 'hostel' | 'airbnb' | 'resort' | 'any';
  transportationPreference?: 'public' | 'private' | 'mixed';
  groupType?: 'solo' | 'couple' | 'family' | 'friends' | 'business';
  specialRequirements?: string[];
}

export interface RecommendationRequest {
  destination: string;
  dates: { start: string; end: string };
  preferences: TripPreferences;
  budget: number;
  currency: string;
}

export interface RecommendationResult {
  hotels: HotelRecommendation[];
  restaurants: RestaurantRecommendation[];
  attractions: AttractionRecommendation[];
  transportation: TransportationRecommendation[];
  optimizedRoute: RouteOptimization;
}

export interface HotelRecommendation {
  id: string;
  name: string;
  address: string;
  rating: number;
  pricePerNight: number;
  amenities: string[];
  distanceFromCenter: string;
  images: string[];
  bookingUrl?: string;
}

export interface RestaurantRecommendation {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: 'budget' | 'moderate' | 'expensive' | 'luxury';
  address: string;
  specialties: string[];
  dietaryOptions: string[];
  openingHours: string;
  reservationUrl?: string;
}

export interface AttractionRecommendation {
  id: string;
  name: string;
  type: string;
  rating: number;
  description: string;
  address: string;
  openingHours: string;
  estimatedDuration: string;
  cost: number;
  images: string[];
  bestTimeToVisit: string;
  nearbyAttractions: string[];
}

export interface TransportationRecommendation {
  type: 'flight' | 'train' | 'bus' | 'car' | 'bike' | 'taxi';
  provider: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  cost: number;
  bookingUrl?: string;
}

export interface RouteOptimization {
  totalDistance: number;
  totalTime: number;
  optimizedOrder: string[];
  dailyRoutes: DailyRoute[];
}

export interface DailyRoute {
  day: number;
  activities: string[];
  totalDistance: number;
  totalTime: number;
  transportMode: string;
}

export type ExpenseCategory = 'transportation' | 'accommodation' | 'food' | 'activities' | 'miscellaneous';

export interface Expense {
  id: string;
  tripId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string; // ISO date string
  location?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  byCategory: Record<string, number>;
  byDay: Record<string, number>;
}

export interface ExpenseTrackingState {
  expenses: Expense[];
  budget: Budget;
  isTracking: boolean;
}