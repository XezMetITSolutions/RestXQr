'use client';

import { useRouter } from 'next/navigation';
import useLanguageStore from '@/store/useLanguageStore';

const languages = [
    { code: 'tr', label: 'TR', flag: '🇹🇷', fullName: 'Türkçe', route: '/tr' },
    { code: 'de', label: 'DE', flag: '🇩🇪', fullName: 'Deutsch', route: '/de' },
    { code: 'en', label: 'EN', flag: '🇬🇧', fullName: 'English', route: '/en' },
];

export default function LandingLanguageToggle() {
    const router = useRouter();
    const { language, setLanguage } = useLanguageStore();

    const handleLanguageChange = (newLang: 'tr' | 'de' | 'en') => {
        setLanguage(newLang);
    };

    return (
        <div className="fixed top-8 right-8 z-50 flex items-center bg-white/90 backdrop-blur-2xl rounded-2xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code as 'tr' | 'de' | 'en')}
                    className={`relative flex items-center px-6 py-2.5 rounded-xl font-black text-sm tracking-widest transition-all duration-500 overflow-hidden group ${language === lang.code
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                        }`}
                >
                    <span className="relative z-10">{lang.label}</span>
                    {language === lang.code && (
                        <div className="absolute inset-0 bg-white/20 blur-xl group-hover:bg-white/30 transition-all duration-500"></div>
                    )}
                </button>
            ))}
        </div>
    );
}
