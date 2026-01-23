'use client';

import { useState, useEffect } from 'react';
import { useBusinessSettingsStore } from '@/store/useBusinessSettingsStore';
import { apiService } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { FaSync, FaSave, FaTrash, FaDatabase, FaHdd } from 'react-icons/fa';

export default function SettingsDebugPage() {
    const { settings: localSettings, fetchSettings, saveSettings } = useBusinessSettingsStore();
    const { authenticatedRestaurant } = useAuthStore();
    const [backendSettings, setBackendSettings] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadBackendSettings = async () => {
        setLoading(true);
        try {
            const response = await apiService.getSettings();
            if (response.success) {
                setBackendSettings(response.data);
            } else {
                setError('Backend settings fetch failed');
            }
        } catch (err: any) {
            setError(err.message || 'Error fetching from backend');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBackendSettings();
    }, []);

    const handleForceSave = async () => {
        try {
            setLoading(true);
            await saveSettings();
            await loadBackendSettings();
            alert('Local settings successfully pushed to backend!');
        } catch (err: any) {
            alert('Error saving: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForceFetch = async () => {
        try {
            setLoading(true);
            await fetchSettings();
            await loadBackendSettings();
            alert('Settings successfully pulled from backend to local storage!');
        } catch (err: any) {
            alert('Error fetching: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const clearLocalStorage = () => {
        if (confirm('Are you sure you want to clear local settings? This will revert to defaults until you fetch from backend.')) {
            localStorage.removeItem('business-settings-storage');
            window.location.reload();
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Settings Debug Dashboard</h1>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={handleForceFetch}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <FaSync /> Pull from Backend
                </button>
                <button
                    onClick={handleForceSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    <FaSave /> Push Local to Backend
                </button>
                <button
                    onClick={clearLocalStorage}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    <FaTrash /> Clear Local Cache
                </button>
            </div>

            {error && (
                <div className="p-4 mb-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Local Settings */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-600">
                        <FaHdd /> Local Storage (Current Session)
                    </h2>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[500px] text-xs">
                        {JSON.stringify(localSettings, null, 2)}
                    </pre>
                </div>

                {/* Backend Settings */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-600">
                        <FaDatabase /> Backend Database (Truth)
                    </h2>
                    {loading ? (
                        <div className="flex justify-center items-center h-[200px]">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    ) : (
                        <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[500px] text-xs">
                            {backendSettings ? JSON.stringify(backendSettings, null, 2) : 'No settings found in backend'}
                        </pre>
                    )}
                </div>
            </div>

            <div className="mt-8 bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                <h3 className="font-bold text-yellow-800 mb-2">Diagnostic Info</h3>
                <p className="text-sm text-yellow-700">
                    <strong>Authenticated Restaurant:</strong> {authenticatedRestaurant?.name || 'Not Logged In'} ({authenticatedRestaurant?.id})
                </p>
                <p className="text-sm text-yellow-700">
                    <strong>Subdomain:</strong> {typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : 'N/A'}
                </p>
            </div>
        </div>
    );
}
