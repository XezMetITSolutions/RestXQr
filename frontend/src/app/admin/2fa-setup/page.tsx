'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaShieldAlt, FaQrcode, FaCopy, FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';

export default function Admin2FASetup() {
  const [step, setStep] = useState(1); // 1: Setup, 2: Verify, 3: Complete
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [manualEntryKey, setManualEntryKey] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedItem, setCopiedItem] = useState('');

  const router = useRouter();
  const { login, user, isAuthenticated } = useAuthStore();

  // Zaten giriş yapmışsa admin paneline yönlendir
  useEffect(() => {
    if (isAuthenticated && user?.role === 'super_admin') {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`https://masapp-backend.onrender.com/api/admin/2fa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        setQrCodeDataURL(data.data.qrCodeDataURL);
        setManualEntryKey(data.data.manualEntryKey);
        setBackupCodes(data.data.backupCodes);
        setStep(2);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('2FA kurulumu başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`https://masapp-backend.onrender.com/api/admin/2fa/verify-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...credentials,
          token: twoFactorCode
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBackupCodes(data.data.backupCodes);
        setStep(3);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('2FA doğrulama başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    // 2FA kurulumu tamamlandı, admin paneline yönlendir
    await login({
      id: '1',
      email: 'xezmet@restxqr.com',
      name: 'XezMet Super Admin',
      role: 'super_admin',
      status: 'active',
      twoFactorEnabled: true
    });
    
    router.push('/admin/dashboard');
  };

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(''), 2000);
    } catch (error) {
      console.error('Kopyalama hatası:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
            <FaShieldAlt className="mr-2" />
            2FA Kurulumu
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === 1 && '2FA Kurulumu'}
            {step === 2 && 'Doğrulama'}
            {step === 3 && 'Tamamlandı'}
          </h1>
          <p className="text-gray-300">
            {step === 1 && 'Güvenli giriş için 2FA kurun'}
            {step === 2 && 'Authenticator uygulamanızdan kodu girin'}
            {step === 3 && '2FA başarıyla kuruldu'}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {step === 1 && (
            <form onSubmit={handleSetup} className="space-y-6">
              {/* Kullanıcı Adı */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kullanıcı adınızı girin"
                  required
                />
              </div>

              {/* Şifre */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Şifrenizi girin"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? 'Kurulum Başlatılıyor...' : '2FA Kurulumunu Başlat'}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* QR Kod */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-4">Authenticator Uygulamasına Ekle</h3>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img src={qrCodeDataURL} alt="QR Code" className="w-48 h-48" />
                </div>
                <p className="text-gray-300 text-sm mt-2">
                  QR kodu Google Authenticator, Authy veya benzeri uygulamayla tarayın
                </p>
              </div>

              {/* Manuel Giriş */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Manuel Giriş Anahtarı
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={manualEntryKey}
                    readOnly
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(manualEntryKey, 'manual')}
                    className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {copiedItem === 'manual' ? <FaCheck className="text-green-400" /> : <FaCopy />}
                  </button>
                </div>
              </div>

              {/* Doğrulama Kodu */}
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Doğrulama Kodu
                  </label>
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || twoFactorCode.length !== 6}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Doğrulanıyor...' : 'Doğrula ve Aktif Et'}
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {/* Başarı Mesajı */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheck className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">2FA Başarıyla Kuruldu!</h3>
                <p className="text-gray-300">
                  Artık güvenli giriş için 2FA kullanabilirsiniz.
                </p>
              </div>

              {/* Backup Kodları */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Backup Kodları</h4>
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <p className="text-yellow-200 text-sm mb-2">
                    ⚠️ Bu kodları güvenli bir yerde saklayın. Telefonunuzu kaybederseniz bu kodlarla giriş yapabilirsiniz.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                      <span className="text-white font-mono text-sm flex-1">{code}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(code, `backup-${index}`)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                      >
                        {copiedItem === `backup-${index}` ? <FaCheck className="text-green-400 text-xs" /> : <FaCopy className="text-xs" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
              >
                Admin Paneline Git
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
