// Demo İşletme Paneli İçin Demo Veriler

export const demoRestaurant = {
  id: 'demo-restaurant',
  name: 'RestXQr Demo Restoran',
  email: 'demo@restxqr.com',
  description: 'Modern restoran yönetim sistemi ile işletmenizi büyütün',
  address: 'İstanbul, Türkiye',
  phone: '+90 555 123 45 67',
  currency: 'TRY',
  logo: null
};

export const demoCategories = [
  {
    id: 'cat-1',
    restaurantId: 'demo-restaurant',
    name: 'Kahvaltılar',
    description: 'Günün ilk öğünü için lezzetli seçenekler',
    imageUrl: null,
    displayOrder: 1,
    isActive: true
  },
  {
    id: 'cat-2',
    restaurantId: 'demo-restaurant',
    name: 'Ana Yemekler',
    description: 'Özenle hazırlanmış ana yemeklerimiz',
    imageUrl: null,
    displayOrder: 2,
    isActive: true
  },
  {
    id: 'cat-3',
    restaurantId: 'demo-restaurant',
    name: 'Tatlılar',
    description: 'Özel lezzetli tatlılarımız',
    imageUrl: null,
    displayOrder: 3,
    isActive: true
  },
  {
    id: 'cat-4',
    restaurantId: 'demo-restaurant',
    name: 'İçecekler',
    description: 'Soğuk ve sıcak içecekler',
    imageUrl: null,
    displayOrder: 4,
    isActive: true
  },
  {
    id: 'cat-5',
    restaurantId: 'demo-restaurant',
    name: 'Salatalar',
    description: 'Taze ve sağlıklı salatalar',
    imageUrl: null,
    displayOrder: 5,
    isActive: true
  }
];

export const demoMenuItems = [
  {
    id: 'item-1',
    restaurantId: 'demo-restaurant',
    name: 'Serpme Kahvaltı',
    description: 'Serpme kahvaltı tabağı (bal, kaymak, peynirler, yumurta)',
    price: 150,
    categoryId: 'cat-1',
    imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop',
    isAvailable: true,
    isPopular: true,
    preparationTime: 20,
    calories: 650,
    ingredients: 'Bal, kaymak, beyaz peynir, kaşar, yumurta, domates, salatalık',
    allergens: [],
    portion: '2 kişilik',
    isActive: true
  },
  {
    id: 'item-2',
    restaurantId: 'demo-restaurant',
    name: 'Menemen',
    description: 'Geleneksel menemen',
    price: 45,
    categoryId: 'cat-1',
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
    isAvailable: true,
    isPopular: true,
    preparationTime: 15,
    calories: 280,
    ingredients: 'Yumurta, domates, biber, yağ',
    allergens: ['eggs'],
    portion: '1 kişilik',
    isActive: true
  },
  {
    id: 'item-3',
    restaurantId: 'demo-restaurant',
    name: 'Izgara Köfte',
    description: 'Özel baharatlarla hazırlanmış ızgara köfte',
    price: 85,
    categoryId: 'cat-2',
    imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop',
    isAvailable: true,
    isPopular: true,
    preparationTime: 30,
    calories: 420,
    ingredients: 'Kıyma, soğan, ekmek, baharatlar',
    allergens: ['gluten', 'eggs'],
    portion: '1 kişilik',
    isActive: true
  },
  {
    id: 'item-4',
    restaurantId: 'demo-restaurant',
    name: 'Adana Kebap',
    description: 'Acılı adana kebap, pilav ve salata',
    price: 120,
    categoryId: 'cat-2',
    imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop',
    isAvailable: true,
    isPopular: true,
    preparationTime: 25,
    calories: 580,
    ingredients: 'Kuzu eti, acı biber, pilav, salata',
    allergens: ['gluten'],
    portion: '1 kişilik',
    isActive: true
  },
  {
    id: 'item-5',
    restaurantId: 'demo-restaurant',
    name: 'Baklava',
    description: 'Ev yapımı özel baklava (3 parça)',
    price: 55,
    categoryId: 'cat-3',
    imageUrl: 'https://images.unsplash.com/photo-1598110750624-207050c4f28c?w=400&h=300&fit=crop',
    isAvailable: true,
    isPopular: true,
    preparationTime: 10,
    calories: 320,
    ingredients: 'Yufka, ceviz, tereyağı, şerbet',
    allergens: ['gluten', 'nuts'],
    portion: '3 parça',
    isActive: true
  },
  {
    id: 'item-6',
    restaurantId: 'demo-restaurant',
    name: 'Sütlaç',
    description: 'Soğuk sütlaç',
    price: 35,
    categoryId: 'cat-3',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
    isAvailable: true,
    isPopular: true,
    preparationTime: 15,
    calories: 150,
    ingredients: 'Pirinç, süt, şeker',
    allergens: ['milk'],
    portion: '1 porsiyon',
    isActive: true
  },
  {
    id: 'item-7',
    restaurantId: 'demo-restaurant',
    name: 'Türk Kahvesi',
    description: 'Geleneksel Türk kahvesi',
    price: 25,
    categoryId: 'cat-4',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop',
    isAvailable: true,
    isPopular: true,
    preparationTime: 10,
    calories: 15,
    ingredients: 'Kahve, şeker, su',
    allergens: [],
    portion: '1 fincan',
    isActive: true
  },
  {
    id: 'item-8',
    restaurantId: 'demo-restaurant',
    name: 'Taze Sıkılmış Portakal Suyu',
    description: 'Günlük taze portakal suyu',
    price: 45,
    categoryId: 'cat-4',
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop',
    isAvailable: true,
    isPopular: true,
    preparationTime: 5,
    calories: 100,
    ingredients: 'Portakal',
    allergens: [],
    portion: '200ml',
    isActive: true
  },
  {
    id: 'item-9',
    restaurantId: 'demo-restaurant',
    name: 'Çoban Salata',
    description: 'Taze domates, salatalık, soğan, maydanoz',
    price: 30,
    categoryId: 'cat-5',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    isAvailable: true,
    isPopular: true,
    preparationTime: 10,
    calories: 80,
    ingredients: 'Domates, salatalık, soğan, maydanoz, zeytinyağı',
    allergens: [],
    portion: '1 porsiyon',
    isActive: true
  },
  {
    id: 'item-10',
    restaurantId: 'demo-restaurant',
    name: 'Akdeniz Salata',
    description: 'Yeşil salata, peynir, zeytin, domates',
    price: 55,
    categoryId: 'cat-5',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    isAvailable: true,
    isPopular: true,
    preparationTime: 12,
    calories: 220,
    ingredients: 'Yeşil salata, beyaz peynir, siyah zeytin, domates, salatalık',
    allergens: ['milk'],
    portion: '1 porsiyon',
    isActive: true
  }
];

export const demoStaff = [
  {
    id: 'staff-1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@restxqr.com',
    role: 'waiter',
    phone: '+90 555 111 22 33',
    username: 'ahmet',
    password: 'demo123',
    department: 'service',
    notes: 'Deneyimli garson',
    status: 'active',
    isActive: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'staff-2',
    name: 'Mehmet Demir',
    email: 'mehmet@restxqr.com',
    role: 'chef',
    phone: '+90 555 222 33 44',
    username: 'mehmet',
    password: 'demo123',
    department: 'kitchen',
    notes: 'Deneyimli şef',
    status: 'active',
    isActive: true,
    createdAt: new Date('2024-01-10')
  },
  {
    id: 'staff-3',
    name: 'Ayşe Kaya',
    email: 'ayse@restxqr.com',
    role: 'cashier',
    phone: '+90 555 333 44 55',
    username: 'ayse',
    password: 'demo123',
    department: 'finance',
    notes: 'Kasiyer',
    status: 'active',
    isActive: true,
    createdAt: new Date('2024-01-20')
  },
  {
    id: 'staff-4',
    name: 'Fatma Öz',
    email: 'fatma@restxqr.com',
    role: 'waiter',
    phone: '+90 555 444 55 66',
    username: 'fatma',
    password: 'demo123',
    department: 'service',
    notes: 'Garson',
    status: 'active',
    isActive: true,
    createdAt: new Date('2024-02-01')
  }
];

export const demoQRCodes = [
  { id: 'qr-1', tableNumber: 1, token: 'demo-token-1', qrCode: 'data:image/svg+xml,...' },
  { id: 'qr-2', tableNumber: 2, token: 'demo-token-2', qrCode: 'data:image/svg+xml,...' },
  { id: 'qr-3', tableNumber: 3, token: 'demo-token-3', qrCode: 'data:image/svg+xml,...' },
  { id: 'qr-4', tableNumber: 4, token: 'demo-token-4', qrCode: 'data:image/svg+xml,...' },
  { id: 'qr-5', tableNumber: 5, token: 'demo-token-5', qrCode: 'data:image/svg+xml,...' }
];

export const demoReports = {
  todaySales: 8450,
  todayOrders: 47,
  todayRevenue: 8450,
  monthlyRevenue: 124500,
  monthlyOrders: 156,
  averageRating: 4.8,
  topProducts: [
    { name: 'Adana Kebap', sales: 45, revenue: 5400 },
    { name: 'Izgara Köfte', sales: 38, revenue: 3230 },
    { name: 'Serpme Kahvaltı', sales: 32, revenue: 4800 }
  ]
};
