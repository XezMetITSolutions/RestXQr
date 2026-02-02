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

    const handleLanguageChange = (newLang: 'tr' | 'de' | 'en', route: string) => {
        setLanguage(newLang);
    };

    return (
        <div className="fixed top-6 right-6 z-50 flex items-center bg-white/80 backdrop-blur-xl rounded-full p-1.5 shadow-2xl border border-white/20">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code as 'tr' | 'de' | 'en', lang.route)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-sm transition-all duration-300 ${language === lang.code
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                >
                    <span className="text-lg leading-none">{lang.flag}</span>
                    <span>{lang.label}</span>
                </button>
            ))}
        </div>
    );
}
