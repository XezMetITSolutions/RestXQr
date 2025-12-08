'use client';

import { LanguageProvider } from '@/context/LanguageContext';

export default function MenuLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LanguageProvider>
            {children}
        </LanguageProvider>
    );
}
