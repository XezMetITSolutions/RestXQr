// Excel Parser ve Toplu İşleme Sistemi
import { aiImageProcessor, ImageEnhancementOptions } from './aiImageProcessor';
// @ts-ignore
import * as XLSX from 'xlsx';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  imageFile?: File;
  isAvailable: boolean;
  tags?: string[];
  calories?: number;
  allergens?: string[];
}

export interface ImportProgress {
  total: number;
  processed: number;
  success: number;
  errors: number;
  currentItem?: string;
  status: 'idle' | 'parsing' | 'downloading' | 'processing' | 'completed' | 'error';
}

export interface ImportResult {
  success: boolean;
  items: MenuItem[];
  errors: string[];
  processingTime: number;
}

class ExcelParser {
  private progressCallback?: (progress: ImportProgress) => void;

  constructor(progressCallback?: (progress: ImportProgress) => void) {
    this.progressCallback = progressCallback;
  }

  // Excel dosyasını parse et
  async parseExcelFile(file: File): Promise<MenuItem[]> {
    this.updateProgress({
      total: 0,
      processed: 0,
      success: 0,
      errors: 0,
      status: 'parsing',
      currentItem: 'Excel dosyası okunuyor...'
    });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = await this.parseExcelBuffer(arrayBuffer);
      const items = this.extractMenuItems(workbook);
      
      this.updateProgress({
        total: items.length,
        processed: 0,
        success: 0,
        errors: 0,
        status: 'parsing',
        currentItem: `${items.length} ürün bulundu`
      });

      return items;
    } catch (error) {
      console.error('Excel parse hatası:', error);
      throw new Error('Excel dosyası okunamadı');
    }
  }

  // Excel buffer'ını parse et (gerçek xlsx desteği)
  private async parseExcelBuffer(buffer: ArrayBuffer): Promise<any> {
    try {
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheets = workbook.SheetNames.map((sheetName: string) => {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    return {
          name: sheetName,
          data: data
        };
      });
      
      return { sheets };
    } catch (error) {
      console.error('Excel parse hatası:', error);
      throw new Error('Excel dosyası okunamadı. Lütfen geçerli bir Excel dosyası yükleyin.');
    }
  }

  // Excel verilerinden menu item'ları çıkar
  private extractMenuItems(workbook: any): MenuItem[] {
    const items: MenuItem[] = [];
    const sheet = workbook.sheets[0];
    const headers = sheet.data[0];
    const dataRows = sheet.data.slice(1);

    // Header mapping - farklı dillerdeki sütun isimlerini destekle
    const headerMap = this.createHeaderMap(headers);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      try {
        const item: MenuItem = {
          id: this.getCellValue(row, headerMap, 'id') || `item_${i + 1}`,
          name: this.getCellValue(row, headerMap, 'name') || '',
          description: this.getCellValue(row, headerMap, 'description') || '',
          price: parseFloat(this.getCellValue(row, headerMap, 'price')) || 0,
          category: this.getCellValue(row, headerMap, 'category') || 'Other',
          imageUrl: this.getCellValue(row, headerMap, 'imageUrl') || '',
          isAvailable: this.getCellValue(row, headerMap, 'available') === 'true' || 
                      this.getCellValue(row, headerMap, 'available') === '1',
          tags: this.getCellValue(row, headerMap, 'tags') ? 
                this.getCellValue(row, headerMap, 'tags').split(',').map((tag: string) => tag.trim()) : [],
          calories: this.getCellValue(row, headerMap, 'calories') ? 
                   parseInt(this.getCellValue(row, headerMap, 'calories')) : undefined,
          allergens: this.getCellValue(row, headerMap, 'allergens') ? 
                    this.getCellValue(row, headerMap, 'allergens').split(',').map((allergen: string) => allergen.trim()) : []
        };

        // Veri doğrulama
        const validation = this.validateMenuItem(item);
        if (validation.isValid) {
          items.push(item);
        } else {
          console.warn(`Satır ${i + 2} doğrulama hatası:`, validation.errors);
        }
      } catch (error) {
        console.error(`Satır ${i + 2} parse hatası:`, error);
      }
    }

    return items;
  }

  // Header mapping oluştur
  private createHeaderMap(headers: string[]): { [key: string]: number } {
    const map: { [key: string]: number } = {};
    
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim();
      
      // ID mapping
      if (normalizedHeader.includes('id') || normalizedHeader.includes('numara')) {
        map.id = index;
      }
      // Name mapping
      if (normalizedHeader.includes('name') || normalizedHeader.includes('ad') || 
          normalizedHeader.includes('ürün') || normalizedHeader.includes('isim')) {
        map.name = index;
      }
      // Description mapping
      if (normalizedHeader.includes('description') || normalizedHeader.includes('açıklama') || 
          normalizedHeader.includes('detay')) {
        map.description = index;
      }
      // Price mapping
      if (normalizedHeader.includes('price') || normalizedHeader.includes('fiyat') || 
          normalizedHeader.includes('ücret')) {
        map.price = index;
      }
      // Category mapping
      if (normalizedHeader.includes('category') || normalizedHeader.includes('kategori') || 
          normalizedHeader.includes('tür')) {
        map.category = index;
      }
      // Image URL mapping
      if (normalizedHeader.includes('image') || normalizedHeader.includes('görsel') || 
          normalizedHeader.includes('resim') || normalizedHeader.includes('url')) {
        map.imageUrl = index;
      }
      // Available mapping
      if (normalizedHeader.includes('available') || normalizedHeader.includes('mevcut') || 
          normalizedHeader.includes('aktif') || normalizedHeader.includes('durum')) {
        map.available = index;
      }
      // Tags mapping
      if (normalizedHeader.includes('tag') || normalizedHeader.includes('etiket') || 
          normalizedHeader.includes('label')) {
        map.tags = index;
      }
      // Calories mapping
      if (normalizedHeader.includes('calorie') || normalizedHeader.includes('kalori') || 
          normalizedHeader.includes('enerji')) {
        map.calories = index;
      }
      // Allergens mapping
      if (normalizedHeader.includes('allergen') || normalizedHeader.includes('alerjen') || 
          normalizedHeader.includes('alerji')) {
        map.allergens = index;
      }
    });
    
    return map;
  }

  // Cell değeri al
  private getCellValue(row: any[], headerMap: { [key: string]: number }, key: string): string {
    const index = headerMap[key];
    return index !== undefined ? (row[index] || '').toString() : '';
  }

  // Menu item doğrulama (gelişmiş)
  private validateMenuItem(item: MenuItem): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Zorunlu alanlar
    if (!item.name || item.name.trim() === '') {
      errors.push('Ürün adı boş olamaz');
    } else if (item.name.length > 100) {
      errors.push('Ürün adı 100 karakterden uzun olamaz');
    }

    if (!item.category || item.category.trim() === '') {
      errors.push('Kategori boş olamaz');
    }

    // Fiyat doğrulama
    if (item.price <= 0) {
      errors.push('Fiyat 0\'dan büyük olmalıdır');
    } else if (item.price > 10000) {
      errors.push('Fiyat 10.000 TL\'den yüksek olamaz');
    }

    // Açıklama doğrulama
    if (item.description && item.description.length > 500) {
      errors.push('Açıklama 500 karakterden uzun olamaz');
    }

    // Kalori doğrulama
    if (item.calories !== undefined && (item.calories < 0 || item.calories > 5000)) {
      errors.push('Kalori değeri 0-5000 arasında olmalıdır');
    }

    // URL doğrulama
    if (item.imageUrl && !this.isValidUrl(item.imageUrl)) {
      errors.push('Geçersiz görsel URL\'si');
    }

    // Etiket doğrulama
    if (item.tags && item.tags.length > 10) {
      errors.push('En fazla 10 etiket eklenebilir');
    }

    // Alerjen doğrulama
    if (item.allergens && item.allergens.length > 15) {
      errors.push('En fazla 15 alerjen eklenebilir');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // URL doğrulama
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Görsel indirme sistemi (paralel)
  async downloadImages(items: MenuItem[]): Promise<MenuItem[]> {
    const itemsWithImages = items.filter(item => item.imageUrl);
    
    if (itemsWithImages.length === 0) {
      return items;
    }

    this.updateProgress({
      total: itemsWithImages.length,
      processed: 0,
      success: 0,
      errors: 0,
      status: 'downloading',
      currentItem: 'Görseller paralel olarak indiriliyor...'
    });

    const batchSize = 5; // Paralel indirme batch boyutu
    const updatedItems: MenuItem[] = [...items];
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    // Paralel indirme
    for (let i = 0; i < itemsWithImages.length; i += batchSize) {
      const batch = itemsWithImages.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (item) => {
        try {
          const imageFile = await this.downloadImage(item.imageUrl!, item.name);
          return { item, imageFile, success: true };
        } catch (error) {
          console.error(`Görsel indirme hatası (${item.name}):`, error);
          return { item, imageFile: null, success: false };
        }
      });

      try {
        const batchResults = await Promise.all(batchPromises);
        
        // Sonuçları işle
        batchResults.forEach(({ item, imageFile, success }) => {
          const itemIndex = updatedItems.findIndex(ui => ui.id === item.id);
          if (itemIndex !== -1) {
            if (success && imageFile) {
              updatedItems[itemIndex] = { ...updatedItems[itemIndex], imageFile };
              successCount++;
            } else {
              errorCount++;
            }
          }
          processedCount++;
        });

        // Progress güncelle
        this.updateProgress({
          total: itemsWithImages.length,
          processed: processedCount,
          success: successCount,
          errors: errorCount,
          status: 'downloading',
          currentItem: `İndiriliyor: ${batch[0]?.name}... (${processedCount}/${itemsWithImages.length})`
        });

        // Batch'ler arası kısa bekleme
        if (i + batchSize < itemsWithImages.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Batch ${i / batchSize + 1} hatası:`, error);
        errorCount += batch.length;
        processedCount += batch.length;
      }
    }

    return updatedItems;
  }

  // Tek görsel indir (gelişmiş)
  private async downloadImage(url: string, name: string): Promise<File> {
    try {
      // URL doğrulama
      if (!this.isValidUrl(url)) {
        throw new Error('Geçersiz URL');
      }

      // Timeout ile fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 saniye timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Content-Type kontrolü
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error('URL bir görsel dosyası değil');
      }

      // Dosya boyutu kontrolü (max 10MB)
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
        throw new Error('Görsel dosyası çok büyük (max 10MB)');
      }

      const blob = await response.blob();
      
      // Blob boyutu kontrolü
      if (blob.size > 10 * 1024 * 1024) {
        throw new Error('Görsel dosyası çok büyük (max 10MB)');
      }

      // Dosya adı oluştur
      const sanitizedName = name.replace(/[^a-zA-Z0-9\u00C0-\u017F\s]/g, '').trim();
      const fileName = `${sanitizedName || 'image'}.${this.getFileExtension(blob.type)}`;
      
      return new File([blob], fileName, { type: blob.type });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Görsel indirme zaman aşımına uğradı');
        }
        throw new Error(`Görsel indirilemedi: ${error.message}`);
      }
      throw new Error(`Görsel indirilemedi: ${url}`);
    }
  }

  // Dosya uzantısını belirle
  private getFileExtension(mimeType: string): string {
    const extensions: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp'
    };
    return extensions[mimeType] || 'jpg';
  }

  // Toplu AI işleme (gelişmiş)
  async processImagesWithAI(items: MenuItem[]): Promise<MenuItem[]> {
    const itemsWithImages = items.filter(item => item.imageFile);
    
    if (itemsWithImages.length === 0) {
      return items;
    }

    this.updateProgress({
      total: itemsWithImages.length,
      processed: 0,
      success: 0,
      errors: 0,
      status: 'processing',
      currentItem: 'AI ile görseller işleniyor...'
    });

    try {
      const batchSize = 3; // AI işleme batch boyutu
      const updatedItems: MenuItem[] = [...items];
      let processedCount = 0;
      let successCount = 0;
      let errorCount = 0;

      // Kategori bazlı işleme
      const categoryGroups = this.groupItemsByCategory(itemsWithImages);

      for (const [category, categoryItems] of Object.entries(categoryGroups)) {
        const detectedCategory = this.detectCategory(category);
        
        // Kategori bazlı AI seçenekleri
        const template = aiImageProcessor.getImageTemplate(detectedCategory);
      const options: ImageEnhancementOptions = {
        autoEnhance: true,
        removeBackground: true,
          aspectRatio: detectedCategory,
          width: template.width,
          height: template.height,
          style: template.style as 'rounded' | 'circle' | 'square'
        };

        // Batch'ler halinde işle
        for (let i = 0; i < categoryItems.length; i += batchSize) {
          const batch = categoryItems.slice(i, i + batchSize);
          const imageFiles = batch.map(item => item.imageFile!);
          
          try {
      const processedImages = await aiImageProcessor.batchProcessImages(imageFiles, options);
      
            // Sonuçları güncelle
            batch.forEach((item, index) => {
              const itemIndex = updatedItems.findIndex(ui => ui.id === item.id);
              if (itemIndex !== -1 && processedImages[index]) {
                updatedItems[itemIndex] = {
                  ...updatedItems[itemIndex],
                  imageFile: processedImages[index].processed as File
                };
                successCount++;
              } else {
                errorCount++;
              }
              processedCount++;
            });

            // Progress güncelle
            this.updateProgress({
              total: itemsWithImages.length,
              processed: processedCount,
              success: successCount,
              errors: errorCount,
              status: 'processing',
              currentItem: `AI işleniyor: ${category} (${processedCount}/${itemsWithImages.length})`
            });

            // Batch'ler arası kısa bekleme
            if (i + batchSize < categoryItems.length) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          } catch (error) {
            console.error(`AI batch hatası (${category}):`, error);
            errorCount += batch.length;
            processedCount += batch.length;
          }
        }
      }

      this.updateProgress({
        total: itemsWithImages.length,
        processed: processedCount,
        success: successCount,
        errors: errorCount,
        status: 'completed',
        currentItem: 'AI işleme tamamlandı'
      });

      return updatedItems;
    } catch (error) {
      console.error('AI işleme hatası:', error);
      this.updateProgress({
        total: itemsWithImages.length,
        processed: itemsWithImages.length,
        success: 0,
        errors: itemsWithImages.length,
        status: 'error',
        currentItem: 'AI işleme hatası'
      });
      return items; // Hata durumunda orijinal items'ı döndür
    }
  }

  // Kategori bazlı gruplama
  private groupItemsByCategory(items: MenuItem[]): { [category: string]: MenuItem[] } {
    const groups: { [category: string]: MenuItem[] } = {};
    
    items.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    
    return groups;
  }

  // Kategori tespiti (gelişmiş)
  private detectCategory(category: string): 'food' | 'drink' | 'dessert' {
    const categoryLower = category.toLowerCase();
    
    // İçecek kategorileri
    const drinkKeywords = [
      'drink', 'beverage', 'içecek', 'su', 'çay', 'kahve', 'coffee', 'tea',
      'soda', 'cola', 'fanta', 'sprite', 'ayran', 'kola', 'gazoz',
      'meyve suyu', 'juice', 'smoothie', 'milkshake', 'shake',
      'alkol', 'alcohol', 'bira', 'beer', 'şarap', 'wine', 'rakı'
    ];
    
    if (drinkKeywords.some(keyword => categoryLower.includes(keyword))) {
      return 'drink';
    }
    
    // Tatlı kategorileri
    const dessertKeywords = [
      'dessert', 'cake', 'tatlı', 'pasta', 'dondurma', 'ice cream',
      'baklava', 'künefe', 'künefe', 'revani', 'kadayıf', 'helva',
      'çikolata', 'chocolate', 'brownie', 'cheesecake', 'tiramisu',
      'pudding', 'muhallebi', 'sütlaç', 'krem karamel', 'flan'
    ];
    
    if (dessertKeywords.some(keyword => categoryLower.includes(keyword))) {
      return 'dessert';
    }
    
    return 'food';
  }

  // Akıllı öneriler sistemi
  async generateSmartSuggestions(items: MenuItem[]): Promise<{
    itemId: string;
    suggestions: {
      type: 'price' | 'description' | 'category' | 'tags' | 'image';
      message: string;
      priority: 'low' | 'medium' | 'high';
      value?: any;
    }[];
  }[]> {
    const suggestions: {
      itemId: string;
      suggestions: {
        type: 'price' | 'description' | 'category' | 'tags' | 'image';
        message: string;
        priority: 'low' | 'medium' | 'high';
        value?: any;
      }[];
    }[] = [];

    for (const item of items) {
      const itemSuggestions: {
        type: 'price' | 'description' | 'category' | 'tags' | 'image';
        message: string;
        priority: 'low' | 'medium' | 'high';
        value?: any;
      }[] = [];

      // Fiyat önerileri
      if (item.price < 10) {
        itemSuggestions.push({
          type: 'price',
          message: 'Fiyat çok düşük görünüyor. Pazar araştırması yapın.',
          priority: 'medium'
        });
      } else if (item.price > 200) {
        itemSuggestions.push({
          type: 'price',
          message: 'Fiyat yüksek. Müşteri memnuniyeti için değer analizi yapın.',
          priority: 'medium'
        });
      }

      // Açıklama önerileri
      if (!item.description || item.description.length < 20) {
        itemSuggestions.push({
          type: 'description',
          message: 'Açıklama çok kısa. Ürünün özelliklerini detaylandırın.',
          priority: 'high',
          value: this.generateDescriptionSuggestion(item)
        });
      }

      // Kategori önerileri
      const suggestedCategory = this.suggestCategory(item.name, item.description);
      if (suggestedCategory && suggestedCategory !== item.category) {
        itemSuggestions.push({
          type: 'category',
          message: `"${suggestedCategory}" kategorisi daha uygun olabilir.`,
          priority: 'low',
          value: suggestedCategory
        });
      }

      // Etiket önerileri
      const suggestedTags = this.suggestTags(item.name, item.description, item.category);
      if (suggestedTags.length > 0) {
        itemSuggestions.push({
          type: 'tags',
          message: 'Bu etiketler eklenebilir: ' + suggestedTags.join(', '),
          priority: 'low',
          value: suggestedTags
        });
      }

      // Görsel önerileri
      if (!item.imageUrl && !item.imageFile) {
        itemSuggestions.push({
          type: 'image',
          message: 'Görsel eklenmesi ürün satışını artırabilir.',
          priority: 'high'
        });
      }

      if (itemSuggestions.length > 0) {
        suggestions.push({
          itemId: item.id,
          suggestions: itemSuggestions
        });
      }
    }

    return suggestions;
  }

  // Açıklama önerisi oluştur
  private generateDescriptionSuggestion(item: MenuItem): string {
    const category = item.category.toLowerCase();
    const name = item.name.toLowerCase();
    
    let suggestion = '';
    
    if (category.includes('pizza') || name.includes('pizza')) {
      suggestion = 'Taze malzemelerle hazırlanan, fırında pişirilmiş pizza.';
    } else if (category.includes('salad') || name.includes('salata')) {
      suggestion = 'Taze sebzelerle hazırlanan, sağlıklı salata.';
    } else if (category.includes('soup') || name.includes('çorba')) {
      suggestion = 'Ev yapımı, sıcak çorba.';
    } else if (category.includes('drink') || category.includes('içecek')) {
      suggestion = 'Soğuk ve ferahlatıcı içecek.';
    } else if (category.includes('dessert') || category.includes('tatlı')) {
      suggestion = 'Ev yapımı, lezzetli tatlı.';
    } else {
      suggestion = 'Lezzetli ve doyurucu yemek.';
    }
    
    return suggestion;
  }

  // Kategori önerisi
  private suggestCategory(name: string, description?: string): string | null {
    const text = `${name} ${description || ''}`.toLowerCase();
    
    const categoryMap: { [key: string]: string } = {
      'pizza': 'Pizza',
      'burger': 'Burger',
      'salad': 'Salata',
      'soup': 'Çorba',
      'pasta': 'Makarna',
      'rice': 'Pilav',
      'meat': 'Et Yemekleri',
      'chicken': 'Tavuk',
      'fish': 'Balık',
      'vegetable': 'Sebze Yemekleri',
      'coffee': 'Kahve',
      'tea': 'Çay',
      'juice': 'Meyve Suyu',
      'water': 'Su',
      'cake': 'Pasta',
      'ice cream': 'Dondurma',
      'dessert': 'Tatlı'
    };
    
    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (text.includes(keyword)) {
        return category;
      }
    }
    
    return null;
  }

  // Etiket önerileri
  private suggestTags(name: string, description?: string, category?: string): string[] {
    const text = `${name} ${description || ''} ${category || ''}`.toLowerCase();
    const tags: string[] = [];
    
    // Popüler etiketler
    const tagMap: { [key: string]: string[] } = {
      'vegetarian': ['vejetaryen', 'vegetarian', 'bitkisel'],
      'vegan': ['vegan', 'bitkisel'],
      'gluten-free': ['gluten-free', 'glutensiz'],
      'spicy': ['acılı', 'spicy', 'baharatlı'],
      'mild': ['acısız', 'mild', 'hafif'],
      'hot': ['sıcak', 'hot', 'sıcak servis'],
      'cold': ['soğuk', 'cold', 'soğuk servis'],
      'fresh': ['taze', 'fresh', 'günlük'],
      'homemade': ['ev yapımı', 'homemade', 'el yapımı'],
      'healthy': ['sağlıklı', 'healthy', 'diyet'],
      'traditional': ['geleneksel', 'traditional', 'klasik'],
      'new': ['yeni', 'new', 'özel'],
      'popular': ['popüler', 'popular', 'çok tercih edilen'],
      'recommended': ['önerilen', 'recommended', 'tavsiye edilen']
    };
    
    for (const [keyword, tagList] of Object.entries(tagMap)) {
      if (text.includes(keyword)) {
        tags.push(...tagList.slice(0, 2)); // En fazla 2 etiket
      }
    }
    
    return Array.from(new Set(tags)); // Duplikatları kaldır
  }

  // Ana import fonksiyonu (gelişmiş)
  async importMenuFromExcel(file: File): Promise<ImportResult & { suggestions?: any[] }> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // 1. Excel parse et
      const items = await this.parseExcelFile(file);
      
      // 2. Akıllı öneriler oluştur
      const suggestions = await this.generateSmartSuggestions(items);
      
      // 3. Görselleri indir
      const itemsWithImages = await this.downloadImages(items);
      
      // 4. AI ile işle
      const finalItems = await this.processImagesWithAI(itemsWithImages);
      
      return {
        success: true,
        items: finalItems,
        errors,
        processingTime: Date.now() - startTime,
        suggestions
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Bilinmeyen hata');
      return {
        success: false,
        items: [],
        errors,
        processingTime: Date.now() - startTime
      };
    }
  }

  // Progress güncelleme
  private updateProgress(progress: ImportProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }
}

// Yardımcı fonksiyonlar
export const createExcelTemplate = (): string => {
  const headers = [
    'ID', 'Name', 'Description', 'Price', 'Category', 
    'ImageURL', 'Available', 'Tags', 'Calories', 'Allergens'
  ];
  
  const sampleData = [
    ['1', 'Margherita Pizza', 'Taze domates ve mozzarella ile hazırlanan klasik pizza', '45.99', 'Pizza', 'https://example.com/pizza1.jpg', 'true', 'vegetarian,classic,popular', '350', 'gluten,dairy'],
    ['2', 'Caesar Salad', 'Taze romaine marul ve özel caesar sosu ile', '28.50', 'Salad', 'https://example.com/salad1.jpg', 'true', 'healthy,vegetarian,fresh', '280', 'dairy,eggs'],
    ['3', 'Adana Kebap', 'Acılı kıyma kebabı, bulgur pilavı ve salata ile', '85.00', 'Ana Yemekler', 'https://example.com/kebab1.jpg', 'true', 'spicy,traditional,popular', '450', 'gluten'],
    ['4', 'Türk Kahvesi', 'Geleneksel Türk kahvesi, lokum ile servis', '15.00', 'İçecekler', 'https://example.com/coffee1.jpg', 'true', 'traditional,hot,homemade', '5', ''],
    ['5', 'Baklava', 'Fıstıklı baklava, kaymak ile servis', '35.00', 'Tatlılar', 'https://example.com/baklava1.jpg', 'true', 'sweet,traditional,homemade', '320', 'gluten,nuts']
  ];

  let csv = headers.join(',') + '\n';
  csv += sampleData.map(row => row.join(',')).join('\n');
  
  return csv;
};

export const downloadExcelTemplate = () => {
  const csv = createExcelTemplate();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'menu_template.csv';
  link.click();
  
  URL.revokeObjectURL(url);
};

export default ExcelParser;
