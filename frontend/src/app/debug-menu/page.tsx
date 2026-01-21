'use client';
import { useState } from 'react';

export default function DebugMenuPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testData = {
    // You might need to replace these with real IDs from your DB or specific test ones
    restaurantId: 'REPLACE_WITH_VALID_RESTAURANT_ID',
    categoryId: 'REPLACE_WITH_VALID_CATEGORY_ID',
    name: 'Debug Test Item',
    price: 150,
    variations: [
      { name: 'Small', price: 100 },
      { name: 'Large', price: 200 }
    ],
    options: [
      { name: 'Spiciness', values: ['Low', 'Medium', 'High'] }
    ]
  };

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Fetch a valid restaurant and category first if needed, or user inputs manually
      // For simplicity, let's assume valid IDs are needed.
      // We will try to fetch the first restaurant and category relative to the logged in user or hardcoded?
      // Since this is a standalone debug page, let's make it fetch the first restaurant/category.

      const adminToken = localStorage.getItem('adminToken'); // Assuming admin login
      // OR specific restaurant login logic. Let's try to get restaurant from generic API or user input.

      // Easier: Let user input Restaurant ID and Category ID
      if (!testData.restaurantId || testData.restaurantId.includes('REPLACE')) {
        alert('Please enter valid Restaurant ID and Category ID in the code or form (implementation update pending)');
        // For now just sending what we have to see backend log
      }

      const response = await fetch('https://api.restxqr.com/api/admin-fix/debug-create-item', { // Adjust URL as needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Menu Variation Debugger</h1>

      <div className="mb-4 space-y-2">
        <p className="text-gray-600">This tool attempts to send a raw JSON payload with variations to the backend.</p>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(testData, null, 2)}
        </pre>
      </div>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Restaurant ID"
          className="border p-2 rounded"
          onChange={e => testData.restaurantId = e.target.value}
        />
        <input
          type="text"
          placeholder="Category ID"
          className="border p-2 rounded"
          onChange={e => testData.categoryId = e.target.value}
        />
      </div>

      <button
        onClick={handleTest}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Send Test Request'}
      </button>

      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Result:</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Sent Payload:</h3>
              <pre className="bg-yellow-50 p-4 rounded text-xs overflow-auto border border-yellow-200">
                {JSON.stringify(result.receivedBody, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold">Backend Response (Saved Item):</h3>
              <pre className={`p-4 rounded text-xs overflow-auto border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
