import { useEffect } from 'react';
import { useBusinessSettingsStore } from '@/store/useBusinessSettingsStore';
import { apiService } from '@/services/api';

// Her restoran için kendi settings'ini yükle/kaydet - PostgreSQL ready
export function useRestaurantSettings(restaurantId: string | undefined) {
  const store = useBusinessSettingsStore();
  
  useEffect(() => {
    if (!restaurantId) return;
    
    const loadSettings = async () => {
      try {
        // TODO: Backend API endpoint eklendiğinde aktif et
        // const response = await apiService.getRestaurantSettings(restaurantId);
        // if (response.success) {
        //   store.updateSettings(response.data.settings || {});
        //   store.updateAccountInfo(response.data.accountInfo || {});
        //   return;
        // }
        
        console.log(`⏳ Settings API not implemented yet, using defaults for restaurant ${restaurantId}`);
      } catch (error) {
        console.error('❌ Failed to load settings from backend:', error);
      }
      
      // Default settings (fallback)
      store.updateSettings({
        businessName: 'Restoran Adı',
        businessType: 'restaurant',
        currency: 'TRY',
        timezone: 'Europe/Istanbul',
        language: 'tr',
        theme: 'light'
      });
    };
    
    loadSettings();
  }, [restaurantId]);
  
  // Settings değiştiğinde backend'e kaydet (debounced)
  useEffect(() => {
    if (!restaurantId) return;
    
    const saveSettings = async () => {
      try {
        // TODO: Backend API endpoint eklendiğinde aktif et
        // await apiService.updateRestaurantSettings(restaurantId, store.settings);
        console.log(`⏳ Settings API not implemented yet for restaurant ${restaurantId}`);
      } catch (error) {
        console.error('❌ Failed to save settings:', error);
      }
    };
    
    const timeoutId = setTimeout(saveSettings, 1000);
    return () => clearTimeout(timeoutId);
  }, [restaurantId, store.settings]);
  
  return store;
}
