export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {/* Animated subway line indicators */}
        <div className="flex justify-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full bg-red-600 animate-pulse"
          />
          <div
            className="w-10 h-10 rounded-full bg-green-600 animate-pulse"
            style={{ animationDelay: '0.2s' }}
          />
          <div
            className="w-10 h-10 rounded-full bg-blue-600 animate-pulse"
            style={{ animationDelay: '0.4s' }}
          />
        </div>

        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}
