'use client';

import { useState, useEffect } from 'react';

interface Staff {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    status: string;
    restaurantId: string;
    createdAt: string;
}

interface Restaurant {
    id: string;
    name: string;
    username: string;
    email: string;
}

export default function KrorenStaffDebugPage() {
    const [loading, setLoading] = useState(true);
    const [krorenRestaurant, setKrorenRestaurant] = useState<Restaurant | null>(null);
    const [krorenStaff, setKrorenStaff] = useState<Staff[]>([]);
    const [allStaff, setAllStaff] = useState<Staff[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

            // Fetch all restaurants
            const restaurantsRes = await fetch(`${API_URL}/staff/restaurants`);
            const restaurantsData = await restaurantsRes.json();

            if (restaurantsData.success) {
                const kroren = restaurantsData.data.find((r: Restaurant) => r.username === 'kroren');
                setKrorenRestaurant(kroren || null);

                if (kroren) {
                    // Fetch staff for Kroren
                    const staffRes = await fetch(`${API_URL}/staff/restaurant/${kroren.id}`);
                    const staffData = await staffRes.json();

                    if (staffData.success) {
                        setKrorenStaff(staffData.data);
                    }
                }
            }

            // Fetch all staff
            const allStaffRes = await fetch(`${API_URL}/staff/all`);
            const allStaffData = await allStaffRes.json();

            if (allStaffData.success) {
                setAllStaff(allStaffData.data);
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        🔍 Kroren Personel Debug
                    </h1>
                    <p className="text-gray-600">Sistemdeki Kroren personel kayıtları</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800 font-semibold">❌ Hata: {error}</p>
                    </div>
                )}

                {/* Kroren Restaurant Info */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        🏪 Kroren Restoran Bilgisi
                    </h2>
                    {krorenRestaurant ? (
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">ID</p>
                                    <p className="font-mono font-semibold">{krorenRestaurant.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">İsim</p>
                                    <p className="font-semibold">{krorenRestaurant.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Username</p>
                                    <p className="font-mono">{krorenRestaurant.username}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-mono">{krorenRestaurant.email}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-red-50 rounded-lg p-4">
                            <p className="text-red-800">❌ Kroren restoranı bulunamadı!</p>
                        </div>
                    )}
                </div>

                {/* Kroren Staff Count */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        👥 Kroren Personel Sayısı
                    </h2>
                    <div className="bg-green-50 rounded-lg p-6 text-center">
                        <p className="text-6xl font-bold text-green-600 mb-2">
                            {krorenStaff.length}
                        </p>
                        <p className="text-gray-600">Kayıtlı Personel</p>
                    </div>
                </div>

                {/* Kroren Staff List */}
                {krorenStaff.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            📋 Kroren Personel Listesi
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">İsim</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rol</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Durum</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Oluşturulma</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {krorenStaff.map((staff, index) => (
                                        <tr key={staff.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-4 py-3 text-sm font-mono">{staff.id}</td>
                                            <td className="px-4 py-3 text-sm font-semibold">{staff.name}</td>
                                            <td className="px-4 py-3 text-sm font-mono">{staff.email}</td>
                                            <td className="px-4 py-3 text-sm font-mono">{staff.username || '-'}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${staff.role === 'cashier' ? 'bg-blue-100 text-blue-800' :
                                                        staff.role === 'waiter' ? 'bg-green-100 text-green-800' :
                                                            staff.role === 'kitchen' ? 'bg-orange-100 text-orange-800' :
                                                                'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {staff.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${staff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {staff.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {new Date(staff.createdAt).toLocaleDateString('tr-TR')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* All Staff Summary */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        📊 Tüm Sistem İstatistikleri
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-blue-600">{allStaff.length}</p>
                            <p className="text-sm text-gray-600">Toplam Personel</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-green-600">
                                {allStaff.filter(s => s.status === 'active').length}
                            </p>
                            <p className="text-sm text-gray-600">Aktif Personel</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-orange-600">
                                {krorenStaff.length > 0 ?
                                    ((krorenStaff.length / allStaff.length) * 100).toFixed(1) : 0}%
                            </p>
                            <p className="text-sm text-gray-600">Kroren Oranı</p>
                        </div>
                    </div>
                </div>

                {/* Refresh Button */}
                <div className="mt-6 text-center">
                    <button
                        onClick={fetchData}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        🔄 Yenile
                    </button>
                </div>
            </div>
        </div>
    );
}
