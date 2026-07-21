import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <div className="text-center px-6">
        <h1 className="text-8xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white/90 mb-4">
          Page Not Found
        </h2>
        <p className="text-white/70 mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-600 rounded-xl font-semibold text-base hover:bg-gray-50 transition shadow-lg"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
