export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ];
}

export default function UserApprovalDetailPage({ params }: { params: { id: string } }) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">User Approval Detail</h1>
        <p className="text-gray-600">ID: {params.id}</p>
      </div>
    </div>
  );
}