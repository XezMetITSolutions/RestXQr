'use client';

import { useEffect } from 'react';
import HomeContent from '@/components/HomeContent';
import useLanguageStore from '@/store/useLanguageStore';
import { LanguageProvider } from '@/context/LanguageContext';

function TurkishPageContent() {
    const { setLanguage } = useLanguageStore();

    useEffect(() => {
        setLanguage('tr');
    }, [setLanguage]);

    return <HomeContent />;
}

export default function TurkishPage() {
    return (
        <LanguageProvider>
            <TurkishPageContent />
        </LanguageProvider>
    );
}
