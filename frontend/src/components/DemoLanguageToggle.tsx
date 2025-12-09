'use client';

import useLanguageStore from '@/store/useLanguageStore';

const languages = [
    { code: 'tr', label: '🇹🇷 TR', fullName: 'Türkçe' },
    { code: 'de', label: '🇩🇪 DE', fullName: 'Deutsch' },
    { code: 'en', label: '🇬🇧 EN', fullName: 'English' },
];

interface DemoLanguageToggleProps {
    theme?: 'purple' | 'green' | 'default';
}

export default function DemoLanguageToggle({ theme = 'default' }: DemoLanguageToggleProps) {
    const { language, setLanguage } = useLanguageStore();

    const getThemeColors = () => {
        switch (theme) {
            case 'green':
                return {
                    bg: 'bg-yellow-50',
                    activeBg: 'bg-green-500',
                    activeText: 'text-white',
                    inactiveText: 'text-gray-700',
                    inactiveHover: 'hover:bg-green-100'
                };
            case 'purple':
                return {
                    bg: 'bg-white bg-opacity-20 backdrop-blur-md',
                    activeBg: 'bg-white',
                    activeText: 'text-purple-700',
                    inactiveText: 'text-white',
                    inactiveHover: 'hover:bg-white hover:bg-opacity-10'
                };
            default:
                return {
                    bg: 'bg-white bg-opacity-20 backdrop-blur-md',
                    activeBg: 'bg-white',
                    activeText: 'text-purple-700',
                    inactiveText: 'text-white',
                    inactiveHover: 'hover:bg-white hover:bg-opacity-10'
                };
        }
    };

    const colors = getThemeColors();

    return (
        <div className={`flex items-center gap-2 ${colors.bg} rounded-xl p-2`}>
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as 'tr' | 'de' | 'en')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${language === lang.code
                            ? `${colors.activeBg} ${colors.activeText} shadow-lg scale-105`
                            : `${colors.inactiveText} ${colors.inactiveHover}`
                        }`}
                    title={lang.fullName}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
}
