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

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-12">
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20 transform hover:scale-105 transition-all duration-300">
                            <div className="text-4xl md:text-5xl font-black text-green-400 mb-3">%300</div>
                            <div className="text-lg md:text-xl text-gray-200 font-bold">{t('statSales')}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20 transform hover:scale-105 transition-all duration-300">
                            <div className="text-4xl md:text-5xl font-black text-blue-400 mb-3">AI</div>
                            <div className="text-lg md:text-xl text-gray-200 font-bold">{t('statAI')}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/20 transform hover:scale-105 transition-all duration-300">
                            <div className="text-4xl md:text-5xl font-black text-purple-400 mb-3">24/7</div>
                            <div className="text-lg md:text-xl text-gray-200 font-bold">{t('statSupport')}</div>
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

            {/* Feature Banner 1: Multi-Branch */}
            <section className="py-12 bg-white flex justify-center px-4">
                <div className="max-w-6xl w-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left md:w-2/3">
                            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 backdrop-blur-md">
                                <FaRocket className="animate-bounce" />
                                {t('tryNowTitle')}
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">{t('multiBranchTitle')}</h3>
                            <p className="text-xl text-blue-50/80 font-medium leading-relaxed">
                                {t('multiBranchDesc')}
                            </p>
                        </div>
                        <div className="md:w-1/3 flex justify-center">
                            <button
                                onClick={() => setShowDemoModal(true)}
                                className="bg-white text-blue-700 px-10 py-5 rounded-2xl text-xl font-black hover:bg-blue-50 transition-all shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 border-b-4 border-blue-100"
                            >
                                <FaMagic className="text-blue-500" />
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

            {/* Feature Banner 2: AI Optimization */}
            <section className="py-12 bg-white flex justify-center px-4">
                <div className="max-w-6xl w-full bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mb-32 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left md:w-2/3">
                            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 backdrop-blur-md">
                                <FaBrain className="animate-pulse" />
                                {t('tryNowTitle')}
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">{t('aiBannerTitle')}</h3>
                            <p className="text-xl text-purple-50/80 font-medium leading-relaxed">
                                {t('aiBannerDesc')}
                            </p>
                        </div>
                        <div className="md:w-1/3 flex justify-center">
                            <button
                                onClick={() => setShowDemoModal(true)}
                                className="bg-white text-purple-700 px-10 py-5 rounded-2xl text-xl font-black hover:bg-purple-50 transition-all shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 border-b-4 border-purple-100"
                            >
                                <FaCamera className="text-purple-500" />
                                {t('examineFeature')}
                            </button>
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
                            {t('benefits')}
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8">
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {t('whyRestXQr')}
                            </span>
                        </h2>
                        <p className="text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed">
                            {t('whyRestXQrDesc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaChartLine className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4">%300 {t('statSales')}</h3>
                            <p className="text-gray-300 text-lg leading-relaxed">{t('salesIncreaseDesc')}</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaClock className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4">{t('timeSaving')}</h3>
                            <p className="text-gray-300 text-lg leading-relaxed">{t('timeSavingDesc')}</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaShieldAlt className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4">{t('secure100')}</h3>
                            <p className="text-gray-300 text-lg leading-relaxed">{t('secure100Desc')}</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaUsers className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4">{t('integrateMenu')}</h3>
                            <p className="text-gray-300 text-lg leading-relaxed">{t('integrateMenuDesc')}</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaRocket className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4">{t('fastSetup')}</h3>
                            <p className="text-gray-300 text-lg leading-relaxed">{t('fastSetupDesc')}</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
                            <div className="bg-gradient-to-r from-green-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                                <FaHeart className="text-white text-2xl" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4">{t('support247')}</h3>
                            <p className="text-gray-300 text-lg leading-relaxed">{t('support247Desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Banner 3: 9 Languages */}
            <section className="py-12 bg-white flex justify-center px-4">
                <div className="max-w-6xl w-full bg-gradient-to-r from-green-600 to-teal-700 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left md:w-2/3">
                            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 backdrop-blur-md">
                                <FaGlobe className="animate-spin-slow" />
                                {t('tryNowTitle')}
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">{t('multiLangTitle')}</h3>
                            <p className="text-xl text-green-50/80 font-medium leading-relaxed">
                                {t('multiLangDesc')}
                            </p>
                        </div>
                        <div className="md:w-1/3 flex justify-center">
                            <button
                                onClick={() => setShowDemoModal(true)}
                                className="bg-white text-green-700 px-10 py-5 rounded-2xl text-xl font-black hover:bg-green-50 transition-all shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 border-b-4 border-green-100"
                            >
                                <FaGlobe className="text-green-500" />
                                {t('examineFeature')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Banner 4: All-in-One platform */}
            <section className="py-12 bg-white flex justify-center px-4">
                <div className="max-w-6xl w-full bg-gradient-to-r from-orange-600 to-red-600 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mb-32 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left md:w-2/3">
                            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 backdrop-blur-md">
                                <FaChartLine className="animate-pulse" />
                                {t('tryNowTitle')}
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">{t('allInOneTitle')}</h3>
                            <p className="text-xl text-orange-50/80 font-medium leading-relaxed">
                                {t('allInOneDesc')}
                            </p>
                        </div>
                        <div className="md:w-1/3 flex justify-center">
                            <button
                                onClick={() => setShowDemoModal(true)}
                                className="bg-white text-orange-700 px-10 py-5 rounded-2xl text-xl font-black hover:bg-orange-50 transition-all shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 border-b-4 border-orange-100"
                            >
                                <FaDesktop className="text-orange-500" />
                                {t('examineFeature')}
                            </button>
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
                            {t('faq')}
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8">
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                {t('curiosities')}
                            </span>
                        </h2>
                        <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-medium leading-relaxed">
                            <span className="font-black text-gray-900">{t('faqDesc')}</span>
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
                            {t('startNow')}
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8">
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {t('digitizeRestaurant')}
                            </span>
                        </h2>

                        <p className="text-3xl text-gray-200 mb-12 leading-relaxed font-medium">
                            {t('startToday')}
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-8 mb-16">
                            <button
                                onClick={() => setShowDemoModal(true)}
                                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 md:px-12 md:py-6 rounded-3xl text-lg md:text-xl font-black flex items-center justify-center gap-4 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 hover:from-blue-500 hover:to-purple-500"
                            >
                                <FaUsers className="text-2xl group-hover:animate-bounce" />
                                <span>{t('requestDemo')}</span>
                            </button>
                            <button
                                onClick={() => setShowDemoModal(true)}
                                className="group bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white px-8 py-4 md:px-12 md:py-6 rounded-3xl text-lg md:text-xl font-black transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105"
                            >
                                <FaPhone className="inline mr-4 text-2xl group-hover:animate-bounce" />
                                <span>{t('contactNow')}</span>
                            </button>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                                <a href={`tel:+436608682201`} className="block hover:scale-105 transition-transform">
                                    <FaPhone className="text-3xl text-green-400 mb-4 mx-auto" />
                                    <div className="text-xl font-bold text-white mb-2">{t('phone')}</div>
                                    <div className="text-gray-300">{t('phoneNumber')}</div>
                                </a>
                            </div>
                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                                <a href={`https://wa.me/436608682201`} target="_blank" rel="noopener noreferrer" className="block hover:scale-105 transition-transform">
                                    <FaWhatsapp className="text-3xl text-green-400 mb-4 mx-auto" />
                                    <div className="text-xl font-bold text-white mb-2">WhatsApp</div>
                                    <div className="text-gray-300">+43 660 868 22 01</div>
                                </a>
                            </div>
                            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                                <FaGlobe className="text-3xl text-blue-400 mb-4 mx-auto" />
                                <div className="text-xl font-bold text-white mb-2">{t('website')}</div>
                                <div className="text-gray-300">www.restxqr.com</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">restXqr</h3>
                            <p className="text-gray-400">
                                {language === 'de'
                                    ? 'Moderne QR-Menü-Lösung für Restaurants'
                                    : language === 'en'
                                        ? 'Modern QR menu solution for restaurants'
                                        : 'Restoranlar için modern QR menü çözümü'}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">
                                {language === 'de' ? 'Kontakt' : language === 'en' ? 'Contact' : 'İletişim'}
                            </h3>
                            <div className="space-y-2 text-gray-400">
                                <p>
                                    <a href="tel:+436608682201" className="hover:text-white transition-colors">+43 660 868 22 01</a>
                                </p>
                                <p>
                                    <a href="https://wa.me/436608682201" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a>
                                </p>
                                <p>
                                    <a href="mailto:info@restxqr.com" className="hover:text-white transition-colors">info@restxqr.com</a>
                                </p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">
                                {language === 'de' ? 'Rechtliches' : language === 'en' ? 'Legal' : 'Yasal'}
                            </h3>
                            <div className="space-y-2">
                                <Link href="/cookies" className="block text-gray-400 hover:text-white transition-colors">
                                    {language === 'de' ? 'Cookie-Richtlinie' : language === 'en' ? 'Cookie Policy' : 'Çerez Politikası'}
                                </Link>
                                <Link href="/datenschutz" className="block text-gray-400 hover:text-white transition-colors">
                                    {language === 'de' ? 'Datenschutzerklärung' : language === 'en' ? 'Privacy Policy' : 'Gizlilik Politikası'}
                                </Link>
                                <Link href="/impressum" className="block text-gray-400 hover:text-white transition-colors">
                                    {language === 'de' ? 'Impressum' : language === 'en' ? 'Legal Information' : 'Yasal Bilgiler'}
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
                        <p>&copy; {new Date().getFullYear()} restXqr. {language === 'de' ? 'Alle Rechte vorbehalten.' : language === 'en' ? 'All rights reserved.' : 'Tüm hakları saklıdır.'}</p>
                    </div>
                </div>
            </footer>

            {/* Demo Request Modal */}
            <DemoRequestModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
        </main>
    );
}
