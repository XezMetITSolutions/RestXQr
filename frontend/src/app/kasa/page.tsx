'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaMoneyBillWave, FaUtensils, FaCheckCircle, FaCreditCard, FaReceipt, FaPrint, FaSignOutAlt, FaTrash, FaPlus, FaMinus, FaTimesCircle } from 'react-icons/fa';

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
  customerName?: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  totalAmount: number;
  paidAmount: number;
  discountAmount: number;
  discountReason?: string;
  cashierNote?: string;
  notes?: string;
  orderType: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export default function KasaPanel() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [staffRole, setStaffRole] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [undoStack, setUndoStack] = useState<Order[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTab, setPaymentTab] = useState<'full' | 'selective' | 'manual'>('full');
  const [selectedItemIndexes, setSelectedItemIndexes] = useState<number[]>([]);
  const [manualAmount, setManualAmount] = useState<string>('');
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [currentTime, setCurrentTime] = useState(new Date());

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('staff_user');
      const token = localStorage.getItem('staff_token');

      if (!user || !token) {
        router.push('/staff-login');
        return;
      }

      const parsedUser = JSON.parse(user);
      setStaffRole(parsedUser.role || '');

      if (parsedUser.role !== 'cashier' && parsedUser.role !== 'manager' && parsedUser.role !== 'admin') {
        alert('Bu panele erişim yetkiniz yok!');
        router.push('/staff-login');
        return;
      }

      if (parsedUser.restaurantId) setRestaurantId(parsedUser.restaurantId);
      if (parsedUser.restaurantName) setRestaurantName(parsedUser.restaurantName);
    };

    checkAuth();
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, [router]);

  const fetchOrders = async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/orders?restaurantId=${restaurantId}`);
      const data = await response.json();
      if (data.success) {
        const paymentOrders = (data.data || []).filter(
          (order: Order) => order.status === 'ready' || order.status === 'completed'
        );
        setOrders(paymentOrders);
      }
    } catch (error) {
      console.error('Siparişler alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  const handlePayment = async (orderId: string, updatedOrder?: any, isPartial = false) => {
    try {
      const payload: any = {
        status: isPartial ? 'ready' : 'completed',
        items: updatedOrder?.items,
        totalAmount: updatedOrder?.totalAmount,
        paidAmount: updatedOrder?.paidAmount,
        discountAmount: updatedOrder?.discountAmount,
        discountReason: updatedOrder?.discountReason,
        cashierNote: updatedOrder?.cashierNote
      };

      const remaining = Number(updatedOrder?.totalAmount || 0) - Number(updatedOrder?.paidAmount || 0) - Number(updatedOrder?.discountAmount || 0);
      if (remaining <= 0) {
        payload.status = 'completed';
      }

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        if (!isPartial || remaining <= 0) {
          setShowPaymentModal(false);
          setSelectedOrder(null);
        }
        fetchOrders();
        alert(isPartial && remaining > 0 ? '✅ Kısmi ödeme kaydedildi.' : '✅ Ödeme tamamlandı!');
      }
    } catch (error) {
      console.error('Ödeme hatası:', error);
    }
  };

  const saveToUndo = (order: Order) => {
    setUndoStack(prev => [JSON.parse(JSON.stringify(order)), ...prev].slice(0, 5));
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    setSelectedOrder(undoStack[0]);
    setUndoStack(prev => prev.slice(1));
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) return;
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if ((await response.json()).success) {
        setShowPaymentModal(false);
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (error) { console.error(error); }
  };

  const applyTreat = (index: number) => {
    if (!selectedOrder || (staffRole !== 'manager' && staffRole !== 'admin')) return;
    saveToUndo(selectedOrder);
    const updatedItems = [...selectedOrder.items];
    updatedItems[index] = { ...updatedItems[index], price: 0, notes: (updatedItems[index].notes || '') + ' (İkram)' };
    const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    setSelectedOrder({ ...selectedOrder, items: updatedItems, totalAmount: newTotal });
  };

  const applyGeneralDiscount = (val: number, type: 'percent' | 'amount') => {
    if (!selectedOrder || (staffRole !== 'manager' && staffRole !== 'admin')) return;
    saveToUndo(selectedOrder);
    let discount = type === 'percent' ? Number(selectedOrder.totalAmount) * (val / 100) : val;
    setSelectedOrder({ ...selectedOrder, discountAmount: discount, discountReason: `${val}${type === 'percent' ? '%' : '₺'} İndirim` });
  };

  const updateItemQuantity = (index: number, newQty: number) => {
    if (!selectedOrder || newQty < 1) return;
    saveToUndo(selectedOrder);
    const updatedItems = [...selectedOrder.items];
    updatedItems[index] = { ...updatedItems[index], quantity: newQty };
    const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    setSelectedOrder({ ...selectedOrder, items: updatedItems, totalAmount: newTotal });
  };

  const updateItemPrice = (index: number, newPrice: number) => {
    if (!selectedOrder || newPrice < 0) return;
    saveToUndo(selectedOrder);
    const updatedItems = [...selectedOrder.items];
    updatedItems[index] = { ...updatedItems[index], price: newPrice };
    const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    setSelectedOrder({ ...selectedOrder, items: updatedItems, totalAmount: newTotal });
  };

  const removeItem = (index: number) => {
    if (!selectedOrder || selectedOrder.items.length <= 1) return;
    saveToUndo(selectedOrder);
    const updatedItems = selectedOrder.items.filter((_, i) => i !== index);
    const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    setSelectedOrder({ ...selectedOrder, items: updatedItems, totalAmount: newTotal });
  };

  const getWaitInfo = (dateString: string) => {
    const diffMins = Math.floor((currentTime.getTime() - new Date(dateString).getTime()) / 60000);
    let color = 'text-green-600 bg-green-50';
    if (diffMins >= 7) color = 'text-red-600 bg-red-50 animate-pulse';
    else if (diffMins >= 3) color = 'text-orange-600 bg-orange-50';
    return { mins: diffMins, color };
  };

  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-500 rounded-2xl shadow-lg shadow-green-200">
              <FaMoneyBillWave className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">KASA PANELİ</h1>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{restaurantName || 'YÜKLENİYOR...'}</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center group">
              <div className="text-2xl font-black text-green-600 group-hover:scale-110 transition-transform">
                {orders.filter(o => o.status === 'completed').reduce((s, o) => s + (Number(o.totalAmount) || 0), 0).toFixed(2)}₺
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">GÜNLÜK CİRO</div>
            </div>
            <div className="text-center group">
              <div className="text-2xl font-black text-orange-500 group-hover:scale-110 transition-transform">
                {orders.filter(o => o.status === 'ready').reduce((s, o) => s + ((Number(o.totalAmount) || 0) - (Number(o.paidAmount) || 0) - (Number(o.discountAmount) || 0)), 0).toFixed(2)}₺
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">BEKLEYEN TAHSİLAT</div>
            </div>
            <button onClick={fetchOrders} className="p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-green-500 hover:text-green-500 transition-all shadow-sm">
              <FaUtensils />
            </button>
            <button onClick={() => { localStorage.clear(); router.push('/staff-login'); }} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
              <FaSignOutAlt />
            </button>
          </div>
        </div>

        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-black text-gray-400 animate-pulse">SİPARİŞLER ÇEKİLİYOR...</p>
          </div>
        ) : orders.filter(o => o.status === 'ready').length === 0 ? (
          <div className="bg-white/50 border-2 border-dashed border-gray-300 rounded-3xl p-20 text-center">
            <FaReceipt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-400">BEKLEYEN ÖDEME BULUNMUYOR</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {orders.filter(o => o.status === 'ready').map(order => {
              const wait = getWaitInfo(order.updated_at || order.created_at);
              const rem = Number(order.totalAmount) - Number(order.paidAmount) - Number(order.discountAmount);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-transparent hover:border-green-500 transition-all group"
                >
                  <div className="bg-gray-50 p-5 flex justify-between items-center border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-green-100">
                        {order.tableNumber}
                      </div>
                      <div>
                        <div className="font-black text-gray-800">MASA {order.tableNumber}</div>
                        <div className="text-[10px] font-bold text-gray-400">{formatTime(order.created_at)}</div>
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${wait.color}`}>
                      {wait.mins} DK BEKLEME
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3 mb-6 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                      {(order.items || []).map((it, i) => (
                        <div key={i} className="flex justify-between text-sm font-bold text-gray-600">
                          <span>{it.quantity}x {it.name}</span>
                          <span>{(Number(it.price || 0) * Number(it.quantity || 1)).toFixed(2)}₺</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 border-t pt-4">
                      {Number(order.paidAmount || 0) > 0 && <div className="flex justify-between text-xs font-bold text-blue-500"><span>ÖDENEN</span><span>{Number(order.paidAmount || 0).toFixed(2)}₺</span></div>}
                      {Number(order.discountAmount || 0) > 0 && <div className="flex justify-between text-xs font-bold text-red-400"><span>İNDİRİM</span><span>-{Number(order.discountAmount || 0).toFixed(2)}₺</span></div>}
                      <div className="flex justify-between items-center bg-green-50 p-4 rounded-2xl">
                        <span className="font-black text-green-700 text-xs uppercase">KALAN</span>
                        <span className="text-2xl font-black text-green-600 font-mono tracking-tighter">{(Number(order.totalAmount || 0) - Number(order.paidAmount || 0) - Number(order.discountAmount || 0)).toFixed(2)}₺</span>
                      </div>
                    </div>
                    <button onClick={() => { setSelectedOrder(order); setUndoStack([]); setShowPaymentModal(true); setManualAmount(''); setPaymentTab('full'); }} className="w-full mt-6 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-green-600 transition-all shadow-lg active:scale-95">
                      ÖDEME AL
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl w-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gray-900 text-white rounded-[30px] flex items-center justify-center text-3xl font-black shadow-2xl">
                  {selectedOrder.tableNumber}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-800 italic uppercase">MASA HESABI</h2>
                  <p className="text-gray-400 font-bold tracking-tighter">İşlem ID: {selectedOrder.id.substring(0, 12).toUpperCase()}</p>
                </div>
              </div>
              <div className="flex gap-4">
                {undoStack.length > 0 && <button onClick={handleUndo} className="px-6 py-3 bg-orange-100 text-orange-600 rounded-2xl font-black hover:bg-orange-600 hover:text-white transition-all">GERİ AL</button>}
                <button onClick={() => { setShowPaymentModal(false); setSelectedOrder(null); }} className="p-4 bg-white border border-gray-200 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm">
                  <FaTimesCircle size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar border-r">
                <div className="flex bg-gray-100 p-2 rounded-3xl mb-8">
                  {(['full', 'selective', 'manual'] as const).map(t => (
                    <button key={t} onClick={() => { setPaymentTab(t); setSelectedItemIndexes([]); }} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${paymentTab === t ? 'bg-white shadow-xl text-gray-900' : 'text-gray-400'}`}>
                      {t === 'full' ? 'TAMAMI' : t === 'selective' ? 'PARÇALI' : 'MANUEL'}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {selectedOrder.items.map((item, idx) => {
                    const sel = selectedItemIndexes.includes(idx);
                    return (
                      <div key={idx} onClick={() => paymentTab === 'selective' && setSelectedItemIndexes(p => p.includes(idx) ? p.filter(i => i !== idx) : [...p, idx])} className={`p-6 rounded-[32px] border-4 transition-all cursor-pointer ${sel ? 'border-green-500 bg-green-50 shadow-lg scale-[1.02]' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-black text-gray-800 uppercase italic">{item.name}</h4>
                          <div className="flex gap-2">
                            {paymentTab === 'full' && (staffRole === 'manager' || staffRole === 'admin') && <button onClick={(e) => { e.stopPropagation(); applyTreat(idx); }} className="p-2 bg-white rounded-xl text-orange-500 shadow-sm"><FaUtensils size={14} /></button>}
                            {paymentTab === 'full' && <button onClick={(e) => { e.stopPropagation(); removeItem(idx); }} className="p-2 bg-white rounded-xl text-red-500 shadow-sm"><FaTrash size={14} /></button>}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border shadow-inner">
                            <button onClick={(e) => { e.stopPropagation(); updateItemQuantity(idx, item.quantity - 1); }} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900"><FaMinus /></button>
                            <span className="w-10 text-center font-black text-xl">{item.quantity}</span>
                            <button onClick={(e) => { e.stopPropagation(); updateItemQuantity(idx, item.quantity + 1); }} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900"><FaPlus /></button>
                          </div>
                          <div className="text-right">
                            <input type="number" value={item.price} onClick={e => e.stopPropagation()} onChange={e => updateItemPrice(idx, Number(e.target.value))} className="w-24 text-right font-black text-2xl text-gray-800 bg-transparent outline-none border-b-2 border-transparent focus:border-green-500" />
                            <span className="font-black text-gray-400 ml-1">₺</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="w-full lg:w-[400px] bg-gray-50 p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-[32px] shadow-sm flex justify-between items-center">
                    <span className="font-black text-gray-400 text-xs text-left">TOPLAM<br />HESAP</span>
                    <span className="text-2xl font-black text-gray-800 tracking-tighter">{Number(selectedOrder.totalAmount || 0).toFixed(2)}₺</span>
                  </div>

                  <div className="bg-white p-6 rounded-[32px] shadow-sm">
                    <span className="font-black text-xs text-gray-400 block mb-3 uppercase tracking-widest">Hesabı Böl</span>
                    <div className="flex gap-2">
                      {[2, 3, 4, 5].map(nu => (
                        <button
                          key={nu}
                          onClick={() => {
                            const remaining = (Number(selectedOrder.totalAmount || 0) - Number(selectedOrder.paidAmount || 0) - Number(selectedOrder.discountAmount || 0));
                            setManualAmount((remaining / nu).toFixed(2));
                            setPaymentTab('manual');
                          }}
                          className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl font-black border border-blue-100 hover:bg-blue-600 hover:text-white transition-all text-sm"
                        >
                          {nu}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(staffRole === 'manager' || staffRole === 'admin') && (
                    <div className="bg-white p-6 rounded-[32px] shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-black text-xs text-gray-400">HIZLI İNDİRİM</span>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                          <button onClick={() => setDiscountType('percent')} className={`px-2 py-1 rounded-lg text-[10px] font-black ${discountType === 'percent' ? 'bg-white shadow' : ''}`}>%</button>
                          <button onClick={() => setDiscountType('amount')} className={`px-2 py-1 rounded-lg text-[10px] font-black ${discountType === 'amount' ? 'bg-white shadow' : ''}`}>₺</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[5, 10, 25, 50].map(v => <button key={v} onClick={() => applyGeneralDiscount(v, discountType)} className="py-2 bg-red-50 text-red-500 rounded-xl text-xs font-black border border-red-100 hover:bg-red-500 hover:text-white transition-all">{discountType === 'percent' ? `%${v}` : `${v}₺`}</button>)}
                      </div>
                    </div>
                  )}

                  <div className="p-8 bg-gray-900 text-white rounded-[40px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-green-500/40 transition-all"></div>
                    <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] mb-2">{paymentTab === 'selective' ? 'SEÇİLİ TUTAR' : paymentTab === 'manual' ? 'GİRİLEN TUTAR' : 'ÖDENECEK KALAN'}</p>
                    <div className="text-5xl font-black tracking-tighter flex items-end gap-1">
                      {paymentTab === 'selective'
                        ? selectedItemIndexes.reduce((s, i) => s + (Number(selectedOrder.items[i]?.price || 0) * Number(selectedOrder.items[i]?.quantity || 0)), 0).toFixed(2)
                        : paymentTab === 'manual' ? (Number(manualAmount) || 0).toFixed(2)
                          : (Number(selectedOrder.totalAmount || 0) - Number(selectedOrder.paidAmount || 0) - Number(selectedOrder.discountAmount || 0)).toFixed(2)
                      }
                      <span className="text-xl opacity-40 ml-1">₺</span>
                    </div>
                  </div>

                  {paymentTab === 'manual' && (
                    <input type="number" placeholder="TUTAR GIRINIZ" value={manualAmount} onChange={e => setManualAmount(e.target.value)} className="w-full p-6 bg-white border-4 border-green-500 rounded-[32px] font-black text-3xl text-center outline-none shadow-xl" />
                  )}

                  <textarea placeholder="NOT EKLE..." value={selectedOrder.cashierNote || ''} onChange={e => setSelectedOrder({ ...selectedOrder, cashierNote: e.target.value })} className="w-full p-6 bg-white border border-gray-200 rounded-[32px] text-xs font-bold outline-none focus:border-green-500" rows={2} />
                </div>

                <div className="space-y-4 pt-6 mt-auto">
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => {
                        let val = 0;
                        if (paymentTab === 'selective') val = selectedItemIndexes.reduce((s, i) => s + (Number(selectedOrder.items[i].price || 0) * Number(selectedOrder.items[i].quantity || 1)), 0);
                        else if (paymentTab === 'manual') val = Number(manualAmount);
                        else val = (Number(selectedOrder.totalAmount || 0) - Number(selectedOrder.paidAmount || 0) - Number(selectedOrder.discountAmount || 0));

                        if (val <= 0) return alert('Geçersiz Tutar');

                        handlePayment(selectedOrder.id, {
                          ...selectedOrder,
                          paidAmount: Number(selectedOrder.paidAmount || 0) + val,
                          cashierNote: (selectedOrder.cashierNote || '') + ' [NAKİT]'
                        }, true);
                      }}
                      className="w-full py-5 bg-green-600 text-white rounded-[28px] font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <FaMoneyBillWave size={24} />
                      NAKİT TAHSİL ET
                    </button>

                    <button
                      onClick={() => {
                        let val = 0;
                        if (paymentTab === 'selective') val = selectedItemIndexes.reduce((s, i) => s + (Number(selectedOrder.items[i].price || 0) * Number(selectedOrder.items[i].quantity || 1)), 0);
                        else if (paymentTab === 'manual') val = Number(manualAmount);
                        else val = (Number(selectedOrder.totalAmount || 0) - Number(selectedOrder.paidAmount || 0) - Number(selectedOrder.discountAmount || 0));

                        if (val <= 0) return alert('Geçersiz Tutar');

                        handlePayment(selectedOrder.id, {
                          ...selectedOrder,
                          paidAmount: Number(selectedOrder.paidAmount || 0) + val,
                          cashierNote: (selectedOrder.cashierNote || '') + ' [KART]'
                        }, true);
                      }}
                      className="w-full py-5 bg-blue-600 text-white rounded-[28px] font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <FaCreditCard size={24} />
                      KARTLA TAHSİL ET
                    </button>
                  </div>

                  <button
                    onClick={() => { setShowPaymentModal(false); setSelectedOrder(null); fetchOrders(); }}
                    className="w-full py-3 bg-gray-100 text-gray-400 rounded-2xl font-bold text-xs hover:bg-red-50 hover:text-red-500 transition-all uppercase tracking-tighter"
                  >
                    Vazgeç ve Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
