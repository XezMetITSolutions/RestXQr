import { languages } from '@/i18n/settings';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lang: lng }));
}

export default function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return (
    <html lang={lang}>
      <head />
      <body>{children}</body>
    </html>
  );
}
