'use client';

import { useState } from 'react';
import { FaTrash, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function OrderCleanerPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('kroren');
    const [date, setDate] = useState('2026-02-02');

    const handleCleanOrders = async () => {
        if (!confirm(`${username} restoranının ${date} tarihindeki TÜM siparişlerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) {
            return;
        }

        setStatus('loading');
        try {
            const response = await fetch(`${API_URL}/orders/bulk-delete-by-date`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    date
                }),
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setMessage(`${data.deletedCount} sipariş başarıyla silindi.`);
            } else {
                setStatus('error');
                setMessage(data.message || 'Bir hata oluştu.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Sunucuya bağlanılamadı.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans p-8 flex flex-col items-center justify-center">
            <div className="max-w-md w-full bg-slate-800 rounded-3xl p-10 shadow-2xl border border-slate-700">
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
                        <FaTrash className="text-red-500 text-3xl" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Sipariş Temizleyici
                    </h1>
                    <p className="text-slate-400 mt-3 text-lg">
                        Belirli bir tarihteki tüm siparişleri kalıcı olarak siler.
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Restoran Kullanıcı Adı</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-5 py-4 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-lg outline-none"
                            placeholder="kroren"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Tarih</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(setDate as any)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-5 py-4 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-lg outline-none"
                        />
                    </div>

                    <button
                        onClick={handleCleanOrders}
                        disabled={status === 'loading'}
                        className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-95 ${status === 'loading'
                                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:shadow-[0_0_30px_rgba(225,29,72,0.3)] hover:-translate-y-1'
                            }`}
                    >
                        {status === 'loading' ? (
                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <FaTrash />
                                Siparişleri Kalıcı Olarak Sil
                            </>
                        )}
                    </button>

                    {status === 'success' && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-5 rounded-2xl flex items-center gap-3 animate-bounce">
                            <FaCheck className="flex-shrink-0" />
                            <span className="font-medium text-lg">{message}</span>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-5 rounded-2xl flex items-center gap-3">
                            <FaExclamationTriangle className="flex-shrink-0" />
                            <span className="font-medium text-lg">{message}</span>
                        </div>
                    )}
                </div>

                <div className="mt-8 p-5 bg-red-500/5 rounded-2xl border border-red-500/10">
                    <p className="text-sm text-red-400 flex gap-2">
                        <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />
                        <span><strong>DİKKAT:</strong> Bu işlem veritabanından siparişleri ve tüm kalemlerini tamamen uçurur. Geri dönüşü yoktur.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
