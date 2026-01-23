'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaMoneyBillWave, FaUtensils, FaCheckCircle, FaCreditCard, FaReceipt, FaPrint, FaSignOutAlt, FaTrash, FaPlus, FaMinus, FaTimesCircle, FaCheck, FaStore, FaGlobe, FaBell, FaBackspace, FaArrowLeft } from 'react-icons/fa';

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
  approved?: boolean;
  originalOrders?: Order[];
}

interface WaiterCall {
  id: string;
  tableNumber: number;
  type: string;
  message: string;
  status: 'active' | 'resolved';
  createdAt: string;
}

export default function KasaPanel() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [calls, setCalls] = useState<WaiterCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [staffRole, setStaffRole] = useState<string>('');
  const [staffUser, setStaffUser] = useState<any>(null); // New state to avoid hydration issues
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [undoStack, setUndoStack] = useState<Order[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Refactored State
  const [paymentTab, setPaymentTab] = useState<'full' | 'partial' | 'hybrid'>('full');
  const [selectedItemIndexes, setSelectedItemIndexes] = useState<number[]>([]);
  const [manualAmount, setManualAmount] = useState<string>('');
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cashAmount, setCashAmount] = useState<string>('');
  const [cardAmount, setCardAmount] = useState<string>('');
  const [activeSource, setActiveSource] = useState<'restoran' | 'online'>('restoran');

  // Print Debug States
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [debugLogs, setDebugLogs] = useState<{ timestamp: string, message: string, type: string }[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printingOrderId, setPrintingOrderId] = useState<string>('');

  // Cash Pad States
  const [showCashPad, setShowCashPad] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [targetPaymentAmount, setTargetPaymentAmount] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

  // Yetki kontrolü (State-based to prevent hydration errors)
  const hasPermission = (permissionId: string) => {
    if (!staffUser) return false;

    // Admin/Manager/Owner always has full access
    if (['admin', 'manager', 'restaurant_owner'].includes(staffUser.role)) return true;

    if (!staffUser.permissions || !Array.isArray(staffUser.permissions)) return false;
    const permission = staffUser.permissions.find((p: any) => p.id === permissionId);
    return permission ? permission.enabled : false;
  };

  const openCashPad = () => {
    if (!hasPermission('cashier_process_payment')) {
      alert('Ödeme alma yetkiniz yok!');
      return;
    }
    if (!selectedOrder) return;
    let amount = 0;
    if (paymentTab === 'partial') {
      // Priority: 1. Manual Entry, 2. Selected Items
      if (manualAmount && Number(manualAmount) > 0) {
        amount = Number(manualAmount);
      } else if (selectedItemIndexes.length > 0) {
        amount = selectedItemIndexes.reduce((s, i) => s + (Number(selectedOrder.items[i].price || 0) * Number(selectedOrder.items[i].quantity || 1)), 0);
      } else {
        alert('Lütfen ürün seçin veya tutar girin.');
        return;
      }
    } else {
      amount = (Number(selectedOrder.totalAmount || 0) - Number(selectedOrder.paidAmount || 0) - Number(selectedOrder.discountAmount || 0));
    }

    if (amount <= 0) return alert("Geçersiz Tutar");

    setTargetPaymentAmount(amount);
    setCashReceived('');
    setShowCashPad(true);
  };

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
      setStaffUser(parsedUser); // Update state for permissions logic

      // Sadece kasiyer, yöneticiler veya özel izni olanlar erişebilir
      const hasAccess =
        parsedUser.role === 'cashier' ||
        parsedUser.role === 'manager' ||
        parsedUser.role === 'admin' ||
        parsedUser.permissions?.canAccessCashierPanel === true;

      if (!hasAccess) {
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
        const normalizedOrders: Order[] = (data.data || []).map((order: any) => ({
          ...order,
          totalAmount: Number(order?.totalAmount) || 0,
          paidAmount: Number(order?.paidAmount) || 0,
          discountAmount: Number(order?.discountAmount) || 0,
          items: (order?.items || []).map((item: any) => ({
            ...item,
            price: Number(item?.price) || 0,
            quantity: Number(item?.quantity) || 0
          }))
        })).filter((order: any) => order.status !== 'completed' && order.status !== 'cancelled');

        const groupOrdersByTable = (orders: Order[]) => {
          const grouped = new Map<number | 'null', Order[]>();

          orders.forEach(order => {
            const tableNumber = order.tableNumber != null ? order.tableNumber : 'null';
            if (!grouped.has(tableNumber)) {
              grouped.set(tableNumber, []);
            }
            grouped.get(tableNumber)!.push(order);
          });

          return Array.from(grouped.values());
        };

        const createGroupedOrder = (tableOrders: Order[]): Order => {
          if (tableOrders.length === 1) {
            return tableOrders[0];
          }

          const latestOrder = tableOrders.reduce((latest, current) => {
            return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
          });

          const allItems: OrderItem[] = [];
          let totalAmount = 0;
          let totalPaidAmount = 0;
          let totalDiscountAmount = 0;

          tableOrders.forEach(order => {
            order.items.forEach(item => {
              allItems.push(item);
            });
            totalAmount += Number(order.totalAmount) || 0;
            totalPaidAmount += Number(order.paidAmount) || 0;
            totalDiscountAmount += Number(order.discountAmount) || 0;
          });

          const statusPriority = { 'pending': 1, 'preparing': 2, 'ready': 3, 'completed': 4, 'cancelled': 5 };
          const mostCriticalStatus = tableOrders.reduce((prev, current) => {
            return statusPriority[prev.status] > statusPriority[current.status] ? prev : current;
          }).status;

          const tableNumberForId = latestOrder.tableNumber != null ? latestOrder.tableNumber : 'null';

          // Check if ALL orders are approved. If any is not approved, the group is not approved.
          const isGroupApproved = tableOrders.every(o => o.approved === true);

          return {
            ...latestOrder,
            items: allItems,
            totalAmount,
            paidAmount: totalPaidAmount,
            discountAmount: totalDiscountAmount,
            status: mostCriticalStatus,
            approved: isGroupApproved, // Force approval check
            id: `table-${tableNumberForId}-grouped`,
            notes: tableOrders.map(o => o.notes).filter(Boolean).filter((note, index, arr) => arr.indexOf(note) === index).join(' | ') || latestOrder.notes,
            originalOrders: tableOrders
          };
        };

        const filteredOrders = (() => {
          const filtered = normalizedOrders.filter(order => {
            if (order.status === 'pending' || order.status === 'preparing' || order.status === 'ready' || order.status === 'completed') return true;
            return false;
          });

          const grouped = groupOrdersByTable(filtered);
          const groupedOrders: Order[] = [];

          grouped.forEach((tableOrders) => {
            groupedOrders.push(createGroupedOrder(tableOrders));
          });

          return groupedOrders;
        })();
        setOrders(filteredOrders);
      }
    } catch (error) {
      console.error('Siparişler alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalls = async () => {
    if (!restaurantId) return;
    try {
      const url = `${API_URL}/waiter/calls?restaurantId=${restaurantId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        const activeCalls = (data.data || []).filter((call: WaiterCall) => call.status === 'active');
        setCalls(activeCalls);
      }
    } catch (error) {
      console.error('❌ Çağrılar fetch hatası:', error);
    }
  };

  const resolveCall = async (callId: string) => {
    try {
      const response = await fetch(`${API_URL}/waiter/calls/${callId}/resolve`, {
        method: 'PUT'
      });
      const data = await response.json();
      if (data.success) {
        setCalls(prev => prev.filter(c => c.id !== callId));
      }
    } catch (error) {
      console.error('Çağrı çözülemedi:', error);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      const loadData = () => {
        fetchOrders();
        fetchCalls();
      };

      loadData();
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  const handlePayment = async (orderId: string, updatedOrder?: any, isPartial = false) => {
    try {
      console.log('💰 Kasa: Ödeme işlemi başlatılıyor:', { orderId, isPartial });

      if (orderId.includes('grouped')) {
        const groupedOrder = orders.find(o => o.id === orderId);
        const tableOrders = groupedOrder?.originalOrders || [];
        const tableNumber = groupedOrder?.tableNumber;

        console.log('📋 Gruplu ödeme tespit edildi:', { tableNumber, orderCount: tableOrders.length });

        const updatePromises = tableOrders.map(async (tableOrder) => {
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
          if (remaining <= 0.05) {
            payload.status = 'completed';
          }

          console.log('💰 Gerçek sipariş ödeme güncelleniyor:', tableOrder.id);
          const response = await fetch(`${API_URL}/orders/${tableOrder.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          return response.json();
        });

        const responses = await Promise.all(updatePromises);
        console.log('✅ Tüm masa ödemeleri güncellendi');

        // Baskı sonuçlarını kontrol et
        for (let i = 0; i < responses.length; i++) {
          if (responses[i].data?.printResults) {
            await handlePrintFailover(responses[i], tableOrders[i].id, false);
          }
        }

        fetchOrders(); // Refresh to get improved data

        const remaining = (Number(updatedOrder?.totalAmount || 0) - Number(updatedOrder?.paidAmount || 0) - Number(updatedOrder?.discountAmount || 0));

        if (isPartial && remaining > 0.05) {
          alert('✅ Kısmi ödeme alındı. Kalan tutar güncellendi.');
          setSelectedItemIndexes([]);
          setManualAmount('');
          setCashAmount('');
          setCardAmount('');

          if (selectedOrder) {
            setSelectedOrder({
              ...selectedOrder,
              paidAmount: updatedOrder.paidAmount,
              cashierNote: updatedOrder.cashierNote
            });
          }
          // User requested modal to close even after partial payment
          setShowPaymentModal(false);
          setSelectedOrder(null);
          setShowCashPad(false);
        } else {
          if (updatedOrder?.tableNumber) {
            fetch(`${API_URL}/qr/deactivate-by-table`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                restaurantId: restaurantId,
                tableNumber: updatedOrder.tableNumber
              })
            }).catch(console.error);
          }
          setShowPaymentModal(false);
          setSelectedOrder(null);
          setShowCashPad(false);
        }
        return;
      }

      // Normal order
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
      if (remaining <= 0.05) {
        payload.status = 'completed';
      }

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Ödeme başarıyla tamamlandı');

        // Baskı sonuçlarını kontrol et
        if (data.data?.printResults) {
          await handlePrintFailover(data, orderId, false);
        }

        fetchOrders();

        if (isPartial && remaining > 0.05) {
          alert('✅ Kısmi ödeme alındı. Kalan tutar güncellendi.');
          setSelectedItemIndexes([]);
          setManualAmount('');
          setCashAmount('');
          setCardAmount('');
          if (selectedOrder) {
            setSelectedOrder({
              ...selectedOrder,
              paidAmount: updatedOrder.paidAmount,
              cashierNote: updatedOrder.cashierNote
            });
          }
          // User requested modal to close even after partial payment
          setShowPaymentModal(false);
          setSelectedOrder(null);
          setShowCashPad(false);
        } else {
          if (updatedOrder?.tableNumber) {
            fetch(`${API_URL}/qr/deactivate-by-table`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                restaurantId: restaurantId,
                tableNumber: updatedOrder.tableNumber
              })
            }).then(() => console.log('✅ QR Code deactivated for table')).catch(err => console.error('Failed to deactivate QR:', err));
          }
          setShowPaymentModal(false);
          setSelectedOrder(null);
          setShowCashPad(false);
        }
      } else {
        console.error('❌ Payment API başarısız response:', data);
      }
    } catch (error) {
      console.error('💥 Ödeme hatası:', error);
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
    if (!selectedOrder || !hasPermission('cashier_apply_discount')) return;
    saveToUndo(selectedOrder);
    const updatedItems = [...selectedOrder.items];
    updatedItems[index] = { ...updatedItems[index], price: 0, notes: (updatedItems[index].notes || '') + ' (İkram)' };
    const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    setSelectedOrder({ ...selectedOrder, items: updatedItems, totalAmount: newTotal });
  };

  const applyGeneralDiscount = (val: number, type: 'percent' | 'amount') => {
    if (!selectedOrder || !hasPermission('cashier_apply_discount')) return;
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

  const removeItem = (index: number) => {
    if (!selectedOrder || selectedOrder.items.length <= 1) return;
    saveToUndo(selectedOrder);
    const updatedItems = selectedOrder.items.filter((_, i) => i !== index);
    const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    setSelectedOrder({ ...selectedOrder, items: updatedItems, totalAmount: newTotal });
  };

  const handleManualPrint = async (orderId: string, showDebug = false) => {
    try {
      if (orderId.includes('grouped')) {
        const groupedOrder = orders.find(o => o.id === orderId);
        const tableOrders = groupedOrder?.originalOrders || [];
        if (tableOrders.length === 0) return alert('Alt siparişler bulunamadı');

        if (showDebug) {
          setShowDebugModal(true);
          setDebugLogs([{ timestamp: new Date().toISOString(), message: 'Gruplu sipariş yazdırılıyor...', type: 'info' }]);
        }

        for (const subOrder of tableOrders) {
          await executePrintRequest(subOrder.id, showDebug);
        }
      } else {
        await executePrintRequest(orderId, showDebug);
      }
    } catch (err) {
      console.error('Print error:', err);
      alert('Yazdırma isteği sırasında hata oluştu.');
    }
  };

  const handlePrintFailover = async (data: any, orderId: string, showDebug: boolean) => {
    const BRIDGE_URL = 'http://localhost:3005';
    let bridgeSuccessCount = 0;
    let localTasks = 0;

    const printResults = data.results || (data.data?.printResults) || [];

    if (printResults.length > 0) {
      for (const result of printResults) {
        if (!result.success && result.isLocalIP) {
          localTasks++;
          if (showDebug) {
            setDebugLogs(prev => [...prev, {
              timestamp: new Date().toISOString(),
              message: `🖨️ Bulut üzerinden yazılamadı (Yerel IP: ${result.ip}). Yerel köprü deneniyor...`,
              type: 'info'
            }]);
          }

          try {
            const bridgeRes = await fetch(`${BRIDGE_URL}/print/${result.ip}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderNumber: orderId.substring(0, 8),
                tableNumber: data.order?.tableNumber || data.data?.tableNumber || '?',
                items: result.stationItems
              })
            });
            const bridgeData = await bridgeRes.json();
            if (bridgeData.success) {
              bridgeSuccessCount++;
              if (showDebug) {
                setDebugLogs(prev => [...prev, {
                  timestamp: new Date().toISOString(),
                  message: `✅ Yerel yazıcıdan başarıyla yazdırıldı! (${result.ip})`,
                  type: 'success'
                }]);
              }
            } else {
              if (showDebug) {
                setDebugLogs(prev => [...prev, {
                  timestamp: new Date().toISOString(),
                  message: `❌ Yerel köprü hatası: ${bridgeData.error}`,
                  type: 'error'
                }]);
              }
            }
          } catch (bridgeErr: any) {
            if (showDebug) {
              setDebugLogs(prev => [...prev, {
                timestamp: new Date().toISOString(),
                message: `❌ Yerel köprüye bağlanılamadı. Port 3005 açık mı?`,
                type: 'error'
              }]);
            }
          }
        }
      }
    }

    if (localTasks > 0) {
      if (bridgeSuccessCount === localTasks) {
        if (!showDebug) alert('✅ Yazıcıya yerel köprü üzerinden başarıyla gönderildi!');
      } else {
        if (!showDebug) alert('❌ Bazı yazıcılara gönderilemedi. Yerel köprü açık mı?');
      }
    } else if (!data.success) {
      if (!showDebug) alert('Yazdırma hatası: ' + (data.message || 'Bilinmeyen hata'));
    }
  };

  const executePrintRequest = async (orderId: string, showDebug: boolean) => {
    const targetUrl = `${API_URL}/orders/${orderId}/print`;
    if (showDebug) {
      setShowDebugModal(true);
      setPrintingOrderId(orderId);
      setIsPrinting(true);
      setDebugLogs(prev => [...prev, { timestamp: new Date().toISOString(), message: `Sunucuya bağlanılıyor: ${targetUrl}`, type: 'info' }]);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 saniye timeout

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await response.json();

      if (showDebug && data.steps) {
        setDebugLogs(prev => [...prev, ...data.steps]);
      }

      await handlePrintFailover(data, orderId, showDebug);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (showDebug) {
        const errorMsg = err.name === 'AbortError' ? 'İstek zaman aşımına uğradı (15s)' : 'Bağlantı hatası: ' + err.message;
        setDebugLogs(prev => [...prev, { timestamp: new Date().toISOString(), message: errorMsg, type: 'error' }]);
      }
    } finally {
      if (showDebug) setIsPrinting(false);
    }
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

        {/* Tab System */}
        <div className="flex gap-4 mb-8 bg-white/50 p-2 rounded-[28px] border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSource('restoran')}
            className={`flex-1 min-w-[150px] py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 ${activeSource === 'restoran'
              ? 'bg-gray-900 text-white shadow-xl scale-[1.02]'
              : 'text-gray-400 hover:bg-gray-100'
              }`}
          >
            <FaStore />
            <span>RESTORAN</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeSource === 'restoran' ? 'bg-white/20' : 'bg-gray-100'}`}>
              {orders.filter(o => o.orderType === 'dine_in').length}
            </span>
          </button>
          <button
            onClick={() => setActiveSource('online')}
            className={`flex-1 min-w-[150px] py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 ${activeSource === 'online'
              ? 'bg-orange-500 text-white shadow-xl scale-[1.02]'
              : 'text-gray-400 hover:bg-gray-100'
              }`}
          >
            <FaGlobe />
            <span>ONLINE SİPARİŞ</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeSource === 'online' ? 'bg-white/20' : 'bg-gray-100'}`}>
              {orders.filter(o => o.orderType !== 'dine_in').length}
            </span>
          </button>
        </div>

        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-black text-gray-400 animate-pulse">SİPARİŞLER ÇEKİLİYOR...</p>
          </div>
        ) : orders.filter(o => activeSource === 'restoran' ? o.orderType === 'dine_in' : o.orderType !== 'dine_in').length === 0 ? (
          <div className="bg-white/50 border-2 border-dashed border-gray-300 rounded-3xl p-20 text-center">
            <FaReceipt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-400 uppercase">
              {activeSource === 'restoran' ? 'AKTİF MASA BULUNMUYOR' : 'AKTİF ONLİNE SİPARİŞ YOK'}
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {orders
              .filter(o => activeSource === 'restoran' ? o.orderType === 'dine_in' : o.orderType !== 'dine_in')
              .sort((a, b) => {
                const callA = a.tableNumber ? calls.find(c => c.tableNumber === a.tableNumber) : null;
                const callB = b.tableNumber ? calls.find(c => c.tableNumber === b.tableNumber) : null;
                if (callA && !callB) return -1;
                if (!callA && callB) return 1;
                return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
              })
              .map(order => {
                const wait = getWaitInfo(order.updated_at || order.created_at);
                const tableCall = order.tableNumber ? calls.find(c => c.tableNumber === order.tableNumber) : null;
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 transition-all group border-transparent hover:border-green-500"
                  >
                    <div className="p-5 flex justify-between items-center border-b bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg ${order.tableNumber != null ? 'bg-green-500 shadow-green-100' : 'bg-purple-500 shadow-purple-100'}`}>
                          {order.tableNumber != null ? order.tableNumber : (order.orderType === 'dine_in' ? '?' : 'WEB')}
                        </div>
                        <div>
                          <div className="font-black text-gray-800 flex items-center gap-2">
                            {order.tableNumber != null
                              ? `MASA ${order.tableNumber}`
                              : (order.orderType === 'dine_in' ? 'MASASIZ SİPARİŞ' : (
                                order.notes?.toLowerCase().includes('getir') ? 'GETİR YEMEK' :
                                  order.notes?.toLowerCase().includes('yemeksepeti') ? 'YEMEKSEPETİ' :
                                    order.notes?.toLowerCase().includes('trendyol') ? 'TRENDYOL YEMEK' : 'DIŞ SİPARİŞ'
                              ))}
                          </div>
                          <div className="text-[10px] font-bold text-gray-400">{formatTime(order.created_at)}</div>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${order.status === 'pending' ? 'text-yellow-600 bg-yellow-50' :
                        order.status === 'preparing' ? 'text-blue-600 bg-blue-50' :
                          order.status === 'ready' ? 'text-green-600 bg-green-50' :
                            'text-gray-600 bg-gray-50'
                        }`}>
                        {order.status === 'pending' ? 'BEKLEMEDE' :
                          order.status === 'preparing' ? 'HAZIRLANIYOR' :
                            order.status === 'ready' ? 'HAZIR' :
                              order.status === 'completed' ? 'TAMAMLANDI' : order.status.toUpperCase()}
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

                        {order.tableNumber == null && !order.id.includes('grouped') && (
                          <button
                            onClick={() => {
                              if (confirm('Bu masasız siparişi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
                                fetch(`${API_URL}/orders/${order.id}`, {
                                  method: 'DELETE',
                                  headers: { 'Accept': 'application/json' }
                                }).then(response => {
                                  if (response.ok) {
                                    alert('Masasız sipariş başarıyla silindi');
                                    fetchOrders();
                                  } else {
                                    alert(`Sipariş silinemedi! (Hata Kodu: ${response.status})`);
                                    fetchOrders();
                                  }
                                }).catch(error => {
                                  console.error('Sipariş silme hatası:', error);
                                  alert('Sipariş silinirken teknik bir hata oluştu. Lütfen bağlantınızı kontrol edin.');
                                  fetchOrders();
                                });
                              }
                            }}
                            className="w-full mt-3 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <FaTrash size={14} />
                            <span>MASASIZ SİPARİŞİ SİL</span>
                          </button>
                        )}
                      </div>
                      <div className="flex gap-3 mt-6">
                        {hasPermission('cashier_process_payment') && (
                          <button onClick={() => { setSelectedOrder(order); setUndoStack([]); setShowPaymentModal(true); setManualAmount(''); setPaymentTab('full'); }} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-green-600 transition-all shadow-lg active:scale-95">
                            ÖDEME AL
                          </button>
                        )}

                        {order.approved === false && hasPermission('cashier_approve_orders') && (
                          <button
                            onClick={async () => {
                              try {
                                if (order.id.includes('grouped')) {
                                  const tableOrders = order.originalOrders || [];
                                  if (tableOrders.length === 0) {
                                    console.error('Alt siparişler bulunamadı');
                                    return;
                                  }
                                  await Promise.all(tableOrders.map(async (to) => {
                                    const response = await fetch(`${API_URL}/orders/${to.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ approved: true })
                                    });
                                    const data = await response.json();
                                    if (data.data?.printResults) {
                                      await handlePrintFailover(data, to.id, false);
                                    }
                                  }));
                                } else {
                                  const response = await fetch(`${API_URL}/orders/${order.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ approved: true })
                                  });
                                  const data = await response.json();
                                  if (data.data?.printResults) {
                                    await handlePrintFailover(data, order.id, false);
                                  }
                                }
                                fetchOrders();
                              } catch (err) {
                                console.error('Approve error:', err);
                                alert('Onaylama sırasında hata oluştu.');
                              }
                            }}
                            className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black hover:bg-green-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                          >
                            <FaCheck />
                            <span className="text-xs">ONAYLA</span>
                          </button>
                        )}


                        {hasPermission('cashier_reject_orders') && (
                          <button
                            onClick={() => {
                              if (confirm('Bu siparişi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
                                if (order.id.includes('grouped')) {
                                  // Simplified deletion logic
                                  const tableOrders = order.originalOrders || [];
                                  const tableNumber = order.tableNumber;
                                  if (tableOrders.length === 0) {
                                    alert('Alt siparişler bulunamadı');
                                    return;
                                  }

                                  Promise.all(tableOrders.map(async (tableOrder) => {
                                    try {
                                      const response = await fetch(`${API_URL}/orders/${tableOrder.id}`, {
                                        method: 'DELETE',
                                        headers: { 'Accept': 'application/json' }
                                      });
                                      return response.ok;
                                    } catch (error) {
                                      console.error(`Sipariş silme hatası: ${tableOrder.id}`, error);
                                      return false;
                                    }
                                  })).then(results => {
                                    const allSuccessful = results.every(result => result === true);
                                    if (allSuccessful) {
                                      alert(`Masa ${tableNumber} için tüm siparişler başarıyla silindi`);
                                    } else {
                                      alert(`Masa ${tableNumber} için bazı siparişler silinemedi. Lütfen sayfayı yenileyip tekrar deneyin.`);
                                    }
                                    fetchOrders();
                                  });
                                } else {
                                  fetch(`${API_URL}/orders/${order.id}`, {
                                    method: 'DELETE',
                                    headers: { 'Accept': 'application/json' }
                                  }).then(response => {
                                    if (response.ok) {
                                      alert('Sipariş başarıyla silindi');
                                      fetchOrders();
                                    } else {
                                      alert(`Sipariş silinemedi! (Hata Kodu: ${response.status})`);
                                      fetchOrders();
                                    }
                                  }).catch(error => {
                                    console.error('Sipariş silme hatası:', error);
                                    alert('Sipariş silinirken teknik bir hata oluştu. Lütfen bağlantınızı kontrol edin.');
                                    fetchOrders();
                                  });
                                }
                              }
                            }}
                            className="py-4 px-3 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-lg active:scale-95"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {
        showPaymentModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[1400px] h-[90vh] rounded-xl shadow-none flex overflow-hidden relative">

              {/* SOL PANEL: ÜRÜNLER (Scrollable) */}
              <div className="w-[40%] bg-gray-50 border-r border-gray-200 flex flex-col h-full">
                {/* Header */}
                <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shrink-0">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <span className="bg-gray-800 text-white px-2 py-1 rounded text-sm">MASA {selectedOrder.tableNumber}</span>
                      <span className="text-gray-400 text-sm font-normal">#{selectedOrder.id.substring(0, 8)}</span>
                    </h2>
                  </div>
                  {undoStack.length > 0 && (
                    <button onClick={handleUndo} className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded hover:bg-orange-200">GERİ AL</button>
                  )}
                </div>

                {/* Liste */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                  {selectedOrder.items.map((item, idx) => {
                    const sel = selectedItemIndexes.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (paymentTab === 'partial') {
                            setSelectedItemIndexes(p => p.includes(idx) ? p.filter(i => i !== idx) : [...p, idx]);
                            setManualAmount(''); // Clear manual if selecting items
                          }
                        }}
                        className={`p-3 bg-white border border-gray-200 rounded-lg flex flex-col gap-2 cursor-pointer transition-all ${sel ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-gray-800 text-sm line-clamp-2 w-3/4">{item.name}</span>
                          <span className="font-bold text-gray-900 text-sm">{item.price}₺</span>
                        </div>

                        <div className="flex justify-between items-center mt-1">
                          <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button onClick={(e) => { e.stopPropagation(); updateItemQuantity(idx, item.quantity - 1); }} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded"><FaMinus size={10} /></button>
                            <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                            <button onClick={(e) => { e.stopPropagation(); updateItemQuantity(idx, item.quantity + 1); }} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded"><FaPlus size={10} /></button>
                          </div>

                          <div className="flex gap-1">
                            {paymentTab === 'full' && hasPermission('cashier_apply_discount') &&
                              <button onClick={(e) => { e.stopPropagation(); applyTreat(idx); }} className="p-1.5 bg-orange-100 text-orange-600 rounded hover:bg-orange-200"><FaUtensils size={12} /></button>
                            }
                            {paymentTab === 'full' &&
                              <button onClick={(e) => { e.stopPropagation(); removeItem(idx); }} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"><FaTrash size={12} /></button>
                            }
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sol Alt Toplam */}
                <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-500 text-xs font-bold uppercase">Toplam Tutar</span>
                    <span className="text-gray-900 font-bold">{Number(selectedOrder.totalAmount).toFixed(2)}₺</span>
                  </div>
                </div>
              </div>

              {/* SAĞ PANEL: ÖDEME (Fixed layout) */}
              <div className="flex-1 bg-white flex flex-col h-full relative">
                {/* Close Butonu */}
                <div className="absolute top-4 right-4 z-10">
                  <button onClick={() => { setShowPaymentModal(false); setSelectedOrder(null); setShowCashPad(false); }} className="p-2 bg-gray-100 text-gray-500 rounded hover:bg-red-100 hover:text-red-500 transition-colors">
                    <FaTimesCircle size={24} />
                  </button>
                </div>

                {showCashPad ? (
                  <div className="p-6 h-full flex flex-col animate-in slide-in-from-right duration-200">
                    <div className="flex justify-between items-center mb-4">
                      <button onClick={() => setShowCashPad(false)} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 bg-gray-100 px-4 py-2 rounded-lg transition-colors"><FaArrowLeft /> GERİ DÖN</button>
                      <h3 className="font-black text-xl text-gray-800">NAKİT TAHSİLAT</h3>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl flex flex-col gap-4 mb-4 border border-gray-200">
                      <div className="flex justify-between text-sm font-bold text-gray-500 uppercase">
                        <span>Ödenecek Tutar</span>
                        <span>{targetPaymentAmount.toFixed(2)}₺</span>
                      </div>
                      <div className="flex justify-between items-end border-b-2 border-gray-300 pb-2">
                        <span className="text-gray-500 font-bold text-lg">ALINAN</span>
                        <span className="text-5xl font-black text-gray-900 tracking-tighter">{cashReceived || '0'}₺</span>
                      </div>
                      <div className={`flex justify-between items-center pt-2 font-black text-2xl ${(Number(cashReceived) - targetPaymentAmount) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        <span>PARA ÜSTÜ</span>
                        <span>{((Number(cashReceived) || 0) - targetPaymentAmount).toFixed(2)}₺</span>
                      </div>
                    </div>

                    <div className="flex-1 flex gap-4 min-h-0 mb-4">
                      <div className="flex flex-col gap-2 w-1/4">
                        {[50, 100, 200].map(val => (
                          <button key={val} onClick={() => setCashReceived(val.toString())} className="flex-1 bg-green-50 text-green-700 font-bold rounded-xl hover:bg-green-100 border border-green-200 text-lg shadow-sm transition-all active:scale-95">
                            {val}₺
                          </button>
                        ))}
                        <button onClick={() => setCashReceived(targetPaymentAmount.toFixed(2))} className="flex-1 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 border border-blue-200 text-sm uppercase shadow-sm transition-all active:scale-95">
                          TAM
                        </button>
                      </div>

                      <div className="flex-1 grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => (
                          <button key={k} onClick={() => setCashReceived(p => {
                            if (p.includes('.') && p.split('.')[1].length >= 2) return p;
                            return p + k;
                          })} className="bg-white border text-3xl font-black text-gray-800 rounded-xl hover:bg-gray-50 active:bg-gray-200 shadow-sm transition-color border-gray-200">
                            {k}
                          </button>
                        ))}
                        <button onClick={() => setCashReceived(p => p.includes('.') ? p : p + '.')} className="bg-white border text-2xl font-black text-gray-800 rounded-xl hover:bg-gray-50 active:bg-gray-200 shadow-sm border-gray-200">.</button>
                        <button onClick={() => setCashReceived(p => p + '0')} className="bg-white border text-2xl font-black text-gray-800 rounded-xl hover:bg-gray-50 active:bg-gray-200 shadow-sm border-gray-200">0</button>
                        <button onClick={() => setCashReceived(p => p.slice(0, -1))} className="bg-red-50 border border-red-100 text-red-500 text-2xl rounded-xl hover:bg-red-100 flex items-center justify-center shadow-sm active:bg-red-200">
                          <FaBackspace />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        const received = Number(cashReceived);
                        if (received <= 0) return alert('Lütfen alınan tutarı giriniz.');

                        if (received < targetPaymentAmount) {
                          if (!confirm('Alınan tutar borçtan az! Kalanı borç olarak bırakmak istiyor musunuz?')) return;
                        }

                        await handlePayment(selectedOrder.id, {
                          ...selectedOrder,
                          paidAmount: Number(selectedOrder.paidAmount || 0) + targetPaymentAmount,
                          cashierNote: (selectedOrder.cashierNote || '') + ` [NAKİT: ${received}₺ -> P.ÜSTÜ: ${(received - targetPaymentAmount).toFixed(2)}₺]`
                        }, true);

                        setCashReceived('');
                        setShowCashPad(false);
                        // setShowPaymentModal(false); // Do not close modal here, let handlePayment decide
                        setTimeout(() => alert('Tahsilat onaylandı'), 100);
                      }}
                      className="w-full py-5 bg-green-600 text-white rounded-[20px] font-black text-2xl shadow-xl hover:bg-green-700 transition-all flex justify-center items-center gap-3 active:scale-95">
                      <FaCheckCircle />
                      TAHSİLATI ONAYLA
                    </button>
                  </div>
                ) : (
                  <div className="p-6 h-full flex flex-col">
                    {/* Tablar */}
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-6 w-full max-w-lg">
                      {(['full', 'partial', 'hybrid'] as const).map(t => (
                        <button key={t} onClick={() => { setPaymentTab(t); setSelectedItemIndexes([]); setManualAmount(''); setCashAmount(''); setCardAmount(''); }}
                          className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${paymentTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                          {t === 'full' ? 'TAMAMI' : t === 'partial' ? 'PARÇALI' : 'HİBRİT'}
                        </button>
                      ))}
                    </div>

                    {/* Ana Tutar Göstergesi */}
                    <div className="flex-1 flex flex-col justify-center items-center gap-4 min-h-0">
                      <div className="text-center">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-1">
                          {paymentTab === 'partial'
                            ? 'PARÇALI ÖDEME TUTARI'
                            : paymentTab === 'hybrid' ? 'HİBRİT TOPLAM' : 'ÖDENECEK TUTAR'}
                        </span>
                        <div className="text-6xl font-black text-gray-900 tracking-tighter">
                          {paymentTab === 'partial'
                            ? (Number(manualAmount) > 0
                              ? Number(manualAmount).toFixed(2)
                              : selectedItemIndexes.reduce((s, i) => s + (Number(selectedOrder.items[i]?.price || 0) * Number(selectedOrder.items[i]?.quantity || 0)), 0).toFixed(2))
                            : paymentTab === 'hybrid' ? ((Number(cashAmount) || 0) + (Number(cardAmount) || 0)).toFixed(2)
                              : (Number(selectedOrder.totalAmount || 0) - Number(selectedOrder.paidAmount || 0) - Number(selectedOrder.discountAmount || 0)).toFixed(2)
                          }<span className="text-3xl text-gray-400 font-medium ml-1">₺</span>
                        </div>
                      </div>

                      {/* Hızlı İndirim - Sadece TAMAMI modunda */}
                      {(staffRole === 'manager' || staffRole === 'admin') && paymentTab === 'full' && (
                        <div className="flex gap-2 mt-4">
                          {[5, 10, 20].map(v => (
                            <button key={v} onClick={() => applyGeneralDiscount(v, 'percent')} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold border border-gray-200 rounded hover:bg-gray-100 flex items-center gap-1">
                              <FaMinus size={8} /> %{v}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* PARTIAL INPUTS */}
                      {paymentTab === 'partial' && (
                        <div className="w-full max-w-md mt-6 space-y-4">
                          <div className="flex gap-2 justify-center mb-4">
                            {[2, 3, 4, 5].map(n => (
                              <button key={n} onClick={() => {
                                const rem = (Number(selectedOrder.totalAmount || 0) - Number(selectedOrder.paidAmount || 0) - Number(selectedOrder.discountAmount || 0));
                                setManualAmount((rem / n).toFixed(2));
                                setSelectedItemIndexes([]); // Clear items if splitting
                              }} className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 border border-indigo-200">
                                1/{n}
                              </button>
                            ))}
                          </div>

                          <div className="relative">
                            <label className="text-xs font-bold text-gray-400 uppercase absolute top-2 left-4">TUTAR GİRİNİZ</label>
                            <input type="number"
                              value={manualAmount}
                              onChange={e => { setManualAmount(e.target.value); setSelectedItemIndexes([]); }}
                              className="w-full p-4 pt-8 bg-gray-50 border-2 border-gray-200 rounded-xl text-2xl font-bold text-center focus:border-blue-500 outline-none"
                              placeholder="0.00"
                            />
                          </div>

                          <div className="text-center text-xs text-gray-400 font-bold">
                            YA DA SOLDAN ÜRÜN SEÇİNİZ
                          </div>
                        </div>
                      )}

                      {/* Hybrid Input Alanları */}
                      {paymentTab === 'hybrid' && (
                        <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-md">
                          <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1">NAKİT</label>
                            <input type="number" value={cashAmount}
                              onChange={e => {
                                const val = e.target.value;
                                setCashAmount(val);
                                const totalDebt = (Number(selectedOrder?.totalAmount || 0) - Number(selectedOrder?.paidAmount || 0) - Number(selectedOrder?.discountAmount || 0));
                                const numVal = Number(val);
                                const other = Math.max(0, totalDebt - numVal).toFixed(2);
                                setCardAmount(other);
                              }}
                              className="w-full p-3 bg-green-50 border-2 border-green-200 rounded-xl text-xl font-bold text-center focus:border-green-500 outline-none text-green-900" placeholder="0.00" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 block mb-1">KART</label>
                            <input type="number" value={cardAmount}
                              onChange={e => {
                                const val = e.target.value;
                                setCardAmount(val);
                                const totalDebt = (Number(selectedOrder?.totalAmount || 0) - Number(selectedOrder?.paidAmount || 0) - Number(selectedOrder?.discountAmount || 0));
                                const numVal = Number(val);
                                const other = Math.max(0, totalDebt - numVal).toFixed(2);
                                setCashAmount(other);
                              }}
                              className="w-full p-3 bg-blue-50 border-2 border-blue-200 rounded-xl text-xl font-bold text-center focus:border-blue-500 outline-none text-blue-900" placeholder="0.00" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Alt Aksiyon Butonları */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex flex-col gap-3">
                        {paymentTab === 'hybrid' ? (
                          <button onClick={() => {
                            const cash = Number(cashAmount) || 0;
                            const card = Number(cardAmount) || 0;
                            const total = cash + card;
                            if (total <= 0) return alert('Geçersiz Tutar!');
                            if (cash < 0 || card < 0) return alert('Negatif tutar girilemez!');

                            let note = selectedOrder.cashierNote || '';
                            if (cash > 0) note += ` [NAKİT: ${cash.toFixed(2)}₺]`;
                            if (card > 0) note += ` [KART: ${card.toFixed(2)}₺]`;

                            handlePayment(selectedOrder.id, {
                              ...selectedOrder,
                              paidAmount: Number(selectedOrder.paidAmount || 0) + total,
                              cashierNote: note
                            }, true);
                            setCashAmount(''); setCardAmount('');
                          }} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-colors flex justify-center items-center gap-2 shadow-xl">
                            <FaCheckCircle /> HİBRİT TAHSİL ET
                          </button>
                        ) : (
                          <div className="flex gap-3">
                            <button onClick={openCashPad} className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors flex justify-center items-center gap-2 shadow-xl">
                              <FaMoneyBillWave /> NAKİT
                            </button>

                            <button onClick={() => {
                              let val = 0;
                              if (paymentTab === 'partial') {
                                // Priority: 1. Manual Entry, 2. Selected Items
                                if (manualAmount && Number(manualAmount) > 0) {
                                  val = Number(manualAmount);
                                } else if (selectedItemIndexes.length > 0) {
                                  val = selectedItemIndexes.reduce((s, i) => s + (Number(selectedOrder.items[i].price || 0) * Number(selectedOrder.items[i].quantity || 1)), 0);
                                } else {
                                  return alert('Lütfen ürün seçin veya tutar girin.');
                                }
                              } else {
                                val = (Number(selectedOrder.totalAmount || 0) - Number(selectedOrder.paidAmount || 0) - Number(selectedOrder.discountAmount || 0));
                              }

                              if (val <= 0) return alert('Geçersiz Tutar');

                              handlePayment(selectedOrder.id, {
                                ...selectedOrder,
                                paidAmount: Number(selectedOrder.paidAmount || 0) + val,
                                cashierNote: (selectedOrder.cashierNote || '') + ' [KART]'
                              }, true);
                            }} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 shadow-xl">
                              <FaCreditCard /> KART
                            </button>
                          </div>
                        )}

                        <textarea
                          placeholder="Ödeme notu..."
                          value={selectedOrder.cashierNote || ''}
                          onChange={e => setSelectedOrder({ ...selectedOrder, cashierNote: e.target.value })}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400"
                          rows={1}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* DEBUG MODAL */}
      {
        showDebugModal && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-gray-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-gray-700">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500 rounded-2xl">
                    <FaPrint className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">YAZICI DEBUG LOGLARI</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Sipariş: {printingOrderId.substring(0, 8)}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowDebugModal(false); setDebugLogs([]); }}
                  className="p-3 hover:bg-gray-800 text-gray-400 hover:text-white rounded-2xl transition-all"
                >
                  <FaTimesCircle className="text-2xl" />
                </button>
              </div>

              <div className="p-6 h-[400px] overflow-y-auto bg-black/50 custom-scrollbar font-mono text-sm">
                <div className="space-y-2">
                  {debugLogs.length === 0 && (
                    <div className="text-gray-600 italic">Log bekleniyor...</div>
                  )}
                  {debugLogs.map((log, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border ${log.type === 'error' ? 'bg-red-900/20 border-red-900/50 text-red-400' :
                      log.type === 'success' ? 'bg-green-900/20 border-green-900/50 text-green-400' :
                        log.type === 'warning' ? 'bg-yellow-900/20 border-yellow-900/50 text-yellow-400' :
                          'bg-blue-900/10 border-blue-900/30 text-blue-400'
                      }`}>
                      <div className="flex justify-between items-start gap-4">
                        <span className="flex-1">{log.message}</span>
                        <span className="text-[10px] opacity-40 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                  {isPrinting && (
                    <div className="flex items-center gap-3 p-3 text-blue-400 animate-pulse">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                      <span>Yazıcı işlemi devam ediyor...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-gray-900 border-t border-gray-800 flex gap-4">
                <button
                  onClick={() => handleManualPrint(printingOrderId, true)}
                  disabled={isPrinting}
                  className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FaPrint /> TEKRAR DENE
                </button>
                <button
                  onClick={() => { setShowDebugModal(false); setDebugLogs([]); }}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black transition-all"
                >
                  KAPAT
                </button>
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
}
