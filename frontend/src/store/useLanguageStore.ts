import { create } from 'zustand';

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
          de: 'Kellner',
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
          de: 'Gutschein anwenden',
        },
        placeOrder: {
          en: 'Place Order',
          tr: 'Sipariş Ver',
          de: 'Bestellen',
        },
        
        // Waiter page
        callWaiter: {
          en: 'Call Waiter',
          tr: 'Garson Çağır',
          de: 'Kellner rufen',
        },
        quickRequests: {
          en: 'Quick Requests',
          tr: 'Hızlı İstekler',
          de: 'Schnellanfragen',
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
          de: 'Tisch reinigen',
        },
        help: {
          en: 'Help',
          tr: 'Yardım',
          de: 'Hilfe',
        },
        send: {
          en: 'Send',
          tr: 'Gönder',
          de: 'Senden',
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
          de: 'Menge',
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
          de: 'Servierinfo',
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
          de: 'bereit für das',
        },
        heroTitle3: {
          en: 'Digital Age?',
          tr: 'Hazır mı?',
          de: 'digitale Zeitalter?',
        },
        heroSubtitle1: {
          en: 'Increase your sales by 300% with Turkey\'s most advanced QR menu and order management system!',
          tr: 'Türkiye\'nin en gelişmiş QR menü ve sipariş yönetim sistemi ile satışlarınızı %300 artırın!',
          de: 'Steigern Sie Ihren Umsatz um 300% mit dem fortschrittlichsten QR-Menü- und Bestellmanagementsystem der Türkei!',
        },
        heroSubtitle2: {
          en: 'Leave your competitors behind.',
          tr: 'Rakiplerinizi geride bırakın.',
          de: 'Lassen Sie Ihre Konkurrenz hinter sich.',
        },
        viewPanels: {
          en: 'View Panels',
          tr: 'Panelleri Görüntüle',
          de: 'Paneele anzeigen',
        },
        viewDemo: {
          en: 'View Demo',
          tr: 'Demo İncele',
          de: 'Demo ansehen',
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
          de: 'Visuelle Optimierung mit KI',
        },
        aiDesc: {
          en: 'Professionalize your product photos with Artificial Intelligence! No need to spend thousands on photographers! Increase your sales by 300% and fascinate your customers.',
          tr: 'Yapay Zeka ile ürün fotoğraflarınızı profesyonelleştirin! Fotoğrafçılara binlerce lira harcamanıza gerek yok! Satışlarınızı %300 artırın ve müşterilerinizi büyüleyin.',
          de: 'Professionalisieren Sie Ihre Produktfotos mit Künstlicher Intelligenz! Keine Notwendigkeit, Tausende für Fotografen auszugeben! Steigern Sie Ihren Umsatz um 300% und faszinieren Sie Ihre Kunden.',
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
          de: 'Amateur-Look',
        },
        proLook: {
          en: 'Professional Look',
          tr: 'Profesyonel Görünüm',
          de: 'Professioneller Look',
        },
        costSavings: {
          en: 'Cost Savings',
          tr: 'Maliyet Tasarrufu',
          de: 'Kosteneinsparungen',
        },
        costSavingsDesc: {
          en: 'No need to spend thousands on photographers! Professional results with AI.',
          tr: 'Fotoğrafçılara binlerce lira harcamanıza gerek yok! AI ile profesyonel sonuçlar.',
          de: 'Keine Notwendigkeit, Tausende für Fotografen auszugeben! Professionelle Ergebnisse mit KI.',
        },
        salesIncrease: {
          en: 'Sales Increase',
          tr: 'Satış Artışı',
          de: 'Umsatzsteigerung',
        },
        salesIncreaseDesc: {
          en: 'Increase customer interest with professional visuals and grow your sales by 300%.',
          tr: 'Profesyonel görseller ile müşteri ilgisini artırın ve satışlarınızı %300 büyütün.',
          de: 'Steigern Sie das Kundeninteresse mit professionellen Visuals und erhöhen Sie Ihren Umsatz um 300%.',
        },
        fastResult: {
          en: 'Fast Result',
          tr: 'Hızlı Sonuç',
          de: 'Schnelles Ergebnis',
        },
        fastResultDesc: {
          en: 'Professionalize all your product photos in seconds. No waiting!',
          tr: 'Saniyeler içinde tüm ürün fotoğraflarınızı profesyonelleştirin. Bekleme yok!',
          de: 'Professionalisieren Sie alle Ihre Produktfotos in Sekunden. Kein Warten!',
        },
        tryNow: {
          en: 'Try Now!',
          tr: 'Hemen Deneyin!',
          de: 'Jetzt ausprobieren!',
        },
        tryNowDesc: {
          en: 'No need to spend thousands on photographers with AI visual optimization! Professionalize your product photos and increase your sales.',
          tr: 'AI görsel optimizasyonu ile fotoğrafçılara binlerce lira harcamanıza gerek yok! Ürün fotoğraflarınızı profesyonelleştirin ve satışlarınızı artırın.',
          de: 'Mit KI-Visueller Optimierung müssen Sie keine Tausende für Fotografen ausgeben! Professionalisieren Sie Ihre Produktfotos und steigern Sie Ihren Umsatz.',
        },
        reviewAI: {
          en: 'Review AI Optimization',
          tr: 'AI Optimizasyonunu İncele',
          de: 'KI-Optimierung überprüfen',
        },

        // Landing Page - Services
        premiumServices: {
          en: 'Premium Services',
          tr: 'Premium Hizmetler',
          de: 'Premium-Dienste',
        },
        ourServices: {
          en: 'Our Services',
          tr: 'Hizmetlerimiz',
          de: 'Unsere Dienstleistungen',
        },
        servicesDesc: {
          en: 'We offer comprehensive digital solutions for your restaurant',
          tr: 'Restoranınız için tam kapsamlı dijital çözümler sunuyoruz',
          de: 'Wir bieten umfassende digitale Lösungen für Ihr Restaurant',
        },
        qrMenuSystem: {
          en: 'QR Menu System',
          tr: 'QR Menü Sistemi',
          de: 'QR-Menü-System',
        },
        qrMenuDesc: {
          en: 'Ensure your customers\' safety with a contactless menu experience. Instant updates and multi-language support.',
          tr: 'Temassız menü deneyimi ile müşterilerinizin güvenliğini sağlayın. Anlık güncellemeler ve çoklu dil desteği.',
          de: 'Sorgen Sie für die Sicherheit Ihrer Kunden mit einem kontaktlosen Menüerlebnis. Sofortige Updates und mehrsprachige Unterstützung.',
        },
        orderManagement: {
          en: 'Order Management',
          tr: 'Sipariş Yönetimi',
          de: 'Bestellmanagement',
        },
        orderManagementDesc: {
          en: 'Perfect kitchen and service coordination with advanced order tracking system.',
          tr: 'Gelişmiş sipariş takip sistemi ile mutfak ve servis koordinasyonunu mükemmelleştirin.',
          de: 'Perfektionieren Sie die Koordination von Küche und Service mit einem fortschrittlichen Bestellverfolgungssystem.',
        },
        detailedReporting: {
          en: 'Detailed Reporting',
          tr: 'Detaylı Raporlama',
          de: 'Detaillierte Berichterstattung',
        },
        detailedReportingDesc: {
          en: 'Grow your business with sales analysis, customer behavior, and performance metrics.',
          tr: 'Satış analizi, müşteri davranışları ve performans metrikleri ile işinizi büyütün.',
          de: 'Erweitern Sie Ihr Geschäft mit Verkaufsanalysen, Kundenverhalten und Leistungskennzahlen.',
        },
        multiPlatform: {
          en: 'Multi-Platform',
          tr: 'Çoklu Platform',
          de: 'Multi-Plattform',
        },
        multiPlatformDesc: {
          en: 'We offer excellent experience on desktop, tablet, and mobile devices.',
          tr: 'Masaüstü, tablet ve mobil cihazlarda mükemmel deneyim sunuyoruz.',
          de: 'Wir bieten ein hervorragendes Erlebnis auf Desktop-, Tablet- und Mobilgeräten.',
        },
        support247: {
          en: '24/7 Support',
          tr: '7/24 Destek',
          de: '24/7 Support',
        },
        support247Desc: {
          en: 'Our expert team is always with you. WhatsApp, phone, and online support.',
          tr: 'Uzman ekibimiz her zaman yanınızda. WhatsApp, telefon ve online destek.',
          de: 'Unser Expertenteam ist immer für Sie da. WhatsApp, Telefon und Online-Support.',
        },

        // Landing Page - Benefits
        benefits: {
          en: 'Benefits',
          tr: 'Avantajlar',
          de: 'Vorteile',
        },
        whyRestXQr: {
          en: 'Why restXQr?',
          tr: 'Neden restXQr?',
          de: 'Warum restXQr?',
        },
        whyRestXQrDesc: {
          en: 'Grow your business with Turkey\'s most advanced restaurant management system',
          tr: 'Türkiye\'nin en gelişmiş restoran yönetim sistemi ile işinizi büyütün',
          de: 'Erweitern Sie Ihr Geschäft mit dem fortschrittlichsten Restaurantmanagementsystem der Türkei',
        },
        timeSaving: {
          en: '50% Time Saving',
          tr: '%50 Zaman Tasarrufu',
          de: '50% Zeitersparnis',
        },
        timeSavingDesc: {
          en: 'Increase staff efficiency and speed up operations with automatic order system.',
          tr: 'Otomatik sipariş sistemi ile personel verimliliğini artırın ve işlemleri hızlandırın.',
          de: 'Steigern Sie die Effizienz des Personals und beschleunigen Sie die Abläufe mit dem automatischen Bestellsystem.',
        },
        secure100: {
          en: '100% Secure',
          tr: '%100 Güvenli',
          de: '100% Sicher',
        },
        secure100Desc: {
          en: 'Protect your customer data with banking-level security.',
          tr: 'Bankacılık düzeyinde güvenlik ile müşteri verilerinizi koruyun.',
          de: 'Schützen Sie Ihre Kundendaten mit Sicherheit auf Bankenniveau.',
        },
        integrateMenu: {
          en: 'We Integrate Your Menu',
          tr: 'Mevcut Menünüzü Entegre Ediyoruz',
          de: 'Wir integrieren Ihr Menü',
        },
        integrateMenuDesc: {
          en: 'We digitize your existing menu without losing it. Easy transition guarantee.',
          tr: 'Mevcut menünüzü hiç kaybetmeden dijitalleştiriyoruz. Kolay geçiş garantisi.',
          de: 'Wir digitalisieren Ihr bestehendes Menü, ohne es zu verlieren. Garantie für einen einfachen Übergang.',
        },
        fastSetup: {
          en: 'Very Fast Setup',
          tr: 'Çok Kısa Sürede Kurulum',
          de: 'Sehr schnelle Einrichtung',
        },
        fastSetupDesc: {
          en: 'Set up the system in hours and start using it. Fast and easy.',
          tr: 'Saatler içinde sistemi kurun ve kullanmaya başlayın. Hızlı ve kolay.',
          de: 'Richten Sie das System in Stunden ein und beginnen Sie mit der Nutzung. Schnell und einfach.',
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
          de: 'Meistgestellte Fragen und detaillierte Antworten',
        },
        faq1Q: {
          en: 'What is restXqr?',
          tr: 'restXqr nedir?',
          de: 'Was ist restXqr?',
        },
        faq1A: {
          en: 'restXqr is a restaurant operating system that manages the entire operation from menu to order, staff to accounting on a single platform. It professionalizes your visuals with AI, optimizes the menu, increases sales; integrates seamlessly with your POS and accounting systems.',
          tr: 'restXqr, menüden siparişe, personelden muhasebeye kadar tüm operasyonu tek platformda yöneten restoran işletim sistemidir. AI ile görsellerinizi profesyonelleştirir, menüyü optimize eder ve satışları artırır; POS ve muhasebe sistemlerinizle sorunsuz entegre olur.',
          de: 'restXqr ist ein Restaurant-Betriebssystem, das den gesamten Betrieb von der Speisekarte bis zur Bestellung, vom Personal bis zur Buchhaltung auf einer einzigen Plattform verwaltet. Es professionalisiert Ihre Visuals mit KI, optimiert das Menü, steigert den Umsatz; integriert sich nahtlos in Ihre POS- und Buchhaltungssysteme.',
        },
        faq2Q: {
          en: 'How does the setup process work?',
          tr: 'Kurulum süreci nasıl işliyor?',
          de: 'Wie funktioniert der Einrichtungsprozess?',
        },
        faq2A: {
          en: 'Setup is completely free for plans of 6 months or more. Our expert technical team comes to your restaurant, sets up the system, and trains all your staff. The setup process takes 1-2 days and you can start using it immediately.',
          tr: '6 ay ve üzeri planlar için kurulum tamamen ücretsizdir. Uzman teknik ekibimiz restoranınıza gelir, sistemi kurar ve tüm personellerinizi eğitir. Kurulum süreci 1-2 gün sürer ve hemen kullanmaya başlayabilirsiniz.',
          de: 'Die Einrichtung ist für Pläne ab 6 Monaten völlig kostenlos. Unser technisches Expertenteam kommt in Ihr Restaurant, richtet das System ein und schult Ihr gesamtes Personal. Der Einrichtungsprozess dauert 1-2 Tage und Sie können es sofort nutzen.',
        },
        faq3Q: {
          en: 'How does the refund guarantee work?',
          tr: 'İade garantisi nasıl çalışır?',
          de: 'Wie funktioniert die Rückgabegarantie?',
        },
        faq3A: {
          en: 'If you are not satisfied for any reason within 30 days, we refund your fee in full. If setup has been done, only the setup cost is deducted and the remaining amount is refunded. Try it risk-free!',
          tr: '30 gün içinde herhangi bir sebeple memnun kalmazsanız, ücretinizi tam olarak iade ediyoruz. Kurulum yapılmış ise sadece kurulum maliyeti kesilerek kalan tutar iade edilir. Risk almadan deneyin!',
          de: 'Wenn Sie aus irgendeinem Grund innerhalb von 30 Tagen nicht zufrieden sind, erstatten wir Ihre Gebühr vollständig zurück. Wenn die Einrichtung erfolgt ist, werden nur die Einrichtungskosten abgezogen und der Restbetrag erstattet. Probieren Sie es risikofrei aus!',
        },
        faq4Q: {
          en: 'Which payment methods do you accept?',
          tr: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
          de: 'Welche Zahlungsmethoden akzeptieren Sie?',
        },
        faq4A: {
          en: 'We accept credit card, debit card, wire transfer/EFT, and all mobile payment options. We offer great discounts for 6-month and annual payments. Installment options are also available.',
          tr: 'Kredi kartı, banka kartı, havale/EFT ve tüm mobil ödeme seçeneklerini kabul ediyoruz. 6 aylık ve yıllık ödemeler için büyük indirimler sunuyoruz. Taksit seçenekleri de mevcuttur.',
          de: 'Wir akzeptieren Kreditkarte, Debitkarte, Überweisung/EFT und alle mobilen Zahlungsoptionen. Wir bieten große Rabatte für 6-Monats- und Jahreszahlungen. Ratenzahlungsoptionen sind ebenfalls verfügbar.',
        },
        faq5Q: {
          en: 'Do you provide technical support?',
          tr: 'Teknik destek sağlıyor musunuz?',
          de: 'Bieten Sie technischen Support an?',
        },
        faq5A: {
          en: 'Of course! We offer WhatsApp and priority support in the Premium package, and 24/7 phone support in the Corporate package. We also provide online training videos and documentation for all our customers.',
          tr: 'Elbette! Premium pakette WhatsApp ve öncelikli destek, Kurumsal pakette 7/24 telefon desteği sunuyoruz. Ayrıca tüm müşterilerimiz için online eğitim videoları ve dokümantasyon sağlıyoruz.',
          de: 'Natürlich! Wir bieten WhatsApp- und Priority-Support im Premium-Paket und 24/7-Telefonsupport im Corporate-Paket. Wir bieten auch Online-Schulungsvideos und Dokumentationen für alle unsere Kunden.',
        },
        faq6Q: {
          en: 'How long does it take to learn the system?',
          tr: 'Sistemi öğrenmek ne kadar sürer?',
          de: 'Wie lange dauert es, das System zu erlernen?',
        },
        faq6A: {
          en: 'restXqr is designed to be very user-friendly. Your staff can learn the system in 1-2 hours. We provide detailed training during setup and provide continuous support.',
          tr: 'restXqr çok kullanıcı dostu tasarlandı. Personelleriniz 1-2 saatte sistemi öğrenebilir. Kurulum sırasında detaylı eğitim veriyoruz ve sürekli destek sağlıyoruz.',
          de: 'restXqr ist sehr benutzerfreundlich gestaltet. Ihr Personal kann das System in 1-2 Stunden erlernen. Wir bieten detaillierte Schulungen während der Einrichtung und bieten kontinuierlichen Support.',
        },
        faq7Q: {
          en: 'Is it compatible with my existing POS system?',
          tr: 'Mevcut POS sistemimle uyumlu mu?',
          de: 'Ist es mit meinem bestehenden POS-System kompatibel?',
        },
        faq7A: {
          en: 'restXqr works independently but can be integrated with your existing POS systems. In the Corporate package, you can connect all your systems with API integrations.',
          tr: 'restXqr bağımsız çalışır ancak mevcut POS sistemlerinizle entegre edilebilir. Kurumsal pakette API entegrasyonları ile tüm sistemlerinizi birbirine bağlayabilirsiniz.',
          de: 'restXqr arbeitet unabhängig, kann aber in Ihre bestehenden POS-Systeme integriert werden. Im Corporate-Paket können Sie alle Ihre Systeme mit API-Integrationen verbinden.',
        },
        faq8Q: {
          en: 'What are the reporting features?',
          tr: 'Raporlama özellikleri neler?',
          de: 'Was sind die Berichtsfunktionen?',
        },
        faq8A: {
          en: 'You can get detailed reports such as daily/weekly/monthly sales reports, best-selling products, table efficiency, staff performance, and customer analytics.',
          tr: 'Günlük/haftalık/aylık satış raporları, en çok satan ürünler, masa verimliliği, personel performansı ve müşteri analitikleri gibi detaylı raporlar alabilirsiniz.',
          de: 'Sie können detaillierte Berichte wie tägliche/wöchentliche/monatliche Verkaufsberichte, meistverkaufte Produkte, Tischeffizienz, Personalleistung und Kundenanalysen erhalten.',
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
          de: 'Digitalisieren Sie Ihr Restaurant',
        },
        startToday: {
          en: 'Start today, see the difference tomorrow!',
          tr: 'Bugün başlayın, yarın farkı görün!',
          de: 'Starten Sie heute, sehen Sie morgen den Unterschied!',
        },
        freeDemo: {
          en: 'Free Demo',
          tr: 'Ücretsiz Demo',
          de: 'Kostenlose Demo',
        },
        contactNow: {
          en: 'Contact Now',
          tr: 'Hemen İletişim',
          de: 'Jetzt kontaktieren',
        },
        phone: {
          en: 'Phone',
          tr: 'Telefon',
          de: 'Telefon',
        },
        website: {
          en: 'Website',
          tr: 'Website',
          de: 'Webseite',
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
