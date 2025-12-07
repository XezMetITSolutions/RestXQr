'use client';

import { useEffect, useState } from 'react';
import { useRestaurantStore } from '@/store';

export default function MenuDebugPage() {
    const { menuItems, currentRestaurant, fetchRestaurantByUsername, fetchRestaurantMenu } = useRestaurantStore();
    const [mounted, setMounted] = useState(false);
    const [username, setUsername] = useState('aksaray');

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleFetch = async () => {
        if (!username) return;
        const restaurant = await fetchRestaurantByUsername(username);
        if (restaurant) {
            await fetchRestaurantMenu(restaurant.id);
        }
    };

    if (!mounted) return <div className="p-4">Loading...</div>;

    return (
        <div className="p-4 bg-white min-h-screen text-black">
            <h1 className="text-2xl font-bold mb-4">Menu Data Debugger</h1>

            <div className="mb-6 border p-4 rounded bg-gray-50">
                <h2 className="text-xl font-semibold mb-2">Fetch Data</h2>
                <div className="flex gap-2 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username (Subdomain)</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="border p-2 rounded"
                        />
                    </div>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        onClick={handleFetch}
                    >
                        Fetch Menu
                    </button>
                </div>
            </div>

            <div className="mb-6 border p-4 rounded bg-gray-50">
                <h2 className="text-xl font-semibold mb-2">Current Restaurant</h2>
                <div className="mb-2">
                    <strong>ID:</strong> {currentRestaurant?.id || 'None'} <br />
                    <strong>Name:</strong> {currentRestaurant?.name || 'None'}
                </div>
            </div>

            <h2 className="text-xl font-semibold mb-2">Menu Items ({menuItems.length})</h2>

            {menuItems.length === 0 ? (
                <p className="text-gray-500">No items found. Click fetch above.</p>
            ) : (
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full bg-white border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 border text-left font-semibold">Name</th>
                                <th className="p-3 border text-left font-semibold">Ingredients (Raw Value)</th>
                                <th className="p-3 border text-left font-semibold">Ingredients Type</th>
                                <th className="p-3 border text-left font-semibold">Allergens (Raw Value)</th>
                                <th className="p-3 border text-left font-semibold">Allergens Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuItems.map((item: any) => (
                                <tr key={item.id} className="border-t hover:bg-gray-50">
                                    <td className="p-3 border">
                                        {typeof item.name === 'object' ? (item.name?.tr || JSON.stringify(item.name)) : item.name}
                                    </td>
                                    <td className="p-3 border font-mono text-sm max-w-xs break-all">
                                        {JSON.stringify(item.ingredients)}
                                    </td>
                                    <td className="p-3 border">
                                        <span className={`px-2 py-1 rounded text-xs text-white ${Array.isArray(item.ingredients) ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {Array.isArray(item.ingredients) ? 'Array' : typeof item.ingredients}
                                        </span>
                                    </td>
                                    <td className="p-3 border font-mono text-sm max-w-xs break-all">
                                        {JSON.stringify(item.allergens)}
                                    </td>
                                    <td className="p-3 border">
                                        <span className={`px-2 py-1 rounded text-xs text-white ${Array.isArray(item.allergens) ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {Array.isArray(item.allergens) ? 'Array' : typeof item.allergens}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
