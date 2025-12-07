'use client';

import { LanguageProvider } from '@/context/LanguageContext';

export default function DemoLayout({
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
