import Link from 'next/link';
import { Card } from '@/components/ui';

interface FeatureCard {
  href: string;
  icon: string;
  title: string;
  description: string;
  linkText: string;
  gradient: string;
  textColor: string;
}

interface FeatureCardsProps {
  features: FeatureCard[];
  title?: string;
  className?: string;
}

export function FeatureCards({ 
  features,
  title = "Explore NYC Subway",
  className = ""
}: FeatureCardsProps) {
  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">{title}</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.href}
              className={`${feature.gradient} p-6`}
              variant="elevated"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-700 mb-4">{feature.description}</p>
              <Link 
                href={feature.href} 
                className={`${feature.textColor} font-semibold hover:opacity-80`}
              >
                {feature.linkText} →
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureCards;