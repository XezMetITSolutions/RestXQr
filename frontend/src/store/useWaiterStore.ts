import { create } from 'zustand';
// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 15);

export interface WaiterRequest {
  id: string;
  type: 'water' | 'bill' | 'clean' | 'help' | 'custom';
  message?: string;
  timestamp: number;
  status: 'pending' | 'acknowledged' | 'completed';
  tableNumber: number;
}

interface WaiterState {
  requests: WaiterRequest[];
  tableNumber: number;
  
  // Actions
  addRequest: (type: WaiterRequest['type'], message?: string) => void;
  updateRequestStatus: (id: string, status: WaiterRequest['status']) => void;
  removeRequest: (id: string) => void;
  clearRequests: () => void;
  setTableNumber: (tableNumber: number) => void;
  
  // Computed values
  getPendingRequests: () => WaiterRequest[];
  getActiveRequests: () => WaiterRequest[];
}

const useWaiterStore = create<WaiterState>()((set, get) => ({
      requests: [],
      tableNumber: 5, // Default table number
      
      addRequest: (type, message) => {
        const newRequest: WaiterRequest = {
          id: generateId(),
          type,
          message: type === 'custom' ? message : undefined,
          timestamp: Date.now(),
          status: 'pending',
          tableNumber: get().tableNumber,
        };
        
        set({ requests: [...get().requests, newRequest] });
      },
      
      updateRequestStatus: (id, status) => {
        const updatedRequests = get().requests.map(request => 
          request.id === id ? { ...request, status } : request
        );
        
        set({ requests: updatedRequests });
      },
      
      removeRequest: (id) => {
        set({ requests: get().requests.filter(request => request.id !== id) });
      },
      
      clearRequests: () => {
        set({ requests: [] });
      },
      
      setTableNumber: (tableNumber) => {
        set({ tableNumber });
      },
      
      getPendingRequests: () => {
        return get().requests.filter(request => request.status === 'pending');
      },
      
      getActiveRequests: () => {
        return get().requests.filter(request => 
          request.status === 'pending' || request.status === 'acknowledged'
        );
      },
}));

export default useWaiterStore;
