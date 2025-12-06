'use client';

import { useEffect } from 'react';
import DemoCashierContent from '@/components/DemoCashierContent';
import useLanguageStore from '@/store/useLanguageStore';

export default function GermanDemoCashierPage() {
    const { setLanguage } = useLanguageStore();

    useEffect(() => {
        setLanguage('de');
    }, [setLanguage]);

    return <DemoCashierContent />;
}
