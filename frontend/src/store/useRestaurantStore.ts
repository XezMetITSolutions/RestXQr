import { create } from 'zustand';
import { apiService } from '@/services/api';
import { Restaurant, MenuCategory, MenuItem, Order, ServiceCall } from '@/types';
import { useAuthStore } from './useAuthStore';

interface RestaurantState {
  // Data
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  categories: MenuCategory[];
  menuItems: MenuItem[];
  orders: Order[];
  activeOrders: Order[];
  serviceCalls: ServiceCall[];
  loading: boolean;
  error: string | null;

  // API Actions
  fetchRestaurants: () => Promise<void>;
  fetchRestaurantByUsername: (username: string) => Promise<Restaurant | null>;
  createRestaurant: (data: Partial<Restaurant>) => Promise<void>;
  updateRestaurant: (id: string, updates: Partial<Restaurant>) => Promise<void>;
  updateRestaurantFeatures: (id: string, features: string[]) => Promise<void>;
  fetchCurrentRestaurant: (id: string) => Promise<void>;

  // Local Actions (for backward compatibility)
  setCurrentRestaurant: (restaurant: Restaurant) => void;
  setRestaurants: (restaurants: Restaurant[]) => void;
  addRestaurant: (restaurant: Restaurant) => void;
  deleteRestaurant: (id: string) => void;

  // Menu API Actions
  createMenuCategory: (restaurantId: string, data: any) => Promise<any>;
  createMenuItem: (restaurantId: string, data: any) => Promise<any>;
  updateMenuCategory: (restaurantId: string, categoryId: string, data: any) => Promise<any>;
  deleteMenuCategory: (restaurantId: string, categoryId: string) => Promise<boolean>;
  updateMenuItem: (restaurantId: string, itemId: string, data: any) => Promise<any>;
  deleteMenuItem: (restaurantId: string, itemId: string) => Promise<boolean>;
  fetchRestaurantMenu: (restaurantId: string) => Promise<any>;

  // Menu Actions (for backward compatibility)
  setCategories: (categories: MenuCategory[]) => void;
  addCategory: (category: MenuCategory) => void;
  updateCategory: (id: string, updates: Partial<MenuCategory>) => void;
  deleteCategory: (id: string) => void;

  setMenuItems: (items: MenuItem[]) => void;
  addMenuItem: (item: MenuItem) => void;

  // Order Actions
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  updateOrderItemStatus: (orderId: string, itemIndex: number, status: 'pending' | 'preparing' | 'ready' | 'served') => void;

  // Service Call Actions
  setServiceCalls: (calls: ServiceCall[]) => void;
  addServiceCall: (call: ServiceCall) => void;
  updateServiceCallStatus: (id: string, status: ServiceCall['status'], acknowledgedBy?: string) => void;
  clearCompletedCalls: () => void;
}

const useRestaurantStore = create<RestaurantState>((set, get) => ({
  // Initial state
  restaurants: [],
  currentRestaurant: null,
  categories: [],
  menuItems: [],
  orders: [],
  activeOrders: [],
  serviceCalls: [],
  loading: false,
  error: null,

  // API Actions
  fetchRestaurants: async () => {
    set({ loading: true, error: null });
    try {
      console.log('🔄 fetchRestaurants called');
      const response = await apiService.getRestaurants();
      console.log('📦 fetchRestaurants response:', response);

      if (response.success && response.data) {
        console.log('✅ fetchRestaurants success, data length:', response.data.length);
        // Backend'den gelen veriyi frontend formatına çevir
        const restaurants = response.data.map((restaurant: any) => ({
          ...restaurant,
          subscription: {
            plan: restaurant.subscriptionPlan || 'basic',
            status: restaurant.subscriptionStatus || 'active',
            startDate: new Date(restaurant.created_at),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 yıl sonra
          },
          createdAt: new Date(restaurant.created_at),
          updatedAt: new Date(restaurant.updated_at),
          status: restaurant.isActive ? 'active' : 'inactive'
        }));
        console.log('💾 Setting restaurants in state:', restaurants.length);
        set({ restaurants, loading: false });
        console.log('✅ fetchRestaurants completed');
      } else {
        console.log('❌ fetchRestaurants failed - no data or not successful');
        set({ loading: false });
      }
    } catch (error) {
      console.error('❌ fetchRestaurants error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch restaurants', loading: false });
    }
  },

  fetchRestaurantByUsername: async (username: string) => {
    set({ loading: true, error: null });
    try {
      console.log('🔍 Fetching restaurant by username:', username);
      const response = await apiService.getRestaurantByUsername(username);
      console.log('📦 API Response:', response);

      if (response.success && response.data) {
        console.log('✅ Setting currentRestaurant:', response.data);
        const restaurantData = response.data;

        // Extract menuItems from categories.items if not directly available
        let allMenuItems = restaurantData?.menuItems || [];
        if (allMenuItems.length === 0 && restaurantData?.categories) {
          allMenuItems = restaurantData.categories.flatMap((cat: any) => cat.items || []);
          console.log('📦 Extracted menuItems from categories:', allMenuItems.length);
        }

        set((state) => ({
          currentRestaurant: restaurantData,
          restaurants: [...(Array.isArray(state.restaurants) ? state.restaurants : []).filter(r => r.id !== restaurantData.id), restaurantData],
          categories: Array.isArray(restaurantData?.categories) ? restaurantData.categories : [],
          menuItems: Array.isArray(allMenuItems) ? allMenuItems.map((item: any) => ({
            ...item,
            allergens: Array.isArray(item.allergens) ? item.allergens : (typeof item.allergens === 'string' ? item.allergens.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
            ingredients: Array.isArray(item.ingredients) ? item.ingredients : (typeof item.ingredients === 'string' ? item.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean) : [])
          })) : [],
          loading: false
        }));

        // Verify state was set
        const state = get();
        console.log('💾 State after set - currentRestaurant:', state.currentRestaurant);
        console.log('💾 State after set - categories:', state.categories.length);
        console.log('💾 State after set - menuItems:', state.menuItems.length);

        return restaurantData as Restaurant;
      }
      console.warn('⚠️ No data in response or not successful');
      set({ loading: false });
      return null;
    } catch (error) {
      console.error('❌ fetchRestaurantByUsername error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch restaurant', loading: false });
      return null;
    }
  },

  createRestaurant: async (data: Partial<Restaurant>) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.createRestaurant(data);
      if (response.success) {
        set((state) => ({
          restaurants: [...state.restaurants, response.data],
          loading: false
        }));
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create restaurant', loading: false });
    }
  },

  updateRestaurant: async (id: string, updates: Partial<Restaurant>) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.updateRestaurant(id, updates);
      if (response.success) {
        set((state) => ({
          restaurants: state.restaurants.map(r =>
            r.id === id ? { ...r, ...response.data } : r
          ),
          currentRestaurant: state.currentRestaurant?.id === id
            ? { ...state.currentRestaurant, ...response.data }
            : state.currentRestaurant,
          loading: false
        }));
        // Sync with useAuthStore
        useAuthStore.getState().updateAuthenticatedRestaurant({ ...response.data });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update restaurant', loading: false });
    }
  },

  updateRestaurantFeatures: async (id: string, features: string[]) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.updateRestaurantFeatures(id, features);
      if (response.success) {
        set((state) => ({
          restaurants: state.restaurants.map(r =>
            r.id === id ? { ...r, features } : r
          ),
          currentRestaurant: state.currentRestaurant?.id === id
            ? { ...state.currentRestaurant, features }
            : state.currentRestaurant,
          loading: false
        }));
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update features', loading: false });
    }
  },

  fetchCurrentRestaurant: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.getRestaurantById(id);
      if (response.success && response.data) {
        set({ currentRestaurant: response.data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch restaurant', loading: false });
    }
  },

  // Menu API Actions
  createMenuCategory: async (restaurantId: string, data: any) => {
    set({ loading: true, error: null });
    try {
      // Backend için veriyi dönüştür: sadece Türkçe string gönder
      const backendData = {
        name: typeof data.name === 'string' ? data.name : data.name?.tr || '',
        description: typeof data.description === 'string' ? data.description : data.description?.tr || '',
        displayOrder: data.order || data.displayOrder || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        kitchenStation: data.kitchenStation || null
      };

      console.log('🚀 Creating category:', { restaurantId, backendData });

      const response = await apiService.createMenuCategory(restaurantId, backendData);

      console.log('✅ Category created:', response);

      if (response.success) {
        set((state) => ({
          categories: [...state.categories, response.data],
          loading: false
        }));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('❌ Create category error:', error);
      set({
        error: error instanceof Error ? error.message : 'Kategori oluşturulamadı',
        loading: false
      });
      throw error;
    }
  },

  createMenuItem: async (restaurantId: string, data: any) => {
    set({ loading: true, error: null });
    try {
      // Backend için veriyi dönüştür: sadece Türkçe string gönder
      const backendData = {
        categoryId: data.categoryId,
        name: typeof data.name === 'string' ? data.name : data.name?.tr || '',
        description: typeof data.description === 'string' ? data.description : data.description?.tr || '',
        price: parseFloat(data.price),
        image: data.image,
        displayOrder: data.order || data.displayOrder || 0,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
        isPopular: data.isPopular || false,
        preparationTime: data.preparationTime || null,
        calories: data.calories || null,
        allergens: data.allergens || [],
        ingredients: data.ingredients || [],
        kitchenStation: data.kitchenStation || null
      };

      console.log('🚀 Creating menu item:', { restaurantId, backendData });

      const response = await apiService.createMenuItem(restaurantId, backendData);

      console.log('✅ Menu item created:', response);

      if (response.success) {
        set((state) => ({
          menuItems: [...state.menuItems, response.data],
          loading: false
        }));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create menu item');
      }
    } catch (error) {
      console.error('❌ Create menu item error:', error);
      set({
        error: error instanceof Error ? error.message : 'Ürün oluşturulamadı',
        loading: false
      });
      throw error;
    }
  },

  updateMenuCategory: async (restaurantId: string, categoryId: string, data: any) => {
    set({ loading: true, error: null });
    try {
      // Backend için veriyi dönüştür
      const backendData = {
        name: typeof data.name === 'string' ? data.name : data.name?.tr,
        description: typeof data.description === 'string' ? data.description : data.description?.tr,
        displayOrder: data.order || data.displayOrder,
        isActive: data.isActive,
        kitchenStation: data.kitchenStation
      };

      const response = await apiService.updateMenuCategory(restaurantId, categoryId, backendData);
      if (response.success) {
        set((state) => ({
          categories: state.categories.map(c =>
            c.id === categoryId ? { ...c, ...response.data } : c
          ),
          loading: false
        }));
        return response.data;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Kategori güncellenemedi',
        loading: false
      });
      throw error;
    }
  },

  deleteMenuCategory: async (restaurantId: string, categoryId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.deleteMenuCategory(restaurantId, categoryId);
      if (response.success) {
        set((state) => ({
          categories: state.categories.filter(c => c.id !== categoryId),
          menuItems: state.menuItems.filter(item => item.categoryId !== categoryId),
          loading: false
        }));
        return true;
      }
      return false;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Kategori silinemedi',
        loading: false
      });
      return false;
    }
  },

  updateMenuItem: async (restaurantId: string, itemId: string, data: any) => {
    set({ loading: true, error: null });
    try {
      // Backend için veriyi dönüştür
      const backendData = {
        categoryId: data.categoryId,
        name: typeof data.name === 'string' ? data.name : data.name?.tr,
        description: typeof data.description === 'string' ? data.description : data.description?.tr,
        price: data.price ? parseFloat(data.price) : undefined,
        imageUrl: data.imageUrl || data.image,
        displayOrder: data.order || data.displayOrder,
        isAvailable: data.isAvailable,
        isPopular: data.isPopular,
        allergens: data.allergens,
        ingredients: data.ingredients,
        kitchenStation: data.kitchenStation
      };

      const response = await apiService.updateMenuItem(restaurantId, itemId, backendData);
      if (response.success) {
        set((state) => ({
          menuItems: state.menuItems.map(item =>
            item.id === itemId ? { ...item, ...response.data } : item
          ),
          loading: false
        }));
        return response.data;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ürün güncellenemedi',
        loading: false
      });
      throw error;
    }
  },

  deleteMenuItem: async (restaurantId: string, itemId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.deleteMenuItem(restaurantId, itemId);
      if (response.success) {
        set((state) => ({
          menuItems: state.menuItems.filter(item => item.id !== itemId),
          loading: false
        }));
        return true;
      }
      return false;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ürün silinemedi',
        loading: false
      });
      return false;
    }
  },

  fetchRestaurantMenu: async (restaurantId: string) => {
    set({ loading: true, error: null });
    try {
      console.log('🔄 Fetching restaurant menu:', restaurantId);
      const response = await apiService.getRestaurantMenu(restaurantId);
      console.log('📦 Backend response:', response);

      if (response.success) {
        // Backend'den gelen veriyi frontend formatına dönüştür
        const categories = Array.isArray(response.data?.categories) ? response.data.categories : [];
        let allItems: any[] = [];

        console.log('📊 Raw categories from backend:', categories.length);

        // Kategorilerden tüm ürünleri çıkar
        categories.forEach((cat: any) => {
          if (cat.items && Array.isArray(cat.items)) {
            allItems = allItems.concat(cat.items);
          }
        });

        console.log('📊 Total items extracted:', allItems.length);
        console.log('📋 First item:', allItems[0]);

        const transformedCategories = categories.map((cat: any) => ({
          id: cat.id,
          restaurantId: cat.restaurantId,
          name: cat.name,
          description: cat.description,
          order: cat.displayOrder || 0,
          isActive: cat.isActive !== false,
          kitchenStation: cat.kitchenStation
        }));

        const transformedItems = allItems.map((item: any) => ({
          id: item.id,
          restaurantId: item.restaurantId,
          categoryId: item.categoryId,
          name: item.name,
          description: item.description,
          price: parseFloat(item.price),
          image: item.imageUrl || item.image,
          imageUrl: item.imageUrl || item.image,
          order: item.displayOrder || 0,
          isAvailable: item.isAvailable !== false,
          isPopular: item.isPopular || false,
          calories: item.calories,
          preparationTime: item.preparationTime,
          ingredients: Array.isArray(item.ingredients) ? item.ingredients : (typeof item.ingredients === 'string' ? item.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
          allergens: Array.isArray(item.allergens) ? item.allergens : (typeof item.allergens === 'string' ? item.allergens.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
          kitchenStation: item.kitchenStation
        }));

        console.log('✅ Transformed categories:', transformedCategories.length);
        console.log('✅ Transformed items:', transformedItems.length);
        console.log('✅ First transformed item:', transformedItems[0]);

        set({
          categories: Array.isArray(transformedCategories) ? transformedCategories : [],
          menuItems: Array.isArray(transformedItems) ? transformedItems : [],
          loading: false
        });

        console.log('💾 State updated successfully');
        return response.data;
      }
    } catch (error) {
      console.error('❌ Fetch menu error:', error);
      set({
        error: error instanceof Error ? error.message : 'Menü yüklenemedi',
        loading: false
      });
      throw error;
    }
  },

  // Local Actions (for backward compatibility)
  setCurrentRestaurant: (restaurant: Restaurant) => set({ currentRestaurant: restaurant }),

  setRestaurants: (restaurants: Restaurant[]) => set({ restaurants }),

  addRestaurant: (restaurant: Restaurant) => set((state) => ({
    restaurants: [...state.restaurants, restaurant]
  })),

  deleteRestaurant: (id: string) => set((state) => ({
    restaurants: state.restaurants.filter(r => r.id !== id)
  })),

  // Menu Actions
  setCategories: (categories: MenuCategory[]) => set({ categories: Array.isArray(categories) ? categories : [] }),

  addCategory: (category: MenuCategory) => set((state) => ({
    categories: [...(Array.isArray(state.categories) ? state.categories : []), category]
  })),

  updateCategory: (id: string, updates: Partial<MenuCategory>) => set((state) => ({
    categories: (Array.isArray(state.categories) ? state.categories : []).map(c =>
      c.id === id ? { ...c, ...updates } : c
    )
  })),

  deleteCategory: (id: string) => set((state) => ({
    categories: (Array.isArray(state.categories) ? state.categories : []).filter(c => c.id !== id),
    menuItems: (Array.isArray(state.menuItems) ? state.menuItems : []).filter(item => item.categoryId !== id)
  })),

  setMenuItems: (items: MenuItem[]) => set({ menuItems: Array.isArray(items) ? items : [] }),

  addMenuItem: (item: MenuItem) => set((state) => ({
    menuItems: [...(Array.isArray(state.menuItems) ? state.menuItems : []), item]
  })),

  // Order Actions
  setOrders: (orders: Order[]) => set({
    orders: Array.isArray(orders) ? orders : [],
    activeOrders: Array.isArray(orders) ? orders.filter(o =>
      o && ['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(o.status)
    ) : []
  }),

  addOrder: (order: Order) => set((state) => {
    const currentOrders = Array.isArray(state.orders) ? state.orders : [];
    const currentActiveOrders = Array.isArray(state.activeOrders) ? state.activeOrders : [];
    return {
      orders: [...currentOrders, order],
      activeOrders: ['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(order.status)
        ? [...currentActiveOrders, order]
        : currentActiveOrders
    };
  }),

  updateOrderStatus: (id: string, status: Order['status']) => set((state) => {
    const currentOrders = Array.isArray(state.orders) ? state.orders : [];
    const updatedOrders = currentOrders.map(o =>
      o && o.id === id ? { ...o, status } : o
    ).filter(Boolean);
    return {
      orders: updatedOrders,
      activeOrders: updatedOrders.filter(o =>
        o && ['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(o.status)
      )
    };
  }),

  updateOrderItemStatus: (orderId: string, itemIndex: number, status: 'pending' | 'preparing' | 'ready' | 'served') => set((state) => {
    const currentOrders = Array.isArray(state.orders) ? state.orders : [];
    return {
      orders: currentOrders.map(order => {
        if (order && order.id === orderId && Array.isArray(order.items)) {
          const updatedItems = [...order.items];
          if (updatedItems[itemIndex]) {
            updatedItems[itemIndex] = { ...updatedItems[itemIndex], status };
            return { ...order, items: updatedItems };
          }
        }
        return order;
      })
    };
  }),

  // Service Call Actions
  setServiceCalls: (calls: ServiceCall[]) => set({ serviceCalls: calls }),

  addServiceCall: (call: ServiceCall) => set((state) => ({
    serviceCalls: [...state.serviceCalls, call]
  })),

  updateServiceCallStatus: (id: string, status: ServiceCall['status'], acknowledgedBy?: string) => set((state) => ({
    serviceCalls: state.serviceCalls.map(call =>
      call.id === id
        ? {
          ...call,
          status,
          acknowledgedBy: acknowledgedBy || call.acknowledgedBy,
          acknowledgedAt: status === 'acknowledged' ? new Date() : call.acknowledgedAt,
          completedAt: status === 'completed' ? new Date() : call.completedAt
        }
        : call
    )
  })),

  clearCompletedCalls: () => set((state) => ({
    serviceCalls: state.serviceCalls.filter(call => call.status !== 'completed')
  })),
}));

export default useRestaurantStore;
