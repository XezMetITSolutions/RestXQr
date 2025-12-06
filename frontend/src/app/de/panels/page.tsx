'use client';

import PanelsContent from '@/components/PanelsContent';
import useLanguageStore from '@/store/useLanguageStore';
import { useEffect } from 'react';

export default function GermanPanelsPage() {
    const { setLanguage } = useLanguageStore();

    useEffect(() => {
        setLanguage('de');
    }, [setLanguage]);

    return <PanelsContent />;
}
