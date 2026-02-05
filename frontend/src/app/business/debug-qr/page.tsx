'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import apiService from '@/services/api';

export default function DebugQRPage() {
    const { authenticatedRestaurant } = useAuthStore();
    const settingsStore = useRestaurantSettings(authenticatedRestaurant?.id);
    const [qrTokens, setQrTokens] = useState<any[]>([]);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    useEffect(() => {
        if (authenticatedRestaurant?.id) {
            loadData();
        }
    }, [authenticatedRestaurant]);

    const loadData = async () => {
        addLog('Loading QRs...');
        const res = await apiService.getRestaurantQRTokens(authenticatedRestaurant!.id);
        if (res.success) {
            setQrTokens(res.data || []);
            addLog(`Loaded ${res.data.length} tokens`);
        } else {
            addLog('Failed to load tokens');
        }
    };

    const getFloorInfo = (tNum: number) => {
        const cfg = (settingsStore.settings as any)?.drinkStationRouting;
        if (!cfg) return { error: 'Settings or drinkStationRouting missing' };

        const floors = Array.isArray(cfg?.floors) ? cfg.floors : [];
        const match = floors.find((f: any) => Number(f.startTable) <= tNum && tNum <= Number(f.endTable));

        return {
            tableToCheck: tNum,
            foundMatch: match,
            allFloors: floors,
            settingsLoaded: !!settingsStore.settings
        };
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4">QR & Settings Debug</h1>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold border-b mb-2">Settings Store State</h2>
                    <pre className="whitespace-pre-wrap">
                        {JSON.stringify(settingsStore.settings, null, 2)}
                    </pre>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold border-b mb-2">Test Logic for Table 53 (Example)</h2>
                    <pre className="whitespace-pre-wrap">
                        {JSON.stringify(getFloorInfo(53), null, 2)}
                    </pre>
                    <div className="mt-4">
                        <h3 className="font-bold">Raw Floors:</h3>
                        <pre>
                            {JSON.stringify((settingsStore.settings as any)?.drinkStationRouting?.floors, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>

            <div className="mt-4 bg-white p-4 rounded shadow">
                <h2 className="font-bold border-b mb-2">QR Token URLs Check</h2>
                <div className="max-h-96 overflow-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th>Table</th>
                                <th>Existing URL</th>
                                <th>Calculated Packet?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {qrTokens.map(t => {
                                const info: any = getFloorInfo(t.tableNumber);
                                const isPaket = info.foundMatch?.name === 'Paket Servis';
                                return (
                                    <tr key={t.id} className={isPaket ? 'bg-yellow-50' : ''}>
                                        <td className="p-1 border">{t.tableNumber}</td>
                                        <td className="p-1 border text-xs">{t.qrUrl || 'EMPTY (Generated on front)'}</td>
                                        <td className="p-1 border">
                                            {isPaket ? (
                                                <span className="text-green-600 font-bold">
                                                    Packet {Number(t.tableNumber) - Number(info.foundMatch.startTable) + 1}
                                                </span>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
