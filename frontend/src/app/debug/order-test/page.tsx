'use client';

import { useState, useEffect } from 'react';
import apiService from '@/services/api';
import { FaTrash, FaPlus, FaSave, FaSync } from 'react-icons/fa';

export default function OrderDebugPage() {
    const [restaurantId, setRestaurantId] = useState<string>('');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [testOrder, setTestOrder] = useState<any>(null);
    const [newItemId, setNewItemId] = useState<string>('');
    const [logs, setLogs] = useState<string[]>([]);
    const [menuItems, setMenuItems] = useState<any[]>([]);

    useEffect(() => {
        checkAuth();
    }, []);

    const addLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
    };

    const checkAuth = async () => {
        const user = await apiService.getCurrentUser();
        if (user.success) {
            setCurrentUser(user.data);
            if (user.data.restaurantId) {
                setRestaurantId(user.data.restaurantId);
                addLog(`Authed as ${user.data.username}, Restaurant: ${user.data.restaurantId}`);
                fetchMenu(user.data.restaurantId);
            }
        } else {
            addLog('Not authenticated');
        }
    };

    const fetchMenu = async (rId: string) => {
        const res = await apiService.getRestaurantMenu(rId);
        if (res.success && res.data) {
            const items = res.data.menuItems || [];
            const catItems = (res.data.categories || []).flatMap((c: any) => c.items || []);
            setMenuItems([...items, ...catItems]);
            addLog(`Menu fetched: ${items.length + catItems.length} items`);
        }
    };

    const [manualRestaurantId, setManualRestaurantId] = useState('');

    const loadKroren = async () => {
        try {
            const res = await apiService.getRestaurantByUsername('kroren');
            if (res.success && res.data) {
                setRestaurantId(res.data.id);
                setManualRestaurantId(res.data.id);
                addLog(`Kroren Loaded: ${res.data.id}`);
                fetchMenu(res.data.id);
            } else {
                addLog('Kroren not found');
            }
        } catch (e: any) {
            addLog(`Load Kroren Error: ${e.message}`);
        }
    };

    const createTestOrder = async () => {
        const targetId = restaurantId || manualRestaurantId;
        if (!targetId) return addLog('❌ Error: No Restaurant ID. Please Click "Load Kroren" or Login.');

        addLog(`Creating test order for Table 999. Restaurant: ${targetId}`);

        // Find a valid menu item first
        const firstItem = menuItems[0];
        if (!firstItem) return addLog('❌ Error: No menu items found. Fetch menu first.');

        try {
            const payload = {
                restaurantId: targetId,
                tableNumber: 999,
                customerName: 'DEBUG TEST',
                items: [
                    {
                        id: firstItem.id, // Some endpoints expect 'id' for menu item id
                        menuItemId: firstItem.id,
                        quantity: 1,
                        unitPrice: Number(firstItem.price),
                        notes: 'Test creation'
                    }
                ]
            };

            addLog(`Global Create Payload: ${JSON.stringify(payload)}`);

            const res = await apiService.createOrder(payload);
            addLog(`Create Response: ${JSON.stringify(res)}`);

            if (res.success) {
                setTestOrder(res.data);
                addLog(`✅ Order Created: ${res.data.id}`);
            } else {
                addLog(`❌ Create Failed: ${res.message}`);
            }
        } catch (e: any) {
            addLog(`❌ Create Exception: ${e.message}`);
        }
    };

    const fetchOrder = async () => {
        if (!testOrder?.id) return;
        const res = await apiService.getOrderById(testOrder.id);
        if (res.success) {
            setTestOrder(res.data);
            addLog('Order refreshed');
        }
    };

    const addItem = async () => {
        if (!testOrder) return;
        const itemToAdd = menuItems.find(i => i.id === newItemId) || menuItems[0];
        if (!itemToAdd) return addLog('No item to add');

        const newItems = [
            ...testOrder.items,
            {
                menuItemId: itemToAdd.id,
                name: itemToAdd.name,
                quantity: 1,
                unitPrice: Number(itemToAdd.price),
                price: Number(itemToAdd.price), // Frontend often uses this
                notes: 'Added via Debug'
            }
        ];

        setTestOrder({ ...testOrder, items: newItems });
        addLog(`Item added locally. New Count: ${newItems.length}. Click SAVE to sync.`);
    };

    const removeItem = (index: number) => {
        if (!testOrder) return;
        const newItems = [...testOrder.items];
        newItems.splice(index, 1);
        setTestOrder({ ...testOrder, items: newItems });
        addLog(`Item removed locally. New Count: ${newItems.length}. Click SAVE to sync.`);
    };

    const saveOrder = async () => {
        if (!testOrder) return;
        addLog('Saving order...');

        // Exact logic from Kasa Panel fix attempt
        // Sanitize items
        const sanitizedItems = testOrder.items.map((item: any) => ({
            ...item,
            // Ensure creating new items has menuItemId
            menuItemId: item.menuItemId || item.id,
            price: Number(item.price || item.unitPrice || 0),
            // IMPORTANT: Removing totalPrice to force backend calculation
            totalPrice: undefined
        }));

        const payload = {
            items: sanitizedItems,
            totalAmount: testOrder.totalAmount, // Backend might recalc this too
            cashierNote: 'Debug Update'
        };

        addLog(`Update Payload: ${JSON.stringify(payload, null, 2)}`);

        try {
            const res = await apiService.updateOrder(testOrder.id, payload);
            addLog(`Update Response: ${JSON.stringify(res, null, 2)}`);

            if (res.success) {
                setTestOrder(res.data);
            } else {
                addLog(`Update Failed: ${res.message}`);
            }
        } catch (e: any) {
            addLog(`Update Exception: ${e.message}`);
        }
    };

    const checkTableInfo = async () => {
        try {
            addLog('Checking Table Info (Admin Debug)...');
            const res = await apiService.getTableInfo();
            addLog(`Table Info Response: ${JSON.stringify(res, null, 2)}`);
        } catch (e: any) {
            addLog(`Table Info Error: ${e.message}`);
        }
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen font-mono">
            <h1 className="text-2xl font-bold mb-4">Order Update 500 Debugger</h1>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold border-b mb-2">Actions</h2>

                    <div className="flex gap-2 mb-4">
                        <button onClick={loadKroren} className="px-3 py-1 bg-amber-500 text-white rounded">
                            Load Kroren
                        </button>
                        <button onClick={createTestOrder} className="px-3 py-1 bg-green-500 text-white rounded">
                            1. New Test Order (T-999)
                        </button>
                        <button onClick={fetchOrder} className="px-3 py-1 bg-blue-500 text-white rounded">
                            <FaSync /> Refresh
                        </button>
                        <button onClick={checkTableInfo} className="px-3 py-1 bg-purple-500 text-white rounded">
                            Check DB Schema
                        </button>
                    </div>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="Manual Restaurant ID"
                            className="border p-2 rounded flex-1"
                            value={manualRestaurantId}
                            onChange={(e) => setManualRestaurantId(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 mb-4 items-center">
                        <select
                            className="border p-1 rounded w-48"
                            value={newItemId}
                            onChange={e => setNewItemId(e.target.value)}
                        >
                            <option value="">Select Item to Add</option>
                            {menuItems.slice(0, 10).map(i => (
                                <option key={i.id} value={i.id}>{i.name} ({i.price}₺)</option>
                            ))}
                        </select>
                        <button onClick={addItem} className="px-3 py-1 bg-indigo-500 text-white rounded">
                            <FaPlus /> Add Item Loc
                        </button>
                    </div>

                    <hr className="my-4" />

                    {testOrder && (
                        <div>
                            <h3 className="font-bold">Current Order: {testOrder.id}</h3>
                            <p>Table: {testOrder.tableNumber}</p>
                            <ul className="list-disc pl-5 my-2">
                                {testOrder.items?.map((item: any, idx: number) => (
                                    <li key={idx} className="flex justify-between items-center bg-gray-50 p-1 mb-1 border">
                                        <span>{item.name || item.menuItem?.name || 'Item'} - Qty: {item.quantity} - {item.price || item.unitPrice}₺</span>
                                        <button onClick={() => removeItem(idx)} className="text-red-500">
                                            <FaTrash />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={saveOrder}
                                className="w-full py-2 bg-red-600 text-white font-bold rounded shadow hover:bg-red-700 mt-2"
                            >
                                <FaSave className="inline mr-2" />
                                SAVE CHANGES (Trigger 500?)
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-black text-green-400 p-4 rounded shadow h-[600px] overflow-y-auto text-xs">
                    <h2 className="font-bold border-b border-green-800 mb-2">Logs & Responses</h2>
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1 whitespace-pre-wrap font-mono border-b border-green-900 pb-1">
                            {log}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
