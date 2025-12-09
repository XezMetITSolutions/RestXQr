'use client';

import { useEffect } from 'react';
import HomeContent from '@/components/HomeContent';
import useLanguageStore from '@/store/useLanguageStore';
import { LanguageProvider } from '@/context/LanguageContext';

function EnglishPageContent() {
    const { setLanguage } = useLanguageStore();

    useEffect(() => {
        setLanguage('en');
    }, [setLanguage]);

    return <HomeContent />;
}

export default function EnglishPage() {
    return (
        <LanguageProvider>
            <EnglishPageContent />
        </LanguageProvider>
    );
}
