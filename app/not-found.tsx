import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Subway-themed 404 */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-600 text-white text-3xl font-bold">
            404
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Station Not Found
        </h1>

        <p className="text-gray-600 mb-6">
          This stop doesn&apos;t exist on our map. The page you&apos;re looking for may have been moved or deleted.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go home
          </Link>

          <Link
            href="/stations"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Browse stations
          </Link>
        </div>

        {/* Decorative subway lines */}
        <div className="mt-12 flex justify-center gap-2">
          <span className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-black text-sm font-bold">N</span>
          <span className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">F</span>
          <span className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm font-bold">L</span>
        </div>
      </div>
    </div>
  );
}
