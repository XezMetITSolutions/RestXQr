'use client';

import PanelsContent from '@/components/PanelsContent';
import useLanguageStore from '@/store/useLanguageStore';
import { useEffect } from 'react';

export default function TurkishPanelsPage() {
    const { setLanguage } = useLanguageStore();

    useEffect(() => {
        setLanguage('tr');
    }, [setLanguage]);

    return <PanelsContent />;
}
