'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { FaExchangeAlt, FaExclamationTriangle, FaCheckCircle, FaSpinner, FaRocket, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import useRestaurantStore from '@/store/useRestaurantStore';

export default function MenuReplicationPage() {
    const { restaurants, fetchRestaurants } = useRestaurantStore();
    const [sourceId, setSourceId] = useState('');
    const [targetId, setTargetId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isReplicating, setIsReplicating] = useState(false);
    const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            await fetchRestaurants();
            setIsLoading(false);
        };
        loadData();
    }, [fetchRestaurants]);

    const handleReplicate = async () => {
        if (!sourceId || !targetId) return;
        if (sourceId === targetId) {
            setResult({ type: 'error', message: 'Source and Target restaurants must be different.' });
            return;
        }

        // Confirmation
        if (!window.confirm('⚠️ CRITICAL WARNING ⚠️\n\nAll menu items, categories, and configuration in the TARGET restaurant will be PERMANENTLY DELETED and replaced with the source data.\n\nAre you sure you want to proceed?')) {
            return;
        }

        setIsReplicating(true);
        setResult(null);

        try {
            // Build the endpoint correctly handling potential trailing slashes and /api suffix
            let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            // Remove trailing slash if exists
            if (apiUrl.endsWith('/')) {
                apiUrl = apiUrl.slice(0, -1);
            }

            // Ensure we don't have double /api if apiUrl already includes it
            const endpoint = apiUrl.endsWith('/api')
                ? `${apiUrl}/restaurants/replicate-menu`
                : `${apiUrl}/api/restaurants/replicate-menu`;

            console.log('🔗 Calling Replicate Menu API at:', endpoint);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_access_token')}`
                },
                body: JSON.stringify({
                    sourceRestaurantId: sourceId,
                    targetRestaurantId: targetId
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setResult({ type: 'success', message: 'Menu replicated successfully! The target restaurant now has the exact copy of the source menu.' });
            } else {
                setResult({ type: 'error', message: data.message || 'Replication failed due to server error.' });
            }
        } catch (error) {
            console.error('Replication error:', error);
            setResult({ type: 'error', message: 'Network error. Please ensure backend is running.' });
        } finally {
            setIsReplicating(false);
        }
    };

    const sourceRestaurant = restaurants.find(r => r.id === sourceId);
    const targetRestaurant = restaurants.find(r => r.id === targetId);

    return (
        <AdminLayout title="Menu Replication" description="Clone entire menu structures between restaurants">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-start space-x-4">
                    <FaRocket className="text-blue-500 text-2xl mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold text-blue-800">Menu Replication Tool</h3>
                        <p className="text-blue-600 mt-1">
                            Use this tool to copy the full menu structure (categories, items, modifiers, images, settings) from a source restaurant (e.g., Main Branch) to a new branch.
                            <br />
                            <span className="font-bold">Note:</span> This will overwrite the target menu.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-8 md:p-12">

                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

                            {/* SOURCE */}
                            <div className="flex-1 w-full space-y-4">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Source Restaurant</label>
                                <div className="relative">
                                    <select
                                        value={sourceId}
                                        onChange={(e) => setSourceId(e.target.value)}
                                        className="w-full p-4 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium appearance-none"
                                        disabled={isLoading || isReplicating}
                                    >
                                        <option value="">Select Source...</option>
                                        {restaurants.map(r => (
                                            <option key={r.id} value={r.id}>{r.name} (@{r.username})</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                    </div>
                                </div>
                                {sourceRestaurant && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-green-50 rounded-lg border border-green-100 text-sm text-green-700 flex items-center">
                                        <FaCheckCircle className="mr-2" /> Source Selected
                                    </motion.div>
                                )}
                            </div>

                            {/* ARROW */}
                            <div className="flex flex-col items-center justify-center pt-6">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${sourceId && targetId ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <FaArrowRight className={`text-xl ${isReplicating ? 'animate-pulse' : ''}`} />
                                </div>
                            </div>

                            {/* TARGET */}
                            <div className="flex-1 w-full space-y-4">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Target Restaurant</label>
                                <div className="relative">
                                    <select
                                        value={targetId}
                                        onChange={(e) => setTargetId(e.target.value)}
                                        className="w-full p-4 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all font-medium appearance-none"
                                        disabled={isLoading || isReplicating}
                                    >
                                        <option value="">Select Target...</option>
                                        {restaurants.map(r => (
                                            <option key={r.id} value={r.id} disabled={r.id === sourceId}>{r.name} (@{r.username})</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                    </div>
                                </div>
                                {targetRestaurant && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-50 rounded-lg border border-red-100 text-sm text-red-700 flex items-center">
                                        <FaExclamationTriangle className="mr-2" /> Warning: Content will be overwritten
                                    </motion.div>
                                )}
                            </div>

                        </div>

                        {/* ACTION BUTTON */}
                        <div className="mt-12 flex flex-col items-center space-y-4">
                            <button
                                onClick={handleReplicate}
                                disabled={!sourceId || !targetId || isReplicating || isLoading}
                                className={`
                  relative w-full md:w-auto px-12 py-5 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105
                  ${!sourceId || !targetId
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:shadow-2xl'
                                    }
                `}
                            >
                                {isReplicating ? (
                                    <span className="flex items-center justify-center">
                                        <FaSpinner className="animate-spin mr-3 text-2xl" /> Replicating Menu...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center">
                                        <FaExchangeAlt className="mr-3" /> Start Replication Process
                                    </span>
                                )}
                            </button>

                            {!isReplicating && sourceId && targetId && (
                                <p className="text-sm text-gray-500 animate-pulse">
                                    This action is irreversible. Please verify your selection.
                                </p>
                            )}
                        </div>

                    </div>

                    {/* RESULTS AREA */}
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={`border-t p-8 ${result.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}
                        >
                            <div className="flex items-center justify-center">
                                <div className={`p-4 rounded-full mr-4 ${result.type === 'success' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                                    {result.type === 'success' ? <FaCheckCircle className="text-3xl" /> : <FaExclamationTriangle className="text-3xl" />}
                                </div>
                                <div>
                                    <h4 className={`text-xl font-bold ${result.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                                        {result.type === 'success' ? 'Success!' : 'Error Occurred'}
                                    </h4>
                                    <p className={`${result.type === 'success' ? 'text-green-700' : 'text-red-700'} mt-1`}>
                                        {result.message}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </div>
            </div>
        </AdminLayout>
    );
}
