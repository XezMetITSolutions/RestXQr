'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaShieldAlt, FaQrcode, FaCopy, FaCheck, FaArrowLeft, FaDownload } from 'react-icons/fa';

export default function Admin2FASetup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [manualEntryKey, setManualEntryKey] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedItem, setCopiedItem] = useState('');

  const API_URL = 'https://masapp-backend.onrender.com';

  useEffect(() => {
    const token = localStorage.getItem('admin_access_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    initiate2FASetup(token);
  }, [router]);

  const initiate2FASetup = async (token: string) => {
    setIsLoading(true);
    try {
      console.log('Initiating 2FA setup with token:', token ? 'Token exists' : 'No token');
      const response = await fetch(`${API_URL}/api/admin/2fa/setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('2FA setup response status:', response.status);

      if (response.status === 401) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setTimeout(() => router.push('/admin/login'), 2000);
        return;
      }

      const data = await response.json();
      console.log('2FA setup response:', data);

      if (data.success) {
        setQrCodeDataURL(data.data.qrCodeDataURL);
        setManualEntryKey(data.data.manualEntryKey);
        setBackupCodes(data.data.backupCodes);
        setStep(2);
      } else {
        setError(data.message || '2FA kurulumu başlatılamadı');
      }
    } catch (error) {
      console.error('2FA setup error:', error);
      setError('Bağlantı hatası oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('admin_access_token');
      const response = await fetch(`${API_URL}/api/admin/2fa/verify-setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: verificationCode })
      });

      const data = await response.json();

      if (data.success) {
        const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
        adminUser.twoFactorEnabled = true;
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
        setStep(3);
      } else {
        setError(data.message || 'Doğrulama başarısız');
      }
    } catch (error) {
      setError('Bağlantı hatası oluştu');
    } finally {
      setIsLoading(false);
    }
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

  const downloadBackupCodes = () => {
    const text = backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'restxqr-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <button onClick={() => router.push('/admin/settings')} className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">2FA Kurulumu</h1>
              <p className="text-gray-600">İki faktörlü doğrulama ile hesabınızı güvence altına alın</p>
            </div>
          </div>

          {isLoading && step === 1 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">2FA kurulumu başlatılıyor...</p>
            </div>
          ) : step === 2 ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <FaShieldAlt className="mr-2" />
                  Adım 1: QR Kodu Tarayın
                </h3>
                <p className="text-sm text-blue-800">Google Authenticator, Authy veya benzeri bir uygulama ile QR kodu tarayın</p>
              </div>

              <div className="text-center">
                <div className="bg-white border-4 border-gray-200 rounded-lg inline-block p-4">
                  {qrCodeDataURL && <img src={qrCodeDataURL} alt="QR Code" className="w-64 h-64" />}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Manuel Giriş Anahtarı</label>
                <div className="flex items-center gap-2">
                  <input type="text" value={manualEntryKey} readOnly className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 font-mono text-sm" />
                  <button onClick={() => copyToClipboard(manualEntryKey, 'manual')} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {copiedItem === 'manual' ? <FaCheck /> : <FaCopy />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <FaQrcode className="mr-2" />
                  Adım 2: Doğrulama Kodunu Girin
                </h3>
                <p className="text-sm text-blue-800 mb-4">Authenticator uygulamanızda görünen 6 haneli kodu girin</p>
                
                <form onSubmit={handleVerify} className="space-y-4">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                  <button
                    type="submit"
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Doğrulanıyor...' : 'Doğrula ve Aktif Et'}
                  </button>
                </form>
              </div>
            </div>
          ) : step === 3 ? (
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheck className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">2FA Başarıyla Aktif Edildi!</h3>
                <p className="text-gray-600">Artık hesabınız iki faktörlü doğrulama ile korunuyor</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-semibold text-yellow-900 mb-3 flex items-center justify-between">
                  <span>Yedek Kodlarınız</span>
                  <button onClick={downloadBackupCodes} className="text-sm bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 flex items-center gap-2">
                    <FaDownload className="text-xs" />
                    İndir
                  </button>
                </h4>
                <p className="text-sm text-yellow-800 mb-4"> Bu kodları güvenli bir yerde saklayın. Telefonunuzu kaybederseniz bu kodlarla giriş yapabilirsiniz.</p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white rounded-lg p-2 border">
                      <span className="font-mono text-sm flex-1">{code}</span>
                      <button onClick={() => copyToClipboard(code, `backup-${index}`)} className="p-1 hover:bg-gray-100 rounded">
                        {copiedItem === `backup-${index}` ? <FaCheck className="text-green-600 text-xs" /> : <FaCopy className="text-gray-400 text-xs" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => router.push('/admin/settings')} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700">
                Ayarlara Dön
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
