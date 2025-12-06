'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FaQrcode, FaUtensils, FaShoppingCart, FaBell, FaMagic, FaChartLine, FaUsers, FaClock, FaCheckCircle, FaRocket, FaShieldAlt, FaStar, FaPhone, FaWhatsapp, FaChevronDown, FaChevronUp, FaBrain, FaCamera, FaLightbulb, FaGem, FaFire, FaHeart, FaGlobe, FaMobile, FaTablet, FaDesktop } from 'react-icons/fa';
import { useTranslation } from '@/i18n/client';

export default function HomeContent({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, 'common');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      icon: FaQrcode,
      color: "orange-500",
      question: t('faq.q1'),
      answer: t('faq.a1')
    },
    {
      icon: FaRocket,
      color: "blue-500",
      question: t('faq.q2'),
      answer: t('faq.a2')
    },
    {
      icon: FaShieldAlt,
      color: "green-500",
      question: t('faq.q3'),
      answer: t('faq.a3')
    },
    {
      icon: FaShoppingCart,
      color: "purple-500",
      question: t('faq.q4'),
      answer: t('faq.a4')
    },
    {
      icon: FaPhone,
      color: "red-500",
      question: t('faq.q5'),
      answer: t('faq.a5')
    },
    {
      icon: FaClock,
      color: "yellow-500",
      question: t('faq.q6'),
      answer: t('faq.a6')
    },
    {
      icon: FaUtensils,
      color: "indigo-500",
      question: t('faq.q7'),
      answer: t('faq.a7')
    },
    {
      icon: FaChartLine,
      color: "pink-500",
      question: t('faq.q8'),
      answer: t('faq.a8')
    }
  ];

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* Modern Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse top-20 left-20"></div>
          <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse bottom-20 right-20 animation-delay-2000"></div>
          <div className="absolute w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-lg font-bold mb-8 shadow-2xl animate-bounce-slow">
              <FaRocket className="mr-3" />
              {t('hero.badge')}
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('hero.title1')}
              </span>
              <br/>
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                {t('hero.title2')}
              </span>
              <br/>
              <span className="text-white">
                {t('hero.title3')}
              </span>
            </h1>
          
            {/* Subtitle */}
            <p className="text-2xl md:text-3xl mb-12 text-gray-200 leading-relaxed max-w-5xl mx-auto font-medium">
              🚀 <span className="text-white font-bold">{t('hero.subtitle1')}</span> {t('hero.subtitle2')}
              <br/>
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-black text-4xl">
                {t('hero.subtitle3')}
              </span>
              <br/>
              <span className="text-gray-300">{t('hero.subtitle4')}</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link href="/isletme-giris" className="group relative px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl text-xl font-bold shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-110 overflow-hidden">
                <span className="relative z-10 flex items-center justify-center">
                  <FaRocket className="mr-3 group-hover:animate-bounce" />
                  {t('hero.cta1')}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </Link>
              <Link href="#demo" className="px-12 py-6 bg-white/10 backdrop-blur-xl text-white rounded-2xl text-xl font-bold border-2 border-white/30 hover:bg-white/20 transition-all duration-300 hover:scale-110 flex items-center justify-center">
                <FaMagic className="mr-3" />
                {t('hero.cta2')}
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
                <div className="text-5xl font-black bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">300%</div>
                <div className="text-gray-300 font-medium">{t('hero.stats1')}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
                <div className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">AI</div>
                <div className="text-gray-300 font-medium">{t('hero.stats2')}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20">
                <div className="text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">24/7</div>
                <div className="text-gray-300 font-medium">{t('hero.stats3')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Visual Optimization Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-lg font-bold mb-6 shadow-lg">
              <FaBrain className="mr-3 animate-pulse" />
              {t('ai_section.badge')}
            </div>
            <h2 className="text-6xl font-black text-gray-900 mb-8">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                {t('ai_section.title')}
              </span>
            </h2>
            <p className="text-3xl text-gray-700 max-w-5xl mx-auto font-bold leading-relaxed">
              🎨 <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{t('ai_section.description1')}</span> {t('ai_section.description_highlight1')}
              <br/>{t('ai_section.description2')} <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent font-black">{t('ai_section.description_highlight2')}</span>
              <br/>{t('ai_section.description3')} <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-black">{t('ai_section.description_highlight3')}</span> {t('ai_section.description4')}
            </p>
          </div>
          
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* BEFORE */}
              <div className="text-center group">
                <div className="bg-white p-10 rounded-3xl shadow-2xl border-4 border-red-200 group-hover:border-red-300 transition-all duration-300 group-hover:shadow-3xl group-hover:scale-105">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-full text-xl font-black mb-8 inline-block shadow-lg">
                    ❌ {t('ai_section.before_badge')}
                  </div>
                  <div className="relative">
                    <img 
                      src="/ai-after.jpg" 
                      alt="AI Optimization Before" 
                      className="w-full h-96 object-cover rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300"
                    />
                    <div className="absolute top-6 left-6 bg-red-500 text-white px-6 py-3 rounded-xl font-black text-lg shadow-lg">
                      {t('ai_section.before_label')}
                    </div>
                  </div>
                  <div className="mt-8 text-left">
                    <h3 className="text-2xl font-black text-gray-900 mb-6">{t('ai_section.before_title')}</h3>
                    <ul className="space-y-3 text-gray-600 text-lg">
                      <li className="flex items-center"><span className="text-red-500 mr-3 text-xl">💰</span> {t('ai_section.before_list1')}</li>
                      <li className="flex items-center"><span className="text-red-500 mr-3 text-xl">⏰</span> {t('ai_section.before_list2')}</li>
                      <li className="flex items-center"><span className="text-red-500 mr-3 text-xl">📸</span> {t('ai_section.before_list3')}</li>
                      <li className="flex items-center"><span className="text-red-500 mr-3 text-xl">🎨</span> {t('ai_section.before_list4')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* AFTER */}
              <div className="text-center group">
                <div className="bg-white p-10 rounded-3xl shadow-2xl border-4 border-green-200 group-hover:border-green-300 transition-all duration-300 group-hover:shadow-3xl group-hover:scale-105">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full text-xl font-black mb-8 inline-block shadow-lg">
                    ✅ {t('ai_section.after_badge')}
                  </div>
                  <div className="relative">
                    <img 
                      src="/ai-before.jpg" 
                      alt="AI Optimization After" 
                      className="w-full h-96 object-cover rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300"
                    />
                    <div className="absolute top-6 left-6 bg-green-500 text-white px-6 py-3 rounded-xl font-black text-lg shadow-lg">
                      {t('ai_section.after_label')}
                    </div>
                  </div>
                  <div className="mt-8 text-left">
                    <h3 className="text-2xl font-black text-gray-900 mb-6">{t('ai_section.after_title')}</h3>
                    <ul className="space-y-3 text-gray-600 text-lg">
                      <li className="flex items-center"><span className="text-green-500 mr-3 text-xl">🚀</span> {t('ai_section.after_list1')}</li>
                      <li className="flex items-center"><span className="text-green-500 mr-3 text-xl">💎</span> {t('ai_section.after_list2')}</li>
                      <li className="flex items-center"><span className="text-green-500 mr-3 text-xl">💰</span> {t('ai_section.after_list3')}</li>
                      <li className="flex items-center"><span className="text-green-500 mr-3 text-xl">📈</span> {t('ai_section.after_list4')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
              <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-purple-100">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <FaGem className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{t('ai_section.feature1_title')}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{t('ai_section.feature1_desc')}</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-green-100">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <FaChartLine className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{t('ai_section.feature2_title')}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{t('ai_section.feature2_desc')}</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-blue-100">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <FaRocket className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{t('ai_section.feature3_title')}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{t('ai_section.feature3_desc')}</p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-20 text-center bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 p-12 rounded-3xl shadow-2xl">
              <h3 className="text-4xl font-black text-white mb-6">🚀 {t('ai_section.cta_title')}</h3>
              <p className="text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                {t('ai_section.cta_desc1')}<br/>
                {t('ai_section.cta_desc2')}
              </p>
              <Link href="/isletme-giris" className="inline-block px-12 py-6 bg-white text-purple-600 rounded-2xl text-xl font-black shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110">
                {t('ai_section.cta_button')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-20 right-20 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl bottom-20 left-20 animate-pulse animation-delay-2000"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-lg font-bold mb-6 shadow-lg">
              <FaStar className="mr-3 animate-spin-slow" />
              {t('services.badge')}
            </div>
            <h2 className="text-6xl font-black mb-8">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('services.title')}
              </span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed">
              {t('services.subtitle')} <span className="text-white font-bold">{t('services.subtitle_highlight')}</span> {t('services.subtitle_end')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* QR Menu */}
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaQrcode className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-black mb-4">{t('services.qr_title')}</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">{t('services.qr_desc')}</p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.qr_list1')}</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.qr_list2')}</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.qr_list3')}</li>
              </ul>
            </div>

            {/* Order Management */}
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaShoppingCart className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-black mb-4">{t('services.order_title')}</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">{t('services.order_desc')}</p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.order_list1')}</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.order_list2')}</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.order_list3')}</li>
              </ul>
            </div>

            {/* AI Visual */}
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaBrain className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-black mb-4">{t('services.ai_title')}</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">{t('services.ai_desc')}</p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.ai_list1')}</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.ai_list2')}</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.ai_list3')}</li>
              </ul>
            </div>

            {/* Reporting */}
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaChartLine className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-black mb-4">{t('services.report_title')}</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">{t('services.report_desc')}</p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.report_list1')}</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.report_list2')}</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.report_list3')}</li>
              </ul>
            </div>

            {/* Multi-Platform */}
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaGlobe className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-black mb-4">{t('services.platform_title')}</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">{t('services.platform_desc')}</p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.platform_list1')}</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.platform_list2')}</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.platform_list3')}</li>
              </ul>
            </div>

            {/* Support */}
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaPhone className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-black mb-4">{t('services.support_title')}</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">{t('services.support_desc')}</p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.support_list1')}</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.support_list2')}</li>
                <li className="flex items-center"><FaCheckCircle className="text-green-400 mr-2" /> {t('services.support_list3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full text-lg font-bold mb-6 shadow-lg">
              <FaHeart className="mr-3 animate-pulse" />
              {t('benefits.badge')}
            </div>
            <h2 className="text-6xl font-black mb-8">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('benefits.title')}
              </span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed">
              {t('benefits.subtitle1')} <span className="text-white font-bold">{t('benefits.subtitle_highlight')}</span> {t('benefits.subtitle2')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaChartLine className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">{t('benefits.card1_title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('benefits.card1_desc')}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaClock className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">{t('benefits.card2_title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('benefits.card2_desc')}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaShieldAlt className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">{t('benefits.card3_title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('benefits.card3_desc')}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaUtensils className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">{t('benefits.card4_title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('benefits.card4_desc')}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaRocket className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">{t('benefits.card5_title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('benefits.card5_desc')}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <FaPhone className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">{t('benefits.card6_title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('benefits.card6_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-20 left-20 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl bottom-20 right-20 animate-pulse animation-delay-2000"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-full text-lg font-bold mb-6 shadow-lg">
              <FaLightbulb className="mr-3 animate-pulse" />
              {t('faq.badge')}
            </div>
            <h2 className="text-6xl font-black mb-8">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                {t('faq.title')}
              </span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed">
              {t('faq.subtitle1')} <span className="text-white font-bold">{t('faq.subtitle_highlight')}</span> {t('faq.subtitle2')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-8 text-left flex items-center justify-between group"
                >
                  <div className="flex items-center flex-1">
                    <div className={`bg-gradient-to-r from-${faq.color} to-${faq.color.replace('500', '600')} w-12 h-12 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform`}>
                      <faq.icon className="text-white text-xl" />
                    </div>
                    <span className="text-xl font-bold text-white">{faq.question}</span>
                  </div>
                  <div className="ml-4">
                    {openFAQ === index ? (
                      <FaChevronUp className="text-white text-xl" />
                    ) : (
                      <FaChevronDown className="text-white text-xl" />
                    )}
                  </div>
                </button>
                {openFAQ === index && (
                  <div className="px-8 pb-8">
                    <div className="pl-18 text-gray-300 text-lg leading-relaxed border-l-4 border-white/20 pl-6">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl top-20 right-20 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl bottom-20 left-20 animate-pulse animation-delay-2000"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-xl rounded-full text-lg font-bold mb-8 shadow-lg">
              <FaRocket className="mr-3 animate-bounce" />
              {t('cta_section.badge')}
            </div>
            <h2 className="text-6xl font-black mb-8">
              {t('cta_section.title')}
            </h2>
            <p className="text-3xl mb-12 font-bold leading-relaxed">
              {t('cta_section.subtitle1')} <span className="bg-white/20 px-4 py-2 rounded-xl">{t('cta_section.subtitle2')}</span>
            </p>
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border-2 border-white/30 mb-12 inline-block">
              <div className="text-2xl font-black mb-2">✅ {t('cta_section.guarantee')}</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link href="/isletme-giris" className="group relative px-12 py-6 bg-white text-purple-600 rounded-2xl text-xl font-black shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-110 overflow-hidden">
                <span className="relative z-10 flex items-center justify-center">
                  <FaRocket className="mr-3 group-hover:animate-bounce" />
                  {t('cta_section.button1')}
                </span>
              </Link>
              <Link href="tel:+905555555555" className="px-12 py-6 bg-white/10 backdrop-blur-xl text-white rounded-2xl text-xl font-bold border-2 border-white/30 hover:bg-white/20 transition-all duration-300 hover:scale-110 flex items-center justify-center">
                <FaPhone className="mr-3" />
                {t('cta_section.button2')}
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 justify-center text-lg">
              <div className="flex items-center bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20">
                <FaPhone className="mr-2" /> {t('cta_section.phone')}: +90 555 555 55 55
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20">
                <FaWhatsapp className="mr-2" /> {t('cta_section.whatsapp')}: +90 555 555 55 55
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-xl px-6 py-3 rounded-full border border-white/20">
                <FaGlobe className="mr-2" /> {t('cta_section.website')}: restxqr.com
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
