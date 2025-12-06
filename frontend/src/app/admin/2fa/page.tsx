'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaShieldAlt, FaQrcode, FaKey, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';

export default function TwoFactorAuth() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const [step, setStep] = useState<'setup' | 'verify' | 'success'>('setup');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/admin/login');
    }
  }, [isAdmin, router]);

  const handleSetup2FA = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Demo: 2FA setup simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Gerçek uygulamada burada 2FA secret oluşturulur ve QR kod üretilir
      setSecret('JBSWY3DPEHPK3PXP');
      setQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
      setStep('verify');
    } catch (error) {
      setError('2FA kurulumu başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('6 haneli doğrulama kodunu giriniz');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Demo: 2FA doğrulama simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (verificationCode === '123456') {
        setStep('success');
        setTimeout(() => router.push('/admin/settings'), 2000);
      } else {
        setError('Geçersiz doğrulama kodu');
      }
    } catch (error) {
      setError('Doğrulama başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <FaShieldAlt className="text-3xl text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">İki Faktörlü Kimlik Doğrulama</h1>
          <p className="text-gray-600 mt-2">Hesabınızı daha güvenli hale getirin</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'setup' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">2FA Kurulumu</h2>
                <p className="text-gray-600">Hesabınızı korumak için iki faktörlü kimlik doğrulamayı etkinleştirin.</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FaKey className="text-yellow-600 mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Güvenlik Avantajları</h3>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      <li>• Ekstra güvenlik katmanı</li>
                      <li>• Yetkisiz erişimi önleme</li>
                      <li>• Hesap güvenliğini artırma</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSetup2FA}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FaShieldAlt className="mr-2" />
                    2FA'yı Etkinleştir
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Doğrulama Kodu</h2>
                <p className="text-gray-600">Authenticator uygulamanızdan 6 haneli kodu giriniz.</p>
              </div>

              {qrCode && (
                <div className="text-center">
                  <div className="bg-gray-100 p-4 rounded-lg inline-block">
                    <FaQrcode className="text-4xl text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">QR kodu tarayın veya manuel kodu girin</p>
                  <p className="text-xs text-gray-400 font-mono">{secret}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doğrulama Kodu
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('setup')}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <FaTimes className="inline mr-2" />
                  İptal
                </button>
                <button
                  onClick={handleVerify2FA}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FaCheck className="mr-2" />
                      Doğrula
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheck className="text-2xl text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">2FA Başarıyla Etkinleştirildi!</h2>
              <p className="text-gray-600">Hesabınız artık iki faktörlü kimlik doğrulama ile korunuyor.</p>
              <p className="text-sm text-gray-500">Ayarlar sayfasına yönlendiriliyorsunuz...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
