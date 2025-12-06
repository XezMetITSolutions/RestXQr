import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export interface Announcement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  priority?: 'low' | 'medium' | 'high';
  isActive?: boolean;
  createdAt?: Date;
}

// Default announcements for fallback
const defaultAnnouncements: Announcement[] = [
  { id: 'wifi', title: 'WiFi Şifresi', description: 'restoran2024', icon: 'wifi' },
  { id: 'promo', title: 'Günün Menüsü', description: 'Bugün özel indirim!', icon: 'star' },
  { id: 'info', title: 'Bilgilendirme', description: 'Mutfak 22:00\'da kapanır', icon: 'info' },
  { id: 'event', title: 'Etkinlik', description: 'Canlı müzik 20:00\'da başlıyor', icon: 'music' },
  { id: 'special', title: 'Özel Menü', description: 'Şef\'in önerisi: Izgara Somon', icon: 'chef' },
  { id: 'payment', title: 'Ödeme', description: 'Kredi kartı ve nakit kabul edilir', icon: 'payment' },
  { id: 'service', title: 'Servis', description: '7/24 servis hizmeti', icon: 'service' },
  { id: 'delivery', title: 'Paket Servis', description: 'Ücretsiz teslimat (min 50₺)', icon: 'delivery' }
];

export function useAnnouncementStore() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements);
  const [loading, setLoading] = useState(false);

  // Backend'den announcements çek (gelecekte implement edilecek)
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        // TODO: Backend API endpoint eklendiğinde aktif et
        // const response = await apiService.getAnnouncements();
        // if (response.success) {
        //   setAnnouncements(response.data);
        // }
      } catch (error) {
        console.log('Announcements API not implemented yet, using defaults');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const addAnnouncement = async (a: Announcement) => {
    try {
      // TODO: Backend API call
      // await apiService.createAnnouncement(a);
      
      // Local update for now
      const updated = [...announcements, a];
      setAnnouncements(updated);
    } catch (error) {
      console.error('Failed to add announcement:', error);
    }
  };

  const updateAnnouncement = async (id: string, patch: Partial<Announcement>) => {
    try {
      // TODO: Backend API call
      // await apiService.updateAnnouncement(id, patch);
      
      // Local update for now
      const updated = announcements.map(a => a.id === id ? { ...a, ...patch } : a);
      setAnnouncements(updated);
    } catch (error) {
      console.error('Failed to update announcement:', error);
    }
  };

  const removeAnnouncement = async (id: string) => {
    try {
      // TODO: Backend API call
      // await apiService.deleteAnnouncement(id);
      
      // Local update for now
      const updated = announcements.filter(a => a.id !== id);
      setAnnouncements(updated);
    } catch (error) {
      console.error('Failed to remove announcement:', error);
    }
  };

  return { announcements, addAnnouncement, updateAnnouncement, removeAnnouncement, loading };
}
