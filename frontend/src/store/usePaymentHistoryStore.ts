import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistOptions } from './storageConfig';
// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 15);

export interface PaymentRecord {
  id: string;
  orderId: string;
  tableNumber: number;
  amount: number;
  method: 'cash' | 'card' | 'mobile';
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  payerName?: string; // Ödeme yapan kişinin adı (opsiyonel)
  timestamp: string;
  isPartial: boolean; // Kısmi ödeme mi?
  remainingAmount?: number; // Kalan tutar
}

interface PaymentHistoryState {
  payments: PaymentRecord[];
  
  // Actions
  addPayment: (payment: Omit<PaymentRecord, 'id' | 'timestamp'>) => string;
  getPaymentsByTable: (tableNumber: number) => PaymentRecord[];
  getPaymentsByOrder: (orderId: string) => PaymentRecord[];
  getTotalPaidForTable: (tableNumber: number) => number;
  getRemainingAmountForTable: (tableNumber: number, totalOrderAmount: number) => number;
  clearPaymentsForTable: (tableNumber: number) => void;
}

const usePaymentHistoryStore = create<PaymentHistoryState>()((set, get) => ({
      payments: [],
      
      addPayment: (payment) => {
        const id = generateId();
        const newPayment: PaymentRecord = {
          ...payment,
          id,
          timestamp: new Date().toISOString(),
        };
        
        set({ payments: [...get().payments, newPayment] });
        return id;
      },
      
      getPaymentsByTable: (tableNumber) => {
        return get().payments
          .filter(payment => payment.tableNumber === tableNumber)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },
      
      getPaymentsByOrder: (orderId) => {
        return get().payments
          .filter(payment => payment.orderId === orderId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },
      
      getTotalPaidForTable: (tableNumber) => {
        return get().payments
          .filter(payment => payment.tableNumber === tableNumber)
          .reduce((total, payment) => total + payment.amount, 0);
      },
      
      getRemainingAmountForTable: (tableNumber, totalOrderAmount) => {
        const totalPaid = get().getTotalPaidForTable(tableNumber);
        return Math.max(0, totalOrderAmount - totalPaid);
      },
      
      clearPaymentsForTable: (tableNumber) => {
        set({ 
          payments: get().payments.filter(payment => payment.tableNumber !== tableNumber) 
        });
      },
}));

export default usePaymentHistoryStore;
