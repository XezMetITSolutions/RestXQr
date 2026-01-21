'use client';

import { useState, useEffect } from 'react';

interface PrinterConfig {
    id: string;
    name: string;
    ip: string;
    port: number;
    enabled: boolean;
    type: string;
    characterSet?: string;
    codePage?: string;
}

interface PrinterStatus {
    connected: boolean;
    station?: string;
    ip?: string;
    port?: number;
    error?: string;
    codePage?: string;
    characterSet?: string;
}

export default function PrinterTestPage() {
    const [stations, setStations] = useState<PrinterConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [testingStation, setTestingStation] = useState<string | null>(null);
    const [printingStation, setPrintingStation] = useState<string | null>(null);
    const [statusChecking, setStatusChecking] = useState<string | null>(null);
    const [statuses, setStatuses] = useState<Record<string, PrinterStatus>>({});
    const [messages, setMessages] = useState<Record<string, { type: 'success' | 'error' | 'info'; text: string }>>({});

    const defaultStations = [
        { id: 'station1', name: 'Station 1 - Grill (XPrinter XP-80)', ip: '192.168.1.13', port: 9100, enabled: true, type: 'epson', characterSet: 'PC857_TURKISH', codePage: 'CP857' },
        { id: 'station2', name: 'Station 2 - Cold Kitchen (XPrinter XP-80)', ip: '192.168.1.14', port: 9100, enabled: true, type: 'epson', characterSet: 'PC857_TURKISH', codePage: 'CP857' },
        { id: 'station3', name: 'Station 3 - Bar (XPrinter XP-80)', ip: '192.168.1.15', port: 9100, enabled: true, type: 'epson', characterSet: 'PC857_TURKISH', codePage: 'CP857' },
    ];

    useEffect(() => {
        loadStations();
    }, []);

    const loadStations = async () => {
        try {
            const response = await fetch('/api/printers');
            const data = await response.json();

            if (data.success && data.data && data.data.length > 0) {
                setStations(data.data);
            } else {
                // No stations configured, show defaults
                setStations(defaultStations);
            }
        } catch (error) {
            console.error('Failed to load stations:', error);
            // Show defaults on error
            setStations(defaultStations);
        } finally {
            setLoading(false);
        }
    };

    const updateStationConfig = async (stationId: string, config: Partial<PrinterConfig>) => {
        try {
            const response = await fetch(`/api/printers/${stationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => ({
                    ...prev,
                    [stationId]: { type: 'success', text: 'Configuration updated!' }
                }));
                setTimeout(() => {
                    setMessages(prev => {
                        const newMessages = { ...prev };
                        delete newMessages[stationId];
                        return newMessages;
                    });
                }, 3000);
                await loadStations();
            } else {
                throw new Error(data.error || 'Update failed');
            }
        } catch (error) {
            setMessages(prev => ({
                ...prev,
                [stationId]: { type: 'error', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }
            }));
        }
    };

    const [connectionMode, setConnectionMode] = useState<'cloud' | 'local'>('local');

    const checkStatus = async (stationId: string) => {
        setStatusChecking(stationId);
        const station = stations.find(s => s.id === stationId);
        if (!station) return;

        try {
            let data;

            if (connectionMode === 'local') {
                const response = await fetch(`http://localhost:3005/status/${station.ip}`);
                data = await response.json();
                // Normalize local bridge response to match cloud response structure if needed
                if (data.success) {
                    data.data = { connected: data.connected };
                }
            } else {
                const response = await fetch(`/api/printers/${stationId}/status`);
                data = await response.json();
            }

            if (data.success) {
                setStatuses(prev => ({ ...prev, [stationId]: data.data }));
                setMessages(prev => ({
                    ...prev,
                    [stationId]: {
                        type: data.data.connected ? 'success' : 'error',
                        text: data.data.connected ? '✅ Printer connected!' : '❌ Printer not connected'
                    }
                }));
            } else {
                setStatuses(prev => ({ ...prev, [stationId]: { connected: false, error: data.error } }));
                setMessages(prev => ({
                    ...prev,
                    [stationId]: { type: 'error', text: `Error: ${data.error}` }
                }));
            }
        } catch (error) {
            setMessages(prev => ({
                ...prev,
                [stationId]: { type: 'error', text: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
            }));
        } finally {
            setStatusChecking(null);
            setTimeout(() => {
                setMessages(prev => {
                    const newMessages = { ...prev };
                    delete newMessages[stationId];
                    return newMessages;
                });
            }, 5000);
        }
    };

    const testPrint = async (stationId: string) => {
        setPrintingStation(stationId);
        const station = stations.find(s => s.id === stationId);
        if (!station) return;

        try {
            let data;

            if (connectionMode === 'local') {
                const response = await fetch(`http://localhost:3005/test/${station.ip}`, {
                    method: 'POST'
                });
                data = await response.json();
            } else {
                const response = await fetch(`/api/printers/${stationId}/test`, {
                    method: 'POST',
                });
                data = await response.json();
            }

            if (data.success) {
                setMessages(prev => ({
                    ...prev,
                    [stationId]: { type: 'success', text: '✅ Test print sent successfully!' }
                }));
            } else {
                setMessages(prev => ({
                    ...prev,
                    [stationId]: { type: 'error', text: `❌ Print failed: ${data.error}` }
                }));
            }
        } catch (error) {
            setMessages(prev => ({
                ...prev,
                [stationId]: { type: 'error', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }
            }));
        } finally {
            setPrintingStation(null);
            setTimeout(() => {
                setMessages(prev => {
                    const newMessages = { ...prev };
                    delete newMessages[stationId];
                    return newMessages;
                });
            }, 5000);
        }
    };

    const handleConfigChange = (stationId: string, field: keyof PrinterConfig, value: any) => {
        setStations(prev => prev.map(s =>
            s.id === stationId ? { ...s, [field]: value } : s
        ));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading printer configurations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">🖨️ Printer Debug & Testing</h1>
                            <p className="text-gray-600">Configure and test your thermal printers for automatic order printing</p>
                        </div>
                        <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                            <button
                                onClick={() => setConnectionMode('cloud')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${connectionMode === 'cloud' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Cloud (Backend)
                            </button>
                            <button
                                onClick={() => setConnectionMode('local')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${connectionMode === 'local' ? 'bg-white shadow text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                Local Bridge
                            </button>
                        </div>
                    </div>
                    {connectionMode === 'local' && (
                        <div className="mt-4 bg-green-50 border border-green-200 rounded p-2 text-sm text-green-800">
                            <strong>Local Bridge Mode Active:</strong> Commands are sent to <code>http://localhost:3005</code>. Ensure Local Bridge is running!
                        </div>
                    )}
                </div>

                {/* Info Panel */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-blue-900 mb-1">How to use this page:</h3>
                            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                                <li>Configure each station with the correct printer IP address</li>
                                <li>Click "Check Status" to verify network connectivity</li>
                                <li>Click "Test Print" to send a sample receipt with Turkish characters</li>
                                <li>Enable/disable stations as needed for your restaurant setup</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Printer Stations Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {stations.map((station) => (
                        <div key={station.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Station Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white">{station.name}</h2>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={station.enabled}
                                            onChange={(e) => {
                                                handleConfigChange(station.id, 'enabled', e.target.checked);
                                                updateStationConfig(station.id, { enabled: e.target.checked });
                                            }}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-blue-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Station Configuration */}
                            <div className="p-6 space-y-4">
                                {/* IP Address */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">IP Address</label>
                                    <input
                                        type="text"
                                        value={station.ip}
                                        onChange={(e) => handleConfigChange(station.id, 'ip', e.target.value)}
                                        onBlur={() => updateStationConfig(station.id, { ip: station.ip })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                        placeholder="192.168.1.13"
                                    />
                                </div>

                                {/* Port */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Port</label>
                                    <input
                                        type="number"
                                        value={station.port}
                                        onChange={(e) => handleConfigChange(station.id, 'port', parseInt(e.target.value))}
                                        onBlur={() => updateStationConfig(station.id, { port: station.port })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                        placeholder="9100"
                                    />
                                </div>

                                {/* Printer Type */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Printer Type</label>
                                    <select
                                        value={station.type}
                                        onChange={(e) => {
                                            handleConfigChange(station.id, 'type', e.target.value);
                                            updateStationConfig(station.id, { type: e.target.value });
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="epson">Epson</option>
                                        <option value="star">Star</option>
                                        <option value="tanca">Tanca</option>
                                    </select>
                                </div>

                                {/* Status Indicator */}
                                {statuses[station.id] && (
                                    <div className={`p-3 rounded-lg ${statuses[station.id].connected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full mr-2 ${statuses[station.id].connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                            <span className={`text-sm font-medium ${statuses[station.id].connected ? 'text-green-800' : 'text-red-800'}`}>
                                                {statuses[station.id].connected ? 'Connected' : 'Disconnected'}
                                            </span>
                                        </div>
                                        {statuses[station.id].error && (
                                            <p className="text-xs text-red-700 mt-1">{statuses[station.id].error}</p>
                                        )}
                                    </div>
                                )}

                                {/* Message Display */}
                                {messages[station.id] && (
                                    <div className={`p-3 rounded-lg border ${messages[station.id].type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                                        messages[station.id].type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                                            'bg-blue-50 border-blue-200 text-blue-800'
                                        }`}>
                                        <p className="text-sm font-medium">{messages[station.id].text}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => checkStatus(station.id)}
                                        disabled={!station.enabled || statusChecking === station.id}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                    >
                                        {statusChecking === station.id ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Checking...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Check Status
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => testPrint(station.id)}
                                        disabled={!station.enabled || printingStation === station.id}
                                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                    >
                                        {printingStation === station.id ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Printing...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                                Test Print
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Technical Notes</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Port:</strong> Most thermal printers use port 9100 (RAW printing protocol)</p>
                        <p><strong>Character Set:</strong> PC857_TURKISH for proper Turkish character support (ç, ğ, ı, ö, ş, ü)</p>
                        <p><strong>Test Print:</strong> Includes Turkish characters to verify encoding is working correctly</p>
                        <p><strong>Network:</strong> Ensure printers are on the same network and firewall allows port 9100</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
