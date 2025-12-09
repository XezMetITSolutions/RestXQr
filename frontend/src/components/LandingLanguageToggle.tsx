'use client';

import { useRouter } from 'next/navigation';
import useLanguageStore from '@/store/useLanguageStore';

const languages = [
    { code: 'tr', label: '🇹🇷 TR', fullName: 'Türkçe', route: '/tr' },
    { code: 'de', label: '🇩🇪 DE', fullName: 'Deutsch', route: '/de' },
    { code: 'en', label: '🇬🇧 EN', fullName: 'English', route: '/en' },
];

export default function LandingLanguageToggle() {
    const router = useRouter();
    const { language, setLanguage } = useLanguageStore();

    const handleLanguageChange = (newLang: 'tr' | 'de' | 'en', route: string) => {
        setLanguage(newLang);
        // Optionally navigate to the language-specific route
        // router.push(route);
    };

    return (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-white/95 backdrop-blur-lg rounded-2xl p-2 shadow-2xl border border-gray-200">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code as 'tr' | 'de' | 'en', lang.route)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${language === lang.code
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    title={lang.fullName}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
}
