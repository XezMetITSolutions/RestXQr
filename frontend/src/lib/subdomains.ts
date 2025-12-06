import subdomainsData from '@/data/subdomains.json';

// JSON dosyasından subdomain listesini al
export function getSubdomains(): string[] {
  return [...subdomainsData];
}

// Yeni subdomain ekle (client-side için)
export function addSubdomainToList(slug: string): string[] {
  const currentSubdomains = getSubdomains();
  if (!currentSubdomains.includes(slug)) {
    currentSubdomains.push(slug);
  }
  return currentSubdomains;
}

// Subdomain'i listeden kaldır (client-side için)
export function removeSubdomainFromList(slug: string): string[] {
  const currentSubdomains = getSubdomains();
  return currentSubdomains.filter(s => s !== slug);
}

// JSON dosyasını güncelle (client-side'da çalışmaz, sadece development için)
// Not: Gerçek uygulamada bu işlem bir API endpoint'i aracılığıyla yapılmalı
export function updateSubdomainsFile(subdomains: string[]): void {
  // Bu fonksiyon client-side'da çalışmaz çünkü dosya sistemi erişimi yok
  // Gelecekte bir API endpoint'i ile bu işlemi yapabiliriz
  console.log('Güncellenecek subdomain listesi:', subdomains);
  console.warn('Bu işlem client-side\'da gerçekleştirilemez. Lütfen src/data/subdomains.json dosyasını manuel olarak güncelleyin.');
}
