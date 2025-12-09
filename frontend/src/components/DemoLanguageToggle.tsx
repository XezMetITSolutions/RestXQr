'use client';

import useLanguageStore from '@/store/useLanguageStore';

const languages = [
    { code: 'tr', label: '🇹🇷 TR', fullName: 'Türkçe' },
    { code: 'de', label: '🇩🇪 DE', fullName: 'Deutsch' },
    { code: 'en', label: '🇬🇧 EN', fullName: 'English' },
];

export default function DemoLanguageToggle() {
    const { language, setLanguage } = useLanguageStore();

    return (
        <div className="flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-2">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as 'tr' | 'de' | 'en')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${language === lang.code
                            ? 'bg-white text-purple-700 shadow-lg scale-105'
                            : 'text-white hover:bg-white hover:bg-opacity-10'
                        }`}
                    title={lang.fullName}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
}
