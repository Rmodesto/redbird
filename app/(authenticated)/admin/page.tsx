import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Admin Dashboard</h1>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/blog"
          className="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg p-6 transition-colors"
        >
          <div className="text-3xl mb-3">&#x1F4DD;</div>
          <h3 className="text-lg font-semibold text-white">Blog</h3>
          <p className="text-gray-400 text-sm mt-1">Manage blog posts</p>
        </Link>

        <Link
          href="/admin/analytics"
          className="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg p-6 transition-colors"
        >
          <div className="text-3xl mb-3">&#x1F4CA;</div>
          <h3 className="text-lg font-semibold text-white">Analytics</h3>
          <p className="text-gray-400 text-sm mt-1">View site statistics</p>
        </Link>

        <Link
          href="/"
          className="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg p-6 transition-colors"
        >
          <div className="text-3xl mb-3">&#x1F310;</div>
          <h3 className="text-lg font-semibold text-white">View Site</h3>
          <p className="text-gray-400 text-sm mt-1">Open public website</p>
        </Link>
      </div>
    </div>
  );
}
