'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FaQrcode, FaUtensils, FaShoppingCart, FaBell, FaMagic, FaChartLine, FaUsers, FaClock, FaCheckCircle, FaRocket, FaShieldAlt, FaStar, FaPhone, FaWhatsapp, FaChevronDown, FaBrain, FaCamera, FaGem, FaFire, FaHeart, FaGlobe, FaDesktop } from 'react-icons/fa';
import useLanguageStore from '@/store/useLanguageStore';
import LandingLanguageToggle from '@/components/LandingLanguageToggle';
import DemoRequestModal from '@/components/DemoRequestModal';

export default function HomeContent() {
    const { t } = useLanguageStore();
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);
    const [showDemoModal, setShowDemoModal] = useState(false);

    const toggleFAQ = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    const faqs = [
        { icon: FaQrcode, color: "orange-500", question: t('faq1Q'), answer: t('faq1A') },
        { icon: FaRocket, color: "blue-500", question: t('faq2Q'), answer: t('faq2A') },
        { icon: FaShieldAlt, color: "green-500", question: t('faq3Q'), answer: t('faq3A') },
        { icon: FaShoppingCart, color: "purple-500", question: t('faq4Q'), answer: t('faq4A') },
        { icon: FaPhone, color: "red-500", question: t('faq5Q'), answer: t('faq5A') },
        { icon: FaClock, color: "yellow-500", question: t('faq6Q'), answer: t('faq6A') },
        { icon: FaUtensils, color: "indigo-500", question: t('faq7Q'), answer: t('faq7A') },
        { icon: FaChartLine, color: "pink-500", question: t('faq8Q'), answer: t('faq8A') }
    ];

    return (
        <main className="min-h-screen bg-white relative overflow-hidden">
            <LandingLanguageToggle />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden pt-20">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
                </div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center px-8 py-4 bg-white/10 rounded-full shadow-2xl mb-8 text-xl font-bold backdrop-blur-xl border border-white/20">
                        <FaStar className="text-yellow-300 mr-3 animate-spin" />
                        <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                            {t('heroBadge')}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-8 leading-tight">
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{t('heroTitle1')}</span>
                        <br /><span className="text-white">{t('heroTitle2')}</span>
                        <br /><span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">{t('heroTitle3')}</span>
                    </h1>

                    <p className="text-2xl md:text-3xl mb-12 text-gray-200 leading-relaxed max-w-5xl mx-auto font-medium">
                        🚀 <span className="text-white font-bold">{t('heroSubtitle1')}</span>
                        <br /><span className="text-gray-300">{t('heroSubtitle2')}</span>
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-4xl mx-auto mb-16">
                        <button
                            onClick={() => setShowDemoModal(true)}
                            className="flex-1 min-w-[280px] group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-6 rounded-3xl text-xl font-black flex items-center justify-center gap-4 transition-all shadow-2xl hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                            <FaUsers className="text-2xl" />
                            <span>{t('requestDemo')}</span>
                        </button>
                        <button
                            onClick={() => setShowDemoModal(true)}
                            className="flex-1 min-w-[280px] group bg-gradient-to-r from-green-600 to-blue-600 text-white px-10 py-6 rounded-3xl text-xl font-black flex items-center justify-center gap-4 transition-all shadow-2xl hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                            <FaRocket className="text-2xl" />
                            <span>{t('startNow')}</span>
                        </button>
                    </div>

                    {/* Stats Metrics - Bold Minimalism */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto mb-16">
                        {[
                            { label: "ROI", title: t('statSales'), bg: "from-green-500 to-emerald-600", text: "text-green-400" },
                            { label: "AI", title: t('statAI'), bg: "from-blue-500 to-indigo-600", text: "text-blue-400" },
                            { label: "24/7", title: t('statSupport'), bg: "from-purple-500 to-pink-600", text: "text-purple-400" }
                        ].map((stat, i) => (
                            <div key={i} className="relative group h-full">
                                <div className={`absolute -inset-1 bg-gradient-to-r ${stat.bg} rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-500`}></div>
                                <div className="relative h-full bg-black/40 backdrop-blur-3xl rounded-[2rem] p-12 border border-white/10 hover:border-white/20 transition-all flex flex-col items-center justify-center text-center">
                                    <div className={`text-sm font-black tracking-[0.4em] ${stat.text} mb-6 uppercase opacity-80`}>{stat.label}</div>
                                    <div className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight uppercase tracking-tighter">{stat.title}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Value Section - Bolder Minimalism */}
            <section className="py-32 bg-slate-50 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-full text-xl font-black mb-8 shadow-xl">
                            <FaChartLine className="mr-3" />
                            {t('efficiencyBadge')}
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-tight tracking-tighter">{t('marketingSectionTitle')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
                        {[
                            { icon: FaBell, title: t('marketingAdsTitle'), bg: "bg-blue-500", border: "hover:border-blue-500" },
                            { icon: FaUsers, title: t('waiterCallEfficiencyTitle'), bg: "bg-indigo-500", border: "hover:border-indigo-500" },
                            { icon: FaGem, title: t('tailoredSolutionsTitle'), bg: "bg-purple-500", border: "hover:border-purple-500" }
                        ].map((item, i) => (
                            <div key={i} className="h-full">
                                <div className={`h-full bg-white p-14 rounded-[3rem] shadow-2xl border-b-[12px] border-transparent ${item.border} transition-all group flex flex-col items-center text-center`}>
                                    <div className={`${item.bg} w-24 h-24 rounded-3xl flex items-center justify-center mb-10 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 text-white text-4xl`}>
                                        <item.icon />
                                    </div>
                                    <h3 className="text-3xl font-black uppercase tracking-tight leading-tight">{item.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Consolidated Features - Massive Titles */}
            <section className="py-24 bg-white px-4">
                <div className="container mx-auto max-w-6xl mb-16">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="h-0.5 flex-1 bg-gray-100"></div>
                        <span className="text-lg font-black text-blue-600 tracking-[0.4em] uppercase">{t('heroBadge')}</span>
                        <div className="h-0.5 flex-1 bg-gray-100"></div>
                    </div>
                </div>

                <div className="space-y-10">
                    {[
                        { title: t('multiBranchTitle'), gradient: "from-[#1e40af] to-[#2563eb]", icon: FaRocket, btnColor: "text-[#1e40af]" },
                        { title: t('aiBannerTitle'), gradient: "from-[#6d28d9] to-[#4f46e5]", icon: FaBrain, btnColor: "text-[#6d28d9]" },
                        { title: t('multiLangTitle'), gradient: "from-[#008f5d] to-[#006b45]", icon: FaGlobe, btnColor: "text-[#008f5d]" },
                        { title: t('allInOneTitle'), gradient: "from-[#e63900] to-[#b32d00]", icon: FaDesktop, btnColor: "text-[#e63900]" }
                    ].map((feature, i) => (
                        <div key={i} className={`max-w-6xl mx-auto w-full bg-gradient-to-r ${feature.gradient} rounded-[2.5rem] p-12 md:p-20 shadow-2xl relative overflow-hidden group border border-white/5`}>
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-[100px] transition-transform duration-1000 group-hover:scale-150"></div>

                            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                                <div className="text-center lg:text-left flex-1">
                                    <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">{feature.title}</h3>
                                </div>
                                <div className="lg:w-1/3 flex justify-center lg:justify-end">
                                    <button
                                        onClick={() => setShowDemoModal(true)}
                                        className={`bg-white ${feature.btnColor} w-full md:w-72 py-6 rounded-3xl text-2xl font-black shadow-2xl hover:shadow-[0_20px_50px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-4 hover:-translate-y-2 active:scale-95 whitespace-nowrap`}
                                    >
                                        <feature.icon className="text-3xl" />
                                        {t('examineFeature')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Services - Bolder Titles */}
            <section className="py-32 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20 text-center">
                        <div className="inline-flex items-center px-8 py-3 bg-blue-600/10 text-blue-600 rounded-full text-lg font-black mb-8 uppercase tracking-widest">
                            {t('premiumServices')}
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">{t('ourServices')}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
                        {[
                            { icon: FaQrcode, title: t('qrMenuSystem'), bg: "bg-orange-500", border: "border-orange-100" },
                            { icon: FaShoppingCart, title: t('orderManagement'), bg: "bg-blue-500", border: "border-blue-100" },
                            { icon: FaBrain, title: t('aiTitle'), bg: "bg-purple-500", border: "border-purple-100" },
                            { icon: FaChartLine, title: t('detailedReporting'), bg: "bg-green-500", border: "border-green-100" },
                            { icon: FaGlobe, title: t('multiPlatform'), bg: "bg-indigo-500", border: "border-indigo-100" },
                            { icon: FaHeart, title: t('support247'), bg: "bg-red-500", border: "border-red-100" }
                        ].map((s, i) => (
                            <div key={i} className="h-full">
                                <div className={`h-full bg-white p-14 rounded-[3rem] shadow-xl border-2 ${s.border} hover:border-transparent hover:shadow-2xl transition-all duration-500 group flex flex-col items-center text-center`}>
                                    <div className={`${s.bg} w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-10 text-white text-4xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl`}>
                                        <s.icon />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-tight">{s.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4">{t('faq')}</h2>
                        <p className="text-xl text-gray-600">{t('faqDesc')}</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border border-gray-100 rounded-2xl bg-gray-50 overflow-hidden">
                                <button onClick={() => toggleFAQ(i)} className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-100 transition-all">
                                    <div className="flex items-center gap-4">
                                        <faq.icon className="text-blue-600 text-xl" />
                                        <span className="font-bold text-lg">{faq.question}</span>
                                    </div>
                                    <FaChevronDown className={`transition-transform duration-300 ${openFAQ === i ? 'rotate-180' : ''}`} />
                                </button>
                                {openFAQ === i && (
                                    <div className="p-6 pt-0 text-gray-600 font-medium border-t border-gray-100">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-white pt-24 pb-12 border-t border-white/5">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-16">
                        <div>
                            <div className="text-4xl font-black tracking-tighter mb-8 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">RestXQr</div>
                            <p className="text-xl text-gray-400 leading-relaxed font-medium max-w-md">{t('footerSlogan')}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                            <div>
                                <h4 className="text-sm font-black text-gray-500 mb-8 uppercase tracking-[0.2em]">{t('contactUs')}</h4>
                                <div className="space-y-4">
                                    <a href="tel:+436608682201" className="flex items-center gap-4 text-gray-300 hover:text-white transition-all">
                                        <FaPhone className="text-green-500" /> +43 660 868 22 01
                                    </a>
                                    <a href="https://wa.me/436608682201" className="flex items-center gap-4 text-gray-300 hover:text-white transition-all">
                                        <FaWhatsapp className="text-emerald-500" /> WhatsApp
                                    </a>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-gray-500 mb-8 uppercase tracking-[0.2em]">{t('legalLinkSection')}</h4>
                                <div className="flex flex-col gap-4 text-gray-400 font-medium">
                                    <Link href="/datenschutz" className="hover:text-white">{t('privacyPolicy')}</Link>
                                    <Link href="/terms" className="hover:text-white">{t('termsOfService')}</Link>
                                    <Link href="/impressum" className="hover:text-white">{t('legalInfo')}</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 text-center text-gray-500 italic">
                        &copy; {new Date().getFullYear()} RestXQr. {t('allRightsReserved')}
                    </div>
                </div>
            </footer>

            <DemoRequestModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
        </main>
    );
}
