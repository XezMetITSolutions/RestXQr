'use client';

import { useEffect } from 'react';
import HomeContent from '@/components/HomeContent';
import useLanguageStore from '@/store/useLanguageStore';
import { LanguageProvider } from '@/context/LanguageContext';

function GermanPageContent() {
    const { setLanguage } = useLanguageStore();

    useEffect(() => {
        setLanguage('de');
    }, [setLanguage]);

    return <HomeContent />;
}

export default function GermanPage() {
    return (
        <LanguageProvider>
            <GermanPageContent />
        </LanguageProvider>
    );
}
