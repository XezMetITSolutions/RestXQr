'use client';

import { useState } from 'react';

const API_BASE = 'https://masapp-backend.onrender.com/api';
const KROREN_RESTAURANT_ID = '37b0322a-e11f-4ef1-b108-83be310aaf4d';

// Backend'deki aynı veriler - tüm alanlar dahil
const categoriesWithProducts = [
  {
    category: {
      name: 'Makarnalar & Noodle',
      description: 'Çin mutfağından özel makarna ve noodle çeşitleri',
      displayOrder: 1
    },
    products: [
      {
        name: 'Ganbian Makarnası',
        description: 'Özel soslu ganbian makarnası',
        price: 694,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
        calories: 520,
        preparationTime: 20,
        ingredients: 'Makarna, Özel sos, Sebzeler, Baharatlar',
        allergens: ['gluten', 'soy'],
        isAvailable: true,
        isPopular: true,
        displayOrder: 1
      },
      {
        name: 'Sebzeli Noodle',
        description: 'Taze sebzelerle hazırlanmış noodle',
        price: 522,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
        calories: 380,
        preparationTime: 15,
        ingredients: 'Noodle, Brokoli, Havuç, Mantar, Soğan, Sarımsak',
        allergens: ['gluten', 'soy'],
        isAvailable: true,
        isPopular: false,
        displayOrder: 2
      },
      {
        name: 'Tavuk Noodle',
        description: 'Tavuk parçaları ile noodle',
        price: 566,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
        calories: 450,
        preparationTime: 18,
        ingredients: 'Noodle, Tavuk göğsü, Sebzeler, Özel sos',
        allergens: ['gluten', 'soy'],
        isAvailable: true,
        isPopular: true,
        displayOrder: 3
      },
      {
        name: 'Dana Noodle',
        description: 'Dana eti ile noodle',
        price: 648,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
        calories: 580,
        preparationTime: 22,
        ingredients: 'Noodle, Dana eti, Sebzeler, Özel sos, Baharatlar',
        allergens: ['gluten', 'soy'],
        isAvailable: true,
        isPopular: true,
        displayOrder: 4
      }
    ]
  },
  {
    category: {
      name: 'Tavuk Yemekleri',
      description: 'Özel soslu ve baharatlı tavuk yemekleri',
      displayOrder: 2
    },
    products: [
      {
        name: 'Acılı Lokum Tavuk',
        description: 'Acılı lokum soslu tavuk',
        price: 650,
        imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
        calories: 420,
        preparationTime: 25,
        ingredients: 'Tavuk but, Acılı lokum sosu, Biber, Soğan, Sarımsak',
        allergens: ['gluten', 'soy'],
        isAvailable: true,
        isPopular: true,
        displayOrder: 1
      },
      {
        name: 'Portakallı Çıtır Tavuk',
        description: 'Portakal soslu çıtır tavuk',
        price: 650,
        imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
        calories: 480,
        preparationTime: 28,
        ingredients: 'Tavuk göğsü, Portakal suyu, Bal, Un, Yumurta',
        allergens: ['gluten', 'eggs', 'soy'],
        isAvailable: true,
        isPopular: true,
        displayOrder: 2
      },
      {
        name: 'Tatlı Ekşi Tavuk',
        description: 'Tatlı ekşi soslu tavuk',
        price: 550,
        imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
        calories: 450,
        preparationTime: 20,
        ingredients: 'Tavuk göğsü, Domates sosu, Ananas, Biber, Soğan',
        allergens: ['gluten', 'soy'],
        isAvailable: true,
        isPopular: false,
        displayOrder: 3
      }
    ]
  },
  {
    category: {
      name: 'Ana Yemekler / Diğer',
      description: 'Ana yemekler ve özel lezzetler',
      displayOrder: 3
    },
    products: [
      {
        name: 'Buharda Mantı',
        description: 'Geleneksel buharda pişirilmiş mantı',
        price: 651,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
        calories: 320,
        preparationTime: 30,
        ingredients: 'Hamur, Kıyma, Soğan, Baharatlar, Tereyağı',
        allergens: ['gluten'],
        isAvailable: true,
        isPopular: true,
        displayOrder: 1
      },
      {
        name: 'Dana Etli Rojamo',
        description: 'Dana eti ile hazırlanmış rojamo',
        price: 545,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
        calories: 550,
        preparationTime: 15,
        ingredients: 'Dana eti, Ekmek, Soğan, Biber, Baharatlar',
        allergens: ['gluten'],
        isAvailable: true,
        isPopular: false,
        displayOrder: 2
      },
      {
        name: 'Özel Soslu Tofu',
        description: 'Özel sos ile hazırlanmış tofu',
        price: 651,
        imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
        calories: 280,
        preparationTime: 18,
        ingredients: 'Tofu, Özel sos, Sebzeler, Susam',
        allergens: ['soy'],
        isAvailable: true,
        isPopular: false,
        displayOrder: 3
      }
    ]
  },
  {
    category: {
      name: 'Yan Ürünler & Atıştırmalıklar',
      description: 'Yan yemekler ve atıştırmalıklar',
      displayOrder: 4
    },
    products: [
      {
        name: 'Sade Pilav',
        description: 'Geleneksel sade pilav',
        price: 227,
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-4c5c0e5e0a5e?w=800&q=80',
        calories: 200,
        preparationTime: 20,
        ingredients: 'Pirinç, Su, Tuz, Tereyağı',
        allergens: [],
        isAvailable: true,
        isPopular: false,
        displayOrder: 1
      },
      {
        name: 'Karides Krakeri / Cips',
        description: 'Çıtır karides krakeri',
        price: 245,
        imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
        calories: 180,
        preparationTime: 5,
        ingredients: 'Karides unu, Nişasta, Tuz, Baharatlar',
        allergens: ['shellfish', 'gluten'],
        isAvailable: true,
        isPopular: false,
        displayOrder: 2
      },
      {
        name: 'Buharda Sade Ekmek',
        description: 'Buharda pişirilmiş sade ekmek',
        price: 82.50,
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
        calories: 150,
        preparationTime: 15,
        ingredients: 'Un, Su, Maya, Tuz',
        allergens: ['gluten'],
        isAvailable: true,
        isPopular: false,
        displayOrder: 3
      }
    ]
  },
  {
    category: {
      name: 'Salatalar',
      description: 'Taze ve lezzetli salata çeşitleri',
      displayOrder: 5
    },
    products: [
      {
        name: 'Erişteli Salata',
        description: 'Erişte ile hazırlanmış özel salata',
        price: 220,
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
        calories: 250,
        preparationTime: 12,
        ingredients: 'Erişte, Sebzeler, Susam, Özel sos',
        allergens: ['gluten', 'soy'],
        isAvailable: true,
        isPopular: false,
        displayOrder: 1
      }
    ]
  },
  {
    category: {
      name: 'İçecekler',
      description: 'Soğuk ve sıcak içecekler',
      displayOrder: 6
    },
    products: [
      {
        name: 'Su (50 cl)',
        description: '50 cl su',
        price: 30,
        imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80',
        calories: 0,
        preparationTime: 0,
        ingredients: 'Su',
        allergens: [],
        isAvailable: true,
        isPopular: false,
        displayOrder: 1
      },
      {
        name: 'Kutu İçecekler',
        description: 'Cola, Fanta, Ice Tea vb.',
        price: 115,
        imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80',
        calories: 150,
        preparationTime: 0,
        ingredients: 'Gazlı içecek',
        allergens: [],
        isAvailable: true,
        isPopular: false,
        displayOrder: 2
      },
      {
        name: 'Niğde Gazozu',
        description: 'Geleneksel Niğde gazozu',
        price: 50,
        imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80',
        calories: 120,
        preparationTime: 0,
        ingredients: 'Gazoz, Şeker, Doğal aromalar',
        allergens: [],
        isAvailable: true,
        isPopular: false,
        displayOrder: 3
      },
      {
        name: 'Sultan Elmalı Soda',
        description: 'Elmalı soda',
        price: 55,
        imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80',
        calories: 100,
        preparationTime: 0,
        ingredients: 'Soda, Elma aroması, Şeker',
        allergens: [],
        isAvailable: true,
        isPopular: false,
        displayOrder: 4
      },
      {
        name: 'Milk Tea / Mango / Harbi Çay',
        description: 'Sütlü çay, mango çayı veya harbi çay',
        price: 244,
        imageUrl: 'https://images.unsplash.com/photo-1576092762791-fd190a490058?w=800&q=80',
        calories: 180,
        preparationTime: 5,
        ingredients: 'Çay, Süt, Mango/Harbi aroması, Şeker',
        allergens: ['dairy'],
        isAvailable: true,
        isPopular: true,
        displayOrder: 5
      }
    ]
  },
  {
    category: {
      name: 'Ek Ücretler',
      description: 'Ek hizmetler ve ücretler',
      displayOrder: 7
    },
    products: [
      {
        name: 'Poşet',
        description: 'Taşıma poşeti',
        price: 0.50,
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        calories: 0,
        preparationTime: 0,
        ingredients: 'Plastik poşet',
        allergens: [],
        isAvailable: true,
        isPopular: false,
        displayOrder: 1
      }
    ]
  }
];

export default function KrorenUrunEkle() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [progress, setProgress] = useState<{ categories: number; products: number; total: number }>({
    categories: 0,
    products: 0,
    total: 0
  });

  const addProducts = async () => {
    setLoading(true);
    setStatus({ type: 'info', message: 'Ürünler ekleniyor...' });
    setProgress({ categories: 0, products: 0, total: 0 });

    let totalCategories = 0;
    let totalProducts = 0;
    let successCategories = 0;
    let successProducts = 0;

    try {
      for (const categoryData of categoriesWithProducts) {
        // 1. Kategori oluştur
        try {
          const categoryResponse = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/categories`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData.category)
          });

          if (categoryResponse.ok) {
            const categoryResult = await categoryResponse.json();
            const categoryId = categoryResult.data.id;
            successCategories++;
            totalCategories++;

            // 2. Bu kategoriye ait ürünleri ekle
            for (const product of categoryData.products) {
              const productWithCategory = { 
                ...product, 
                categoryId,
                order: product.displayOrder
              };

              try {
                const response = await fetch(`${API_BASE}/restaurants/${KROREN_RESTAURANT_ID}/menu/items`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(productWithCategory)
                });

                if (response.ok) {
                  successProducts++;
                }
                totalProducts++;

                setProgress({
                  categories: successCategories,
                  products: successProducts,
                  total: totalProducts
                });

                // API rate limiting için kısa bir bekleme
                await new Promise(resolve => setTimeout(resolve, 200));
              } catch (error) {
                console.error(`Ürün eklenirken hata: ${product.name}`, error);
              }
            }
          } else {
            totalCategories++;
          }

          // API rate limiting için kısa bir bekleme
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error('Kategori oluşturulurken hata:', error);
        }
      }

      setStatus({
        type: 'success',
        message: `✅ İşlem tamamlandı! ${successCategories}/${totalCategories} kategori, ${successProducts}/${totalProducts} ürün eklendi.`
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: `❌ Hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🏪 Kroren Restoranı - Ürün Ekleme
          </h1>
          <p className="text-gray-600 mb-6">
            Aşağıdaki butona tıklayarak Kroren restoranına tüm ürünleri (kalori, hazırlık süresi, malzemeler, alerjenler dahil) ekleyebilirsiniz.
          </p>

          <div className="mb-6">
            <button
              onClick={addProducts}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ürünler ekleniyor...
                </span>
              ) : (
                '🚀 Ürünleri Ekle (Tüm Detaylar Dahil)'
              )}
            </button>
          </div>

          {progress.total > 0 && (
            <div className="mb-6">
              <div className="bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.products / (categoriesWithProducts.reduce((acc, cat) => acc + cat.products.length, 0))) * 100}%`
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 text-center">
                {progress.categories} kategori, {progress.products} ürün eklendi
              </p>
            </div>
          )}

          {status && (
            <div
              className={`p-4 rounded-lg ${
                status.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : status.type === 'error'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Eklenecek Ürünler (Tüm Detaylar Dahil):</h2>
            <div className="space-y-4">
              {categoriesWithProducts.map((catData, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {catData.category.name} ({catData.products.length} ürün)
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {catData.products.map((product, pIdx) => (
                      <li key={pIdx} className="border-l-2 border-blue-300 pl-3">
                        <div className="font-medium">• {product.name} - {product.price} TL</div>
                        <div className="text-xs text-gray-500 mt-1">
                          🔥 {product.calories} kalori | ⏱️ {product.preparationTime} dk | 
                          {product.isPopular && ' ⭐ Popüler'} | 
                          {product.allergens.length > 0 && ` 🚨 Alerjen: ${product.allergens.join(', ')}`}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
