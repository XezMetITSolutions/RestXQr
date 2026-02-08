'use client';

import { useState, useEffect } from 'react';
import { fetchWithAdminAuth } from '@/lib/adminApi';

export default function CompaniesDebugPage() {
    const [localStorageUser, setLocalStorageUser] = useState<any>(null);
    const [apiMe, setApiMe] = useState<any>(null);
    const [apiStats, setApiStats] = useState<any>(null);
    const [apiRestaurants, setApiRestaurants] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function runDebug() {
            try {
                setLoading(true);
                // 1. Local Storage
                const user = localStorage.getItem('admin_user');
                setLocalStorageUser(user ? JSON.parse(user) : 'NOT FOUND');

                // 2. /api/admin/auth/me
                const meRes = await fetchWithAdminAuth('/admin/auth/me');
                const meData = await meRes.json().catch(() => ({ error: 'Parse error' }));
                setApiMe({ status: meRes.status, ok: meRes.ok, data: meData });

                // 3. /api/admin/dashboard/stats
                const statsRes = await fetchWithAdminAuth('/admin/dashboard/stats');
                const statsData = await statsRes.json().catch(() => ({ error: 'Parse error' }));
                setApiStats({ status: statsRes.status, ok: statsRes.ok, data: statsData });

                // 4. /api/admin/dashboard/restaurants
                const restRes = await fetchWithAdminAuth('/admin/dashboard/restaurants');
                const restData = await restRes.json().catch(() => ({ error: 'Parse error' }));
                setApiRestaurants({ status: restRes.status, ok: restRes.ok, data: restData });

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        runDebug();
    }, []);

    return (
        <div className="p-8 bg-gray-900 text-green-400 font-mono min-h-screen">
            <h1 className="text-2xl font-bold mb-6 border-b border-green-800 pb-2">Company Management Debug Panel</h1>

            {loading && <div className="animate-pulse">Running diagnostics...</div>}
            {error && <div className="text-red-500 bg-red-900/20 p-4 border border-red-500 mb-4 font-bold">ERROR: {error}</div>}

            <div className="space-y-8">
                <section>
                    <h2 className="text-xl text-white mb-2 underline">1. LocalStorage 'admin_user'</h2>
                    <pre className="bg-black p-4 rounded border border-green-900 overflow-auto max-h-64">
                        {JSON.stringify(localStorageUser, null, 2)}
                    </pre>
                </section>

                <section>
                    <h2 className="text-xl text-white mb-2 underline">2. API Check: /api/admin/auth/me</h2>
                    <pre className="bg-black p-4 rounded border border-green-900 overflow-auto max-h-64">
                        {JSON.stringify(apiMe, null, 2)}
                    </pre>
                </section>

                <section>
                    <h2 className="text-xl text-white mb-2 underline">3. API Check: /api/admin/dashboard/stats</h2>
                    <pre className="bg-black p-4 rounded border border-green-900 overflow-auto max-h-64">
                        {JSON.stringify(apiStats, null, 2)}
                    </pre>
                </section>

                <section>
                    <h2 className="text-xl text-white mb-2 underline">4. API Check: /api/admin/dashboard/restaurants</h2>
                    <pre className="bg-black p-4 rounded border border-green-900 overflow-auto max-h-64">
                        {JSON.stringify(apiRestaurants, null, 2)}
                    </pre>
                </section>

                <section className="mt-12 pt-8 border-t border-green-800 text-gray-400 text-sm">
                    <p>This page helps diagnose why restaurants are not visible for company admins.</p>
                    <p className="mt-2 font-bold text-yellow-500">
                        If 'companyId' is null in any of the above, the assignment is broken or the token is stale.
                    </p>
                </section>
            </div>
        </div>
    );
}
