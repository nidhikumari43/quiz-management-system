import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Quiz Management System</h1>
        <p className="text-gray-600 mb-8">Create and take quizzes with ease</p>
        <div className="space-y-4">
          <Link
            href="/admin"
            className="block w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Admin Panel
          </Link>
          <Link
            href="/quiz"
            className="block w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Take a Quiz
          </Link>
        </div>
      </div>
    </div>
  );
}

