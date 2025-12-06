import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QRCodeData {
  id: string;
  name: string;
  type: 'table' | 'general' | 'custom';
  tableNumber?: number;
  restaurantId: string;
  token: string;
  qrCode: string;
  url: string;
  createdAt: string;
  theme: string;
  isActive: boolean;
  scanCount: number;
  description: string;
}

interface QRState {
  qrCodes: QRCodeData[];
  activeTableSession: {
    restaurantId: string;
    tableNumber: number;
    sessionId: string;
  } | null;
  
  // QR Actions
  setQRCodes: (codes: QRCodeData[]) => void;
  generateQRCodes: (restaurantId: string, restaurantSlug: string, tableCount: number) => QRCodeData[];
  activateQRCode: (id: string) => void;
  deactivateQRCode: (id: string) => void;
  clearQRCodes: () => void;
  
  // Session Actions
  startTableSession: (restaurantId: string, tableNumber: number) => void;
  endTableSession: () => void;
}

export const useQRStore = create<QRState>()(
  persist(
    (set, get) => ({
      qrCodes: [],
      activeTableSession: null,
      
      setQRCodes: (codes) => {
        set({ qrCodes: codes });
      },
      
      clearQRCodes: () => {
        set({ qrCodes: [] });
      },
      
      generateQRCodes: (restaurantId, restaurantSlug, tableCount) => {
        const codes: QRCodeData[] = [];
        
        for (let i = 1; i <= tableCount; i++) {
          const code: QRCodeData = {
            id: `qr_${restaurantId}_table_${i}_${Date.now()}`,
            name: `Masa ${i}`,
            type: 'table',
            tableNumber: i,
            restaurantId,
            token: `MASAPP_${restaurantId}_T${i}`,
            qrCode: '',
            url: `https://masapp.com/r/${restaurantSlug}/masa/${i}`,
            isActive: true,
            scanCount: 0,
            theme: 'default',
            description: `Masa ${i} için QR kod`,
            createdAt: new Date().toISOString()
          };
          codes.push(code);
        }
        
        set((state) => ({
          qrCodes: [...state.qrCodes, ...codes]
        }));
        
        return codes;
      },
      
      activateQRCode: (id) => set((state) => ({
        qrCodes: state.qrCodes.map(qr => 
          qr.id === id ? { ...qr, isActive: true } : qr
        )
      })),
      
      deactivateQRCode: (id) => set((state) => ({
        qrCodes: state.qrCodes.map(qr => 
          qr.id === id ? { ...qr, isActive: false } : qr
        )
      })),
      
      startTableSession: (restaurantId, tableNumber) => {
        const sessionId = `session_${restaurantId}_${tableNumber}_${Date.now()}`;
        set({
          activeTableSession: {
            restaurantId,
            tableNumber,
            sessionId,
          }
        });
      },
      
      endTableSession: () => set({ activeTableSession: null })
    }),
    {
      name: 'qr-storage',
      partialize: (state) => ({ qrCodes: state.qrCodes })
    }
  )
);
