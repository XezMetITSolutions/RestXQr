import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SetBrandColor from '@/components/SetBrandColor';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'restXqr - Restaurant QR Menu System',
  description: 'Modern restaurant QR menu and ordering system',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

// Client logic for setting brand color moved to Client Component at '@/components/SetBrandColor'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/favicon-dark.svg" type="image/svg+xml" media="(prefers-color-scheme: dark)" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <SetBrandColor />
        {children}
      </body>
    </html>
  );
}
