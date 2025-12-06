'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaHeadset, 
  FaEnvelope, 
  FaPhone, 
  FaBuilding, 
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaTrash,
  FaEye
} from 'react-icons/fa';

interface SupportTicket {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export default function AdminSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/support`);
      const data = await response.json();
      
      if (data.success) {
        setTickets(data.data || []);
      }
    } catch (error) {
      console.error('Destek talepleri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: 'pending' | 'in-progress' | 'resolved') => {
    try {
      const response = await fetch(`${API_URL}/support/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (data.success) {
        fetchTickets();
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
    }
  };

  const deleteTicket = async (ticketId: string) => {
    if (!confirm('Bu destek talebini silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`${API_URL}/support/${ticketId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        fetchTickets();
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error('Talep silinemedi:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'in-progress': return 'İşlemde';
      case 'resolved': return 'Çözüldü';
      default: return status;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-orange-100 text-orange-700';
      case 'low':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AdminLayout title="Destek Talepleri">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Destek Talepleri</h1>
              <p className="text-gray-600 mt-1">Restoranlardan gelen destek taleplerini yönetin</p>
            </div>
            <button
              onClick={fetchTickets}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaSpinner className={loading ? 'animate-spin' : ''} />
              Yenile
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam</p>
                  <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
                </div>
                <FaHeadset className="text-3xl text-gray-400" />
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700">Beklemede</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {tickets.filter(t => t.status === 'pending').length}
                  </p>
                </div>
                <FaExclamationCircle className="text-3xl text-yellow-500" />
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">İşlemde</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {tickets.filter(t => t.status === 'in-progress').length}
                  </p>
                </div>
                <FaSpinner className="text-3xl text-blue-500" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Çözüldü</p>
                  <p className="text-2xl font-bold text-green-900">
                    {tickets.filter(t => t.status === 'resolved').length}
                  </p>
                </div>
                <FaCheckCircle className="text-3xl text-green-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {['all', 'pending', 'in-progress', 'resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {f === 'all' ? 'Tümü' : getStatusText(f)}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaHeadset className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Destek talebi yok</h3>
            <p className="text-gray-500">Henüz destek talebi bulunmuyor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{ticket.subject}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(ticket.status)}`}>
                        {getStatusText(ticket.status)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority === 'high' ? 'Yüksek' : ticket.priority === 'medium' ? 'Orta' : 'Düşük'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <FaBuilding />
                        <span>{ticket.restaurantName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaEnvelope />
                        <span>{ticket.email}</span>
                      </div>
                      {ticket.phone && (
                        <div className="flex items-center gap-1">
                          <FaPhone />
                          <span>{ticket.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <FaClock />
                        <span>{new Date(ticket.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 line-clamp-2">{ticket.message}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Detayları Gör"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => deleteTicket(ticket.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Sil"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-purple-600 text-white p-6 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTicket.subject}</h2>
                    <p className="text-purple-100">{selectedTicket.restaurantName}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-white hover:bg-purple-700 p-2 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* İletişim Bilgileri */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">İletişim Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-gray-400" />
                      <span>{selectedTicket.email}</span>
                    </div>
                    {selectedTicket.phone && (
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-400" />
                        <span>{selectedTicket.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FaClock className="text-gray-400" />
                      <span>{new Date(selectedTicket.createdAt).toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                </div>

                {/* Mesaj */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Mesaj</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.message}</p>
                  </div>
                </div>

                {/* Durum Güncelleme */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Durum Güncelle</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'pending')}
                      className={`py-3 rounded-lg font-semibold transition-colors ${
                        selectedTicket.status === 'pending'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      Beklemede
                    </button>
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'in-progress')}
                      className={`py-3 rounded-lg font-semibold transition-colors ${
                        selectedTicket.status === 'in-progress'
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      İşlemde
                    </button>
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                      className={`py-3 rounded-lg font-semibold transition-colors ${
                        selectedTicket.status === 'resolved'
                          ? 'bg-green-500 text-white'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      Çözüldü
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}


