export interface MenuItem {
  id: string;
  name: {
    en: string;
    tr: string;
  };
  description: {
    en: string;
    tr: string;
  };
  price: number;
  image: string;
  category: string;
  popular: boolean;
  isAvailable?: boolean;
  allergens?: Array<string | {en: string; tr: string}>;
  calories?: number;
  servingInfo?: {
    en: string;
    tr: string;
  };
}

export const menuData: MenuItem[] = [
  // Popular Items
  {
    id: 'beef-burger',
    name: {
      en: 'Gourmet Beef Burger',
      tr: 'Gurme Burger'
    },
    description: {
      en: 'Premium beef patty with caramelized onions, cheddar cheese, and special sauce on a brioche bun',
      tr: 'Özel soslu, karamelize soğanlı, cheddar peynirli premium dana köfte ve brioche ekmek'
    },
    price: 120,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500',
    category: 'mains',
    popular: true,
    allergens: [
      { en: 'Gluten', tr: 'Gluten' },
      { en: 'Dairy', tr: 'Süt Ürünleri' }
    ],
    calories: 850,
    servingInfo: {
      en: 'Served with french fries and coleslaw',
      tr: 'Patates kızartması ve coleslaw ile servis edilir'
    }
  },
  {
    id: 'caesar-salad',
    name: {
      en: 'Chicken Caesar Salad',
      tr: 'Tavuklu Sezar Salata'
    },
    description: {
      en: 'Crisp romaine lettuce, grilled chicken, parmesan cheese, croutons, and Caesar dressing',
      tr: 'Taze marul, ızgara tavuk, parmesan peyniri, kruton ve Sezar sosu'
    },
    price: 85,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=500',
    category: 'starters',
    popular: true,
    allergens: [
      { en: 'Gluten', tr: 'Gluten' },
      { en: 'Dairy', tr: 'Süt Ürünleri' },
      { en: 'Eggs', tr: 'Yumurta' },
      { en: 'Fish', tr: 'Balık' }
    ],
    calories: 450,
    servingInfo: {
      en: 'Available as a starter or main course',
      tr: 'Başlangıç veya ana yemek olarak servis edilebilir'
    }
  },
  {
    id: 'tiramisu',
    name: {
      en: 'Classic Tiramisu',
      tr: 'Klasik Tiramisu'
    },
    description: {
      en: 'Layers of coffee-soaked ladyfingers and mascarpone cream dusted with cocoa powder',
      tr: 'Kahve ile ıslatılmış kedidili bisküvi ve mascarpone kreması katmanları, kakao ile süslenmiş'
    },
    price: 65,
    image: 'https://images.unsplash.com/photo-1571877899317-1c3e516f3d51?q=80&w=500',
    category: 'desserts',
    popular: true,
    allergens: [
      { en: 'Gluten', tr: 'Gluten' },
      { en: 'Dairy', tr: 'Süt Ürünleri' },
      { en: 'Eggs', tr: 'Yumurta' }
    ],
    calories: 420,
    servingInfo: {
      en: 'Served chilled',
      tr: 'Soğuk servis edilir'
    }
  },
  
  // Starters
  {
    id: 'bruschetta',
    name: {
      en: 'Tomato Bruschetta',
      tr: 'Domates Bruschetta'
    },
    description: {
      en: 'Toasted bread topped with fresh tomatoes, basil, garlic, and extra virgin olive oil',
      tr: 'Taze domates, fesleğen, sarımsak ve sızma zeytinyağı ile süslenmiş kızarmış ekmek'
    },
    price: 55,
    image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?q=80&w=500',
    category: 'starters',
    popular: false,
    allergens: [
      { en: 'Gluten', tr: 'Gluten' }
    ],
    calories: 320,
    servingInfo: {
      en: 'Served as 4 pieces',
      tr: '4 parça olarak servis edilir'
    }
  },
  {
    id: 'calamari',
    name: {
      en: 'Crispy Calamari',
      tr: 'Çıtır Kalamar'
    },
    description: {
      en: 'Lightly battered and fried squid rings served with lemon aioli',
      tr: 'Hafif hamurlu ve kızarmış kalamar halkaları, limonlu aioli ile servis edilir'
    },
    price: 75,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=500',
    category: 'starters',
    popular: false,
    allergens: [
      { en: 'Dairy', tr: 'Süt Ürünleri' },
      { en: 'Eggs', tr: 'Yumurta' },
      { en: 'Seafood', tr: 'Deniz Ürünleri' }
    ],
    calories: 380,
    servingInfo: {
      en: 'Served with lemon wedges',
      tr: 'Limon dilimleri ile servis edilir'
    }
  },
  
  // Main Dishes - Meats
  {
    id: 'ribeye-steak',
    name: {
      en: 'Ribeye Steak',
      tr: 'Antrikot Steak'
    },
    description: {
      en: '300g prime ribeye steak cooked to your preference with herb butter',
      tr: 'Tercihinize göre pişirilmiş 300g birinci sınıf antrikot, otlu tereyağı ile'
    },
    price: 220,
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=500',
    category: 'meats',
    popular: false,
    allergens: [
      { en: 'Dairy', tr: 'Süt Ürünleri' }
    ],
    calories: 720,
    servingInfo: {
      en: 'Served with roasted vegetables and choice of potato',
      tr: 'Fırınlanmış sebzeler ve patates seçeneği ile servis edilir'
    }
  },
  {
    id: 'lamb-chops',
    name: {
      en: 'Herb-Crusted Lamb Chops',
      tr: 'Otlu Kuzu Pirzola'
    },
    description: {
      en: 'Tender lamb chops with a Mediterranean herb crust, grilled to perfection',
      tr: 'Akdeniz otları ile kaplanmış, mükemmel pişirilmiş yumuşak kuzu pirzolalar'
    },
    price: 190,
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=500',
    category: 'meats',
    popular: false,
    allergens: [
      { en: 'Nuts', tr: 'Kuruyemiş' }
    ],
    calories: 650,
    servingInfo: {
      en: 'Served with mint sauce and roasted potatoes',
      tr: 'Nane sosu ve fırınlanmış patates ile servis edilir'
    }
  },
  
  // Main Dishes - Chicken
  {
    id: 'chicken-parmesan',
    name: {
      en: 'Chicken Parmesan',
      tr: 'Tavuk Parmesan'
    },
    description: {
      en: 'Breaded chicken breast topped with marinara sauce and melted mozzarella',
      tr: 'Domates sosu ve eritilmiş mozzarella ile kaplanmış galeta unlu tavuk göğsü'
    },
    price: 110,
    image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?q=80&w=500',
    category: 'chicken',
    popular: false,
    allergens: [
      { en: 'Gluten', tr: 'Gluten' },
      { en: 'Dairy', tr: 'Süt Ürünleri' },
      { en: 'Eggs', tr: 'Yumurta' }
    ],
    calories: 680,
    servingInfo: {
      en: 'Served with spaghetti marinara',
      tr: 'Domates soslu spagetti ile servis edilir'
    }
  },
  {
    id: 'grilled-chicken',
    name: {
      en: 'Lemon Herb Grilled Chicken',
      tr: 'Limonlu Otlu Izgara Tavuk'
    },
    description: {
      en: 'Marinated chicken breast grilled with lemon, garlic, and fresh herbs',
      tr: 'Limon, sarımsak ve taze otlarla marine edilmiş ızgara tavuk göğsü'
    },
    price: 95,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=500',
    category: 'chicken',
    popular: false,
    allergens: [
      { en: 'Nuts', tr: 'Kuruyemiş' }
    ],
    calories: 420,
    servingInfo: {
      en: 'Served with quinoa salad and grilled vegetables',
      tr: 'Kinoa salatası ve ızgara sebzeler ile servis edilir'
    }
  },
  
  // Main Dishes - Pasta
  {
    id: 'spaghetti-carbonara',
    name: {
      en: 'Spaghetti Carbonara',
      tr: 'Spagetti Carbonara'
    },
    description: {
      en: 'Classic Italian pasta with pancetta, egg, pecorino cheese, and black pepper',
      tr: 'Pancetta, yumurta, pecorino peyniri ve karabiber ile klasik İtalyan makarnası'
    },
    price: 90,
    image: 'https://images.unsplash.com/photo-1600803907087-f56d462fd26b?q=80&w=500',
    category: 'pasta',
    popular: false,
    allergens: [
      { en: 'Gluten', tr: 'Gluten' },
      { en: 'Dairy', tr: 'Süt Ürünleri' },
      { en: 'Eggs', tr: 'Yumurta' }
    ],
    calories: 650,
    servingInfo: {
      en: 'Served with garlic bread',
      tr: 'Sarımsaklı ekmek ile servis edilir'
    }
  },
  {
    id: 'penne-arrabbiata',
    name: {
      en: 'Penne Arrabbiata',
      tr: 'Penne Arrabbiata'
    },
    description: {
      en: 'Penne pasta in a spicy tomato sauce with garlic, chili, and fresh parsley',
      tr: 'Sarımsak, acı biber ve taze maydanozlu baharatlı domates soslu penne makarna'
    },
    price: 80,
    image: 'https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?q=80&w=500',
    category: 'pasta',
    popular: false,
    allergens: [
      { en: 'Gluten', tr: 'Gluten' }
    ],
    calories: 550,
    servingInfo: {
      en: 'Vegetarian option available',
      tr: 'Vejetaryen seçeneği mevcuttur'
    }
  },
  
  // Main Dishes - Seafood
  {
    id: 'grilled-salmon',
    name: {
      en: 'Grilled Salmon Fillet',
      tr: 'Izgara Somon Fileto'
    },
    description: {
      en: 'Fresh Atlantic salmon fillet grilled with lemon butter and dill',
      tr: 'Limonlu tereyağı ve dereotu ile ızgara taze Atlantik somon fileto'
    },
    price: 160,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=500',
    category: 'seafood',
    popular: false,
    allergens: [
      { en: 'Nuts', tr: 'Kuruyemiş' },
      { en: 'Dairy', tr: 'Süt Ürünleri' }
    ],
    calories: 480,
    servingInfo: {
      en: 'Served with asparagus and lemon rice',
      tr: 'Kuşkonmaz ve limonlu pilav ile servis edilir'
    }
  },
  {
    id: 'seafood-paella',
    name: {
      en: 'Seafood Paella',
      tr: 'Deniz Mahsullü Paella'
    },
    description: {
      en: 'Traditional Spanish rice dish with shrimp, mussels, calamari, and saffron',
      tr: 'Karides, midye, kalamar ve safranla geleneksel İspanyol pilav yemeği'
    },
    price: 180,
    image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=500',
    category: 'seafood',
    popular: false,
    allergens: [
      { en: 'Seafood', tr: 'Deniz Ürünleri' },
      { en: 'Shellfish', tr: 'Kabuklu Deniz Ürünleri' }
    ],
    calories: 720,
    servingInfo: {
      en: 'Serves 2 people',
      tr: '2 kişilik'
    }
  },
  
  // Desserts
  {
    id: 'chocolate-souffle',
    name: {
      en: 'Chocolate Soufflé',
      tr: 'Çikolatalı Sufle'
    },
    description: {
      en: 'Warm chocolate soufflé with a molten center, served with vanilla ice cream',
      tr: 'Akışkan merkezli sıcak çikolatalı sufle, vanilyalı dondurma ile servis edilir'
    },
    price: 70,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=500',
    category: 'desserts',
    popular: false,
    allergens: [
      { en: 'Gluten', tr: 'Gluten' },
      { en: 'Dairy', tr: 'Süt Ürünleri' },
      { en: 'Eggs', tr: 'Yumurta' }
    ],
    calories: 450,
    servingInfo: {
      en: 'Please allow 15 minutes preparation time',
      tr: 'Lütfen 15 dakika hazırlık süresi bekleyiniz'
    }
  },
  {
    id: 'baklava',
    name: {
      en: 'Pistachio Baklava',
      tr: 'Fıstıklı Baklava'
    },
    description: {
      en: 'Layers of phyllo pastry filled with chopped pistachios, sweetened with syrup',
      tr: 'Şerbetle tatlandırılmış, kıyılmış Antep fıstığı ile doldurulmuş yufka katmanları'
    },
    price: 60,
    image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=500',
    category: 'desserts',
    popular: false,
    allergens: [
      { en: 'Gluten', tr: 'Gluten' },
      { en: 'Nuts', tr: 'Kuruyemiş' }
    ],
    calories: 380,
    servingInfo: {
      en: 'Served with a scoop of ice cream',
      tr: 'Bir top dondurma ile servis edilir'
    }
  },
  
  // Drinks
  {
    id: 'fresh-lemonade',
    name: {
      en: 'Fresh Lemonade',
      tr: 'Taze Limonata'
    },
    description: {
      en: 'Freshly squeezed lemon juice with mint leaves and a hint of honey',
      tr: 'Nane yaprakları ve bir tutam bal ile taze sıkılmış limon suyu'
    },
    price: 35,
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?q=80&w=500',
    category: 'drinks',
    popular: false,
    allergens: [
      { en: 'Nuts', tr: 'Kuruyemiş' }
    ],
    calories: 120,
    servingInfo: {
      en: 'Served with ice',
      tr: 'Buz ile servis edilir'
    }
  },
  {
    id: 'turkish-coffee',
    name: {
      en: 'Turkish Coffee',
      tr: 'Türk Kahvesi'
    },
    description: {
      en: 'Traditional Turkish coffee brewed in a copper pot with your choice of sugar',
      tr: 'Bakır cezvede pişirilmiş, şeker tercihinize göre geleneksel Türk kahvesi'
    },
    price: 25,
    image: 'https://images.unsplash.com/photo-1578374173705-969cbe6f2d6b?q=80&w=500',
    category: 'drinks',
    popular: false,
    allergens: [
      { en: 'Nuts', tr: 'Kuruyemiş' }
    ],
    calories: 5,
    servingInfo: {
      en: 'Served with Turkish delight',
      tr: 'Lokum ile servis edilir'
    }
  },
  
  // Demo: Tükendi Durumunda Olan Ürünler
  {
    id: 'lobster-thermidor',
    name: {
      en: 'Lobster Thermidor',
      tr: 'Istakoz Termidor'
    },
    description: {
      en: 'Classic French lobster dish with creamy sauce and cheese',
      tr: 'Klasik Fransız istakoz yemeği, kremalı sos ve peynir ile'
    },
    price: 450,
    image: 'https://images.unsplash.com/photo-1551218808-b8f9d5b0a9c5?q=80&w=500',
    category: 'mains',
    popular: false,
    isAvailable: false, // TÜKENDİ
    allergens: [
      { en: 'Shellfish', tr: 'Kabuklu Deniz Ürünleri' },
      { en: 'Dairy', tr: 'Süt Ürünleri' }
    ],
    calories: 650,
    servingInfo: {
      en: 'Served with seasonal vegetables',
      tr: 'Mevsim sebzeleri ile servis edilir'
    }
  },
  {
    id: 'truffle-pasta',
    name: {
      en: 'Truffle Pasta',
      tr: 'Trüf Mantarlı Makarna'
    },
    description: {
      en: 'Handmade pasta with black truffle and parmesan cheese',
      tr: 'Siyah trüf mantarlı ve parmesan peynirli el yapımı makarna'
    },
    price: 280,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?q=80&w=500',
    category: 'mains',
    popular: true,
    isAvailable: false, // TÜKENDİ
    allergens: [
      { en: 'Gluten', tr: 'Gluten' },
      { en: 'Dairy', tr: 'Süt Ürünleri' }
    ],
    calories: 520,
    servingInfo: {
      en: 'Served with fresh herbs',
      tr: 'Taze otlar ile servis edilir'
    }
  },
  {
    id: 'chocolate-souffle',
    name: {
      en: 'Chocolate Soufflé',
      tr: 'Çikolatalı Sufle'
    },
    description: {
      en: 'Warm chocolate soufflé with vanilla ice cream',
      tr: 'Vanilyalı dondurma ile sıcak çikolatalı sufle'
    },
    price: 85,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=500',
    category: 'desserts',
    popular: false,
    isAvailable: false, // TÜKENDİ
    allergens: [
      { en: 'Eggs', tr: 'Yumurta' },
      { en: 'Dairy', tr: 'Süt Ürünleri' }
    ],
    calories: 420,
    servingInfo: {
      en: 'Served immediately',
      tr: 'Hemen servis edilir'
    }
  }
];
