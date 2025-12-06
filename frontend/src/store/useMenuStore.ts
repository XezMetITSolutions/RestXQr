import { create } from 'zustand';
import { useCache } from '@/hooks/useCache';
import { menuData } from '@/data/menu-data';

export interface MenuItem {
  id: string;
  name: {
    en: string;
    tr: string;
  } | string;
  description: {
    en: string;
    tr: string;
  } | string;
  price: number;
  image?: string;
  images?: string[];
  category?: string; // Legacy field
  categoryId?: string; // New field for PostgreSQL
  subcategory?: string;
  popular?: boolean;
  ingredients?: string[];
  allergens?: { en: string; tr: string }[] | string[];
  calories?: number;
  preparationTime?: number;
  servingInfo?: {
    en: string;
    tr: string;
  };
  isAvailable?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  nutritionInfo?: any;
}

export interface MenuSubcategory {
  id: string;
  name: {
    en: string;
    tr: string;
  };
  parentId: string;
}

export interface MenuCategory {
  id: string;
  name: {
    en: string;
    tr: string;
  };
  description?: {
    en: string;
    tr: string;
  };
  image?: string;
  subcategories?: MenuSubcategory[];
  isActive?: boolean;
}

interface MenuState {
  items: MenuItem[];
  categories: MenuCategory[];
  subcategories: MenuSubcategory[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchMenu: (restaurantId?: string) => Promise<void>;
  getItemsByCategory: (categoryId: string) => MenuItem[];
  getItemsBySubcategory: (subcategoryId: string) => MenuItem[];
  getPopularItems: () => MenuItem[];
  getItemById: (id: string) => MenuItem | undefined;
  getSubcategoriesByParent: (parentId: string) => MenuSubcategory[];
  updateItemPrice: (itemId: string, newPrice: number) => void;
  bulkUpdatePrices: (categoryId: string | 'all', operation: 'increase' | 'decrease', type: 'percentage' | 'fixed', value: number) => void;
  
  // PostgreSQL API functions
  createCategory: (restaurantId: string, categoryData: any) => Promise<any>;
  createMenuItem: (restaurantId: string, itemData: any) => Promise<any>;
  updateMenuItem: (restaurantId: string, itemId: string, itemData: any) => Promise<any>;
  deleteMenuItem: (restaurantId: string, itemId: string) => Promise<boolean>;
  deleteCategory: (restaurantId: string, categoryId: string) => Promise<boolean>;
}

// Sample menu data - CLEARED FOR PRODUCTION
const sampleSubcategories: MenuSubcategory[] = [];

const sampleCategories: MenuCategory[] = [];

const sampleItems: MenuItem[] = [];

const useMenuStore = create<MenuState>()((set, get) => ({
  items: sampleItems,
  categories: sampleCategories,
  subcategories: sampleSubcategories,
  isLoading: false,
  error: null,
  
  fetchMenu: async (restaurantId?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      if (!restaurantId) {
        // Fallback to sample data if no restaurant ID
        set({ 
          items: sampleItems,
          categories: sampleCategories,
          subcategories: sampleSubcategories,
          isLoading: false 
        });
        return;
      }

      // Fetch from PostgreSQL API
      const response = await fetch(`https://masapp-backend.onrender.com/api/restaurants/${restaurantId}/menu/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Transform backend data to frontend format
        const categories = result.data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          displayOrder: cat.displayOrder,
          isActive: cat.isActive,
          restaurantId: cat.restaurantId
        }));
        
        // Extract items from categories
        const items = result.data.flatMap((cat: any) => 
          cat.items?.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            categoryId: item.categoryId,
            displayOrder: item.displayOrder,
            isActive: item.isActive,
            isAvailable: item.isAvailable,
            allergens: item.allergens || [],
            ingredients: item.ingredients || [],
            nutritionInfo: item.nutritionInfo || {}
          })) || []
        );
        
        set({ 
          categories,
          items,
          subcategories: [], // Backend doesn't have subcategories yet
          isLoading: false 
        });
      } else {
        throw new Error(result.message || 'Failed to fetch menu');
      }
    } catch (error) {
      set({ 
        error: 'Failed to fetch menu data',
        isLoading: false 
      });
    }
  },

  // PostgreSQL API functions
  createCategory: async (restaurantId: string, categoryData: any) => {
    try {
      const response = await fetch(`https://masapp-backend.onrender.com/api/restaurants/${restaurantId}/menu/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Add to local state immediately
        const newCategory = {
          id: result.data.id,
          name: result.data.name,
          description: result.data.description,
          displayOrder: result.data.displayOrder,
          isActive: result.data.isActive,
          restaurantId: result.data.restaurantId
        };
        
        set((state) => ({
          categories: [...state.categories, newCategory]
        }));
        
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  },

  createMenuItem: async (restaurantId: string, itemData: any) => {
    try {
      const response = await fetch(`https://masapp-backend.onrender.com/api/restaurants/${restaurantId}/menu/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Add to local state immediately
        const newItem = {
          id: result.data.id,
          name: result.data.name,
          description: result.data.description,
          price: result.data.price,
          image: result.data.imageUrl,
          categoryId: result.data.categoryId,
          displayOrder: result.data.displayOrder,
          isActive: result.data.isActive,
          isAvailable: result.data.isAvailable,
          allergens: result.data.allergens || [],
          ingredients: result.data.ingredients || [],
          nutritionInfo: result.data.nutritionInfo || {}
        };
        
        set((state) => ({
          items: [...state.items, newItem]
        }));
        
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to create menu item');
      }
    } catch (error) {
      console.error('Create menu item error:', error);
      throw error;
    }
  },

  updateMenuItem: async (restaurantId: string, itemId: string, itemData: any) => {
    try {
      const response = await fetch(`https://masapp-backend.onrender.com/api/restaurants/${restaurantId}/menu/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh menu data
        await get().fetchMenu(restaurantId);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update menu item');
      }
    } catch (error) {
      console.error('Update menu item error:', error);
      throw error;
    }
  },

  deleteMenuItem: async (restaurantId: string, itemId: string) => {
    try {
      const response = await fetch(`https://masapp-backend.onrender.com/api/restaurants/${restaurantId}/menu/items/${itemId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh menu data
        await get().fetchMenu(restaurantId);
        return true;
      } else {
        throw new Error(result.message || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Delete menu item error:', error);
      throw error;
    }
  },
  
  getItemsByCategory: (categoryId) => {
    return get().items.filter(item => item.categoryId === categoryId || item.category === categoryId);
  },
  
  getItemsBySubcategory: (subcategoryId) => {
    return get().items.filter(item => item.subcategory === subcategoryId);
  },
  
  getPopularItems: () => {
    return get().items.filter(item => item.popular);
  },
  
  getItemById: (id) => {
    return get().items.find(item => item.id === id);
  },
  
  getSubcategoriesByParent: (parentId) => {
    return get().subcategories.filter(subcategory => subcategory.parentId === parentId);
  },

  updateItemPrice: (itemId, newPrice) => {
    const state = get();
    const updatedItems = state.items.map(item => 
      item.id === itemId ? { ...item, price: newPrice } : item
    );
    set({ items: updatedItems });
  },

  bulkUpdatePrices: (categoryId, operation, type, value) => {
    const state = get();
    const items = [...state.items];
    const itemsToUpdate = categoryId === 'all' 
      ? items 
      : items.filter(item => item.category === categoryId);

    const updatedItems = items.map(item => {
      if (categoryId !== 'all' && item.category !== categoryId) {
        return item;
      }

      let newPrice = item.price;
      
      if (type === 'percentage') {
        const percentage = value / 100;
        if (operation === 'increase') {
          newPrice = item.price * (1 + percentage);
        } else {
          newPrice = item.price * (1 - percentage);
        }
      } else {
        if (operation === 'increase') {
          newPrice = item.price + value;
        } else {
          newPrice = Math.max(0, item.price - value);
        }
      }
      
      return { ...item, price: Math.round(newPrice * 100) / 100 }; // 2 decimal places
    });

    set({ items: updatedItems });
  },

  // Delete category via PostgreSQL API
  deleteCategory: async (restaurantId: string, categoryId: string) => {
    try {
      const response = await fetch(`https://masapp-backend.onrender.com/api/restaurants/${restaurantId}/menu/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Remove from local state
        set((state) => ({
          categories: state.categories.filter(cat => cat.id !== categoryId),
          items: state.items.filter(item => item.categoryId !== categoryId) // Also remove items in this category
        }));
        console.log('Category deleted successfully:', categoryId);
        return true;
      } else {
        throw new Error(result.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete category' });
      return false;
    }
  }
}));

export default useMenuStore;
