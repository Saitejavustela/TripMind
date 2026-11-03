import {
  HotelRecommendation,
  RestaurantRecommendation,
  AttractionRecommendation,
  TransportationRecommendation,
  RecommendationRequest,
  RecommendationResult,
  TripPreferences,
} from '@/types/travel';
import { routeOptimizer } from '@/lib/route-optimizer';
import { destinationService } from '@/lib/destination-service';

/**
 * Recommendation Engine - Generates personalized recommendations for hotels,
 * restaurants, attractions, and transportation based on user preferences and budget
 */
export class RecommendationEngine {
  private static instance: RecommendationEngine;

  private constructor() {}

  public static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine();
    }
    return RecommendationEngine.instance;
  }

  /**
   * Get comprehensive recommendations for a trip
   */
  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResult> {
    const { destination, dates, preferences, budget, currency } = request;

    // Generate all recommendation types in parallel
    const [hotels, restaurants, attractions, transportation] = await Promise.all([
      this.getHotelRecommendations(destination, dates, preferences, budget),
      this.getRestaurantRecommendations(destination, dates, preferences),
      this.getAttractionRecommendations(destination, dates, preferences),
      this.getTransportationRecommendations(destination, dates, preferences),
    ]);

    // Optimize route
    const optimizedRoute = routeOptimizer.optimizeRoute({
      attractions,
      startTime: '09:00',
      endTime: '22:00',
      preferences: {
        clustering: true,
        optimizeBy: 'distance',
      },
    });

    return {
      hotels,
      restaurants,
      attractions,
      transportation,
      optimizedRoute,
    };
  }

  /**
   * Get hotel recommendations based on budget, preferences, and location
   */
  private async getHotelRecommendations(
    destination: string,
    dates: { start: string; end: string },
    preferences: TripPreferences,
    budget: number
  ): Promise<HotelRecommendation[]> {
    const dest = destinationService.resolveDestination(destination);
    const mockHotels: HotelRecommendation[] = [
      {
        id: `hotel-1-${dest.id}`,
        name: `${dest.city} Grand Palace Hotel`,
        address: `10 Central Boulevard, ${dest.fullName}`,
        rating: 4.8,
        pricePerNight: Math.max(160, Math.round((budget * 0.4) / Math.max(1, this.calculateNights(dates)))),
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Concierge'],
        distanceFromCenter: '0.3 km',
        images: ['/images/hotel-grand-palace.jpg'],
        bookingUrl: `https://booking.com/search?ss=${encodeURIComponent(dest.city)}`,
      },
      {
        id: `hotel-2-${dest.id}`,
        name: `Boutique Heritage Hotel ${dest.city}`,
        address: `15 Old Town Square, ${dest.fullName}`,
        rating: 4.6,
        pricePerNight: Math.max(110, Math.round((budget * 0.28) / Math.max(1, this.calculateNights(dates)))),
        amenities: ['WiFi', 'Breakfast', 'Art Gallery', 'Rooftop Bar'],
        distanceFromCenter: '0.8 km',
        images: ['/images/hotel-boutique-art.jpg'],
        bookingUrl: `https://booking.com/search?ss=${encodeURIComponent(dest.city)}`,
      },
      {
        id: `hotel-3-${dest.id}`,
        name: `${dest.city} Central Backpackers Hostel`,
        address: `50 Station Way, ${dest.fullName}`,
        rating: 4.3,
        pricePerNight: 45,
        amenities: ['WiFi', 'Kitchen', 'Laundry', 'Common Room'],
        distanceFromCenter: '1.5 km',
        images: ['/images/hotel-backpackers.jpg'],
        bookingUrl: `https://booking.com/search?ss=${encodeURIComponent(dest.city)}`,
      },
      {
        id: `hotel-4-${dest.id}`,
        name: `The Skyline Resort & Spa at ${dest.city}`,
        address: `1 Promenade Way, ${dest.fullName}`,
        rating: 4.9,
        pricePerNight: Math.max(320, Math.round((budget * 0.55) / Math.max(1, this.calculateNights(dates)))),
        amenities: ['WiFi', 'Pool', 'Spa', 'Fine Dining Restaurant', 'Butler Service'],
        distanceFromCenter: '1.2 km',
        images: ['/images/hotel-luxury-resort.jpg'],
        bookingUrl: `https://booking.com/search?ss=${encodeURIComponent(dest.city)}`,
      },
    ];

    // Filter by budget and preferences
    const budgetPerNight = budget * 0.4 / this.calculateNights(dates); // 40% of budget for accommodation

    return mockHotels
      .filter(hotel => {
        // Budget filter
        if (hotel.pricePerNight > budgetPerNight * 1.5) return false;

        // Preference filters
        if (preferences.accommodationType && preferences.accommodationType !== 'any') {
          // In a real app, we'd have accommodation type tags
          // For now, we'll skip this filter
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by rating * price efficiency
        const scoreA = a.rating / (a.pricePerNight / budgetPerNight);
        const scoreB = b.rating / (b.pricePerNight / budgetPerNight);
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }

  /**
   * Get restaurant recommendations based on cuisine preferences and dietary needs
   */
  private async getRestaurantRecommendations(
    destination: string,
    dates: { start: string; end: string },
    preferences: TripPreferences
  ): Promise<RestaurantRecommendation[]> {
    const dest = destinationService.resolveDestination(destination);
    const cuisines = dest.popularCuisines;
    const dishes = dest.signatureDishes;

    const mockRestaurants: RestaurantRecommendation[] = [
      {
        id: `rest-1-${dest.id}`,
        name: `${dest.city} Signature Kitchen`,
        cuisine: cuisines[0] || 'Local Traditional',
        rating: 4.8,
        priceRange: 'moderate',
        address: `12 Market Boulevard, ${dest.fullName}`,
        specialties: [dishes[0] || 'Chef Platter', dishes[1] || 'House Specialty', 'Artisan Dessert'],
        dietaryOptions: ['Vegetarian', 'Gluten-Free Options'],
        openingHours: '12:00-23:00',
        reservationUrl: `https://opentable.com/search?q=${encodeURIComponent(dest.city)}`,
      },
      {
        id: `rest-2-${dest.id}`,
        name: `The Grand Panoramic at ${dest.city}`,
        cuisine: 'Modern Fine Dining',
        rating: 4.9,
        priceRange: 'expensive',
        address: `88 High Promenade, ${dest.fullName}`,
        specialties: ['Tasting Menu', 'Sommelier Selection', 'Seasonal Truffle'],
        dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-Free'],
        openingHours: '12:30-14:30, 19:30-22:30',
        reservationUrl: `https://opentable.com/search?q=${encodeURIComponent(dest.city)}`,
      },
      {
        id: `rest-3-${dest.id}`,
        name: `${dest.city} Street Bites & Grill`,
        cuisine: cuisines[1] || 'Street Food',
        rating: 4.5,
        priceRange: 'budget',
        address: `34 Central Lane, ${dest.fullName}`,
        specialties: [dishes[1] || 'Street Bites', 'Crispy Specialties', 'House Drink'],
        dietaryOptions: ['Vegetarian', 'Vegan', 'Halal'],
        openingHours: '11:00-23:00',
      },
      {
        id: `rest-4-${dest.id}`,
        name: `Trattoria & Bistro ${dest.city}`,
        cuisine: cuisines[2] || 'Regional Bistro',
        rating: 4.6,
        priceRange: 'moderate',
        address: `2 Rue de la Paix / Plaza, ${dest.fullName}`,
        specialties: [dishes[2] || 'Regional Catch', 'Artisan Flatbread', 'Local Wine'],
        dietaryOptions: ['Vegetarian', 'Pescatarian'],
        openingHours: '12:00-23:00',
      },
      {
        id: `rest-5-${dest.id}`,
        name: `${dest.city} Garden Vegan Cafe`,
        cuisine: 'Vegetarian/Vegan',
        rating: 4.4,
        priceRange: 'moderate',
        address: `12 Green Alley, ${dest.fullName}`,
        specialties: ['Botanical Bowl', 'Avocado & Herb Toast', 'Raw Desserts'],
        dietaryOptions: ['Vegan', 'Vegetarian', 'Gluten-Free', 'Raw'],
        openingHours: '10:00-21:00',
      },
    ];

    // Filter by dietary restrictions
    let filtered = mockRestaurants;
    if (preferences.dietaryRestrictions && preferences.dietaryRestrictions.length > 0) {
      filtered = mockRestaurants.filter(rest =>
        preferences.dietaryRestrictions!.some(req =>
          rest.dietaryOptions.some(opt => opt.toLowerCase().includes(req.toLowerCase()))
        )
      );
    }

    // Sort by rating
    return filtered
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  }

  /**
   * Get attraction recommendations based on interests and pace
   */
  private async getAttractionRecommendations(
    destination: string,
    dates: { start: string; end: string },
    preferences: TripPreferences
  ): Promise<AttractionRecommendation[]> {
    const dest = destinationService.resolveDestination(destination);
    const attractions = dest.iconicAttractions;

    const mockAttractions: AttractionRecommendation[] = [
      {
        id: `attr-1-${dest.id}`,
        name: attractions[0] || `${dest.city} Landmark Tower`,
        type: 'Landmark',
        rating: 4.8,
        description: `Iconic monument with panoramic observation point overlooking ${dest.city}`,
        address: `Central Plaza, ${dest.fullName}`,
        openingHours: '09:00-23:00',
        estimatedDuration: '2-3 hours',
        cost: 25.0,
        images: ['/images/eiffel-tower.jpg'],
        bestTimeToVisit: 'Early morning or sunset',
        nearbyAttractions: [attractions[1] || 'Museum Promenade'],
      },
      {
        id: `attr-2-${dest.id}`,
        name: attractions[1] || `${dest.city} National Museum of Art & History`,
        type: 'Museum',
        rating: 4.7,
        description: `World-renowned cultural museum housing masterpieces and historic treasures of ${dest.city}`,
        address: `Museum Mile, ${dest.fullName}`,
        openingHours: '09:30-18:00 (closed Mondays)',
        estimatedDuration: '3-4 hours',
        cost: 18.0,
        images: ['/images/louvre.jpg'],
        bestTimeToVisit: 'Wednesday-Friday mornings',
        nearbyAttractions: ['City Gardens', 'Historic Hall'],
      },
      {
        id: `attr-3-${dest.id}`,
        name: attractions[2] || `${dest.city} Old Town & Heritage Quarter`,
        type: 'Neighborhood',
        rating: 4.6,
        description: `Atmospheric historic district with cobblestone avenues, cafes, and artisan shops`,
        address: `Old Town Center, ${dest.fullName}`,
        openingHours: 'Open 24/7',
        estimatedDuration: '2-3 hours',
        cost: 0,
        images: ['/images/notre-dame.jpg'],
        bestTimeToVisit: 'Afternoon or evening',
        nearbyAttractions: [attractions[0] || 'Central Plaza'],
      },
      {
        id: `attr-4-${dest.id}`,
        name: attractions[3] || `${dest.city} Waterfront Promenade & Botanical Gardens`,
        type: 'Nature & Landmark',
        rating: 4.7,
        description: `Scenic promenade, lush gardens, and sweeping city vistas`,
        address: `Waterfront Walk, ${dest.fullName}`,
        openingHours: '06:00-22:00',
        estimatedDuration: '2 hours',
        cost: 0,
        images: ['/images/montmartre.jpg'],
        bestTimeToVisit: 'Late afternoon for golden hour',
        nearbyAttractions: ['Marina District'],
      },
    ];

    // Filter by interests if provided
    let filtered = mockAttractions;
    if (preferences.interests && preferences.interests.length > 0) {
      // Return matching
    }

    // Adjust count based on pace preference
    const paceMultiplier = {
      relaxed: 0.5,
      moderate: 0.75,
      packed: 1.0,
    };
    const multiplier = paceMultiplier[preferences.pace || 'moderate'];
    const count = Math.ceil(mockAttractions.length * multiplier);

    // Sort by rating and return top N
    return filtered
      .sort((a, b) => b.rating - a.rating)
      .slice(0, count);
  }

  /**
   * Get transportation recommendations
   */
  private async getTransportationRecommendations(
    destination: string,
    dates: { start: string; end: string },
    preferences: TripPreferences
  ): Promise<TransportationRecommendation[]> {
    const dest = destinationService.resolveDestination(destination);
    const mockTransport: TransportationRecommendation[] = [
      {
        type: 'flight',
        provider: 'International Flag Carrier',
        from: 'Major Departure Hub',
        to: `${dest.city} International Airport`,
        departureTime: '10:00',
        arrivalTime: '14:30',
        duration: '4h 30m',
        cost: 520,
        bookingUrl: `https://google.com/travel/flights?q=flights+to+${encodeURIComponent(dest.city)}`,
      },
      {
        type: 'flight',
        provider: 'Budget Express Airways',
        from: 'Regional Airport',
        to: `${dest.city} Airport`,
        departureTime: '14:00',
        arrivalTime: '18:30',
        duration: '4h 30m',
        cost: 310,
        bookingUrl: 'https://skyscanner.com',
      },
      {
        type: 'train',
        provider: 'High-Speed Express Rail',
        from: 'Intercity Terminal',
        to: `${dest.city} Central Station`,
        departureTime: '08:30',
        arrivalTime: '11:45',
        duration: '3h 15m',
        cost: 95,
        bookingUrl: 'https://thetrainline.com',
      },
    ];

    // Filter by preference
    if (preferences.transportationPreference === 'public') {
      return mockTransport.filter(t => t.type === 'train');
    }
    if (preferences.transportationPreference === 'private') {
      return mockTransport.filter(t => t.type === 'flight');
    }

    return mockTransport;
  }

  /**
   * Calculate number of nights between dates
   */
  private calculateNights(dates: { start: string; end: string }): number {
    const start = new Date(dates.start);
    const end = new Date(dates.end);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export const recommendationEngine = RecommendationEngine.getInstance();