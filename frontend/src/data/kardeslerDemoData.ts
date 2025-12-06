// Kardeşler Restoranı Demo Verileri - LocalStorage'da saklanacak

export const kardeslerMenuCategories = [
  {
    id: '1',
    restaurantId: 'kardesler',
    name: { tr: 'Soğuk Başlangıçlar', en: 'Cold Appetizers' },
    description: { tr: 'Taze mezeler', en: 'Fresh appetizers' },
    order: 1,
    isActive: true
  },
  {
    id: '2',
    restaurantId: 'kardesler',
    name: { tr: 'Sıcak Başlangıçlar', en: 'Hot Appetizers' },
    description: { tr: 'Kızarmış mezeler', en: 'Fried appetizers' },
    order: 2,
    isActive: true
  },
  {
    id: '3',
    restaurantId: 'kardesler',
    name: { tr: 'Salatalar', en: 'Salads' },
    description: { tr: 'Taze salatalar', en: 'Fresh salads' },
    order: 3,
    isActive: true
  },
  {
    id: '4',
    restaurantId: 'kardesler',
    name: { tr: 'Çorbalar', en: 'Soups' },
    description: { tr: 'Günün çorbaları', en: 'Soups of the day' },
    order: 4,
    isActive: true
  },
  {
    id: '5',
    restaurantId: 'kardesler',
    name: { tr: 'Ana Yemekler', en: 'Main Courses' },
    description: { tr: 'Et ve tavuk yemekleri', en: 'Meat and chicken dishes' },
    order: 5,
    isActive: true
  },
  {
    id: '6',
    restaurantId: 'kardesler',
    name: { tr: 'Tatlılar', en: 'Desserts' },
    description: { tr: 'Ev yapımı tatlılar', en: 'Homemade desserts' },
    order: 6,
    isActive: true
  },
  {
    id: '7',
    restaurantId: 'kardesler',
    name: { tr: 'İçecekler', en: 'Beverages' },
    description: { tr: 'Soğuk ve sıcak içecekler', en: 'Cold and hot beverages' },
    order: 7,
    isActive: true
  }
];

export const kardeslerMenuItems = [
  // Soğuk Başlangıçlar
  {
    id: '1',
    restaurantId: 'kardesler',
    categoryId: '1',
    name: { tr: 'Humus', en: 'Hummus' },
    description: { tr: 'Nohut ezmesi, tahin, zeytinyağı', en: 'Chickpea puree, tahini, olive oil' },
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
    id: '2',
    restaurantId: 'kardesler',
    categoryId: '1',
    name: { tr: 'Haydari', en: 'Haydari' },
    description: { tr: 'Süzme yoğurt, maydonoz, dereotu', en: 'Strained yogurt, parsley, dill' },
    price: 35,
    image: '/menu/haydari.jpg',
    isAvailable: true,
    preparationTime: 5,
    calories: 120,
    allergens: ['dairy'],
    isVegetarian: true
  },
  {
    id: '3',
    restaurantId: 'kardesler',
    categoryId: '1',
    name: { tr: 'Acılı Ezme', en: 'Spicy Ezme' },
    description: { tr: 'Acı biber, domates, soğan, nar ekşisi', en: 'Spicy pepper, tomato, onion, pomegranate molasses' },
    price: 40,
    image: '/menu/ezme.jpg',
    isAvailable: true,
    preparationTime: 5,
    calories: 90,
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isSpicy: true
  },
  // Sıcak Başlangıçlar
  {
    id: '4',
    restaurantId: 'kardesler',
    categoryId: '2',
    name: { tr: 'Sigara Böreği', en: 'Cheese Rolls' },
    description: { tr: 'Lor peyniri, maydonoz, yufka', en: 'Cottage cheese, parsley, phyllo' },
    price: 55,
    image: '/menu/sigara-boregi.jpg',
    isAvailable: true,
    preparationTime: 15,
    calories: 280,
    allergens: ['gluten', 'dairy'],
    isVegetarian: true,
    isPopular: true
  },
  {
    id: '5',
    restaurantId: 'kardesler',
    categoryId: '2',
    name: { tr: 'Kalamar Tava', en: 'Fried Calamari' },
    description: { tr: 'Kalamar halkası, çıtır galeta unu', en: 'Squid rings, crispy breadcrumbs' },
    price: 85,
    image: '/menu/kalamar.jpg',
    isAvailable: true,
    preparationTime: 12,
    calories: 320,
    allergens: ['gluten', 'seafood']
  },
  // Salatalar
  {
    id: '6',
    restaurantId: 'kardesler',
    categoryId: '3',
    name: { tr: 'Çoban Salata', en: 'Shepherd Salad' },
    description: { tr: 'Domates, salatalık, biber, soğan, nar ekşisi', en: 'Tomato, cucumber, pepper, onion, pomegranate molasses' },
    price: 48,
    image: '/menu/coban-salata.jpg',
    isAvailable: true,
    preparationTime: 8,
    calories: 110,
    allergens: [],
    isVegetarian: true,
    isVegan: true
  },
  {
    id: '7',
    restaurantId: 'kardesler',
    categoryId: '3',
    name: { tr: 'Sezar Salata', en: 'Caesar Salad' },
    description: { tr: 'Marul, tavuk, kruton, parmesan, sezar sos', en: 'Lettuce, chicken, croutons, parmesan, caesar dressing' },
    price: 68,
    image: '/menu/sezar.jpg',
    isAvailable: true,
    preparationTime: 10,
    calories: 380,
    allergens: ['gluten', 'dairy'],
    isPopular: true
  },
  // Çorbalar
  {
    id: '8',
    restaurantId: 'kardesler',
    categoryId: '4',
    name: { tr: 'Mercimek Çorbası', en: 'Lentil Soup' },
    description: { tr: 'Kırmızı mercimek, tereyağı, nane', en: 'Red lentils, butter, mint' },
    price: 35,
    image: '/menu/mercimek.jpg',
    isAvailable: true,
    preparationTime: 5,
    calories: 180,
    allergens: ['dairy'],
    isVegetarian: true,
    isPopular: true
  },
  {
    id: '9',
    restaurantId: 'kardesler',
    categoryId: '4',
    name: { tr: 'Ezogelin Çorbası', en: 'Ezogelin Soup' },
    description: { tr: 'Kırmızı mercimek, bulgur, domates', en: 'Red lentils, bulgur, tomato' },
    price: 38,
    image: '/menu/ezogelin.jpg',
    isAvailable: true,
    preparationTime: 5,
    calories: 200,
    allergens: ['gluten'],
    isVegetarian: true
  },
  // Ana Yemekler
  {
    id: '10',
    restaurantId: 'kardesler',
    categoryId: '5',
    name: { tr: 'Adana Kebap', en: 'Adana Kebab' },
    description: { tr: 'Kıyma kebap, acılı, garnitür', en: 'Spicy minced meat kebab, garnish' },
    price: 135,
    image: '/menu/adana.jpg',
    isAvailable: true,
    preparationTime: 20,
    calories: 480,
    allergens: [],
    isPopular: true,
    isSpicy: true
  },
  {
    id: '11',
    restaurantId: 'kardesler',
    categoryId: '5',
    name: { tr: 'Urfa Kebap', en: 'Urfa Kebab' },
    description: { tr: 'Kıyma kebap, baharatlı, garnitür', en: 'Spiced minced meat kebab, garnish' },
    price: 135,
    image: '/menu/urfa.jpg',
    isAvailable: true,
    preparationTime: 20,
    calories: 470,
    allergens: [],
    isPopular: true
  },
  {
    id: '12',
    restaurantId: 'kardesler',
    categoryId: '5',
    name: { tr: 'Tavuk Şiş', en: 'Chicken Shish' },
    description: { tr: 'Marine edilmiş tavuk göğsü, garnitür', en: 'Marinated chicken breast, garnish' },
    price: 98,
    image: '/menu/tavuk-sis.jpg',
    isAvailable: true,
    preparationTime: 18,
    calories: 360,
    allergens: []
  },
  {
    id: '13',
    restaurantId: 'kardesler',
    categoryId: '5',
    name: { tr: 'Kuzu Pirzola', en: 'Lamb Chops' },
    description: { tr: 'Izgara kuzu pirzola, garnitür', en: 'Grilled lamb chops, garnish' },
    price: 185,
    image: '/menu/pirzola.jpg',
    isAvailable: true,
    preparationTime: 22,
    calories: 520,
    allergens: []
  },
  // Tatlılar
  {
    id: '14',
    restaurantId: 'kardesler',
    categoryId: '6',
    name: { tr: 'Künefe', en: 'Kunefe' },
    description: { tr: 'Tel kadayıf, peynir, şerbet, fıstık', en: 'Shredded phyllo, cheese, syrup, pistachio' },
    price: 75,
    image: '/menu/kunefe.jpg',
    isAvailable: true,
    preparationTime: 15,
    calories: 420,
    allergens: ['gluten', 'dairy', 'nuts'],
    isVegetarian: true,
    isPopular: true
  },
  {
    id: '15',
    restaurantId: 'kardesler',
    categoryId: '6',
    name: { tr: 'Sütlaç', en: 'Rice Pudding' },
    description: { tr: 'Fırında sütlaç, tarçın', en: 'Baked rice pudding, cinnamon' },
    price: 45,
    image: '/menu/sutlac.jpg',
    isAvailable: true,
    preparationTime: 5,
    calories: 280,
    allergens: ['dairy'],
    isVegetarian: true
  },
  {
    id: '16',
    restaurantId: 'kardesler',
    categoryId: '6',
    name: { tr: 'Baklava', en: 'Baklava' },
    description: { tr: 'Fıstıklı baklava, şerbet', en: 'Pistachio baklava, syrup' },
    price: 65,
    image: '/menu/baklava.jpg',
    isAvailable: true,
    preparationTime: 5,
    calories: 380,
    allergens: ['gluten', 'nuts'],
    isVegetarian: true,
    isPopular: true
  },
  // İçecekler
  {
    id: '17',
    restaurantId: 'kardesler',
    categoryId: '7',
    name: { tr: 'Ayran', en: 'Ayran' },
    description: { tr: 'Ev yapımı ayran', en: 'Homemade yogurt drink' },
    price: 15,
    image: '/menu/ayran.jpg',
    isAvailable: true,
    preparationTime: 2,
    calories: 80,
    allergens: ['dairy'],
    isVegetarian: true
  },
  {
    id: '18',
    restaurantId: 'kardesler',
    categoryId: '7',
    name: { tr: 'Şalgam Suyu', en: 'Turnip Juice' },
    description: { tr: 'Acılı şalgam suyu', en: 'Spicy turnip juice' },
    price: 18,
    image: '/menu/salgam.jpg',
    isAvailable: true,
    preparationTime: 2,
    calories: 30,
    allergens: [],
    isVegetarian: true,
    isVegan: true
  },
  {
    id: '19',
    restaurantId: 'kardesler',
    categoryId: '7',
    name: { tr: 'Çay', en: 'Tea' },
    description: { tr: 'Demlik çay', en: 'Turkish tea' },
    price: 10,
    image: '/menu/cay.jpg',
    isAvailable: true,
    preparationTime: 3,
    calories: 2,
    allergens: [],
    isVegetarian: true,
    isVegan: true
  },
  {
    id: '20',
    restaurantId: 'kardesler',
    categoryId: '7',
    name: { tr: 'Türk Kahvesi', en: 'Turkish Coffee' },
    description: { tr: 'Geleneksel Türk kahvesi', en: 'Traditional Turkish coffee' },
    price: 25,
    image: '/menu/kahve.jpg',
    isAvailable: true,
    preparationTime: 8,
    calories: 12,
    allergens: [],
    isVegetarian: true,
    isVegan: true
  }
];

// İlk yükleme için localStorage'a kaydet
export const initializeKardeslerData = () => {
  const storageKey = 'restaurant-storage';
  const existingData = localStorage.getItem(storageKey);
  
  if (existingData) {
    try {
      const parsed = JSON.parse(existingData);
      
      // Eğer Kardeşler restoranı verisi yoksa ekle
      if (parsed.state) {
        const hasKardeslerData = parsed.state.categories?.some((c: any) => c.restaurantId === 'kardesler');
        
        if (!hasKardeslerData) {
          parsed.state.categories = [...(parsed.state.categories || []), ...kardeslerMenuCategories];
          parsed.state.menuItems = [...(parsed.state.menuItems || []), ...kardeslerMenuItems];
          localStorage.setItem(storageKey, JSON.stringify(parsed));
          console.log('Kardeşler demo verileri yüklendi');
        }
      }
    } catch (e) {
      console.error('LocalStorage parse hatası:', e);
    }
  }
};
