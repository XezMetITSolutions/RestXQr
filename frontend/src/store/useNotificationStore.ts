import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistOptions } from './storageConfig';
// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 15);
import { Notification, UserRole } from '@/types';

interface NotificationState {
  notifications: Notification[];
  
  // Actions
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'status'>) => string;
  markAsRead: (notificationId: string, userId: string) => void;
  markAsAcknowledged: (notificationId: string, userId: string) => void;
  markAllAsRead: (userId: string) => void;
  getNotificationsByRole: (role: UserRole) => Notification[];
  getActiveNotifications: (role?: UserRole) => Notification[];
  getUnreadCount: (role?: UserRole) => number;
  clearOldNotifications: (daysOld?: number) => void;
  deleteNotification: (notificationId: string) => void;
  
  // Specific notification types
  createBillRequestNotification: (tableNumber: number, orderId: string, billRequestId: string) => string;
  createBillReadyNotification: (tableNumber: number, orderId: string, billRequestId: string) => string;
  createPaymentCompletedNotification: (tableNumber: number, orderId: string, amount: number) => string;
  createWaiterCallNotification: (tableNumber: number, message?: string) => string;
  createWaterRequestNotification: (tableNumber: number) => string;
  createCleanRequestNotification: (tableNumber: number) => string;
  createTableTransferNotification: (orderId: string, oldTable: number, newTable: number) => string;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
      notifications: [],
      
      // Create notification
      createNotification: (notificationData) => {
        const id = generateId();
        const newNotification: Notification = {
          ...notificationData,
          id,
          status: 'unread',
          createdAt: new Date(),
          isActive: true
        };
        
        set(state => ({
          notifications: [...state.notifications, newNotification]
        }));
        
        return id;
      },
      
      // Mark as read
      markAsRead: (notificationId, userId) => {
        set(state => ({
          notifications: state.notifications.map(notification => 
            notification.id === notificationId 
              ? { 
                  ...notification, 
                  status: 'read',
                  readAt: new Date()
                }
              : notification
          )
        }));
      },
      
      // Mark as acknowledged
      markAsAcknowledged: (notificationId, userId) => {
        set(state => ({
          notifications: state.notifications.map(notification => 
            notification.id === notificationId 
              ? { 
                  ...notification, 
                  status: 'acknowledged',
                  acknowledgedAt: new Date(),
                  acknowledgedBy: userId
                }
              : notification
          )
        }));
      },
      
      // Mark all as read
      markAllAsRead: (userId) => {
        set(state => ({
          notifications: state.notifications.map(notification => 
            notification.status === 'unread'
              ? { 
                  ...notification, 
                  status: 'read',
                  readAt: new Date()
                }
              : notification
          )
        }));
      },
      
      // Get notifications by role
      getNotificationsByRole: (role) => {
        return get().notifications.filter(notification => 
          notification.targetRole.includes(role)
        );
      },
      
      // Get active notifications
      getActiveNotifications: (role) => {
        const notifications = role 
          ? get().getNotificationsByRole(role)
          : get().notifications;
          
        return notifications.filter(notification => 
          notification.isActive && notification.status !== 'acknowledged'
        );
      },
      
      // Get unread count
      getUnreadCount: (role) => {
        const notifications = role 
          ? get().getNotificationsByRole(role)
          : get().notifications;
          
        return notifications.filter(notification => 
          notification.status === 'unread' && notification.isActive
        ).length;
      },
      
      // Clear old notifications
      clearOldNotifications: (daysOld = 7) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        
        set(state => ({
          notifications: state.notifications.filter(notification => 
            new Date(notification.createdAt) > cutoffDate
          )
        }));
      },
      
      // Delete notification
      deleteNotification: (notificationId) => {
        set(state => ({
          notifications: state.notifications.filter(notification => 
            notification.id !== notificationId
          )
        }));
      },
      
      // Create bill request notification
      createBillRequestNotification: (tableNumber, orderId, billRequestId) => {
        return get().createNotification({
          type: 'bill_request',
          title: 'Hesap Talebi',
          message: `Masa ${tableNumber} hesap istiyor`,
          tableNumber,
          orderId,
          billRequestId,
          priority: 'high',
          targetRole: ['waiter', 'cashier'],
          isActive: true
        });
      },
      
      // Create bill ready notification
      createBillReadyNotification: (tableNumber, orderId, billRequestId) => {
        return get().createNotification({
          type: 'bill_ready',
          title: 'Fatura Hazır',
          message: `Masa ${tableNumber} faturası hazır`,
          tableNumber,
          orderId,
          billRequestId,
          priority: 'medium',
          targetRole: ['waiter'],
          isActive: true
        });
      },
      
      // Create payment completed notification
      createPaymentCompletedNotification: (tableNumber, orderId, amount) => {
        return get().createNotification({
          type: 'payment_completed',
          title: 'Ödeme Tamamlandı',
          message: `Masa ${tableNumber} ödemesi alındı - ${amount.toFixed(2)}₺`,
          tableNumber,
          orderId,
          priority: 'low',
          targetRole: ['cashier', 'waiter'],
          isActive: true
        });
      },
      
      // Create waiter call notification
      createWaiterCallNotification: (tableNumber, message) => {
        return get().createNotification({
          type: 'waiter_call',
          title: 'Garson Çağrısı',
          message: message || `Masa ${tableNumber} garson istiyor`,
          tableNumber,
          priority: 'high',
          targetRole: ['waiter'],
          isActive: true
        });
      },
      
      // Create water request notification
      createWaterRequestNotification: (tableNumber) => {
        return get().createNotification({
          type: 'water_request',
          title: 'Su İsteği',
          message: `Masa ${tableNumber} su istiyor`,
          tableNumber,
          priority: 'medium',
          targetRole: ['waiter'],
          isActive: true
        });
      },
      
      // Create clean request notification
      createCleanRequestNotification: (tableNumber) => {
        return get().createNotification({
          type: 'clean_request',
          title: 'Masa Temizleme',
          message: `Masa ${tableNumber} temizlenmek istiyor`,
          tableNumber,
          priority: 'low',
          targetRole: ['waiter'],
          isActive: true
        });
      },
      
      // Create table transfer notification
      createTableTransferNotification: (orderId, oldTable, newTable) => {
        return get().createNotification({
          type: 'table_transfer',
          title: 'Masa Değişikliği',
          message: `Sipariş ${oldTable} numaralı masadan ${newTable} numaralı masaya taşındı`,
          tableNumber: newTable,
          orderId,
          priority: 'medium',
          targetRole: ['cashier', 'waiter'],
          isActive: true
        });
      }
}));

export default useNotificationStore;