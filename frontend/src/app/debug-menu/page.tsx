'use client';
import { useState, useEffect } from 'react';

export default function DebugMenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addToLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const fetchItems = async () => {
    setLoading(true);
    addToLog('Fetching items...');
    try {
      // Use full URL or relative if proxy set up. Using absolute based on previous context.
      const response = await fetch('https://masapp-backend.onrender.com/api/admin-fix/debug-items');
      const data = await response.json();
      if (data.success) {
        setItems(data.items);
        addToLog(`Loaded ${data.items.length} items.`);
      } else {
        addToLog(`❌ Error loading items: ${data.error}`);
      }
    } catch (err: any) {
      addToLog(`❌ Network Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariations = async (item: any) => {
    addToLog(`Adding variations to ${item.name} (${item.id})...`);
    try {
      const response = await fetch(`https://masapp-backend.onrender.com/api/admin-fix/debug-add-variations/${item.id}`, {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        addToLog(`✅ Success! Variations added to ${item.name}.`);
        // Refresh specific item in list
        setItems(prev => prev.map(i => i.id === item.id ? data.item : i));
      } else {
        addToLog(`❌ Failed: ${data.message || data.error}`);
      }
    } catch (err: any) {
      addToLog(`❌ Network Error: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🛠️ Advanced Menu Debugger</h1>
        <button
          onClick={fetchItems}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh List'}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variations Included?</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.restaurant?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.price}TL</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.variations && item.variations.length > 0
                    ? <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded-full">Yes ({item.variations.length})</span>
                    : <span className="px-2 py-1 text-xs font-bold bg-gray-100 text-gray-800 rounded-full">No</span>
                  }
                  {item.options && item.options.length > 0
                    && <span className="ml-2 px-2 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">Opt ({item.options.length})</span>
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleAddVariations(item)}
                    className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200 border border-orange-300 transition-colors"
                  >
                    Auto-Add Variations
                  </button>
                  <details className="mt-2 text-xs text-gray-400 cursor-pointer">
                    <summary>Raw Data</summary>
                    <pre className="max-w-xs overflow-auto bg-gray-900 text-green-400 p-2 rounded mt-1">
                      {JSON.stringify({ variations: item.variations, options: item.options }, null, 2)}
                    </pre>
                  </details>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  No items found. Check backend connection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2">Logs</h3>
        <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
          {logs.length === 0 ? <span className="text-gray-600">Waiting for actions...</span> : logs.map((log, i) => (
            <div key={i} className="border-b border-gray-800 py-1">{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
