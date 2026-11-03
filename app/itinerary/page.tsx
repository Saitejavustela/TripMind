import Link from 'next/link';

// Mock itineraries data
const mockItineraries = [
  {
    id: 'paris-summer',
    title: 'Paris Summer Escape',
    description: "Explore Paris's iconic landmarks, museums, and cafes",
    image: '/images/paris.jpg',
    days: 7,
    rating: 4.8,
    price: '$1,999',
  },
  {
    id: 'tokyo-food',
    title: 'Tokyo Food Tour',
    description: 'Experience Japan\'s culinary delights and traditional markets',
    image: '/images/tokyo.jpg',
    days: 5,
    rating: 4.6,
    price: '$1,499',
  },
];

export default function ItineraryListPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Itineraries</h1>
        <p className="text-lg text-gray-600">Explore AI-optimized travel itineraries</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockItineraries.map((itinerary) => (
          <Link key={itinerary.id} href={`/itinerary/${itinerary.id}`}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">[Image: {itinerary.title}]</span>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{itinerary.title}</h3>
                <p className="text-gray-600 mb-3">{itinerary.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-semibold">{itinerary.price}</span>
                  <span className="text-yellow-500">★ {itinerary.rating}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}