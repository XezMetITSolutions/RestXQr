'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store';

export default function DebugPage() {
  const cartStore = useCartStore();
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [manualTable, setManualTable] = useState('');
  const [manualRestId, setManualRestId] = useState('');
  const [domainInfo, setDomainInfo] = useState<any>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const subdomain = window.location.hostname.split('.')[0];
      setDomainInfo({
        hostname: window.location.hostname,
        subdomain,
        origin: window.location.origin
      });

      // Try to fetch restaurant id by subdomain
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      fetch(`${apiUrl}/restaurants`)
        .then(res => res.json())
        .then(data => {
          const found = Array.isArray(data?.data) ? data.data.find((r: any) => r.username === subdomain) : null;
          if (found) setManualRestId(found.id);
        })
        .catch(err => console.error(err));

      if (cartStore.tableNumber) setManualTable(cartStore.tableNumber.toString());
    }
  }, [cartStore.tableNumber]);

  const fetchDbOrders = async () => {
    if (!manualRestId || !manualTable) return alert('Restaurant ID and Table Number required');
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      const url = `${base}/orders?restaurantId=${manualRestId}&tableNumber=${manualTable}&status=pending,preparing,ready`;
      console.log('Fetching:', url);
      const res = await fetch(url);
      const data = await res.json();
      setDbOrders(data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen text-gray-800 font-mono text-xs">
      <h1 className="text-xl font-bold mb-4 border-b pb-2">RestXqR Debugger</h1>

      {/* Navigation Links */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="font-bold text-lg mb-2 text-blue-600">Debug Tools</h2>
        <div className="flex flex-wrap gap-2">
          <a href="/debug/printer-test" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">🖨️ Printer Test</a>
          <a href="/debug/db-schema" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">📊 DB Schema</a>
          <a href="/debug/find-staff" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">👥 Find Staff</a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Environment Info */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-2 text-blue-600">Environment</h2>
          <pre className="bg-gray-50 p-2 overflow-auto">{JSON.stringify(domainInfo, null, 2)}</pre>
          <div className="mt-2 flex flex-col gap-2">
            <label>Restaurant ID: <input className="border p-1 w-full" value={manualRestId} onChange={e => setManualRestId(e.target.value)} /></label>
            <label>Table Number: <input className="border p-1 w-full" value={manualTable} onChange={e => setManualTable(e.target.value)} /></label>
            <button onClick={fetchDbOrders} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Fetch Backend Orders</button>
          </div>
        </div>

        {/* Local Cart Store */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-2 text-green-600">Local Cart Store (Zustand)</h2>
          <div className="mb-2">
            <button onClick={() => cartStore.clearCart()} className="bg-red-500 text-white px-2 py-1 rounded text-xs mr-2">Clear Cart</button>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="bg-red-700 text-white px-2 py-1 rounded text-xs">Reset All LocalStorage</button>
          </div>
          <pre className="bg-gray-50 p-2 overflow-auto max-h-60">{JSON.stringify({
            tableNumber: cartStore.tableNumber,
            itemCount: cartStore.items.length,
            items: cartStore.items,
            coupon: cartStore.couponCode,
            status: cartStore.orderStatus
          }, null, 2)}</pre>
        </div>

        {/* Backend Orders */}
        <div className="bg-white p-4 rounded shadow col-span-1 md:col-span-2">
          <h2 className="font-bold text-lg mb-2 text-purple-600">Backend Active Orders ({dbOrders.length})</h2>
          {loading ? <p>Loading...</p> : (
            <div className="space-y-4">
              {dbOrders.map((order: any) => (
                <div key={order.id} className="border p-2 rounded hover:bg-gray-50">
                  <div className="font-bold flex justify-between">
                    <span>ID: {order.id}</span>
                    <span className={`px-2 rounded ${order.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span>
                  </div>
                  <div>Date: {new Date(order.created_at).toLocaleString()}</div>
                  <div>Total: {order.totalAmount}₺ (Paid: {order.paidAmount}₺)</div>
                  <div className="mt-2 pl-4 border-l-2">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i}>{item.quantity}x {item.name} ({item.price}₺)</div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Raw Data: <details><summary>Click to view</summary>{JSON.stringify(order)}</details>
                  </div>
                </div>
              ))}
              {dbOrders.length === 0 && <p className="text-gray-400">No active orders found for this table.</p>}
            </div>
          )}
        </div>

        {/* Storages */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-2 text-orange-600">Session & Local Storage</h2>
          <h3 className="font-bold mt-2">Session Storage</h3>
          <pre className="bg-gray-50 p-2 overflow-auto max-h-40">{typeof window !== 'undefined' ? JSON.stringify(sessionStorage, null, 2) : ''}</pre>
          <h3 className="font-bold mt-2">Local Storage (Keys)</h3>
          <pre className="bg-gray-50 p-2 overflow-auto max-h-40">{typeof window !== 'undefined' ? JSON.stringify(Object.keys(localStorage), null, 2) : ''}</pre>
        </div>
      </div>
    </div>
  );
}