'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaShieldAlt, FaKey, FaUser, FaCopy, FaCheck } from 'react-icons/fa';

export default function AdminSetup() {
    const router = useRouter();
    const [step, setStep] = useState<'check' | 'keys' | 'admin'>('check');
    const [hasAdmin, setHasAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // API URL'i normalize et
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com';
    const API_URL = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

    // Generated keys
    const [jwtSecret, setJwtSecret] = useState('');
    const [encryptionKey, setEncryptionKey] = useState('');
    const [copiedItem, setCopiedItem] = useState('');

    // Admin form
    const [adminForm, setAdminForm] = useState({
        username: '',
        email: '',
        name: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        checkAdminExists();
    }, []);

    const checkAdminExists = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/setup/check`);
            const data = await response.json();

            if (data.success) {
                setHasAdmin(data.data.hasAdmin);
                if (data.data.hasAdmin) {
                    // Admin zaten var, login sayfasına yönlendir
                    router.push('/admin/login');
                } else {
                    setStep('keys');
                    generateKeys();
                }
            }
        } catch (error) {
            setError('Bağlantı hatası');
        } finally {
            setIsLoading(false);
        }
    };

    const generateKeys = () => {
        // Generate JWT Secret (32 bytes = 44 base64 chars)
        const jwtArray = new Uint8Array(32);
        crypto.getRandomValues(jwtArray);
        const jwt = btoa(String.fromCharCode(...jwtArray));
        setJwtSecret(jwt);

        // Generate Encryption Key (32 bytes = 64 hex chars)
        const encArray = new Uint8Array(32);
        crypto.getRandomValues(encArray);
        const enc = Array.from(encArray).map(b => b.toString(16).padStart(2, '0')).join('');
        setEncryptionKey(enc);
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

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (adminForm.password !== adminForm.confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        if (adminForm.password.length < 8) {
            setError('Şifre en az 8 karakter olmalıdır');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/admin/setup/create-first-admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: adminForm.username,
                    email: adminForm.email,
                    name: adminForm.name,
                    password: adminForm.password
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Superadmin başarıyla oluşturuldu! Login sayfasına yönlendiriliyorsunuz...');
                setTimeout(() => {
                    router.push('/admin/login');
                }, 2000);
            } else {
                setError(data.message || 'Bir hata oluştu');
            }
        } catch (error) {
            setError('Bağlantı hatası');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && step === 'check') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-xl">Kontrol ediliyor...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold mb-4">
                        <FaShieldAlt className="mr-2" />
                        İlk Kurulum
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">RestXQR Admin Kurulumu</h1>
                    <p className="text-gray-300">İlk superadmin kullanıcısını oluşturun</p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                    {/* Step 1: Environment Keys */}
                    {step === 'keys' && (
                        <div className="space-y-6">
                            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                                    <FaKey className="mr-2" />
                                    1. Render Environment Variables
                                </h3>
                                <p className="text-gray-300 text-sm mb-4">
                                    Aşağıdaki değerleri kopyalayın ve Render dashboard'da environment variables olarak ekleyin.
                                </p>
                            </div>

                            {/* JWT Secret */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    JWT_SECRET
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={jwtSecret}
                                        readOnly
                                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(jwtSecret, 'jwt')}
                                        className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                    >
                                        {copiedItem === 'jwt' ? <FaCheck className="text-green-400" /> : <FaCopy className="text-white" />}
                                    </button>
                                </div>
                            </div>

                            {/* Encryption Key */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    ENCRYPTION_KEY
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={encryptionKey}
                                        readOnly
                                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(encryptionKey, 'enc')}
                                        className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                    >
                                        {copiedItem === 'enc' ? <FaCheck className="text-green-400" /> : <FaCopy className="text-white" />}
                                    </button>
                                </div>
                            </div>

                            {/* Other vars info */}
                            <div className="bg-gray-800/50 rounded-lg p-4">
                                <h4 className="text-white font-medium mb-2">Diğer Environment Variables:</h4>
                                <div className="text-sm text-gray-300 font-mono space-y-1">
                                    <div>JWT_EXPIRATION=15m</div>
                                    <div>NODE_ENV=production</div>
                                    <div>DATABASE_URL=&lt;otomatik-render-tarafindan&gt;</div>
                                </div>
                            </div>

                            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                                <p className="text-yellow-200 text-sm">
                                    ⚠️ Bu key'leri Render'a ekledikten sonra <strong>service'i yeniden deploy edin</strong>, ardından aşağıdaki butona tıklayın.
                                </p>
                            </div>

                            <button
                                onClick={() => setStep('admin')}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                            >
                                Key'leri Ekledim, Superadmin Oluştur
                            </button>
                        </div>
                    )}

                    {/* Step 2: Create Admin */}
                    {step === 'admin' && (
                        <div className="space-y-6">
                            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                                    <FaUser className="mr-2" />
                                    2. İlk Superadmin Oluştur
                                </h3>
                                <p className="text-gray-300 text-sm">
                                    Admin paneline giriş yapmak için ilk kullanıcıyı oluşturun.
                                </p>
                            </div>

                            <form onSubmit={handleCreateAdmin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Kullanıcı Adı
                                    </label>
                                    <input
                                        type="text"
                                        value={adminForm.username}
                                        onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="xezmet"
                                        required
                                        minLength={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={adminForm.email}
                                        onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="admin@restxqr.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Ad Soyad
                                    </label>
                                    <input
                                        type="text"
                                        value={adminForm.name}
                                        onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="XezMet Admin"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Şifre
                                    </label>
                                    <input
                                        type="password"
                                        value={adminForm.password}
                                        onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Min. 8 karakter"
                                        required
                                        minLength={8}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Şifre Tekrar
                                    </label>
                                    <input
                                        type="password"
                                        value={adminForm.confirmPassword}
                                        onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Şifreyi tekrar girin"
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-green-200 text-sm">
                                        {success}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
                                >
                                    {isLoading ? 'Oluşturuluyor...' : 'Superadmin Oluştur'}
                                </button>
                            </form>

                            <button
                                onClick={() => setStep('keys')}
                                className="w-full text-gray-400 hover:text-white text-sm underline"
                            >
                                ← Key'leri tekrar göster
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
