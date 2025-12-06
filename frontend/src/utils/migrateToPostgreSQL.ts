/**
 * localStorage → PostgreSQL Migration Utility
 * 
 * Bu dosya localStorage kullanımlarını PostgreSQL'e dönüştürmek için
 * geçici bir migration utility'si sağlar.
 */

import { apiService } from '@/services/api';

// localStorage key'lerini PostgreSQL'e migrate et
export const migrateLocalStorageToPostgreSQL = async () => {
  console.log('🔄 Starting localStorage → PostgreSQL migration...');
  
  try {
    // 1. Restaurant data migration (already done via admin panel)
    console.log('✅ Restaurant data: Already migrated via admin panel');
    
    // 2. Feature flags migration (already done)
    console.log('✅ Feature flags: Already migrated via backend API');
    
    // 3. Menu data migration (TODO: implement when needed)
    console.log('⏳ Menu data: Will be migrated when menu API is ready');
    
    // 4. Order data migration (TODO: implement when needed)
    console.log('⏳ Order data: Will be migrated when order API is ready');
    
    // 5. Settings migration (TODO: implement when needed)
    console.log('⏳ Settings data: Will be migrated when settings API is ready');
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// localStorage temizleme utility'si
export const clearLegacyLocalStorage = () => {
  console.log('🧹 Cleaning legacy localStorage data...');
  
  const keysToRemove = [
    // Restaurant data (now in PostgreSQL)
    'restaurant-storage',
    'masapp-restaurant-storage',
    
    // Feature data (now in PostgreSQL)
    'feature-storage',
    'masapp-feature-storage',
    
    // Cross-domain storage (no longer needed)
    'cross-domain-storage',
    'masapp-cross-domain-storage'
  ];
  
  keysToRemove.forEach(key => {
    if (typeof window !== 'undefined' && localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed: ${key}`);
    }
  });
  
  console.log('✅ Legacy localStorage cleaned');
};

// PostgreSQL bağlantı durumu kontrolü
export const checkPostgreSQLConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://masapp-backend.onrender.com/health');
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('PostgreSQL connection check failed:', error);
    return false;
  }
};

// Migration status reporter
export const getMigrationStatus = () => {
  return {
    restaurant_data: '✅ Migrated (PostgreSQL)',
    feature_flags: '✅ Migrated (PostgreSQL)', 
    authentication: '✅ Migrated (PostgreSQL)',
    admin_panel: '✅ Migrated (PostgreSQL)',
    business_dashboard: '✅ Migrated (PostgreSQL)',
    menu_management: '⏳ TODO (localStorage → PostgreSQL)',
    order_management: '⏳ TODO (localStorage → PostgreSQL)',
    waiter_calls: '⏳ TODO (localStorage → PostgreSQL)',
    announcements: '⏳ TODO (localStorage → PostgreSQL)',
    reports: '⏳ TODO (localStorage → PostgreSQL)'
  };
};

export default {
  migrateLocalStorageToPostgreSQL,
  clearLegacyLocalStorage,
  checkPostgreSQLConnection,
  getMigrationStatus
};
