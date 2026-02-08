'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CompaniesLayout from '@/components/companies/CompaniesLayout';
import { FaSearch, FaBuilding, FaEdit } from 'react-icons/fa';

interface Restaurant {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  subscriptionPlan: string;
  maxTables: number;
  maxMenuItems: number;
  maxStaff: number;
  isActive: boolean;
  createdAt: string;
}

export default function CompaniesRestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
  const API_URL = (rawApiUrl.startsWith('http') ? rawApiUrl : `https://${rawApiUrl}`)
    .replace(/\/+$/, '')
    .concat(rawApiUrl.endsWith('/api') || rawApiUrl.endsWith('/api/') ? '' : '/api');

  useEffect(() => {
    const token = localStorage.getItem('admin_access_token');
    if (!token) {
      router.replace('/companies/login');
      return;
    }
    fetch(`${API_URL}/admin/dashboard/restaurants`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    })
      .then((res) => {
        if (res.status === 401) {
          router.replace('/companies/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.success && data.data) setRestaurants(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router, API_URL]);

  const filtered = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CompaniesLayout title="Restoranlar" description="Şirketinize ait restoran listesi">
      <div className="mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Restoran ara (ad, kullanıcı adı, e-posta)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
          <FaBuilding className="text-4xl mx-auto mb-3 text-gray-300" />
          <p>{searchTerm ? 'Arama sonucu yok' : 'Henüz restoran yok'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restoran</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı adı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{r.name}</p>
                      <p className="text-sm text-gray-500">{r.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">@{r.username}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">{r.subscriptionPlan || 'basic'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {r.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/restaurants/${r.id}/edit`}
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium text-sm"
                      >
                        <FaEdit className="text-sm" /> Düzenle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </CompaniesLayout>
  );
}
