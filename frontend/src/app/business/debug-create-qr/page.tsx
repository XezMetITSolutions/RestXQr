'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import apiService from '@/services/api';
import { QRCodeData } from '@/store/useQRStore';

export default function DebugCreateQRPage() {
    const { authenticatedRestaurant, initializeAuth } = useAuthStore();
    const settingsStore = useRestaurantSettings(authenticatedRestaurant?.id);
    const [logs, setLogs] = useState<string[]>([]);
    const [qrs, setQrs] = useState<QRCodeData[]>([]);
    const [loading, setLoading] = useState(false);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    useEffect(() => {
        initializeAuth();
    }, []);

    const fetchQRs = async () => {
        if (!authenticatedRestaurant?.id) return;
        try {
            const res = await apiService.getRestaurantQRTokens(authenticatedRestaurant.id);
            if (res.success) {
                setQrs(res.data);
            }
        } catch (e: any) {
            addLog('Error fetching QRs: ' + e.message);
        }
    };

    useEffect(() => {
        if (authenticatedRestaurant?.id) fetchQRs();
    }, [authenticatedRestaurant]);

    // Helper to calculate Packet URL (Same logic as main page)
    const getDisplayURL = (qr: any) => {
        const cfg = (settingsStore.settings as any)?.drinkStationRouting;
        const floors = Array.isArray(cfg?.floors) ? cfg.floors : [];
        const floor = floors.find((f: any) => Number(f.startTable) <= qr.tableNumber && qr.tableNumber <= Number(f.endTable));

        if (floor && floor.name === 'Paket Servis') {
            const packetNum = Number(qr.tableNumber) - Number(floor.startTable) + 1;
            return `https://${authenticatedRestaurant?.username}.restxqr.com/menu/?t=${qr.token}&packet=${packetNum} (FORCED)`;
        }
        return qr.qrUrl || `https://${authenticatedRestaurant?.username}.restxqr.com/menu/?t=${qr.token}&table=${qr.tableNumber}`;
    };

    const createTables = async () => {
        if (!authenticatedRestaurant) return;
        setLoading(true);
        addLog('Creating 3 Standard Tables...');
        try {
            // Just create tables 900, 901, 902 for testing
            for (let i = 900; i <= 902; i++) {
                await apiService.generateQRToken({
                    restaurantId: authenticatedRestaurant.id,
                    tableNumber: i,
                    duration: 24
                });
                addLog(`Created Table ${i}`);
            }
            await fetchQRs();
        } catch (e: any) {
            addLog('Error: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const createPacketService = async () => {
        if (!authenticatedRestaurant || !settingsStore.settings) return;
        setLoading(true);
        addLog('Creating Packet Servis section...');

        try {
            const currentSettings = settingsStore.settings as any;
            let floors = currentSettings.drinkStationRouting?.floors || [];

            // Clean existing floors for calculation
            let cursor = 1;
            const normalized = floors.map((f: any) => {
                const tCount = Number(f.tableCount) || ((Number(f.endTable) - Number(f.startTable) + 1) || 0);
                let start = Number(f.startTable);
                let end = Number(f.endTable);
                if (!Number.isFinite(start) || start === 0) {
                    start = cursor;
                    end = cursor + tCount - 1;
                }
                cursor = Math.max(cursor, end + 1);
                return { ...f, startTable: start, endTable: end, tableCount: tCount };
            });

            const maxTable = normalized.reduce((max: number, f: any) => Math.max(max, f.endTable || 0), 0);
            const start = maxTable + 1;
            const count = 3; // Create 3 packets
            const end = start + count - 1;

            const newFloor = {
                name: 'Paket Servis',
                tableCount: count,
                startTable: start,
                endTable: end,
                stationId: ''
            };

            const finalFloors = [...normalized, newFloor];

            addLog(`Adding range ${start}-${end} as Paket Servis`);

            await settingsStore.updateSettings({
                drinkStationRouting: {
                    ...currentSettings.drinkStationRouting,
                    floors: finalFloors
                }
            } as any);
            await settingsStore.saveSettings();

            for (let i = start; i <= end; i++) {
                await apiService.generateQRToken({
                    restaurantId: authenticatedRestaurant.id,
                    tableNumber: i,
                    duration: 24
                });
                addLog(`Created Token for Table ${i}`);
            }

            await fetchQRs();
            addLog('Done!');

        } catch (e: any) {
            addLog('Error: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">QR Creation Debugger</h1>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={createTables}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    Create 3 Standard Tables (900-902)
                </button>
                <button
                    onClick={createPacketService}
                    disabled={loading}
                    className="px-6 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                >
                    Create 3 Packet Service Items
                </button>
                <button
                    onClick={fetchQRs}
                    className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                    Refresh List
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold mb-4">Latest Created QRs</h2>
                    <div className="space-y-2 max-h-[500px] overflow-auto">
                        {qrs.sort((a, b) => Number(b.tableNumber || 0) - Number(a.tableNumber || 0)).map(qr => (
                            <div key={qr.id} className="p-2 border rounded flex justify-between items-center text-xs">
                                <div>
                                    <span className="font-bold mr-2">#{qr.tableNumber}</span>
                                    <span className="text-gray-500">{qr.token.substring(0, 8)}...</span>
                                </div>
                                <div className="text-blue-600 overflow-hidden text-ellipsis max-w-[200px]" title={getDisplayURL(qr)}>
                                    {getDisplayURL(qr)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-black text-green-400 p-4 rounded shadow font-mono text-xs">
                    <h2 className="font-bold text-white mb-2">Logs</h2>
                    <div className="space-y-1">
                        {logs.map((log, i) => <div key={i}>{log}</div>)}
                    </div>
                </div>
            </div>
        </div>
    );
}
