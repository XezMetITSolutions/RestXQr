'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaUtensils, FaBell, FaCheckCircle, FaClock, FaMoneyBillWave, FaEdit, FaEye, FaTimes, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
import useLanguageStore from '@/store/useLanguageStore';

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string; // Ürün notu
}

interface Order {
    id: string;
    restaurantId: string;
    tableNumber: number;
    customerName?: string;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    totalAmount: number;
    notes?: string;
    orderType: string;
    created_at: string;
    items: OrderItem[];
}

export default function DemoWaiterContent() {
    const router = useRouter();
    const { t, language } = useLanguageStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [restaurantId, setRestaurantId] = useState<string>('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showTableModal, setShowTableModal] = useState(false);
    const [newTableNumber, setNewTableNumber] = useState<string>('');
    const [orderToChangeTable, setOrderToChangeTable] = useState<Order | null>(null);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [staffUser, setStaffUser] = useState<any>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

    // Demo mode - No authentication required
    useEffect(() => {
        // Set demo user for display
        setStaffUser({ name: 'Demo Garson', role: 'waiter' });
    }, []);

    // Restoran ID'sini al
    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const response = await fetch(`${API_URL}/staff/restaurants`);
                const data = await response.json();

                if (data.success && data.data) {
                    const aksaray = data.data.find((r: any) => r.username === 'aksaray');
                    if (aksaray) {
                        setRestaurantId(aksaray.id);
                    }
                }
            } catch (error) {
                console.error('Restoran bilgisi alınamadı:', error);
            }
        };

        fetchRestaurant();
    }, []);

    // Demo veriler - TR
    const demoOrdersTR: Order[] = [
        {
            id: '1',
            restaurantId: 'demo-restaurant',
            tableNumber: 5,
            customerName: 'Ahmet Yılmaz',
            status: 'pending',
            totalAmount: 245.50,
            notes: 'Acil servis - Müşteri bekliyor',
            orderType: 'table',
            created_at: new Date().toISOString(),
            items: [
                { id: '1', name: 'Adana Kebap', quantity: 2, price: 85.00, notes: 'Az baharatlı olsun' },
                { id: '2', name: 'Ayran', quantity: 2, price: 15.00, notes: 'Buzlu isteniyor' },
                { id: '3', name: 'Fırın Sütlaç', quantity: 1, price: 35.50 }
            ]
        },
        {
            id: '2',
            restaurantId: 'demo-restaurant',
            tableNumber: 12,
            customerName: 'Ayşe Demir',
            status: 'ready',
            totalAmount: 128.00,
            notes: 'Paket siparişi - Teslim için hazır',
            orderType: 'takeaway',
            created_at: new Date(Date.now() - 15 * 60000).toISOString(),
            items: [
                { id: '4', name: 'Pide (Kaşarlı)', quantity: 2, price: 45.00 },
                { id: '5', name: 'Çay', quantity: 2, price: 10.00, notes: 'Şekersiz' },
                { id: '6', name: 'Salata', quantity: 1, price: 18.00, notes: 'Ekstra soslu' }
            ]
        },
        {
            id: '3',
            restaurantId: 'demo-restaurant',
            tableNumber: 8,
            customerName: 'Zeynep Karaca',
            status: 'preparing',
            totalAmount: 320.00,
            notes: 'Doğum günü masa - Pasta istiyorlar',
            orderType: 'table',
            created_at: new Date(Date.now() - 5 * 60000).toISOString(),
            items: [
                { id: '7', name: 'Sucuklu Pizza', quantity: 1, price: 95.00, notes: 'Çıtır olsun' },
                { id: '8', name: 'Karışık Pizza', quantity: 1, price: 110.00 },
                { id: '9', name: 'Cola (2L)', quantity: 1, price: 45.00 },
                { id: '10', name: 'Patates Kızartması', quantity: 2, price: 35.00, notes: 'Ekstra tuzlu' }
            ]
        },
        {
            id: '4',
            restaurantId: 'demo-restaurant',
            tableNumber: 3,
            customerName: 'Mehmet Kaya',
            status: 'pending',
            totalAmount: 98.50,
            notes: 'Öğle yemeği - Hızlı servis',
            orderType: 'table',
            created_at: new Date(Date.now() - 30 * 60000).toISOString(),
            items: [
                { id: '11', name: 'Döner Tost', quantity: 1, price: 55.00, notes: 'Acısız' },
                { id: '12', name: 'Ayran', quantity: 2, price: 15.00 },
                { id: '13', name: 'Baklava', quantity: 1, price: 28.50, notes: 'Fıstıklı' }
            ]
        }
    ];

    // Demo veriler - DE (Avusturya Mutfağı)
    const demoOrdersDE: Order[] = [
        {
            id: '1',
            restaurantId: 'demo-restaurant',
            tableNumber: 5,
            customerName: 'Hans Müller',
            status: 'pending',
            totalAmount: 45.50,
            notes: 'Eilig - Kunde wartet',
            orderType: 'table',
            created_at: new Date().toISOString(),
            items: [
                { id: '1', name: 'Wiener Schnitzel', quantity: 2, price: 18.50, notes: 'Mit Preiselbeeren' },
                { id: '2', name: 'Almdudler', quantity: 2, price: 3.50, notes: 'Kalt' },
                { id: '3', name: 'Apfelstrudel', quantity: 1, price: 5.50 }
            ]
        },
        {
            id: '2',
            restaurantId: 'demo-restaurant',
            tableNumber: 12,
            customerName: 'Julia Weber',
            status: 'ready',
            totalAmount: 32.00,
            notes: 'Zum Mitnehmen - Bereit zur Abholung',
            orderType: 'takeaway',
            created_at: new Date(Date.now() - 15 * 60000).toISOString(),
            items: [
                { id: '4', name: 'Käsespätzle', quantity: 2, price: 12.50 },
                { id: '5', name: 'Mineralwasser', quantity: 2, price: 2.50, notes: 'Ohne Gas' },
                { id: '6', name: 'Gemischter Salat', quantity: 1, price: 4.50, notes: 'Essig-Öl' }
            ]
        },
        {
            id: '3',
            restaurantId: 'demo-restaurant',
            tableNumber: 8,
            customerName: 'Stefan Gruber',
            status: 'preparing',
            totalAmount: 85.00,
            notes: 'Geburtstagstisch - Kuchen gewünscht',
            orderType: 'table',
            created_at: new Date(Date.now() - 5 * 60000).toISOString(),
            items: [
                { id: '7', name: 'Tafelspitz', quantity: 1, price: 22.00, notes: 'Mit Röstkartoffeln' },
                { id: '8', name: 'Zwiebelrostbraten', quantity: 1, price: 24.00 },
                { id: '9', name: 'Grüner Veltliner (0.75L)', quantity: 1, price: 28.00 },
                { id: '10', name: 'Kaiserschmarrn', quantity: 2, price: 11.00, notes: 'Mit Zwetschgenröster' }
            ]
        },
        {
            id: '4',
            restaurantId: 'demo-restaurant',
            tableNumber: 3,
            customerName: 'Markus Lang',
            status: 'pending',
            totalAmount: 28.50,
            notes: 'Mittagessen - Schnell bitte',
            orderType: 'table',
            created_at: new Date(Date.now() - 30 * 60000).toISOString(),
            items: [
                { id: '11', name: 'Gulaschsuppe', quantity: 1, price: 8.50, notes: 'Scharf' },
                { id: '12', name: 'Bier (0.5L)', quantity: 2, price: 4.50 },
                { id: '13', name: 'Sachertorte', quantity: 1, price: 6.50, notes: 'Mit Schlagobers' }
            ]
        }
    ];

    // Siparişleri çek
    const fetchOrders = async () => {
        if (!restaurantId) return;

        try {
            setLoading(true);
            // Demo modda demo verileri kullan
            setOrders(language === 'de' ? demoOrdersDE : demoOrdersTR);
        } catch (error) {
            console.error('Siparişler alınamadı:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (restaurantId) {
            fetchOrders();
            // Her 5 saniyede bir yenile
            const interval = setInterval(fetchOrders, 5000);
            return () => clearInterval(interval);
        }
    }, [restaurantId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'preparing': return 'bg-blue-100 text-blue-800';
            case 'ready': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return t('pending');
            case 'preparing': return t('preparing');
            case 'ready': return t('ready');
            case 'completed': return t('completed');
            case 'cancelled': return t('cancelled');
            default: return status;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    // Sipariş durumunu güncelle
    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        // Demo modda sadece state'i güncelle
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus as any } : order
            )
        );
        setShowModal(false);
        setSelectedOrder(null);
    };

    // Sipariş detaylarını aç
    const openOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    // Filtrelenmiş siparişler
    const filteredOrders = orders.filter(order => {
        if (activeFilter === 'all') return true;
        return order.status === activeFilter;
    });

    // İstatistikler
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        completed: orders.filter(o => o.status === 'completed').length
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-4 mb-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                                <FaUser className="text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">{t('waiterPanelTitle')}</h1>
                                <p className="text-sm text-purple-200">{t('waiterPanelSubtitle')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchOrders}
                                className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-300 transition-colors text-sm"
                            >
                                {t('refresh')}
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('staff_user');
                                    localStorage.removeItem('staff_token');
                                    router.push('/staff-login');
                                }}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors text-sm flex items-center gap-2"
                            >
                                <FaSignOutAlt />
                                <span className="hidden sm:inline">{t('logout')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-5 gap-3 mb-4">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`bg-white rounded-xl p-3 text-center transition-all ${activeFilter === 'all' ? 'ring-4 ring-yellow-400' : ''}`}
                    >
                        <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                        <div className="text-xs text-gray-600 font-medium">{t('all')} ({stats.total})</div>
                    </button>
                    <button
                        onClick={() => setActiveFilter('pending')}
                        className={`bg-white rounded-xl p-3 text-center transition-all ${activeFilter === 'pending' ? 'ring-4 ring-yellow-400' : ''}`}
                    >
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <div className="text-xs text-gray-600 font-medium">{t('active')} ({stats.pending})</div>
                    </button>
                    <button
                        onClick={() => setActiveFilter('preparing')}
                        className={`bg-white rounded-xl p-3 text-center transition-all ${activeFilter === 'preparing' ? 'ring-4 ring-yellow-400' : ''}`}
                    >
                        <div className="text-2xl font-bold text-blue-600">{stats.preparing}</div>
                        <div className="text-xs text-gray-600 font-medium">{t('preparing')} ({stats.preparing})</div>
                    </button>
                    <button
                        onClick={() => setActiveFilter('ready')}
                        className={`bg-white rounded-xl p-3 text-center transition-all ${activeFilter === 'ready' ? 'ring-4 ring-yellow-400' : ''}`}
                    >
                        <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
                        <div className="text-xs text-gray-600 font-medium">{t('ready')} ({stats.ready})</div>
                    </button>
                    <button
                        onClick={() => setActiveFilter('completed')}
                        className={`bg-white rounded-xl p-3 text-center transition-all ${activeFilter === 'completed' ? 'ring-4 ring-yellow-400' : ''}`}
                    >
                        <div className="text-2xl font-bold text-gray-600">{stats.completed}</div>
                        <div className="text-xs text-gray-600 font-medium">{t('completed')} ({stats.completed})</div>
                    </button>
                </div>

                {/* Orders Grid */}
                {loading ? (
                    <div className="text-center py-12 text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                        <p className="mt-4">{t('loadingOrders')}</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-12 text-center text-white">
                        <FaUtensils className="text-6xl mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">{t('noOrdersYet')}</h3>
                        <p className="opacity-75">{t('newOrdersWillAppearHere')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-yellow-400">
                                {/* Order Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="text-lg font-bold text-gray-900">{t('table')} {order.tableNumber}</div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <FaClock size={10} />
                                            <span>{formatTime(order.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-orange-600">₺{Number(order.totalAmount).toFixed(2)}</div>
                                        <div className="text-xs text-gray-500">{order.items.length} {t('items')}</div>
                                    </div>
                                </div>

                                {/* Order Items - Compact */}
                                <div className="space-y-1 mb-3">
                                    {order.items.slice(0, 3).map((item, index) => (
                                        <div key={index} className="flex items-start gap-2 text-sm">
                                            <div className="w-6 h-6 bg-purple-100 text-purple-700 rounded flex items-center justify-center text-xs font-bold mt-0.5">
                                                {item.quantity}x
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-gray-700">{item.name}</div>
                                                {item.notes && (
                                                    <div className="text-xs text-gray-500 mt-0.5 italic">• {item.notes}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <div className="text-xs text-gray-500 pl-8">+{order.items.length - 3} {t('moreItems')}</div>
                                    )}
                                </div>

                                {/* Customer Requests */}
                                {order.notes && (
                                    <div className="mb-3 flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                        <FaBell className="text-red-600 mt-0.5" size={12} />
                                        <div className="text-xs text-red-800 font-medium">{order.notes}</div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => {
                                            if (order.status === 'ready') {
                                                updateOrderStatus(order.id, 'completed');
                                            }
                                        }}
                                        disabled={order.status !== 'ready'}
                                        className={`py-2 text-white rounded-lg font-bold text-xs transition-colors ${order.status === 'ready'
                                            ? 'bg-green-500 hover:bg-green-600 cursor-pointer'
                                            : 'bg-gray-300 cursor-not-allowed'
                                            }`}
                                    >
                                        ✓ {t('serve')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setOrderToChangeTable(order);
                                            setNewTableNumber(order.tableNumber.toString());
                                            setShowTableModal(true);
                                        }}
                                        className="py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                                    >
                                        🔄 {t('changeTable')}
                                    </button>
                                    <button
                                        onClick={() => openOrderDetails(order)}
                                        className="py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                                    >
                                        👁 {t('details')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Masa Değiştir Modal */}
            {showTableModal && orderToChangeTable && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">🔄 {t('changeTable')}</h3>
                                <p className="text-sm text-gray-500 mt-1">{t('enterNewTableNumber')} {orderToChangeTable.tableNumber}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowTableModal(false);
                                    setOrderToChangeTable(null);
                                    setNewTableNumber('');
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('newTableNumber')}
                                </label>
                                <input
                                    type="number"
                                    value={newTableNumber}
                                    onChange={(e) => setNewTableNumber(e.target.value)}
                                    min="1"
                                    max="100"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-lg font-semibold transition-colors"
                                    placeholder={t('tableNumberPlaceholder')}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const tableNum = parseInt(newTableNumber);
                                            if (tableNum > 0) {
                                                setOrders(prevOrders =>
                                                    prevOrders.map(o =>
                                                        o.id === orderToChangeTable.id ? { ...o, tableNumber: tableNum } : o
                                                    )
                                                );
                                                setShowTableModal(false);
                                                setOrderToChangeTable(null);
                                                setNewTableNumber('');
                                            }
                                        }
                                    }}
                                />
                            </div>

                            {/* Quick Select Buttons */}
                            <div>
                                <p className="text-sm text-gray-500 mb-2">{t('quickSelect')}:</p>
                                <div className="grid grid-cols-5 gap-2">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => setNewTableNumber(num.toString())}
                                            className={`py-2 px-4 rounded-lg font-semibold transition-all ${newTableNumber === num.toString()
                                                ? 'bg-orange-500 text-white scale-110'
                                                : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sipariş Bilgileri */}
                            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-500 text-white rounded-lg px-3 py-2 text-xl font-bold">
                                        {orderToChangeTable.tableNumber}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-800">₺{Number(orderToChangeTable.totalAmount).toFixed(2)}</div>
                                        <div className="text-sm text-gray-600">{orderToChangeTable.items.length} {t('items')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowTableModal(false);
                                    setOrderToChangeTable(null);
                                    setNewTableNumber('');
                                }}
                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={() => {
                                    const tableNum = parseInt(newTableNumber);
                                    if (tableNum > 0 && tableNum <= 100) {
                                        setOrders(prevOrders =>
                                            prevOrders.map(o =>
                                                o.id === orderToChangeTable.id ? { ...o, tableNumber: tableNum } : o
                                            )
                                        );
                                        setShowTableModal(false);
                                        setOrderToChangeTable(null);
                                        setNewTableNumber('');
                                    } else {
                                        alert(t('invalidTableNumber'));
                                    }
                                }}
                                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors"
                            >
                                ✨ {t('change')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sipariş Detay Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-blue-500 text-white p-6 rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">{t('orderDetails')}</h2>
                                    <p className="text-blue-100">{t('table')} {selectedOrder.tableNumber}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedOrder(null);
                                    }}
                                    className="text-white hover:bg-blue-600 p-2 rounded-lg transition-colors"
                                >
                                    <FaTimes size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Sipariş Bilgileri */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">📋 {t('orderInfo')}</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{t('orderId')}:</span>
                                        <span className="font-mono text-xs">{selectedOrder.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{t('table')}:</span>
                                        <span className="font-semibold">{selectedOrder.tableNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{t('status')}:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                                            {getStatusText(selectedOrder.status)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{t('time')}:</span>
                                        <span>{formatTime(selectedOrder.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{t('total')}:</span>
                                        <span className="font-bold text-green-600 text-lg">
                                            {Number(selectedOrder.totalAmount).toFixed(2)}₺
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Sipariş Ürünleri */}
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-3">🍽️ {t('orderItems')}</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-800">
                                                        {item.quantity}x {item.name}
                                                    </div>
                                                    {item.notes && (
                                                        <div className="text-xs text-gray-600 mt-1 bg-yellow-50 p-2 rounded">
                                                            📝 {item.notes}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-600">{Number(item.price).toFixed(2)}₺</div>
                                                    <div className="font-semibold text-gray-800">
                                                        {(Number(item.price) * Number(item.quantity)).toFixed(2)}₺
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sipariş Notu */}
                            {selectedOrder.notes && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">📝 {t('orderNote')}</h3>
                                    <p className="text-gray-700">{selectedOrder.notes}</p>
                                </div>
                            )}

                            {/* Durum Güncelleme Butonları */}
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-3">🔄 {t('orderStatus')}</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedOrder.status !== 'completed' && (
                                        <button
                                            onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                                            className="py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FaCheckCircle />
                                            {t('served')}
                                        </button>
                                    )}
                                    {selectedOrder.status === 'pending' && (
                                        <button
                                            onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                                            className="py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                                        >
                                            {t('preparing')}
                                        </button>
                                    )}
                                    {selectedOrder.status === 'preparing' && (
                                        <button
                                            onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                                            className="py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
                                        >
                                            {t('ready')}
                                        </button>
                                    )}
                                    {selectedOrder.status !== 'cancelled' && (
                                        <button
                                            onClick={() => {
                                                if (confirm(t('confirmCancelOrder'))) {
                                                    updateOrderStatus(selectedOrder.id, 'cancelled');
                                                }
                                            }}
                                            className="py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                                        >
                                            {t('cancelOrder')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
