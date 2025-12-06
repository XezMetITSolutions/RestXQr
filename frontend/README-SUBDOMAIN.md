# Subdomain Yönetim Sistemi

Bu dokümantasyon, MASAPP projesi için geliştirilen subdomain yönetim sistemini açıklar. Sistem, her işletme için özel subdomain oluşturma ve yönetme imkanı sağlar.

## 🏗️ Mimari

### Frontend (Netlify)
- **Ana Domain**: `guzellestir.com`
- **İşletme Subdomainleri**: `{işletme-adı}.guzellestir.com`

### Backend (Vercel)
- **API Base URL**: `https://api.guzellestir.com`
- **Subdomain Validation**: `/api/subdomains/validate/{subdomain}`
- **Admin Management**: `/api/admin/subdomains`

## 🚀 Özellikler

### 1. Otomatik Subdomain Oluşturma
- Super admin panelinden yeni subdomain oluşturma
- Otomatik DNS kayıt yönetimi
- Subdomain validasyonu ve kontrolü

### 2. DNS Yönetimi
- **Desteklenen Sağlayıcılar**:
  - Cloudflare (Önerilen)
  - AWS Route 53
  - GoDaddy
  - Namecheap
- Otomatik DNS propagasyon kontrolü
- TTL ayarları

### 3. Edge Functions (Netlify)
- **subdomain-router.ts**: Subdomain routing ve validasyon
- Otomatik restoran sayfası yönlendirmesi

### 4. Super Admin Paneli
- Subdomain listesi ve yönetimi
- DNS durumu takibi
- İşletme bilgileri yönetimi
- Plan yönetimi (Basic, Premium, Pro)

## 📁 Dosya Yapısı

```
frontend/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── subdomains/
│   │   │   │   ├── page.tsx              # Subdomain listesi
│   │   │   │   └── create/page.tsx       # Yeni subdomain oluşturma
│   │   │   └── settings/page.tsx         # Domain yönetimi sekmesi
│   │   └── api/
│   │       ├── subdomains/
│   │       │   └── validate/[subdomain]/route.ts
│   │       └── admin/
│   │           └── subdomains/
│   │               ├── route.ts          # CRUD işlemleri
│   │               ├── [id]/route.ts     # Tekil subdomain yönetimi
│   │               └── [id]/dns/route.ts # DNS yönetimi
│   └── lib/
│       ├── subdomain-manager.ts          # Subdomain oluşturma
│       └── dns-manager.ts               # DNS kayıt yönetimi
└── netlify/
    ├── edge-functions/
    │   └── subdomain-router.ts          # Subdomain routing
    └── netlify.toml                     # Netlify konfigürasyonu
```

## 🔧 Kurulum

### 1. Environment Variables

```bash
# DNS Sağlayıcı API Anahtarları
CLOUDFLARE_API_KEY=your_cloudflare_api_key
CLOUDFLARE_ZONE_ID=your_zone_id

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_ROUTE53_HOSTED_ZONE_ID=your_hosted_zone_id

GODADDY_API_KEY=your_godaddy_api_key
NAMECHEAP_API_KEY=your_namecheap_api_key

# API Base URL
API_BASE_URL=https://api.guzellestir.com
```

### 2. Netlify Konfigürasyonu

`netlify.toml` dosyasında wildcard domain desteği:

```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"
  API_BASE_URL = "https://api.guzellestir.com"

# Subdomain routing için edge function
[[edge_functions]]
  function = "subdomain-router"
  path = "/*"

```

### 3. DNS Konfigürasyonu

Ana domain için wildcard DNS kaydı:

```
Type: CNAME
Name: *
Value: guzellestir.netlify.app
TTL: 300
```

## 🎯 Kullanım

### 1. Yeni Subdomain Oluşturma

1. Super admin paneline giriş yap
2. **Domain Yönetimi** sekmesine git
3. **Yeni Subdomain** butonuna tıkla
4. Gerekli bilgileri doldur:
   - Subdomain adı (3-20 karakter)
   - İşletme bilgileri
   - Sahip bilgileri
   - Plan seçimi
5. **Subdomain Oluştur** butonuna tıkla

### 2. Subdomain Yönetimi

- **Görüntüle**: Subdomain detaylarını görüntüle
- **Düzenle**: Subdomain bilgilerini güncelle
- **DNS Ayarları**: DNS kayıtlarını yönet
- **Sil**: Subdomain'i kaldır

### 3. DNS Yönetimi

- Otomatik DNS kayıt oluşturma
- Propagasyon durumu takibi
- DNS sağlayıcı değişikliği
- TTL ayarları

## 🔄 İş Akışı

### Subdomain Oluşturma Süreci

1. **Validasyon**: Subdomain formatı ve kullanılabilirlik kontrolü
2. **DNS Kaydı**: Seçilen sağlayıcıda DNS kaydı oluşturma
3. **Veritabanı**: Subdomain bilgilerini kaydetme
4. **Propagasyon**: DNS propagasyonunu bekleme
5. **Aktivasyon**: Subdomain'i aktif hale getirme

### Subdomain Erişim Süreci

1. **Edge Function**: `subdomain-router.ts` subdomain'i yakalar
2. **Validasyon**: API'den subdomain doğrulaması
3. **Yönlendirme**: Restoran sayfasına yönlendirme
4. **Context**: Restoran bilgilerini context'e ekleme

## 🛡️ Güvenlik

### Subdomain Validasyonu
- Format kontrolü (regex)
- Rezerve kelime kontrolü
- Uzunluk kontrolü (3-20 karakter)
- Kullanılabilirlik kontrolü

### Erişim Kontrolü
- Super admin yetkisi gerekli
- JWT token doğrulaması
- Role-based access control

### DNS Güvenliği
- API anahtarları environment variables'da
- HTTPS zorunlu
- CORS konfigürasyonu

## 📊 Monitoring

### DNS Durumu
- Propagasyon takibi
- DNS kayıt durumu
- Hata logları

### Subdomain Metrikleri
- Ziyaret sayıları
- Aylık gelir
- Son aktivite
- Plan kullanımı

## 🚨 Troubleshooting

### Yaygın Sorunlar

1. **DNS Propagasyon Gecikmesi**
   - Çözüm: TTL değerini düşür (300 saniye)
   - Bekleme süresi: 5-15 dakika

2. **Subdomain Bulunamadı**
   - DNS kayıtlarını kontrol et
   - Edge function loglarını incele
   - API endpoint'lerini test et

3. **Yetkisiz Erişim**
   - JWT token'ı kontrol et
   - Super admin rolünü doğrula
   - Cookie ayarlarını kontrol et

### Log Dosyaları

```bash
# Edge Function Logs (Netlify)
netlify logs:function subdomain-router

# API Logs (Vercel)
vercel logs --follow

# DNS Manager Logs
console.log('DNS kayıt oluşturuluyor:', record);
```

## 🔮 Gelecek Geliştirmeler

### Planlanan Özellikler
- [ ] Custom domain desteği
- [ ] SSL sertifika otomatik yönetimi
- [ ] Subdomain analytics dashboard
- [ ] Bulk subdomain işlemleri
- [ ] API rate limiting
- [ ] Webhook desteği

### Performans İyileştirmeleri
- [ ] DNS cache sistemi
- [ ] Edge function optimizasyonu
- [ ] Database indexing
- [ ] CDN entegrasyonu

## 📞 Destek

### Dokümantasyon
- [Netlify Edge Functions](https://docs.netlify.com/edge-functions/overview/)
- [Vercel API Routes](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Cloudflare DNS API](https://developers.cloudflare.com/api/)

### İletişim
- **Technical Support**: support@guzellestir.com
- **Documentation**: docs.guzellestir.com
- **GitHub Issues**: github.com/masapp/issues

---

**Not**: Bu sistem production ortamında kullanılmadan önce kapsamlı test edilmelidir. DNS değişiklikleri geri alınamaz olduğu için dikkatli olunmalıdır.


