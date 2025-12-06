import { create } from 'zustand';
import { Restaurant, Staff } from '@/types';

interface AuthState {
  authenticatedRestaurant: Restaurant | null;
  authenticatedStaff: Staff | null;
  loginRestaurant: (restaurant: Restaurant) => void;
  loginStaff: (staff: Staff) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  getRole: () => string | null;
  initializeAuth: () => void;
  getCurrentSubdomain: () => string | null;
  getRestaurantFromSubdomain: () => Promise<Restaurant | null>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
      authenticatedRestaurant: null,
      authenticatedStaff: null,
      loginRestaurant: (restaurant) => {
        set({ authenticatedRestaurant: restaurant, authenticatedStaff: null });
        // localStorage'a kaydet
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentRestaurant', JSON.stringify(restaurant));
        }
      },
      loginStaff: (staff) => {
        set({ authenticatedStaff: staff, authenticatedRestaurant: null });
        // localStorage'a kaydet
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentStaff', JSON.stringify(staff));
        }
      },
      logout: () => {
        set({ authenticatedRestaurant: null, authenticatedStaff: null });
        // Cookie'yi temizle
        if (typeof window !== 'undefined') {
          document.cookie = 'accessToken=; path=/; max-age=0';
          localStorage.removeItem('currentRestaurant');
          localStorage.removeItem('currentStaff');
        }
      },
      isAuthenticated: () => {
        const state = get();
        return state.authenticatedRestaurant !== null || state.authenticatedStaff !== null;
      },
      getRole: () => {
        const state = get();
        if (state.authenticatedStaff) return state.authenticatedStaff.role;
        if (state.authenticatedRestaurant) return 'restaurant_owner';
        return null;
      },
      initializeAuth: () => {
        if (typeof window !== 'undefined') {
          try {
            const savedRestaurant = localStorage.getItem('currentRestaurant');
            const savedStaff = localStorage.getItem('currentStaff');
            
            if (savedRestaurant) {
              const restaurant = JSON.parse(savedRestaurant);
              set({ authenticatedRestaurant: restaurant, authenticatedStaff: null });
            } else if (savedStaff) {
              const staff = JSON.parse(savedStaff);
              set({ authenticatedStaff: staff, authenticatedRestaurant: null });
            } else {
              // Eğer localStorage'da kayıt yoksa, subdomain'den restaurant bilgisini al
              get().getRestaurantFromSubdomain();
            }
          } catch (error) {
            console.error('Error initializing auth:', error);
          }
        }
      },
      getCurrentSubdomain: () => {
        if (typeof window === 'undefined') return null;
        
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        
        // hazal.guzellestir.com -> hazal
        if (parts.length >= 3) {
          return parts[0];
        }
        
        return null;
      },
      getRestaurantFromSubdomain: async () => {
        const subdomain = get().getCurrentSubdomain();
        if (!subdomain) return null;
        
        try {
          // Backend'den subdomain'e göre restaurant bilgisini al
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurants/username/${subdomain}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              const restaurant = data.data;
              set({ authenticatedRestaurant: restaurant, authenticatedStaff: null });
              
              // localStorage'a kaydet
              if (typeof window !== 'undefined') {
                localStorage.setItem('currentRestaurant', JSON.stringify(restaurant));
              }
              
              return restaurant;
            }
          }
        } catch (error) {
          console.error('Error fetching restaurant from subdomain:', error);
        }
        
        return null;
      },
}));

export default useAuthStore;
