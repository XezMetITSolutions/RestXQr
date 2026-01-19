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
    phone?: string;
    createdAt: string;
}

interface Restaurant {
    id: string;
    name: string;
    username: string;
    email: string;
}

export default function AllStaffDebugPage() {
    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('all'); // all, active, inactive
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

            // Fetch all staff
            const staffRes = await fetch(`${API_URL}/staff/all`);
            const staffData = await staffRes.json();

            if (staffData.success) {
                setStaff(staffData.data);
            }

            // Fetch all restaurants
            const restaurantsRes = await fetch(`${API_URL}/staff/restaurants`);
            const restaurantsData = await restaurantsRes.json();

            if (restaurantsData.success) {
                setRestaurants(restaurantsData.data);
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getRestaurantName = (restaurantId: string) => {
        const restaurant = restaurants.find(r => r.id === restaurantId);
        return restaurant ? restaurant.name : 'Bilinmiyor';
    };

    const getRestaurantUsername = (restaurantId: string) => {
        const restaurant = restaurants.find(r => r.id === restaurantId);
        return restaurant ? restaurant.username : '-';
    };

    const filteredStaff = staff.filter(s => {
        // Status filter
        if (filter === 'active' && s.status !== 'active') return false;
        if (filter === 'inactive' && s.status === 'active') return false;

        // Restaurant filter
        if (selectedRestaurant !== 'all' && s.restaurantId !== selectedRestaurant) return false;

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                s.name.toLowerCase().includes(search) ||
                s.email.toLowerCase().includes(search) ||
                (s.username && s.username.toLowerCase().includes(search)) ||
                getRestaurantName(s.restaurantId).toLowerCase().includes(search)
            );
        }

        return true;
    });

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'cashier': return 'bg-blue-100 text-blue-800';
            case 'waiter': return 'bg-green-100 text-green-800';
            case 'kitchen': return 'bg-orange-100 text-orange-800';
            case 'manager': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'cashier': return 'Kasiyer';
            case 'waiter': return 'Garson';
            case 'kitchen': return 'Mutfak';
            case 'manager': return 'Yönetici';
            default: return role;
        }
    };

    const groupedByRestaurant = restaurants.map(restaurant => ({
        restaurant,
        staff: staff.filter(s => s.restaurantId === restaurant.id)
    }));

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
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        👥 Tüm Personel Listesi
                    </h1>
                    <p className="text-gray-600">Sistemdeki tüm personel kayıtları</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800 font-semibold">❌ Hata: {error}</p>
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-4xl font-bold text-blue-600">{staff.length}</p>
                        <p className="text-sm text-gray-600 mt-2">Toplam Personel</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-4xl font-bold text-green-600">
                            {staff.filter(s => s.status === 'active').length}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">Aktif Personel</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-4xl font-bold text-orange-600">
                            {restaurants.length}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">Toplam Restoran</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <p className="text-4xl font-bold text-purple-600">
                            {staff.length > 0 ? (staff.length / restaurants.length).toFixed(1) : 0}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">Ortalama Personel/Restoran</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">🔍 Filtreler</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ara
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="İsim, email, username..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Durum
                            </label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tümü</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Pasif</option>
                            </select>
                        </div>

                        {/* Restaurant Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Restoran
                            </label>
                            <select
                                value={selectedRestaurant}
                                onChange={(e) => setSelectedRestaurant(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tüm Restoranlar</option>
                                {restaurants.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.name} ({r.username})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            {filteredStaff.length} personel gösteriliyor
                        </p>
                        <button
                            onClick={fetchData}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            🔄 Yenile
                        </button>
                    </div>
                </div>

                {/* Staff Table */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        📋 Personel Listesi
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">İsim</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Restoran</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rol</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Durum</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Telefon</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Oluşturulma</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                            Personel bulunamadı
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStaff.map((s, index) => (
                                        <tr key={s.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-4 py-3 text-sm font-semibold">{s.name}</td>
                                            <td className="px-4 py-3 text-sm font-mono text-gray-600">{s.email}</td>
                                            <td className="px-4 py-3 text-sm font-mono text-gray-600">{s.username || '-'}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <div>
                                                    <p className="font-semibold">{getRestaurantName(s.restaurantId)}</p>
                                                    <p className="text-xs text-gray-500">@{getRestaurantUsername(s.restaurantId)}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(s.role)}`}>
                                                    {getRoleLabel(s.role)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {s.status === 'active' ? '✅ Aktif' : '❌ Pasif'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{s.phone || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {new Date(s.createdAt).toLocaleDateString('tr-TR')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Grouped by Restaurant */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        🏪 Restoranlara Göre Gruplandırılmış
                    </h2>
                    <div className="space-y-4">
                        {groupedByRestaurant.map(({ restaurant, staff: restaurantStaff }) => (
                            <div key={restaurant.id} className="border-2 border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">{restaurant.name}</h3>
                                        <p className="text-sm text-gray-600">@{restaurant.username}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-blue-600">{restaurantStaff.length}</p>
                                        <p className="text-xs text-gray-600">Personel</p>
                                    </div>
                                </div>
                                {restaurantStaff.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        {restaurantStaff.map(s => (
                                            <div key={s.id} className="bg-gray-50 rounded p-2 text-sm">
                                                <p className="font-semibold">{s.name}</p>
                                                <p className="text-xs text-gray-600">{s.email}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(s.role)}`}>
                                                        {getRoleLabel(s.role)}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {s.status === 'active' ? 'Aktif' : 'Pasif'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">Personel yok</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
