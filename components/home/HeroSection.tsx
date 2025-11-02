'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import StationSearch from '@/components/StationSearch';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function HeroSection({ 
  title = "NYC Subway Sounds & Real-Time Directory",
  subtitle = "Track trains in real-time, explore subway sounds, and navigate all 472 stations across New York City",
  className = ""
}: HeroSectionProps) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <section className={`bg-black text-white py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          {title}
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          {subtitle}
        </p>

        {showSearch ? (
          <div className="max-w-md">
            <StationSearch 
              placeholder="Type station name to see live arrivals..."
              className="w-full px-4 py-3 text-lg border-2 border-white bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button 
              onClick={() => setShowSearch(false)}
              className="mt-4 text-sm text-gray-300 hover:text-white underline"
            >
              ← Back to options
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <Link href="/subway-map">
                <span className="mr-2">🗺️</span>
                Interactive Map
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowSearch(true)}
            >
              <span className="mr-2">⏱️</span>
              Live Arrivals
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroSection;