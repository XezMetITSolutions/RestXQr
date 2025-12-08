'use client';

import { LanguageProvider } from '@/context/LanguageContext';

export default function IsletmeGirisLayout({
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
