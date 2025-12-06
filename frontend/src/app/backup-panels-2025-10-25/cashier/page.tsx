'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaDollarSign, 
  FaCreditCard, 
  FaReceipt, 
  FaPrint,
  FaSearch,
  FaSignOutAlt,
  FaUser,
  FaLock,
  FaMoneyBillWave,
  FaChartBar,
  FaBug,
  FaClock
} from 'react-icons/fa';
import apiService from '@/services/api';
import useRestaurantStore from '@/store/useRestaurantStore';

export default function StandaloneCashierPage() {
  const router = useRouter();
  const { currentRestaurant } = useRestaurantStore();
  
  // Staff login states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [staffInfo, setStaffInfo] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Demo data states
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [changeAmount, setChangeAmount] = useState(0);

  // Giriş kontrolü
  useEffect(() => {
    const savedStaff = sessionStorage.getItem('cashier_staff');
    if (savedStaff) {
      const staff = JSON.parse(savedStaff);
      if (staff.role === 'cashier') {
        setIsLoggedIn(true);
        setStaffInfo(staff);
        initializeDemoData();
      }
    }
  }, []);

  // Fetch orders from backend
  const fetchOrders = async () => {
    if (!currentRestaurant?.id) return;
    try {
      const response = await apiService.getOrders(currentRestaurant.id, 'pending'); // Ödeme bekleyen siparişler (pending durumunda)
      if (response.success && Array.isArray(response.data)) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    }
  };

  // Demo data initialize (gerçek verilerle değiştirildi)
  const initializeDemoData = () => {
    fetchOrders();
  };

  // Periyodik sipariş çekme (5 saniye)
  useEffect(() => {
    if (!isLoggedIn || !currentRestaurant?.id) return;
    
    fetchOrders(); // İlk çekim
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [isLoggedIn, currentRestaurant?.id]);

  // Staff login fonksiyonu
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const subdomain = window.location.hostname.split('.')[0];
      const response = await apiService.staffLogin(loginForm.username, loginForm.password, subdomain);
      
      if (response.success && response.data) {
        if (response.data.role === 'cashier') {
          setIsLoggedIn(true);
          setStaffInfo(response.data);
          sessionStorage.setItem('cashier_staff', JSON.stringify(response.data));
          initializeDemoData();
        } else {
          setLoginError('Bu panele erişim yetkiniz yok. Sadece kasiyerler giriş yapabilir.');
        }
      } else {
        setLoginError('Kullanıcı adı veya şifre hatalı');
      }
    } catch (error: any) {
      console.error('Staff login error:', error);
      setLoginError(error.message || 'Giriş yapılamadı');
    } finally {
      setIsLoading(false);
    }
  };

  // Çıkış fonksiyonu
  const handleLogout = () => {
    setIsLoggedIn(false);
    setStaffInfo(null);
    sessionStorage.removeItem('cashier_staff');
  };

  // Ödeme işlemi
  const handlePayment = () => {
    if (!selectedOrder) return;
    
    const total = selectedOrder.totalAmount;
    const received = parseFloat(cashReceived);
    const change = received - total;
    
    if (received < total) {
      alert('Yetersiz ödeme!');
      return;
    }
    
    setChangeAmount(change);
    
    // Demo ödeme tamamlama
    setTimeout(() => {
      setOrders(prev => prev.filter(order => order.id !== selectedOrder.id));
      setShowPaymentModal(false);
      setSelectedOrder(null);
      setCashReceived('');
      setChangeAmount(0);
      alert('Ödeme başarıyla tamamlandı!');
    }, 2000);
  };

  // Login formu
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCreditCard className="text-2xl text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Kasa Paneli</h1>
            <p className="text-gray-600 mt-2">Kasiyer girişi</p>
          </div>

          <form onSubmit={handleStaffLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Kullanıcı adınızı girin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Şifrenizi girin"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <FaCreditCard />
                  Kasa Paneline Giriş
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Giriş bilgilerinizi personel yönetiminden alabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block bg-white bg-opacity-20 p-3 rounded-lg">
              <FaCreditCard className="text-2xl" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold">Kasa Paneli</h2>
              <p className="text-green-100 text-xs sm:text-sm hidden sm:block">Hoş geldiniz, {staffInfo?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="https://restxqr.com/debug/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 sm:px-4 py-2 bg-blue-500 bg-opacity-80 rounded-lg hover:bg-opacity-100 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-white"
              title="Debug sayfasını aç"
            >
              <FaBug className="text-sm sm:text-base" />
              <span className="hidden sm:inline">Debug</span>
            </a>
            <button
              onClick={handleLogout}
              className="px-2 sm:px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              <FaSignOutAlt className="text-sm sm:text-base" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bekleyen Ödemeler</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Tutar</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₺{orders.reduce((sum, order) => sum + order.totalAmount, 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaMoneyBillWave className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bugünkü Ciro</p>
                <p className="text-2xl font-bold text-gray-900">₺2,450</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaChartBar className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Ödeme Bekleyen Siparişler */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Ödeme Bekleyen Siparişler</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {orders.map(order => (
              <div key={order.id} className="p-4 sm:p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Masa {order.tableNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.guests} kişi
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(order.orderTime).toLocaleTimeString('tr-TR')}
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.name} x{item.quantity}</span>
                          <span>₺{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="text-sm text-gray-600 italic mb-2">
                        Not: {order.notes}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-gray-900">
                        Toplam: ₺{order.totalAmount}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowPaymentModal(true);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <FaCreditCard />
                        Ödeme Al
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <FaCreditCard className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Ödeme bekleyen sipariş yok</p>
            </div>
          )}
        </div>
      </div>

      {/* Ödeme Modal */}
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Ödeme İşlemi</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Masa {selectedOrder.tableNumber}</h4>
                <div className="space-y-1 text-sm">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.name} x{item.quantity}</span>
                      <span>₺{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Toplam:</span>
                    <span>₺{selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ödeme Yöntemi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${
                      paymentMethod === 'cash' 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <FaMoneyBillWave />
                    Nakit
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${
                      paymentMethod === 'card' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <FaCreditCard />
                    Kart
                  </button>
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alınan Tutar
                  </label>
                  <input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                  {cashReceived && parseFloat(cashReceived) >= selectedOrder.totalAmount && (
                    <div className="mt-2 text-sm text-green-600">
                      Para üstü: ₺{(parseFloat(cashReceived) - selectedOrder.totalAmount).toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={handlePayment}
                  disabled={paymentMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < selectedOrder.totalAmount)}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FaReceipt />
                  Ödemeyi Tamamla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
