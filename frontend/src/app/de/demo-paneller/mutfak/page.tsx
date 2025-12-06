'use client';

import { useEffect } from 'react';
import DemoKitchenContent from '@/components/DemoKitchenContent';
import useLanguageStore from '@/store/useLanguageStore';

export default function GermanDemoKitchenPage() {
    const { setLanguage } = useLanguageStore();

    useEffect(() => {
        setLanguage('de');
    }, [setLanguage]);

    return <DemoKitchenContent />;
}
