import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistOptions } from './storageConfig';
// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 15);
import { CartItem } from './useCartStore';

export interface Order {
  id: string;
  items: CartItem[];
  tableNumber: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid';
  timestamp: number;
  total: number;
  tipAmount: number;
  supportAmount: number;
  discount: number;
  subtotal: number;
  couponCode: string | null;
  paymentMethod?: 'card' | 'cash' | 'mobile';
}

interface OrderState {
  orders: Order[];
  
  // Actions
  addOrder: (order: Omit<Order, 'id' | 'timestamp'>) => string;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  setPaymentMethod: (id: string, method: Order['paymentMethod']) => void;
  
  // Computed values
  getOrdersByStatus: (status: Order['status']) => Order[];
  getOrdersByTable: (tableNumber: number) => Order[];
  getActiveOrders: () => Order[];
  getRecentOrders: (limit?: number) => Order[];
}

const useOrderStore = create<OrderState>()((set, get) => ({
      orders: [],
      
      addOrder: (order) => {
        const id = generateId();
        const newOrder: Order = {
          ...order,
          id,
          timestamp: Date.now(),
        };
        
        set({ orders: [...get().orders, newOrder] });
        return id;
      },
      
      updateOrderStatus: (id, status) => {
        const updatedOrders = get().orders.map(order => 
          order.id === id ? { ...order, status } : order
        );
        
        set({ orders: updatedOrders });
      },
      
      setPaymentMethod: (id, method) => {
        const updatedOrders = get().orders.map(order => 
          order.id === id ? { ...order, paymentMethod: method } : order
        );
        
        set({ orders: updatedOrders });
      },
      
      getOrdersByStatus: (status) => {
        return get().orders.filter(order => order.status === status);
      },
      
      getOrdersByTable: (tableNumber) => {
        return get().orders.filter(order => order.tableNumber === tableNumber);
      },
      
      getActiveOrders: () => {
        return get().orders.filter(order => 
          order.status === 'pending' || 
          order.status === 'preparing' || 
          order.status === 'ready'
        );
      },
      
      getRecentOrders: (limit = 10) => {
        return [...get().orders]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
      },
}));

export default useOrderStore;
