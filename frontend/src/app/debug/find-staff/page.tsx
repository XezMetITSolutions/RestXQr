'use client';

import { useState } from 'react';

interface StaffMember {
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

export default function FindStaffPage() {
    const [email, setEmail] = useState('5612@gmail.com');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const searchStaff = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

            // Get all staff
            const response = await fetch(`${API_URL}/staff/all`);
            const data = await response.json();

            if (data.success) {
                const found = data.data.find((s: StaffMember) =>
                    s.email.toLowerCase() === email.toLowerCase()
                );

                if (found) {
                    // Get restaurant info
                    const restaurantRes = await fetch(`${API_URL}/staff/restaurants`);
                    const restaurantData = await restaurantRes.json();

                    const restaurant = restaurantData.data?.find((r: any) => r.id === found.restaurantId);

                    setResult({
                        staff: found,
                        restaurant: restaurant || null
                    });
                } else {
                    setError('Bu email ile personel bulunamadı');
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteStaff = async (staffId: string) => {
        if (!confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
            const response = await fetch(`${API_URL}/staff/${staffId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                alert('Personel başarıyla silindi!');
                setResult(null);
            } else {
                alert('Silme hatası: ' + data.message);
            }
        } catch (err: any) {
            alert('Hata: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        🔍 Personel Ara ve Sil
                    </h1>
                    <p className="text-gray-600">Email adresine göre personel bulun ve silin</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex gap-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email adresi..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={searchStaff}
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? '⏳ Aranıyor...' : '🔍 Ara'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800 font-semibold">❌ {error}</p>
                    </div>
                )}

                {result && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                ✅ Personel Bulundu
                            </h2>
                            <button
                                onClick={() => deleteStaff(result.staff.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                🗑️ Sil
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Staff Info */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h3 className="font-bold text-lg mb-3 text-blue-900">👤 Personel Bilgileri</h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm text-gray-600">ID</p>
                                        <p className="font-mono text-sm">{result.staff.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">İsim</p>
                                        <p className="font-semibold">{result.staff.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-mono">{result.staff.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Username</p>
                                        <p className="font-mono">{result.staff.username || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Rol</p>
                                        <p className="font-semibold">{result.staff.role}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Durum</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${result.staff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {result.staff.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Telefon</p>
                                        <p className="font-mono">{result.staff.phone || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Oluşturulma</p>
                                        <p className="text-sm">{new Date(result.staff.createdAt).toLocaleString('tr-TR')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Restaurant Info */}
                            <div className="bg-green-50 rounded-lg p-4">
                                <h3 className="font-bold text-lg mb-3 text-green-900">🏪 Restoran Bilgileri</h3>
                                {result.restaurant ? (
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-sm text-gray-600">ID</p>
                                            <p className="font-mono text-sm">{result.restaurant.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">İsim</p>
                                            <p className="font-semibold">{result.restaurant.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Username</p>
                                            <p className="font-mono">@{result.restaurant.username}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-mono">{result.restaurant.email}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-600 italic">Restoran bilgisi bulunamadı</p>
                                )}
                            </div>
                        </div>

                        {/* Raw Data */}
                        <div className="mt-6 bg-gray-50 rounded-lg p-4">
                            <h3 className="font-bold text-sm mb-2 text-gray-700">📄 Ham Veri (JSON)</h3>
                            <pre className="text-xs font-mono bg-white p-3 rounded border overflow-x-auto">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
