export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Page</h1>
      <p className="text-gray-600">
        If you can see this page, the delivery-manager routes are working correctly.
      </p>
      <div className="mt-6">
        <a 
          href="/dashboard" 
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
} 