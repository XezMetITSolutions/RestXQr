'use client';

import { useEffect, useState } from 'react';
import { useRestaurantStore } from '@/store';

const INGREDIENT_MAP: Record<string, string[]> = {
    'gazpacho': ['Domates', 'Salatalık', 'Biber', 'Soğan', 'Sarımsak', 'Zeytinyağı', 'Sirke'],
    'minestrone çorbası': ['Sebze Suyu', 'Domates', 'Havuç', 'Kereviz', 'Soğan', 'Makarna', 'Fasulye'],
    'tom yum çorbası': ['Karides', 'Mantar', 'Limon Otu', 'Galangal', 'Lime Yaprağı', 'Chili Biberi'],
    'chicken tikka masala': ['Tavuk', 'Yoğurt', 'Domates Sosu', 'Soğan', 'Sarımsak', 'Zencefil', 'Baharatlar'],
    'beef stroganoff': ['Dana Eti', 'Mantar', 'Soğan', 'Krema', 'Hardal', 'Et Suyu'],
    'pad thai': ['Pirinç Eriştesi', 'Karides', 'Yumurta', 'Yer Fıstığı', 'Fasulye Filizi', 'Taze Soğan'],
    'chicken teriyaki': ['Tavuk', 'Soya Sosu', 'Mirin', 'Şeker', 'Zencefil', 'Susam', 'Taze Soğan'],
    'salmon teriyaki': ['Somon', 'Soya Sosu', 'Mirin', 'Şeker', 'Zencefil', 'Susam'],
    'argentine steak': ['Bonfile', 'Chimichurri Sos', 'Sarımsak', 'Maydanoz', 'Zeytinyağı'],
    'lamb chops': ['Kuzu Pirzola', 'Kekik', 'Biberiye', 'Sarımsak', 'Zeytinyağı'],
    'bbq chicken pizza': ['Pizza Hamuru', 'Barbekü Sos', 'Tavuk', 'Mozzarella', 'Kırmızı Soğan'],
    'hawaiian pizza': ['Pizza Hamuru', 'Domates Sosu', 'Mozzarella', 'Jambon', 'Ananas'],
    'quattro stagioni': ['Pizza Hamuru', 'Domates Sosu', 'Mozzarella', 'Mantar', 'Enginar', 'Zeytin', 'Jambon'],
    'thai beef salad': ['Dana Eti', 'Salatalık', 'Domates', 'Taze Soğan', 'Kişniş', 'Lime Sosu'],
    'greek salad': ['Domates', 'Salatalık', 'Soğan', 'Zeytin', 'Beyaz Peynir', 'Zeytinyağı', 'Kekik'],
    'caesar salad': ['Marul', 'Kroton', 'Parmesan', 'Garnitür', 'Caesar Sos'],
    'italian soda': ['Soda', 'Meyve Şurubu', 'Buz', 'Krema'],
    'matcha latte': ['Matcha Tozu', 'Süt', 'Sıcak Su', 'Bal'],
    'thai iced tea': ['Siyah Çay', 'Baharatlar', 'Şeker', 'Süt', 'Buz'],
    'tiramisu': ['Kedi Dili', 'Mascarpone', 'Kahve', 'Kakao', 'Yumurta', 'Şeker'],
    'mochi ice cream': ['Pirinç Unu', 'Dondurma', 'Şeker', 'Nişasta'],
    'churros': ['Un', 'Su', 'Tereyağı', 'Yumurta', 'Şeker', 'Tarçın', 'Çikolata Sosu'],
    'french toast': ['Tost Ekmeği', 'Yumurta', 'Süt', 'Tarçın', 'Tereyağı', 'Akçaağaç Şurubu'],
    'english breakfast': ['Yumurta', 'Sosis', 'Bacon', 'Fasulye', 'Mantar', 'Domates', 'Kızarmış Ekmek'],
    'american pancakes': ['Un', 'Süt', 'Yumurta', 'Kabartma Tozu', 'Tereyağı', 'Akçaağaç Şurubu']
};

export default function MenuDebugPage() {
    const { menuItems, currentRestaurant, fetchRestaurantByUsername, fetchRestaurantMenu, deleteMenuItem, updateMenuItem } = useRestaurantStore();
    const [mounted, setMounted] = useState(false);
    const [username, setUsername] = useState('aksaray');
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const addLog = (msg: string) => {
        console.log(msg);
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
    };

    const handleFetch = async () => {
        if (!username) return;
        setStatus('Fetching restaurant...');
        setError('');
        setLogs([]);

        try {
            addLog(`Fetching for username: ${username}`);
            const restaurant = await fetchRestaurantByUsername(username);
            addLog(`Fetch result: ${restaurant ? 'Found' : 'Null'}`);

            if (restaurant) {
                setStatus(`Found restaurant: ${restaurant.name} (${restaurant.id}). Fetching menu...`);
                await fetchRestaurantMenu(restaurant.id);
                setStatus('Menu fetched successfully.');
                addLog(`Menu fetched. Items: ${(menuItems || []).length}`);
            } else {
                setError('Restaurant not found (returned null). Check console for details.');
                setStatus('Failed.');
            }
        } catch (e: any) {
            console.error(e);
            setError(`Error: ${e.message || 'Unknown error'}`);
            setStatus('Error occurred.');
            addLog(`Error during fetch: ${e.message}`);
        }
    };

    const handleRemoveDuplicates = async () => {
        if (!currentRestaurant) return;
        setStatus('Scanning for duplicates...');
        addLog('Starting duplicate scan...');

        const itemsByName: Record<string, any[]> = {};

        // Group items by normalized name
        menuItems.forEach((item: any) => {
            const name = (typeof item.name === 'string' ? item.name : item.name?.tr || '').toLowerCase().trim();
            if (!name) return;
            if (!itemsByName[name]) itemsByName[name] = [];
            itemsByName[name].push(item);
        });

        let deletedCount = 0;

        for (const name in itemsByName) {
            const group = itemsByName[name];
            if (group.length > 1) {
                addLog(`Found duplicate group: ${name} (${group.length} items)`);
                // Sort by completeness (prefer item with ingredients/allergens)
                group.sort((a, b) => {
                    const aScore = (Array.isArray(a.ingredients) ? a.ingredients.length : 0) + (Array.isArray(a.allergens) ? a.allergens.length : 0);
                    const bScore = (Array.isArray(b.ingredients) ? b.ingredients.length : 0) + (Array.isArray(b.allergens) ? b.allergens.length : 0);
                    return bScore - aScore; // Descending
                });

                // Keep the first one, delete the rest
                const toKeep = group[0];
                const toDelete = group.slice(1);

                for (const item of toDelete) {
                    try {
                        addLog(`Deleting duplicate: ${item.name} (${item.id})`);
                        await deleteMenuItem(currentRestaurant.id, item.id);
                        deletedCount++;
                    } catch (e: any) {
                        addLog(`Failed to delete ${item.id}: ${e.message}`);
                    }
                }
            }
        }

        setStatus(`Duplicates removed. Deleted ${deletedCount} items. Refreshing...`);
        addLog(`Duplicate removal complete. Deleted: ${deletedCount}`);
        await fetchRestaurantMenu(currentRestaurant.id);
    };

    const handlePopulateIngredients = async () => {
        if (!currentRestaurant) return;
        setStatus('Populating ingredients...');
        addLog('Starting ingredient population...');
        let updatedCount = 0;

        for (const item of menuItems) {
            // Check if ingredients are empty
            const hasIngredients = Array.isArray(item.ingredients) && item.ingredients.length > 0;
            if (hasIngredients) {
                // addLog(`Skipping ${item.name} (already has ingredients)`);
                continue;
            }

            const name = (typeof item.name === 'string' ? item.name : item.name?.tr || '').toLowerCase().trim();
            const suggestion = INGREDIENT_MAP[name];

            if (suggestion) {
                try {
                    addLog(`Updating ${name} with array: ${suggestion.join(', ')}`);
                    // Try sending as array first
                    try {
                        await updateMenuItem(currentRestaurant.id, item.id, {
                            ingredients: suggestion
                        });
                        updatedCount++;
                        addLog(`Success (Array): ${name}`);
                    } catch (err: any) {
                        addLog(`Array update failed. Trying string format...`);
                        // Fallback: Try sending as comma-separated string
                        await updateMenuItem(currentRestaurant.id, item.id, {
                            ingredients: suggestion.join(', ')
                        });
                        updatedCount++;
                        addLog(`Success (String): ${name}`);
                    }
                } catch (e: any) {
                    addLog(`Failed to update ${name}: ${e.message}`);
                }
            } else {
                // addLog(`No match found for: ${name}`);
            }
        }

        setStatus(`Ingredients populated for ${updatedCount} items. Refreshing...`);
        addLog(`Population complete. Updated: ${updatedCount}`);
        await fetchRestaurantMenu(currentRestaurant.id);
    };


    if (!mounted) return <div className="p-4">Loading...</div>;

    return (
        <div className="p-4 bg-white min-h-screen text-black">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Menu Data Debugger & Tools</h1>
                <span className="bg-gray-200 px-2 py-1 rounded text-sm font-mono">v1.2 (Store Fix Applied)</span>
            </div>

            <div className="mb-6 border p-4 rounded bg-gray-50">
                <h2 className="text-xl font-semibold mb-2">Fetch Data</h2>
                <div className="flex gap-2 items-end mb-2">
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

                {status && <div className="text-blue-600 font-mono text-sm">{status}</div>}
                {error && <div className="text-red-600 font-bold mt-2">{error}</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border p-4 rounded bg-gray-50">
                    <h2 className="text-xl font-semibold mb-2">Tools</h2>
                    <div className="flex flex-col gap-2">
                        <button
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center gap-2"
                            onClick={() => {
                                if (confirm('Are you sure you want to delete duplicate items? This cannot be undone.')) {
                                    handleRemoveDuplicates();
                                }
                            }}
                            disabled={!currentRestaurant}
                        >
                            🗑️ Remove Duplicates
                        </button>
                        <button
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2"
                            onClick={() => {
                                if (confirm('This will overwrite empty ingredients for known dishes. Continue?')) {
                                    handlePopulateIngredients();
                                }
                            }}
                            disabled={!currentRestaurant}
                        >
                            🥗 Populate Ingredients
                        </button>
                    </div>
                </div>

                <div className="border p-4 rounded bg-gray-900 text-green-400 font-mono text-xs h-64 overflow-y-auto">
                    <h2 className="text-white text-sm font-semibold mb-2 sticky top-0 bg-gray-900 pb-2 border-b border-gray-700">Action Log</h2>
                    {logs.length === 0 && <span className="text-gray-500">Waiting for actions...</span>}
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1">{log}</div>
                    ))}
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
