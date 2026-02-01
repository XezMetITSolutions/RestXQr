'use client';

import { useState } from 'react';
import apiService from '@/services/api';

export default function OrderTestPage() {
    const [restaurantId, setRestaurantId] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testOrder = async () => {
        setLoading(true);
        try {
            const payload = {
                restaurantId: restaurantId || '4296715f-c300-47b1-9f93-41c3e38959d2', // Kroren ID as fallback
                tableNumber: 2,
                items: [
                    {
                        menuItemId: '6857cb32-373f-42a1-a75d-3574d6c4e09f', // Some item ID
                        name: 'Test Ürün',
                        quantity: 1,
                        unitPrice: 100,
                        price: 100,
                        notes: 'Item note',
                        variations: []
                    }
                ],
                notes: "📝 NOT: test notu | Ödeme: nakit, Bahşiş: 0₺, Bağış: 0₺",
                orderType: 'dine_in'
            };

            console.log('Testing payload:', payload);
            const res = await apiService.createOrder(payload);
            setResult(res);
        } catch (err: any) {
            setResult({ error: err.message, stack: err.stack });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10 font-sans">
            <h1 className="text-2xl font-bold mb-5">Order Creation Debug</h1>
            <div className="mb-5">
                <label className="block mb-2">Restaurant ID (UUID):</label>
                <input
                    value={restaurantId}
                    onChange={(e) => setRestaurantId(e.target.value)}
                    placeholder="Enter Restaurant UUID"
                    className="border p-2 w-full"
                />
            </div>
            <button
                onClick={testOrder}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
            >
                {loading ? 'Testing...' : 'Test Create Order'}
            </button>

            {result && (
                <div className="mt-10">
                    <h2 className="font-bold mb-2">Result:</h2>
                    <pre className="bg-gray-100 p-5 rounded overflow-auto border">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
