import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'TripMind AI – AI Travel Planner',
  description: 'Your intelligent AI-powered travel planning platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Header />
        <Main>{children}</Main>
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          TripMind AI
        </Link>
        <nav className="space-x-6">
          <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href="/itinerary-builder" className="text-gray-700 hover:text-blue-600 transition-colors">
            Itinerary Builder
          </Link>
          <Link href="/recommendations" className="text-gray-700 hover:text-blue-600 transition-colors">
            Recommendations
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Main({ children }: { children: React.ReactNode }) {
  return <main className="container mx-auto px-4 py-8">{children}</main>;
}