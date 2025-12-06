export async function generateStaticParams() {
  return [
    { slug: 'demo', table: '1' },
    { slug: 'demo', table: '2' },
    { slug: 'demo', table: '3' }
  ];
}

export default function TablePage({ params }: { params: { slug: string; table: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Table</h1>
        <p className="text-gray-600">Restaurant: {params.slug}</p>
        <p className="text-gray-600">Table: {params.table}</p>
      </div>
    </div>
  );
}