'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaMoneyBillWave, FaSearch, FaUtensils, FaCheckCircle, FaCreditCard, FaReceipt, FaPrint, FaSignOutAlt, FaTrash, FaPlus, FaMinus, FaTimesCircle, FaCheck, FaStore, FaGlobe, FaBell, FaBackspace, FaArrowLeft, FaBox, FaToggleOn, FaToggleOff, FaClock, FaSave, FaExclamationTriangle } from 'react-icons/fa';
import { printReceiptViaBridge } from '@/lib/printerHelpers';
import apiService from '@/services/api';
import { playNotificationSound } from '@/utils/audio';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  variations?: any[];
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
  createdAt?: string;
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
  const prevOrderCount = useRef(0);
  const prevCallCount = useRef(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [calls, setCalls] = useState<WaiterCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [staffRole, setStaffRole] = useState<string>('');
  const [staffUser, setStaffUser] = useState<any>(null); // New state to avoid hydration issues
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [undoStack, setUndoStack] = useState<Order[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Merge Modal State
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [mergeSource, setMergeSource] = useState<string>('');
  const [mergeTarget, setMergeTarget] = useState<string>('');

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

  // Search & Table Change States
  const [searchTerm, setSearchTerm] = useState('');
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableEditOrder, setTableEditOrder] = useState<Order | null>(null);
  const [newTableNumber, setNewTableNumber] = useState('');

  // Receipt Modal State
  const [receiptModalData, setReceiptModalData] = useState<{
    orderId: string;
    updatedOrder: any;
    isPartial: boolean;
  } | null>(null);

  // Floor states
  const [floors, setFloors] = useState<any[]>([]);
  const [activeFloor, setActiveFloor] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');  // New: View mode toggle
  const [totalTables, setTotalTables] = useState(50);  // Default 50 tables

  // Product Management State
  const [showProductModal, setShowProductModal] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [menuCategories, setMenuCategories] = useState<any[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [isNewOrder, setIsNewOrder] = useState(false);

  // Delete Confirm State
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Menu Sidebar State
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [selectedMenuCategory, setSelectedMenuCategory] = useState<string>('all');

  const addLog = (message: string, type: string = 'info') => {
    const log = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setDebugLogs(prev => [log, ...prev].slice(0, 50));
    console.log(`[DEBUG] ${type.toUpperCase()}: ${message}`);
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

  // Yetki kontrolü (State-based to prevent hydration errors)
  const hasPermission = (permissionId: string) => {
    if (!staffUser) return false;

    // Admin/Manager/Owner always has full access
    if (['admin', 'manager', 'restaurant_owner'].includes(staffUser.role)) return true;

    // Cashier role should have default access to these critical functions
    if (staffUser.role === 'cashier' && (
      permissionId === 'cashier_process_payment' ||
      permissionId === 'cashier_approve_orders' ||
      permissionId === 'cashier_reject_orders'
    )) return true;

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
      const manualNum = parseFloat(manualAmount);
      if (!isNaN(manualNum) && manualNum > 0) {
        amount = manualNum;
      } else if (selectedItemIndexes.length > 0) {
        amount = selectedItemIndexes.reduce((s, i) => s + (parseFloat(String(selectedOrder.items[i].price || 0)) * parseFloat(String(selectedOrder.items[i].quantity || 1))), 0);
      } else {
        alert('Lütfen ürün seçin veya tutar girin.');
        return;
      }
    } else {
      const tot = parseFloat(String(selectedOrder.totalAmount || 0));
      const paid = parseFloat(String(selectedOrder.paidAmount || 0));
      const disc = parseFloat(String(selectedOrder.discountAmount || 0));
      amount = parseFloat((tot - paid - disc).toFixed(2));
    }

    if (amount <= 0) return alert("Tutarda ödenecek bakiye görünmüyor.");

    setTargetPaymentAmount(parseFloat(amount.toFixed(2)));
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
      // Optimize: Only fetch active orders (pending, preparing, ready)
      // This drastically reduces load time by ignoring thousands of completed/cancelled orders
      // BUT for daily revenue we need today's completed orders too.
      // So we fetch all today's orders.
      const response = await fetch(`${API_URL}/orders?restaurantId=${restaurantId}&from=cashier`);
      const data = await response.json();
      if (data.success) {
        const normalizedOrders: Order[] = (data.data || []).map((order: any) => ({
          ...order,
          totalAmount: Number(order?.totalAmount) || 0,
          paidAmount: Number(order?.paidAmount) || 0,
          discountAmount: Number(order?.discountAmount) || 0,
          items: (order?.items || []).map((item: any) => ({
            ...item,
            price: Number(item?.unitPrice || item?.price) || 0,
            quantity: Number(item?.quantity) || 0
          }))
        }));

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
          const now = Date.now();
          const filtered = normalizedOrders.filter(order => {
            // Keep active orders
            if (['pending', 'preparing', 'ready'].includes(order.status)) return true;

            // Keep recently completed orders (for 60 seconds) so they don't vanish instantly
            if (order.status === 'completed' || order.status === 'cancelled') {
              const updatedAt = new Date(order.updated_at || order.created_at).getTime();
              if (now - updatedAt < 60000) return true;
            }
            return false;
          });

          const grouped = groupOrdersByTable(filtered);
          const groupedOrders: Order[] = [];

          grouped.forEach((tableOrders) => {
            groupedOrders.push(createGroupedOrder(tableOrders));
          });

          return groupedOrders;
        })();

        setAllOrders(normalizedOrders);
        setOrders(filteredOrders);

        if (filteredOrders.length > prevOrderCount.current) {
          playNotificationSound();
        }
        prevOrderCount.current = filteredOrders.length;
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
        if (activeCalls.length > prevCallCount.current) {
          playNotificationSound();
        }
        prevCallCount.current = activeCalls.length;
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

  const fetchFloors = async () => {
    if (!restaurantId) return;
    try {
      // 1. Fetch QR Tables Count (Real Source of Truth)
      const qrResponse = await apiService.getRestaurantQRTokens(restaurantId);
      if (qrResponse.success && Array.isArray(qrResponse.data)) {
        setTotalTables(qrResponse.data.length);
        console.log(`✅ ${qrResponse.data.length} masaya ait QR bulundu.`);
      }

      // 2. Fetch Settings
      try {
        const restaurantResponse = await apiService.getRestaurantById(restaurantId);
        if (restaurantResponse.success && restaurantResponse.data) {
          const restaurant = restaurantResponse.data;
          const settings = restaurant.settings || {};

          if (settings.drinkStationRouting?.floors) {
            setFloors(settings.drinkStationRouting.floors);
          }

          // Fallback: If QRTokens failed, try using settings
          if (!qrResponse.success) {
            const qrCount = settings.qrCount || restaurant.qrCount;
            if (qrCount) {
              setTotalTables(Number(qrCount));
            }
          }
        }
      } catch (err) {
        console.error('Restoran ayarları alınamadı:', err);
      }
    } catch (error) {
      console.error('Katlar/Tablolar alınamadı:', error);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      const loadData = () => {
        fetchOrders();
        fetchCalls();
      };

      loadData();
      fetchFloors();
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  const fetchMenuItems = async () => {
    if (!restaurantId) return;
    try {
      const response = await apiService.getRestaurantMenu(restaurantId);
      if (response.success && response.data) {
        const categories = response.data.categories || [];
        setMenuCategories(categories);

        let items = response.data.menuItems || [];
        if (items.length === 0 && categories.length > 0) {
          items = categories.flatMap((c: any) => c.items || []);
        }
        setMenuItems(items);
      }
    } catch (error) {
      console.error('Menü verileri alınamadı:', error);
    }
  };

  const toggleProductAvailability = async (item: any) => {
    const originalStatus = item.isAvailable;
    const newStatus = !originalStatus;

    // Optimistic Update
    setMenuItems(prev => prev.map(p => p.id === item.id ? { ...p, isAvailable: newStatus } : p));

    try {
      const response = await apiService.updateMenuItem(restaurantId, item.id, { isAvailable: newStatus });
      if (!response.success) {
        setMenuItems(prev => prev.map(p => p.id === item.id ? { ...p, isAvailable: originalStatus } : p));
        alert('Durum güncellenemedi');
      }
    } catch (error) {
      console.error(error);
      setMenuItems(prev => prev.map(p => p.id === item.id ? { ...p, isAvailable: originalStatus } : p));
      alert('Bağlantı hatası');
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchMenuItems();
    }
  }, [restaurantId]);

  const finalizePaymentAfterReceiptChoice = async (shouldPrint: boolean) => {
    if (!receiptModalData) return;
    const { orderId, updatedOrder, isPartial } = receiptModalData;
    const remaining = (Number(updatedOrder?.totalAmount || 0) - Number(updatedOrder?.paidAmount || 0) - Number(updatedOrder?.discountAmount || 0));

    addLog(`finalizePaymentAfterReceiptChoice: shouldPrint=${shouldPrint}, orderId=${orderId}, isPartial=${isPartial}`, 'info');

    if (shouldPrint) {
      try {
        let targetPrintId = orderId;

        // Handle Grouped ID for printing
        if (orderId.includes('grouped')) {
          const grouped = orders.find(o => o.id === orderId);
          if (grouped && grouped.originalOrders && grouped.originalOrders.length > 0) {
            targetPrintId = grouped.originalOrders[0].id;
            addLog(`Printing grouped order. Using child ID: ${targetPrintId}`, 'debug');
          }
        }

        addLog(`Requesting print-info for ${targetPrintId}`, 'network');
        const printInfoUrl = `${API_URL}/orders/${targetPrintId}/print-info`;
        const pResp = await fetch(printInfoUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cashierName: 'Kasa Paneli' })
        });
        const pData = await pResp.json();
        addLog(`Print result: ${pData.success ? 'Success' : 'Failed'}`, pData.success ? 'success' : 'error');
      } catch (printErr) {
        addLog(`Print Error: ${printErr}`, 'error');
        console.error('Fiş yazdırma hatası:', printErr);
      }
    }

    // Cleanup Logic
    addLog(`Cleaning up UI state. remaining: ${remaining}`, 'debug');
    fetchOrders();

    if (isPartial && remaining > 0.05) {
      addLog(`Keeping modal open for remaining balance: ${remaining}`, 'info');
      setSelectedItemIndexes([]);
      setManualAmount('');
      setCashAmount('');
      setCardAmount('');

      if (selectedOrder) {
        setSelectedOrder({
          ...selectedOrder,
          items: updatedOrder.items,
          totalAmount: updatedOrder.totalAmount,
          paidAmount: updatedOrder.paidAmount,
          cashierNote: updatedOrder.cashierNote
        });
      }
      setShowCashPad(false);
    } else {
      addLog(`Full payment or last partial. Closing modals.`, 'info');
      // Automatic QR deactivation is disabled to prevent permanent table QRs from 'disappearing'
      /*
      if (updatedOrder?.tableNumber) {
        fetch(`${API_URL}/qr/deactivate-by-table`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurantId: restaurantId,
            tableNumber: updatedOrder.tableNumber
          })
        }).then(() => addLog('QR Deactivated', 'success')).catch(err => addLog(`QR Deactivate Failed: ${err}`, 'error'));
      }
      */
      setShowPaymentModal(false);
      setSelectedOrder(null);
      setShowCashPad(false);
    }

    setReceiptModalData(null);
    addLog(`Payment flow completed.`, 'success');
  };

  const handlePayment = async (orderId: string, updatedOrder?: any, isPartial = false) => {
    try {
      addLog(`handlePayment: id=${orderId}, part=${isPartial}`, 'info');

      if (orderId.includes('grouped')) {
        addLog(`Distributing payment for grouped order: ${orderId}`, 'debug');
        const groupedOrder = orders.find(o => o.id === orderId);
        const childOrders = groupedOrder?.originalOrders || [];

        // Calculate delta payment to distribute
        const oldGroupPaid = childOrders.reduce((sum, o) => sum + parseFloat(String(o.paidAmount || 0)), 0);
        const newGroupPaid = parseFloat(String(updatedOrder?.paidAmount || 0));
        let deltaToDistribute = parseFloat((newGroupPaid - oldGroupPaid).toFixed(2));

        const updatePromises = childOrders.map(async (child) => {
          const payload: any = {
            status: isPartial ? (child.status || 'ready') : 'completed',
            cashierNote: updatedOrder?.cashierNote
          };

          if (!isPartial) {
            payload.paidAmount = child.totalAmount;
          } else if (deltaToDistribute > 0) {
            const childTotal = parseFloat(String(child.totalAmount || 0));
            const childAlreadyPaid = parseFloat(String(child.paidAmount || 0));
            const childRemaining = parseFloat((childTotal - childAlreadyPaid).toFixed(2));

            const paymentForThisChild = Math.min(deltaToDistribute, childRemaining);
            payload.paidAmount = parseFloat((childAlreadyPaid + paymentForThisChild).toFixed(2));
            deltaToDistribute = parseFloat((deltaToDistribute - paymentForThisChild).toFixed(2));

            // If this specific child is now fully paid, it should be marked completed
            if (payload.paidAmount >= (childTotal - 0.05)) {
              payload.status = 'completed';
            } else {
              payload.status = 'ready';
            }
          }

          const response = await fetch(`${API_URL}/orders/${child.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          return response.json();
        });

        const responses = await Promise.all(updatePromises);
        const anyFailed = responses.some(r => !r.success);
        if (anyFailed) addLog('Some child orders failed to update', 'warning');

        // Handle printing for any successful child order that has print info
        for (let i = 0; i < responses.length; i++) {
          if (responses[i].success && responses[i].data?.printResults) {
            await handlePrintFailover(responses[i], childOrders[i].id, false);
          }
        }

        setReceiptModalData({ orderId, updatedOrder, isPartial });
        return;
      }

      // Normal order
      addLog(`Updating order: ${orderId}`, 'network');
      const payload: any = {
        status: isPartial ? 'ready' : 'completed',
        items: updatedOrder?.items,
        totalAmount: updatedOrder?.totalAmount,
        paidAmount: updatedOrder?.paidAmount,
        discountAmount: updatedOrder?.discountAmount,
        discountReason: updatedOrder?.discountReason,
        cashierNote: updatedOrder?.cashierNote,
        approved: updatedOrder?.approved
      };

      const rem = Number(updatedOrder?.totalAmount || 0) - Number(updatedOrder?.paidAmount || 0) - Number(updatedOrder?.discountAmount || 0);
      if (rem <= 0.05) payload.status = 'completed';

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        if (data.data?.printResults) {
          await handlePrintFailover(data, orderId, false);
        }
        setReceiptModalData({ orderId, updatedOrder, isPartial });
      } else {
        addLog(`Update FAILED: ${JSON.stringify(data)}`, 'error');
      }
    } catch (error) {
      addLog(`Exception: ${error}`, 'error');
      console.error('Payment Error:', error);
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
    addLog(`removeItem clicked for index ${index}`, 'debug');
    if (!selectedOrder) return;

    if (selectedOrder.items.length <= 1) {
      alert('Siparişteki son ürünü silemezsiniz. Bunun yerine siparişi iptal ediniz.');
      return;
    }

    // Direct deletion without confirmation modal
    saveToUndo(selectedOrder);
    const updatedItems = selectedOrder.items.filter((_, i) => i !== index);
    const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    setSelectedOrder({ ...selectedOrder, items: updatedItems, totalAmount: newTotal });
    addLog(`Item at index ${index} removed locally`, 'info');
  };

  const addItemToOrder = (item: any, delta: number = 1) => {
    if (!selectedOrder) return;
    saveToUndo(selectedOrder);

    // Check if item already exists (simple match by id/name)
    const existingIndex = selectedOrder.items.findIndex((i) => i.name === item.name && JSON.stringify(i.notes) === JSON.stringify(item.notes || ''));

    let updatedItems = [...selectedOrder.items];
    if (existingIndex >= 0) {
      const newQuantity = updatedItems[existingIndex].quantity + delta;

      if (newQuantity <= 0) {
        // Remove item if quantity drops to 0 or less
        updatedItems = updatedItems.filter((_, i) => i !== existingIndex);
      } else {
        // Update quantity
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: newQuantity
        };
      }
    } else if (delta > 0) {
      // Add new item only if delta is positive
      updatedItems.push({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: delta,
        notes: '',
        variations: item.selectedVariation ? [item.selectedVariation] : []
      });
    }

    const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    setSelectedOrder({ ...selectedOrder, items: updatedItems, totalAmount: newTotal });
  };

  const handleCreateOrder = async () => {
    if (!selectedOrder) return;
    try {
      addLog('Creating new order...', 'network');

      const processedItems = selectedOrder.items.map(item => ({
        ...item,
        menuItemId: (item as any).menuItemId || item.id,
        price: Number(item.price),
        totalPrice: Number(item.price) * Number(item.quantity)
      }));

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          tableNumber: selectedOrder.tableNumber,
          items: processedItems,
          totalAmount: selectedOrder.totalAmount,
          status: 'pending',
          orderType: 'dine_in',
          approved: true // Kasiyer eklediği için direkt onaylı
        })
      });

      const data = await response.json();
      if (data.success) {
        addLog('Order created successfully', 'success');
        alert('Yeni sipariş başarıyla oluşturuldu.');
        setShowPaymentModal(false);
        setIsNewOrder(false);
        fetchOrders();
      } else {
        alert('Sipariş oluşturulamadı: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Sipariş oluşturma hatası oluştu.');
    }
  };

  const handleSaveOrder = async () => {
    if (!selectedOrder) return;
    if (isNewOrder) {
      handleCreateOrder();
      return;
    }
    try {
      addLog('Saving order changes...', 'network');

      // Check if this is a grouped order (virtual ID)
      const isGroupedOrder = selectedOrder.id.includes('-grouped') || selectedOrder.originalOrders;

      if (isGroupedOrder && selectedOrder.originalOrders && selectedOrder.originalOrders.length > 0) {
        // Handle grouped orders - use the FIRST original order's ID for all items
        // This is simpler and more reliable than trying to distribute items
        const primaryOrder = selectedOrder.originalOrders[0];
        addLog(`Updating grouped order using primary order: ${primaryOrder.id}`, 'network');

        const processedItems = selectedOrder.items.map((item: OrderItem) => ({
          ...item,
          menuItemId: (item as any).menuItemId || item.id,
          price: Number(item.price || 0),
          totalPrice: Number(item.price || 0) * Number(item.quantity || 1)
        }));

        const calculatedTotal = processedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

        console.log('🔄 Updating grouped order with items:', processedItems);

        const response = await fetch(`${API_URL}/orders/${primaryOrder.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: processedItems,
            totalAmount: calculatedTotal.toFixed(2),
            cashierNote: selectedOrder.cashierNote,
            discountAmount: selectedOrder.discountAmount,
            discountReason: selectedOrder.discountReason
          })
        });

        const data = await response.json();
        console.log('📝 Grouped order update response:', data);

        if (data.success) {
          addLog('Grouped order updated successfully', 'success');
          alert('Sipariş başarıyla güncellendi.');
          fetchOrders();
        } else {
          addLog(`Failed to update grouped order: ${data.message}`, 'error');
          alert('Sipariş kaydedilemedi: ' + data.message);
        }
        return;
      }

      // Calculate items with proper totalPrice (single order)
      const processedItems = selectedOrder.items.map(item => ({
        ...item,
        price: Number(item.price || (item as any).unitPrice || 0),
        totalPrice: (Number(item.price || (item as any).unitPrice || 0)) * (Number(item.quantity || 1))
      }));

      // Calculate new totalAmount from all items
      const calculatedTotal = processedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

      const response = await fetch(`${API_URL}/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: processedItems,
          totalAmount: calculatedTotal.toFixed(2),
          cashierNote: selectedOrder.cashierNote,
          discountAmount: selectedOrder.discountAmount,
          discountReason: selectedOrder.discountReason
        })
      });

      const data = await response.json();
      if (data.success) {
        addLog('Order saved successfully', 'success');
        alert('Sipariş başarıyla güncellendi.');
        // Update printing if needed? For now just save.
        if (data.data?.printResults) {
          await handlePrintFailover(data, selectedOrder.id, false);
        }
        fetchOrders(); // Refresh lists
      } else {
        alert('Sipariş kaydedilemedi: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Kaydetme hatası oluştu.');
    }
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


  const handleMergeTables = async () => {
    if (!mergeSource || !mergeTarget) return alert('Lütfen iki masa seçiniz');
    if (mergeSource === mergeTarget) return alert('Aynı masayı birleştiremezsiniz');

    if (!confirm(`Masa ${mergeSource} içerisindeki ürünleri Masa ${mergeTarget}'ye taşımak istediğinize emin misiniz?`)) return;

    try {
      const response = await fetch(`${API_URL}/orders/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          sourceTableId: mergeSource,
          targetTableId: mergeTarget
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Masalar başarıyla birleştirildi!');
        setIsMergeModalOpen(false);
        setMergeSource('');
        setMergeTarget('');
        fetchOrders();
      } else {
        alert('Hata: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Birleştirme işlemi sırasında hata oluştu');
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
            const success = await printReceiptViaBridge(BRIDGE_URL, result.ip, {
              orderNumber: orderId,
              tableNumber: (data.order?.tableNumber || data.data?.tableNumber || '?').toString(),
              items: result.stationItems
            });

            if (success) {
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
                  message: `❌ Yerel köprü hatası: Yazıcıya ulaşılamadı.`,
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
        // Silently succeed as per user request
        if (showDebug) {
          console.log('✅ Yazıcıya yerel köprü üzerinden başarıyla gönderildi!');
        }
      } else {
        console.error('❌ Bazı yazıcılara gönderilemedi. Yerel köprü açık mı?');
      }
    } else if (!data.success) {
      console.error('Yazdırma hatası: ' + (data.message || 'Bilinmeyen hata'));
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

  const handleUpdateTable = async () => {
    if (!tableEditOrder || !newTableNumber) return;

    try {
      const isGrouped = tableEditOrder.id.includes('grouped');
      const tableOrders = isGrouped ? tableEditOrder.originalOrders || [] : [tableEditOrder];

      if (tableOrders.length === 0) return;

      const results = await Promise.all(tableOrders.map(async (order) => {
        const response = await fetch(`${API_URL}/orders/${order.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tableNumber: Number(newTableNumber) })
        });
        return response.json();
      }));

      const allSuccess = results.every(r => r.success);
      if (allSuccess) {
        alert('Masa numarası başarıyla güncellendi.');
        setShowTableModal(false);
        setTableEditOrder(null);
        setNewTableNumber('');
        fetchOrders();
      } else {
        alert('Bazı siparişler güncellenirken hata oluştu.');
      }
    } catch (error) {
      console.error('Masa güncelleme hatası:', error);
      alert('Masa güncellenirken bir hata oluştu.');
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

  // Ödeme yöntemi, bahşiş ve bağış bilgilerini notlardan temizle
  const cleanNotes = (notes: string | undefined): string | undefined => {
    if (!notes) return notes;

    // Ödeme yöntemi, bahşiş ve bağış bilgilerini regex ile temizle
    let cleaned = notes
      .replace(/Ödeme(\s+yöntemi)?:\s*[^,|]+(,\s*|\|\s*)?/gi, '')
      .replace(/Bahşiş:\s*[^,|]+(,\s*|\|\s*)?/gi, '')
      .replace(/Bağış:\s*[^,|]+(,\s*|\|\s*)?/gi, '')
      .replace(/Debug\s+Simülasyonu\s*-\s*Ödeme:\s*[^,|]+(,\s*|\|\s*)?/gi, '') // Debug notlarını temizle
      .replace(/,\s*,/g, ',') // Çift virgülleri temizle
      .replace(/^,\s*/, '') // Başlangıçtaki virgülü temizle
      .replace(/,\s*$/, '') // Sondaki virgülü temizle
      .replace(/^\s*📝\s*(Özel\s+)?NOT:\s*/i, '') // "📝 NOT:" veya "📝 Özel Not:" başlığını temizle
      .trim();

    // Eğer sadece boşluk veya virgül kaldıysa undefined döndür
    if (!cleaned || cleaned === ',' || cleaned === '') {
      return undefined;
    }

    return cleaned;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-500 rounded-2xl shadow-lg shadow-green-200">
              <FaMoneyBillWave className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">KASA PANELİ</h1>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{restaurantName || 'YÜKLENİYOR...'}</p>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-4 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 group-focus-within:text-green-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Masa No veya Ürün Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl py-3 pl-12 pr-4 text-sm font-bold transition-all shadow-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-8">
            <div className="text-center group">
              <div className="text-2xl font-black text-green-600 group-hover:scale-110 transition-transform">
                {allOrders
                  .filter(o => {
                    if (o.status === 'cancelled') return false;
                    const date = new Date(o.created_at || o.createdAt || '');
                    const today = new Date();
                    return date.getDate() === today.getDate() &&
                      date.getMonth() === today.getMonth() &&
                      date.getFullYear() === today.getFullYear();
                  })
                  .reduce((s, o) => s + (Number(o.totalAmount) || 0), 0)
                  .toFixed(2)}₺
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">GÜNLÜK CİRO</div>
            </div>
            <div className="text-center group">
              <div className="text-2xl font-black text-orange-500 group-hover:scale-110 transition-transform">
                {orders.reduce((s, o) => s + ((Number(o.totalAmount) || 0) - (Number(o.paidAmount) || 0) - (Number(o.discountAmount) || 0)), 0).toFixed(2)}₺
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">BEKLEYEN TAHSİLAT</div>
            </div>

            <button
              onClick={() => setShowProductModal(true)}
              className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all shadow-sm flex flex-col items-center justify-center gap-1 min-w-[80px]"
            >
              <FaBox size={20} />
              <span className="text-[10px] font-black">STOK</span>
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

        {/* Floor Tabs */}
        {activeSource === 'restoran' && floors.length > 0 && (
          <div className="flex gap-2 mb-8 bg-white/30 p-1.5 rounded-2xl border border-gray-100/50 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveFloor('all')}
              className={`px-6 py-2 rounded-xl font-bold transition-all text-sm ${activeFloor === 'all'
                ? 'bg-white text-gray-900 shadow-md transform scale-105'
                : 'text-gray-500 hover:bg-white/50'
                }`}
            >
              TÜM KATLAR
            </button>
            {floors.map((floor, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFloor(floor.name)}
                className={`px-6 py-2 rounded-xl font-bold transition-all text-sm whitespace-nowrap ${activeFloor === floor.name
                  ? 'bg-white text-gray-900 shadow-md transform scale-105'
                  : 'text-gray-500 hover:bg-white/50'
                  }`}
              >
                {floor.name.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* View Mode Toggle - Only for RESTORAN */}
        {activeSource === 'restoran' && (
          <div className="flex gap-2 mb-6 justify-end">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${viewMode === 'list'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-500 hover:bg-gray-100'
                }`}
            >
              📋 LİSTE
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${viewMode === 'grid'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-500 hover:bg-gray-100'
                }`}
            >
              🏠 TÜM MASALAR
            </button>
          </div>
        )}

        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-black text-gray-400 animate-pulse">SİPARİŞLER ÇEKİLİYOR...</p>
          </div>
        ) : activeSource === 'restoran' && viewMode === 'grid' ? (
          // TABLE GRID VIEW - Show all tables
          (() => {
            const currentFloor = floors.find(f => f.name === activeFloor);
            const startTable = currentFloor ? Number(currentFloor.startTable) : 1;
            const endTable = currentFloor ? Number(currentFloor.endTable) : totalTables;
            const allTableNumbers = Array.from({ length: endTable - startTable + 1 }, (_, i) => startTable + i);

            return (
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                {allTableNumbers.map(tableNum => {
                  const tableOrder = orders.find(o => o.orderType === 'dine_in' && o.tableNumber === tableNum);
                  const hasOrder = !!tableOrder;
                  const orderCount = hasOrder && tableOrder.originalOrders ? tableOrder.originalOrders.length : (hasOrder ? 1 : 0);
                  const remaining = hasOrder ? (Number(tableOrder.totalAmount || 0) - Number(tableOrder.paidAmount || 0) - Number(tableOrder.discountAmount || 0)) : 0;

                  // Calculate Duration
                  let durationStr = '';
                  if (hasOrder) {
                    let startTimeStr = (tableOrder as any).createdAt || (tableOrder as any).created_at;
                    if (tableOrder.originalOrders && tableOrder.originalOrders.length > 0) {
                      const earliest = tableOrder.originalOrders.reduce((min: any, o: any) => {
                        const oTime = o.createdAt || o.created_at;
                        const minTime = min;
                        return new Date(oTime).getTime() < new Date(minTime).getTime() ? oTime : minTime;
                      }, (tableOrder.originalOrders[0] as any).createdAt || (tableOrder.originalOrders[0] as any).created_at);
                      startTimeStr = earliest;
                    }
                    if (startTimeStr) {
                      const diffMs = currentTime.getTime() - new Date(startTimeStr).getTime();
                      const diffMins = Math.floor(diffMs / 60000);
                      const hrs = Math.floor(diffMins / 60);
                      const mins = diffMins % 60;
                      durationStr = hrs > 0 ? `${hrs}sa ${mins}dk` : `${mins}dk`;
                    }
                  }

                  return (
                    <button
                      key={tableNum}
                      onClick={() => {
                        if (hasOrder && tableOrder) {
                          setSelectedOrder(tableOrder);
                          setUndoStack([]);
                          setShowPaymentModal(true);
                          setManualAmount('');
                          setPaymentTab('full');
                        } else {
                          // Empty table - Create Order
                          const blankOrder: Order = {
                            id: 'temp-' + Date.now(),
                            restaurantId: restaurantId,
                            tableNumber: tableNum,
                            items: [],
                            totalAmount: 0,
                            paidAmount: 0,
                            discountAmount: 0,
                            status: 'pending',
                            orderType: 'dine_in',
                            approved: true,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                          };
                          setSelectedOrder(blankOrder);
                          setIsNewOrder(true);
                          setUndoStack([]);
                          setShowPaymentModal(true);
                          setManualAmount('');
                          setPaymentTab('full');
                        }
                      }}
                      className={`aspect-square rounded-2xl font-black text-xl flex flex-col items-center justify-center gap-1 transition-all shadow-md relative ${hasOrder
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white hover:scale-105 hover:shadow-xl cursor-pointer'
                        : 'bg-white text-gray-400 hover:bg-gray-50 hover:text-green-500 hover:border-green-200 border-2 border-transparent cursor-pointer'
                        }`}
                    >
                      <span className="text-2xl">{tableNum}</span>
                      {hasOrder && (
                        <>
                          {orderCount > 1 && (
                            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                              {orderCount}
                            </span>
                          )}
                          <span className="text-[10px] font-bold opacity-90">{remaining.toFixed(0)}₺</span>
                          <div className="absolute top-1 left-1 bg-black/20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <FaClock size={8} /> {durationStr}
                          </div>
                        </>
                      )}
                      {!hasOrder && (
                        <div className="text-[8px] font-bold uppercase tracking-widest opacity-0 hover:opacity-100 transition-opacity absolute bottom-2">
                          SİPARİŞ EKLE
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })()
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
              .filter(o => {
                if (!searchTerm) return true;
                const term = searchTerm.toLowerCase();
                const tableMatch = o.tableNumber?.toString().includes(term);
                const itemMatch = o.items.some(it => it.name.toLowerCase().includes(term));
                const noteMatch = o.notes?.toLowerCase().includes(term);
                return tableMatch || itemMatch || noteMatch;
              })
              .filter(o => {
                if (activeSource !== 'restoran') return true;
                if (activeFloor === 'all') return true;
                const floor = floors.find(f => activeFloor === f.name);
                if (!floor) return true;
                const table = Number(o.tableNumber);
                return table >= Number(floor.startTable) && table <= Number(floor.endTable);
              })
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
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 transition-all group border-transparent hover:border-green-500 cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setUndoStack([]);
                      setShowPaymentModal(true);
                      setManualAmount('');
                      setPaymentTab('full');
                    }}
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
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTableEditOrder(order);
                            setNewTableNumber(order.tableNumber?.toString() || '');
                            setShowTableModal(true);
                          }}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                        >
                          MASA DEĞİŞTİR
                        </button>
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

                        {cleanNotes(order.notes) && (
                          <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl">
                            <span className="text-[10px] font-black text-yellow-700 uppercase tracking-widest block mb-1">DİKKAT: SİPARİŞ NOTU</span>
                            <p className="text-xs font-bold text-gray-700">{cleanNotes(order.notes)}</p>
                          </div>
                        )}

                        {order.tableNumber == null && !order.id.includes('grouped') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
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
                        {order.approved ? (
                          hasPermission('cashier_process_payment') && (
                            <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setUndoStack([]); setShowPaymentModal(true); setManualAmount(''); setPaymentTab('full'); }} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-green-600 transition-all shadow-lg active:scale-95">
                              ÖDEME AL
                            </button>
                          )
                        ) : (
                          hasPermission('cashier_approve_orders') && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
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
                              <span className="text-sm">SİPARİŞİ ONAYLA</span>
                            </button>
                          )
                        )}


                        {hasPermission('cashier_reject_orders') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
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

              {/* SOL PANEL: ÜRÜNLER (Scrollable) - Width 25% */}
              <div className="w-[28%] bg-gray-50 border-r border-gray-200 flex flex-col h-full shrink-0">
                {/* Header */}
                <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shrink-0">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      {selectedOrder.tableNumber && <span className="bg-gray-800 text-white px-2 py-1 rounded text-sm">MASA {selectedOrder.tableNumber}</span>}
                      {!selectedOrder.tableNumber && <span className="bg-orange-500 text-white px-2 py-1 rounded text-sm">PAKET / WEB</span>}
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
                          <div className="flex flex-col w-3/4">
                            <span className="font-bold text-gray-800 text-sm line-clamp-2">{item.name}</span>
                            {item.variations && item.variations.length > 0 && (
                              <span className="text-[10px] text-blue-600 font-bold">
                                {item.variations.map((v: any) => typeof v === 'string' ? v : (v.name || v.value)).join(', ')}
                              </span>
                            )}
                          </div>
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
                <div className="p-4 bg-white border-t border-gray-200 shrink-0 space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400 font-bold uppercase tracking-widest">Sipariş Toplamı</span>
                    <span className="text-gray-600 font-bold">{Number(selectedOrder.totalAmount).toFixed(2)}₺</span>
                  </div>
                  {Number(selectedOrder.paidAmount) > 0 && (
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-blue-500 font-bold uppercase tracking-widest">Ödenen Miktar</span>
                      <span className="text-blue-600 font-bold">-{Number(selectedOrder.paidAmount).toFixed(2)}₺</span>
                    </div>
                  )}
                  {Number(selectedOrder.discountAmount) > 0 && (
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-red-500 font-bold uppercase tracking-widest">İndirim</span>
                      <span className="text-red-600 font-bold">-{Number(selectedOrder.discountAmount).toFixed(2)}₺</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center bg-green-50 px-4 py-3 rounded-2xl border border-green-100">
                    <span className="text-green-800 font-black text-xs uppercase tracking-tighter">KALAN BORÇ</span>
                    <span className="text-green-600 font-black text-2xl font-mono tracking-tighter">
                      {(Number(selectedOrder.totalAmount) - Number(selectedOrder.paidAmount) - Number(selectedOrder.discountAmount)).toFixed(2)}₺
                    </span>
                  </div>

                  <button
                    onClick={handleSaveOrder}
                    className="w-full py-2 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 flex items-center justify-center gap-2 border border-blue-200"
                  >
                    <FaSave /> {isNewOrder ? 'YENİ SİPARİŞİ OLUŞTUR' : 'SİPARİŞİ GÜNCELLE / KAYDET'}
                  </button>
                </div>
              </div>

              {/* ORTA PANEL: ÖDEME (Width 40%) */}
              <div className="w-[44%] bg-white flex flex-col h-full relative border-r border-gray-200">
                {/* Close Butonu */}
                <div className="absolute top-4 right-4 z-10">
                  <button onClick={() => { setShowPaymentModal(false); setSelectedOrder(null); setShowCashPad(false); setIsNewOrder(false); }} className="p-2 bg-gray-100 text-gray-500 rounded hover:bg-red-100 hover:text-red-500 transition-colors">
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

                        // Determine if this is a partial payment for specific items
                        const isPayingForSpecificItems = paymentTab === 'partial' && selectedItemIndexes.length > 0;

                        const prevPaid = parseFloat(String(selectedOrder.paidAmount || 0));
                        const newPaidTotal = parseFloat((prevPaid + targetPaymentAmount).toFixed(2));

                        let updatedOrderData = {
                          ...selectedOrder,
                          paidAmount: newPaidTotal,
                          cashierNote: (selectedOrder.cashierNote || '') + ` [NAKİT: ${received}₺ -> P.ÜSTÜ: ${(received - targetPaymentAmount).toFixed(2)}₺]`
                        };

                        // If paying for specific items, remove them from the order
                        if (isPayingForSpecificItems) {
                          const remainingItems = selectedOrder.items.filter((_, idx) => !selectedItemIndexes.includes(idx));
                          const newTotal = remainingItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
                          updatedOrderData = {
                            ...updatedOrderData,
                            items: remainingItems,
                            totalAmount: newTotal,
                            paidAmount: 0  // Reset paid amount since we removed the paid items
                          };
                        }

                        // Calculate if this is truly a partial payment (has remaining balance)
                        const currentTotal = parseFloat(String(updatedOrderData.totalAmount || 0));
                        const currentPaid = parseFloat(String(updatedOrderData.paidAmount || 0));
                        const currentDiscount = parseFloat(String(updatedOrderData.discountAmount || 0));
                        const remaining = parseFloat((currentTotal - currentPaid - currentDiscount).toFixed(2));

                        const isTrulyPartial = remaining > 0.05;

                        await handlePayment(selectedOrder.id, updatedOrderData, isTrulyPartial);

                        setCashReceived('');
                        setShowCashPad(false);
                        // setShowPaymentModal(false); // Do not close modal here, let handlePayment decide
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

                      {/* Hızlı İndirim - Tüm modlarda aktif */}
                      {(staffRole === 'manager' || staffRole === 'admin' || staffRole === 'cashier') && (
                        <div className="flex flex-wrap justify-center gap-2 mt-4 px-4">
                          {[5, 10, 16, 20, 25, 30].map(v => (
                            <button
                              key={v}
                              onClick={() => {
                                if (!selectedOrder) return;
                                saveToUndo(selectedOrder);
                                const amount = selectedOrder.totalAmount * (v / 100);
                                setSelectedOrder({ ...selectedOrder, discountAmount: amount });
                              }}
                              className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-black border border-indigo-100 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-1 active:scale-95"
                            >
                              %{v}
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              if (!selectedOrder) return;
                              saveToUndo(selectedOrder);
                              setSelectedOrder({ ...selectedOrder, discountAmount: 0 });
                            }}
                            className="px-4 py-2 bg-red-50 text-red-600 text-sm font-black border border-red-100 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                          >
                            SIFIRLA
                          </button>
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
                            {manualAmount && Number(manualAmount) > 0 && (
                              <div className="mt-2 text-center text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 py-1 rounded-full">
                                BU ÖDEMEDEN SONRA KALAN: {
                                  (parseFloat(String(selectedOrder.totalAmount || 0)) - parseFloat(String(selectedOrder.paidAmount || 0)) - parseFloat(String(selectedOrder.discountAmount || 0)) - parseFloat(manualAmount)).toFixed(2)
                                }₺
                              </div>
                            )}
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
                            const cash = parseFloat(cashAmount) || 0;
                            const card = parseFloat(cardAmount) || 0;
                            const total = parseFloat((cash + card).toFixed(2));
                            if (total <= 0) return alert('Lütfen tutar giriniz!');
                            if (cash < 0 || card < 0) return alert('Negatif tutar girilemez!');

                            let note = selectedOrder.cashierNote || '';
                            if (cash > 0) note += ` [NAKİT: ${cash.toFixed(2)}₺]`;
                            if (card > 0) note += ` [KART: ${card.toFixed(2)}₺]`;

                            const prevPaidValue = parseFloat(String(selectedOrder.paidAmount || 0));
                            const newPaidTotalValue = parseFloat((prevPaidValue + total).toFixed(2));

                            const updatedOrderData = {
                              ...selectedOrder,
                              paidAmount: newPaidTotalValue,
                              cashierNote: note
                            };

                            // Calculate if this is truly a partial payment (has remaining balance)
                            const currentTotal = parseFloat(String(updatedOrderData.totalAmount || 0));
                            const currentPaidFinal = parseFloat(String(updatedOrderData.paidAmount || 0));
                            const currentDiscountFinal = parseFloat(String(updatedOrderData.discountAmount || 0));
                            const remaining = parseFloat((currentTotal - currentPaidFinal - currentDiscountFinal).toFixed(2));

                            const isTrulyPartial = remaining > 0.05;

                            if (card > 0) {
                              alert(`Lütfen POS cihazından ${card.toFixed(2)}₺ tutarında ödemeyi manuel olarak tamamlayınız.`);
                            }

                            handlePayment(selectedOrder.id, updatedOrderData, isTrulyPartial);
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
                              let isPayingForSpecificItems = false;

                              if (paymentTab === 'partial') {
                                // Priority: 1. Manual Entry, 2. Selected Items
                                if (manualAmount && Number(manualAmount) > 0) {
                                  val = Number(manualAmount);
                                } else if (selectedItemIndexes.length > 0) {
                                  val = selectedItemIndexes.reduce((s, i) => s + (Number(selectedOrder.items[i].price || 0) * Number(selectedOrder.items[i].quantity || 1)), 0);
                                  isPayingForSpecificItems = true;
                                } else {
                                  return alert('Lütfen ürün seçin veya tutar girin.');
                                }
                              } else {
                                val = (Number(selectedOrder.totalAmount || 0) - Number(selectedOrder.paidAmount || 0) - Number(selectedOrder.discountAmount || 0));
                              }

                              if (val <= 0) return alert('Geçersiz Tutar');

                              const prevPaidValue = parseFloat(String(selectedOrder.paidAmount || 0));
                              const newPaidTotalValue = parseFloat((prevPaidValue + val).toFixed(2));

                              let updatedOrderData = {
                                ...selectedOrder,
                                paidAmount: newPaidTotalValue,
                                cashierNote: (selectedOrder.cashierNote || '') + ' [KART]'
                              };

                              // If paying for specific items, remove them from the order
                              if (isPayingForSpecificItems) {
                                const remainingItems = selectedOrder.items.filter((_, idx) => !selectedItemIndexes.includes(idx));
                                const newTotal = remainingItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
                                updatedOrderData = {
                                  ...updatedOrderData,
                                  items: remainingItems,
                                  totalAmount: newTotal,
                                  paidAmount: 0  // Reset paid amount since we removed the paid items
                                };
                              }

                              // Calculate if this is truly a partial payment (has remaining balance)
                              const currentTotal = parseFloat(String(updatedOrderData.totalAmount || 0));
                              const currentPaid = parseFloat(String(updatedOrderData.paidAmount || 0));
                              const currentDiscount = parseFloat(String(updatedOrderData.discountAmount || 0));
                              const remaining = parseFloat((currentTotal - currentPaid - currentDiscount).toFixed(2));

                              const isTrulyPartial = remaining > 0.05;

                              alert(`Lütfen POS cihazından ${val.toFixed(2)}₺ tutarında ödemeyi manuel olarak tamamlayınız.`);

                              handlePayment(selectedOrder.id, updatedOrderData, isTrulyPartial);
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

              {/* SAĞ PANEL: MENÜ EKLEME (Width 30%) */}
              <div className="flex-1 bg-gray-50 flex flex-col h-full border-l border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-white">
                  <h3 className="font-bold text-gray-800 mb-2">MENÜDEN EKLE</h3>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Ürün ara..."
                      value={menuSearchTerm}
                      onChange={(e) => setMenuSearchTerm(e.target.value)}
                      className="w-full pl-9 p-2 bg-gray-100 rounded-lg text-sm font-bold border border-transparent focus:bg-white focus:border-green-500 outline-none"
                    />
                  </div>

                </div>

                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                  <div className="flex flex-col gap-2">
                    {menuItems
                      .flatMap((item: any) => {
                        if (item.variations && Array.isArray(item.variations) && item.variations.length > 0) {
                          return item.variations.map((v: any) => ({
                            ...item,
                            name: `[${v.name}] ${item.name}`,
                            price: v.price || item.price,
                            selectedVariation: v,
                            displayKey: `${item.id}-${v.id || v.name}`
                          }));
                        }
                        return [{ ...item, displayKey: item.id }];
                      })
                      .filter(item => {
                        if (selectedMenuCategory !== 'all' && item.categoryId !== selectedMenuCategory) return false;
                        if (menuSearchTerm && !item.name.toLowerCase().includes(menuSearchTerm.toLowerCase())) return false;
                        return true;
                      })
                      .map((item, idx) => {
                        // Find current quantity in order
                        const inOrder = selectedOrder.items.find((i) => i.name === item.name && JSON.stringify(i.notes) === JSON.stringify(item.notes || ''));
                        const currentQty = inOrder ? inOrder.quantity : 0;

                        return (
                          <div key={item.displayKey || idx} className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center group hover:border-blue-300">
                            <div className="flex-1">
                              <div className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</div>
                              <div className="font-bold text-green-600 text-xs">{item.price}₺</div>
                            </div>

                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                              <button
                                onClick={(e) => { e.stopPropagation(); addItemToOrder(item, -1); }}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${currentQty > 0 ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                disabled={currentQty === 0}
                              >
                                <FaMinus size={10} />
                              </button>
                              <span className={`w-6 text-center font-black text-sm ${currentQty > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                                {currentQty}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); addItemToOrder(item, 1); }}
                                className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                              >
                                <FaPlus size={10} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  {menuItems.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                      <p>Menü yüklenemedi veya boş</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )
      }

      {/* MASA DEĞİŞTİRME MODALI */}
      {showTableModal && tableEditOrder && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-50">
              <h3 className="text-2xl font-black text-gray-800 text-center uppercase tracking-tight">Masa Numarası Değiştir</h3>
              <p className="text-gray-400 text-center font-bold text-xs mt-2 uppercase tracking-widest">Sipariş ID: {tableEditOrder.id.substring(0, 8)}</p>
            </div>

            <div className="p-8">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 text-center">YENİ MASA NUMARASI</label>
              <div className="relative">
                <input
                  type="number"
                  autoFocus
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="w-full bg-gray-50 border-4 border-gray-100 rounded-2xl py-6 text-center text-4xl font-black text-gray-800 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                  onClick={() => { setShowTableModal(false); setTableEditOrder(null); setNewTableNumber(''); }}
                  className="py-4 px-6 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all uppercase text-sm tracking-widest"
                >
                  İptal
                </button>
                <button
                  onClick={handleUpdateTable}
                  className="py-4 px-6 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 uppercase text-sm tracking-widest flex items-center justify-center gap-2"
                >
                  <FaCheck /> Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT MANAGEMENT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                  <FaBox size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-800">ÜRÜN YÖNETİMİ</h2>
                  <p className="text-gray-500 text-sm font-bold">Stok durumu ve ürün görünürlüğü</p>
                </div>
              </div>
              <button onClick={() => setShowProductModal(false)} className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors text-gray-600">
                <FaTimesCircle size={24} />
              </button>
            </div>

            {/* Filters */}
            <div className="p-4 border-b bg-white flex gap-4 flex-wrap items-center">
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ürün Ara..."
                  value={productSearchTerm}
                  onChange={e => setProductSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <select
                value={selectedCategoryFilter}
                onChange={e => setSelectedCategoryFilter(e.target.value)}
                className="px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold outline-none cursor-pointer focus:border-blue-500"
              >
                <option value="all">TÜM KATEGORİLER</option>
                {menuCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems
                  .filter(item => {
                    const matchesSearch = item.name.toLowerCase().includes(productSearchTerm.toLowerCase());
                    const matchesCategory = selectedCategoryFilter === 'all' || item.categoryId === selectedCategoryFilter;
                    return matchesSearch && matchesCategory;
                  })
                  .map(item => (
                    <div key={item.id} className={`bg-white p-4 rounded-2xl shadow-sm border-2 transition-all flex items-center justify-between group ${!item.isAvailable ? 'border-red-100 bg-red-50/30 grayscale' : 'border-transparent hover:border-blue-200'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl.startsWith('http') ? item.imageUrl : `${API_URL.replace('/api', '')}${item.imageUrl}`} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400"><FaUtensils /></div>
                          )}
                        </div>
                        <div>
                          <h3 className={`font-bold text-gray-800 ${!item.isAvailable ? 'line-through text-gray-500' : ''}`}>{item.name}</h3>
                          <p className="text-xs font-bold text-gray-400">{item.price}₺</p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleProductAvailability(item)}
                        className={`relative w-14 h-8 rounded-full transition-colors flex items-center px-1 ${item.isAvailable ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}
                      >
                        <div className="w-6 h-6 bg-white rounded-full shadow-md transform transition-transform" />
                      </button>
                    </div>
                  ))}
              </div>

              {menuItems.length === 0 && (
                <div className="text-center py-20 text-gray-400 font-bold">
                  Ürün bulunamadı veya yükleniyor...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT CONFIRMATION MODAL */}
      {receiptModalData && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-100 transform scale-100 transition-all">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaReceipt className="text-4xl text-green-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">TAHSİLAT TAMAMLANDI</h3>
              <p className="text-gray-500 font-bold text-lg">Fiş ister misiniz?</p>
            </div>

            <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100">
              <button
                onClick={() => finalizePaymentAfterReceiptChoice(false)}
                className="py-6 bg-gray-50 text-gray-500 font-black hover:bg-gray-100 transition-colors uppercase tracking-widest text-sm flex items-center justify-center gap-2"
              >
                <FaTimesCircle className="text-lg" />
                HAYIR
              </button>
              <button
                onClick={() => finalizePaymentAfterReceiptChoice(true)}
                className="py-6 bg-green-500 text-white font-black hover:bg-green-600 transition-colors uppercase tracking-widest text-sm flex items-center justify-center gap-2"
              >
                <FaPrint className="text-lg" />
                EVET
              </button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
}
