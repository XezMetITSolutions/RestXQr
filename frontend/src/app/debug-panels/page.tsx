'use client';

import { useState, useEffect } from 'react';
import { FaBug, FaUtensils, FaShoppingCart, FaFire, FaUser, FaMoneyBillWave, FaPlay } from 'react-icons/fa';
import useRestaurantStore from '@/store/useRestaurantStore';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  restaurantId?: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  id: string;
  restaurantId: string;
  tableNumber: number;
  status: string;
  totalAmount: number;
  notes?: string;
  created_at: string;
  items: OrderItem[];
}

export default function DebugPanelsPage() {
  // Restaurant store - menu sayfası ile aynı
  const { 
    restaurants, 
    menuItems: storeMenuItems,
    fetchRestaurants, 
    fetchRestaurantMenu,
    loading 
  } = useRestaurantStore();

  const [cart, setCart] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

  // Aksaray restoranını bul
  const getCurrentRestaurant = () => {
    return restaurants.find((r: any) => r.username === 'aksaray');
  };

  const currentRestaurant = getCurrentRestaurant();

  // Aksaray restoranına ait menu itemları filtrele
  const menuItems = currentRestaurant?.id 
    ? storeMenuItems.filter((item: any) => item.restaurantId === currentRestaurant.id)
    : [];

  // Restoran ve menu bilgilerini al
  useEffect(() => {
    // Restaurants yoksa fetch et
    if (restaurants.length === 0) {
      fetchRestaurants();
    }
    // Restaurant varsa menüyü fetch et
    if (currentRestaurant?.id) {
      fetchRestaurantMenu(currentRestaurant.id);
      setRestaurantId(currentRestaurant.id);
    }
  }, [restaurants.length, currentRestaurant?.id, fetchRestaurants, fetchRestaurantMenu]);

  // Siparişleri çek
  const fetchOrders = async () => {
    if (!restaurantId) return;

    try {
      const response = await fetch(`${API_URL}/orders?restaurantId=${restaurantId}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Siparişler alınamadı:', error);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchOrders();
      // Her 3 saniyede bir yenile
      const interval = setInterval(fetchOrders, 3000);
      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  // Sepete ekle
  const addToCart = (item: MenuItem) => {
    setCart([...cart, item]);
  };

  // Sepetten çıkar
  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Sipariş ver
  const placeOrder = async () => {
    if (cart.length === 0) {
      alert('Sepet boş!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Sepetteki ürünleri grupla
      const itemMap = new Map<string, { item: MenuItem; quantity: number }>();
      
      cart.forEach(item => {
        const existing = itemMap.get(item.id);
        if (existing) {
          existing.quantity++;
        } else {
          itemMap.set(item.id, { item, quantity: 1 });
        }
      });

      const orderItems = Array.from(itemMap.values()).map(({ item, quantity }) => ({
        menuItemId: item.id,
        name: item.name,
        quantity,
        unitPrice: item.price,
        price: item.price,
        notes: ''
      }));

      const orderData = {
        restaurantId,
        tableNumber,
        items: orderItems,
        notes: 'Debug panelinden test siparişi',
        orderType: 'dine_in'
      };

      console.log('📦 Sipariş gönderiliyor:', orderData);

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Sipariş başarıyla oluşturuldu!\nSipariş ID: ${result.data.id}`);
        setCart([]); // Sepeti temizle
        fetchOrders(); // Siparişleri yenile
      } else {
        alert(`❌ Sipariş oluşturulamadı: ${result.message}`);
      }
    } catch (error: any) {
      console.error('Sipariş hatası:', error);
      alert(`❌ Hata: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  };

  const getOrdersByStatus = (status: string) => {
    return orders.filter(o => o.status === status);
  };

  // Tüm siparişleri sil
  const deleteAllOrders = async () => {
    if (!restaurantId) {
      alert('❌ Restoran bilgisi yok!');
      return;
    }

    const confirmed = confirm(
      `⚠️ TÜM SİPARİŞLERİ SİLMEK İSTEDİĞİNİZDEN EMİN MİSİNİZ?\n\n` +
      `Aksaray restoranının ${orders.length} siparişi silinecek.\n\n` +
      `Bu işlem GERİ ALINAMAZ!`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${API_URL}/orders/bulk?restaurantId=${restaurantId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setOrders([]);
        alert(`✅ Başarılı!\n\n${result.deletedCount} sipariş silindi.`);
        fetchOrders(); // Listeyi yenile
      } else {
        alert(`❌ Hata: ${result.message}`);
      }
    } catch (error: any) {
      console.error('Silme hatası:', error);
      alert(`❌ Hata: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaBug className="text-3xl text-purple-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Paneller Debug Sayfası</h1>
                <p className="text-gray-600">Aksaray Restoran - Canlı Test</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{orders.length}</div>
                <div className="text-sm text-gray-600">Toplam Sipariş</div>
              </div>
              <button
                onClick={deleteAllOrders}
                disabled={isDeleting || orders.length === 0}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isDeleting || orders.length === 0
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
                title={orders.length === 0 ? 'Silinecek sipariş yok' : 'Tüm siparişleri sil'}
              >
                {isDeleting ? '🗑️ Siliniyor...' : '🗑️ Tüm Siparişleri Sil'}
              </button>
            </div>
          </div>
        </div>

        {/* Menu ve Sepet */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaUtensils className="text-orange-500" />
              <h2 className="text-xl font-bold">Aksaray Menü</h2>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Menu yükleniyor...</p>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Menu boş</p>
                <p className="text-sm mt-2">Aksaray restoranı için menu verisi eklenmelidir.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                      </div>
                      <div className="text-lg font-bold text-green-600">{item.price}₺</div>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                    >
                      Sepete Ekle
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sepet */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaShoppingCart className="text-green-500" />
              <h2 className="text-xl font-bold">Sepet</h2>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Masa Numarası
              </label>
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
                min="1"
              />
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Sepet boş
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.price}₺</div>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Toplam:</span>
                    <span className="text-green-600">{Number(getCartTotal()).toFixed(2)}₺</span>
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isSubmitting ? 'Gönderiliyor...' : '🛒 Sipariş Ver'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Paneller */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Garson Panel */}
          <div className="bg-blue-50 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaUser className="text-blue-500" />
              <h2 className="text-xl font-bold">Garson Paneli</h2>
            </div>
            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Sipariş yok</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">Masa {order.tableNumber}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.status === 'pending' ? 'bg-yellow-200' :
                        order.status === 'preparing' ? 'bg-blue-200' :
                        order.status === 'ready' ? 'bg-green-200' :
                        'bg-gray-200'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.items.length} ürün
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {Number(order.totalAmount).toFixed(2)}₺
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mutfak Panel */}
          <div className="bg-orange-50 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaFire className="text-orange-500" />
              <h2 className="text-xl font-bold">Mutfak Paneli</h2>
            </div>
            <div className="space-y-3">
              {getOrdersByStatus('pending').length === 0 && getOrdersByStatus('preparing').length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aktif sipariş yok</p>
              ) : (
                <>
                  {getOrdersByStatus('pending').map((order) => (
                    <div key={order.id} className="bg-yellow-100 rounded-lg p-3 shadow-sm border-2 border-yellow-500">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">Masa {order.tableNumber}</span>
                        <span className="text-xs px-2 py-1 bg-yellow-500 text-white rounded font-bold">
                          YENİ
                        </span>
                      </div>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm">
                          {item.quantity}x {item.name}
                        </div>
                      ))}
                    </div>
                  ))}
                  {getOrdersByStatus('preparing').map((order) => (
                    <div key={order.id} className="bg-blue-100 rounded-lg p-3 shadow-sm border-2 border-blue-500">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">Masa {order.tableNumber}</span>
                        <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded font-bold">
                          HAZIRLANIYOR
                        </span>
                      </div>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm">
                          {item.quantity}x {item.name}
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Kasa Panel */}
          <div className="bg-green-50 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaMoneyBillWave className="text-green-500" />
              <h2 className="text-xl font-bold">Kasa Paneli</h2>
            </div>
            <div className="space-y-3">
              {getOrdersByStatus('ready').length === 0 && getOrdersByStatus('completed').length === 0 ? (
                <p className="text-gray-500 text-center py-4">Ödeme bekleyen yok</p>
              ) : (
                <>
                  {getOrdersByStatus('ready').map((order) => (
                    <div key={order.id} className="bg-green-100 rounded-lg p-3 shadow-sm border-2 border-green-500">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">Masa {order.tableNumber}</span>
                        <span className="text-xs px-2 py-1 bg-green-500 text-white rounded font-bold">
                          ÖDEME BEKLİYOR
                        </span>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {Number(order.totalAmount).toFixed(2)}₺
                      </div>
                    </div>
                  ))}
                  {getOrdersByStatus('completed').map((order) => (
                    <div key={order.id} className="bg-gray-100 rounded-lg p-3 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">Masa {order.tableNumber}</span>
                        <span className="text-xs px-2 py-1 bg-gray-400 text-white rounded font-bold">
                          ÖDENDİ
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-600">
                        {Number(order.totalAmount).toFixed(2)}₺
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="font-semibold text-purple-800 mb-3">🔍 Nasıl Kullanılır?</h3>
          <div className="space-y-2 text-sm text-purple-700">
            <div><strong>1.</strong> Menüden ürün seçin ve sepete ekleyin</div>
            <div><strong>2.</strong> Masa numarasını belirleyin</div>
            <div><strong>3.</strong> "Sipariş Ver" butonuna tıklayın</div>
            <div><strong>4.</strong> Siparişin 3 panelde de anlık görüntülendiğini izleyin</div>
            <div><strong>5.</strong> Panel sayfalarını açarak tam görünümü test edin:</div>
            <div className="ml-4 space-y-1">
              <div>• <a href="/garson" target="_blank" className="text-blue-600 hover:underline">Garson Paneli</a></div>
              <div>• <a href="/mutfak" target="_blank" className="text-blue-600 hover:underline">Mutfak Paneli</a></div>
              <div>• <a href="/kasa" target="_blank" className="text-blue-600 hover:underline">Kasa Paneli</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
