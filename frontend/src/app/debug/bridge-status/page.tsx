'use client';

import { useState, useEffect } from 'react';

export default function BridgeDebugPage() {
    const [status, setStatus] = useState<'testing' | 'ok' | 'fail'>('testing');
    const [logs, setLogs] = useState<{ time: string, msg: string, type: 'info' | 'error' | 'success' }[]>([]);
    const [errorDetail, setErrorDetail] = useState<string | null>(null);

    const addLog = (msg: string, type: 'info' | 'error' | 'success' = 'info') => {
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev]);
    };

    const runDiagnostic = async () => {
        setStatus('testing');
        setErrorDetail(null);
        setLogs([]);
        addLog("Diagnostic started...", "info");

        // 1. Check if browser blocks HTTP calls (Mixed Content)
        addLog("Step 1: Checking Local Bridge on http://localhost:3005...", "info");

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const res = await fetch('http://localhost:3005', {
                method: 'GET',
                mode: 'no-cors', // Basic heartbeat
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            addLog("✅ Connection detected! The port 3005 is OPEN and responding.", "success");

            // 2. Try actual JSON status
            addLog("Step 2: Requesting JSON status...", "info");
            const resData = await fetch('http://localhost:3005/status/127.0.0.1', {
                method: 'GET',
                mode: 'cors'
            });

            const data = await resData.json();
            if (data) {
                addLog("✅ Bridge is FULLY OPERATIONAL and accepting commands.", "success");
                setStatus('ok');
            }

        } catch (err: any) {
            console.error("Diagnostic error:", err);
            setStatus('fail');

            if (err.name === 'AbortError') {
                addLog("❌ TIMEOUT: Port 3005 is not responding. Is the bridge running?", "error");
                setErrorDetail("TIMEOUT: The bridge didn't respond within 3 seconds. Ensure 'START_BRIDGE.bat' is open and shows 'RUNNING'.");
            } else if (err.message.includes('Failed to fetch')) {
                addLog("❌ BLOCKED: Browser cannot connect to localhost:3005.", "error");
                setErrorDetail("CONNECTION FAILED: This is usually caused by 'Insecure Content' being blocked by Chrome or a Firewall blocking the port.");
            } else {
                addLog(`❌ ERROR: ${err.message}`, "error");
                setErrorDetail(err.message);
            }
        }
    };

    useEffect(() => {
        runDiagnostic();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className={`p-6 text-white ${status === 'ok' ? 'bg-green-600' : status === 'fail' ? 'bg-red-600' : 'bg-blue-600'}`}>
                    <h1 className="text-2xl font-bold">Printer Bridge Debugger</h1>
                    <p className="opacity-90">Current State: {status.toUpperCase()}</p>
                </div>

                <div className="p-8">
                    <div className="mb-8 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Diagnostic Logs</h2>
                        <button
                            onClick={runDiagnostic}
                            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Retry Diagnostics
                        </button>
                    </div>

                    <div className="bg-gray-950 rounded-xl p-4 h-64 overflow-y-auto mb-8 font-mono text-sm">
                        {logs.map((log, i) => (
                            <div key={i} className={`mb-1 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-gray-300'}`}>
                                <span className="opacity-50">[{log.time}]</span> {log.msg}
                            </div>
                        ))}
                    </div>

                    {status === 'fail' && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl mb-8">
                            <h3 className="text-red-800 font-bold mb-2">How to Fix This:</h3>
                            <ul className="list-decimal list-inside text-red-700 space-y-3 text-sm">
                                <li><strong>Check the Program:</strong> Locate the <code>local-printer-bridge</code> folder and run <code>START_BRIDGE.bat</code>. A black window must stay open.</li>
                                <li><strong>Chrome Security (Important):</strong> Click the <strong>Lock/Settings icon</strong> in the address bar -{'>'} <strong>Site Settings</strong> -{'>'} Find <strong>Insecure Content</strong> -{'>'} Set to <strong>ALLOW</strong>.</li>
                                <li><strong>Firewall:</strong> Ensure Windows Firewall is not blocking "Node.js" or port 3005.</li>
                                <li><strong>Local Network:</strong> If you are trying to print from a different PC to this PC, use the PC's actual IP instead of <code>localhost</code> (Special configuration required).</li>
                            </ul>
                        </div>
                    )}

                    {status === 'ok' && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl">
                            <h3 className="text-green-800 font-bold mb-1">Success!</h3>
                            <p className="text-green-700 text-sm">The bridge is reachable. You can now use the printer test page to test specific IP addresses.</p>
                            <a href="/debug/printer-test" className="mt-4 inline-block text-green-800 font-bold underline">Go to Printer Test Page</a>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center mt-8 text-gray-500 text-xs">
                RestXQR Local Bridge Debugger v1.0
            </div>
        </div>
    );
}
