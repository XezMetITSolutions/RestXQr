'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaBuilding, FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';

export default function CompaniesLoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    twoFactorCode: '',
    userId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);
  const router = useRouter();

  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';
  const API_URL = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

  useEffect(() => {
    const storedLockout = localStorage.getItem('admin_lockout');
    if (storedLockout) {
      const lockoutEnd = new Date(storedLockout);
      if (lockoutEnd > new Date()) {
        setIsLocked(true);
        setLockoutTime(lockoutEnd);
        const timer = setInterval(() => {
          if (new Date() >= lockoutEnd) {
            setIsLocked(false);
            setLockoutTime(null);
            localStorage.removeItem('admin_lockout');
            clearInterval(timer);
          }
        }, 1000);
        return () => clearInterval(timer);
      } else {
        localStorage.removeItem('admin_lockout');
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('admin_access_token');
    const raw = localStorage.getItem('admin_user');
    if (token && raw) {
      try {
        const u = JSON.parse(raw);
        if (u.role === 'company_admin') {
          router.replace('/admin/dashboard');
        }
      } catch (_) {}
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    try {
      if (!showTwoFactor) {
        const response = await fetch(`${API_URL}/api/admin/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
            loginFrom: 'company'
          }),
        });

        const data = await response.json();

        if (data.success) {
          if (data.requires2FA) {
            setShowTwoFactor(true);
            setCredentials(prev => ({ ...prev, userId: data.userId }));
            return;
          }
          localStorage.setItem('admin_access_token', data.data.accessToken);
          localStorage.setItem('admin_refresh_token', data.data.refreshToken);
          localStorage.setItem('admin_user', JSON.stringify({
            id: data.data.user.id,
            email: data.data.user.email,
            name: data.data.user.name,
            role: data.data.user.role,
            twoFactorEnabled: data.data.user.twoFactorEnabled,
            companyId: data.data.user.companyId || null,
            companyName: data.data.user.companyName || null
          }));
          setLoginAttempts(0);
          localStorage.removeItem('admin_login_attempts');
          router.push('/admin/dashboard');
          return;
        }
        if (data.locked) {
          setIsLocked(true);
          setLockoutTime(new Date(data.locked_until));
          localStorage.setItem('admin_lockout', data.locked_until);
        }
        throw new Error(data.message || 'Giriş başarısız');
      }

      const response = await fetch(`${API_URL}/api/admin/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: credentials.userId,
          token: credentials.twoFactorCode
        }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || '2FA doğrulama başarısız');

      if (data.success) {
        localStorage.setItem('admin_access_token', data.data.accessToken);
        localStorage.setItem('admin_refresh_token', data.data.refreshToken);
        localStorage.setItem('admin_user', JSON.stringify({
          id: data.data.user.id,
          email: data.data.user.email,
          name: data.data.user.name,
          role: data.data.user.role,
          twoFactorEnabled: data.data.user.twoFactorEnabled,
          companyId: data.data.user.companyId || null,
          companyName: data.data.user.companyName || null
        }));
        setLoginAttempts(0);
        localStorage.removeItem('admin_login_attempts');
        router.push('/admin/dashboard');
      }
    } catch (error) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('admin_login_attempts', newAttempts.toString());
      if (newAttempts >= 5) {
        const lockoutEnd = new Date(Date.now() + 30 * 60 * 1000);
        setIsLocked(true);
        setLockoutTime(lockoutEnd);
        localStorage.setItem('admin_lockout', lockoutEnd.toISOString());
      }
      alert(error instanceof Error ? error.message : 'Giriş başarısız');
    }
  };

  const getRemainingTime = () => {
    if (!lockoutTime) return '';
    const diff = lockoutTime.getTime() - Date.now();
    if (diff <= 0) return '';
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-emerald-500/20 text-emerald-200 rounded-full text-sm font-semibold mb-4">
            <FaBuilding className="mr-2" />
            Şirket Paneli
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Şirket Yönetim Girişi</h1>
          <p className="text-slate-300">Çoklu şube / şirket hesapları</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {isLocked ? (
            <div className="text-center">
              <FaLock className="text-amber-400 text-4xl mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Hesap Geçici Olarak Kilitlendi</h2>
              <p className="text-slate-300 mb-4">Çok fazla başarısız giriş. Lütfen {getRemainingTime()} bekleyin.</p>
              <div className="text-sm text-slate-400">Kalan süre: {getRemainingTime()}</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Kullanıcı adı veya e-posta</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Kullanıcı adı veya e-posta"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Şifre</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Şifre"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              {showTwoFactor && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">İki faktörlü doğrulama kodu</label>
                  <input
                    type="text"
                    value={credentials.twoFactorCode}
                    onChange={(e) => setCredentials(prev => ({ ...prev, twoFactorCode: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-lg tracking-widest"
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                </div>
              )}
              {loginAttempts > 0 && (
                <p className="text-center text-amber-400 text-sm">Başarısız deneme: {loginAttempts}/5</p>
              )}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                {showTwoFactor ? 'Doğrula ve giriş yap' : 'Giriş yap'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-white/20 text-xs text-slate-400 space-y-1">
            <p>Bu sayfa yalnızca şirket (çoklu şube) hesapları içindir.</p>
            <p>Süper yönetici iseniz <a href="/admin/login" className="text-emerald-400 hover:underline">/admin/login</a> kullanın.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
