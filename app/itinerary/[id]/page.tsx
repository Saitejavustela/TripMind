'use client';

import { useParams } from 'next/navigation';

export default function ItineraryPage() {
  const params = useParams();
  const id = params?.id;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Itinerary for {id}</h1>
      <p>Replace this with dynamic itinerary content</p>
    </div>
  );
}
