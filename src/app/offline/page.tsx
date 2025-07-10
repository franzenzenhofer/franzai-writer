import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.003 4.003 0 003 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12l2 2 4-4"
                />
              </svg>
            </div>
            
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              You're Offline
            </h2>
            
            <p className="mt-2 text-center text-sm text-gray-600">
              Franz AI Writer is currently offline. Some features may not be available.
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-800">
                  Available Offline Features:
                </h3>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• View cached documents</li>
                  <li>• Edit document content</li>
                  <li>• Browse workflow templates</li>
                  <li>• Access your document history</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-amber-800">
                  Requires Internet Connection:
                </h3>
                <ul className="mt-2 text-sm text-amber-700 space-y-1">
                  <li>• AI content generation</li>
                  <li>• Document synchronization</li>
                  <li>• Image generation</li>
                  <li>• Publishing and sharing</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Retry Connection
              </button>
              
              <Link
                href="/dashboard"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </Link>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Changes made offline will be synced when you reconnect to the internet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}