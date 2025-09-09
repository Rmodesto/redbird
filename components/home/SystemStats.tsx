import { StatCard } from '@/components/ui';

interface Stat {
  value: string;
  label: string;
  description?: string;
}

interface SystemStatsProps {
  stats: Stat[];
  className?: string;
}

export function SystemStats({ 
  stats,
  className = ""
}: SystemStatsProps) {
  return (
    <section className={`py-12 border-t ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              value={stat.value}
              label={stat.label}
              description={stat.description}
              className="text-center"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default SystemStats;