'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaChartLine,
  FaUtensils,
  FaUsers,
  FaShoppingCart,
  FaQrcode,
  FaCog,
  FaSignOutAlt,
  FaTimes,
  FaBars,
  FaHeadset,
  FaPlus,
  FaTicketAlt,
  FaQuestionCircle,
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import BusinessSidebar from '@/components/BusinessSidebar';

interface SupportTicket {
  id: number;
  subject: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  createdAt: string;
  updatedAt: string;
  responses?: { message: string; from: string; time: string }[];
}

export default function SupportPage() {
  const router = useRouter();
  const { authenticatedRestaurant, authenticatedStaff, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'tickets' | 'faq' | 'contact'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const displayName = authenticatedRestaurant?.name || authenticatedStaff?.name || 'Kullanıcı';
  const displayEmail = authenticatedRestaurant?.email || authenticatedStaff?.email || '';

  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'technical',
    priority: 'normal' as const,
    description: ''
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Destek talepleri her restoran için ayrı (boş başla, Kardeşler için demo yüklenecek)
  useEffect(() => {
    // Eğer Kardeşler restoranı ise demo ticket verilerini ekle
    if (authenticatedRestaurant?.name.toLowerCase().includes('kardeşler') || 
        authenticatedRestaurant?.name.toLowerCase().includes('kardesler')) {
      const demoTickets: SupportTicket[] = [
      {
        id: 1,
        subject: 'QR Kod Tarama Sorunu',
        category: 'technical',
        priority: 'high',
        status: 'in_progress',
        description: 'Müşteriler QR kodu taradığında menü açılmıyor.',
        createdAt: '2024-01-15 10:30',
        updatedAt: '2024-01-15 14:20',
        responses: [
          { message: 'Sorununuzu inceliyoruz, kısa süre içinde dönüş yapacağız.', from: 'Destek Ekibi', time: '2024-01-15 11:00' }
        ]
      },
      {
        id: 2,
        subject: 'Fatura Bilgilerinde Hata',
        category: 'billing',
        priority: 'normal',
        status: 'resolved',
        description: 'Geçen ayki faturada yanlış tutar gözüküyor.',
        createdAt: '2024-01-10 09:15',
        updatedAt: '2024-01-12 16:45',
        responses: [
          { message: 'Fatura düzeltildi ve yeni fatura gönderildi.', from: 'Mali İşler', time: '2024-01-12 16:45' }
        ]
      }
      ];
      setTickets(demoTickets);
    }
    // Diğer restoranlar boş başlar
  }, [authenticatedRestaurant]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      alert('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
      
      const response = await fetch(`${API_URL}/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          restaurantId: authenticatedRestaurant?.id,
          name: displayName,
          email: displayEmail,
          phone: authenticatedRestaurant?.phone || '',
          subject: newTicket.subject,
          message: newTicket.description,
          priority: newTicket.priority
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Destek talebiniz başarıyla gönderildi! En kısa sürede size dönüş yapılacaktır.');
        setShowNewTicketModal(false);
        setNewTicket({
          subject: '',
          category: 'technical',
          priority: 'normal',
          description: ''
        });
      } else {
        alert('❌ Hata: ' + data.message);
      }
    } catch (error) {
      console.error('Destek talebi oluşturulamadı:', error);
      alert('❌ Destek talebi gönderilirken bir hata oluştu!');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Açık';
      case 'in_progress': return 'İşlemde';
      case 'resolved': return 'Çözüldü';
      case 'closed': return 'Kapalı';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Acil';
      case 'high': return 'Yüksek';
      case 'normal': return 'Normal';
      case 'low': return 'Düşük';
      default: return priority;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'technical': return 'Teknik Destek';
      case 'billing': return 'Fatura/Ödeme';
      case 'feature': return 'Özellik Talebi';
      case 'other': return 'Diğer';
      default: return category;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const faqItems = [
    {
      question: 'QR kod nasıl oluşturulur?',
      answer: 'QR Kodlar sayfasından "Yeni QR Kod" butonuna tıklayarak QR kod oluşturabilirsiniz. Masa numarasını girin ve QR kod otomatik olarak oluşturulacaktır.'
    },
    {
      question: 'Menüye nasıl yeni ürün eklerim?',
      answer: 'Menü Yönetimi sayfasından önce bir kategori seçin, ardından "Yeni Ürün Ekle" butonuna tıklayın. Ürün bilgilerini girin ve kaydedin.'
    },
    {
      question: 'Personel girişi nasıl yapılır?',
      answer: 'Personel sayfasından her personel için kullanıcı adı ve şifre oluşturabilirsiniz. Personeller bu bilgilerle giriş yapıp kendi panellerine erişebilir.'
    },
    {
      question: 'Siparişleri nasıl takip ederim?',
      answer: 'Siparişler sayfasından tüm siparişleri görebilir, durum güncelleyebilir ve sipariş detaylarını inceleyebilirsiniz.'
    },
    {
      question: 'Destek ekibine nasıl ulaşabilirim?',
      answer: 'Bu sayfadan destek talebi oluşturabilir, e-posta gönderebilir veya WhatsApp üzerinden bize ulaşabilirsiniz.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="ml-0 lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <FaBars className="text-gray-600" />
              </button>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Destek Merkezi</h2>
                <p className="text-sm text-gray-500 mt-1">Size nasıl yardımcı olabiliriz?</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <FaPlus />
              Yeni Talep
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeTab === 'tickets'
                  ? 'border-purple-600 text-purple-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaTicketAlt className="inline mr-2" />
              Destek Taleplerim
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeTab === 'faq'
                  ? 'border-purple-600 text-purple-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaQuestionCircle className="inline mr-2" />
              Sıkça Sorulan Sorular
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeTab === 'contact'
                  ? 'border-purple-600 text-purple-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaEnvelope className="inline mr-2" />
              İletişim
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div>
              {/* Filters */}
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Talep ara..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaFilter className="text-gray-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">Tüm Durumlar</option>
                      <option value="open">Açık</option>
                      <option value="in_progress">İşlemde</option>
                      <option value="resolved">Çözüldü</option>
                      <option value="closed">Kapalı</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-4">
                {filteredTickets.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <FaTicketAlt className="text-5xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz destek talebiniz bulunmuyor</p>
                    <button
                      onClick={() => setShowNewTicketModal(true)}
                      className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      İlk Talebinizi Oluşturun
                    </button>
                  </div>
                ) : (
                  filteredTickets.map(ticket => (
                    <div key={ticket.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {ticket.subject}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {getStatusText(ticket.status)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                              {getPriorityText(ticket.priority)}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {getCategoryText(ticket.category)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">#{ticket.id}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            <FaClock className="inline mr-1" />
                            {ticket.createdAt}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{ticket.description}</p>
                      
                      {ticket.responses && ticket.responses.length > 0 && (
                        <div className="border-t pt-4 mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            <FaCheckCircle className="inline text-green-500 mr-1" />
                            Son Yanıt:
                          </p>
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700">{ticket.responses[0].message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {ticket.responses[0].from} • {ticket.responses[0].time}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaQuestionCircle className="text-purple-600" />
                    {item.question}
                  </h3>
                  <p className="text-gray-600 pl-7">{item.answer}</p>
                </div>
              ))}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaEnvelope className="text-3xl text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">E-posta</h3>
                <p className="text-gray-600 mb-4">destek@masapp.com</p>
                <p className="text-sm text-gray-500">Yanıt süresi: 24 saat içinde</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaWhatsapp className="text-3xl text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">WhatsApp</h3>
                <p className="text-gray-600 mb-4">+90 532 123 45 67</p>
                <p className="text-sm text-gray-500">Mesai saatleri: 09:00-18:00</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaPhone className="text-3xl text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Telefon</h3>
                <p className="text-gray-600 mb-4">0850 123 45 67</p>
                <p className="text-sm text-gray-500">7/24 Destek Hattı</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Yeni Destek Talebi</h3>
                <button
                  onClick={() => setShowNewTicketModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konu *
                  </label>
                  <input
                    type="text"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Sorun veya talebinizin konusu"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="technical">Teknik Destek</option>
                      <option value="billing">Fatura/Ödeme</option>
                      <option value="feature">Özellik Talebi</option>
                      <option value="other">Diğer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Öncelik *
                    </label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as any})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="low">Düşük</option>
                      <option value="normal">Normal</option>
                      <option value="high">Yüksek</option>
                      <option value="urgent">Acil</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Sorununuzu veya talebinizi detaylı bir şekilde açıklayın..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowNewTicketModal(false)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleCreateTicket}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                  >
                    <FaTicketAlt />
                    Talep Oluştur
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

