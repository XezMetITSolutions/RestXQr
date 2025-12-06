export default function PaymentSuccessPage() {
  return (
    <div className="max-w-xl mx-auto p-8 text-center">
      <div className="text-5xl mb-3">✅</div>
      <h1 className="text-2xl font-bold mb-2">Ödeme Başarılı</h1>
      <p className="text-gray-600">Aboneliğiniz etkinleştirildi. Teşekkür ederiz.</p>
      <a href="/admin/payment" className="inline-block mt-6 px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">
        Abonelik sayfasına dön
      </a>
    </div>
  );
}


