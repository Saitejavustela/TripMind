'use client';

import React, { useState } from 'react';

interface RentalOption {
  id: string;
  provider: string;
  vehicleType: 'car' | 'bike' | 'scooter' | 'bicycle' | 'camper-van';
  vehicleModel: string;
  dailyRate: number;
  totalCost: number;
  rating: number;
  location: string;
  fuelPolicy: string;
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

interface RentalRecommendationsProps {
  destination: string;
  vehicleType?: 'car' | 'bike' | 'scooter' | 'bicycle' | 'camper-van' | 'any';
}

export default function RentalRecommendations({
  destination,
  vehicleType = 'car'
}: RentalRecommendationsProps) {
  const [rentals, setRentals] = useState<RentalOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRentals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/rentals?destination=${encodeURIComponent(destination)}&vehicleType=${vehicleType}`);
      const result = await response.json();
      if (result.success) {
        setRentals(result.data);
      } else {
        throw new Error(result.error || 'Failed to get rentals');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // In a real implementation, we'd fetch on mount
  // For now, we'll use mock data to demonstrate
  // useEffect(() => {
  //   fetchRentals();
  // }, [destination, vehicleType]);

  // Mock data for demonstration
  const mockRentals: RentalOption[] = [
    {
      id: 'rental-1',
      provider: 'Europcar',
      vehicleType: 'car',
      vehicleModel: 'Toyota Corolla',
      dailyRate: 45,
      totalCost: 315,
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
    }
  ];

  // Filter by vehicle type if specified
  const filteredRentals = vehicleType === 'any'
    ? mockRentals
    : mockRentals.filter(r => r.vehicleType === vehicleType);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">
        {vehicleType === 'any' ? 'All Rentals' : vehicleType.toUpperCase()} Recommendations
      </h2>

      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => {}}
          className={`px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 ${
            vehicleType === 'car' ? 'bg-blue-600 text-white' : ''
          }`}
        >
          Car
        </button>
        <button
          onClick={() => {}}
          className={`px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 ${
            vehicleType === 'bicycle' ? 'bg-blue-600 text-white' : ''
          }`}
        >
          Bike
        </button>
        <button
          onClick={() => {}}
          className={`px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 ${
            vehicleType === 'scooter' ? 'bg-blue-600 text-white' : ''
          }`}
        >
          Scooter
        </button>
      </div>

      {isLoading ? (
        <p className="text-center py-8">Loading rental options...</p>
      ) : error ? (
        <p className="text-red-500 text-center py-8">Error: {error}</p>
      ) : filteredRentals.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
          No {vehicleType} rentals available for {destination}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRentals.map((rental) => (
            <div
              key={rental.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium">{rental.provider}</h3>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium">{rental.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-1">
                  {rental.vehicleModel} • {rental.location}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <span className="font-medium">Daily Rate:</span>
                    <span>${rental.dailyRate.toLocaleString()}/day</span>
                  </div>
                  <div>
                    <span className="font-medium">Total:</span>
                    <span>${rental.totalCost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium">Seats:</span>
                    <span>{rental.seats}</span>
                  </div>
                  <div>
                    <span className="font-medium">Transmission:</span>
                    <span>{rental.transmission}</span>
                  </div>
                  <div>
                    <span className="font-medium">Fuel Policy:</span>
                    <span>{rental.fuelPolicy}</span>
                  </div>
                  <div>
                    <span className="font-medium">Luggage:</span>
                    <span>{rental.luggageCapacity}</span>
                  </div>
                </div>

                {rental.features.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {rental.features.map((feature, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-baseline mb-4">
                  <span className="text-gray-600 text-sm">Deposit:</span>
                  <span className="font-medium ml-2">${rental.deposit}</span>
                  <span className="ml-4 text-sm text-gray-500">
                    (refundable)
                  </span>
                </div>

                <a
                  href={rental.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-block text-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Book Now
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}