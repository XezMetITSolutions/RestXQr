'use client';

import { FaUtensils, FaTag, FaFire, FaEye, FaEyeSlash, FaClock, FaChartBar } from 'react-icons/fa';

interface MenuStatsProps {
  items: any[];
  categories: any[];
  getItemsByCategory: (categoryId: string) => any[];
}

export default function MenuStats({ items, categories, getItemsByCategory }: MenuStatsProps) {
  const totalItems = items.length;
  const activeItems = items.filter(item => item.isAvailable !== false).length;
  const popularItems = items.filter(item => item.popular).length;
  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.isActive !== false).length;

  // Kategori bazında istatistikler
  const categoryStats = categories.map(category => {
    const categoryItems = getItemsByCategory(category.id);
    const activeCategoryItems = categoryItems.filter(item => item.isAvailable !== false);
    const popularCategoryItems = categoryItems.filter(item => item.popular);
    
    return {
      ...category,
      totalItems: categoryItems.length,
      activeItems: activeCategoryItems.length,
      popularItems: popularCategoryItems.length,
      avgPrice: categoryItems.length > 0 
        ? categoryItems.reduce((sum, item) => sum + item.price, 0) / categoryItems.length 
        : 0
    };
  });

  // Fiyat istatistikleri
  const prices = items.map(item => item.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;

  // Hazırlık süresi istatistikleri
  const prepTimes = items.filter(item => item.preparationTime).map(item => item.preparationTime);
  const avgPrepTime = prepTimes.length > 0 
    ? prepTimes.reduce((sum, time) => sum + time, 0) / prepTimes.length 
    : 0;

  // En popüler kategoriler
  const topCategories = categoryStats
    .sort((a, b) => b.totalItems - a.totalItems)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <FaChartBar className="text-purple-600" />
        <h2 className="text-xl font-semibold">Menü İstatistikleri</h2>
      </div>

      {/* Genel İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaUtensils className="text-blue-600" size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-green-600">
              <FaEye className="mr-1" />
              {activeItems} aktif
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <FaEyeSlash className="mr-1" />
              {totalItems - activeItems} pasif
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Popüler Ürünler</p>
              <p className="text-2xl font-bold text-gray-900">{popularItems}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FaFire className="text-red-600" size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              %{totalItems > 0 ? Math.round((popularItems / totalItems) * 100) : 0} oranında
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kategoriler</p>
              <p className="text-2xl font-bold text-gray-900">{totalCategories}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaTag className="text-green-600" size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-green-600">
              <FaEye className="mr-1" />
              {activeCategories} aktif
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <FaEyeSlash className="mr-1" />
              {totalCategories - activeCategories} pasif
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ortalama Fiyat</p>
              <p className="text-2xl font-bold text-gray-900">₺{avgPrice.toFixed(0)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaChartBar className="text-purple-600" size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              ₺{minPrice} - ₺{maxPrice} arası
            </div>
          </div>
        </div>
      </div>

      {/* Detaylı İstatistikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kategori Bazında İstatistikler */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Kategori Bazında İstatistikler</h3>
          <div className="space-y-4">
            {topCategories.map(category => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-gray-600">
                      {category.activeItems}/{category.totalItems} aktif
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{category.totalItems} ürün</p>
                  <p className="text-sm text-gray-600">₺{category.avgPrice.toFixed(0)} ortalama</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fiyat Dağılımı */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Fiyat Dağılımı</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">En Düşük Fiyat</span>
              <span className="font-semibold">₺{minPrice}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">En Yüksek Fiyat</span>
              <span className="font-semibold">₺{maxPrice}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ortalama Fiyat</span>
              <span className="font-semibold">₺{avgPrice.toFixed(2)}</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaClock />
                <span>Ortalama Hazırlık Süresi: {avgPrepTime.toFixed(0)} dakika</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popüler Ürünler */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">En Popüler Ürünler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items
            .filter(item => item.popular)
            .slice(0, 6)
            .map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={item.image || '/placeholder-food.jpg'}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-sm text-gray-600">₺{item.price}</p>
                </div>
                <div className="text-red-500">
                  <FaFire size={16} />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Menü Sağlığı */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Menü Sağlığı</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {totalItems > 0 ? Math.round((activeItems / totalItems) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Aktif Ürün Oranı</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {totalCategories > 0 ? Math.round((activeCategories / totalCategories) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Aktif Kategori Oranı</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {totalItems > 0 ? Math.round((popularItems / totalItems) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Popüler Ürün Oranı</div>
          </div>
        </div>
      </div>
    </div>
  );
}
