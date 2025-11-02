interface AdSlotProps {
  size?: "banner" | "square" | "leaderboard" | "mobile_banner";
  className?: string;
}

const adSizes = {
  banner: "h-24 md:h-32",
  square: "aspect-square max-w-xs",
  leaderboard: "h-20 w-full",
  mobile_banner: "h-16 md:h-24"
};

export default function AdSlot({ size = "banner", className = "" }: AdSlotProps) {
  return (
    <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${adSizes[size]} ${className}`}>
      <div className="text-center">
        <p className="text-gray-500 text-sm font-medium">Advertisement</p>
        <p className="text-gray-400 text-xs">Google AdSense</p>
      </div>
    </div>
  );
}