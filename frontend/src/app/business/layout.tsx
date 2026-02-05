'use client';

import { LanguageProvider } from '@/context/LanguageContext';

export default function BusinessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LanguageProvider>
            <div style={{ zoom: '0.8', minHeight: '100vh' }}>
                {children}
            </div>
        </LanguageProvider>
    );
}
