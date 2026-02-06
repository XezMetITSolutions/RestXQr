import { create } from 'zustand';
import { aiTranslationService } from '@/lib/aiTranslation';

type Language = 'en' | 'tr' | 'de';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: {
    [key: string]: {
      en: string;
      tr: string;
      de: string;
    };
  };
  t: (key: string) => string;
  tAI: (text: string, context?: string) => Promise<string>;
  isTranslating: boolean;
}

const useLanguageStore = create<LanguageState>()((set, get) => ({
  language: 'de', // Default language changed to German as per requirement
  isTranslating: false,

  setLanguage: (language) => {
    set({ language });
  },

  translations: {
    // Common UI elements
    appName: {
      en: 'MASAPP',
      tr: 'MASAPP',
      de: 'MASAPP',
    },
    menu: {
      en: 'Menu',
      tr: 'Menü',
      de: 'Speisekarte',
    },
    cart: {
      en: 'Cart',
      tr: 'Sepet',
      de: 'Warenkorb',
    },
    waiter: {
      en: 'Waiter',
      tr: 'Garson',
      de: 'Service',
    },
    table: {
      en: 'Table',
      tr: 'Masa',
      de: 'Tisch',
    },

    // Menu page
    categories: {
      en: 'Categories',
      tr: 'Kategoriler',
      de: 'Kategorien',
    },
    popular: {
      en: 'Popular',
      tr: 'Popüler',
      de: 'Beliebt',
    },
    all: {
      en: 'All',
      tr: 'Tümü',
      de: 'Alle',
    },
    addToCart: {
      en: 'Add to Cart',
      tr: 'Sepete Ekle',
      de: 'In den Warenkorb',
    },

    // Cart page
    yourOrder: {
      en: 'Your Order',
      tr: 'Siparişiniz',
      de: 'Ihre Bestellung',
    },
    emptyCart: {
      en: 'Your cart is empty',
      tr: 'Sepetiniz boş',
      de: 'Ihr Warenkorb ist leer',
    },
    subtotal: {
      en: 'Subtotal',
      tr: 'Ara Toplam',
      de: 'Zwischensumme',
    },
    discount: {
      en: 'Discount',
      tr: 'İndirim',
      de: 'Rabatt',
    },
    tip: {
      en: 'Tip',
      tr: 'Bahşiş',
      de: 'Trinkgeld',
    },
    total: {
      en: 'Total',
      tr: 'Toplam',
      de: 'Gesamt',
    },
    applyCoupon: {
      en: 'Apply Coupon',
      tr: 'Kupon Uygula',
      de: 'Gutschein einlösen',
    },
    placeOrder: {
      en: 'Place Order',
      tr: 'Sipariş Ver',
      de: 'Jetzt bestellen',
    },

    // Waiter page
    callWaiter: {
      en: 'Call Waiter',
      tr: 'Garson Çağır',
      de: 'Service rufen',
    },
    quickRequests: {
      en: 'Quick Requests',
      tr: 'Hızlı İstekler',
      de: 'Schnellwahl',
    },
    customRequest: {
      en: 'Custom Request',
      tr: 'Özel İstek',
      de: 'Sonderwunsch',
    },
    water: {
      en: 'Water',
      tr: 'Su',
      de: 'Wasser',
    },
    bill: {
      en: 'Bill',
      tr: 'Hesap',
      de: 'Rechnung',
    },
    cleanTable: {
      en: 'Clean Table',
      tr: 'Masa Temizliği',
      de: 'Tisch abräumen',
    },
    help: {
      en: 'Help',
      tr: 'Yardım',
      de: 'Hilfe',
    },
    send: {
      en: 'Send',
      tr: 'Gönder',
      de: 'Abschicken',
    },
    activeRequests: {
      en: 'Active Requests',
      tr: 'Aktif İstekler',
      de: 'Aktive Anfragen',
    },

    // Item detail page
    quantity: {
      en: 'Quantity',
      tr: 'Adet',
      de: 'Anzahl',
    },
    ingredients: {
      en: 'Ingredients',
      tr: 'İçindekiler',
      de: 'Zutaten',
    },
    allergens: {
      en: 'Allergens',
      tr: 'Alerjenler',
      de: 'Allergene',
    },
    calories: {
      en: 'Calories',
      tr: 'Kalori',
      de: 'Kalorien',
    },
    servingInfo: {
      en: 'Serving Info',
      tr: 'Servis Bilgisi',
      de: 'Servierhinweis',
    },

    // Admin
    dashboard: {
      en: 'Dashboard',
      tr: 'Panel',
      de: 'Dashboard',
    },
    qrGenerator: {
      en: 'QR Generator',
      tr: 'QR Oluşturucu',
      de: 'QR-Generator',
    },
    settings: {
      en: 'Settings',
      tr: 'Ayarlar',
      de: 'Einstellungen',
    },

    // Landing Page - Hero
    heroBadge: {
      en: 'Digital Transformation with RestXQr',
      tr: 'RestXQr ile Dijital Dönüşüm',
      de: 'Digitale Transformation mit RestXQr',
    },
    heroTitle1: {
      en: 'Is Your Restaurant',
      tr: 'Restoranınız',
      de: 'Ist Ihr Restaurant',
    },
    heroTitle2: {
      en: 'Ready for the',
      tr: 'Dijital Çağa',
      de: 'bereit für die',
    },
    heroTitle3: {
      en: 'Digital Age?',
      tr: 'Hazır mı?',
      de: 'digitale Zukunft?',
    },
    heroSubtitle1: {
      en: 'Maximize your restaurant\'s potential with the most advanced QR menu and order management system!',
      tr: 'En gelişmiş QR menü ve sipariş yönetim sistemi ile restoranınızın potansiyelini en üst düzeye çıkarın!',
      de: 'Maximieren Sie das Potenzial Ihres Restaurants mit dem fortschrittlichsten QR-Bestellsystem!',
    },
    heroSubtitle2: {
      en: 'Leave your competitors behind.',
      tr: 'Rakiplerinizi geride bırakın.',
      de: 'Hängen Sie den Wettbewerb ab.',
    },
    viewPanels: {
      en: 'View Panels',
      tr: 'Panelleri Görüntüle',
      de: 'Admin-Bereich',
    },
    viewDemo: {
      en: 'View Demo',
      tr: 'Demo QR Menü incele',
      de: 'Demo testen',
    },
    requestDemo: {
      en: 'Request Demo',
      tr: 'Demo Talep Et',
      de: 'Demo anfordern',
    },
    statLabelGrowth: {
      en: 'GROWTH',
      tr: 'BÜYÜME',
      de: 'WACHSTUM',
    },
    statLabelSmart: {
      en: 'SMART',
      tr: 'ZEKA',
      de: 'INTELLIGENZ',
    },
    statLabelTrust: {
      en: 'TRUST',
      tr: 'GÜVEN',
      de: 'VERTRAUEN',
    },
    statSales: {
      en: 'MORE REVENUE',
      tr: 'DAHA FAZLA KAZANÇ',
      de: 'MEHR UMSATZ',
    },
    statAI: {
      en: 'SMART MENU (AI)',
      tr: 'AKILLI MENÜ (AI)',
      de: 'SMARTES MENÜ (KI)',
    },
    statSupport: {
      en: 'FAST & RELIABLE SUPPORT',
      tr: 'HIZLI & GÜVENİLİR DESTEK',
      de: 'SCHNELLER & ZUVERLÄSSIGER SUPPORT',
    },
    statSalesDesc: {
      en: 'Significant boost in table turnover and revenue.',
      tr: 'Akıllı sipariş ile ciro artışı.',
      de: 'Deutliche Steigerung von Tischbelegung und Umsatz.',
    },
    statAIDesc: {
      en: 'Automatic optimization based on sales data.',
      tr: 'Satışa göre otomatik optimizasyon.',
      de: 'Smarte visuelle Optimierung für Ihre Menüpunkte.',
    },
    statSupportDesc: {
      en: 'Always here to help during your peak business hours.',
      tr: 'En yoğun saatlerinizde her zaman yanınızdayız.',
      de: 'Immer da, um Stoßzeiten zu unterstützen.',
    },

    // Landing Page - AI Section
    aiBadge: {
      en: 'AI Technology',
      tr: 'AI Teknolojisi',
      de: 'KI-Technologie',
    },
    aiTitle: {
      en: 'Visual Optimization with AI',
      tr: 'AI ile Görsel Optimizasyonu',
      de: 'Perfekte Bilder dank KI',
    },
    aiDesc: {
      en: 'Professionalize your menu photos instantly with AI. Elevate your brand without expensive photographers.',
      tr: 'Yapay Zeka ile ürün fotoğraflarınızı anında profesyonelleştirin ve markanızın görsel gücünü artırın.',
      de: 'Professionalisieren Sie Ihre Speisekarte sofort mit KI. Werten Sie Ihre Marke ohne teure Fotografen auf.',
    },
    before: {
      en: 'BEFORE',
      tr: 'ÖNCESİ',
      de: 'VORHER',
    },
    after: {
      en: 'AFTER',
      tr: 'SONRASI',
      de: 'NACHHER',
    },
    amateurLook: {
      en: 'Amateur Look',
      tr: 'Amatör Görünüm',
      de: 'Standard-Aufnahme',
    },
    proLook: {
      en: 'Professional Look',
      tr: 'Profesyonel Görünüm',
      de: 'Profi-Qualität',
    },
    costSavings: {
      en: 'Cost Savings',
      tr: 'Maliyet Tasarrufu',
      de: 'Kosten sparen',
    },
    costSavingsDesc: {
      en: 'Professional imagery at your fingertips. High-quality results with AI, integrated into your workflow.',
      tr: 'Profesyonel görseller parmaklarınızın ucunda. İş akışınıza entegre AI ile yüksek kaliteli sonuçlar.',
      de: 'Professionelle Bilder auf Knopfdruck. Hochwertige Ergebnisse dank KI, direkt in Ihren Workflow integriert.',
    },
    salesIncrease: {
      en: 'Sales Increase',
      tr: 'Satış Artışı',
      de: 'Mehr Umsatz',
    },
    salesIncreaseDesc: {
      en: 'Accelerate table turnover with faster service and detailed product info (calories, allergens). Eliminate ordering hesitation and drive sales with smart marketing.',
      tr: 'Hızlı sipariş, detaylı ürün bilgileri (kalori, alerjen) ve akıllı pazarlama araçlarıyla masa sirkülasyonunu hızlandırın. Kararsızlığı bitirin, satışlarınızı kalıcı olarak artırın.',
      de: 'Beschleunigen Sie die Tischbelegung durch schnelleren Service und detaillierte Infos. Vermeiden Sie Bestell-Zögern und steigern Sie den Umsatz smart.',
    },
    footerSlogan: {
      en: 'Empowering restaurants with cutting-edge digital solutions for seamless ordering and management.',
      tr: 'Kesintisiz sipariş ve yönetim için restoranları en ileri dijital çözümlerle güçlendiriyoruz.',
      de: 'Restaurants mit modernsten digitalen Lösungen für nahtlose Bestellungen empowern.',
    },
    contactUs: {
      en: 'CONTACT US',
      tr: 'BİZE ULAŞIN',
      de: 'KONTAKTIEREN SIE UNS',
    },
    callUs: {
      en: 'Call Now',
      tr: 'Hemen Arayın',
      de: 'Jetzt Anrufen',
    },
    legalLinkSection: {
      en: 'LEGAL',
      tr: 'YASAL',
      de: 'RECHTLICHES',
    },
    cookiesPolicy: {
      en: 'Cookie Policy',
      tr: 'Çerez Politikası',
      de: 'Cookie-Richtlinie',
    },
    privacyPolicy: {
      en: 'Privacy Policy',
      tr: 'Gizlilik Politikası',
      de: 'Datenschutzerklärung',
    },
    termsOfService: {
      en: 'Terms of Service',
      tr: 'Kullanım Koşulları',
      de: 'Nutzungsbedingungen',
    },
    legalInfo: {
      en: 'Legal Information',
      tr: 'Yasal Bilgiler',
      de: 'Impressum',
    },
    allRightsReserved: {
      en: 'All rights reserved.',
      tr: 'Tüm hakları saklıdır.',
      de: 'Alle Rechte vorbehalten.',
    },

    fastResult: {
      en: 'Fast Result',
      tr: 'Hızlı Sonuç',
      de: 'Sofortige Ergebnisse',
    },
    fastResultDesc: {
      en: 'Professionalize all your product photos in seconds. No waiting!',
      tr: 'Saniyeler içinde tüm ürün fotoğraflarınızı profesyonelleştirin. Bekleme yok!',
      de: 'Optimieren Sie Ihre gesamte Speisekarte in Sekunden. Ohne Wartezeit!',
    },
    tryNow: {
      en: 'Try Now!',
      tr: 'Hemen Deneyin!',
      de: 'Jetzt testen!',
    },
    tryNowDesc: {
      en: 'Experience the power of AI visual optimization. Elevate your menu items and capture customer interest instantly.',
      tr: 'AI görsel optimizasyonunun gücünü deneyimleyin. Menü öğelerinizi yükseltin ve müşteri ilgisini anında çekin.',
      de: 'Erleben Sie die Kraft der KI-Bildoptimierung. Werten Sie Ihre Speisekarte auf und wecken Sie sofortiges Interesse.',
    },
    reviewAI: {
      en: 'Review AI Optimization',
      tr: 'AI Optimizasyonunu İncele',
      de: 'KI-Optimierung testen',
    },
    marketingSectionTitle: {
      en: 'Boost Your Sales with Smart Marketing',
      tr: 'Akıllı Pazarlama ile Satışlarınızı Katlayın',
      de: 'Umsatz steigern mit smartem Marketing',
    },
    marketingSectionDesc: {
      en: 'RestXQr gives you more than a menu. Use built-in campaign and advertising tools to drive customers to your best items.',
      tr: 'RestXQr size bir menüden fazlasını sunar. Yerleşik kampanya, duyuru ve reklam araçlarıyla müşterilerinizi istediğiniz ürünlere yönlendirerek karlılığınızı artırın.',
      de: 'RestXQr bietet mehr als nur ein Menü. Nutzen Sie Kampagnen- und Werbetools, um Kunden zu Ihren besten Artikeln zu führen.',
    },
    marketingAdsTitle: {
      en: 'Smart Announcements & Ads',
      tr: 'Akıllı Duyuru ve Reklam',
      de: 'Smarte Ankündigungen & Werbung',
    },
    marketingAdsDesc: {
      en: 'Communicate special daily offers and announcements directly to your customers\' phones through the menu.',
      tr: 'Müşterilerinizin telefonuna doğrudan menü üzerinden kampanya ve duyurular ileterek onları karlı ürünlere yönlendirin.',
      de: 'Senden Sie Angebote direkt auf die Smartphones Ihrer Kunden über das Menü.',
    },
    tailoredSolutionsTitle: {
      en: 'Tailored Solutions for Your Business',
      tr: 'İşletmenize Özel Çözümler',
      de: 'Maßgeschneiderte Lösungen für Ihr Unternehmen',
    },
    tailoredSolutionsDesc: {
      en: 'Every restaurant is unique. We provide customizable features and dedicated support to fit your specific operational needs.',
      tr: 'Her işletme benzersizdir. Sizin operasyonel ihtiyaçlarınıza özel özelleştirmeler ve birebir çözümler sunuyoruz.',
      de: 'Jedes Restaurant ist einzigartig. Wir bieten anpassbare Funktionen für Ihre Bedürfnisse.',
    },
    waiterCallEfficiencyTitle: {
      en: 'Maximized Efficiency with Waiter Call',
      tr: 'Garson Çağır ile Maksimum Verimlilik',
      de: 'Maximale Effizienz mit Service-Ruf',
    },
    waiterCallEfficiencyDesc: {
      en: 'Seamless communication for every need. One click to reach the waiter, speed up service, and eliminate errors.',
      tr: 'Her talep için kusursuz iletişim. Tek tıkla garsona ulaşın, servisi hızlandırın ve hataları sıfırlayın.',
      de: 'Nahtlose Kommunikation für jeden Bedarf. Ein Klick, um den Service zu erreichen und Fehler zu vermeiden.',
    },
    efficiencyBadge: {
      en: 'Efficiency & Satisfaction',
      tr: 'Verimlilik ve Memnuniyet',
      de: 'Effizienz & Zufriedenheit',
    },
    additionalFeatures: {
      en: 'Additional Smart Features',
      tr: 'Ek Akıllı Özellikler',
      de: 'Zusätzliche Funktionen',
    },
    tryNowTitle: {
      en: 'Try Now!',
      tr: 'Hemen Deneyin!',
      de: 'Jetzt ausprobieren!',
    },
    examineFeature: {
      en: 'Examine Feature',
      tr: 'Özelliği İncele',
      de: 'Funktion prüfen',
    },
    multiBranchTitle: {
      en: 'Multi-Branch Management',
      tr: 'Çoklu Şube Yönetimi',
      de: 'Multi-Filial-Verwaltung',
    },
    multiBranchDesc: {
      en: 'Control all your branches with Super Admin. Real-time monitoring, branch-specific ads, and bulk product updates.',
      tr: 'Süper yönetici özelliğiyle tüm şubelerinize hakim olun. Anlık kontrol, şubeye özel reklamlar ve toplu ürün yönetimi.',
      de: 'Steuern Sie alle Filialen mit dem Super-Admin. Echtzeit-Überwachung und Filial-Werbung.',
    },
    socialGrowthTitle: {
      en: 'Organic Social Growth & Reviews',
      tr: 'Organik Sosyal Büyüme ve Yorumlar',
      de: 'Organisches Social Growth & Bewertungen',
    },
    socialGrowthDesc: {
      en: 'Direct customers to Google Reviews, Instagram, or Facebook instantly. Turn satisfied diners into loyal followers and boost your local ranking organically.',
      tr: 'Müşterileri anında Google Yorumları, Instagram veya Facebook\'a yönlendirin. Memnun konukları sadık takipçilere dönüştürün ve yerel sıralamanızı organik olarak yükseltin.',
      de: 'Leiten Sie Kunden sofort zu Google-Bewertungen, Instagram oder Facebook weiter. Verwandeln Sie zufriedene Gäste in treue Follower.',
    },
    aiBannerTitle: {
      en: 'AI Image Optimization',
      tr: 'AI GÖRSEL OPTİMİZASYONU',
      de: 'KI-Bildoptimierung',
    },
    aiBannerDesc: {
      en: 'Professionalize your product photos in seconds. Reduce costs and captivate your customers.',
      tr: 'Ürün fotoğraflarınızı saniyeler içinde profesyonelleştirin. Maliyetleri düşürün ve müşterilerinizi büyüleyin.',
      de: 'Professionalisieren Sie Ihre Produktfotos in Sekunden. Senken Sie Kosten.',
    },
    multiLangTitle: {
      en: '9 Language Support',
      tr: '9 Dil Desteği',
      de: '9 Sprachen Unterstützung',
    },
    multiLangDesc: {
      en: 'Go global! Serve your customers from all over the world in their own language with 9 different options.',
      tr: 'Globalleşin! Dünyanın her yerinden gelen müşterilerinize 9 farklı dil seçeneğiyle kendi dillerinde hizmet verin.',
      de: 'Werden Sie global! Bedienen Sie Kunden weltweit in 9 verschiedenen Sprachen.',
    },
    allInOneTitle: {
      en: 'All-in-One Management',
      tr: 'Tek Çatıda Tam Kontrol',
      de: 'All-in-One Management',
    },
    allInOneDesc: {
      en: 'Stock tracking, staff management, advanced reporting, and fully customizable designs in one place.',
      tr: 'Stok takibi, personel yönetimi, gelişmiş raporlama ve tamamen özelleştirilebilir tasarımlar tek noktada.',
      de: 'Lagerverwaltung, Personalmanagement, Berichte und anpassbare Designs an einem Ort.',
    },

    // Landing Page - Services
    premiumServices: {
      en: 'Premium Services',
      tr: 'Premium Hizmetler',
      de: 'Premium-Funktionen',
    },
    ourServices: {
      en: 'Our Services',
      tr: 'Hizmetlerimiz',
      de: 'Unser Angebot',
    },
    servicesDesc: {
      en: 'We offer comprehensive digital solutions for your restaurant',
      tr: 'Restoranınız için tam kapsamlı dijital çözümler sunuyoruz',
      de: 'Die All-in-One Digitallösung für Ihre Gastronomie',
    },
    qrMenuSystem: {
      en: 'QR Menu System',
      tr: 'QR Menü Sistemi',
      de: 'Digitales QR-Menü',
    },
    qrMenuDesc: {
      en: 'Ensure your customers\' safety with a contactless menu experience. Instant updates and multi-language support.',
      tr: 'Temassız menü deneyimi ile müşterilerinizin güvenliğini sağlayın. Anlık güncellemeler ve çoklu dil desteği.',
      de: 'Bieten Sie Ihren Gästen ein sicheres, kontaktloses Bestellerlebnis. Blitzschnelle Aktualisierungen und mehrsprachig.',
    },
    orderManagement: {
      en: 'Order Management',
      tr: 'Sipariş Yönetimi',
      de: 'Bestellsystem',
    },
    orderManagementDesc: {
      en: 'Perfect kitchen and service coordination with advanced order tracking system.',
      tr: 'Gelişmiş sipariş takip sistemi ile mutfak ve servis koordinasyonunu mükemmelleştirin.',
      de: 'Perfekte Abstimmung zwischen Küche und Service dank intelligentem Tracking-System.',
    },
    detailedReporting: {
      en: 'Detailed Reporting',
      tr: 'Detaylı Raporlama',
      de: 'Detaillierte Analysen',
    },
    detailedReportingDesc: {
      en: 'Grow your business with sales analysis, customer behavior, and performance metrics.',
      tr: 'Satış analizi, müşteri davranışları ve performans metrikleri ile işinizi büyütün.',
      de: 'Optimieren Sie Ihren Betrieb mit detaillierten Verkaufsanalysen und Kundenstatistiken.',
    },
    multiPlatform: {
      en: 'Multi-Platform',
      tr: 'Çoklu Platform',
      de: 'Plattformunabhängig',
    },
    multiPlatformDesc: {
      en: 'We offer excellent experience on desktop, tablet, and mobile devices.',
      tr: 'Masaüstü, tablet ve mobil cihazlarda mükemmel deneyim sunuyoruz.',
      de: 'Ein perfektes Nutzererlebnis auf Smartphone, Tablet und Desktop.',
    },
    support247: {
      en: '24/7 Support',
      tr: '7/24 Destek',
      de: '24/7 Support',
    },
    support247Desc: {
      en: 'Our expert team is always with you. WhatsApp, phone, and online support.',
      tr: 'Uzman ekibimiz her zaman yanınızda. WhatsApp, telefon ve online destek.',
      de: 'Unser Experten-Team ist rund um die Uhr für Sie da. Via WhatsApp, Telefon und Online.',
    },

    // Landing Page - Benefits
    benefits: {
      en: 'Benefits',
      tr: 'Avantajlar',
      de: 'Ihre Vorteile',
    },
    whyRestXQr: {
      en: 'Why RestXQr?',
      tr: 'Neden RestXQr?',
      de: 'Warum RestXQr?',
    },
    whyRestXQrDesc: {
      en: 'Elevate your business operations with a leading digital restaurant management partner.',
      tr: 'Lider bir dijital restoran yönetim ortağı ile işletme operasyonlarınızı bir üst seviyeye taşıyın.',
      de: 'Optimieren Sie Ihren Betrieb mit einem führenden digitalen Management-Partner.',
    },
    timeSaving: {
      en: 'High Efficiency Gain',
      tr: 'Yüksek Verimlilik Kazanımı',
      de: 'Hoher Effizienzgewinn',
    },
    timeSavingDesc: {
      en: 'Increase staff efficiency and speed up operations with automatic order system.',
      tr: 'Otomatik sipariş sistemi ile personel verimliliğini artırın ve işlemleri hızlandırın.',
      de: 'Entlasten Sie Ihr Personal und beschleunigen Sie die Abläufe durch automatisierte Bestellungen.',
    },
    secure100: {
      en: '100% Secure',
      tr: '%100 Güvenli',
      de: '100% Datensicherheit',
    },
    secure100Desc: {
      en: 'Protect your customer data with banking-level security.',
      tr: 'Bankacılık düzeyinde güvenlik ile müşteri verilerinizi koruyun.',
      de: 'Höchste Sicherheit für Ihre Daten und die Ihrer Gäste.',
    },
    integrateMenu: {
      en: 'We Integrate Your Menu',
      tr: 'Mevcut Menünüzü Entegre Ediyoruz',
      de: 'Kostenlose Menü-Integration',
    },
    integrateMenuDesc: {
      en: 'We digitize your existing menu without losing it. Easy transition guarantee.',
      tr: 'Mevcut menünüzü hiç kaybetmeden dijitalleştiriyoruz. Kolay geçiş garantisi.',
      de: 'Wir digitalisieren Ihre bestehende Speisekarte 1:1. Einfacher Wechsel garantiert.',
    },
    fastSetup: {
      en: 'Very Fast Setup',
      tr: 'Çok Kısa Sürede Kurulum',
      de: 'Blitzschnelle Einrichtung',
    },
    fastSetupDesc: {
      en: 'Set up the system in hours and start using it. Fast and easy.',
      tr: 'Saatler içinde sistemi kurun ve kullanmaya başlayın. Hızlı ve kolay.',
      de: 'In wenigen Stunden startklar. Einfach, schnell und unkompliziert.',
    },

    // Landing Page - FAQ
    faq: {
      en: 'FAQ',
      tr: 'Sık Sorulan Sorular',
      de: 'Häufig gestellte Fragen',
    },
    curiosities: {
      en: 'Curiosities',
      tr: 'Merak Edilenler',
      de: 'Wissenswertes',
    },
    faqDesc: {
      en: 'Most asked questions and detailed answers',
      tr: 'En çok sorulan sorular ve detaylı cevapları',
      de: 'Antworten auf die wichtigsten Fragen.',
    },
    faq1Q: {
      en: 'What is restXqr?',
      tr: 'restXqr nedir?',
      de: 'Was ist RestXQr?',
    },
    faq1A: {
      en: 'RestXQr is a comprehensive restaurant operating system that manages the entire operation from menu to order, staff to accounting on a single platform. It uses AI to optimize your visuals, streamline your operations, and increase customer satisfaction; integrating seamlessly with your management systems.',
      tr: 'RestXQr, menüden siparişe, personelden muhasebeye kadar tüm operasyonu tek platformda yöneten kapsamlı bir restoran işletim sistemidir. AI ile görsellerinizi optimize eder, operasyonlarınızı kolaylaştırır ve misafir memnuniyetini artırır; mevcut sistemlerinizle sorunsuz entegre olur.',
      de: 'RestXQr ist das umfassende Betriebssystem für Ihre Gastronomie. Es vereint Speisekarte, Bestellsystem, Personalverwaltung und Abrechnung auf einer Plattform. Optimieren Sie Ihre Bilder mit KI und verbessern Sie die Gästezufriedenheit.',
    },
    faq2Q: {
      en: 'How does the setup process work?',
      tr: 'Kurulum süreci nasıl işliyor?',
      de: 'Wie läuft die Einrichtung ab?',
    },
    faq2A: {
      en: 'Setup and configuration processes are subject to a professional service fee as they involve on-site technical installation and specialized training for your staff. Our expert team ensures your digital architecture is perfectly established. For multi-branch businesses, special discounts are applied per branch.',
      tr: 'Kurulum ve yapılandırma süreçleri, yerinde teknik montaj ve personel eğitimi gerektirdiği için profesyonel hizmet ücretine tabidir. Uzman ekibimiz, dijital mimarinizin kusursuz kurulmasını sağlar. Şubeli işletmelerde ise şube sayısına göre özel indirimler uygulanmaktadır.',
      de: 'Einrichtungs- und Konfigurationsprozesse unterliegen einer professionellen Servicegebühr, da sie eine technische Installation vor Ort und spezielle Schulungen für Ihr Personal umfassen.',
    },
    faq3Q: {
      en: 'How does the refund guarantee work?',
      tr: 'İade garantisi nasıl çalışır?',
      de: 'Gibt es eine Geld-zurück-Garantie?',
    },
    faq3A: {
      en: 'All our services include a 15-day free trial period. Even after 1 month of full usage, we offer a refund guarantee if you are not satisfied. In refund cases, only the setup fee is retained, and the full usage fee is returned. Try it with confidence!',
      tr: 'Tüm hizmetlerimizde 15 günlük ücretsiz deneme süresi mevcuttur. 1 aylık kullanım sonunda memnun kalmazsanız iade hakkınız bulunur; bu durumda sadece kurulum ücreti kesilerek kalan tutarın tamamı iade edilir. Restoranınızı korkusuzca dijitalleştirin!',
      de: 'Alle Dienste können 15 Tage kostenlos getestet werden. Falls Sie nach einem Monat nicht zufrieden sind, erstatten wir die Gebühr (abzüglich der Einrichtungskosten) zurück.',
    },
    faq4Q: {
      en: 'Which payment methods do you accept?',
      tr: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
      de: 'Welche Zahlungsarten werden akzeptiert?',
    },
    faq4A: {
      en: 'We accept credit card, debit card, wire transfer/EFT, and all mobile payment options. Installment options are also available to support your business cash flow.',
      tr: 'Kredi kartı, banka kartı, havale/EFT ve tüm mobil ödeme seçeneklerini kabul ediyoruz. İşletme nakit akışınızı desteklemek için taksit seçenekleri de sunuyoruz.',
      de: 'Wir akzeptieren alle gängigen Kreditkarten, Überweisung und mobile Zahlungen. Auch Ratenzahlung ist möglich.',
    },
    faq5Q: {
      en: 'Do you provide technical support?',
      tr: 'Teknik destek sağlıyor musunuz?',
      de: 'Gibt es technischen Support?',
    },
    faq5A: {
      en: 'Of course! We offer WhatsApp and priority support in the Premium package, and 24/7 phone support in the Corporate package. We also provide online training videos and documentation for all our customers.',
      tr: 'Elbette! Premium pakette WhatsApp ve öncelikli destek, Kurumsal pakette 7/24 telefon desteği sunuyoruz. Ayrıca tüm müşterilerimiz için online eğitim videoları ve dokümantasyon sağlıyoruz.',
      de: 'Selbstverständlich! Wir bieten Premium-Support via WhatsApp und Telefon, sowie umfangreiche Video-Tutorials.',
    },
    faq6Q: {
      en: 'How long does it take to learn the system?',
      tr: 'Sistemi öğrenmek ne kadar sürer?',
      de: 'Ist das System schwer zu lernen?',
    },
    faq6A: {
      en: 'restXqr is designed to be very user-friendly. Your staff can learn the system in 1-2 hours. We provide detailed training during setup and provide continuous support.',
      tr: 'restXqr çok kullanıcı dostu tasarlandı. Personelleriniz 1-2 saatte sistemi öğrenebilir. Kurulum sırasında detaylı eğitim veriyoruz ve sürekli destek sağlıyoruz.',
      de: 'RestXQr ist intuitiv und kinderleicht zu bedienen. Ihr Personal beherrscht das System in weniger als einer Stunde.',
    },
    faq7Q: {
      en: 'Is it compatible with my existing POS system?',
      tr: 'Mevcut POS sistemimle uyumlu mu?',
      de: 'Ist es mit meiner Kasse kompatibel?',
    },
    faq7A: {
      en: 'restXqr works independently but can be integrated with your existing POS systems. In the Corporate package, you can connect all your systems with API integrations.',
      tr: 'restXqr bağımsız çalışır ancak mevcut POS sistemlerinizle entegre edilebilir. Kurumsal pakette API entegrasyonları ile tüm sistemlerinizi birbirine bağlayabilirsiniz.',
      de: 'RestXQr funktioniert eigenständig, lässt sich aber über APIs mit vielen gängigen Kassensystemen verbinden.',
    },
    faq8Q: {
      en: 'What are the reporting features?',
      tr: 'Raporlama özellikleri neler?',
      de: 'Welche Auswertungen gibt es?',
    },
    faq8A: {
      en: 'You can get detailed reports such as daily/weekly/monthly sales reports, best-selling products, table efficiency, staff performance, and customer analytics.',
      tr: 'Günlük/haftalık/aylık satış raporları, en çok satan ürünler, masa verimliliği, personel performansı ve müşteri analitikleri gibi detaylı raporlar alabilirsiniz.',
      de: 'Erhalten Sie detaillierte Einblicke in Umsätze, Bestseller, Tisch-Auslastung und Personal-Performance.',
    },

    // Landing Page - CTA
    startNow: {
      en: 'Start Now',
      tr: 'Hemen Başlayın',
      de: 'Jetzt starten',
    },
    digitizeRestaurant: {
      en: 'Digitize Your Restaurant',
      tr: 'Restoranınızı Dijitalleştirin',
      de: 'Digitalisieren Sie Ihre Gastronomie',
    },
    startToday: {
      en: 'Start today, see the difference tomorrow!',
      tr: 'Bugün başlayın, yarın farkı görün!',
      de: 'Starten Sie heute in die Zukunft!',
    },
    freeDemo: {
      en: 'Free Demo',
      tr: 'Ücretsiz Demo',
      de: 'Kostenlose Demo',
    },
    contactNow: {
      en: 'Contact Now',
      tr: 'Hemen İletişim',
      de: 'Kontakt aufnehmen',
    },
    phone: {
      en: 'Phone',
      tr: 'Telefon',
      de: 'Telefon',
    },
    phoneNumber: {
      en: '+43 660 868 22 01',
      tr: '+90 (555) 123 45 67',
      de: '+43 660 868 22 01',
    },
    website: {
      en: 'Website',
      tr: 'Website',
      de: 'Webseite',
    },
    // Panels Page Translations
    backToHome: {
      en: 'Back to Home',
      tr: 'Ana Sayfaya Dön',
      de: 'Zurück zur Startseite',
    },
    restxqrPanels: {
      en: 'RestXQr Panels',
      tr: 'RestXQr Panelleri',
      de: 'RestXQr-Panels',
    },
    restaurantOperations: {
      en: 'Restaurant Operations',
      tr: 'Restoran Operasyonları',
      de: 'Restaurantbetrieb',
    },
    manageSinglePlatform: {
      en: 'Manage from a single platform',
      tr: 'Tek platformdan yönetin',
      de: 'Von einer einzigen Plattform aus verwalten',
    },
    managementPanels: {
      en: 'Management Panels',
      tr: 'Yönetim Panelleri',
      de: 'Verwaltungspanels',
    },
    restaurantManagementPanels: {
      en: 'Restaurant Management Panels',
      tr: 'Restoran Yönetim Panelleri',
      de: 'Restaurant-Management-Panels',
    },
    manageAllOperations: {
      en: 'manage all your restaurant operations from a single platform.',
      tr: 'ile restoranınızın tüm operasyonlarını tek platformdan yönetin.',
      de: 'verwalten Sie alle Ihre Restaurantabläufe von einer einzigen Plattform aus.',
    },
    increaseEfficiency: {
      en: 'Increase your efficiency with panels designed for every department.',
      tr: 'Her departman için özel tasarlanmış paneller ile verimliliğinizi artırın.',
      de: 'Steigern Sie Ihre Effizienz mit Panels, die für jede Abteilung entwickelt wurden.',
    },
    waiterPanel: {
      en: 'Waiter Panel',
      tr: 'Garson Paneli',
      de: 'Kellner-Panel',
    },
    waiterPanelDesc: {
      en: 'Manage orders and see customer calls',
      tr: 'Siparişleri yönet ve müşteri çağrılarını gör',
      de: 'Bestellungen verwalten und Kundenanrufe sehen',
    },
    realTimeOrderTracking: {
      en: 'Real-time order tracking',
      tr: 'Gerçek zamanlı sipariş takibi',
      de: 'Echtzeit-Bestellverfolgung',
    },
    customerCallNotifications: {
      en: 'Customer call notifications',
      tr: 'Müşteri çağrı bildirimleri',
      de: 'Kundenanruf-Benachrichtigungen',
    },
    orderStatusUpdate: {
      en: 'Order status update',
      tr: 'Sipariş durumu güncelleme',
      de: 'Bestellstatus-Aktualisierung',
    },
    tableManagement: {
      en: 'Table management',
      tr: 'Masa yönetimi',
      de: 'Tischverwaltung',
    },
    viewDemoPanel: {
      en: 'View Demo Panel',
      tr: 'Demo Paneli Görüntüle',
      de: 'Demo-Panel anzeigen',
    },
    kitchenPanel: {
      en: 'Kitchen Panel',
      tr: 'Mutfak Paneli',
      de: 'Küchen-Panel',
    },
    kitchenPanelDesc: {
      en: 'Prepare orders and update statuses',
      tr: 'Siparişleri hazırla ve durumları güncelle',
      de: 'Bestellungen vorbereiten und Status aktualisieren',
    },
    orderQueueManagement: {
      en: 'Order queue management',
      tr: 'Sipariş kuyruğu yönetimi',
      de: 'Bestellwarteschlangen-Verwaltung',
    },
    prepTimeTracking: {
      en: 'Preparation time tracking',
      tr: 'Hazırlık süresi takibi',
      de: 'Zubereitungszeit-Verfolgung',
    },
    stockAlerts: {
      en: 'Stock alerts',
      tr: 'Stok uyarıları',
      de: 'Lagerbestandswarnungen',
    },
    autoNotifications: {
      en: 'Automatic notifications',
      tr: 'Otomatik bildirimler',
      de: 'Automatische Benachrichtigungen',
    },
    cashierPanelDesc: {
      en: 'Take payments and manage cashier operations',
      tr: 'Ödemeleri al ve kasa işlemlerini yönet',
      de: 'Zahlungen entgegennehmen und Kassenoperationen verwalten',
    },
    paymentProcessing: {
      en: 'Payment processing',
      tr: 'Hesap ödeme işlemleri',
      de: 'Zahlungsabwicklung',
    },
    invoicePrinting: {
      en: 'Invoice and receipt printing',
      tr: 'Fatura ve makbuz yazdırma',
      de: 'Rechnungs- und Belegdruck',
    },
    dailyReports: {
      en: 'Daily cashier reports',
      tr: 'Günlük kasa raporları',
      de: 'Tägliche Kassenberichte',
    },
    paymentAnalysis: {
      en: 'Payment method analysis',
      tr: 'Ödeme yöntemi analizi',
      de: 'Zahlungsmethoden-Analyse',
    },
    businessPanel: {
      en: 'Business Panel',
      tr: 'İşletme Paneli',
      de: 'Geschäfts-Panel',
    },
    businessPanelDesc: {
      en: 'Manage restaurant and see statistics',
      tr: 'Restoranı yönet ve istatistikleri gör',
      de: 'Restaurant verwalten und Statistiken einsehen',
    },
    detailedSalesAnalysis: {
      en: 'Detailed sales analysis',
      tr: 'Detaylı satış analizleri',
      de: 'Detaillierte Verkaufsanalyse',
    },
    menuManagement: {
      en: 'Menu management',
      tr: 'Menü yönetimi',
      de: 'Speisekartenverwaltung',
    },
    staffPerformance: {
      en: 'Staff performance tracking',
      tr: 'Personel performans takibi',
      de: 'Personal-Leistungsverfolgung',
    },
    customerAnalytics: {
      en: 'Customer analytics',
      tr: 'Müşteri analitikleri',
      de: 'Kundenanalytik',
    },
    demoMenu: {
      en: 'Demo Menu',
      tr: 'Demo Menü',
      de: 'Demo-Speisekarte',
    },

    checkDemoMenuDesc: {
      en: 'check our demo menu to see how the QR menu system works',
      tr: 'QR menü sisteminin nasıl çalıştığını görmek için demo menümüzü inceleyin',
      de: 'sehen Sie sich unser Demo-Menü an, um zu sehen, wie das QR-Menü-System funktioniert',
    },
    search: {
      en: 'Search',
      tr: 'Arama',
      de: 'Suche',
    },
    searchDesc: {
      en: 'Quick search in menu',
      tr: 'Menüde hızlı arama',
      de: 'Schnellsuche im Menü',
    },
    campaigns: {
      en: 'Campaigns',
      tr: 'Kampanyalar',
      de: 'Kampagnen',
    },
    campaignsDesc: {
      en: 'Daily special discounts',
      tr: 'Günlük özel indirimler',
      de: 'Tägliche Sonderrabatte',
    },
    soupOfTheDay: {
      en: 'Soup of the Day',
      tr: 'Günün Çorbası',
      de: 'Suppe des Tages',
    },
    soupOfTheDayDesc: {
      en: 'Different taste every day',
      tr: 'Her gün farklı lezzet',
      de: 'Jeden Tag ein anderer Geschmack',
    },
    reviews: {
      en: 'Reviews',
      tr: 'Değerlendirme',
      de: 'Bewertungen',
    },
    reviewsDesc: {
      en: 'Google reviews',
      tr: 'Google yorumları',
      de: 'Google-Bewertungen',
    },

    soupDesc: {
      en: 'Ezogelin soup - Homemade taste',
      tr: 'Ezogelin çorbası - Ev yapımı lezzet',
      de: 'Ezogelin-Suppe - Hausgemachter Geschmack',
    },

    discount20: {
      en: '20% Discount',
      tr: '%20 İndirim',
      de: '20% Rabatt',
    },
    specialToday: {
      en: 'Special Today!',
      tr: 'Bugüne Özel!',
      de: 'Heute Spezial!',
    },
    specialTodayDesc: {
      en: '20% discount on all desserts - Valid only today',
      tr: 'Tüm tatlılarda %20 indirim - Sadece bugün geçerli',
      de: '20% Rabatt auf alle Desserts - Nur heute gültig',
    },
    rateOnGoogle: {
      en: 'Rate on Google',
      tr: "Google'da Değerlendir",
      de: 'Auf Google bewerten',
    },
    makeComment: {
      en: 'Make a Comment',
      tr: 'Yorum Yap',
      de: 'Kommentar abgeben',
    },
    free: {
      en: 'Free',
      tr: 'Ücretsiz',
      de: 'Kostenlos',
    },
    rate: {
      en: 'Rate',
      tr: 'Değerlendir',
      de: 'Bewerten',
    },
    viewDemoMenu: {
      en: 'View Demo Menu',
      tr: 'Demo Menüyü Görüntüle',
      de: 'Demo-Menü anzeigen',
    },
    visitDemoPage: {
      en: 'Visit our demo page for a real QR menu experience',
      tr: 'Gerçek QR menü deneyimi için demo sayfamızı ziyaret edin',
      de: 'Besuchen Sie unsere Demo-Seite für ein echtes QR-Menü-Erlebnis',
    },

    whyRestXQrPanels: {
      en: 'Why RestXQr Panels?',
      tr: 'Neden RestXQr Panelleri?',
      de: 'Warum RestXQr-Panels?',
    },
    multiUserSupport: {
      en: 'Multi-User Support',
      tr: 'Çoklu Kullanıcı Desteği',
      de: 'Mehrbenutzer-Unterstützung',
    },
    multiUserSupportDesc: {
      en: 'Secure multi-user management with separate authorization levels for each department',
      tr: 'Her departman için ayrı yetki seviyeleri ile güvenli çoklu kullanıcı yönetimi',
      de: 'Sichere Mehrbenutzerverwaltung mit separaten Berechtigungsstufen für jede Abteilung',
    },
    realTimeAnalytics: {
      en: 'Real-Time Analytics',
      tr: 'Gerçek Zamanlı Analitik',
      de: 'Echtzeit-Analytik',
    },
    realTimeAnalyticsDesc: {
      en: 'Make instant decisions and increase your performance with live data',
      tr: 'Canlı veriler ile anlık kararlar alın ve performansınızı artırın',
      de: 'Treffen Sie sofortige Entscheidungen und steigern Sie Ihre Leistung mit Live-Daten',
    },
    secureAndStable: {
      en: 'Secure and Stable',
      tr: 'Güvenli ve Stabil',
      de: 'Sicher und Stabil',
    },
    secureAndStableDesc: {
      en: 'Secure operation with SSL encryption and 99.9% uptime guarantee',
      tr: 'SSL şifreleme ve 99.9% uptime garantisi ile güvenli operasyon',
      de: 'Sicherer Betrieb mit SSL-Verschlüsselung und 99,9% Uptime-Garantie',
    },

    tryFree14Days: {
      en: 'panels try free for 14 days',
      tr: 'panellerini 14 gün ücretsiz deneyin',
      de: 'Panels 14 Tage kostenlos testen',
    },
    viewMenu: {
      en: 'View Menu',
      tr: 'Menüyü İncele',
      de: 'Menü ansehen',
    },
    callNow: {
      en: 'Call Now',
      tr: 'Hemen Arayın',
      de: 'Jetzt anrufen',
    },



    // Demo Panels
    demoWaiterDesc: {
      en: 'Manage tables and orders',
      tr: 'Masaları ve siparişleri yönetin',
      de: 'Tische und Bestellungen verwalten',
    },
    demoKitchenDesc: {
      en: 'Track and prepare orders',
      tr: 'Siparişleri takip edin ve hazırlayın',
      de: 'Bestellungen verfolgen und zubereiten',
    },
    demoCashierDesc: {
      en: 'Manage payments and reports',
      tr: 'Ödemeleri ve raporları yönetin',
      de: 'Zahlungen und Berichte verwalten',
    },
    openPanel: {
      en: 'Open Panel',
      tr: 'Paneli Aç',
      de: 'Panel öffnen',
    },

    // Demo Waiter Panel
    waiterPanelTitle: {
      en: 'RestXQr Waiter',
      tr: 'RestXQr Garson',
      de: 'RestXQr Kellner',
    },
    waiterPanelSubtitle: {
      en: 'RestXQr Restaurant • Live Status',
      tr: 'RestXQr Restoranı • Canlı Durum',
      de: 'RestXQr Restaurant • Live-Status',
    },
    refresh: {
      en: 'REFRESH',
      tr: 'YENİLE',
      de: 'AKTUALISIEREN',
    },
    logout: {
      en: 'Logout',
      tr: 'Çıkış',
      de: 'Abmelden',
    },
    active: {
      en: 'Active',
      tr: 'Aktif',
      de: 'Aktiv',
    },
    preparing: {
      en: 'Preparing',
      tr: 'Hazırlanıyor',
      de: 'Wird zubereitet',
    },
    ready: {
      en: 'Ready',
      tr: 'Hazır',
      de: 'Bereit',
    },
    completed: {
      en: 'Completed',
      tr: 'Tamamlandı',
      de: 'Abgeschlossen',
    },
    cancelled: {
      en: 'Cancelled',
      tr: 'İptal',
      de: 'Storniert',
    },
    loadingOrders: {
      en: 'Loading orders...',
      tr: 'Siparişler yükleniyor...',
      de: 'Bestellungen werden geladen...',
    },
    noOrdersYet: {
      en: 'No Orders Yet',
      tr: 'Henüz Sipariş Yok',
      de: 'Noch keine Bestellungen',
    },
    newOrdersWillAppearHere: {
      en: 'New orders will appear here',
      tr: 'Yeni siparişler burada görünecek',
      de: 'Neue Bestellungen erscheinen hier',
    },
    time: {
      en: 'Time',
      tr: 'Saat',
      de: 'Zeit',
    },
    items: {
      en: 'items',
      tr: 'ürün',
      de: 'Artikel',
    },
    moreItems: {
      en: 'more items',
      tr: 'ürün daha',
      de: 'weitere Artikel',
    },
    serve: {
      en: 'Serve',
      tr: 'Servis Et',
      de: 'Servieren',
    },
    changeTable: {
      en: 'Change Table',
      tr: 'Masa Değiştir',
      de: 'Tisch wechseln',
    },
    details: {
      en: 'Details',
      tr: 'Detay',
      de: 'Details',
    },
    enterNewTableNumber: {
      en: 'Enter new table number for Table',
      tr: 'Masa için yeni masa numarası girin:',
      de: 'Geben Sie die neue Tischnummer ein für Tisch',
    },
    newTableNumber: {
      en: 'New Table Number',
      tr: 'Yeni Masa Numarası',
      de: 'Neue Tischnummer',
    },
    tableNumberPlaceholder: {
      en: 'Table number...',
      tr: 'Masa numarası...',
      de: 'Tischnummer...',
    },
    quickSelect: {
      en: 'Quick Select',
      tr: 'Hızlı Seçim',
      de: 'Schnellauswahl',
    },
    cancel: {
      en: 'Cancel',
      tr: 'İptal',
      de: 'Abbrechen',
    },
    change: {
      en: 'Change',
      tr: 'Değiştir',
      de: 'Ändern',
    },
    invalidTableNumber: {
      en: 'Please enter a valid table number between 1-100!',
      tr: 'Lütfen 1-100 arasında geçerli bir masa numarası girin!',
      de: 'Bitte geben Sie eine gültige Tischnummer zwischen 1-100 ein!',
    },
    orderDetails: {
      en: 'Order Details',
      tr: 'Sipariş Detayları',
      de: 'Bestelldetails',
    },
    orderInfo: {
      en: 'Order Info',
      tr: 'Sipariş Bilgileri',
      de: 'Bestellinfo',
    },
    orderId: {
      en: 'Order ID',
      tr: 'Sipariş ID',
      de: 'Bestell-ID',
    },
    status: {
      en: 'Status',
      tr: 'Durum',
      de: 'Status',
    },
    orderItems: {
      en: 'Order Items',
      tr: 'Sipariş Ürünleri',
      de: 'Bestellte Artikel',
    },
    orderNote: {
      en: 'Order Note',
      tr: 'Sipariş Notu',
      de: 'Bestellnotiz',
    },
    orderStatus: {
      en: 'Order Status',
      tr: 'Sipariş Durumu',
      de: 'Bestellstatus',
    },
    served: {
      en: 'Served',
      tr: 'Servis Edildi',
      de: 'Serviert',
    },
    confirmCancelOrder: {
      en: 'Are you sure you want to cancel this order?',
      tr: 'Bu siparişi iptal etmek istediğinizden emin misiniz?',
      de: 'Sind Sie sicher, dass Sie diese Bestellung stornieren möchten?',
    },
    cancelOrder: {
      en: 'Cancel Order',
      tr: 'İptal Et',
      de: 'Bestellung stornieren',
    },

    // Demo Kitchen Panel
    kitchenPanelTitle: {
      en: 'Kitchen Panel',
      tr: 'Mutfak Paneli',
      de: 'Küchenpanel',
    },
    kitchenPanelSubtitle: {
      en: 'Manage room service orders and menu items',
      tr: 'Oda servisi siparişlerini ve menü ürünlerini yönetin',
      de: 'Zimmerservice-Bestellungen und Menüpunkte verwalten',
    },
    searchPlaceholder: {
      en: 'Search table number or item...',
      tr: 'Masa numarası veya ürün ara...',
      de: 'Tischnummer oder Artikel suchen...',
    },
    pending: {
      en: 'Pending',
      tr: 'Bekliyor',
      de: 'Ausstehend',
    },
    unknown: {
      en: 'Unknown',
      tr: 'Bilinmeyen',
      de: 'Unbekannt',
    },
    loadingMenu: {
      en: 'Loading menu...',
      tr: 'Menü yükleniyor...',
      de: 'Menü wird geladen...',
    },
    noItemsYet: {
      en: 'No items yet',
      tr: 'Henüz ürün yok',
      de: 'Noch keine Artikel',
    },
    addItemsToMenu: {
      en: 'Add items to the menu.',
      tr: 'Menüye ürün ekleyin.',
      de: 'Fügen Sie Artikel zum Menü hinzu.',
    },
    available: {
      en: 'Available',
      tr: 'Mevcut',
      de: 'Verfügbar',
    },
    outOfStock: {
      en: 'Out of Stock',
      tr: 'Bitti',
      de: 'Ausverkauft',
    },
    markOutOfStock: {
      en: 'Mark Out of Stock',
      tr: 'Bitti',
      de: 'Als ausverkauft markieren',
    },
    markAvailable: {
      en: 'Mark Available',
      tr: 'Mevcut',
      de: 'Als verfügbar markieren',
    },
    estimatedTime: {
      en: 'Estimated Time',
      tr: 'Tahmini Süre',
      de: 'Geschätzte Zeit',
    },
    minutes: {
      en: 'min',
      tr: 'dk',
      de: 'Min',
    },
    specialNote: {
      en: 'Special Note',
      tr: 'Özel Not',
      de: 'Besonderer Hinweis',
    },
    startPreparing: {
      en: 'Start Preparing',
      tr: 'Hazırlığa Başla',
      de: 'Zubereitung starten',
    },
    tableNumber: {
      en: 'Table Number',
      tr: 'Masa Numarası',
      de: 'Tischnummer',
    },
    totalAmount: {
      en: 'Total Amount',
      tr: 'Toplam Tutar',
      de: 'Gesamtbetrag',
    },
    orderTime: {
      en: 'Order Time',
      tr: 'Sipariş Zamanı',
      de: 'Bestellzeit',
    },
    unitPrice: {
      en: 'Unit Price',
      tr: 'Birim',
      de: 'Einzelpreis',
    },
    totalItemCount: {
      en: 'Total Item Count',
      tr: 'Toplam Ürün Sayısı',
      de: 'Gesamtanzahl Artikel',
    },
    pieces: {
      en: 'Pcs',
      tr: 'Adet',
      de: 'Stk',
    },
    close: {
      en: 'Close',
      tr: 'Kapat',
      de: 'Schließen',
    },

    // Demo Cashier Panel
    cashierPanelTitle: {
      en: 'Cashier Panel',
      tr: 'Kasa Paneli',
      de: 'Kassenpanel',
    },
    cashierPanelSubtitle: {
      en: 'RestXQr Restaurant',
      tr: 'RestXQr Restoranı',
      de: 'RestXQr Restaurant',
    },
    totalRevenue: {
      en: 'Total Revenue',
      tr: 'Toplam Gelir',
      de: 'Gesamteinnahmen',
    },
    pendingPayment: {
      en: 'Pending Payment',
      tr: 'Bekleyen Ödeme',
      de: 'Ausstehende Zahlung',
    },
    noPendingPayments: {
      en: 'No Pending Payments',
      tr: 'Ödeme Bekleyen Sipariş Yok',
      de: 'Keine ausstehenden Zahlungen',
    },
    waitingForPayment: {
      en: 'WAITING FOR PAYMENT',
      tr: 'ÖDEME BEKLİYOR',
      de: 'WARTET AUF ZAHLUNG',
    },
    paid: {
      en: 'PAID',
      tr: 'ÖDENDİ',
      de: 'BEZAHLT',
    },
    takePayment: {
      en: 'Take Payment',
      tr: 'Ödeme Al',
      de: 'Zahlung annehmen',
    },
    printReceipt: {
      en: 'Print Receipt',
      tr: 'Fiş Yazdır',
      de: 'Beleg drucken',
    },
    viewReceipt: {
      en: 'View Receipt',
      tr: 'Fiş Görüntüle',
      de: 'Beleg anzeigen',
    },
    confirmPayment: {
      en: 'Confirm Payment',
      tr: 'Ödeme Onayı',
      de: 'Zahlung bestätigen',
    },
    confirmPaymentAction: {
      en: 'Confirm Payment',
      tr: 'Ödemeyi Onayla',
      de: 'Zahlung bestätigen',
    },
    paymentSuccess: {
      en: 'Payment received successfully!',
      tr: 'Ödeme alındı!',
      de: 'Zahlung erfolgreich erhalten!',
    },
    paymentFailed: {
      en: 'Payment failed!',
      tr: 'Ödeme işlemi başarısız!',
      de: 'Zahlung fehlgeschlagen!',
    },

    // Kroren Case Study & New Features
    customersSuccessTitle: {
      en: 'Real Success, Real Growth',
      tr: 'Gerçek Başarı, Gerçek Büyüme',
      de: 'Echter Erfolg, Echtes Wachstum',
    },
    customersSuccessDesc: {
      en: 'Experience the digital transformation that has empowered hundreds of restaurants to reach their full potential.',
      tr: 'Yüzlerce restoranın tam potansiyeline ulaşmasını sağlayan dijital dönüşümü keşfedin.',
      de: 'Entdecken Sie die digitale Transformation, die hunderte Restaurants gestärkt hat.',
    },
    satisfiedClientsLabel: {
      en: 'Happy Customers',
      tr: 'Mutlu Müşteriler',
      de: 'Zufriedene Kunden',
    },
    averageGrowthLabel: {
      en: 'Average Growth',
      tr: 'Ortalama Büyüme',
      de: 'Durchschnittliches Wachstum',
    },
    kitchenStatTitle: {
      en: 'Specialized Kitchen Stations',
      tr: 'Özelleştirilmiş Mutfak İstasyonları',
      de: 'Spezialisierte Küchenstationen',
    },
    kitchenStatDesc: {
      en: 'Grilled, Pasta, Cold, and Dessert stations - each with its own smart screen.',
      tr: 'Izgara, Makarna, Soğuk ve Tatlı istasyonları - her biri için akıllı ekran.',
      de: 'Grill-, Pasta-, Kalt- und Dessertstationen - jede mit eigenem smarten Bildschirm.',
    },
    splitPaymentTitle: {
      en: 'Hybrid (Split) Payments',
      tr: 'Hibrit (Parçalı) Ödeme',
      de: 'Hybrid-Zahlungen (Split)',
    },
    splitPaymentDesc: {
      en: 'Cash + Card or multiple cards. Flexible payment for group tables.',
      tr: 'Nakit + Kart veya çoklu kart. Grup masaları için esnek ödeme.',
      de: 'Bar + Karte oder mehrere Karten. Flexibel für Gruppen.',
    },
    caseStudyResult1: {
      en: '40% Faster Service',
      tr: '%40 Daha Hızlı Servis',
      de: '40% Schnellerer Service',
    },
    caseStudyResult2: {
      en: '0 Communication Errors',
      tr: '0 İletişim Hatası',
      de: '0 Kommunikationsfehler',
    },
    caseStudyResult3: {
      en: '30% More Revenue',
      tr: '%30 Daha Fazla Kazanç',
      de: '30% Mehr Umsatz',
    },
    featureKitchen: {
      en: 'Kitchen Operations',
      tr: 'Mutfak Operasyonu',
      de: 'Küchenbetrieb',
    },
    featurePayment: {
      en: 'Payment Systems',
      tr: 'Ödeme Sistemleri',
      de: 'Zahlungssysteme',
    },
    featureBranch: {
      en: 'Branch Management',
      tr: 'Şube Yönetimi',
      de: 'Filialmanagement',
    },
    featureAI: {
      en: 'AI Optimization',
      tr: 'AI Optimizasyonu',
      de: 'KI-Optimierung',
    },
    premiumServicesBadge: {
      en: 'PREMIUM FEATURES',
      tr: 'PREMİUM ÖZELLİKLER',
      de: 'PREMIUM FUNKTIONEN',
    },

    // New Sales Features
    mgmtTitle: {
      en: 'Menu, Stock & Campaign Management',
      tr: 'Menü – Stok – Kampanya – Duyuru Yönetimi',
      de: 'Menü-, Lager- & Kampagnenmanagement',
    },
    mgmtControlTitle: {
      en: 'Everything Is Under Your Control',
      tr: 'Her şey sizin kontrolünüzde',
      de: 'Alles unter Ihrer Kontrolle',
    },
    mgmtMenuUpdate: {
      en: 'Update menu items instantly',
      tr: 'Menü ürünlerini istediğiniz an güncelleyin',
      de: 'Menüpunkte sofort aktualisieren',
    },
    mgmtStockHide: {
      en: 'Hide out-of-stock items immediately',
      tr: 'Stokta olmayan ürünü anında gizleyin',
      de: 'Ausverkaufte Artikel sofort ausblenden',
    },
    mgmtCampaignDrive: {
      en: 'Drive sales with campaigns and featured items',
      tr: 'Kampanyalar ve öne çıkan ürünlerle satışları yönlendirin',
      de: 'Umsatz steigern mit Kampagnen und Highlights',
    },
    mgmtAnnounceDirect: {
      en: 'Reach customers directly with announcements',
      tr: 'Duyurularla müşteriye doğrudan ulaşın',
      de: 'Kunden direkt mit Ankündigungen erreichen',
    },
    mgmtNoTechRequired: {
      en: 'No technical support or expert required.',
      tr: 'Uzman veya teknik destek gerektirmez.',
      de: 'Kein technischer Support oder Experte erforderlich.',
    },
    waiterCallMainTitle: {
      en: 'WAITER CALL = SATISFACTION + STAFF SAVING',
      tr: 'GARSON ÇAĞIRMA = MEMNUNİYET + PERSONEL TASARRUFU',
      de: 'KELLNER-RUF = ZUFRIEDENHEIT + PERSONAL-ERSPARNIS',
    },
    waiterCallTitle: {
      en: 'Waiter Call – Only When Needed',
      tr: 'Garson çağırma – sadece ihtiyaç olduğunda',
      de: 'Kellner-Ruf – Nur bei Bedarf',
    },
    waiterCallDesc: {
      en: 'Customers call with one touch. Reduces unnecessary movement, staff works more controlled, customers never feel ignored.',
      tr: 'Müşteriler QR üzerinden tek dokunuşla garson çağırabilir. Gereksiz dolaşma azalır, personel daha kontrollü çalışır, müşteri kendini bekletilmiş hissetmez.',
      de: 'Kunden rufen per Fingertipp. Weniger unnötige Wege, kontrollierteres Arbeiten, keine Wartefühlen.',
    },
    waiterCallFooter: {
      en: 'Less staff, more organized service, happier customers.',
      tr: 'Daha az personel, daha organize hizmet, daha mutlu müşteri.',
      de: 'Weniger Personal, besserer Service, glücklichere Kunden.',
    },
    zeroErrorSectionTitle: {
      en: 'HOW DO WE ELIMINATE WRONG ORDERS?',
      tr: 'YANLIŞ SİPARİŞLERİ NASIL ORTADAN KALDIRIYORUZ?',
      de: 'WIE VERMEIDEN WIR FALSCHE BESTELLUNGEN?',
    },
    qrToKitchenTitle: {
      en: 'Order from QR → Directly to Kitchen Station',
      tr: 'QR’dan sipariş → Doğrudan mutfak istasyonuna',
      de: 'Bestellung via QR → Direkt zur Küchenstation',
    },
    qrToKitchenDesc: {
      en: 'Orders go directly to the relevant station without intermediaries. Reduces errors, returns, and increases speed.',
      tr: 'Müşteri siparişi QR üzerinden verir, sipariş aracı olmadan doğrudan mutfakta ilgili istasyona düşer. Yanlış siparişler azalır, iadeler düşer, servis hızlanır.',
      de: 'Bestellungen gehen ohne Umwege direkt an die Station. Weniger Fehler, weniger Retouren, schnellerer Service.',
    },
    adIncomeTitle: {
      en: 'EXTRA INCOME & ADVERTISING OPPORTUNITY',
      tr: 'EKSTRA GELİR & REKLAM FIRSATI',
      de: 'EXTRA EINNAHMEN & WERBEMÖGLICHKEITEN',
    },
    adIncomeSubtitle: {
      en: 'Your QR menu is also an income area',
      tr: 'QR menünüz aynı zamanda bir gelir alanı',
      de: 'Ihr QR-Menü ist auch eine Einnahmequelle',
    },
    adIncomeDesc: {
      en: 'Earn extra income with internal or external ad spaces, promote your partners or brands.',
      tr: 'İşletme içi veya dışı reklam alanlarıyla ek gelir elde edebilir, iş ortaklarınızın veya markaların tanıtımını yapabilirsiniz.',
      de: 'Verdenen Sie dazu mit Werbeflächen, bewerben Sie Partner oder Marken.',
    },
    noChangeTitle: {
      en: 'WITHOUT CHANGING YOUR SYSTEMS',
      tr: 'SİSTEMLERİNİZİ DEĞİŞTİRMEDEN',
      de: 'OHNE IHRE SYSTEME ZU ÄNDERN',
    },
    noChangeSubtitle: {
      en: 'Does not disrupt your current routine',
      tr: 'Mevcut düzeninizi bozmaz',
      de: 'Stört Ihren aktuellen Ablauf nicht',
    },
    noChangeDesc: {
      en: 'Your kitchen or workflow stays the same. RestXQR integrates on top, digitizing and professionalizing your process.',
      tr: 'Mevcut işleyişiniz, mutfağınız veya sistemleriniz değişmez. RestXQR, işletmenizin üzerine eklenir ve süreci dijitalleştirerek daha hızlı ve profesyonel hale getirir.',
      de: 'Ihr Workflow bleibt gleich. RestXQR digitalisiert und professionalisiert Ihren bestehenden Prozess.',
    },
    noChangeFooter: {
      en: 'No change, no chaos — just a smarter business.',
      tr: 'Değişiklik yok, karmaşa yok — sadece daha akıllı bir işletme.',
      de: 'Keine Änderung, kein Chaos – einfach ein smarterer Betrieb.',
    },
    adTag1: { en: 'Banner Ads', tr: 'Banner Reklamlar', de: 'Banner-Anzeigen' },
    adTag2: { en: 'Digital Brochures', tr: 'Dijital Broşürler', de: 'Digitale Broschüren' },
    adTag3: { en: 'Partner Promo', tr: 'İş Ortağı Tanıtımı', de: 'Partner-Promotion' },
    adTag4: { en: 'Video Ads', tr: 'Video Reklamlar', de: 'Video-Anzeigen' },
    passiveIncomeLabel: { en: 'Passive Income', tr: 'Pasif Gelir', de: 'Passives Einkommen' },
    premiumSpaceLabel: { en: 'Premium Space', tr: 'Premium Alan', de: 'Premium-Platz' },

    // Core Value Propositions
    valPropSatisfy: { en: 'Customer Satisfaction', tr: 'Müşteri Memnuniyeti', de: 'Kundenzufriedenheit' },
    valPropProfit: { en: 'Increased Profit', tr: 'Kâr Artışı', de: 'Gewinnsteigerung' },
    valPropStaff: { en: 'Staff Optimization', tr: 'Personel Tasarrufu', de: 'Personaloptimierung' },
    valPropSpeed: { en: 'Lightning Fast', tr: 'Işık Hızında Servis', de: 'Blitzschneller Service' },
    valPropDigital: { en: '100% Digital', tr: '%100 Dijitalleşme', de: '100% Digitalisierung' },
    valPropTrust: { en: 'Reliable System', tr: 'Güvenilir Altyapı', de: 'Zuverlässiges System' },
    zeroErrorList1: {
      en: 'Order via QR',
      tr: 'QR’dan Sipariş',
      de: 'Bestellung via QR',
    },
    zeroErrorList2: {
      en: 'Smart Routing',
      tr: 'Akıllı Yönlendirme',
      de: 'Intelligente Weiterleitung',
    },
    zeroErrorList3: {
      en: 'Kitchen Display',
      tr: 'Mutfak Ekranı',
      de: 'Küchen-Display',
    },
    zeroErrorList4: {
      en: 'Fast Delivery',
      tr: 'Hızlı Servis',
      de: 'Schnelle Lieferung',
    },
    learnMore: {
      en: 'LEARN MORE',
      tr: 'DETAYLI BİLGİ',
      de: 'MEHR ERFAHREN',
    },
    // Pricing Section
    pricingTitle: { en: 'Strategic Investment Packages', tr: 'Stratejik Yatırım Paketleri', de: 'Strategische Investment-Pakete' },
    pricingBadge: { en: 'PLANS', tr: 'PAKETLER', de: 'PLÄNE' },
    priceMonthly: { en: 'TL/Period', tr: 'TL/Dönem', de: 'TL/Zeitraum' },
    annualGift: { en: '+1 Month Free on 1-Year Plans', tr: '1 Yıllık Alımlarda +1 Ay Bedava', de: '+1 Monat gratis bei Jahresabo' },

    planBasicTitle: { en: 'RestXQR Basic', tr: 'RestXQR Basic', de: 'RestXQR Basic' },
    planBasicPrice: { en: '8.000', tr: '8.000', de: '8.000' },
    planBasicDesc: { en: 'Essential foundation for digital growth.', tr: 'Dijital büyüme için temel altyapı.', de: 'Basis für digitales Wachstum.' },
    planBasicFeat1: { en: 'Full expert setup service', tr: 'Uzman kurulum hizmeti', de: 'Experten-Einrichtung' },
    planBasicFeat2: { en: 'Smart QR Menu & Routing', tr: 'Akıllı QR Menü ve Yönlendirme', de: 'Smartes QR-Menü' },
    planBasicFeat3: { en: 'Advanced features as add-ons', tr: 'İleri özellikler ücretli eklenebilir', de: 'Zusatzfunktionen zubuchbar' },

    planProTitle: { en: 'RestXQR Premium', tr: 'RestXQR Premium', de: 'RestXQR Premium' },
    planProPrice: { en: '13.000', tr: '13.000', de: '13.000' },
    planProDesc: { en: 'The full operating system for your business.', tr: 'İşletmeniz için tam kapsamlı işletim sistemi.', de: 'Das Betriebssystem für Ihr Business.' },
    planProFeat1: { en: 'POS & Printer Integration', tr: 'POS ve Yazıcı Entegrasyonu', de: 'POS & Drucker Integration' },
    planProFeat2: { en: 'Performance & Inventory Tracking', tr: 'Personel Performans ve Stok Takibi', de: 'Personal & Inventar Pro' },
    planProFeat3: { en: 'Unlimited custom requests', tr: 'Sınırsız geliştirme ve destek', de: 'Unbegrenzter Support' },

    planEntTitle: { en: 'RestXQR Kurumsal', tr: 'RestXQR Kurumsal', de: 'RestXQR Enterprise' },
    planEntPrice: { en: 'Custom', tr: 'Özel', de: 'Individuell' },
    planEntDesc: { en: 'The ultimate bespoke software solution.', tr: 'İşletmenize özel butik yazılım mimarisi.', de: 'Die maßgeschneiderte Lösung.' },
    planEntFeat1: { en: 'Full Digital Architecture', tr: 'Tam Kapsamlı Dijital Mimari', de: 'Komplette Digitale Architektur' },
    planEntFeat2: { en: 'Custom AI Integrations', tr: 'Size Özel AI Entegrasyonları', de: 'Individuelle KI-Anbindung' },
    planEntFeat3: { en: 'Global Performance Scaling', tr: 'Global Performans ve Ölçeklendirme', de: 'Globale Skalierung' },

    branchDiscountNote: {
      en: '5% discount applied per branch for multi-location businesses.',
      tr: 'Şubeli işletmelerde şube başına %5 indirim uygulanır.',
      de: '5% Rabatt pro Filiale für Unternehmen mit mehreren Standorten.',
    },

    roiTitle: { en: 'ROI (Return on Investment) Estimate', tr: 'Yatırım Geri Dönüş (ROI) Tahmini', de: 'ROI-Schätzung' },
    roiGrowth: { en: '~15-20%', tr: '%15-20+', de: '~15-20%' },
    roiGrowthSub: { en: 'Revenue Increase', tr: 'Ciro Artışı', de: 'Umsatzsteigerung' },
    roiEfficiency: { en: 'Zero Error', tr: 'Sıfır Hata', de: 'Null Fehler' },
    roiEfficiencySub: { en: 'Operational Accuracy', tr: 'Operasyonel Doğruluk', de: 'Operative Genauigkeit' },
    roiNote: {
      en: 'Based on average client results: Average monthly profit increases by ~22% through operational efficiency.',
      tr: 'Müşteri ortalamalarına göre: Operasyonel verimlilik sayesinde aylık kâr ortalama %22 artış gösterir.',
      de: 'Basierend auf Kundenergebnissen: Der monatliche Gewinn steigt durch Effizienz um ca. 22%.',
    },

    refundNote: {
      en: '15 days free trial. 1 month refund guarantee (Setup fee excluded).',
      tr: '15 gün ücretsiz kullanım. 1 ay sonunda iade garantisi (Kurulum ücreti hariç).',
      de: '15 Tage Testversion. Rückerstattung nach 1 Monat möglich (exkl. Einrichtung).'
    },
    devTeamPromise: {
      en: 'Like having an in-house developer team; lighting fast responses and tailored software feel.',
      tr: 'Bünyenizde bir yazılım ekibi varmış gibi; ışık hızında geri dönüşler ve işletmenize özel yazılım deneyimi.',
      de: 'Wie ein internes Entwickler-Team; blitzschnelle Hilfe und maßgeschneiderte Software.'
    },
    instantSetupTitle: {
      en: 'Fast & Seamless Setup: Ready When You Are',
      tr: 'Hızlı ve Sorunsuz Kurulum: Siz Hazırsanız Biz Hazırız',
      de: 'Schnelles & nahtloses Setup: Bereit, wenn Sie es sind',
    },
    instantSetupDesc: {
      en: 'Forget heavy, complicated software. RestXQr works via a simple link. Reach out to us; we handle the entire setup, menu digitizing, and optimization process, so you can focus on what matters most.',
      tr: 'Hantal ve yavaş kurulan eski sistemleri unutun. RestXQr sadece bir linkle çalışır. Tek yapmanız gereken bize ulaşmak; tüm kurulum ve menü dijitalleştirme sürecini biz titizlikle hallediyoruz.',
      de: 'Vergessen Sie schwere, komplizierte Software. RestXQr funktioniert über einen einfachen Link. Kontaktieren Sie uns; wir erledigen das gesamte Setup und die Menü-Digitalisierung.',
    }
  },

  t: (key) => {
    const currentLanguage = get().language;
    const translation = get().translations[key];

    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    return translation[currentLanguage] || key;
  },

  tAI: async (text, context) => {
    const currentLanguage = get().language;

    // Eğer zaten hedef dilde ise çeviri yapma
    if (currentLanguage === 'en' && /^[a-zA-Z\s.,!?]+$/.test(text)) {
      return text;
    }
    if (currentLanguage === 'tr' && /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s.,!?]+$/.test(text)) {
      return text;
    }
    if (currentLanguage === 'de' && /^[a-zA-ZäöüßÄÖÜ\s.,!?]+$/.test(text)) {
      return text;
    }

    set({ isTranslating: true });

    try {
      const translatedText = await aiTranslationService.translate(text, {
        targetLanguage: currentLanguage,
        context,
        useCache: true
      });

      set({ isTranslating: false });
      return translatedText;
    } catch (error) {
      console.error('AI Translation error:', error);
      set({ isTranslating: false });
      return text; // Hata durumunda orijinal metni döndür
    }
  },
}));

export default useLanguageStore;
