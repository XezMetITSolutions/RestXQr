export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ];
}

import SubscriptionDetail from './SubscriptionDetail';

export default function SubscriptionDetailPage({ params }: { params: { id: string } }) {
  return <SubscriptionDetail subscriptionId={params.id} />;
}