'use client';

import { useEffect } from 'react';
import { LanguageProvider } from '@/context/LanguageContext';
import { useAuthStore } from '@/store/useAuthStore';

export default function BusinessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const initializeAuth = useAuthStore((s) => s.initializeAuth);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    return (
        <LanguageProvider>
            <div style={{ zoom: '0.8', minHeight: '100vh' }}>
                {children}
            </div>
        </LanguageProvider>
    );
}
