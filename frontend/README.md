# 🍽️ MASAPP Frontend

Türkiye'nin en gelişmiş QR menü ve restoran yönetim sistemi frontend uygulaması.

## 🚀 Özellikler

- **QR Menü Sistemi**: Temassız menü deneyimi
- **Çoklu Panel Yönetimi**: Mutfak, garson, kasa, admin panelleri
- **Gerçek Zamanlı Sipariş Takibi**: WebSocket ile canlı güncellemeler
- **Çoklu Dil Desteği**: Türkçe ve İngilizce
- **Güvenli Admin Paneli**: 2FA destekli admin paneli
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **AI Menü Optimizasyonu**: Yapay zeka destekli öneriler

## 🛠️ Teknoloji Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: React Icons, Lucide React
- **Charts**: Chart.js, React Chart.js 2
- **Internationalization**: i18next, react-i18next

## 📁 Proje Yapısı

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router sayfaları
│   │   ├── admin/          # Admin paneli
│   │   ├── business/       # İşletme panelleri
│   │   ├── demo/           # Demo sayfaları
│   │   └── api/            # API routes
│   ├── components/         # React bileşenleri
│   ├── store/             # Zustand state management
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Yardımcı kütüphaneler
│   ├── types/             # TypeScript tip tanımları
│   └── middleware/        # Next.js middleware
├── public/                # Statik dosyalar
├── scripts/               # Deployment script'leri
└── docs/                  # Dokümantasyon
```

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone https://github.com/XezMetITSolutions/masapp-frontend.git
cd masapp-frontend
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment variables ayarlayın**
```bash
cp env.example .env.local
# .env.local dosyasını düzenleyin
```

4. **Development server'ı başlatın**
```bash
npm run dev
```

5. **Tarayıcıda açın**
```
http://localhost:3000
```

## 🔐 Admin Paneli

Admin paneli güvenlik özellikleri ile korunur:

- **Güvenlik**: 2FA, Rate Limiting, Account Lockout
- **Demo Giriş**: 
  - Kullanıcı: `admin`
  - Şifre: `MasApp2024!`
  - 2FA: `123456`

## 📱 Demo Sayfalar

- **Ana Sayfa**: `/`
- **Menü**: `/menu`
- **Demo Menü**: `/demo/menu`
- **Mutfak Paneli**: `/kitchen`
- **Business Dashboard**: `/business/dashboard`

## 🛡️ Güvenlik Özellikleri

- **HTTPS Zorunluluğu**: Tüm admin sayfaları
- **CSP Headers**: XSS koruması
- **Rate Limiting**: Brute force saldırı koruması
- **2FA**: İki faktörlü doğrulama
- **Account Lockout**: 5 başarısız denemeden sonra 30 dakika kilit

## 🚀 Deployment

### Netlify (Önerilen)

1. **Build**
```bash
npm run build
```

2. **Admin yapılandırmasını aktif edin**
```bash
cp netlify-admin.toml netlify.toml
```

3. **Deploy**
```bash
netlify deploy --prod
```

### Manuel Deployment

```bash
# Build
npm run build

# out/ klasörünü hosting sağlayıcınıza yükleyin
```

## 📊 Performance

- **Lighthouse Score**: 95+
- **Core Web Vitals**: Optimized
- **Bundle Size**: Optimized with code splitting
- **Image Optimization**: Next.js Image component
- **Caching**: Aggressive caching strategy

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

## 📈 Monitoring

- **Error Tracking**: Built-in error boundaries
- **Performance Monitoring**: Core Web Vitals
- **Analytics**: Google Analytics ready
- **Uptime Monitoring**: Health check endpoints

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Bu proje özel lisans altındadır. Tüm hakları saklıdır.

## 📞 İletişim

- **Website**: [https://guzellestir.com](https://guzellestir.com)
- **Admin Panel**: [https://admin.guzellestir.com](https://admin.guzellestir.com)
- **Support**: support@guzellestir.com

## 🏆 Özellikler

- ✅ QR Menü Sistemi
- ✅ Çoklu Panel Yönetimi
- ✅ Gerçek Zamanlı Takip
- ✅ Güvenli Admin Paneli
- ✅ Çoklu Dil Desteği
- ✅ AI Menü Optimizasyonu
- ✅ Responsive Tasarım
- ✅ Performance Optimized
- ✅ SEO Friendly
- ✅ PWA Ready

---

**© 2025 MasApp. Tüm hakları saklıdır.**
