'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FaQrcode, FaUtensils, FaShoppingCart, FaBell, FaMagic, FaChartLine, FaUsers, FaClock, FaCheckCircle, FaRocket, FaShieldAlt, FaStar, FaPhone, FaWhatsapp, FaChevronDown, FaChevronUp, FaBrain, FaCamera, FaLightbulb, FaGem, FaFire, FaHeart, FaGlobe, FaMobile, FaTablet, FaDesktop } from 'react-icons/fa';
import useLanguageStore from '@/store/useLanguageStore';
import LandingLanguageToggle from '@/components/LandingLanguageToggle';
import DemoRequestModal from '@/components/DemoRequestModal';

export default function HomeContent() {
    const { t, language } = useLanguageStore();
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);
    const [showDemoModal, setShowDemoModal] = useState(false);

    const toggleFAQ = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    const faqs = [
        {
            icon: FaQrcode,
            color: "orange-500",
            question: t('faq1Q'),
            answer: t('faq1A')
        },
        {
            icon: FaRocket,
            color: "blue-500",
            question: t('faq2Q'),
            answer: t('faq2A')
        },
        {
            icon: FaShieldAlt,
            color: "green-500",
            question: t('faq3Q'),
            answer: t('faq3A')
        },
        {
            icon: FaShoppingCart,
            color: "purple-500",
            question: t('faq4Q'),
            answer: t('faq4A')
        },
        {
            icon: FaPhone,
            color: "red-500",
            question: t('faq5Q'),
            answer: t('faq5A')
        },
        {
            icon: FaClock,
            color: "yellow-500",
            question: t('faq6Q'),
            answer: t('faq6A')
        },
        {
            icon: FaUtensils,
            color: "indigo-500",
            question: t('faq7Q'),
            answer: t('faq7A')
        },
        {
            icon: FaChartLine,
            color: "pink-500",
            question: t('faq8Q'),
            answer: t('faq8A')
        }
    ];

    return (
        <main className="min-h-screen bg-white relative overflow-hidden">
            {/* Language Toggle - Fixed Position */}
            <LandingLanguageToggle />

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
                            {t('heroBadge')}
                        </span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-8 leading-tight">
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {t('heroTitle1')}
                        </span>
                        <br />
                        <span className="text-white">
                            {t('heroTitle2')}
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                            {t('heroTitle3')}
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-2xl md:text-3xl mb-12 text-gray-200 leading-relaxed max-w-5xl mx-auto font-medium">
                        🚀 <span className="text-white font-bold">{t('heroSubtitle1')}</span>
                        <br />
                        <span className="text-gray-300">{t('heroSubtitle2')}</span>
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-8 max-w-3xl mx-auto mb-16">
                        <button
                            onClick={() => setShowDemoModal(true)}
                            className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 md:px-12 md:py-6 rounded-3xl text-lg md:text-xl font-black flex items-center justify-center gap-4 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 hover:from-blue-500 hover:to-purple-500"
                        >
                            <FaUsers className="text-2xl group-hover:animate-bounce" />
                            <span>{t('requestDemo')}</span>
                        </button>
                        <button
                            onClick={() => setShowDemoModal(true)}
                            className="group bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white px-8 py-4 md:px-12 md:py-6 rounded-3xl text-lg md:text-xl font-black transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 flex items-center justify-center gap-4"
                        >
                            <FaRocket className="text-2xl group-hover:animate-bounce" />
                            <span>{t('startNow')}</span>
                        </button>
                    </div>

                    {/* Stats Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 max-w-6xl mx-auto mb-12">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-black/40 backdrop-blur-3xl rounded-2xl p-8 border border-white/10 hover:border-green-500/50 transition-all duration-300">
                                <div className="text-sm font-black tracking-[0.2em] text-green-400 mb-4 uppercase">{t('statSales')}</div>
                                <div className="text-4xl md:text-5xl font-black text-white mb-2">ROI</div>
                                <div className="text-gray-400 font-medium text-lg">{t('statSalesDesc')}</div>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-black/40 backdrop-blur-3xl rounded-2xl p-8 border border-white/10 hover:border-blue-500/50 transition-all duration-300">
                                <div className="text-sm font-black tracking-[0.2em] text-blue-400 mb-4 uppercase">{t('statAI')}</div>
                                <div className="text-4xl md:text-5xl font-black text-white mb-2">AI</div>
                                <div className="text-gray-400 font-medium text-lg">{t('statAIDesc')}</div>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-black/40 backdrop-blur-3xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                                <div className="text-sm font-black tracking-[0.2em] text-purple-400 mb-4 uppercase">{t('statSupport')}</div>
                                <div className="text-4xl md:text-5xl font-black text-white mb-2">24/7</div>
                                <div className="text-gray-400 font-medium text-lg">{t('statSupportDesc')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Business Value & Efficiency Section */}
            <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-full text-lg font-bold mb-6 shadow-xl">
                            <FaChartLine className="mr-3 animate-pulse" />
                            {t('efficiencyBadge')}
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight">
                            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {t('marketingSectionTitle')}
                            </span>
                        </h2>
                        <p className="text-2xl md:text-3xl text-gray-700 max-w-5xl mx-auto font-medium leading-relaxed">
                            {t('marketingSectionDesc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
                        {/* Marketing & Ads */}
                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-b-8 border-blue-500 hover:transform hover:-translate-y-4 transition-all duration-500 group">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-700 w-24 h-24 rounded-3xl flex items-center justify-center mb-10 shadow-lg group-hover:rotate-12 transition-transform">
                                <FaBell className="text-white text-4xl" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-6">{t('marketingAdsTitle')}</h3>
                            <p className="text-xl text-gray-600 leading-relaxed font-medium">
                                {t('marketingAdsDesc')}
                            </p>
                        </div>

                        {/* Waiter Call Efficiency */}
                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-b-8 border-indigo-500 hover:transform hover:-translate-y-4 transition-all duration-500 group">
                            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 w-24 h-24 rounded-3xl flex items-center justify-center mb-10 shadow-lg group-hover:rotate-12 transition-transform">
                                <FaUsers className="text-white text-4xl" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-6">{t('waiterCallEfficiencyTitle')}</h3>
                            <p className="text-xl text-gray-600 leading-relaxed font-medium">
                                {t('waiterCallEfficiencyDesc')}
                            </p>
                        </div>

                        {/* Tailored Solutions */}
                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-b-8 border-purple-500 hover:transform hover:-translate-y-4 transition-all duration-500 group">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-700 w-24 h-24 rounded-3xl flex items-center justify-center mb-10 shadow-lg group-hover:rotate-12 transition-transform">
                                <FaGem className="text-white text-4xl" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-6">{t('tailoredSolutionsTitle')}</h3>
                            <p className="text-xl text-gray-600 leading-relaxed font-medium">
                                {t('tailoredSolutionsDesc')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Banners Collection - Part 1 */}
            <section className="py-24 bg-white space-y-12 px-4">
                {/* Feature Banner 1: Multi-Branch */}
                <div className="max-w-6xl mx-auto w-full bg-gradient-to-r from-[#1e40af] to-[#2563eb] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left md:w-2/3">
                            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-full text-sm font-bold mb-8 backdrop-blur-md">
                                <FaRocket className="text-blue-100" />
                                {t('tryNow')}
                            </div>
                            <h3 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">{t('multiBranchTitle')}</h3>
                            <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed">
                                {t('multiBranchDesc')}
                            </p>
                        </div>
                        <div className="md:w-1/3 flex justify-center">
                            <button
                                onClick={() => setShowDemoModal(true)}
                                className="bg-white text-[#1e40af] px-12 py-6 rounded-3xl text-xl font-black hover:bg-white/90 transition-all shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95"
                            >
                                <FaRocket className="text-2xl" />
                                {t('examineFeature')}
                            </button>
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
                            {t('premiumServices')}
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8">
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                {t('ourServices')}
                            </span>
                        </h2>
                        <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-medium leading-relaxed">
                            {t('servicesDesc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* QR Menü */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border-2 border-orange-200 hover:border-orange-300">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaQrcode className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">{t('qrMenuSystem')}</h3>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">{t('qrMenuDesc')}</p>
                        </div>

                        {/* Sipariş Yönetimi */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border-2 border-blue-200 hover:border-blue-300">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaShoppingCart className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">{t('orderManagement')}</h3>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">{t('orderManagementDesc')}</p>
                        </div>

                        {/* AI Görsel Optimizasyon */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border-2 border-purple-200 hover:border-purple-300">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaBrain className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">{t('aiTitle')}</h3>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">{t('aiDesc')}</p>
                        </div>

                        {/* Raporlama */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border-2 border-green-200 hover:border-green-300">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaChartLine className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">{t('detailedReporting')}</h3>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">{t('detailedReportingDesc')}</p>
                        </div>

                        {/* Çoklu Platform */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border-2 border-indigo-200 hover:border-indigo-300">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaGlobe className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">{t('multiPlatform')}</h3>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">{t('multiPlatformDesc')}</p>
                        </div>

                        {/* 7/24 Destek */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border-2 border-red-200 hover:border-red-300">
                            <div className="bg-gradient-to-r from-red-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaHeart className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">{t('support247')}</h3>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">{t('support247Desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Banners Collection - Part 2 */}
            <section className="py-12 bg-white space-y-12 px-4">
                {/* Feature Banner 2: AI Optimization */}
                <div className="max-w-6xl mx-auto w-full bg-gradient-to-r from-[#6d28d9] to-[#4f46e5] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left md:w-2/3">
                            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-full text-sm font-bold mb-8 backdrop-blur-md">
                                <FaBrain className="text-purple-100" />
                                {t('tryNow')}
                            </div>
                            <h3 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">{t('aiBannerTitle')}</h3>
                            <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed">
                                {t('aiBannerDesc')}
                            </p>
                        </div>
                        <div className="md:w-1/3 flex justify-center">
                            <button
                                onClick={() => setShowDemoModal(true)}
                                className="bg-white text-[#6d28d9] px-12 py-6 rounded-3xl text-xl font-black hover:bg-white/90 transition-all shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95"
                            >
                                <FaCamera className="text-2xl" />
                                {t('examineFeature')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modern Benefits Section */}
            <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-full text-lg font-bold mb-6 shadow-xl">
                            <FaFire className="mr-3 text-orange-400" />
                            {t('benefits')}
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight">
                            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {t('whyRestXQr')}
                            </span>
                        </h2>
                        <p className="text-2xl md:text-3xl text-gray-700 max-w-5xl mx-auto font-medium leading-relaxed">
                            {t('whyRestXQrDesc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border border-gray-100">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaChartLine className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">{t('statSales')}</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">{t('salesIncreaseDesc')}</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border border-gray-100">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaClock className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">{t('timeSaving')}</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">{t('timeSavingDesc')}</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border border-gray-100">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaShieldAlt className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">{t('secure100')}</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">{t('secure100Desc')}</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border border-gray-100">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaUsers className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">{t('integrateMenu')}</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">{t('integrateMenuDesc')}</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border border-gray-100">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaRocket className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">{t('fastSetup')}</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">{t('fastSetupDesc')}</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border border-gray-100">
                            <div className="bg-gradient-to-r from-green-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaHeart className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">{t('support247')}</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">{t('support247Desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Banners Stacked */}
            <section className="py-24 bg-white space-y-12 px-4">
                {/* Feature Banner 3: 9 Languages */}
                <div className="max-w-6xl mx-auto w-full bg-gradient-to-r from-[#008f5d] to-[#006b45] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left md:w-2/3">
                            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-full text-sm font-bold mb-8 backdrop-blur-md">
                                <FaGlobe className="text-green-200" />
                                {t('tryNow')}
                            </div>
                            <h3 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">{t('multiLangTitle')}</h3>
                            <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed">
                                {t('multiLangDesc')}
                            </p>
                        </div>
                        <div className="md:w-1/3 flex justify-center">
                            <button
                                onClick={() => setShowDemoModal(true)}
                                className="bg-white text-[#008f5d] px-12 py-6 rounded-3xl text-xl font-black hover:bg-white/90 transition-all shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95"
                            >
                                <FaGlobe className="text-2xl" />
                                {t('examineFeature')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feature Banner 4: All-in-One platform */}
                <div className="max-w-6xl mx-auto w-full bg-gradient-to-r from-[#e63900] to-[#b32d00] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left md:w-2/3">
                            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-2 rounded-full text-sm font-bold mb-8 backdrop-blur-md">
                                <FaRocket className="text-orange-200" />
                                {t('tryNow')}
                            </div>
                            <h3 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">{t('allInOneTitle')}</h3>
                            <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed">
                                {t('allInOneDesc')}
                            </p>
                        </div>
                        <div className="md:w-1/3 flex justify-center">
                            <button
                                onClick={() => setShowDemoModal(true)}
                                className="bg-white text-[#e63900] px-12 py-6 rounded-3xl text-xl font-black hover:bg-white/90 transition-all shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95"
                            >
                                <FaDesktop className="text-2xl" />
                                {t('examineFeature')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Premium Footer */}
            <footer className="bg-slate-950 text-white pt-24 pb-12 border-t border-white/5">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 mb-20">
                        {/* Brand Section */}
                        <div className="lg:col-span-12 xl:col-span-5">
                            <div className="text-4xl font-black tracking-tighter mb-8 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                RestXQr
                            </div>
                            <p className="text-xl text-gray-400 leading-relaxed font-medium max-w-md">
                                {t('footerSlogan')}
                            </p>
                        </div>

                        {/* Contact Buttons Section */}
                        <div className="lg:col-span-6 xl:col-span-4">
                            <h4 className="text-sm font-black tracking-[0.2em] text-gray-500 mb-8 uppercase">
                                {t('contactUs')}
                            </h4>
                            <div className="flex flex-col gap-4">
                                <a
                                    href={`tel:+436608682201`}
                                    className="group flex items-center justify-between bg-white/5 hover:bg-green-500/10 border border-white/10 hover:border-green-500/50 p-5 rounded-2xl transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-green-500/20 p-3 rounded-xl group-hover:bg-green-500 group-hover:text-white transition-all">
                                            <FaPhone className="text-xl" />
                                        </div>
                                        <span className="text-lg font-bold">{t('callUs')}</span>
                                    </div>
                                    <div className="text-gray-500 group-hover:text-green-500 transition-all">
                                        <FaChevronDown className="-rotate-90" />
                                    </div>
                                </a>

                                <a
                                    href={`https://wa.me/436608682201`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-between bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/50 p-5 rounded-2xl transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-emerald-500/20 p-3 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                            <FaWhatsapp className="text-2xl" />
                                        </div>
                                        <span className="text-lg font-bold">WhatsApp</span>
                                    </div>
                                    <div className="text-gray-500 group-hover:text-emerald-500 transition-all">
                                        <FaChevronDown className="-rotate-90" />
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Legal Links Section */}
                        <div className="lg:col-span-6 xl:col-span-3">
                            <h4 className="text-sm font-black tracking-[0.2em] text-gray-500 mb-8 uppercase">
                                {t('legalLinkSection')}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                                <Link href="/cookies" className="block text-lg text-gray-400 hover:text-white font-medium transition-colors">
                                    {t('cookiesPolicy')}
                                </Link>
                                <Link href="/datenschutz" className="block text-lg text-gray-400 hover:text-white font-medium transition-colors">
                                    {t('privacyPolicy')}
                                </Link>
                                <Link href="/terms" className="block text-lg text-gray-400 hover:text-white font-medium transition-colors">
                                    {t('termsOfService')}
                                </Link>
                                <Link href="/impressum" className="block text-lg text-gray-400 hover:text-white font-medium transition-colors">
                                    {t('legalInfo')}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 text-center">
                        <div className="text-gray-500 font-medium italic">
                            &copy; {new Date().getFullYear()} RestXQr. {t('allRightsReserved')}
                        </div>
                    </div>
                </div>
            </footer>

            {/* Demo Request Modal */}
            <DemoRequestModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
        </main>
    );
}
