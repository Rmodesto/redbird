import Link from 'next/link';
import { SubwayLineBadge } from '@/components/ui';

interface SubwayLine {
  id: string;
  name: string;
  color: string;
  textColor: string;
}

interface SubwayLinesGridProps {
  lines: SubwayLine[];
  title?: string;
  className?: string;
}

export function SubwayLinesGrid({ 
  lines,
  title = "All NYC Subway Lines",
  className = ""
}: SubwayLinesGridProps) {
  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">{title}</h2>
        
        <div className="grid grid-cols-6 md:grid-cols-12 gap-3">
          {lines.map((line) => (
            <Link
              key={line.id}
              href={`/line/${line.id.toLowerCase()}`}
              className="block hover:scale-110 transition-transform"
              aria-label={`${line.name} train line information`}
            >
              <SubwayLineBadge 
                line={line.id}
                size="lg"
                className="w-full h-12"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SubwayLinesGrid;