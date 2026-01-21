'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DBSchemaFixPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFixSchema = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api'}/admin-fix/fix-db-schema`);
            const data = await response.json();

            if (response.ok) {
                setResult(data);
            } else {
                setError(data.message || 'Failed to fix database schema');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">🔧 Database Schema Fix</h1>
                            <p className="text-gray-600">Fix missing database columns and schema issues</p>
                        </div>
                        <button
                            onClick={() => router.push('/business/menu')}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            ← Back to Menu
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    This tool will add missing database columns to your schema. It checks for and adds:
                                </p>
                                <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                                    <li><code className="bg-blue-100 px-1 rounded">kitchen_station</code> to menu_categories</li>
                                    <li><code className="bg-blue-100 px-1 rounded">variations</code> to menu_items</li>
                                    <li><code className="bg-blue-100 px-1 rounded">options</code> to menu_items</li>
                                    <li><code className="bg-blue-100 px-1 rounded">type</code> to menu_items</li>
                                    <li><code className="bg-blue-100 px-1 rounded">bundle_items</code> to menu_items</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Fix Button */}
                    <div className="text-center">
                        <button
                            onClick={handleFixSchema}
                            disabled={loading}
                            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all transform ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl hover:scale-105'
                                } text-white`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Fixing Schema...
                                </span>
                            ) : (
                                '🔧 Fix Database Schema'
                            )}
                        </button>
                    </div>
                </div>

                {/* Result Display */}
                {result && (
                    <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-3 flex-1">
                                <h3 className="text-lg font-bold text-green-800 mb-2">✅ Success!</h3>
                                <p className="text-green-700 mb-3">{result.message}</p>
                                <pre className="bg-green-100 p-4 rounded-lg overflow-auto text-sm">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-3 flex-1">
                                <h3 className="text-lg font-bold text-red-800 mb-2">❌ Error</h3>
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Instructions</h2>
                    <ol className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                            <span>Click the "Fix Database Schema" button above</span>
                        </li>
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                            <span>Wait for the operation to complete</span>
                        </li>
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                            <span>Check the result message to confirm all columns were added</span>
                        </li>
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
                            <span>Return to your menu management page and try creating items again</span>
                        </li>
                    </ol>

                    <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> This operation is safe to run multiple times. Existing columns will not be affected.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
