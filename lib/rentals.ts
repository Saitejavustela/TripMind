export interface RentalOption {
  id: string;
  provider: string;
  vehicleType: 'car' | 'bike' | 'scooter' | 'bicycle' | 'camper-van';
  vehicleModel: string;
  dailyRate: number;
  totalCost: number;
  rating: number;
  location: string;
  fuelPolicy: 'full-to-full' | 'same-to-same' | 'pre-purchase' | 'N/A';
  transmission: 'automatic' | 'manual' | 'single-speed' | 'electric-assist';
  seats: number;
  luggageCapacity: string;
  features: string[];
  bookingUrl: string;
  insurance: {
    collisionDamageWaiver: boolean;
    theftProtection: boolean;
    liability: number;
  };
  deposit: number;
}

export interface RentalRequest {
  destination: string;
  vehicleType?: 'car' | 'bike' | 'scooter' | 'bicycle' | 'camper-van' | 'any';
  pickupLocation: string;
  dates: {
    pickup: string;
    return: string;
  };
  duration: number; // days
  budget?: number;
}

/**
 * Rental Recommendation Engine - Provides recommendations for rental services
 * (cars, bikes, scooters, etc.) based on destination, dates, and user preferences
 */
export class RentalRecommendationEngine {
  private static rentalDatabase: Record<string, RentalOption[]> = {
    'Paris, France': [
      {
        id: 'rental-1',
        provider: 'Europcar',
        vehicleType: 'car',
        vehicleModel: 'Toyota Corolla',
        dailyRate: 45,
        totalCost: 315, // 7 days
        rating: 4.3,
        location: 'Paris Charles de Gaulle Airport',
        fuelPolicy: 'full-to-full',
        transmission: 'automatic',
        seats: 5,
        luggageCapacity: '3 large suitcases',
        features: ['GPS', 'AC', 'Bluetooth'],
        bookingUrl: 'https://www.europcar.com',
        insurance: {
          collisionDamageWaiver: true,
          theftProtection: true,
          liability: 1000000,
        },
        deposit: 200,
      },
      {
        id: 'rental-2',
        provider: 'Hertz',
        vehicleType: 'car',
        vehicleModel: 'Peugeot 308',
        dailyRate: 52,
        totalCost: 364,
        rating: 4.5,
        location: 'Paris Gare du Nord',
        fuelPolicy: 'same-to-same',
        transmission: 'manual',
        seats: 5,
        luggageCapacity: '2 large suitcases',
        features: ['GPS', 'Heated Seats', 'Apple CarPlay'],
        bookingUrl: 'https://www.hertz.com',
        insurance: {
          collisionDamageWaiver: true,
          theftProtection: true,
          liability: 1500000,
        },
        deposit: 250,
      },
      {
        id: 'rental-3',
        provider: 'Velib Paris',
        vehicleType: 'bicycle',
        vehicleModel: 'City Bike',
        dailyRate: 8,
        totalCost: 56,
        rating: 4.2,
        location: 'Multiple stations across Paris',
        fuelPolicy: 'N/A',
        transmission: 'single-speed',
        seats: 1,
        luggageCapacity: 'Basket or rack',
        features: ['Docking stations', '24/7 access', 'Maintenance included'],
        bookingUrl: 'https://www.velib-metropole.fr',
        insurance: {
          collisionDamageWaiver: false,
          theftProtection: true,
          liability: 0,
        },
        deposit: 150,
      },
    ],
    'Tokyo, Japan': [
      {
        id: 'rental-4',
        provider: 'Toyota Rent a Car',
        vehicleType: 'car',
        vehicleModel: 'Toyota Yaris',
        dailyRate: 6500, // JPY
        totalCost: 45500,
        rating: 4.6,
        location: 'Narita Airport',
        fuelPolicy: 'full-to-full',
        transmission: 'automatic',
        seats: 5,
        luggageCapacity: '2 suitcases',
        features: ['ETC', 'GPS', 'Winter tires available'],
        bookingUrl: 'https://rental.toyota.co.jp',
        insurance: {
          collisionDamageWaiver: true,
          theftProtection: true,
          liability: 30000000,
        },
        deposit: 30000,
      },
      {
        id: 'rental-5',
        provider: 'Docomo Bike Share',
        vehicleType: 'bicycle',
        vehicleModel: 'City E-Bike',
        dailyRate: 1500,
        totalCost: 10500,
        rating: 4.4,
        location: 'Multiple stations in Tokyo',
        fuelPolicy: 'N/A',
        transmission: 'electric-assist',
        seats: 1,
        luggageCapacity: 'Rear rack',
        features: ['Electric assist', 'GPS navigation', 'Rain cover'],
        bookingUrl: 'https://bikeshare.docomo.ne.jp',
        insurance: {
          collisionDamageWaiver: false,
          theftProtection: true,
          liability: 0,
        },
        deposit: 10000,
      },
    ],
  };

  private static calculateDuration(dates: { pickup: string; return: string }): number {
    const pickup = new Date(dates.pickup);
    const pickupReturn = new Date(dates.return);
    const diffTime = Math.abs(pickupReturn.getTime() - pickup.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  }

  static getRecommendations(request: RentalRequest): RentalOption[] {
    const { destination, vehicleType, dates, duration } = request;

    // Get rentals for destination
    const availableRentals = this.rentalDatabase[destination] || [];

    // Filter by vehicle type
    const filteredByType = availableRentals.filter(
      (rental) => rental.vehicleType === vehicleType
    );

    // If none found for specific vehicle type, fall back to any available
    const rentalsToUse = filteredByType.length > 0
      ? filteredByType
      : availableRentals;

    // Adjust costs based on actual duration
    const adjustedRentals = rentalsToUse.map((rental) => ({
      ...rental,
      dailyRate: rental.totalCost / Math.max(rental.totalCost / rental.dailyRate, 1),
      totalCost: rental.dailyRate * duration,
    }));

    // Sort by rating and value (rating/price)
    return adjustedRentals
      .sort((a, b) => {
        const valueA = a.rating / (a.dailyRate / 100);
        const valueB = b.rating / (b.dailyRate / 100);
        return valueB - valueA; // Higher value first
      })
      .slice(0, 5);
  }

  /**
   * Get rental options by vehicle type
   */
  static getByVehicleType(
    destination: string,
    vehicleType: 'car' | 'bike' | 'scooter' | 'bicycle' | 'camper-van'
  ): RentalOption[] {
    return (this.rentalDatabase[destination] || []).filter(
      (rental) => rental.vehicleType === vehicleType
    );
  }

  /**
   * Calculate total cost including insurance and deposit
   */
  static calculateTotalCost(
    rental: RentalOption,
    duration: number,
    includeInsurance: boolean = true
  ): number {
    let total = rental.dailyRate * duration;
    if (includeInsurance) {
      // Add estimated insurance cost (simplified)
      total += Math.min(rental.deposit * 0.1, 50); // Insurance ~10% of deposit, max $50
    }
    return total + rental.deposit; // Deposit held, not necessarily spent
  }
}

export const rentalEngine = new RentalRecommendationEngine();