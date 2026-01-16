import { apiService } from './api';

export interface Permission {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  locked: boolean;
}

export interface RolePermissions {
  role: string;
  permissions: Permission[];
}

/**
 * Permissions API Service
 * Backend ile yetki yönetimi entegrasyonu için servis
 */
export const permissionsApi = {
  /**
   * Rol için yetkileri yükle
   * @param restaurantId Restoran ID
   * @param role Rol (kitchen, waiter, cashier)
   */
  loadPermissions: async (restaurantId: string, role: string): Promise<Permission[]> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/permissions/${restaurantId}/${role}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('staff_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.permissions || [];
      } else {
        throw new Error(data.message || 'Failed to load permissions');
      }
    } catch (error) {
      console.error(`Error loading ${role} permissions:`, error);
      // Hata durumunda varsayılan izinleri döndür
      return [];
    }
  },
  
  /**
   * Tüm roller için yetkileri yükle
   * @param restaurantId Restoran ID
   */
  loadAllPermissions: async (restaurantId: string): Promise<Record<string, Permission[]>> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/permissions/${restaurantId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('staff_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.permissions || { kitchen: [], waiter: [], cashier: [] };
      } else {
        throw new Error(data.message || 'Failed to load permissions');
      }
    } catch (error) {
      console.error('Error loading all permissions:', error);
      // Hata durumunda boş izinleri döndür
      return { kitchen: [], waiter: [], cashier: [] };
    }
  },
  
  /**
   * Rol için yetkileri güncelle
   * @param restaurantId Restoran ID
   * @param role Rol (kitchen, waiter, cashier)
   * @param permissions Güncellenecek izinler
   */
  updatePermissions: async (restaurantId: string, role: string, permissions: Permission[]): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/permissions/${restaurantId}/${role}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('staff_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return true;
      } else {
        throw new Error(data.message || 'Failed to update permissions');
      }
    } catch (error) {
      console.error(`Error updating ${role} permissions:`, error);
      return false;
    }
  },
  
  /**
   * Tüm roller için yetkileri güncelle
   * @param restaurantId Restoran ID
   * @param permissions Tüm roller için güncellenecek izinler
   */
  updateAllPermissions: async (restaurantId: string, permissions: Record<string, Permission[]>): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/permissions/${restaurantId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('staff_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return true;
      } else {
        throw new Error(data.message || 'Failed to update permissions');
      }
    } catch (error) {
      console.error('Error updating all permissions:', error);
      return false;
    }
  }
};
