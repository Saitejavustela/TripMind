export interface GlobalDestination {
  id: string;
  city: string;
  country: string;
  fullName: string;
  region: string;
  flag: string;
  coordinates: [number, number]; // [lat, lng]
  currency: string;
  popularCuisines: string[];
  signatureDishes: string[];
  iconicAttractions: string[];
  tagline: string;
}

export const GLOBAL_DESTINATIONS: GlobalDestination[] = [
  {
    id: 'paris',
    city: 'Paris',
    country: 'France',
    fullName: 'Paris, France',
    region: 'Europe',
    flag: '🇫🇷',
    coordinates: [48.8566, 2.3522],
    currency: 'EUR',
    popularCuisines: ['French Bistro', 'Haute Cuisine', 'Patisserie', 'Provençal'],
    signatureDishes: ['Croissant', 'Steak Frites', 'Duck Confit', 'Crème Brûlée'],
    iconicAttractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Arc de Triomphe'],
    tagline: 'City of light, world-renowned art, and exquisite gastronomy',
  },
  {
    id: 'tokyo',
    city: 'Tokyo',
    country: 'Japan',
    fullName: 'Tokyo, Japan',
    region: 'Asia',
    flag: '🇯🇵',
    coordinates: [35.6762, 139.6503],
    currency: 'JPY',
    popularCuisines: ['Sushi', 'Ramen', 'Izakaya', 'Tempura', 'Kaiseki'],
    signatureDishes: ['Tonkotsu Ramen', 'Nigiri Omakase', 'Wagyu Yakiniku', 'Yakitori'],
    iconicAttractions: ['Shibuya Crossing', 'Senso-ji Temple', 'Tokyo Skytree', 'Meiji Shrine'],
    tagline: 'Futuristic metropolis steeped in timeless culinary tradition',
  },
  {
    id: 'new-york',
    city: 'New York',
    country: 'USA',
    fullName: 'New York, USA',
    region: 'North America',
    flag: '🇺🇸',
    coordinates: [40.7128, -74.006],
    currency: 'USD',
    popularCuisines: ['NY Deli', 'Pizza', 'Italian-American', 'Modern American', 'Street Food'],
    signatureDishes: ['NY Style Pizza', 'Pastrami on Rye', 'Bagel & Lox', 'Cheesecake'],
    iconicAttractions: ['Central Park', 'Times Square', 'Statue of Liberty', 'Empire State Building'],
    tagline: 'The vibrant cultural epicenter of dining, theatre, and skyscrapers',
  },
  {
    id: 'mumbai',
    city: 'Mumbai',
    country: 'India',
    fullName: 'Mumbai, India',
    region: 'Asia',
    flag: '🇮🇳',
    coordinates: [18.922, 72.8347],
    currency: 'INR',
    popularCuisines: ['Chaat & Street Food', 'Coastal Seafood', 'Modern Indian', 'Parsi Cafe'],
    signatureDishes: ['Vada Pav', 'Pav Bhaji', 'Butter Garlic Crab', 'Berry Pulao'],
    iconicAttractions: ['Gateway of India', 'Marine Drive', 'Elephanta Caves', 'Chhatrapati Shivaji Terminus'],
    tagline: 'The bustling City of Dreams brimming with street food and seaside charm',
  },
  {
    id: 'rome',
    city: 'Rome',
    country: 'Italy',
    fullName: 'Rome, Italy',
    region: 'Europe',
    flag: '🇮🇹',
    coordinates: [41.9028, 12.4964],
    currency: 'EUR',
    popularCuisines: ['Roman Trattoria', 'Pizza al Taglio', 'Gelateria', 'Pastaria'],
    signatureDishes: ['Spaghetti Carbonara', 'Cacio e Pepe', 'Saltimbocca', 'Supplì'],
    iconicAttractions: ['Colosseum', 'Vatican Museums', 'Trevi Fountain', 'Pantheon'],
    tagline: 'The Eternal City where ancient history and rich cuisine meet on every corner',
  },
  {
    id: 'london',
    city: 'London',
    country: 'United Kingdom',
    fullName: 'London, United Kingdom',
    region: 'Europe',
    flag: '🇬🇧',
    coordinates: [51.5074, -0.1278],
    currency: 'GBP',
    popularCuisines: ['Gastropub', 'Anglo-Indian', 'Modern British', 'Afternoon Tea'],
    signatureDishes: ['Fish and Chips', 'Sunday Roast', 'Chicken Tikka Masala', 'Sticky Toffee Pudding'],
    iconicAttractions: ['Tower of London', 'Big Ben', 'British Museum', 'London Eye'],
    tagline: 'Historic global capital with world-class museums and multicultural dining',
  },
  {
    id: 'barcelona',
    city: 'Barcelona',
    country: 'Spain',
    fullName: 'Barcelona, Spain',
    region: 'Europe',
    flag: '🇪🇸',
    coordinates: [41.3851, 2.1734],
    currency: 'EUR',
    popularCuisines: ['Tapas', 'Catalan', 'Seafood', 'Pintxos'],
    signatureDishes: ['Paella Marinera', 'Patatas Bravas', 'Pan con Tomate', 'Churros con Chocolate'],
    iconicAttractions: ['Sagrada Família', 'Park Güell', 'Casa Batlló', 'Gothic Quarter'],
    tagline: 'Gaudí architecture, sunny Mediterranean shores, and lively tapas culture',
  },
  {
    id: 'bali',
    city: 'Bali',
    country: 'Indonesia',
    fullName: 'Bali, Indonesia',
    region: 'Asia',
    flag: '🇮🇩',
    coordinates: [-8.3405, 115.092],
    currency: 'IDR',
    popularCuisines: ['Balinese', 'Indonesian', 'Plant-Based & Wellness', 'Seafood BBQ'],
    signatureDishes: ['Nasi Goreng', 'Babi Guling', 'Satay Lilit', 'Smoothie Bowls'],
    iconicAttractions: ['Tanah Lot Temple', 'Ubud Monkey Forest', 'Tegallalang Rice Terraces', 'Mount Batur'],
    tagline: 'Island of the Gods with lush rice terraces, sacred temples, and beach vibes',
  },
  {
    id: 'bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    fullName: 'Bangkok, Thailand',
    region: 'Asia',
    flag: '🇹🇭',
    coordinates: [13.7563, 100.5018],
    currency: 'THB',
    popularCuisines: ['Thai Street Food', 'Royal Thai', 'Isan Cuisine', 'Night Market Stalls'],
    signatureDishes: ['Pad Thai', 'Tom Yum Goong', 'Som Tum', 'Mango Sticky Rice'],
    iconicAttractions: ['Grand Palace', 'Wat Arun', 'Wat Phra Kaew', 'Chatuchak Weekend Market'],
    tagline: 'Ornate golden shrines, lively canals, and legendary street food markets',
  },
  {
    id: 'dubai',
    city: 'Dubai',
    country: 'United Arab Emirates',
    fullName: 'Dubai, UAE',
    region: 'Middle East',
    flag: '🇦🇪',
    coordinates: [25.2048, 55.2708],
    currency: 'AED',
    popularCuisines: ['Emirati', 'Levantine', 'Luxury Dining', 'Indian & Persian'],
    signatureDishes: ['Shawarma', 'Al Machboos', 'Kunafa', 'Mezze Platters'],
    iconicAttractions: ['Burj Khalifa', 'The Dubai Mall', 'Palm Jumeirah', 'Dubai Marina'],
    tagline: 'Glamorous desert metropolis known for ultra-modern architecture and luxury',
  },
  {
    id: 'singapore',
    city: 'Singapore',
    country: 'Singapore',
    fullName: 'Singapore, Singapore',
    region: 'Asia',
    flag: '🇸🇬',
    coordinates: [1.3521, 103.8198],
    currency: 'SGD',
    popularCuisines: ['Hawker Food', 'Peranakan', 'Chinese & Malay', 'Modern Asian'],
    signatureDishes: ['Hainanese Chicken Rice', 'Chilli Crab', 'Laksa', 'Char Kway Teow'],
    iconicAttractions: ['Marina Bay Sands', 'Gardens by the Bay', 'Sentosa Island', 'Jewel Changi'],
    tagline: 'Futuristic Garden City with Michelin-starred street food hawker centers',
  },
  {
    id: 'sydney',
    city: 'Sydney',
    country: 'Australia',
    fullName: 'Sydney, Australia',
    region: 'Oceania',
    flag: '🇦🇺',
    coordinates: [-33.8688, 151.2093],
    currency: 'AUD',
    popularCuisines: ['Modern Australian', 'Seafood', 'Specialty Coffee', 'Asian Fusion'],
    signatureDishes: ['Sydney Rock Oysters', 'Barramundi', 'Meat Pie', 'Avocado Toast & Flat White'],
    iconicAttractions: ['Sydney Opera House', 'Harbour Bridge', 'Bondi Beach', 'Darling Harbour'],
    tagline: 'Harbour wonders, iconic golden beaches, and sun-drenched outdoor lifestyle',
  },
  {
    id: 'amsterdam',
    city: 'Amsterdam',
    country: 'Netherlands',
    fullName: 'Amsterdam, Netherlands',
    region: 'Europe',
    flag: '🇳🇱',
    coordinates: [52.3676, 4.9041],
    currency: 'EUR',
    popularCuisines: ['Dutch Comfort', 'Indonesian Rijsttafel', 'Artisan Bakery', 'Cheese Tasting'],
    signatureDishes: ['Stroopwafels', 'Bitterballen', 'Herring with Onions', 'Dutch Pancakes'],
    iconicAttractions: ['Rijksmuseum', 'Van Gogh Museum', 'Canal Ring', 'Anne Frank House'],
    tagline: 'Picturesque canal ring, historic gabled houses, and relaxed cycling culture',
  },
  {
    id: 'berlin',
    city: 'Berlin',
    country: 'Germany',
    fullName: 'Berlin, Germany',
    region: 'Europe',
    flag: '🇩🇪',
    coordinates: [52.52, 13.405],
    currency: 'EUR',
    popularCuisines: ['German Street Food', 'Turkish-German', 'Vegan & Fusion', 'Biergarten'],
    signatureDishes: ['Currywurst', 'Döner Kebab', 'Schnitzel', 'Pretzels & Craft Beer'],
    iconicAttractions: ['Brandenburg Gate', 'Reichstag', 'Museum Island', 'East Side Gallery'],
    tagline: 'Creative bohemian capital known for historic landmarks and nightlife',
  },
  {
    id: 'delhi',
    city: 'Delhi',
    country: 'India',
    fullName: 'Delhi, India',
    region: 'Asia',
    flag: '🇮🇳',
    coordinates: [28.6139, 77.209],
    currency: 'INR',
    popularCuisines: ['Mughlai', 'North Indian', 'Old Delhi Street Food', 'Tandoori'],
    signatureDishes: ['Butter Chicken', 'Chole Bhature', 'Parathas of Chandni Chowk', 'Gulab Jamun'],
    iconicAttractions: ['Red Fort', 'Qutub Minar', 'India Gate', 'Humayun\'s Tomb'],
    tagline: 'Imperial monuments and legendary heritage culinary bazaars',
  },
  {
    id: 'seoul',
    city: 'Seoul',
    country: 'South Korea',
    fullName: 'Seoul, South Korea',
    region: 'Asia',
    flag: '🇰🇷',
    coordinates: [37.5665, 126.978],
    currency: 'KRW',
    popularCuisines: ['Korean BBQ', 'Pocha Street Food', 'Bibimbap & Stews', 'Fried Chicken'],
    signatureDishes: ['Samgyeopsal', 'Tteokbokki', 'Korean Fried Chicken', 'Bibimbap'],
    iconicAttractions: ['Gyeongbokgung Palace', 'N Seoul Tower', 'Bukchon Hanok Village', 'Myeongdong'],
    tagline: 'High-tech K-culture, royal palaces, and buzzing 24/7 food markets',
  },
  {
    id: 'cairo',
    city: 'Cairo',
    country: 'Egypt',
    fullName: 'Cairo, Egypt',
    region: 'Africa',
    flag: '🇪🇬',
    coordinates: [30.0444, 31.2357],
    currency: 'EGP',
    popularCuisines: ['Egyptian', 'Middle Eastern', 'Traditional Street Food'],
    signatureDishes: ['Koshari', 'Ful Medames', 'Ta\'ameya', 'Molokhia'],
    iconicAttractions: ['Pyramids of Giza', 'The Great Sphinx', 'Egyptian Museum', 'Khan el-Khalili'],
    tagline: 'Cradle of ancient civilizations along the timeless banks of the Nile',
  },
  {
    id: 'istanbul',
    city: 'Istanbul',
    country: 'Turkey',
    fullName: 'Istanbul, Turkey',
    region: 'Europe/Asia',
    flag: '🇹🇷',
    coordinates: [41.0082, 28.9784],
    currency: 'TRY',
    popularCuisines: ['Turkish Mezze', 'Ottoman Cuisine', 'Kebab & Grill', 'Baklava'],
    signatureDishes: ['Adana Kebab', 'Turkish Breakfast', 'Baklava', 'Balık Ekmek'],
    iconicAttractions: ['Hagia Sophia', 'Blue Mosque', 'Topkapi Palace', 'Grand Bazaar'],
    tagline: 'Enchanting bridge between continents, rich in history and spice-scented bazaars',
  },
  {
    id: 'san-francisco',
    city: 'San Francisco',
    country: 'USA',
    fullName: 'San Francisco, USA',
    region: 'North America',
    flag: '🇺🇸',
    coordinates: [37.7749, -122.4194],
    currency: 'USD',
    popularCuisines: ['California Farm-to-Table', 'Sourdough & Seafood', 'Mission Mexican', 'Chinatown Dim Sum'],
    signatureDishes: ['Clam Chowder in Sourdough Bowl', 'Dungeness Crab', 'Mission Burrito', 'Dim Sum'],
    iconicAttractions: ['Golden Gate Bridge', 'Alcatraz Island', 'Fisherman\'s Wharf', 'Cable Cars'],
    tagline: 'Iconic fog, rolling hills, cable cars, and cutting-edge farm-to-table cuisine',
  },
  {
    id: 'toronto',
    city: 'Toronto',
    country: 'Canada',
    fullName: 'Toronto, Canada',
    region: 'North America',
    flag: '🇨🇦',
    coordinates: [43.6532, -79.3832],
    currency: 'CAD',
    popularCuisines: ['Canadian Contemporary', 'Multicultural Food Halls', 'Asian Fusion'],
    signatureDishes: ['Peameal Bacon Sandwich', 'Poutine', 'Butter Tarts', 'Craft Beers'],
    iconicAttractions: ['CN Tower', 'Ripley\'s Aquarium', 'Distillery District', 'Royal Ontario Museum'],
    tagline: 'Cosmopolitan waterfront metropolis celebrated for cultural diversity',
  },
  {
    id: 'kyoto',
    city: 'Kyoto',
    country: 'Japan',
    fullName: 'Kyoto, Japan',
    region: 'Asia',
    flag: '🇯🇵',
    coordinates: [35.0116, 135.7681],
    currency: 'JPY',
    popularCuisines: ['Kyoto Kaiseki', 'Matcha & Wagashi', 'Shojin Ryori (Zen Vegan)', 'Yudofu'],
    signatureDishes: ['Kaiseki Ryori', 'Matcha Parfait', 'Yuba Tofu', 'Kyo-Ryori'],
    iconicAttractions: ['Fushimi Inari Shrine', 'Kinkaku-ji (Golden Pavilion)', 'Arashiyama Bamboo Grove', 'Gion District'],
    tagline: 'Historic spiritual heart of Japan adorned with thousands of temples and geisha quarters',
  },
  {
    id: 'venice',
    city: 'Venice',
    country: 'Italy',
    fullName: 'Venice, Italy',
    region: 'Europe',
    flag: '🇮🇹',
    coordinates: [45.4408, 12.3155],
    currency: 'EUR',
    popularCuisines: ['Venetian Seafood', 'Bacaro & Cicchetti', 'Risotto'],
    signatureDishes: ['Cicchetti', 'Sarde in Saor', 'Risotto al Nero di Seppia', 'Aperol Spritz'],
    iconicAttractions: ['St. Mark\'s Basilica', 'Grand Canal', 'Rialto Bridge', 'Doge\'s Palace'],
    tagline: 'Floating city of canals, gondolas, and romantic Renaissance palaces',
  },
  {
    id: 'mexico-city',
    city: 'Mexico City',
    country: 'Mexico',
    fullName: 'Mexico City, Mexico',
    region: 'Americas',
    flag: '🇲🇽',
    coordinates: [19.4326, -99.1332],
    currency: 'MXN',
    popularCuisines: ['Authentic Mexican', 'Taqueria Street Food', 'Modern Mexican Gastronomy'],
    signatureDishes: ['Tacos al Pastor', 'Mole Poblano', 'Chiles en Nogada', 'Churros'],
    iconicAttractions: ['Zócalo', 'Frida Kahlo Museum', 'Chapultepec Castle', 'Teotihuacan Pyramids'],
    tagline: 'Vibrant cultural colossus boasting world-renowned taquerias and colonial plazas',
  },
  {
    id: 'lisbon',
    city: 'Lisbon',
    country: 'Portugal',
    fullName: 'Lisbon, Portugal',
    region: 'Europe',
    flag: '🇵🇹',
    coordinates: [38.7223, -9.1393],
    currency: 'EUR',
    popularCuisines: ['Portuguese Seafood', 'Pastelarias', 'Petiscos & Wine'],
    signatureDishes: ['Pastel de Nata', 'Bacalhau à Brás', 'Grilled Sardines', 'Polvo à Lagareiro'],
    iconicAttractions: ['Belém Tower', 'Jerónimos Monastery', 'Tram 28', 'Alfama District'],
    tagline: 'Sun-drenched hills overlooking the Atlantic, decorated with azulejo tiles and fado songs',
  },
  {
    id: 'rio-de-janeiro',
    city: 'Rio de Janeiro',
    country: 'Brazil',
    fullName: 'Rio de Janeiro, Brazil',
    region: 'South America',
    flag: '🇧🇷',
    coordinates: [-22.9068, -43.1729],
    currency: 'BRL',
    popularCuisines: ['Brazilian Churrasco', 'Carioca Seafood', 'Boteco Snacks'],
    signatureDishes: ['Feijoada', 'Picanha', 'Pão de Queijo', 'Açaí Bowl & Caipirinha'],
    iconicAttractions: ['Christ the Redeemer', 'Sugarloaf Mountain', 'Copacabana Beach', 'Ipanema Beach'],
    tagline: 'Marvelous City of samba, dramatic granite peaks, and world-famous beaches',
  },
  {
    id: 'cape-town',
    city: 'Cape Town',
    country: 'South Africa',
    fullName: 'Cape Town, South Africa',
    region: 'Africa',
    flag: '🇿🇦',
    coordinates: [-33.9249, 18.4241],
    currency: 'ZAR',
    popularCuisines: ['Cape Malay', 'Braai & Grill', 'Seafood & Cape Winelands'],
    signatureDishes: ['Bobotie', 'Braaivleis', 'Biltong', 'Fresh Kingklip'],
    iconicAttractions: ['Table Mountain', 'Robben Island', 'Cape Point', 'Kirstenbosch Gardens'],
    tagline: 'Where towering mountains meet two oceans, flanked by scenic wine valleys',
  },
  {
    id: 'vienna',
    city: 'Vienna',
    country: 'Austria',
    fullName: 'Vienna, Austria',
    region: 'Europe',
    flag: '🇦🇹',
    coordinates: [48.2082, 16.3738],
    currency: 'EUR',
    popularCuisines: ['Viennese Cafe Culture', 'Austrian Traditional', 'Heuriger Wine Tavern'],
    signatureDishes: ['Wiener Schnitzel', 'Sachertorte', 'Apfelstrudel', 'Tafelspitz'],
    iconicAttractions: ['Schönbrunn Palace', 'St. Stephen\'s Cathedral', 'Hofburg Palace', 'Belvedere'],
    tagline: 'Imperial palaces, classical music heritage, and grand coffee house traditions',
  },
  {
    id: 'prague',
    city: 'Prague',
    country: 'Czech Republic',
    fullName: 'Prague, Czech Republic',
    region: 'Europe',
    flag: '🇨🇿',
    coordinates: [50.0755, 14.4378],
    currency: 'CZK',
    popularCuisines: ['Bohemian Traditional', 'Czech Beer Halls', 'Central European'],
    signatureDishes: ['Svíčková', 'Goulash with Bread Dumplings', 'Trdelník', 'Pilsner Urquell'],
    iconicAttractions: ['Charles Bridge', 'Prague Castle', 'Old Town Square', 'Astronomical Clock'],
    tagline: 'City of a Hundred Spires with fairytale bridges and medieval charm',
  },
];

/**
 * Service to search and resolve any travel destination worldwide
 */
export class DestinationService {
  private static instance: DestinationService;

  public static getInstance(): DestinationService {
    if (!DestinationService.instance) {
      DestinationService.instance = new DestinationService();
    }
    return DestinationService.instance;
  }

  /**
   * Search destinations with fuzzy match and intelligent fallback
   */
  search(query: string, limit = 8): GlobalDestination[] {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      return GLOBAL_DESTINATIONS.slice(0, limit);
    }

    // 1. Prefix and substring match against database
    const matched = GLOBAL_DESTINATIONS.filter((d) => {
      const cityLower = d.city.toLowerCase();
      const countryLower = d.country.toLowerCase();
      const fullLower = d.fullName.toLowerCase();
      return (
        cityLower.startsWith(cleanQuery) ||
        countryLower.startsWith(cleanQuery) ||
        fullLower.includes(cleanQuery) ||
        cleanQuery.includes(cityLower)
      );
    });

    if (matched.length > 0) {
      return matched.slice(0, limit);
    }

    // 2. If no exact predefined destination matched, build a clean dynamic destination object
    const dynamicDest = this.buildDynamicDestination(query.trim());
    return [dynamicDest];
  }

  /**
   * Resolve a destination by name, providing full metadata
   */
  resolveDestination(query: string): GlobalDestination {
    const cleanQuery = query.trim().toLowerCase();
    const found = GLOBAL_DESTINATIONS.find((d) => {
      const city = d.city.toLowerCase();
      const full = d.fullName.toLowerCase();
      return full === cleanQuery || city === cleanQuery || cleanQuery.includes(city);
    });

    if (found) return found;
    return this.buildDynamicDestination(query.trim());
  }

  /**
   * Dynamically formats any city or country the user enters
   */
  private buildDynamicDestination(raw: string): GlobalDestination {
    const formatted = raw
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    const hasComma = formatted.includes(',');
    const city = hasComma ? formatted.split(',')[0].trim() : formatted;
    const country = hasComma ? formatted.split(',')[1].trim() : 'Global Destination';

    return {
      id: raw.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      city,
      country,
      fullName: hasComma ? formatted : `${formatted}`,
      region: 'International',
      flag: '✈️',
      coordinates: [45.0, 15.0],
      currency: 'USD',
      popularCuisines: ['Local Cuisine', 'Contemporary Dining', 'Street Specialties'],
      signatureDishes: [`${city} Special Plate`, 'Regional Delicacies', 'House Artisan Pastry'],
      iconicAttractions: [`${city} Historic Center`, `${city} Grand Promenade`, `${city} Cultural Museum`],
      tagline: `Discover authentic cuisine, hidden gems, and top sights in ${city}`,
    };
  }
}

export const destinationService = DestinationService.getInstance();

