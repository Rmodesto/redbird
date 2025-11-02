import Link from "next/link";

interface SubwayBadgeProps {
  line: {
    id: string;
    name: string;
    color: string;
    textColor: string;
  };
  size?: "sm" | "md" | "lg";
  clickable?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-lg", 
  lg: "w-16 h-16 text-xl"
};

export default function SubwayBadge({ line, size = "md", clickable = true }: SubwayBadgeProps) {
  const badgeClasses = `${line.color} ${line.textColor} ${sizeClasses[size]} flex items-center justify-center font-bold rounded transition-transform ${clickable ? 'hover:scale-110 cursor-pointer' : ''}`;

  if (clickable) {
    return (
      <Link
        href={`/line/${line.id.toLowerCase()}`}
        className={badgeClasses}
      >
        {line.name}
      </Link>
    );
  }

  return (
    <div className={badgeClasses}>
      {line.name}
    </div>
  );
}