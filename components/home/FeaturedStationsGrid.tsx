import Link from 'next/link';
import { Card } from '@/components/ui';
import { SubwayLineBadge } from '@/components/ui';

interface Station {
  name: string;
  lines: string[];
  slug: string;
}

interface FeaturedStationsGridProps {
  stations: Station[];
  title?: string;
  viewAllLink?: string;
  className?: string;
}

export function FeaturedStationsGrid({ 
  stations,
  title = "Popular NYC Subway Stations",
  viewAllLink = "/stations",
  className = ""
}: FeaturedStationsGridProps) {
  return (
    <section className={`py-12 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">{title}</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((station) => (
            <Card
              key={station.slug}
              variant="elevated"
              hover
              asChild
            >
              <Link href={`/station/${station.slug}`}>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">{station.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {station.lines.map((lineId) => (
                      <SubwayLineBadge 
                        key={lineId}
                        line={lineId}
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
        
        {viewAllLink && (
          <div className="text-center mt-8">
            <Link 
              href={viewAllLink} 
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              View All 472 Stations →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedStationsGrid;