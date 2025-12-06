'use client';

import { useEffect } from 'react';
import DemoCashierContent from '@/components/DemoCashierContent';
import useLanguageStore from '@/store/useLanguageStore';

export default function TurkishDemoCashierPage() {
    const { setLanguage } = useLanguageStore();

    useEffect(() => {
        setLanguage('tr');
    }, [setLanguage]);

    return <DemoCashierContent />;
}
