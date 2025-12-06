import { create } from 'zustand';

export interface SalesReport {
  date: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalTables: number;
  averageTableTime: number; // dakika cinsinden
}

export interface ProductSalesReport {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

export interface TableReport {
  tableNumber: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  averageTableTime: number;
  lastOrderTime: string;
}

interface ReportsState {
  salesReports: SalesReport[];
  productReports: ProductSalesReport[];
  tableReports: TableReport[];
  
  // Actions
  generateDailyReport: (date: string) => SalesReport;
  generateProductReport: (startDate: string, endDate: string) => ProductSalesReport[];
  generateTableReport: (startDate: string, endDate: string) => TableReport[];
  getTopSellingProducts: (limit?: number) => ProductSalesReport[];
  getSalesByDateRange: (startDate: string, endDate: string) => SalesReport[];
  clearReports: () => void;
}

const useReportsStore = create<ReportsState>()((set, get) => ({
      salesReports: [],
      productReports: [],
      tableReports: [],
      
      generateDailyReport: (date: string) => {
        // LocalStorage'dan siparişleri al
        const orders = JSON.parse(localStorage.getItem('waiter_orders') || '[]');
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        
        // Belirli tarihteki siparişleri filtrele
        const targetDate = new Date(date);
        const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
        const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));
        
        const dayOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.timestamp);
          return orderDate >= dayStart && orderDate <= dayEnd;
        });
        
        const dayPayments = payments.filter((payment: any) => {
          const paymentDate = new Date(payment.timestamp);
          return paymentDate >= dayStart && paymentDate <= dayEnd;
        });
        
        // Hesaplamalar
        const totalSales = dayPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
        const totalOrders = dayOrders.length;
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
        
        // Masa sayısı ve ortalama masa süresi hesaplama
        const uniqueTables = new Set(dayOrders.map((order: any) => order.tableNumber));
        const totalTables = uniqueTables.size;
        
        // Ortalama masa süresi hesaplama (basit yaklaşım)
        let totalTableTime = 0;
        let tableCount = 0;
        
        uniqueTables.forEach(tableNumber => {
          const tableOrders = dayOrders.filter((order: any) => order.tableNumber === tableNumber);
          if (tableOrders.length > 0) {
            const firstOrder = tableOrders.reduce((earliest: any, order: any) => 
              order.timestamp < earliest.timestamp ? order : earliest
            );
            const lastOrder = tableOrders.reduce((latest: any, order: any) => 
              order.timestamp > latest.timestamp ? order : latest
            );
            
            const tableTime = (lastOrder.timestamp - firstOrder.timestamp) / (1000 * 60); // dakika
            totalTableTime += tableTime;
            tableCount++;
          }
        });
        
        const averageTableTime = tableCount > 0 ? totalTableTime / tableCount : 0;
        
        const report: SalesReport = {
          date,
          totalSales,
          totalOrders,
          averageOrderValue,
          totalTables,
          averageTableTime: Math.round(averageTableTime)
        };
        
        // Raporu kaydet
        set(state => ({
          salesReports: [...state.salesReports.filter(r => r.date !== date), report]
        }));
        
        return report;
      },
      
      generateProductReport: (startDate: string, endDate: string) => {
        const orders = JSON.parse(localStorage.getItem('waiter_orders') || '[]');
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Tarih aralığındaki siparişleri filtrele
        const filteredOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.timestamp);
          return orderDate >= start && orderDate <= end;
        });
        
        // Ürün bazında satış verilerini topla
        const productMap = new Map<string, ProductSalesReport>();
        
        filteredOrders.forEach((order: any) => {
          order.items.forEach((item: any) => {
            const key = item.itemId || item.name;
            const existing = productMap.get(key) || {
              productId: item.itemId || item.name,
              productName: item.name,
              totalQuantity: 0,
              totalRevenue: 0,
              orderCount: 0
            };
            
            existing.totalQuantity += item.quantity;
            existing.totalRevenue += item.price * item.quantity;
            existing.orderCount += 1;
            
            productMap.set(key, existing);
          });
        });
        
        const productReports = Array.from(productMap.values())
          .sort((a, b) => b.totalRevenue - a.totalRevenue);
        
        set({ productReports });
        return productReports;
      },
      
      generateTableReport: (startDate: string, endDate: string) => {
        const orders = JSON.parse(localStorage.getItem('waiter_orders') || '[]');
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Tarih aralığındaki siparişleri filtrele
        const filteredOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.timestamp);
          return orderDate >= start && orderDate <= end;
        });
        
        // Masa bazında verileri topla
        const tableMap = new Map<number, TableReport>();
        
        filteredOrders.forEach((order: any) => {
          const tableNumber = order.tableNumber;
          const existing = tableMap.get(tableNumber) || {
            tableNumber,
            totalOrders: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            averageTableTime: 0,
            lastOrderTime: ''
          };
          
          existing.totalOrders += 1;
          existing.totalRevenue += order.totalAmount || 0;
          existing.lastOrderTime = new Date(order.timestamp).toISOString();
          
          tableMap.set(tableNumber, existing);
        });
        
        // Ortalama değerleri hesapla
        const tableReports = Array.from(tableMap.values()).map(table => ({
          ...table,
          averageOrderValue: table.totalOrders > 0 ? table.totalRevenue / table.totalOrders : 0
        }));
        
        set({ tableReports });
        return tableReports;
      },
      
      getTopSellingProducts: (limit = 10) => {
        return get().productReports.slice(0, limit);
      },
      
      getSalesByDateRange: (startDate: string, endDate: string) => {
        return get().salesReports.filter(report => {
          const reportDate = new Date(report.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return reportDate >= start && reportDate <= end;
        });
      },
      
      clearReports: () => {
        set({ salesReports: [], productReports: [], tableReports: [] });
      }
}));

export default useReportsStore;
