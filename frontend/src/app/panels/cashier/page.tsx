'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaDollarSign,
  FaCreditCard,
  FaMoneyBillWave,
  FaReceipt,
  FaPrint,
  FaChartLine,
  FaArrowLeft,
  FaHome,
  FaExclamationCircle,
  FaClock,
  FaCheckCircle,
  FaTimes,
  FaPlus,
  FaMinus,
  FaCalculator,
  FaQrcode
} from 'react-icons/fa';
import { LanguageProvider } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';

export default function DemoCashierPanel() {
  const [activeTab, setActiveTab] = useState('payments');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [changeAmount, setChangeAmount] = useState(0);

  // Demo ödeme bekleyen siparişler
  const demoPendingOrders = [
    {
      id: 'demo_pay_1',
      tableNumber: 3,
      guests: 2,
      items: [
        { id: '1', name: 'Adana Kebap', quantity: 2, price: 45 },
        { id: '2', name: 'Ayran', quantity: 2, price: 15 }
      ],
      totalAmount: 120,
      status: 'ready_for_payment',
      orderTime: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      notes: 'Az acı olsun'
    },
    {
      id: 'demo_pay_2',
      tableNumber: 7,
      guests: 4,
      items: [
        { id: '3', name: 'Lahmacun', quantity: 4, price: 25 },
        { id: '4', name: 'Çay', quantity: 4, price: 8 }
      ],
      totalAmount: 132,
      status: 'ready_for_payment',
      orderTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      notes: ''
    },
    {
      id: 'demo_pay_3',
      tableNumber: 12,
      guests: 1,
      items: [
        { id: '5', name: 'Döner', quantity: 1, price: 35 },
        { id: '6', name: 'Kola', quantity: 1, price: 12 }
      ],
      totalAmount: 47,
      status: 'ready_for_payment',
      orderTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      notes: 'Ekstra sos'
    }
  ];

  // Demo ödeme geçmişi
  const demoPaymentHistory = [
    {
      id: 'demo_history_1',
      orderId: 'demo_order_1',
      tableNumber: 5,
      amount: 95,
      method: 'card',
      items: ['Pide', 'Salata', 'Su'],
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      cashier: 'Ahmet'
    },
    {
      id: 'demo_history_2',
      orderId: 'demo_order_2',
      tableNumber: 9,
      amount: 55,
      method: 'cash',
      items: ['Mantı', 'Cacık'],
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      cashier: 'Mehmet'
    },
    {
      id: 'demo_history_3',
      orderId: 'demo_order_3',
      tableNumber: 2,
      amount: 78,
      method: 'card',
      items: ['Çorba', 'Pilav', 'Ayran'],
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      cashier: 'Ayşe'
    }
  ];

  // Demo günlük istatistikler
  const demoStats = {
    totalSales: 2847,
    totalTransactions: 23,
    cashSales: 1247,
    cardSales: 1600,
    averageTicket: 124,
    pendingOrders: demoPendingOrders.length
  };

  const handlePayment = (order: any) => {
    setSelectedOrder(order);
    setPaymentAmount(order.totalAmount.toString());
    setCashReceived('');
    setChangeAmount(0);
    setShowPaymentModal(true);
  };

  const calculateChange = () => {
    if (paymentMethod === 'cash' && cashReceived && paymentAmount) {
      const received = parseFloat(cashReceived);
      const amount = parseFloat(paymentAmount);
      const change = received - amount;
      setChangeAmount(change > 0 ? change : 0);
    }
  };

  useEffect(() => {
    calculateChange();
  }, [cashReceived, paymentAmount, paymentMethod]);

  const processPayment = () => {
    alert(`✅ Demo: ${paymentMethod === 'cash' ? 'Nakit' : 'Kart'} ile ₺${paymentAmount} ödeme alındı!`);
    setShowPaymentModal(false);
    setSelectedOrder(null);
  };

  const getWaitTimeColor = (minutes: number) => {
    if (minutes > 30) return 'text-red-600';
    if (minutes > 20) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'card': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Nakit';
      case 'card': return 'Kart';
      default: return method;
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-green-600 to-green-800 text-white shadow-lg">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/panels" className="p-2 hover:bg-green-700 rounded-lg transition-colors">
                <FaArrowLeft />
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <FaDollarSign />
                  Demo Restoran - Kasa Paneli
                </h1>
                <p className="text-green-200 text-sm">MasApp Demo Versiyonu</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-green-700 rounded-lg transition-colors">
                <FaHome />
              </Link>
              <div className="flex items-center gap-2 bg-green-700 px-3 py-1 rounded-lg">
                <FaClock className="text-yellow-300" />
                <span className="text-sm font-medium">{demoStats.pendingOrders} Bekleyen</span>
              </div>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="px-4 py-2 bg-black bg-opacity-20 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold">₺{demoStats.totalSales}</p>
              <p className="text-xs text-green-200">Günlük Satış</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{demoStats.totalTransactions}</p>
              <p className="text-xs text-green-200">İşlem Sayısı</p>
            </div>
            <div>
              <p className="text-2xl font-bold">₺{demoStats.averageTicket}</p>
              <p className="text-xs text-green-200">Ortalama Sepet</p>
            </div>
          </div>
        </header>

        {/* Demo Uyarısı */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationCircle className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                🎭 Bu demo versiyondur. Tüm veriler örnek verilerdir ve gerçek işlemler yapılmaz.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white shadow-sm">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'payments'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Ödeme Bekleyen ({demoPendingOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Ödeme Geçmişi
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'stats'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              İstatistikler
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ödeme Bekleyen Siparişler</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {demoPendingOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    {/* Başlık */}
                    <div className="px-4 py-3 bg-green-50 border-b border-green-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-lg text-green-800">Masa {order.tableNumber}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-green-600">
                              {order.guests} kişi
                            </span>
                            <span className={`text-sm ${getWaitTimeColor(Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)))}`}>
                              <FaClock className="inline mr-1" size={12} />
                              {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60))} dk
                            </span>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-green-600">₺{order.totalAmount}</span>
                      </div>
                    </div>

                    {/* Ürünler */}
                    <div className="px-4 py-3 space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-sm font-medium">₺{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Notlar */}
                    {order.notes && (
                      <div className="px-4 py-2 bg-blue-50 border-t">
                        <p className="text-sm text-blue-700 italic">
                          <strong>Not:</strong> {order.notes}
                        </p>
                      </div>
                    )}

                    {/* İşlemler */}
                    <div className="px-4 py-3 border-t bg-gray-50">
                      <button
                        onClick={() => handlePayment(order)}
                        className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <FaDollarSign />
                        Ödeme Al
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ödeme Geçmişi</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Masa</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürünler</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödeme</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zaman</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kasiyer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {demoPaymentHistory.map(payment => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {payment.tableNumber}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {payment.items.join(', ')}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            ₺{payment.amount}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(payment.method)}`}>
                              {getMethodText(payment.method)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(payment.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {payment.cashier}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                              <FaPrint />
                              Yazdır
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Günlük İstatistikler</h2>
              
              {/* Özet Kartlar */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-full">
                      <FaChartLine className="text-green-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Toplam Satış</p>
                      <p className="text-2xl font-bold text-gray-900">₺{demoStats.totalSales}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <FaReceipt className="text-blue-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">İşlem Sayısı</p>
                      <p className="text-2xl font-bold text-gray-900">{demoStats.totalTransactions}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <FaMoneyBillWave className="text-yellow-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Nakit Satış</p>
                      <p className="text-2xl font-bold text-gray-900">₺{demoStats.cashSales}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <FaCreditCard className="text-purple-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Kart Satış</p>
                      <p className="text-2xl font-bold text-gray-900">₺{demoStats.cardSales}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ödeme Yöntemi Dağılımı */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Yöntemi Dağılımı</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Nakit</span>
                      <span className="text-sm font-bold text-gray-900">₺{demoStats.cashSales}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: `${(demoStats.cashSales / demoStats.totalSales) * 100}%`}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Kart</span>
                      <span className="text-sm font-bold text-gray-900">₺{demoStats.cardSales}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(demoStats.cardSales / demoStats.totalSales) * 100}%`}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ödeme Modal */}
        {showPaymentModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800">Ödeme İşlemi</h3>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Masa {selectedOrder.tableNumber}</p>
                  <p className="text-2xl font-bold text-gray-900">₺{selectedOrder.totalAmount}</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ödeme Yöntemi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        paymentMethod === 'cash' 
                          ? 'border-green-500 bg-green-50 text-green-700' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <FaMoneyBillWave className="mx-auto mb-1" />
                      <span className="text-sm font-medium">Nakit</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        paymentMethod === 'card' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <FaCreditCard className="mx-auto mb-1" />
                      <span className="text-sm font-medium">Kart</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'cash' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alınan Tutar</label>
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {changeAmount > 0 && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                          Para Üstü: ₺{changeAmount.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={paymentMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < selectedOrder.totalAmount)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Ödemeyi Tamamla
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </LanguageProvider>
  );
}
