'use client';

import Link from 'next/link';
import TripPlannerForm from '@/components/TripPlannerForm';
import BudgetDashboard from '@/components/BudgetDashboard';
import { useState } from 'react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'planner' | 'itinerary-builder' | 'budget' | 'recommendations' | 'food' | 'trends'>(
    'planner'
  );
  const [trip, setTrip] = useState<{ id: string } | null>(null);

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <header className="mb-8">
        <nav className="flex space-x-7 text-gray-600 hover:text-blue-600 transition-colors">
          <button onClick={() => setActiveTab('planner')} className={activeTab === 'planner' ? 'text-blue-600 font-bold' : 'text-gray-600'}>
            Home
          </button>
          <button onClick={() => setActiveTab('itinerary-builder')} className={activeTab === 'itinerary-builder' ? 'text-blue-600 font-bold' : 'text-gray-600'}>
            Itinerary Builder
          </button>
          <button onClick={() => setActiveTab('budget')} className={activeTab === 'budget' ? 'text-blue-600 font-bold' : 'text-gray-600'}>
            Budget
          </button>
          <button onClick={() => setActiveTab('recommendations')} className={activeTab === 'recommendations' ? 'text-blue-600 font-bold' : 'text-gray-600'}>
            Recommendations
          </button>
          <button onClick={() => setActiveTab('food')} className={activeTab === 'food' ? 'text-blue-600 font-bold' : 'text-gray-600'}>
            Food
          </button>
          <button onClick={() => setActiveTab('trends')} className={activeTab === 'trends' ? 'text-blue-600 font-bold' : 'text-gray-600'}>
            Trends
          </button>
        </nav>
      </header>

      {/* Content Area */}
      <main className="prose lg:prose-2xl max-w-2xl mx-auto">
        {activeTab === 'planner' && (
          <section>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">
              Plan Your Perfect Trip
            </h1>
            <TripPlannerForm onTripCreated={(tripId) => {
              setTrip({ id: tripId });
              setActiveTab('budget');
            }}/>
          </section>
        )}

        {activeTab === 'itinerary-builder' && (
          <section>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">
              Your Itinerary
            </h1>

            {trip ? (
              <BudgetDashboard tripId={trip.id} />
            ) : (
              <p className="text-gray-600">Generate a trip first to see the budget dashboard.</p>
            )}
          </section>
        )}

        {activeTab === 'budget' && (
          <section>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">
              Budget Management
            </h1>

            {trip ? (
              <BudgetDashboard tripId={trip.id} />
            ) : (
              <p className="text-gray-600">
                Generate a trip first to access budget management features.
              </p>
            )}
          </section>
        )}

        {activeTab === 'recommendations' && (
          <section>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">
              Smart Recommendations
            </h1>

            <p className="text-gray-600 mb-6">
              Get AI-powered recommendations for hotels, restaurants, attractions,
              and transportation optimized for your budget and preferences.
            </p>

            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-500">
                Recommendations will be available after trip creation with full
                AI integration. The infrastructure is in place for real-time
                recommendations based on your preferences.
              </p>
            </div>
          </section>
        )}

        {activeTab === 'food' && (
          <section>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">
              Local Food Discovery
            </h1>

            <p className="text-gray-600 mb-6">
              Find authentic local cuisine and highly-rated restaurants at your
              destination.
            </p>

            <Link
              href="/food"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors no-underline"
            >
              Open Food Discovery →
            </Link>
          </section>
        )}

        {activeTab === 'trends' && (
          <section>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">
              Social Media Trends
            </h1>

            <p className="text-gray-600 mb-6">
              Discover what&apos;s currently trending on social media and among locals
              at your destination.
            </p>

            <Link
              href="/trends"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors no-underline"
            >
              Open Trends Explorer →
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}