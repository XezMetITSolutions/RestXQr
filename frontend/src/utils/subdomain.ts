// Subdomain utility functions

export function getSubdomain(): string {
  if (typeof window === 'undefined') return 'default';
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // localhost veya IP adresi için
  if (parts.length < 3) return 'default';
  
  // subdomain.guzellestir.com formatında
  const subdomain = parts[0];
  
  // Ana domain'ler için default kullan
  const mainDomains = ['localhost', 'www', 'guzellestir'];
  if (mainDomains.includes(subdomain)) return 'default';
  
  return subdomain;
}

export function getStorageKey(baseKey: string): string {
  const subdomain = getSubdomain();
  return `${subdomain}-${baseKey}`;
}
