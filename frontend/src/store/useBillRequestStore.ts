import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistOptions } from './storageConfig';
import { BillRequest, Bill, BillItem } from '@/types';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 15);

interface BillRequestState {
  billRequests: BillRequest[];
  bills: Bill[];
  
  // Actions
  createBillRequest: (orderId: string, tableNumber: number, totalAmount: number, requestedBy: 'customer' | 'waiter', waiterId?: string) => string;
  updateBillRequestStatus: (billRequestId: string, status: BillRequest['status'], updatedBy?: string) => void;
  getBillRequestsByStatus: (status: BillRequest['status']) => BillRequest[];
  getBillRequestsByTable: (tableNumber: number) => BillRequest[];
  getBillRequestById: (id: string) => BillRequest | undefined;
  
  // Bill Actions
  generateBill: (billRequestId: string, orderItems: any[], taxRate?: number, serviceCharge?: number) => string;
  updateBillStatus: (billId: string, status: Bill['status'], updatedBy?: string) => void;
  getBillById: (id: string) => Bill | undefined;
  getBillsByTable: (tableNumber: number) => Bill[];
  
  // Cleanup
  clearCompletedRequests: () => void;
  clearOldBills: (daysOld?: number) => void;
}

export const useBillRequestStore = create<BillRequestState>()((set, get) => ({
      billRequests: [],
      bills: [],
      
      // Create bill request
      createBillRequest: (orderId, tableNumber, totalAmount, requestedBy, waiterId) => {
        const id = generateId();
        const newRequest: BillRequest = {
          id,
          orderId,
          tableNumber,
          totalAmount,
          status: 'pending',
          requestedBy,
          requestedAt: new Date(),
          waiterId
        };
        
        set(state => ({
          billRequests: [...state.billRequests, newRequest]
        }));
        
        return id;
      },
      
      // Update bill request status
      updateBillRequestStatus: (billRequestId, status, updatedBy) => {
        set(state => ({
          billRequests: state.billRequests.map(request => 
            request.id === billRequestId 
              ? { 
                  ...request, 
                  status,
                  processedAt: status === 'processing' ? new Date() : request.processedAt,
                  deliveredAt: status === 'delivered' ? new Date() : request.deliveredAt,
                  paidAt: status === 'paid' ? new Date() : request.paidAt,
                  cashierId: updatedBy && status === 'processing' ? updatedBy : request.cashierId,
                  waiterId: updatedBy && status === 'delivered' ? updatedBy : request.waiterId
                }
              : request
          )
        }));
      },
      
      // Get bill requests by status
      getBillRequestsByStatus: (status) => {
        return get().billRequests.filter(request => request.status === status);
      },
      
      // Get bill requests by table
      getBillRequestsByTable: (tableNumber) => {
        return get().billRequests.filter(request => request.tableNumber === tableNumber);
      },
      
      // Get bill request by ID
      getBillRequestById: (id) => {
        return get().billRequests.find(request => request.id === id);
      },
      
      // Generate bill
      generateBill: (billRequestId, orderItems, taxRate = 0.18, serviceCharge = 0) => {
        const billRequest = get().getBillRequestById(billRequestId);
        if (!billRequest) throw new Error('Bill request not found');
        
        const billId = generateId();
        const items: BillItem[] = orderItems.map(item => ({
          id: item.id,
          name: typeof item.name === 'string' ? item.name : item.name.tr,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          category: item.category || 'Ana Yemek'
        }));
        
        const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const taxAmount = subtotal * taxRate;
        const serviceChargeAmount = subtotal * serviceCharge;
        const totalAmount = subtotal + taxAmount + serviceChargeAmount;
        
        const newBill: Bill = {
          id: billId,
          billRequestId,
          orderId: billRequest.orderId,
          tableNumber: billRequest.tableNumber,
          items,
          subtotal,
          taxAmount,
          serviceCharge: serviceChargeAmount,
          tipAmount: 0,
          totalAmount,
          status: 'generated',
          generatedAt: new Date()
        };
        
        set(state => ({
          bills: [...state.bills, newBill]
        }));
        
        // Update bill request status
        get().updateBillRequestStatus(billRequestId, 'ready');
        
        return billId;
      },
      
      // Update bill status
      updateBillStatus: (billId, status, updatedBy) => {
        set(state => ({
          bills: state.bills.map(bill => 
            bill.id === billId 
              ? { 
                  ...bill, 
                  status,
                  printedAt: status === 'printed' ? new Date() : bill.printedAt,
                  deliveredAt: status === 'delivered' ? new Date() : bill.deliveredAt,
                  paidAt: status === 'paid' ? new Date() : bill.paidAt,
                  waiterId: updatedBy && status === 'delivered' ? updatedBy : bill.waiterId,
                  cashierId: updatedBy && status === 'paid' ? updatedBy : bill.cashierId
                }
              : bill
          )
        }));
      },
      
      // Get bill by ID
      getBillById: (id) => {
        return get().bills.find(bill => bill.id === id);
      },
      
      // Get bills by table
      getBillsByTable: (tableNumber) => {
        return get().bills.filter(bill => bill.tableNumber === tableNumber);
      },
      
      // Cleanup completed requests
      clearCompletedRequests: () => {
        set(state => ({
          billRequests: state.billRequests.filter(request => 
            !['paid', 'cancelled'].includes(request.status)
          )
        }));
      },
      
      // Clear old bills
      clearOldBills: (daysOld = 7) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        
        set((state) => ({
          bills: state.bills.filter(bill => 
            new Date(bill.generatedAt).getTime() > cutoffDate.getTime()
          )
        }));
      }
}));

export default useBillRequestStore;
