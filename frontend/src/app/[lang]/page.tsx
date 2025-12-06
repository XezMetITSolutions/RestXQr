import HomeContent from '@/components/HomeContent';

export default function Page({ params: { lang } }: { params: { lang: string } }) {
  return <HomeContent lng={lang} />;
}
