// Kullanıcı Tipleri
export type UserRole = 'super_admin' | 'restaurant_owner' | 'restaurant_admin' | 'manager' | 'waiter' | 'chef' | 'kitchen' | 'cashier';
export type StaffRole = 'manager' | 'waiter' | 'chef' | 'cashier';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  restaurantId?: string;
  createdAt: Date;
  lastLogin?: Date;
}

// Personel Tipleri
export interface Staff {
  id: string;
  restaurantId: string;
  name: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: 'active' | 'inactive';
  createdAt: Date;
}

// Restoran Tipleri
export interface Restaurant {
  id: string;
  name: string;
  username: string;
  password?: string; // Şifreyi her zaman göndermek istemeyebiliriz // URL için: masapp.com/r/restaurant-slug
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  address: string;
  phone: string;
  email: string;
  ownerId: string;
  tableCount: number;
  qrCodes: QRCode[];
  settings: RestaurantSettings;
  subscription: Subscription;
  features?: string[]; // Aktif özellikler listesi
  createdAt: Date;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  totalOrders?: number;
}

export interface RestaurantSettings {
  language: string[];
  currency: string;
  taxRate: number;
  serviceChargeRate?: number;
  allowTips: boolean;
  allowOnlinePayment: boolean;
  autoAcceptOrders: boolean;
  workingHours: WorkingHours[];
}

export interface WorkingHours {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

export interface Subscription {
  plan: 'basic' | 'premium' | 'enterprise';
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
}

// QR Kod Tipleri
export interface QRCode {
  id: string;
  restaurantId: string;
  tableNumber: number;
  code: string;
  url: string; // masapp.com/r/restaurant-slug/table/1
  isActive: boolean;
  createdAt: Date;
}

// Menü Tipleri
export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string; // Sadece Türkçe
  description?: string; // Sadece Türkçe
  image?: string;
  order: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string; // Sadece Türkçe
  description: string; // Sadece Türkçe
  price: number;
  image?: string;
  videoUrl?: string; // Video menü URL'i
  videoThumbnail?: string; // Video önizleme resmi
  videoDuration?: string; // Video süresi (örn: "0:45")
  ingredients?: string[]; // Sadece Türkçe
  allergens?: string[]; // Sadece Türkçe
  calories?: number;
  preparationTime?: number;
  servingInfo?: string; // Sadece Türkçe
  isAvailable: boolean;
  isPopular?: boolean;
  order: number;
}

// Sipariş Tipleri
export interface Order {
  id: string;
  restaurantId: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  taxAmount: number;
  serviceCharge?: number;
  tipAmount?: number;
  paymentMethod?: 'cash' | 'card' | 'online';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  customerNotes?: string;
  createdAt: Date;
  completedAt?: Date;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';

export interface OrderItem {
  menuItemId: string;
  name: string; // Sadece Türkçe
  quantity: number;
  price: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

// Çağrı Tipleri
export interface ServiceCall {
  id: string;
  restaurantId: string;
  tableNumber: number;
  type: 'waiter' | 'bill' | 'water' | 'clean_table' | 'custom';
  message?: string;
  status: 'pending' | 'acknowledged' | 'completed';
  createdAt: Date;
  acknowledgedAt?: Date;
  completedAt?: Date;
  acknowledgedBy?: string;
}

// Ödeme ve Bahşiş
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'cash' | 'card' | 'online';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: Date;
}

export interface Tip {
  id: string;
  orderId: string;
  amount: number;
  percentage?: number;
  createdAt: Date;
}

// İşletme Ayarları Tipleri
export interface BusinessSettings {
  // Temel Bilgiler
  basicInfo: {
    name: string;
    subdomain: string;
    businessType: 'cafe' | 'restaurant' | 'fastfood' | 'bar' | 'bakery' | 'pizzeria';
    description: string;
    slogan?: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    wifiPassword?: string;
    showWifiInMenu?: boolean;
    workingHours: string;
    showHoursInMenu?: boolean;
    directionsLink?: string;
    googleReviewLink?: string;
    facebook?: string;
    instagram?: string;
    showInstagramInMenu?: boolean;
    twitter?: string;
    status: 'active' | 'inactive';
  };

  // Görsel Kimlik
  branding: {
    logo?: string;
    coverImage?: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    accentColor: string;
    theme: 'modern' | 'classic' | 'warm' | 'nature';
    fontFamily: string;
    fontSize: 'small' | 'medium' | 'large';
    headerStyle: 'gradient' | 'solid' | 'outline' | 'minimal';
    loadingMessage: string;
    showLogoOnLoading: boolean;
    showSloganOnLoading: boolean;
    showLoadingMessage: boolean;
  };

  // Personel Kimlik Bilgileri
  staffCredentials: {
    [staffId: string]: {
      username: string;
      password: string;
      panelUrl: string;
      isActive: boolean;
      generated: boolean;
      lastGenerated?: Date;
    };
  };

  // Menü Ayarları
  menuSettings: {
    theme: 'modern' | 'classic' | 'minimal' | 'elegant';
    language: string[];
    allowTableSelection: boolean;
    requireCustomerInfo: boolean;
    showPreparationTime: boolean;
    enableWaiterCall: boolean;
    enableBillRequest: boolean;
    showNutritionInfo: boolean;
    showAllergens: boolean;
    enableFavorites: boolean;
    enableReviews: boolean;
    autoAcceptOrders: boolean;
    orderTimeout: number; // dakika
  };

  // Ödeme Ayarları
  paymentSettings: {
    currency: string;
    taxRate: number;
    serviceCharge: number;
    deliveryFee: number;
    minOrderAmount: number;
    maxOrderAmount: number;
    paymentMethods: ('cash' | 'card' | 'qr' | 'online')[];
    allowTips: boolean;
    tipPercentage: number[];
    enableSplitBill: boolean;
    enableOnlinePayment: boolean;
    onlinePaymentProvider?: 'iyzico' | 'paytr' | 'stripe' | 'paypal';
  };

  // Teknik Ayarlar
  technicalSettings: {
    autoOrderNotifications: boolean;
    orderSoundEnabled: boolean;
    qrCodeAutoRefresh: boolean;
    qrCodeRefreshInterval: number; // dakika
    enableAnalytics: boolean;
    enableBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    enableMaintenanceMode: boolean;
    maintenanceMessage?: string;
    enableApiAccess: boolean;
    apiKey?: string;
  };

  // Müşteri Deneyimi
  customerExperience: {
    enableTableReservation: boolean;
    enableDelivery: boolean;
    deliveryRadius: number; // km
    deliveryFee: number;
    minDeliveryAmount: number;
    enableLoyaltyProgram: boolean;
    loyaltyPointsPerLira: number;
    enableCustomerFeedback: boolean;
    enableSocialLogin: boolean;
    enableGuestCheckout: boolean;
  };

  // Bildirim Ayarları
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    whatsappNotifications: boolean;
    pushNotifications: boolean;
    orderConfirmationEmail: boolean;
    orderReadyNotification: boolean;
    dailyReportEmail: boolean;
    weeklyReportEmail: boolean;
    monthlyReportEmail: boolean;
  };

  // Entegrasyonlar
  integrations: {
    googleAnalytics?: string;
    facebookPixel?: string;
    googleTagManager?: string;
    posSystem?: string;
    accountingSystem?: string;
    crmSystem?: string;
    emailService?: 'sendgrid' | 'mailchimp' | 'custom';
    smsService?: 'twilio' | 'netgsm' | 'custom';
  };

  // Güvenlik Ayarları
  securitySettings: {
    requireStrongPasswords: boolean;
    enableTwoFactorAuth: boolean;
    sessionTimeout: number; // dakika
    maxLoginAttempts: number;
    enableIpWhitelist: boolean;
    allowedIps: string[];
    enableAuditLog: boolean;
  };

  // Yedekleme ve Geri Yükleme
  backupSettings: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    backupRetention: number; // gün
    cloudBackup: boolean;
    localBackup: boolean;
    lastBackup?: Date;
  };
}

// Hesap Bilgileri
export interface AccountInfo {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  lastPasswordChange?: Date;
}

// İşletme İstatistikleri
export interface BusinessStats {
  activeCategories: number;
  activeProducts: number;
  activeAnnouncements: number;
  totalProducts: number;
  totalOrders: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  customerCount: number;
  tableUtilization: number;
  averagePreparationTime: number;
  customerSatisfaction: number;
}

// Hesap Talebi Sistemi
export interface BillRequest {
  id: string;
  orderId: string;
  tableNumber: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'ready' | 'delivered' | 'paid' | 'cancelled';
  requestedBy: 'customer' | 'waiter';
  requestedAt: Date;
  processedAt?: Date;
  deliveredAt?: Date;
  paidAt?: Date;
  waiterId?: string;
  cashierId?: string;
  paymentMethod?: 'cash' | 'card' | 'online';
  notes?: string;
}

// Bildirim Sistemi
export interface Notification {
  id: string;
  type: 'bill_request' | 'bill_ready' | 'payment_completed' | 'table_transfer' | 'waiter_call' | 'water_request' | 'clean_request';
  title: string;
  message: string;
  tableNumber: number;
  orderId?: string;
  billRequestId?: string;
  status: 'unread' | 'read' | 'acknowledged';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  readAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  targetRole: UserRole[];
  isActive: boolean;
}

// Fatura Sistemi
export interface Bill {
  id: string;
  billRequestId: string;
  orderId: string;
  tableNumber: number;
  items: BillItem[];
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  tipAmount: number;
  totalAmount: number;
  status: 'generated' | 'printed' | 'delivered' | 'paid';
  generatedAt: Date;
  printedAt?: Date;
  deliveredAt?: Date;
  paidAt?: Date;
  paymentMethod?: 'cash' | 'card' | 'online';
  cashierId?: string;
  waiterId?: string;
}

export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}
