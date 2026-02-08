'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CompaniesLayout from '@/components/companies/CompaniesLayout';
import { FaStore, FaCheckCircle, FaDatabase, FaChartLine } from 'react-icons/fa';

interface DashboardStats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalTables: number;
  totalMenuItems: number;
  totalOrders: number;
  totalRevenue: number;
  totalStaff: number;
  averageOrderValue: number;
  recentRestaurants: Array<{
    id: string;
    name: string;
    subdomain?: string;
    status: string;
    createdAt: string;
  }>;
}

export default function CompaniesDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalRestaurants: 0,
    activeRestaurants: 0,
    totalTables: 0,
    totalMenuItems: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalStaff: 0,
    averageOrderValue: 0,
    recentRestaurants: []
  });
  const [loading, setLoading] = useState(true);

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
    fetch(`${API_URL}/admin/dashboard/stats`, {
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
        if (data?.success) {
          setStats({
            totalRestaurants: data.totalRestaurants ?? 0,
            activeRestaurants: data.activeRestaurants ?? 0,
            totalTables: data.totalTables ?? 0,
            totalMenuItems: data.totalMenuItems ?? 0,
            totalOrders: data.totalOrders ?? 0,
            totalRevenue: data.totalRevenue ?? 0,
            totalStaff: data.totalStaff ?? 0,
            averageOrderValue: data.averageOrderValue ?? 0,
            recentRestaurants: data.recentRestaurants ?? []
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router, API_URL]);

  return (
    <CompaniesLayout title="Şirket Dashboard" description="Şirketinize ait restoranların özeti">
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">Yükleniyor...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Toplam Restoran</p>
                  <p className="text-3xl font-black text-emerald-900 mt-2">{stats.totalRestaurants}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <FaStore className="text-white text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 border border-teal-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-teal-600 font-bold uppercase tracking-wider">Aktif Restoranlar</p>
                  <p className="text-3xl font-black text-teal-900 mt-2">{stats.activeRestaurants}</p>
                </div>
                <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                  <FaCheckCircle className="text-white text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Toplam Masa</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">{stats.totalTables}</p>
                </div>
                <div className="w-12 h-12 bg-slate-500 rounded-xl flex items-center justify-center">
                  <FaDatabase className="text-white text-xl" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Toplam Net Ciro</p>
                  <p className="text-3xl font-black text-orange-900 mt-2">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(stats.totalRevenue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <FaChartLine className="text-white text-xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-bold uppercase">Toplam Sipariş</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-bold uppercase">Menü Ürünü</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalMenuItems}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-bold uppercase">Personel</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalStaff}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Son Eklenen Restoranlar</h3>
              <button
                type="button"
                onClick={() => router.push('/companies/restaurants')}
                className="text-emerald-600 text-sm hover:underline font-medium"
              >
                Tümünü Gör
              </button>
            </div>
            {stats.recentRestaurants.length > 0 ? (
              <div className="space-y-4">
                {stats.recentRestaurants.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center">
                      <div className="bg-emerald-100 p-3 rounded-lg mr-4">
                        <FaStore className="text-emerald-600 text-lg" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{r.name}</p>
                        <p className="text-sm text-gray-500">{r.subdomain ?? r.id}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${r.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {r.status === 'active' ? 'Aktif' : 'Beklemede'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FaStore className="text-4xl mx-auto mb-3 text-gray-300" />
                <p>Henüz restoran yok</p>
              </div>
            )}
          </div>
        </>
      )}
    </CompaniesLayout>
  );
}
