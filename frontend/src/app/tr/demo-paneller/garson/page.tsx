'use client';

import { useEffect } from 'react';
import DemoWaiterContent from '@/components/DemoWaiterContent';
import useLanguageStore from '@/store/useLanguageStore';

export default function TurkishDemoWaiterPage() {
    const { setLanguage } = useLanguageStore();

    useEffect(() => {
        setLanguage('tr');
    }, [setLanguage]);

    return <DemoWaiterContent />;
}
