import { useEffect, useCallback } from 'react';
import { useBusinessSettingsStore } from '@/store/useBusinessSettingsStore';
import { apiService } from '@/services/api';

// Her restoran için kendi settings'ini yükle/kaydet - PostgreSQL ready
export function useRestaurantSettings(restaurantId: string | undefined) {
  const store = useBusinessSettingsStore();

  useEffect(() => {
    if (!restaurantId) return;

    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout

    const loadSettings = async () => {
      try {
        // Get store actions directly to avoid dependency issues
        const storeActions = useBusinessSettingsStore.getState();

        // TODO: Backend API endpoint eklendiğinde aktif et
        // const response = await apiService.getRestaurantSettings(restaurantId);
        // if (response.success) {
        //   storeActions.updateSettings(response.data.settings || {});
        //   storeActions.updateAccountInfo(response.data.accountInfo || {});
        //   return;
        // }

        await storeActions.fetchSettings();
        return;
      } catch (error) {
        if (!isMounted) return;
        console.error('❌ Failed to load settings from backend:', error);

        // Default settings (fallback)
        const storeActions = useBusinessSettingsStore.getState();
        storeActions.updateBasicInfo({
          name: 'Restoran Adı',
          businessType: 'restaurant'
        });
        storeActions.updateMenuSettings({
          defaultLanguage: 'tr'
        });
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]); // Only depend on restaurantId, not store

  return store;
}
