'use client';

import { useState, useRef, useEffect } from 'react';
import useLanguageStore from '@/store/useLanguageStore';
import { FaGlobe } from 'react-icons/fa';

const languages = [
    { code: 'tr', label: '🇹🇷 Türkçe', fullName: 'Türkçe' },
    { code: 'de', label: '🇩🇪 Deutsch', fullName: 'Deutsch' },
    { code: 'en', label: '🇬🇧 English', fullName: 'English' },
];

interface DemoLanguageToggleProps {
    theme?: 'purple' | 'green' | 'default';
}

export default function DemoLanguageToggle({ theme = 'default' }: DemoLanguageToggleProps) {
    const { language, setLanguage } = useLanguageStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const getThemeColors = () => {
        switch (theme) {
            case 'green':
                return {
                    buttonBg: 'bg-yellow-50 hover:bg-yellow-100',
                    buttonText: 'text-gray-700',
                    dropdownBg: 'bg-white',
                    itemHover: 'hover:bg-green-50',
                    activeItem: 'bg-green-100 text-green-700'
                };
            case 'purple':
                return {
                    buttonBg: 'bg-white bg-opacity-20 hover:bg-opacity-30',
                    buttonText: 'text-white',
                    dropdownBg: 'bg-white',
                    itemHover: 'hover:bg-purple-50',
                    activeItem: 'bg-purple-100 text-purple-700'
                };
            default:
                return {
                    buttonBg: 'bg-white bg-opacity-20 hover:bg-opacity-30',
                    buttonText: 'text-white',
                    dropdownBg: 'bg-white',
                    itemHover: 'hover:bg-gray-50',
                    activeItem: 'bg-blue-100 text-blue-700'
                };
        }
    };

    const colors = getThemeColors();
    const currentLanguage = languages.find(lang => lang.code === language);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${colors.buttonBg} ${colors.buttonText} px-3 sm:px-4 py-2 rounded-lg font-bold transition-all min-h-[44px] flex items-center gap-2 shadow-sm`}
                title="Change Language"
            >
                <FaGlobe className="text-lg" />
                <span className="hidden sm:inline text-sm">{currentLanguage?.label}</span>
            </button>

            {isOpen && (
                <div className={`absolute right-0 mt-2 ${colors.dropdownBg} rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 min-w-[160px]`}>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                setLanguage(lang.code as 'tr' | 'de' | 'en');
                                setIsOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 ${language === lang.code
                                    ? colors.activeItem
                                    : `text-gray-700 ${colors.itemHover}`
                                }`}
                        >
                            <span className="text-xl">{lang.label.split(' ')[0]}</span>
                            <span className="font-medium">{lang.fullName}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
