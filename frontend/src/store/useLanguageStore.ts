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
  language: 'tr', // Default language changed to Turkish as per requirement
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
      en: 'Increase your sales by 300% with Turkey\'s most advanced QR menu and order management system!',
      tr: 'Türkiye\'nin en gelişmiş QR menü ve sipariş yönetim sistemi ile satışlarınızı %300 artırın!',
      de: 'Steigern Sie Ihren Umsatz um 300% mit dem fortschrittlichsten QR-Bestellsystem Österreichs!',
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
      tr: 'Demo İncele',
      de: 'Demo testen',
    },
    statSales: {
      en: 'Sales Increase',
      tr: 'Satış Artışı',
      de: 'Umsatzsteigerung',
    },
    statAI: {
      en: 'Photo Optimization',
      tr: 'Fotoğraf Optimizasyonu',
      de: 'Foto-Optimierung',
    },
    statSupport: {
      en: 'Support',
      tr: 'Destek',
      de: 'Support',
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
      en: 'Professionalize your product photos with Artificial Intelligence! No need to spend thousands on photographers! Increase your sales by 300% and fascinate your customers.',
      tr: 'Yapay Zeka ile ürün fotoğraflarınızı profesyonelleştirin! Fotoğrafçılara binlerce lira harcamanıza gerek yok! Satışlarınızı %300 artırın ve müşterilerinizi büyüleyin.',
      de: 'Verwandeln Sie Ihre Produktfotos mit Künstlicher Intelligenz in Meisterwerke! Sparen Sie sich teure Fotoshootings. Begeistern Sie Ihre Gäste und steigern Sie den Umsatz um 300%.',
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
      en: 'No need to spend thousands on photographers! Professional results with AI.',
      tr: 'Fotoğrafçılara binlerce lira harcamanıza gerek yok! AI ile profesyonel sonuçlar.',
      de: 'Sparen Sie tausende Euro für Fotografen! Professionelle Ergebnisse dank KI.',
    },
    salesIncrease: {
      en: 'Sales Increase',
      tr: 'Satış Artışı',
      de: 'Mehr Umsatz',
    },
    salesIncreaseDesc: {
      en: 'Increase customer interest with professional visuals and grow your sales by 300%.',
      tr: 'Profesyonel görseller ile müşteri ilgisini artırın ve satışlarınızı %300 büyütün.',
      de: 'Wecken Sie den Appetit Ihrer Gäste mit professionellen Bildern und steigern Sie Ihren Umsatz um 300%.',
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
      en: 'No need to spend thousands on photographers with AI visual optimization! Professionalize your product photos and increase your sales.',
      tr: 'AI görsel optimizasyonu ile fotoğrafçılara binlerce lira harcamanıza gerek yok! Ürün fotoğraflarınızı profesyonelleştirin ve satışlarınızı artırın.',
      de: 'Dank KI-Bildoptimierung nie wieder teure Fotografen bezahlen! Werten Sie Ihre Speisekarte auf und steigern Sie Ihren Umsatz.',
    },
    reviewAI: {
      en: 'Review AI Optimization',
      tr: 'AI Optimizasyonunu İncele',
      de: 'KI-Optimierung testen',
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
      en: 'Why restXQr?',
      tr: 'Neden restXQr?',
      de: 'Warum RestXQr?',
    },
    whyRestXQrDesc: {
      en: 'Grow your business with Turkey\'s most advanced restaurant management system',
      tr: 'Türkiye\'nin en gelişmiş restoran yönetim sistemi ile işinizi büyütün',
      de: 'Wachsen Sie mit dem fortschrittlichsten Gastronomie-System.',
    },
    timeSaving: {
      en: '50% Time Saving',
      tr: '%50 Zaman Tasarrufu',
      de: '50% Zeitersparnis',
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
      en: 'restXqr is a restaurant operating system that manages the entire operation from menu to order, staff to accounting on a single platform. It professionalizes your visuals with AI, optimizes the menu, increases sales; integrates seamlessly with your POS and accounting systems.',
      tr: 'restXqr, menüden siparişe, personelden muhasebeye kadar tüm operasyonu tek platformda yöneten restoran işletim sistemidir. AI ile görsellerinizi profesyonelleştirir, menüyü optimize eder ve satışları artırır; POS ve muhasebe sistemlerinizle sorunsuz entegre olur.',
      de: 'RestXQr ist das Betriebssystem für Ihre Gastronomie. Es vereint Speisekarte, Bestellsystem, Personalverwaltung und Abrechnung auf einer Plattform. Veredeln Sie Ihre Bilder mit KI und steigern Sie Ihren Umsatz.',
    },
    faq2Q: {
      en: 'How does the setup process work?',
      tr: 'Kurulum süreci nasıl işliyor?',
      de: 'Wie läuft die Einrichtung ab?',
    },
    faq2A: {
      en: 'Setup is completely free for plans of 6 months or more. Our expert technical team comes to your restaurant, sets up the system, and trains all your staff. The setup process takes 1-2 days and you can start using it immediately.',
      tr: '6 ay ve üzeri planlar için kurulum tamamen ücretsizdir. Uzman teknik ekibimiz restoranınıza gelir, sistemi kurar ve tüm personellerinizi eğitir. Kurulum süreci 1-2 gün sürer ve hemen kullanmaya başlayabilirsiniz.',
      de: 'Bei Jahresplänen ist die Einrichtung komplett kostenlos. Unser Team richtet alles für Sie ein und schult Ihr Personal. In 1-2 Tagen sind Sie startklar.',
    },
    faq3Q: {
      en: 'How does the refund guarantee work?',
      tr: 'İade garantisi nasıl çalışır?',
      de: 'Gibt es eine Geld-zurück-Garantie?',
    },
    faq3A: {
      en: 'If you are not satisfied for any reason within 30 days, we refund your fee in full. If setup has been done, only the setup cost is deducted and the remaining amount is refunded. Try it risk-free!',
      tr: '30 gün içinde herhangi bir sebeple memnun kalmazsanız, ücretinizi tam olarak iade ediyoruz. Kurulum yapılmış ise sadece kurulum maliyeti kesilerek kalan tutar iade edilir. Risk almadan deneyin!',
      de: 'Sollten Sie innerhalb von 30 Tagen nicht zufrieden sein, erhalten Sie Ihr Geld zurück. Ohne Wenn und Aber.',
    },
    faq4Q: {
      en: 'Which payment methods do you accept?',
      tr: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
      de: 'Welche Zahlungsarten werden akzeptiert?',
    },
    faq4A: {
      en: 'We accept credit card, debit card, wire transfer/EFT, and all mobile payment options. We offer great discounts for 6-month and annual payments. Installment options are also available.',
      tr: 'Kredi kartı, banka kartı, havale/EFT ve tüm mobil ödeme seçeneklerini kabul ediyoruz. 6 aylık ve yıllık ödemeler için büyük indirimler sunuyoruz. Taksit seçenekleri de mevcuttur.',
      de: 'Wir akzeptieren alle gängigen Kreditkarten, Überweisung und mobile Zahlungen. Attraktive Rabatte bei jährlicher Zahlung.',
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
      en: '+90 (555) 123 45 67',
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
    cashierPanel: {
      en: 'Cashier Panel',
      tr: 'Kasa Paneli',
      de: 'Kassen-Panel',
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
