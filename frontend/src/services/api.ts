Masa Temizliği
Servis İsteği
Bilgi
Sipariş Gecikti/**
 * API Service Layer
 * Replaces localStorage with backend API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;

      // Subdomain bilgisini header'a ekle (güvenlik için)
      const subdomain = typeof window !== 'undefined'
        ? window.location.hostname.split('.')[0]
        : null;

      // Staff token VEYA restaurant token al (business dashboard için)
      // PRIORITY FIX: Prefer restaurant_token/business_token over staff_token
      // This prevents a stale/invalid staff_token from blocking a valid owner session
      const staffToken = typeof window !== 'undefined' ? localStorage.getItem('staff_token') : null;
      const restaurantToken = typeof window !== 'undefined' ? localStorage.getItem('restaurant_token') : null;
      const businessToken = typeof window !== 'undefined' ? localStorage.getItem('business_token') : null;
      const authToken = restaurantToken || businessToken || staffToken;

      // Log if token is missing
      if (!authToken && !endpoint.includes('/login')) {
        console.warn(`API request to ${endpoint} without authentication token`);
      }

      // Subdomain'i ve token'i her zaman gönder
      const headers: Record<string, string> = {
        'X-Subdomain': subdomain || 'kroren', // Fallback olarak kroren kullan
      };

      // FormData gönderiliyorsa Content-Type set edilmemeli (browser otomatik halleder)
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      // Copy any existing headers from options
      if (options.headers) {
        const optHeaders = options.headers as Record<string, string>;
        Object.keys(optHeaders).forEach(key => {
          if (optHeaders[key] !== 'undefined') {
            headers[key] = optHeaders[key];
          }
        });
      }

      // Auth token varsa Authorization header'a ekle (staff veya restaurant token)
      if (authToken) {
        // Make sure the token is properly formatted
        const token = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
        headers['Authorization'] = token;

        // Log token format for debugging
        console.log(`Token format for ${endpoint}: ${token.substring(0, 10)}... (${staffToken ? 'staff' : 'restaurant'})`);
      }

      console.log('🌐 API Request:', {
        url,
        subdomain,
        hasToken: !!authToken,
        tokenType: staffToken ? 'staff_token' : (restaurantToken ? 'restaurant_token' : (businessToken ? 'business_token' : 'none')),
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
        headers: { ...headers, Authorization: authToken ? 'Bearer [HIDDEN]' : undefined }
      });

      const response = await fetch(url, {
        headers,
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Restaurant endpoints
  async getRestaurants() {
    return this.request<any[]>('/restaurants');
  }

  async getRestaurantByUsername(username: string) {
    return this.request<any>(`/restaurants/username/${username}`);
  }

  async getRestaurantById(id: string) {
    return this.request<any>(`/restaurants/${id}`);
  }

  async createRestaurant(data: any) {
    return this.request<any>('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRestaurant(id: string, data: any) {
    return this.request<any>(`/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateRestaurantFeatures(id: string, features: string[]) {
    return this.request<any>(`/restaurants/${id}/features`, {
      method: 'PUT',
      body: JSON.stringify({ features }),
    });
  }

  // Menu endpoints
  async getRestaurantMenu(restaurantId: string) {
    return this.request<any>(`/restaurants/${restaurantId}/menu`);
  }

  async createMenuCategory(restaurantId: string, data: any) {
    return this.request<any>(`/restaurants/${restaurantId}/menu/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMenuCategory(restaurantId: string, categoryId: string, data: any) {
    return this.request<any>(`/restaurants/${restaurantId}/menu/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMenuCategory(restaurantId: string, categoryId: string) {
    return this.request<any>(`/restaurants/${restaurantId}/menu/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  async createMenuItem(restaurantId: string, data: any) {
    console.log('API - createMenuItem çağrıldı:', { restaurantId, data });
    return this.request<any>(`/restaurants/${restaurantId}/menu/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMenuItem(restaurantId: string, itemId: string, data: any) {
    console.log('API - updateMenuItem çağrıldı:', { restaurantId, itemId, data });
    return this.request<any>(`/restaurants/${restaurantId}/menu/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMenuItem(restaurantId: string, itemId: string) {
    return this.request<any>(`/restaurants/${restaurantId}/menu/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Order endpoints
  async getOrders(restaurantId: string, status?: string, tableNumber?: string | number) {
    const params = new URLSearchParams({ restaurantId });
    if (status) params.append('status', status);
    if (tableNumber) params.append('tableNumber', String(tableNumber));
    return this.request<any>(`/orders?${params.toString()}`);
  }

  async getOrderById(orderId: string) {
    return this.request<any>(`/orders/${orderId}`);
  }

  async createOrder(orderData: any) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request<any>(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Authentication endpoints
  async login(credentials: { username: string; password: string }) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async staffLogin(credentials: { username: string; password: string; subdomain?: string }) {
    return this.request<any>('/staff/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request<any>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  async refreshToken() {
    return this.request<any>('/auth/refresh', {
      method: 'POST',
    });
  }

  // QR Token Management
  async generateQRToken(data: { restaurantId: string; tableNumber: number; duration?: number }) {
    return this.request<any>(`/qr/generate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyQRToken(token: string) {
    return this.request<any>(`/qr/verify/${token}`);
  }

  async refreshQRToken(token: string, duration: number = 2) {
    return this.request<any>(`/qr/refresh/${token}`, {
      method: 'POST',
      body: JSON.stringify({ duration }),
    });
  }

  async getRestaurantQRTokens(restaurantId: string) {
    return this.request<any>(`/qr/restaurant/${restaurantId}/tables`);
  }

  async deactivateQRToken(token: string) {
    return this.request<any>(`/qr/deactivate/${token}`, {
      method: 'DELETE',
    });
  }

  async deactivateQRTokenByTable(restaurantId: string, tableNumber: number) {
    return this.request<any>(`/qr/deactivate-by-table`, {
      method: 'POST',
      body: JSON.stringify({ restaurantId, tableNumber }),
    });
  }

  async cleanupExpiredTokens() {
    return this.request<any>(`/qr/cleanup`, {
      method: 'POST',
    });
  }

  // Staff endpoints
  async getStaff(restaurantId: string) {
    return this.request<any[]>(`/staff/restaurant/${restaurantId}`);
  }

  async createStaff(restaurantId: string, staffData: any) {
    return this.request<any>(`/staff/restaurant/${restaurantId}`, {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  }

  async updateStaff(id: string, staffData: any) {
    return this.request<any>(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });
  }

  async deleteStaff(id: string) {
    return this.request<any>(`/staff/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin endpoints
  async getAllRestaurantUsers() {
    return this.request<any>(`/restaurants/users/all`);
  }

  async getRestaurantUsers(restaurantId: string) {
    return this.request<any>(`/restaurants/${restaurantId}/users`);
  }

  async changeAdminPassword(restaurantId: string, newPassword: string) {
    return this.request<any>(`/restaurants/${restaurantId}/change-admin-password`, {
      method: 'POST',
      body: JSON.stringify({
        newPassword
      })
    });
  }

  async changeRestaurantPassword(restaurantId: string, currentPassword: string, newPassword: string) {
    return this.request<any>(`/restaurants/${restaurantId}/change-password`, {
      method: 'POST',
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });
  }

  // Branch endpoints
  async getBranches(restaurantId: string) {
    return this.request<any>(`/branches?restaurantId=${restaurantId}`);
  }

  async createBranch(data: any) {
    return this.request<any>('/branches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBranch(id: string, data: any) {
    return this.request<any>(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBranch(id: string) {
    return this.request<any>(`/branches/${id}`, {
      method: 'DELETE',
    });
  }

  // API Key endpoints
  async getApiKeys(restaurantId: string) {
    return this.request<any>(`/apikeys?restaurantId=${restaurantId}`);
  }

  async createApiKey(data: any) {
    return this.request<any>('/apikeys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateApiKey(id: string, data: any) {
    return this.request<any>(`/apikeys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteApiKey(id: string) {
    return this.request<any>(`/apikeys/${id}`, {
      method: 'DELETE',
    });
  }

  async regenerateApiKey(id: string) {
    return this.request<any>(`/apikeys/${id}/regenerate`, {
      method: 'POST',
    });
  }

  // Delivery endpoints
  async getDeliveries(restaurantId: string) {
    return this.request<any>(`/deliveries?restaurantId=${restaurantId}`);
  }

  async createDelivery(data: any) {
    return this.request<any>('/deliveries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDelivery(id: string, data: any) {
    return this.request<any>(`/deliveries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDelivery(id: string) {
    return this.request<any>(`/deliveries/${id}`, {
      method: 'DELETE',
    });
  }

  // POS Device endpoints
  async getPOSDevices(restaurantId: string) {
    return this.request<any>(`/pos?restaurantId=${restaurantId}`);
  }

  async createPOSDevice(data: any) {
    return this.request<any>('/pos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePOSDevice(id: string, data: any) {
    return this.request<any>(`/pos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePOSDevice(id: string) {
    return this.request<any>(`/pos/${id}`, {
      method: 'DELETE',
    });
  }

  async syncPOSDevice(id: string) {
    return this.request<any>(`/pos/${id}/sync`, {
      method: 'POST',
    });
  }

  // Transaction endpoints
  async getTransactions(restaurantId: string) {
    return this.request<any>(`/transactions?restaurantId=${restaurantId}`);
  }

  async createTransaction(data: any) {
    return this.request<any>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTransaction(id: string, data: any) {
    return this.request<any>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(id: string) {
    return this.request<any>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // AI Recommendation endpoints
  async getAIRecommendations(restaurantId: string) {
    return this.request<any>(`/ai?restaurantId=${restaurantId}`);
  }

  async createAIRecommendation(data: any) {
    return this.request<any>('/ai', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAIRecommendation(id: string, data: any) {
    return this.request<any>(`/ai/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAIRecommendation(id: string) {
    return this.request<any>(`/ai/${id}`, {
      method: 'DELETE',
    });
  }

  // Video Menu endpoints
  async getVideoMenuItems(restaurantId: string) {
    return this.request<any>(`/videomenu?restaurantId=${restaurantId}`);
  }

  async createVideoMenuItem(data: any) {
    return this.request<any>('/videomenu', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVideoMenuItem(id: string, data: any) {
    return this.request<any>(`/videomenu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVideoMenuItem(id: string) {
    return this.request<any>(`/videomenu/${id}`, {
      method: 'DELETE',
    });
  }

  async incrementVideoView(id: string) {
    return this.request<any>(`/videomenu/${id}/view`, {
      method: 'POST',
    });
  }

  // Event endpoints
  async getEvents(restaurantId: string) {
    return this.request<any>(`/events?restaurantId=${restaurantId}`);
  }

  async createEvent(data: any) {
    return this.request<any>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(id: string, data: any) {
    return this.request<any>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(id: string) {
    return this.request<any>(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Inventory endpoints
  async getInventoryItems(restaurantId: string) {
    return this.request<any>(`/inventory?restaurantId=${restaurantId}`);
  }

  async createInventoryItem(data: any) {
    return this.request<any>('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInventoryItem(id: string, data: any) {
    return this.request<any>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInventoryItem(id: string) {
    return this.request<any>(`/inventory/${id}`, {
      method: 'DELETE',
    });
  }

  // Session management for real-time cart
  async joinSession(restaurantId: string, tableNumber: number, qrToken: string, clientId?: string) {
    return this.request<any>('/sessions/join', {
      method: 'POST',
      body: JSON.stringify({ restaurantId, tableNumber, qrToken, clientId })
    });
  }

  async getSession(sessionKey: string, clientId?: string) {
    const params = clientId ? `?clientId=${clientId}` : '';
    return this.request<any>(`/sessions/${sessionKey}${params}`);
  }

  async updateSessionCart(sessionKey: string, cart: any[], clientId: string) {
    return this.request<any>(`/sessions/${sessionKey}/cart`, {
      method: 'PUT',
      body: JSON.stringify({ cart, clientId })
    });
  }

  async leaveSession(sessionKey: string, clientId: string) {
    return this.request<any>(`/sessions/${sessionKey}/leave`, {
      method: 'DELETE',
      body: JSON.stringify({ clientId })
    });
  }

  async notifyOrderComplete(sessionKey: string, clientId: string, orderId: string) {
    return this.request<any>(`/sessions/${sessionKey}/order-complete`, {
      method: 'POST',
      body: JSON.stringify({ clientId, orderId })
    });
  }

  // Settings endpoints
  async getSettings() {
    return this.request<any>('/settings');
  }

  async updateSettings(settings: any) {
    return this.request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async uploadImage(file: File, folder: string = 'restaurants') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    return this.request<any>('/upload/image', {
      method: 'POST',
      body: formData
    });
  }

  async callWaiter(data: { restaurantId: string; tableNumber: number; type: string; message: string }) {
    return this.request<any>('/waiter/call', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Support endpoints
  async getSupportTickets(restaurantId?: string) {
    const endpoint = restaurantId ? `/support?restaurantId=${restaurantId}` : '/support';
    return this.request<any[]>(endpoint);
  }

  async createSupportTicket(data: any) {
    return this.request<any>('/support', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin / Debug endpoints
  async getTableInfo() {
    return this.request<any>('/admin-fix/table-info');
  }

  async fixDbSchema() {
    return this.request<any>('/admin-fix/fix-db-schema');
  }
}

export const apiService = new ApiService();
export default apiService;
