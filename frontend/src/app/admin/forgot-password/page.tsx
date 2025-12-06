'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaShieldAlt, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Demo: simulate email send
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-white rounded-xl flex items-center justify-center mb-4">
            <FaShieldAlt className="text-3xl text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white">MASAPP</h1>
          <p className="text-blue-200 mt-2">Süper Yönetici Paneli</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <button
            onClick={() => router.push('/admin/login')}
            className="text-sm text-gray-600 hover:text-gray-800 inline-flex items-center mb-4"
          >
            <FaArrowLeft className="mr-2" /> Girişe dön
          </button>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Şifre Sıfırlama</h2>
          <p className="text-gray-600 mb-6">Kayıtlı email adresinizi girin, sıfırlama bağlantısı gönderelim.</p>

          {sent ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              Sıfırlama bağlantısı {email} adresine gönderildi. Gelen kutunuzu kontrol edin.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Adresi</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@masapp.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg inline-flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" /> Bağlantıyı Gönder
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


