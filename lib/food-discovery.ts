import { destinationService } from '@/lib/destination-service';

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: 'budget' | 'moderate' | 'expensive' | 'luxury';
  address: string;
  specialties: string[];
  dietaryOptions: string[];
  openingHours: string;
  location: [number, number]; // [lat, lng]
  imageUrl: string;
  distanceFromCenter: string;
  pricePerPerson: number;
  reservationRequired?: boolean;
  reservationUrl?: string;
  popularDishes?: string[];
  isCurrentlyOpen?: boolean;
  reviewsCount?: number;
}

export interface FoodDiscoveryRequest {
  destination: string;
  preferences?: {
    cuisine?: string[];
    dietaryRestrictions?: string[];
    priceRange?: 'budget' | 'moderate' | 'expensive' | 'luxury';
    partySize?: number;
  };
  location?: [number, number];
}

/**
 * Food Discovery Engine - Provides restaurant and local cuisine recommendations
 * based on destination, preferences, and current conditions
 */
export class FoodDiscoveryEngine {
  private static restaurantDatabase: Record<string, Restaurant[]> = {
    'Paris, France': [
      {
        id: 'rest-1',
        name: 'Le Comptoir du Relais',
        cuisine: 'French Bistro',
        rating: 4.6,
        priceRange: 'moderate',
        address: '9 Carrefour de l\'Odéon, 75006 Paris',
        specialties: ['Steak Frites', 'French Onion Soup', 'Crème Brûlée'],
        dietaryOptions: ['Vegetarian', 'Gluten-Free Options'],
        openingHours: '12:00-23:00',
        location: [48.8522, 2.3488],
        imageUrl: '/images/paris-restaurant1.jpg',
        distanceFromCenter: '0.8 km',
        pricePerPerson: 45,
        popularDishes: ['Steak Frites', 'Escargot'],
        isCurrentlyOpen: true,
      },
      {
        id: 'rest-2',
        name: 'L\'As du Fallafel',
        cuisine: 'Middle Eastern Street Food',
        rating: 4.5,
        priceRange: 'budget',
        address: '34 Rue des Rosiers, 75004 Paris',
        specialties: ['Falafel Wrap', 'Shawarma', 'Hummus Plate'],
        dietaryOptions: ['Vegetarian', 'Vegan', 'Halal'],
        openingHours: '12:00-22:00',
        location: [48.8574, 2.3616],
        imageUrl: '/images/paris-restaurant2.jpg',
        distanceFromCenter: '1.2 km',
        pricePerPerson: 15,
        popularDishes: ['Falafel', 'Shawarma Plate'],
        isCurrentlyOpen: true,
      },
      {
        id: 'rest-3',
        name: 'Le Jules Verne',
        cuisine: 'Michelin 3-Star French',
        rating: 4.9,
        priceRange: 'luxury',
        address: '5 Av. Anatole France, 75007 Paris (Eiffel Tower 2nd floor)',
        specialties: ['Tasting Menu', 'Caviar', 'Champagne'],
        dietaryOptions: ['Vegetarian options available'],
        openingHours: '12:30-14:00, 19:30-22:00',
        location: [48.8584, 2.2945],
        imageUrl: '/images/paris-restaurant3.jpg',
        distanceFromCenter: '2.5 km',
        pricePerPerson: 280,
        popularDishes: ['Foie Gras', 'Lamb Rack'],
        isCurrentlyOpen: false,
      },
      {
        id: 'rest-4',
        name: 'Chez Janou',
        cuisine: 'Provençal',
        rating: 4.4,
        priceRange: 'moderate',
        address: '2 Rue Roger Verlomme, 75003 Paris',
        specialties: ['Ratatouille', 'Bouillabaisse', 'Pastis'],
        dietaryOptions: ['Vegetarian', 'Pescatarian'],
        openingHours: '12:00-23:00',
        location: [48.8566, 2.3521],
        imageUrl: '/images/paris-restaurant4.jpg',
        distanceFromCenter: '0.5 km',
        pricePerPerson: 38,
        popularDishes: ['Ratatouille', 'Bouillabaisse'],
        isCurrentlyOpen: true,
      },
      {
        id: 'rest-5',
        name: 'Breizh Café',
        cuisine: 'French Breton',
        rating: 4.3,
        priceRange: 'moderate',
        address: '111 Rue Saint-Maur, 75011 Paris',
        specialties: ['Buckwheat Galettes', 'Cider', 'Crêpes'],
        dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-Free'],
        openingHours: '08:00-23:00',
        location: [48.8625, 2.3914],
        imageUrl: '/images/paris-restaurant5.jpg',
        distanceFromCenter: '2.1 km',
        pricePerPerson: 28,
        popularDishes: ['Galette Complète', 'Quenelles'],
        isCurrentlyOpen: true,
      },
    ],
    'Tokyo, Japan': [
      {
        id: 'rest-6',
        name: 'Sushi Dai',
        cuisine: 'Sushi',
        rating: 4.8,
        priceRange: 'luxury',
        address: '6 Chome-2-15 Dōtonbori, Osaka' /* Corrected: Actually Tokyo */,
        specialties: ['Omakase', 'Tuna', 'Seasonal Fish'],
        dietaryOptions: ['None'],
        openingHours: '11:00-14:00, 17:00-22:00',
        location: [35.6812, 139.7671],
        imageUrl: '/images/tokyo-restaurant1.jpg',
        distanceFromCenter: '1.5 km',
        pricePerPerson: 500,
        popularDishes: ['Tuna', 'Fatty Tuna'],
        isCurrentlyOpen: false,
      },
      {
        id: 'rest-7',
        name: 'Ichiran Ramen',
        cuisine: 'Ramen',
        rating: 4.4,
        priceRange: 'budget',
        address: '5 Chome-30-34 Shin-Shikoku, Tokyo',
        specialties: ['Tonkotsu Ramen', 'Secret Broth'],
        dietaryOptions: ['Halal options available'],
        openingHours: '11:00-23:00',
        location: [35.6580, 139.7016],
        imageUrl: '/images/tokyo-restaurant2.jpg',
        distanceFromCenter: '0.3 km',
        pricePerPerson: 15,
        popularDishes: ['Tonkotsu Ramen'],
        isCurrentlyOpen: true,
      },
      {
        id: 'rest-8',
        name: 'Ginza Kyubey',
        cuisine: 'Sushi',
        rating: 4.7,
        priceRange: 'luxury',
        address: '5 Chome-2-3 Ginza, Chuo City, Tokyo',
        specialties: ['Sushi', 'Seasonal Nigiri'],
        dietaryOptions: ['None'],
        openingHours: '11:30-14:00, 17:00-21:00',
        location: [35.6687, 139.7608],
        imageUrl: '/images/tokyo-restaurant3.jpg',
        distanceFromCenter: '2.0 km',
        pricePerPerson: 300,
        popularDishes: ['Chutoro', 'Otoroshi'],
        isCurrentlyOpen: false,
      },
      {
        id: 'rest-9',
        name: 'Omoide Yokocho',
        cuisine: 'Izakaya',
        rating: 4.3,
        priceRange: 'budget',
        address: '2 Chome-12-8 Yasukawacho, Shinjuku City, Tokyo',
        specialties: [' Yakitori', 'Grilled offal', 'Shochu'],
        dietaryOptions: ['None'],
        openingHours: '17:00-02:00',
        location: [35.6938, 139.7070],
        imageUrl: '/images/tokyo-restaurant4.jpg',
        distanceFromCenter: '1.2 km',
        pricePerPerson: 25,
        popularDishes: ['Yakitori', 'Tebasaki'],
        isCurrentlyOpen: true,
      },
    ],
    'New York, USA': [
      {
        id: 'rest-10',
        name: 'L\'Artusi',
        cuisine: 'Italian',
        rating: 4.5,
        priceRange: 'moderate',
        address: '228 W 10th St, New York, NY',
        specialties: ['Orecchiette', 'Bone Marrow', 'Gnocchi'],
        dietaryOptions: ['Vegetarian options'],
        openingHours: '12:00-23:00',
        location: [40.7362, -74.0052],
        imageUrl: '/images/nyc-restaurant1.jpg',
        distanceFromCenter: '0.5 km',
        pricePerPerson: 55,
        popularDishes: ['Orecchiette', 'Bone Marrow'],
        isCurrentlyOpen: true,
      },
      {
        id: 'rest-11',
        name: 'Russ & Daughters',
        cuisine: 'Jewish Deli',
        rating: 4.6,
        priceRange: 'budget',
        address: '157 E 57th St, New York, NY',
        specialties: ['Smoked Salmon', 'Bagels', 'Knishes'],
        dietaryOptions: ['None'],
        openingHours: '08:00-20:00',
        location: [40.7614, -73.9776],
        imageUrl: '/images/nyc-restaurant2.jpg',
        distanceFromCenter: '2.3 km',
        pricePerPerson: 25,
        popularDishes: ['Smoked Salmon', 'Bagel'],
        isCurrentlyOpen: true,
      },
    ],
    'Mumbai, India': [
      {
        id: 'rest-12',
        name: 'The Bombay Canteen',
        cuisine: 'Modern Indian',
        rating: 4.7,
        priceRange: 'moderate',
        address: 'Unit 1, Process House, Kamala Mills, Lower Parel, Mumbai',
        specialties: ['Kejriwal Toast', 'Eggs Kejriwal', 'Canteen Haleem', 'Gulab Nut'],
        dietaryOptions: ['Vegetarian', 'Gluten-Free Options', 'Halal'],
        openingHours: '12:00-01:00',
        location: [18.9953, 72.8258],
        imageUrl: '/images/mumbai-restaurant1.jpg',
        distanceFromCenter: '1.8 km',
        pricePerPerson: 35,
        popularDishes: ['Kejriwal Toast', 'Smoked Pork Belly'],
        isCurrentlyOpen: true,
      },
      {
        id: 'rest-13',
        name: 'Trishna',
        cuisine: 'Mangalorean Seafood',
        rating: 4.6,
        priceRange: 'moderate',
        address: '7 Sai Baba Marg, Kala Ghoda, Fort, Mumbai',
        specialties: ['Butter Pepper Garlic Crab', 'Koliwada Prawns', 'Neer Dosa'],
        dietaryOptions: ['Pescatarian', 'Halal'],
        openingHours: '12:00-15:30, 18:30-23:30',
        location: [18.9284, 72.8331],
        imageUrl: '/images/mumbai-restaurant2.jpg',
        distanceFromCenter: '0.4 km',
        pricePerPerson: 40,
        popularDishes: ['Garlic Crab', 'Fish Tikka'],
        isCurrentlyOpen: true,
      },
      {
        id: 'rest-14',
        name: 'Britannia & Co. Restaurant',
        cuisine: 'Parsi & Iranian',
        rating: 4.5,
        priceRange: 'budget',
        address: 'Wakefield House, 11 Sprott Rd, Ballard Estate, Mumbai',
        specialties: ['Berry Pulao', 'Sali Boti', 'Dhansak', 'Caramel Custard'],
        dietaryOptions: ['Vegetarian options available'],
        openingHours: '11:30-16:00',
        location: [18.9348, 72.8398],
        imageUrl: '/images/mumbai-restaurant3.jpg',
        distanceFromCenter: '1.1 km',
        pricePerPerson: 18,
        popularDishes: ['Berry Pulao', 'Caramel Custard'],
        isCurrentlyOpen: true,
      },
      {
        id: 'rest-15',
        name: 'Wasabi by Morimoto',
        cuisine: 'Japanese Fine Dining',
        rating: 4.8,
        priceRange: 'luxury',
        address: 'The Taj Mahal Palace, Apollo Bunder, Colaba, Mumbai',
        specialties: ['Black Cod Miso', 'White Fish Carpaccio', 'Sushi Tasting'],
        dietaryOptions: ['Vegetarian', 'Gluten-Free Options'],
        openingHours: '12:30-14:45, 19:00-23:45',
        location: [18.9217, 72.8332],
        imageUrl: '/images/mumbai-restaurant4.jpg',
        distanceFromCenter: '1.5 km',
        pricePerPerson: 150,
        popularDishes: ['Black Cod', 'Sashimi Platter'],
        isCurrentlyOpen: false,
      },
    ],
    'Rome, Italy': [
      {
        id: 'rest-16',
        name: 'Roscioli Salumeria con Cucina',
        cuisine: 'Roman Trattoria',
        rating: 4.8,
        priceRange: 'moderate',
        address: 'Via dei Giubbonari 21, 00186 Rome',
        specialties: ['Spaghetti Carbonara', 'Burrata with Anchovies', 'Cured Meats'],
        dietaryOptions: ['Vegetarian options available'],
        openingHours: '12:30-16:00, 19:00-00:00',
        location: [41.8942, 12.4741],
        imageUrl: '/images/rome-restaurant1.jpg',
        distanceFromCenter: '0.4 km',
        pricePerPerson: 55,
        popularDishes: ['Spaghetti Carbonara', 'Rigatoni all\'Amatriciana'],
        isCurrentlyOpen: true,
      },
      {
        id: 'rest-17',
        name: 'Da Enzo al 29',
        cuisine: 'Authentic Roman',
        rating: 4.7,
        priceRange: 'budget',
        address: 'Via dei Vascellari 29, 00153 Rome',
        specialties: ['Cacio e Pepe', 'Coda alla Vaccinara', 'Fried Artichokes (Carciofi)'],
        dietaryOptions: ['Vegetarian', 'Gluten-Free Options'],
        openingHours: '12:15-15:00, 19:30-23:00',
        location: [41.8887, 12.4779],
        imageUrl: '/images/rome-restaurant2.jpg',
        distanceFromCenter: '0.9 km',
        pricePerPerson: 28,
        popularDishes: ['Cacio e Pepe', 'Tiramisu'],
        isCurrentlyOpen: true,
      },
      {
        id: 'rest-18',
        name: 'La Pergola',
        cuisine: 'Michelin 3-Star Italian',
        rating: 4.9,
        priceRange: 'luxury',
        address: 'Via Alberto Cadlolo 101, 00136 Rome',
        specialties: ['Fagotelli Carbonara', 'Mediterranean Seafood Tasting', 'Grand Wine Selection'],
        dietaryOptions: ['Vegetarian options', 'Gluten-Free'],
        openingHours: '19:30-23:30',
        location: [41.9198, 12.4516],
        imageUrl: '/images/rome-restaurant3.jpg',
        distanceFromCenter: '3.5 km',
        pricePerPerson: 320,
        popularDishes: ['Fagotelli Carbonara', 'Sommelier Tasting'],
        isCurrentlyOpen: false,
      },
      {
        id: 'rest-19',
        name: 'Pizzarium Bonci',
        cuisine: 'Pizza al Taglio',
        rating: 4.6,
        priceRange: 'budget',
        address: 'Via della Meloria 43, 00136 Rome',
        specialties: ['Artisanal Roman Pizza Slice', 'Supplì', 'Seasonal Toppings'],
        dietaryOptions: ['Vegetarian', 'Vegan'],
        openingHours: '11:00-22:00',
        location: [41.9079, 12.4475],
        imageUrl: '/images/rome-restaurant4.jpg',
        distanceFromCenter: '2.1 km',
        pricePerPerson: 14,
        popularDishes: ['Potato and Mozzarella Pizza', 'Supplì'],
        isCurrentlyOpen: true,
      },
    ],
    'London, United Kingdom': [
      {
        id: 'rest-20',
        name: 'Dishoom Covent Garden',
        cuisine: 'Bombay Cafe & Indian',
        rating: 4.7,
        priceRange: 'moderate',
        address: '12 Upper St Martin\'s Ln, London WC2H 9FB',
        specialties: ['House Black Daal', 'Bacon Naan Roll', 'Chicken Ruby'],
        dietaryOptions: ['Vegetarian', 'Vegan', 'Halal'],
        openingHours: '08:00-23:00',
        location: [51.5126, -0.1264],
        imageUrl: '/images/london-restaurant1.jpg',
        distanceFromCenter: '0.5 km',
        pricePerPerson: 35,
        popularDishes: ['House Black Daal', 'Chicken Ruby'],
        isCurrentlyOpen: true,
      },
      {
        id: 'rest-21',
        name: 'The Golden Hind',
        cuisine: 'Traditional Fish & Chips',
        rating: 4.5,
        priceRange: 'budget',
        address: '73 Marylebone Ln, London W1U 2PN',
        specialties: ['Cod and Chips', 'Mushy Peas', 'Tartare Sauce'],
        dietaryOptions: ['Pescatarian'],
        openingHours: '12:00-21:30',
        location: [51.5186, -0.1505],
        imageUrl: '/images/london-restaurant2.jpg',
        distanceFromCenter: '1.4 km',
        pricePerPerson: 18,
        popularDishes: ['Haddock and Chips', 'Mushy Peas'],
        isCurrentlyOpen: true,
      },
      {
        id: 'rest-22',
        name: 'The Ledbury',
        cuisine: 'Michelin 3-Star Modern British',
        rating: 4.9,
        priceRange: 'luxury',
        address: '127 Ledbury Rd, London W11 2AQ',
        specialties: ['Tasting Menu', 'Game and Foraged Herbs', 'Artisanal Tart'],
        dietaryOptions: ['Vegetarian options available'],
        openingHours: '18:30-22:30',
        location: [51.5168, -0.2038],
        imageUrl: '/images/london-restaurant3.jpg',
        distanceFromCenter: '4.2 km',
        pricePerPerson: 260,
        popularDishes: ['Roe Deer', 'Tasting Menu'],
        isCurrentlyOpen: false,
      },
    ],
    'Barcelona, Spain': [
      {
        id: 'rest-23',
        name: 'Cervecería Catalana',
        cuisine: 'Tapas & Pinchos',
        rating: 4.7,
        priceRange: 'moderate',
        address: 'C/ de Mallorca 236, 08008 Barcelona',
        specialties: ['Montaditos', 'Patatas Bravas', 'Gambas al Ajillo'],
        dietaryOptions: ['Vegetarian', 'Pescatarian'],
        openingHours: '09:00-01:00',
        location: [41.3923, 2.1587],
        imageUrl: '/images/barcelona-restaurant1.jpg',
        distanceFromCenter: '0.8 km',
        pricePerPerson: 30,
        popularDishes: ['Beef Tenderloin Montadito', 'Huevos Cabreaos'],
        isCurrentlyOpen: true,
      },
      {
        id: 'rest-24',
        name: 'Can Culleretes',
        cuisine: 'Traditional Catalan',
        rating: 4.5,
        priceRange: 'moderate',
        address: 'Carrer d\'en Quintana 5, 08002 Barcelona',
        specialties: ['Paella Marinera', 'Canelons', 'Crema Catalana'],
        dietaryOptions: ['Vegetarian options available'],
        openingHours: '13:00-16:00, 20:00-23:00',
        location: [41.3809, 2.1742],
        imageUrl: '/images/barcelona-restaurant2.jpg',
        distanceFromCenter: '0.3 km',
        pricePerPerson: 25,
        popularDishes: ['Seafood Paella', 'Crema Catalana'],
        isCurrentlyOpen: true,
      },
      {
        id: 'rest-25',
        name: 'Disfrutar',
        cuisine: 'Avant-Garde Mediterranean',
        rating: 4.9,
        priceRange: 'luxury',
        address: 'C/ de Villarroel 163, 08036 Barcelona',
        specialties: ['Multi-Sensory Tasting Menu', 'Panchino Caviar', 'Crispy Egg Yolk'],
        dietaryOptions: ['Vegetarian options with notice'],
        openingHours: '13:00-15:30, 20:00-22:30',
        location: [41.3878, 2.1531],
        imageUrl: '/images/barcelona-restaurant3.jpg',
        distanceFromCenter: '1.2 km',
        pricePerPerson: 290,
        popularDishes: ['Multi-Course Experience', 'Tasting Wine Pairing'],
        isCurrentlyOpen: false,
      },
    ],
    'Bangkok, Thailand': [
      {
        id: 'rest-26',
        name: 'Raan Jay Fai',
        cuisine: 'Michelin Star Street Food',
        rating: 4.7,
        priceRange: 'moderate',
        address: '327 Maha Chai Rd, Samran Rat, Bangkok',
        specialties: ['Crab Omelette', 'Drunken Noodles', 'Tom Yum Soup'],
        dietaryOptions: ['Pescatarian'],
        openingHours: '09:00-19:30',
        location: [13.7525, 100.5049],
        imageUrl: '/images/bangkok-restaurant1.jpg',
        distanceFromCenter: '1.0 km',
        pricePerPerson: 45,
        popularDishes: ['Crab Omelette', 'Pad Kee Mao'],
        isCurrentlyOpen: true,
      },
      {
        id: 'rest-27',
        name: 'Thip Samai Pad Thai',
        cuisine: 'Authentic Pad Thai',
        rating: 4.5,
        priceRange: 'budget',
        address: '313 Maha Chai Rd, Samran Rat, Bangkok',
        specialties: ['Superb Pad Thai wrapped in egg', 'Fresh Orange Juice'],
        dietaryOptions: ['Vegetarian options'],
        openingHours: '10:00-00:00',
        location: [13.7528, 100.5048],
        imageUrl: '/images/bangkok-restaurant2.jpg',
        distanceFromCenter: '1.0 km',
        pricePerPerson: 10,
        popularDishes: ['Pad Thai Kung', 'Fresh Orange Juice'],
        isCurrentlyOpen: true,
      },
    ],
  };

  /**
   * Generates dynamic contextual restaurant recommendations if destination isn't in database
   */
  private static generateFallbackRestaurants(destination: string): Restaurant[] {
    const destInfo = destinationService.resolveDestination(destination);
    const city = destInfo.city;
    const country = destInfo.country;
    const cuisines = destInfo.popularCuisines;
    const dishes = destInfo.signatureDishes;
    const [lat, lng] = destInfo.coordinates;
    const destSlug = destination.toLowerCase().replace(/[^a-z0-9]/g, '-');

    return [
      {
        id: `fb-1-${destSlug}`,
        name: `${city} Heritage House`,
        cuisine: cuisines[0] || 'Local Traditional',
        rating: 4.7,
        priceRange: 'moderate',
        address: `14 Old Town Way, ${city}, ${country}`,
        specialties: [dishes[0] || 'Chef Special', dishes[1] || 'Regional Platter', 'Artisan Dessert'],
        dietaryOptions: ['Vegetarian', 'Gluten-Free Options'],
        openingHours: '12:00-23:00',
        location: [lat + 0.003, lng + 0.002],
        imageUrl: '/images/placeholder-restaurant.jpg',
        distanceFromCenter: '0.4 km',
        pricePerPerson: 38,
        popularDishes: [dishes[0] || 'Chef Special', dishes[1] || 'Signature Dish'],
        isCurrentlyOpen: true,
      },
      {
        id: `fb-2-${destSlug}`,
        name: `${city} Market Street Kitchen`,
        cuisine: cuisines[1] || 'Street Food & Snacks',
        rating: 4.5,
        priceRange: 'budget',
        address: `45 Central Market Lane, ${city}`,
        specialties: [dishes[1] || 'Street Bites', dishes[2] || 'Crispy Specialties', 'House Drink'],
        dietaryOptions: ['Vegetarian', 'Halal'],
        openingHours: '10:30-22:30',
        location: [lat - 0.004, lng + 0.005],
        imageUrl: '/images/placeholder-restaurant.jpg',
        distanceFromCenter: '0.8 km',
        pricePerPerson: 14,
        popularDishes: [dishes[1] || 'Street Bites', 'Local Crispy Bites'],
        isCurrentlyOpen: true,
      },
      {
        id: `fb-3-${destSlug}`,
        name: `The Grand View at ${city}`,
        cuisine: 'Modern Fine Dining',
        rating: 4.9,
        priceRange: 'luxury',
        address: `100 Skyline Promenade, ${city}`,
        specialties: ['Chef Tasting Menu', 'Sommelier Wine Pairing', 'Signature Truffle Course'],
        dietaryOptions: ['Vegetarian options available', 'Gluten-Free'],
        openingHours: '19:00-23:30',
        location: [lat + 0.012, lng - 0.008],
        imageUrl: '/images/placeholder-restaurant.jpg',
        distanceFromCenter: '2.1 km',
        pricePerPerson: 180,
        popularDishes: ['Multi-Course Tasting', 'Sommelier Selection'],
        isCurrentlyOpen: false,
      },
      {
        id: `fb-4-${destSlug}`,
        name: `${city} Morning Bakery & Espresso`,
        cuisine: 'Artisan Cafe & Bakery',
        rating: 4.6,
        priceRange: 'budget',
        address: `8 Cathedral Square, ${city}`,
        specialties: [dishes[2] || 'Fresh Pastries', 'Specialty Roast Coffee', 'Breakfast Toast'],
        dietaryOptions: ['Vegetarian', 'Vegan Options', 'Dairy-Free'],
        openingHours: '07:30-17:30',
        location: [lat - 0.002, lng - 0.003],
        imageUrl: '/images/placeholder-restaurant.jpg',
        distanceFromCenter: '0.3 km',
        pricePerPerson: 11,
        popularDishes: [dishes[2] || 'Morning Pastry', 'Specialty Flat White'],
        isCurrentlyOpen: true,
      },
      {
        id: `fb-5-${destSlug}`,
        name: `${city} Coastal & Garden Bistro`,
        cuisine: cuisines[2] || 'Casual Contemporary',
        rating: 4.6,
        priceRange: 'moderate',
        address: `22 Riverside Terrace, ${city}`,
        specialties: ['Wood-Fired Plates', 'Farm Fresh Greens', 'Seasonal Catch'],
        dietaryOptions: ['Vegetarian', 'Pescatarian'],
        openingHours: '12:00-22:00',
        location: [lat + 0.006, lng + 0.007],
        imageUrl: '/images/placeholder-restaurant.jpg',
        distanceFromCenter: '1.2 km',
        pricePerPerson: 42,
        popularDishes: ['Seasonal Catch', 'Wood-Fired Medley'],
        isCurrentlyOpen: true,
      },
    ];
  }

  /**
   * Get restaurant recommendations for a destination
   */
  static getRecommendations(request: FoodDiscoveryRequest): Restaurant[] {
    const { destination, preferences } = request;

    if (!destination || destination.trim().length === 0) {
      return [];
    }

    const cleanDest = destination.trim().toLowerCase();

    // 1. Search database for exact or fuzzy match
    let availableRestaurants: Restaurant[] | undefined;
    for (const [key, list] of Object.entries(this.restaurantDatabase)) {
      const lowerKey = key.toLowerCase();
      const cityName = lowerKey.split(',')[0].trim();
      if (
        lowerKey === cleanDest ||
        lowerKey.includes(cleanDest) ||
        cleanDest.includes(cityName)
      ) {
        availableRestaurants = list;
        break;
      }
    }

    // 2. Fallback generation for any destination not statically listed
    if (!availableRestaurants || availableRestaurants.length === 0) {
      availableRestaurants = this.generateFallbackRestaurants(destination.trim());
    }

    // Apply filters
    let filtered = availableRestaurants;

    // Filter by cuisine preferences
    if (preferences?.cuisine && preferences.cuisine.length > 0) {
      filtered = filtered.filter((rest) =>
        preferences.cuisine!.some((c) =>
          rest.cuisine.toLowerCase().includes(c.toLowerCase())
        )
      );
    }

    // Filter by dietary restrictions
    if (preferences?.dietaryRestrictions && preferences.dietaryRestrictions.length > 0) {
      filtered = filtered.filter((rest) =>
        preferences.dietaryRestrictions!.some((d) =>
          rest.dietaryOptions.some((o) => o.toLowerCase().includes(d.toLowerCase()))
        )
      );
    }

    // Filter by price range
    if (preferences?.priceRange) {
      filtered = filtered.filter((rest) => rest.priceRange === preferences.priceRange);
    }

    // Sort by rating descending
    return filtered.sort((a, b) => b.rating - a.rating);
  }

  /**
   * Get currently open restaurants
   */
  static getCurrentlyOpen(restaurants: Restaurant[]): Restaurant[] {
    return restaurants.filter((rest) => rest.isCurrentlyOpen !== false);
  }

  /**
   Get restaurants by dietary restrictions
   */
  static getByDietary(
    restaurants: Restaurant[],
    restrictions: string[]
  ): Restaurant[] {
    return restaurants.filter((rest) =>
      restrictions.some((res) =>
        rest.dietaryOptions.some((opt) => opt.toLowerCase().includes(res.toLowerCase()))
      )
    );
  }

  getRecommendations = FoodDiscoveryEngine.getRecommendations.bind(FoodDiscoveryEngine);
  getCurrentlyOpen = FoodDiscoveryEngine.getCurrentlyOpen.bind(FoodDiscoveryEngine);
  getByDietary = FoodDiscoveryEngine.getByDietary.bind(FoodDiscoveryEngine);
}

export const foodEngine = new FoodDiscoveryEngine();