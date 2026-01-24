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

        await store.fetchSettings();
        return;
      } catch (error) {
        console.error('❌ Failed to load settings from backend:', error);
      }

      // Default settings (fallback)
      store.updateBasicInfo({
        name: 'Restoran Adı',
        businessType: 'restaurant'
      });
      store.updateMenuSettings({
        defaultLanguage: 'tr'
      });
    };
    
    loadSettings();
  }, [restaurantId, store]);
  
  // Settings değiştiğinde backend'e kaydet (debounced)
  useEffect(() => {
    if (!restaurantId) return;
    
    const saveSettings = async () => {
      try {
        // TODO: Backend API endpoint eklendiğinde aktif et
        // await apiService.updateRestaurantSettings(restaurantId, store.settings);
        await store.saveSettings();
      } catch (error) {
        console.error('❌ Failed to save settings:', error);
      }
    };
    
    const timeoutId = setTimeout(saveSettings, 1000);
    return () => clearTimeout(timeoutId);
  }, [restaurantId, store, store.settings]);
  
  return store;
}
