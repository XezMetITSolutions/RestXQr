'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FaQrcode, FaUtensils, FaShoppingCart, FaBell, FaMagic, FaChartLine, FaUsers, FaClock, FaCheckCircle, FaRocket, FaShieldAlt, FaStar, FaPhone, FaWhatsapp, FaChevronDown, FaChevronUp, FaBrain, FaCamera, FaLightbulb, FaGem, FaFire, FaHeart, FaGlobe, FaMobile, FaTablet, FaDesktop } from 'react-icons/fa';
import { LanguageProvider } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';

function HomeContent() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      icon: FaQrcode,
      color: "orange-500",
      question: "restXqr nedir?",
      answer: "restXqr, menüden siparişe, personelden muhasebeye kadar tüm operasyonu tek platformda yöneten restoran işletim sistemidir. AI ile görsellerinizi profesyonelleştirir, menüyü optimize eder ve satışları artırır; POS ve muhasebe sistemlerinizle sorunsuz entegre olur."
    },
    {
      icon: FaRocket,
      color: "blue-500",
      question: "Kurulum süreci nasıl işliyor?",
      answer: "6 ay ve üzeri planlar için kurulum tamamen ücretsizdir. Uzman teknik ekibimiz restoranınıza gelir, sistemi kurar ve tüm personellerinizi eğitir. Kurulum süreci 1-2 gün sürer ve hemen kullanmaya başlayabilirsiniz."
    },
    {
      icon: FaShieldAlt,
      color: "green-500",
      question: "İade garantisi nasıl çalışır?",
      answer: "30 gün içinde herhangi bir sebeple memnun kalmazsanız, ücretinizi tam olarak iade ediyoruz. Kurulum yapılmış ise sadece kurulum maliyeti kesilerek kalan tutar iade edilir. Risk almadan deneyin!"
    },
    {
      icon: FaShoppingCart,
      color: "purple-500",
      question: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
      answer: "Kredi kartı, banka kartı, havale/EFT ve tüm mobil ödeme seçeneklerini kabul ediyoruz. 6 aylık ve yıllık ödemeler için büyük indirimler sunuyoruz. Taksit seçenekleri de mevcuttur."
    },
    {
      icon: FaPhone,
      color: "red-500",
      question: "Teknik destek sağlıyor musunuz?",
      answer: "Elbette! Premium pakette WhatsApp ve öncelikli destek, Kurumsal pakette 7/24 telefon desteği sunuyoruz. Ayrıca tüm müşterilerimiz için online eğitim videoları ve dokümantasyon sağlıyoruz."
    },
    {
      icon: FaClock,
      color: "yellow-500",
      question: "Sistemi öğrenmek ne kadar sürer?",
      answer: "restXqr çok kullanıcı dostu tasarlandı. Personelleriniz 1-2 saatte sistemi öğrenebilir. Kurulum sırasında detaylı eğitim veriyoruz ve sürekli destek sağlıyoruz."
    },
    {
      icon: FaUtensils,
      color: "indigo-500",
      question: "Mevcut POS sistemimle uyumlu mu?",
      answer: "restXqr bağımsız çalışır ancak mevcut POS sistemlerinizle entegre edilebilir. Kurumsal pakette API entegrasyonları ile tüm sistemlerinizi birbirine bağlayabilirsiniz."
    },
    {
      icon: FaChartLine,
      color: "pink-500",
      question: "Raporlama özellikleri neler?",
      answer: "Günlük/haftalık/aylık satış raporları, en çok satan ürünler, masa verimliliği, personel performansı ve müşteri analitikleri gibi detaylı raporlar alabilirsiniz."
    }
  ];

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* Modern Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center px-8 py-4 bg-white/10 rounded-full shadow-2xl mb-8 text-xl font-bold backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
            <FaStar className="text-yellow-300 mr-3 animate-spin" /> 
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              RestXQr ile Dijital Dönüşüm
            </span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Restoranınız
            </span>
            <br/>
            <span className="text-white">
              Dijital Çağa
            </span>
            <br/>
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Hazır mı?
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-2xl md:text-3xl mb-12 text-gray-200 leading-relaxed max-w-5xl mx-auto font-medium">
            🚀 <span className="text-white font-bold">Türkiye'nin en gelişmiş</span> QR menü ve sipariş yönetim sistemi ile
            <br/>
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-black text-4xl">
              satışlarınızı %300 artırın!
            </span>
            <br/>
            <span className="text-gray-300">Rakiplerinizi geride bırakın.</span>
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-8 max-w-3xl mx-auto mb-16">
            <Link href="/panels" className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-6 rounded-3xl text-xl font-black flex items-center justify-center gap-4 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 hover:from-blue-500 hover:to-purple-500">
              <FaUsers className="text-2xl group-hover:animate-bounce" /> 
              <span>Panelleri Görüntüle</span>
            </Link>
            <Link href="/panels" className="group bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white px-12 py-6 rounded-3xl text-xl font-black transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105">
              <FaRocket className="inline mr-4 text-2xl group-hover:animate-bounce" /> 
              <span>Demo İncele</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-black text-green-400 mb-2">%300</div>
              <div className="text-lg text-gray-200">Satış Artışı</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-black text-blue-400 mb-2">AI</div>
              <div className="text-lg text-gray-200">Fotoğraf Optimizasyonu</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-black text-purple-400 mb-2">24/7</div>
              <div className="text-lg text-gray-200">Destek</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Image Optimization Section - Düzeltilmiş */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-lg font-bold mb-6 shadow-lg">
              <FaBrain className="mr-3 animate-pulse" />
              AI Teknolojisi
            </div>
            <h2 className="text-6xl font-black text-gray-900 mb-8">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                AI ile Görsel Optimizasyonu
              </span>
            </h2>
            <p className="text-3xl text-gray-700 max-w-5xl mx-auto font-bold leading-relaxed">
              🎨 <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Yapay Zeka</span> ile ürün fotoğraflarınızı profesyonelleştirin! 
              <br/>Fotoğrafçılara <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent font-black">binlerce lira harcamanıza gerek yok!</span>
              <br/>Satışlarınızı <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-black">%300 artırın</span> ve müşterilerinizi büyüleyin.
            </p>
          </div>
          
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* ÖNCESİ - Amatör (ai-after.jpg) */}
              <div className="text-center group">
                <div className="bg-white p-10 rounded-3xl shadow-2xl border-4 border-red-200 group-hover:border-red-300 transition-all duration-300 group-hover:shadow-3xl group-hover:scale-105">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-full text-xl font-black mb-8 inline-block shadow-lg">
                    ❌ ÖNCESİ
                  </div>
                  <div className="relative">
                    <img 
                      src="/ai-after.jpg" 
                      alt="AI Optimizasyonu Öncesi - Amatör Ürün Fotoğrafı" 
                      className="w-full h-96 object-cover rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300"
                    />
                    <div className="absolute top-6 left-6 bg-red-500 text-white px-6 py-3 rounded-xl font-black text-lg shadow-lg">
                      Amatör Görünüm
                    </div>
                  </div>
                  <div className="mt-8 text-left">
                <h3 className="text-2xl font-black text-gray-900 mb-6">Maliyet Tasarrufu:</h3>
                <ul className="space-y-3 text-gray-600 text-lg">
                  <li className="flex items-center"><span className="text-red-500 mr-3 text-xl">💰</span> Fotoğrafçı maliyeti: 0₺</li>
                  <li className="flex items-center"><span className="text-red-500 mr-3 text-xl">⏰</span> Bekleme süresi: 0 gün</li>
                  <li className="flex items-center"><span className="text-red-500 mr-3 text-xl">📸</span> Profesyonel çekim: Gerek yok</li>
                  <li className="flex items-center"><span className="text-red-500 mr-3 text-xl">🎨</span> Photoshop: Otomatik</li>
                </ul>
                  </div>
                </div>
              </div>

              {/* SONRASI - Profesyonel (ai-before.jpg) */}
              <div className="text-center group">
                <div className="bg-white p-10 rounded-3xl shadow-2xl border-4 border-green-200 group-hover:border-green-300 transition-all duration-300 group-hover:shadow-3xl group-hover:scale-105">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full text-xl font-black mb-8 inline-block shadow-lg">
                    ✅ SONRASI
                  </div>
                  <div className="relative">
                    <img 
                      src="/ai-before.jpg" 
                      alt="AI Optimizasyonu Sonrası - Profesyonel Ürün Fotoğrafı" 
                      className="w-full h-96 object-cover rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300"
                    />
                    <div className="absolute top-6 left-6 bg-green-500 text-white px-6 py-3 rounded-xl font-black text-lg shadow-lg">
                      Profesyonel Görünüm
                    </div>
                  </div>
                  <div className="mt-8 text-left">
                <h3 className="text-2xl font-black text-gray-900 mb-6">AI Avantajları:</h3>
                <ul className="space-y-3 text-gray-600 text-lg">
                  <li className="flex items-center"><span className="text-green-500 mr-3 text-xl">🚀</span> Saniyeler içinde hazır</li>
                  <li className="flex items-center"><span className="text-green-500 mr-3 text-xl">💎</span> Profesyonel kalite</li>
                  <li className="flex items-center"><span className="text-green-500 mr-3 text-xl">💰</span> Binlerce lira tasarruf</li>
                  <li className="flex items-center"><span className="text-green-500 mr-3 text-xl">📈</span> Satış artışı garantisi</li>
                </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Features */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-3xl shadow-xl text-center border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:animate-bounce">
                  <FaMagic className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-6">Maliyet Tasarrufu</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Fotoğrafçılara binlerce lira harcamanıza gerek yok! AI ile profesyonel sonuçlar.</p>
              </div>

              <div className="bg-white p-10 rounded-3xl shadow-xl text-center border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:animate-bounce">
                  <FaChartLine className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-6">Satış Artışı</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Profesyonel görseller ile müşteri ilgisini artırın ve satışlarınızı %300 büyütün.</p>
              </div>

              <div className="bg-white p-10 rounded-3xl shadow-xl text-center border-2 border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:animate-bounce">
                  <FaRocket className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-6">Hızlı Sonuç</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Saniyeler içinde tüm ürün fotoğraflarınızı profesyonelleştirin. Bekleme yok!</p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-20">
              <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white p-12 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10"></div>
                <div className="relative z-10">
                  <h3 className="text-4xl font-black mb-6">🚀 Hemen Deneyin!</h3>
                  <p className="text-2xl mb-8 text-purple-100 leading-relaxed">
                    AI görsel optimizasyonu ile fotoğrafçılara binlerce lira harcamanıza gerek yok!
                    <br/>Ürün fotoğraflarınızı profesyonelleştirin ve satışlarınızı artırın.
                  </p>
                  <Link href="/panels" className="bg-white text-purple-600 px-12 py-6 rounded-2xl text-xl font-black hover:bg-purple-50 transition-all duration-300 shadow-lg inline-flex items-center gap-4 hover:scale-105">
                    <FaMagic className="text-2xl" />
                    AI Optimizasyonunu İncele
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Services Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-bold mb-6 shadow-lg">
              <FaGem className="mr-3" />
              Premium Hizmetler
            </div>
            <h2 className="text-6xl font-black text-gray-900 mb-8">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Hizmetlerimiz
              </span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-medium leading-relaxed">
              Restoranınız için <span className="font-black text-gray-900">tam kapsamlı dijital çözümler</span> sunuyoruz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* QR Menü */}
            <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border-2 border-orange-200 hover:border-orange-300">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaQrcode className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">QR Menü Sistemi</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">Temassız menü deneyimi ile müşterilerinizin güvenliğini sağlayın. Anlık güncellemeler ve çoklu dil desteği.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Temassız sipariş</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Çoklu dil desteği</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Anlık güncellemeler</li>
              </ul>
            </div>

            {/* Sipariş Yönetimi */}
            <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border-2 border-blue-200 hover:border-blue-300">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaShoppingCart className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Sipariş Yönetimi</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">Gelişmiş sipariş takip sistemi ile mutfak ve servis koordinasyonunu mükemmelleştirin.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Gerçek zamanlı takip</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Mutfak entegrasyonu</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Otomatik bildirimler</li>
              </ul>
            </div>

            {/* AI Görsel Optimizasyon */}
            <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border-2 border-purple-200 hover:border-purple-300">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaBrain className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">AI Görsel Optimizasyon</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">Yapay zeka ile ürün fotoğraflarınızı profesyonelleştirin ve satışlarınızı artırın.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Otomatik optimizasyon</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Profesyonel görünüm</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Satış artışı</li>
              </ul>
            </div>

            {/* Raporlama */}
            <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border-2 border-green-200 hover:border-green-300">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaChartLine className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Detaylı Raporlama</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">Satış analizi, müşteri davranışları ve performans metrikleri ile işinizi büyütün.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Satış analizi</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Müşteri insights</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Performans metrikleri</li>
              </ul>
            </div>

            {/* Çoklu Platform */}
            <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border-2 border-indigo-200 hover:border-indigo-300">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaGlobe className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Çoklu Platform</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">Masaüstü, tablet ve mobil cihazlarda mükemmel deneyim sunuyoruz.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Responsive tasarım</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Çoklu cihaz desteği</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Senkronizasyon</li>
              </ul>
            </div>

            {/* 7/24 Destek */}
            <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border-2 border-red-200 hover:border-red-300">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaHeart className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">7/24 Destek</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">Uzman ekibimiz her zaman yanınızda. WhatsApp, telefon ve online destek.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> WhatsApp desteği</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Telefon desteği</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Online eğitim</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-full text-lg font-bold mb-6 backdrop-blur-xl border border-white/20">
              <FaFire className="mr-3 text-orange-400" />
              Avantajlar
            </div>
            <h2 className="text-6xl font-black mb-8">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Neden restXqr?
              </span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed">
              <span className="text-white font-bold">Türkiye'nin en gelişmiş</span> restoran yönetim sistemi ile işinizi büyütün
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaChartLine className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">%300 Satış Artışı</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Profesyonel görseller ve kullanıcı dostu arayüz ile müşteri memnuniyetini artırın.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaClock className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">%50 Zaman Tasarrufu</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Otomatik sipariş sistemi ile personel verimliliğini artırın ve işlemleri hızlandırın.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaShieldAlt className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">%100 Güvenli</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Bankacılık düzeyinde güvenlik ile müşteri verilerinizi koruyun.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaUsers className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Mevcut Menünüzü Entegre Ediyoruz</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Mevcut menünüzü hiç kaybetmeden dijitalleştiriyoruz. Kolay geçiş garantisi.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaRocket className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Çok Kısa Sürede Kurulum</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Saatler içinde sistemi kurun ve kullanmaya başlayın. Hızlı ve kolay.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaHeart className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">7/24 Destek</h3>
              <p className="text-gray-300 text-lg leading-relaxed">Uzman ekibimiz her zaman yanınızda.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modern FAQ Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-bold mb-6 shadow-lg">
              <FaLightbulb className="mr-3" />
              Sık Sorulan Sorular
            </div>
            <h2 className="text-6xl font-black text-gray-900 mb-8">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Merak Edilenler
              </span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-medium leading-relaxed">
              <span className="font-black text-gray-900">En çok sorulan sorular</span> ve detaylı cevapları
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-200">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-8 text-left flex items-center justify-between group"
                >
                  <div className="flex items-center">
                    <div className={`bg-gradient-to-r ${faq.color === 'orange-500' ? 'from-orange-500 to-red-500' : faq.color === 'blue-500' ? 'from-blue-500 to-cyan-500' : faq.color === 'green-500' ? 'from-green-500 to-emerald-500' : faq.color === 'purple-500' ? 'from-purple-500 to-pink-500' : faq.color === 'red-500' ? 'from-red-500 to-pink-500' : faq.color === 'yellow-500' ? 'from-yellow-500 to-orange-500' : faq.color === 'indigo-500' ? 'from-indigo-500 to-purple-500' : 'from-pink-500 to-red-500'} w-12 h-12 rounded-xl flex items-center justify-center mr-6 group-hover:animate-bounce`}>
                      <faq.icon className="text-white text-xl" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="text-gray-400 group-hover:text-blue-600 transition-colors duration-300">
                    {openFAQ === index ? (
                      <FaChevronUp className="text-xl" />
                    ) : (
                      <FaChevronDown className="text-xl" />
                    )}
                  </div>
                </button>
                {openFAQ === index && (
                  <div className="px-8 pb-8">
                    <div className="border-t border-gray-100 pt-6">
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-full text-lg font-bold mb-8 backdrop-blur-xl border border-white/20">
              <FaRocket className="mr-3 text-orange-400 animate-bounce" />
              Hemen Başlayın
            </div>
            
            <h2 className="text-6xl font-black mb-8">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Restoranınızı Dijitalleştirin
              </span>
            </h2>
            
            <p className="text-3xl text-gray-200 mb-12 leading-relaxed font-medium">
              <span className="text-white font-black">Bugün başlayın,</span> yarın farkı görün!
              <br/>
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-black">
                %300 satış artışı garantisi
              </span>
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-8 mb-16">
              <Link href="/panels" className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-6 rounded-3xl text-xl font-black flex items-center justify-center gap-4 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 hover:from-blue-500 hover:to-purple-500">
                <FaUsers className="text-2xl group-hover:animate-bounce" /> 
                <span>Ücretsiz Demo</span>
              </Link>
              <Link href="/panels" className="group bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white px-12 py-6 rounded-3xl text-xl font-black transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105">
                <FaPhone className="inline mr-4 text-2xl group-hover:animate-bounce" /> 
                <span>Hemen İletişim</span>
              </Link>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <FaPhone className="text-3xl text-green-400 mb-4 mx-auto" />
                <div className="text-xl font-bold text-white mb-2">Telefon</div>
                <div className="text-gray-300">+90 (555) 123 45 67</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <FaWhatsapp className="text-3xl text-green-400 mb-4 mx-auto" />
                <div className="text-xl font-bold text-white mb-2">WhatsApp</div>
                <div className="text-gray-300">+90 (555) 123 45 67</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <FaGlobe className="text-3xl text-blue-400 mb-4 mx-auto" />
                <div className="text-xl font-bold text-white mb-2">Website</div>
                <div className="text-gray-300">www.restxqr.com</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}