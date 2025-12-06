// Kardesler Restoranı Gerçek Verilerini localStorage'a Kaydet

export const kardeslerRestaurant = {
  id: 'kardesler',
  name: 'Kardeşler Lokantası',
  username: 'kardesler',
  email: 'info@kardesler.com',
  phone: '0212 123 45 67',
  address: 'Kadıköy, İstanbul',
  tableCount: 15,
  primaryColor: '#8B4513',
  secondaryColor: '#DAA520',
  ownerId: 'owner_kardesler',
  qrCodes: [],
  settings: {
    language: ['tr'],
    currency: 'TRY',
    taxRate: 0.08,
    serviceChargeRate: 0.10,
    allowTips: true,
    allowOnlinePayment: true,
    autoAcceptOrders: false,
    workingHours: [
      { day: 'Monday', open: '09:00', close: '22:00', isOpen: true },
      { day: 'Tuesday', open: '09:00', close: '22:00', isOpen: true },
      { day: 'Wednesday', open: '09:00', close: '22:00', isOpen: true },
      { day: 'Thursday', open: '09:00', close: '22:00', isOpen: true },
      { day: 'Friday', open: '09:00', close: '23:00', isOpen: true },
      { day: 'Saturday', open: '09:00', close: '23:00', isOpen: true },
      { day: 'Sunday', open: '10:00', close: '22:00', isOpen: true }
    ]
  },
  subscription: {
    plan: 'premium' as const,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    status: 'active' as const
  },
  features: ['qr_menu', 'online_orders', 'staff_management'],
  createdAt: new Date('2024-01-01'),
  status: 'active' as const,
  totalOrders: 1250
};

export const kardeslerCategories = [
  {
    id: 'cat_kardesler_1',
    restaurantId: 'kardesler',
    name: { tr: 'Soğuk Başlangıçlar', en: 'Cold Appetizers' },
    description: { tr: 'Taze mezeler ve soğuk başlangıçlar', en: 'Fresh appetizers and cold starters' },
    order: 1,
    isActive: true
  },
  {
    id: 'cat_kardesler_2',
    restaurantId: 'kardesler',
    name: { tr: 'Sıcak Başlangıçlar', en: 'Hot Appetizers' },
    description: { tr: 'Kızarmış mezeler ve sıcak başlangıçlar', en: 'Fried appetizers and hot starters' },
    order: 2,
    isActive: true
  },
  {
    id: 'cat_kardesler_3',
    restaurantId: 'kardesler',
    name: { tr: 'Salatalar', en: 'Salads' },
    description: { tr: 'Taze salatalar ve yeşillikler', en: 'Fresh salads and greens' },
    order: 3,
    isActive: true
  },
  {
    id: 'cat_kardesler_4',
    restaurantId: 'kardesler',
    name: { tr: 'Çorbalar', en: 'Soups' },
    description: { tr: 'Günün çorbaları ve ev yapımı çorbalar', en: 'Soups of the day and homemade soups' },
    order: 4,
    isActive: true
  },
  {
    id: 'cat_kardesler_5',
    restaurantId: 'kardesler',
    name: { tr: 'Ana Yemekler', en: 'Main Courses' },
    description: { tr: 'Et ve tavuk yemekleri', en: 'Meat and chicken dishes' },
    order: 5,
    isActive: true
  },
  {
    id: 'cat_kardesler_6',
    restaurantId: 'kardesler',
    name: { tr: 'Tatlılar', en: 'Desserts' },
    description: { tr: 'Ev yapımı tatlılar', en: 'Homemade desserts' },
    order: 6,
    isActive: true
  },
  {
    id: 'cat_kardesler_7',
    restaurantId: 'kardesler',
    name: { tr: 'İçecekler', en: 'Beverages' },
    description: { tr: 'Soğuk ve sıcak içecekler', en: 'Cold and hot beverages' },
    order: 7,
    isActive: true
  }
];

export const kardeslerMenuItems = [
  // Soğuk Başlangıçlar (3 ürün)
  {
    id: 'item_kardesler_1',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_1',
    name: { tr: 'Humus', en: 'Hummus' },
    description: { tr: 'Nohut ezmesi, tahin, zeytinyağı ve baharatlarla', en: 'Chickpea puree with tahini, olive oil and spices' },
    price: 45,
    image: '/menu/humus.jpg',
    order: 1,
    isAvailable: true,
    preparationTime: 5,
    calories: 180,
    allergens: ['gluten'],
    isVegetarian: true,
    isVegan: true,
    isPopular: true
  },
  {
    id: 'item_kardesler_2',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_1',
    name: { tr: 'Haydari', en: 'Haydari' },
    description: { tr: 'Süzme yoğurt, maydanoz, dereotu ve sarımsak', en: 'Strained yogurt with parsley, dill and garlic' },
    price: 35,
    image: '/menu/haydari.jpg',
    order: 2,
    isAvailable: true,
    preparationTime: 5,
    calories: 120,
    allergens: ['dairy'],
    isVegetarian: true,
    isVegan: false
  },
  {
    id: 'item_kardesler_3',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_1',
    name: { tr: 'Acılı Ezme', en: 'Spicy Ezme' },
    description: { tr: 'Acı biber, domates, soğan ve nar ekşisi', en: 'Spicy pepper, tomato, onion and pomegranate molasses' },
    price: 40,
    image: '/menu/ezme.jpg',
    order: 3,
    isAvailable: true,
    preparationTime: 5,
    calories: 90,
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isSpicy: true
  },

  // Sıcak Başlangıçlar (2 ürün)
  {
    id: 'item_kardesler_4',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_2',
    name: { tr: 'Sigara Böreği', en: 'Cheese Rolls' },
    description: { tr: 'Lor peyniri, maydanoz ve yufka ile sarılmış', en: 'Rolled with cottage cheese, parsley and phyllo' },
    price: 55,
    image: '/menu/sigara-boregi.jpg',
    order: 4,
    isAvailable: true,
    preparationTime: 15,
    calories: 280,
    allergens: ['gluten', 'dairy'],
    isVegetarian: true,
    isPopular: true
  },
  {
    id: 'item_kardesler_5',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_2',
    name: { tr: 'Kalamar Tava', en: 'Fried Calamari' },
    description: { tr: 'Kalamar halkası, çıtır galeta unu ile', en: 'Squid rings with crispy breadcrumbs' },
    price: 85,
    image: '/menu/kalamar.jpg',
    order: 5,
    isAvailable: true,
    preparationTime: 12,
    calories: 320,
    allergens: ['gluten', 'seafood']
  },

  // Salatalar (2 ürün)
  {
    id: 'item_kardesler_6',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_3',
    name: { tr: 'Çoban Salata', en: 'Shepherd Salad' },
    description: { tr: 'Domates, salatalık, biber, soğan ve nar ekşisi', en: 'Tomato, cucumber, pepper, onion and pomegranate molasses' },
    price: 48,
    image: '/menu/coban-salata.jpg',
    order: 6,
    isAvailable: true,
    preparationTime: 8,
    calories: 110,
    allergens: [],
    isVegetarian: true,
    isVegan: true
  },
  {
    id: 'item_kardesler_7',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_3',
    name: { tr: 'Sezar Salata', en: 'Caesar Salad' },
    description: { tr: 'Marul, tavuk, kruton, parmesan ve sezar sos', en: 'Lettuce, chicken, croutons, parmesan and caesar dressing' },
    price: 68,
    image: '/menu/sezar.jpg',
    order: 7,
    isAvailable: true,
    preparationTime: 10,
    calories: 380,
    allergens: ['gluten', 'dairy'],
    isPopular: true
  },

  // Çorbalar (2 ürün)
  {
    id: 'item_kardesler_8',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_4',
    name: { tr: 'Mercimek Çorbası', en: 'Lentil Soup' },
    description: { tr: 'Kırmızı mercimek, tereyağı ve nane ile', en: 'Red lentils with butter and mint' },
    price: 35,
    image: '/menu/mercimek.jpg',
    order: 8,
    isAvailable: true,
    preparationTime: 5,
    calories: 180,
    allergens: ['dairy'],
    isVegetarian: true,
    isPopular: true
  },
  {
    id: 'item_kardesler_9',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_4',
    name: { tr: 'Ezogelin Çorbası', en: 'Ezogelin Soup' },
    description: { tr: 'Bulgur, mercimek, domates ve baharatlarla', en: 'Bulgur, lentils, tomatoes and spices' },
    price: 38,
    image: '/menu/ezogelin.jpg',
    order: 9,
    isAvailable: true,
    preparationTime: 8,
    calories: 200,
    allergens: ['gluten'],
    isVegetarian: true,
    isVegan: true
  },

  // Ana Yemekler (6 ürün)
  {
    id: 'item_kardesler_10',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_5',
    name: { tr: 'Kuzu Tandır', en: 'Lamb Tandoori' },
    description: { tr: 'Yavaş pişmiş kuzu eti, pilav ve salata ile', en: 'Slow-cooked lamb with rice and salad' },
    price: 120,
    image: '/menu/kuzu-tandir.jpg',
    order: 10,
    isAvailable: true,
    preparationTime: 25,
    calories: 650,
    allergens: [],
    isPopular: true
  },
  {
    id: 'item_kardesler_11',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_5',
    name: { tr: 'Tavuk Şiş', en: 'Chicken Shish' },
    description: { tr: 'Marine edilmiş tavuk göğsü, pilav ve mezelerle', en: 'Marinated chicken breast with rice and appetizers' },
    price: 95,
    image: '/menu/tavuk-sis.jpg',
    order: 11,
    isAvailable: true,
    preparationTime: 20,
    calories: 580,
    allergens: []
  },
  {
    id: 'item_kardesler_12',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_5',
    name: { tr: 'Adana Kebap', en: 'Adana Kebab' },
    description: { tr: 'Acılı kıyma, lavaş ve salata ile', en: 'Spicy minced meat with lavash and salad' },
    price: 110,
    image: '/menu/adana-kebap.jpg',
    order: 12,
    isAvailable: true,
    preparationTime: 18,
    calories: 620,
    allergens: [],
    isSpicy: true,
    isPopular: true
  },
  {
    id: 'item_kardesler_13',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_5',
    name: { tr: 'Urfa Kebap', en: 'Urfa Kebab' },
    description: { tr: 'Acısız kıyma, lavaş ve salata ile', en: 'Non-spicy minced meat with lavash and salad' },
    price: 110,
    image: '/menu/urfa-kebap.jpg',
    order: 13,
    isAvailable: true,
    preparationTime: 18,
    calories: 600,
    allergens: []
  },
  {
    id: 'item_kardesler_14',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_5',
    name: { tr: 'Köfte', en: 'Meatballs' },
    description: { tr: 'Ev yapımı köfte, pilav ve salata ile', en: 'Homemade meatballs with rice and salad' },
    price: 85,
    image: '/menu/kofte.jpg',
    order: 14,
    isAvailable: true,
    preparationTime: 15,
    calories: 550,
    allergens: []
  },
  {
    id: 'item_kardesler_15',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_5',
    name: { tr: 'Balık Tava', en: 'Fried Fish' },
    description: { tr: 'Günün balığı, pilav ve salata ile', en: 'Fish of the day with rice and salad' },
    price: 95,
    image: '/menu/balik-tava.jpg',
    order: 15,
    isAvailable: true,
    preparationTime: 22,
    calories: 520,
    allergens: ['fish']
  },

  // Tatlılar (3 ürün)
  {
    id: 'item_kardesler_16',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_6',
    name: { tr: 'Baklava', en: 'Baklava' },
    description: { tr: 'Ev yapımı baklava, fıstık ve şerbet ile', en: 'Homemade baklava with pistachios and syrup' },
    price: 65,
    image: '/menu/baklava.jpg',
    order: 16,
    isAvailable: true,
    preparationTime: 5,
    calories: 420,
    allergens: ['gluten', 'nuts'],
    isVegetarian: true,
    isPopular: true
  },
  {
    id: 'item_kardesler_17',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_6',
    name: { tr: 'Künefe', en: 'Kunefe' },
    description: { tr: 'Sıcak künefe, kaymak ve şerbet ile', en: 'Hot kunefe with cream and syrup' },
    price: 70,
    image: '/menu/kunefe.jpg',
    order: 17,
    isAvailable: true,
    preparationTime: 10,
    calories: 480,
    allergens: ['gluten', 'dairy'],
    isVegetarian: true,
    isPopular: true
  },
  {
    id: 'item_kardesler_18',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_6',
    name: { tr: 'Sütlaç', en: 'Rice Pudding' },
    description: { tr: 'Ev yapımı sütlaç, tarçın ile', en: 'Homemade rice pudding with cinnamon' },
    price: 45,
    image: '/menu/sutlac.jpg',
    order: 18,
    isAvailable: true,
    preparationTime: 5,
    calories: 280,
    allergens: ['dairy'],
    isVegetarian: true
  },

  // İçecekler (2 ürün)
  {
    id: 'item_kardesler_19',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_7',
    name: { tr: 'Ayran', en: 'Ayran' },
    description: { tr: 'Ev yapımı ayran', en: 'Homemade ayran' },
    price: 15,
    image: '/menu/ayran.jpg',
    order: 19,
    isAvailable: true,
    preparationTime: 2,
    calories: 80,
    allergens: ['dairy'],
    isVegetarian: true
  },
  {
    id: 'item_kardesler_20',
    restaurantId: 'kardesler',
    categoryId: 'cat_kardesler_7',
    name: { tr: 'Çay', en: 'Turkish Tea' },
    description: { tr: 'Türk çayı, şeker ile', en: 'Turkish tea with sugar' },
    price: 8,
    image: '/menu/cay.jpg',
    order: 20,
    isAvailable: true,
    preparationTime: 3,
    calories: 10,
    allergens: [],
    isVegetarian: true,
    isVegan: true
  }
];

// localStorage'a kaydetme fonksiyonu
export const saveKardeslerDataToLocalStorage = () => {
  const storageKey = 'restaurant-storage';
  
  // Mevcut veriyi al
  const existingData = localStorage.getItem(storageKey);
  let parsedData;
  
  if (existingData) {
    try {
      parsedData = JSON.parse(existingData);
    } catch (e) {
      console.error('LocalStorage parse hatası:', e);
      parsedData = { state: {} };
    }
  } else {
    parsedData = { state: {} };
  }
  
  // State'i başlat
  if (!parsedData.state) {
    parsedData.state = {};
  }
  
  // Restoranları kontrol et ve ekle
  if (!parsedData.state.restaurants) {
    parsedData.state.restaurants = [];
  }
  
  // Kardesler restoranı var mı kontrol et
  const existingRestaurantIndex = parsedData.state.restaurants.findIndex((r: any) => r.id === 'kardesler');
  
  if (existingRestaurantIndex >= 0) {
    // Mevcut restoranı güncelle
    parsedData.state.restaurants[existingRestaurantIndex] = kardeslerRestaurant;
  } else {
    // Yeni restoran ekle
    parsedData.state.restaurants.push(kardeslerRestaurant);
  }
  
  // Kategorileri kontrol et ve ekle
  if (!parsedData.state.categories) {
    parsedData.state.categories = [];
  }
  
  // Mevcut kardesler kategorilerini kaldır
  parsedData.state.categories = parsedData.state.categories.filter((c: any) => c.restaurantId !== 'kardesler');
  
  // Yeni kategorileri ekle
  parsedData.state.categories.push(...kardeslerCategories);
  
  // Menü ürünlerini kontrol et ve ekle
  if (!parsedData.state.menuItems) {
    parsedData.state.menuItems = [];
  }
  
  // Mevcut kardesler ürünlerini kaldır
  parsedData.state.menuItems = parsedData.state.menuItems.filter((i: any) => i.restaurantId !== 'kardesler');
  
  // Yeni ürünleri ekle
  parsedData.state.menuItems.push(...kardeslerMenuItems);
  
  // localStorage'a kaydet
  localStorage.setItem(storageKey, JSON.stringify(parsedData));
  
  console.log('✅ Kardesler restoranı verileri localStorage\'a kaydedildi:');
  console.log(`📊 Restoran: ${kardeslerRestaurant.name}`);
  console.log(`📂 Kategoriler: ${kardeslerCategories.length} adet`);
  console.log(`🍽️ Ürünler: ${kardeslerMenuItems.length} adet`);
  
  return {
    restaurant: kardeslerRestaurant,
    categories: kardeslerCategories,
    menuItems: kardeslerMenuItems
  };
};

// Sayfa yüklendiğinde otomatik kaydet
if (typeof window !== 'undefined') {
  // Sadece bir kez kaydet
  const hasKardeslerData = localStorage.getItem('restaurant-storage')?.includes('kardesler');
  if (!hasKardeslerData) {
    saveKardeslerDataToLocalStorage();
  }
}
