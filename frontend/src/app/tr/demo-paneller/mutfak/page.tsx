'use client';

import { useEffect } from 'react';
import DemoKitchenContent from '@/components/DemoKitchenContent';
import useLanguageStore from '@/store/useLanguageStore';

export default function TurkishDemoKitchenPage() {
    const { setLanguage } = useLanguageStore();

    useEffect(() => {
        setLanguage('tr');
    }, [setLanguage]);

    return <DemoKitchenContent />;
}
