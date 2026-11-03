export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          About TripMind AI
        </h1>
        <p className="text-lg text-gray-600">
          Your intelligent AI-powered travel planning platform
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
          <p className="text-gray-700">
            To eliminate the complexity of travel planning by enabling users to
            create complete travel itineraries within minutes while ensuring
            affordability, convenience, efficiency, and personalization.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Key Features</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✅ AI Itinerary Generation</li>
            <li>✅ Smart Route Optimization</li>
            <li>✅ Budget Management</li>
            <li>✅ Hotel & Restaurant Recommendations</li>
            <li>✅ Live Trip Adjustments</li>
            <li>✅ Collaborative Planning</li>
            <li>✅ Visa & Passport Checker</li>
            <li>✅ Expense Tracking</li>
            <li>✅ AI Travel Assistant</li>
            <li>✅ Offline Travel Support</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Our Technology</h2>
          <p className="text-gray-700">
            TripMind AI leverages advanced AI algorithms, real-time travel data,
            route optimization techniques, and geospatial analysis to generate
            highly efficient travel plans tailored to each user&apos;s unique
            preferences, budget, travel duration, and destination.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Contact</h2>
          <p className="text-gray-700">
            For questions or feedback, please visit our support page or email
            us at support@tripmind.ai
          </p>
        </section>
      </div>
    </div>
  );
}