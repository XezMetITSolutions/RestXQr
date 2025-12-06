'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BusinessSidebar from '@/components/BusinessSidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useFeature } from '@/hooks/useFeature';
import { apiService } from '@/services/api';
import { 
  FaFileInvoiceDollar, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaDownload,
  FaChartPie,
  FaBars,
  FaArrowUp,
  FaArrowDown,
  FaCalendar,
  FaMoneyBillWave
} from 'react-icons/fa';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  paymentMethod: string;
  invoiceNumber?: string;
}

export default function AccountingPage() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuthStore();
  const hasAccountingSoftware = useFeature('accounting_software');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    type: 'income' as 'income' | 'expense',
    amount: 0,
    paymentMethod: '',
    invoiceNumber: ''
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/isletme-giris');
    } else {
      fetchTransactions();
    }
  }, [isAuthenticated, router]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const restaurantId = user?.id;
      if (!restaurantId) return;
      
      const response = await apiService.getTransactions(restaurantId);
      if (response.success && response.data) {
        // Backend'den gelen veriyi frontend formatına çevir
        const transformedTransactions = response.data.map((transaction: any) => ({
          id: transaction.id,
          date: transaction.date || transaction.created_at,
          description: transaction.description,
          category: transaction.category,
          type: transaction.type,
          amount: parseFloat(transaction.amount) || 0,
          paymentMethod: transaction.paymentMethod || transaction.payment_method || 'Nakit',
          invoiceNumber: transaction.invoiceNumber || transaction.invoice_number || ''
        }));
        setTransactions(transformedTransactions);
      }
    } catch (error) {
      console.error('İşlemler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!formData.description || !formData.category || formData.amount <= 0) {
      alert('Lütfen tüm zorunlu alanları doldurun ve tutarı girin.');
      return;
    }

    try {
      const restaurantId = user?.id;
      if (!restaurantId) return;

      const response = await apiService.createTransaction({
        date: formData.date,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod || 'Nakit',
        invoiceNumber: formData.invoiceNumber || undefined,
        restaurantId
      });
      
      if (response.success) {
        await fetchTransactions();
        setShowAddModal(false);
        resetForm();
      } else {
        alert('İşlem eklenirken hata oluştu.');
      }
    } catch (error) {
      console.error('İşlem eklenirken hata:', error);
      alert('İşlem eklenirken bir hata oluştu.');
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      invoiceNumber: transaction.invoiceNumber || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: '',
      type: 'income',
      amount: 0,
      paymentMethod: '',
      invoiceNumber: ''
    });
  };

  const handleUpdateTransaction = async () => {
    if (!editingTransaction) return;

    if (!formData.description || !formData.category || formData.amount <= 0) {
      alert('Lütfen tüm zorunlu alanları doldurun ve tutarı girin.');
      return;
    }

    try {
      const response = await apiService.updateTransaction(editingTransaction.id, {
        date: formData.date,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        invoiceNumber: formData.invoiceNumber || undefined
      });
      if (response.success) {
        await fetchTransactions();
        setShowEditModal(false);
        setEditingTransaction(null);
        resetForm();
      } else {
        alert('İşlem güncellenirken hata oluştu.');
      }
    } catch (error) {
      console.error('İşlem güncellenirken hata:', error);
      alert('İşlem güncellenirken bir hata oluştu.');
    }
  };

  const handleDeleteClick = (transactionId: string) => {
    setTransactionToDelete(transactionId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    try {
      const response = await apiService.deleteTransaction(transactionToDelete);
      if (response.success) {
        await fetchTransactions();
        setShowDeleteConfirm(false);
        setTransactionToDelete(null);
      } else {
        alert('İşlem silinirken hata oluştu.');
      }
    } catch (error) {
      console.error('İşlem silinirken hata:', error);
      alert('İşlem silinirken hata oluştu.');
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/isletme-giris');
    }
  }, [isAuthenticated, router]);

  // Özellik kontrolü
  if (!hasAccountingSoftware) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <FaFileInvoiceDollar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Muhasebe Entegrasyonu</h2>
          <p className="text-gray-600 mb-4">
            Bu özellik planınızda bulunmuyor. Muhasebe yazılımı entegrasyonu özelliğini kullanmak için planınızı yükseltin.
          </p>
          <button
            onClick={() => router.push('/business/settings')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Planı Yükselt
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/isletme-giris');
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.invoiceNumber && transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="ml-0 lg:ml-72">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FaBars className="text-xl text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaFileInvoiceDollar className="text-emerald-600" />
                    Muhasebe Yönetimi
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">Gelir ve giderlerinizi takip edin</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <FaDownload />
                  <span className="hidden sm:inline">Rapor Al</span>
                </button>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                >
                  <FaPlus />
                  <span className="hidden sm:inline">Yeni İşlem</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Gelir</p>
                  <p className="text-2xl font-bold text-green-600">₺{totalIncome.toLocaleString()}</p>
                </div>
                <FaArrowUp className="text-3xl text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Gider</p>
                  <p className="text-2xl font-bold text-red-600">₺{totalExpense.toLocaleString()}</p>
                </div>
                <FaArrowDown className="text-3xl text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Net Kar</p>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ₺{netProfit.toLocaleString()}
                  </p>
                </div>
                <FaMoneyBillWave className="text-3xl text-emerald-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Kar Marjı</p>
                  <p className="text-2xl font-bold text-blue-600">%{profitMargin}</p>
                </div>
                <FaChartPie className="text-3xl text-blue-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Açıklama, kategori veya fatura no ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">Tüm İşlemler</option>
                <option value="income">Gelirler</option>
                <option value="expense">Giderler</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Açıklama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ödeme Yöntemi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <FaCalendar className="text-gray-400" />
                          {new Date(transaction.date).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{transaction.description}</div>
                          {transaction.invoiceNumber && (
                            <div className="text-sm text-gray-500">{transaction.invoiceNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                          {transaction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {transaction.type === 'income' ? (
                            <FaArrowUp className="text-green-500" />
                          ) : (
                            <FaArrowDown className="text-red-500" />
                          )}
                          <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : '-'}₺{transaction.amount.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEditClick(transaction)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(transaction.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-6">
              <FaFileInvoiceDollar className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">İşlem bulunamadı</p>
            </div>
          )}

          {/* Integration Info */}
          <div className="mt-6 bg-emerald-50 rounded-lg p-6 border border-emerald-200">
            <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
              <FaFileInvoiceDollar />
              Muhasebe Yazılımı Entegrasyonları
            </h3>
            <p className="text-sm text-emerald-800 mb-4">
              Logo, Netsis, Mikro ve diğer muhasebe yazılımları ile entegre olun.
            </p>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              Entegrasyon Ayarları
            </button>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Yeni İşlem Ekle</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tarih <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İşlem Tipi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="income">Gelir</option>
                    <option value="expense">Gider</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Örn: Günlük Satış Geliri"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Örn: Satış"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tutar (₺) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ödeme Yöntemi
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Nakit">Nakit</option>
                    <option value="Kredi Kartı">Kredi Kartı</option>
                    <option value="Banka Transferi">Banka Transferi</option>
                    <option value="Otomatik Ödeme">Otomatik Ödeme</option>
                    <option value="Karışık">Karışık</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fatura No
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Örn: INV-2024-001"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                onClick={handleAddTransaction}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">İşlemi Düzenle</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tarih <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İşlem Tipi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="income">Gelir</option>
                    <option value="expense">Gider</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Örn: Günlük Satış Geliri"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Örn: Satış"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tutar (₺) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ödeme Yöntemi
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Nakit">Nakit</option>
                    <option value="Kredi Kartı">Kredi Kartı</option>
                    <option value="Banka Transferi">Banka Transferi</option>
                    <option value="Otomatik Ödeme">Otomatik Ödeme</option>
                    <option value="Karışık">Karışık</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fatura No
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Örn: INV-2024-001"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTransaction(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                onClick={handleUpdateTransaction}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaTrash className="text-red-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">İşlemi Sil</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Bu işlemi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setTransactionToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  İptal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

