import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SetBrandColor from '@/components/SetBrandColor';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://restxqr.com'),
  title: {
    default: 'RestXQr - Digital Restaurant Menu & Ordering System',
    template: '%s | RestXQr'
  },
  description: 'Boost your restaurant efficiency with RestXQr. Digital QR menus, instant ordering, and seamless kitchen management. Setup in minutes.',
  keywords: ['QR Menu', 'Restaurant System', 'Digital Menu', 'Contactless Ordering', 'Restaurant POS', 'Kitchen Display System', 'RestXQr'],
  authors: [{ name: 'RestXQr Tech Solutions' }],
  creator: 'RestXQr Team',
  publisher: 'RestXQr Tech Solutions',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'RestXQr - The Future of Restaurant Management',
    description: 'Transform your restaurant with our all-in-one QR menu and ordering system. Increase sales and efficiency effortlessly.',
    url: 'https://restxqr.com',
    siteName: 'RestXQr',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg', // Ensure you have this image or similar
        width: 1200,
        height: 630,
        alt: 'RestXQr Dashboard Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RestXQr - Smart Restaurant Solutions',
    description: 'Streamline your restaurant operations with RestXQr. Digital menus, orders, and payments in one place.',
    images: ['/twitter-image.jpg'], // Ensure you have this image or similar
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
