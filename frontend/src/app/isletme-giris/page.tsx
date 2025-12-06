'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import apiService from '@/services/api';
import { FaEye, FaEyeSlash, FaLock, FaUser, FaArrowRight } from 'react-icons/fa';

export default function IsletmeGirisPage() {
  const router = useRouter();
  const { loginRestaurant } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [subdomain, setSubdomain] = useState('');
  const [restaurantInfo, setRestaurantInfo] = useState<any>(null);

  // Ana domain'den gelenleri demo panele yönlendir
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const currentSubdomain = hostname.split('.')[0];
      const mainDomains = ['localhost', 'www', 'restxqr'];
      
      // Ana domain'den geliyorsa demo panele yönlendir
      if (mainDomains.includes(currentSubdomain) || !hostname.includes('.')) {
        // window.location kullanarak hard redirect yap
        window.location.href = '/demo-paneller/isletme/dashboard';
        return;
      }
    }
  }, []);

  // Subdomain ve restoran bilgilerini yükle
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedUsername && savedRememberMe) {
      setUsername(savedUsername);
      setRememberMe(true);
    }

    const loadRestaurantInfo = async () => {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const currentSubdomain = hostname.split('.')[0];
        const mainDomains = ['localhost', 'www', 'restxqr'];
        
        if (!mainDomains.includes(currentSubdomain) && hostname.includes('.')) {
          setSubdomain(currentSubdomain);
          
          try {
            // Backend'den restoran ayarlarını çek
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
            const response = await fetch(`${API_URL}/restaurants/username/${currentSubdomain}`);
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                const restaurant = data.data;
                
                setRestaurantInfo({
                  name: restaurant.name || `${currentSubdomain.charAt(0).toUpperCase() + currentSubdomain.slice(1)} Restaurant`,
                  description: 'İşletme Paneli', // TODO: Bu bilgi settings'ten gelecek
                  logo: '🍽️'
                });
                return;
              }
            }
          } catch (error) {
            console.error('Failed to fetch restaurant info:', error);
          }
          
          // Fallback
          setRestaurantInfo({
            name: `${currentSubdomain.charAt(0).toUpperCase() + currentSubdomain.slice(1)} Restaurant`,
            description: 'İşletme Paneli',
            logo: '🍽️'
          });
        }
      }
    };
    
    loadRestaurantInfo();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('🔐 Attempting login:', { username, subdomain });
    
    try {
      // Restaurant login
      const response = await apiService.login({ username, password });

      if (response.success && response.data) {
        loginRestaurant(response.data);

        if (rememberMe) {
          localStorage.setItem('rememberedUsername', username);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberedUsername');
          localStorage.removeItem('rememberMe');
        }

        // Redirect to dashboard
        router.push('/business/dashboard');
        return;
      }

      throw new Error('Login failed');
    } catch (error: any) {
      console.warn('⚠️ Business login failed, trying staff login...', error?.message);
      
      // Staff login fallback
      try {
        const currentSubdomain = subdomain || (typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : '');
        const staffResp = await apiService.staffLogin(username, password, currentSubdomain);
        
        if (staffResp.success && staffResp.data) {
          const staff = staffResp.data as any;
          const role = (staff.role || '').toLowerCase();
          
          const roleToPath: Record<string, string> = {
            cashier: '/business/cashier',
            kasiyer: '/business/cashier',
            waiter: '/business/waiter',
            garson: '/business/waiter',
            chef: '/business/kitchen',
            kitchen: '/business/kitchen',
            aşçı: '/business/kitchen',
            asci: '/business/kitchen',
            manager: '/business/dashboard',
            admin: '/business/dashboard'
          };

          try {
            const storageKey = `${role || 'staff'}_staff`;
            sessionStorage.setItem(storageKey, JSON.stringify(staff));
          } catch {}

          const target = roleToPath[role] || '/business/dashboard';
          router.push(target);
          return;
        }

        setError('Kullanıcı adı veya şifre hatalı');
      } catch (staffErr: any) {
        console.error('❌ Staff login also failed:', staffErr);
        setError(staffErr?.message || 'Giriş başarısız');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <span className="text-white text-3xl">{restaurantInfo?.logo || '🍽️'}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {restaurantInfo?.name || 'restXqr Business'}
            </h1>
            <p className="text-purple-200">
              {restaurantInfo?.description || 'İşletme Paneli Giriş'}
            </p>
            {subdomain && (
              <div className="mt-2 text-sm text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full inline-block">
                {subdomain}.restxqr.com
              </div>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-purple-200">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-purple-300" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  placeholder="Kullanıcı adınızı girin"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-purple-200">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-purple-300" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-300 hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-purple-200">Beni Hatırla</span>
              </label>
              <button
                type="button"
                className="text-sm text-purple-300 hover:text-white transition-colors"
                onClick={() => alert('Şifremi Unuttum özelliği yakında eklenecek!')}
              >
                Şifremi Unuttum?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Giriş yapılıyor...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  Giriş Yap
                  <FaArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

