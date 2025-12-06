'use client';

import Link from 'next/link';
import { FaBell, FaUtensils, FaDollarSign, FaBuilding, FaArrowLeft, FaCheckCircle, FaUsers, FaChartLine, FaClock, FaShieldAlt, FaPlus, FaStar, FaRocket, FaGem, FaFire, FaHeart, FaGlobe, FaMobile, FaTablet, FaDesktop, FaQrcode, FaSearch, FaGift, FaCommentDots, FaMagic, FaBrain, FaCamera, FaLightbulb, FaPhone, FaWhatsapp } from 'react-icons/fa';
import useLanguageStore from '@/store/useLanguageStore';

export default function PanelsContent() {
    const { t } = useLanguageStore();

    return (
        <main className="min-h-screen bg-white relative overflow-hidden">
            {/* Modern Header */}
            <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="container mx-auto px-4 py-8 relative z-10">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="group flex items-center text-white/80 hover:text-white transition-all duration-300 hover:scale-105">
                            <FaArrowLeft className="mr-3 group-hover:animate-bounce" />
                            <span className="font-bold text-lg">{t('backToHome')}</span>
                        </Link>
                        <div className="text-center">
                            <div className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-full text-lg font-bold mb-4 backdrop-blur-xl border border-white/20">
                                <FaGem className="mr-3 text-yellow-300" />
                                {t('restxqrPanels')}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-2">
                                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    {t('restaurantOperations')}
                                </span>
                            </h1>
                            <p className="text-xl text-gray-200 font-medium">{t('manageSinglePlatform')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Hero Section */}
            <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-bold mb-6 shadow-lg">
                        <FaRocket className="mr-3 animate-bounce" />
                        {t('managementPanels')}
                    </div>

                    <h2 className="text-6xl font-black text-gray-900 mb-8">
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {t('restaurantManagementPanels')}
                        </span>
                    </h2>

                    <p className="text-3xl text-gray-700 max-w-5xl mx-auto font-bold leading-relaxed">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RestXQr</span> {t('manageAllOperations')}
                        <br />
                        <span className="text-gray-600 font-medium">{t('increaseEfficiency')}</span>
                    </p>
                </div>
            </section>

            {/* Modern Panels Grid */}
            <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl mx-auto">

                        {/* Garson Paneli */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
                            <div className="flex items-center mb-8">
                                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-20 h-20 rounded-2xl flex items-center justify-center mr-6 group-hover:animate-bounce">
                                    <FaBell className="text-white text-3xl" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black mb-3">{t('waiterPanel')}</h3>
                                    <p className="text-blue-200 text-lg font-medium">{t('waiterPanelDesc')}</p>
                                </div>
                            </div>
                            <ul className="space-y-4 mb-10">
                                <li className="flex items-center text-lg">
                                    <FaCheckCircle className="text-green-400 mr-4 text-xl" />
                                    <span>{t('realTimeOrderTracking')}</span>
                                </li>
                                <li className="flex items-center text-lg">
                                    <FaCheckCircle className="text-green-400 mr-4 text-xl" />
                                    <span>{t('customerCallNotifications')}</span>
                                </li>
                                <li className="flex items-center text-lg">
                                    <FaCheckCircle className="text-green-400 mr-4 text-xl" />
                                    <span>{t('orderStatusUpdate')}</span>
                                </li>
                                <li className="flex items-center text-lg">
                                    <FaCheckCircle className="text-green-400 mr-4 text-xl" />
                                    <span>{t('tableManagement')}</span>
                                </li>
                            </ul>
                            <Link href="/demo-paneller/garson" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-2xl text-base font-black hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 inline-block group-hover:scale-105">
                                <FaRocket className="inline mr-2" />
                                {t('viewDemoPanel')}
                            </Link>
                        </div>

                        {/* Mutfak Paneli */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
                            <div className="flex items-center mb-8">
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 w-20 h-20 rounded-2xl flex items-center justify-center mr-6 group-hover:animate-bounce">
                                    <FaUtensils className="text-white text-3xl" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black mb-3">{t('kitchenPanel')}</h3>
                                    <p className="text-orange-200 text-lg font-medium">{t('kitchenPanelDesc')}</p>
                                </div>
                            </div>
                            <ul className="space-y-4 mb-10">
                                <li className="flex items-center text-lg">
                                    <FaCheckCircle className="text-green-400 mr-4 text-xl" />
                                    <span>{t('orderQueueManagement')}</span>
                                </li>
                                <li className="flex items-center text-lg">
                                    <FaCheckCircle className="text-green-400 mr-4 text-xl" />
                                    <span>{t('prepTimeTracking')}</span>
                                </li>
                                <li className="flex items-center text-lg">
                                    <FaCheckCircle className="text-green-400 mr-4 text-xl" />
                                    <span>{t('stockAlerts')}</span>
                                </li>
                                <li className="flex items-center text-lg">
                                    <FaCheckCircle className="text-green-400 mr-4 text-xl" />
                                    <span>{t('autoNotifications')}</span>
                                </li>
                            </ul>
                            <Link href="/demo-paneller/mutfak" className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-2xl text-base font-black hover:from-orange-500 hover:to-red-500 transition-all duration-300 shadow-lg hover:shadow-orange-500/25 inline-block group-hover:scale-105">
                                <FaRocket className="inline mr-2" />
                                {t('viewDemoPanel')}
                            </Link>
                        </div>

                        {/* Kasa Paneli */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
                            <div className="flex items-center mb-8">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-20 h-20 rounded-2xl flex items-center justify-center mr-6 group-hover:animate-bounce">
                                    <FaDollarSign className="text-white text-3xl" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black mb-3">{t('cashierPanel')}</h3>
                                    <p className="text-green-200 text-lg font-medium">{t('cashierPanelDesc')}</p>
                                </div>
                            </div>
                            <ul className="space-y-4 mb-10">
                                <li className="flex items-center text-lg">
                                    <FaCheckCircle className="text-green-400 mr-4 text-xl" />
                                    <span>{t('paymentProcessing')}</span>
                                </li>
                                <li className="flex items-center text-lg">
                                    <FaCheckCircle className="text-green-400 mr-4 text-xl" />
                                    <span>{t('invoicePrinting')}</span>
                                </li>
                                <li className="flex items-center text-lg">
                                    <FaCheckCircle className="text-green-400 mr-4 text-xl" />
                                    <span>{t('dailyReports')}</span>
                                </li>
                                <li className="flex items-center text-lg">
                                    <FaCheckCircle className="text-green-400 mr-4 text-xl" />
                                    <span>{t('paymentAnalysis')}</span>
                                </li>
                            </ul>
                            <Link href="/demo-paneller/kasa" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl text-base font-black hover:from-green-500 hover:to-emerald-500 transition-all duration-300 shadow-lg hover:shadow-green-500/25 inline-block group-hover:scale-105">
                                <FaRocket className="inline mr-2" />
                                {t('viewDemoPanel')}
                            </Link>
                        </div>

                        {/* İşletme Paneli */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
                            <div className="flex items-center mb-8">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-2xl flex items-center justify-center mr-6 group-hover:animate-bounce">
                                    <FaBuilding className="text-white text-3xl" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black mb-3">{t('businessPanel')}</h3>
                                    <p className="text-purple-200 text-lg font-medium">{t('businessPanelDesc')}</p>
                                </div>
                            </div>
                            <ul className="space-y-4 mb-10">
                                <li className="flex items-center text-lg">
                                    <FaCheckCircle className="text-green-400 mr-4 text-xl" />
                                    <span>{t('detailedSalesAnalysis')}</span>
                                </li>
                                <li className="flex items-center text-lg">
                                    <FaCheckCircle className="text-green-400 mr-4 text-xl" />
                                    <span>{t('menuManagement')}</span>
                                </li>
                                <li className="flex items-center text-lg">
                                    <FaCheckCircle className="text-green-400 mr-4 text-xl" />
                                    <span>{t('staffPerformance')}</span>
                                </li>
                                <li className="flex items-center text-lg">
                                    <FaCheckCircle className="text-green-400 mr-4 text-xl" />
                                    <span>{t('customerAnalytics')}</span>
                                </li>
                            </ul>
                            <Link href="/demo-paneller/isletme/dashboard" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl text-lg font-black hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 inline-block group-hover:scale-105">
                                {t('viewDemoPanel')}
                            </Link>
                        </div>

                    </div>
                </div>
            </section>

            {/* Modern Demo Menu Section */}
            <section className="py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-lg font-bold mb-6 shadow-lg">
                            <FaQrcode className="mr-3 animate-pulse" />
                            {t('demoMenu')}
                        </div>
                        <h2 className="text-6xl font-black text-gray-900 mb-8">
                            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                                {t('qrMenuSystem')}
                            </span>
                        </h2>
                        <p className="text-3xl text-gray-700 max-w-5xl mx-auto font-bold leading-relaxed">
                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">RestXQr</span> {t('checkDemoMenuDesc')}
                        </p>
                    </div>

                    {/* Demo Menu Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        <div className="bg-white p-8 rounded-3xl shadow-xl text-center border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce">
                                <FaSearch className="text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-4">{t('search')}</h3>
                            <p className="text-gray-600 text-lg">{t('searchDesc')}</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-xl text-center border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce">
                                <FaGift className="text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-4">{t('campaigns')}</h3>
                            <p className="text-gray-600 text-lg">{t('campaignsDesc')}</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-xl text-center border-2 border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce">
                                <FaUtensils className="text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-4">{t('soupOfTheDay')}</h3>
                            <p className="text-gray-600 text-lg">{t('soupOfTheDayDesc')}</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-xl text-center border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce">
                                <FaCommentDots className="text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-4">{t('reviews')}</h3>
                            <p className="text-gray-600 text-lg">{t('reviewsDesc')}</p>
                        </div>
                    </div>

                    {/* Demo Menu Items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">

                        {/* Demo Item 1 */}
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105 group border-2 border-orange-200 hover:border-orange-300">
                            <div className="h-56 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center relative">
                                <span className="text-white text-8xl group-hover:scale-110 transition-transform duration-300">🍲</span>
                                <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                    <span className="text-white text-sm font-bold">{t('popular')}</span>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-black text-gray-900 mb-3">{t('soupOfTheDay')}</h3>
                                <p className="text-gray-600 mb-6 text-lg">{t('soupDesc')}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-black text-orange-600">₺25</span>
                                    <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-orange-500/25">
                                        <FaPlus className="inline mr-2" />
                                        {t('addToCart')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Demo Item 2 */}
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105 group border-2 border-green-200 hover:border-green-300">
                            <div className="h-56 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center relative">
                                <span className="text-white text-8xl group-hover:scale-110 transition-transform duration-300">🎉</span>
                                <div className="absolute top-6 right-6 bg-red-500 rounded-full px-4 py-2">
                                    <span className="text-white text-sm font-bold">{t('discount20')}</span>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-black text-gray-900 mb-3">{t('specialToday')}</h3>
                                <p className="text-gray-600 mb-6 text-lg">{t('specialTodayDesc')}</p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xl text-gray-400 line-through">₺22</span>
                                        <span className="text-3xl font-black text-green-600 ml-3">₺18</span>
                                    </div>
                                    <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-green-500/25">
                                        <FaPlus className="inline mr-2" />
                                        {t('addToCart')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Demo Item 3 */}
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105 group border-2 border-blue-200 hover:border-blue-300">
                            <div className="h-56 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center relative">
                                <span className="text-white text-8xl group-hover:scale-110 transition-transform duration-300">⭐</span>
                                <div className="absolute top-6 right-6 bg-yellow-400 rounded-full px-4 py-2">
                                    <span className="text-white text-sm font-bold">5.0</span>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-black text-gray-900 mb-3">{t('rateOnGoogle')}</h3>
                                <p className="text-gray-600 mb-6 text-lg">{t('makeComment')}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-black text-blue-600">{t('free')}</span>
                                    <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-blue-500/25">
                                        <FaStar className="inline mr-2" />
                                        {t('rate')}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Demo Menu CTA */}
                    <div className="text-center">
                        <Link href="https://aksaray.restxqr.com/menu/" className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white px-12 py-6 rounded-3xl text-xl font-black hover:from-purple-500 hover:via-blue-500 hover:to-pink-500 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 inline-block transform hover:scale-105">
                            <FaQrcode className="inline mr-3" />
                            {t('viewDemoMenu')}
                        </Link>
                        <p className="text-gray-600 mt-6 text-lg font-medium">
                            {t('visitDemoPage')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Modern Why Section */}
            <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-full text-lg font-bold mb-6 backdrop-blur-xl border border-white/20">
                            <FaLightbulb className="mr-3 text-yellow-400" />
                            {t('whyRestXQr')}
                        </div>
                        <h2 className="text-6xl font-black mb-8">
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {t('whyRestXQrPanels')}
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">

                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:animate-bounce">
                                <FaUsers className="text-white text-3xl" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-6">
                                {t('multiUserSupport')}
                            </h3>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                {t('multiUserSupportDesc')}
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:animate-bounce">
                                <FaChartLine className="text-white text-3xl" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-6">
                                {t('realTimeAnalytics')}
                            </h3>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                {t('realTimeAnalyticsDesc')}
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:animate-bounce">
                                <FaShieldAlt className="text-white text-3xl" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-6">
                                {t('secureAndStable')}
                            </h3>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                {t('secureAndStableDesc')}
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Modern CTA Section */}
            <section className="py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-lg font-bold mb-8 shadow-lg">
                            <FaRocket className="mr-3 text-orange-400 animate-bounce" />
                            {t('startNow')}
                        </div>

                        <h2 className="text-6xl font-black mb-8">
                            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                                {t('startNow')}!
                            </span>
                        </h2>

                        <p className="text-3xl text-gray-700 mb-12 leading-relaxed font-bold">
                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">RestXQr</span> {t('tryFree14Days')}
                            <br />
                            <span className="text-gray-600 font-medium">{t('increaseEfficiency')}</span>
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-8 mb-16">
                            <Link href="/menu" className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-6 rounded-3xl text-xl font-black flex items-center justify-center gap-4 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 hover:from-blue-500 hover:to-purple-500">
                                <FaQrcode className="text-2xl group-hover:animate-bounce" />
                                <span>{t('viewMenu')}</span>
                            </Link>
                            <a href={`tel:${t('phoneNumber').replace(/\s/g, '')}`} className="group bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white px-12 py-6 rounded-3xl text-xl font-black transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105">
                                <FaPhone className="inline mr-4 text-2xl group-hover:animate-bounce" />
                                <span>{t('callNow')}</span>
                            </a>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
                                <FaPhone className="text-3xl text-green-400 mb-4 mx-auto" />
                                <div className="text-xl font-bold text-gray-900 mb-2">{t('phone')}</div>
                                <div className="text-gray-600">{t('phoneNumber')}</div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
                                <FaWhatsapp className="text-3xl text-green-400 mb-4 mx-auto" />
                                <div className="text-xl font-bold text-gray-900 mb-2">WhatsApp</div>
                                <div className="text-gray-600">{t('phoneNumber')}</div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
                                <FaGlobe className="text-3xl text-blue-400 mb-4 mx-auto" />
                                <div className="text-xl font-bold text-gray-900 mb-2">{t('website')}</div>
                                <div className="text-gray-600">www.restxqr.com</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}
