'use client';

import { useState } from 'react';

export default function CreateKrorenStaffPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const createKrorenStaff = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

            // Kroren restaurant ID
            const krorenId = '37b0322a-e11f-4ef1-b108-83be310aaf4d';

            // Create staff members for Kroren
            const staffMembers = [
                {
                    name: 'Kroren Kasa',
                    email: 'kasa@kroren.tr',
                    username: 'kroren_kasa',
                    password: '123456',
                    role: 'cashier',
                    phone: '+90 555 100 0001'
                },
                {
                    name: 'Kroren Garson',
                    email: 'garson@kroren.tr',
                    username: 'kroren_garson',
                    password: '123456',
                    role: 'waiter',
                    phone: '+90 555 100 0002'
                },
                {
                    name: 'Kroren Mutfak',
                    email: 'mutfak@kroren.tr',
                    username: 'kroren_mutfak',
                    password: '123456',
                    role: 'kitchen',
                    phone: '+90 555 100 0003'
                }
            ];

            const results = [];

            for (const staff of staffMembers) {
                try {
                    const response = await fetch(`${API_URL}/staff/restaurant/${krorenId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(staff)
                    });

                    const data = await response.json();
                    results.push({
                        staff: staff.name,
                        success: data.success,
                        message: data.message,
                        data: data.data
                    });
                } catch (err: any) {
                    results.push({
                        staff: staff.name,
                        success: false,
                        error: err.message
                    });
                }
            }

            setResult(results);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        ➕ Kroren Personel Oluştur
                    </h1>
                    <p className="text-gray-600">Kroren restoranı için demo personeller oluşturun</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Oluşturulacak Personeller:
                    </h2>
                    <div className="space-y-3">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <p className="font-semibold">👤 Kroren Kasa</p>
                            <p className="text-sm text-gray-600">Email: kasa@kroren.tr</p>
                            <p className="text-sm text-gray-600">Username: kroren_kasa</p>
                            <p className="text-sm text-gray-600">Rol: Cashier (Kasiyer)</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <p className="font-semibold">👤 Kroren Garson</p>
                            <p className="text-sm text-gray-600">Email: garson@kroren.tr</p>
                            <p className="text-sm text-gray-600">Username: kroren_garson</p>
                            <p className="text-sm text-gray-600">Rol: Waiter (Garson)</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                            <p className="font-semibold">👤 Kroren Mutfak</p>
                            <p className="text-sm text-gray-600">Email: mutfak@kroren.tr</p>
                            <p className="text-sm text-gray-600">Username: kroren_mutfak</p>
                            <p className="text-sm text-gray-600">Rol: Kitchen (Mutfak)</p>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <button
                        onClick={createKrorenStaff}
                        disabled={loading}
                        className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? '⏳ Oluşturuluyor...' : '✨ Personelleri Oluştur'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800 font-semibold">❌ Hata: {error}</p>
                    </div>
                )}

                {result && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            📊 Sonuçlar
                        </h2>
                        <div className="space-y-3">
                            {result.map((r: any, index: number) => (
                                <div
                                    key={index}
                                    className={`rounded-lg p-4 ${r.success ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-semibold text-gray-800">{r.staff}</p>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${r.success ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                            }`}>
                                            {r.success ? '✅ Başarılı' : '❌ Hata'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{r.message || r.error}</p>
                                    {r.data && (
                                        <div className="mt-2 bg-white rounded p-2 text-xs font-mono">
                                            <p>ID: {r.data.id}</p>
                                            <p>Email: {r.data.email}</p>
                                            <p>Role: {r.data.role}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 text-center">
                            <a
                                href="/debug/kroren-staff"
                                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                🔍 Kroren Personel Sayfasına Git
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
