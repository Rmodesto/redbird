import Link from "next/link";

interface CultureCardProps {
  category: string;
  title: string;
  description: string;
  image?: string;
  href?: string;
}

export default function CultureCard({ category, title, description, image = "📷", href }: CultureCardProps) {
  const CardContent = () => (
    <div className="group cursor-pointer">
      <div className="bg-gray-200 aspect-video mb-4 rounded-lg flex items-center justify-center text-4xl group-hover:bg-gray-300 transition-colors">
        {image}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600 uppercase">{category}</p>
        <h3 className="text-xl font-bold group-hover:underline">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
}