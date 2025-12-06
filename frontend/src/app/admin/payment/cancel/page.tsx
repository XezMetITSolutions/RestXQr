export default function PaymentCancelPage() {
  return (
    <div className="max-w-xl mx-auto p-8 text-center">
      <div className="text-5xl mb-3">⚠️</div>
      <h1 className="text-2xl font-bold mb-2">Ödeme İptal Edildi</h1>
      <p className="text-gray-600">Ödeme işlemi iptal edildi veya başarısız oldu.</p>
      <a href="/admin/payment" className="inline-block mt-6 px-5 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900">
        Tekrar dene
      </a>
    </div>
  );
}


