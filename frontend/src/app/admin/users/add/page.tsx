'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUsers, FaCheck, FaTimes } from 'react-icons/fa';

export default function AdminUserAdd() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('restaurant_admin');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setDone(true);
    setLoading(false);
    setTimeout(() => router.push('/admin/users'), 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900 flex items-center"><FaUsers className="mr-2"/> Yeni Kullanıcı</h1>
          <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">Kullanıcılara Dön</Link>
        </div>

        {done ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <FaCheck className="mr-2"/> Kullanıcı eklendi. Yönlendiriliyorsunuz...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                <option value="restaurant_admin">Restoran Admin</option>
                <option value="restaurant_owner">Restoran Sahibi</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-400">Kaydet</button>
              <button type="button" onClick={() => router.push('/admin/users')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg inline-flex items-center"><FaTimes className="mr-2"/>İptal</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


