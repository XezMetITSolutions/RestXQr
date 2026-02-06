'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import useLanguageStore from '@/store/useLanguageStore';

const languages = [
    { code: 'tr', label: 'TR', flag: '🇹🇷', fullName: 'Türkçe', route: '/tr' },
    { code: 'de', label: 'DE', flag: '🇩🇪', fullName: 'Deutsch', route: '/de' },
    { code: 'en', label: 'EN', flag: '🇬🇧', fullName: 'English', route: '/en' },
];

export default function LandingLanguageToggle() {
    const router = useRouter();
    const { language, setLanguage } = useLanguageStore();
    const [isOpen, setIsOpen] = useState(false);

    const handleLanguageChange = (newLang: 'tr' | 'de' | 'en') => {
        setLanguage(newLang);
        setIsOpen(false);
    };

    const currentLang = languages.find(l => l.code === language) || languages[0];

    return (
        <div className="fixed top-6 right-6 z-50">
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-white/50 text-slate-800 font-bold tracking-wide text-sm group"
                >
                    <span className="text-lg">{currentLang.flag}</span>
                    <span>{currentLang.label}</span>
                    <FaChevronDown className={`text-xs text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden p-2"
                        >
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code as 'tr' | 'de' | 'en')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${language === lang.code
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <span className="text-xl">{lang.flag}</span>
                                    <div className="flex flex-col items-start">
                                        <span>{lang.label}</span>
                                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{lang.fullName}</span>
                                    </div>
                                    {language === lang.code && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
