'use client';

import { useEffect } from 'react';
import DemoWaiterContent from '@/components/DemoWaiterContent';
import useLanguageStore from '@/store/useLanguageStore';

export default function GermanDemoWaiterPage() {
    const { setLanguage } = useLanguageStore();

    useEffect(() => {
        setLanguage('de');
    }, [setLanguage]);

    return <DemoWaiterContent />;
}
