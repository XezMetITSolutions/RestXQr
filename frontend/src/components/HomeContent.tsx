'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaQrcode, FaUtensils, FaShoppingCart, FaBell, FaMagic,
    FaChartLine, FaUsers, FaClock, FaCheckCircle, FaRocket,
    FaShieldAlt, FaStar, FaPhone, FaWhatsapp, FaChevronDown,
    FaBrain, FaCamera, FaGem, FaFire, FaHeart, FaGlobe, FaDesktop,
    FaArrowRight, FaCogs, FaCreditCard, FaLayerGroup
} from 'react-icons/fa';
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

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <main className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-purple-100 selection:text-purple-900">
            <LandingLanguageToggle />

            {/* Hero Section */}
            <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center bg-[#0B0F1A] text-white overflow-hidden pt-20">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
                </div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 mb-8 shadow-2xl"
                    >
                        <FaStar className="text-yellow-400 mr-3 animate-pulse" />
                        <span className="text-sm md:text-lg font-bold tracking-wide uppercase bg-gradient-to-r from-yellow-200 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
                            {t('heroBadge')}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tight"
                    >
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{t('heroTitle1')}</span>
                        <br /><span className="text-white drop-shadow-sm">{t('heroTitle2')}</span>
                        <br /><span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t('heroTitle3')}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-2xl mb-12 text-slate-300 leading-relaxed max-w-4xl mx-auto font-medium px-4"
                    >
                        🚀 <span className="text-white font-bold">{t('heroSubtitle1')}</span>
                        <br className="hidden md:block" />
                        <span className="text-slate-400">{t('heroSubtitle2')}</span>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 px-4 mb-20"
                    >
                        <button
                            onClick={() => setShowDemoModal(true)}
                            className="group relative px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl md:rounded-3xl font-black text-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(37,99,235,0.3)]"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span className="relative flex items-center justify-center gap-3">
                                <FaUsers className="text-2xl" /> {t('requestDemo')}
                            </span>
                        </button>
                        <button
                            onClick={() => setShowDemoModal(true)}
                            className="group px-8 py-5 bg-white/5 hover:bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl md:rounded-3xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-xl"
                        >
                            <span className="flex items-center justify-center gap-3 text-white">
                                <FaRocket className="text-2xl text-emerald-400" /> {t('startNow')}
                            </span>
                        </button>
                    </motion.div>
                </div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 text-2xl"
                >
                    <FaChevronDown />
                </motion.div>
            </section>

            {/* Premium Features */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-blue-600 font-black tracking-[0.3em] text-[10px] md:text-xs uppercase block mb-4"
                        >
                            {t('premiumServicesBadge') || 'PREMİUM ÖZELLİKLER'}
                        </motion.span>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                            {t('premiumServices')}
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: FaQrcode, title: t('qrMenuSystem'), color: "bg-orange-500", desc: t('valPropDigital') },
                            { icon: FaShoppingCart, title: t('orderManagement'), color: "bg-blue-500", desc: t('valPropSpeed') },
                            { icon: FaBrain, title: t('aiTitle'), color: "bg-purple-500", desc: t('valPropSatisfy') },
                            { icon: FaChartLine, title: t('detailedReporting'), color: "bg-green-500", desc: t('valPropProfit') },
                            { icon: FaGlobe, title: t('multiLangTitle'), color: "bg-indigo-500", desc: t('valPropTrust') },
                            { icon: FaBell, title: t('marketingAdsTitle'), color: "bg-yellow-500", desc: t('adIncomeTitle') },
                            { icon: FaCogs, title: t('allInOneTitle'), color: "bg-slate-600", desc: t('valPropDigital') },
                            { icon: FaHeart, title: t('support247'), color: "bg-red-500", desc: t('valPropTrust') }
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex flex-col items-center bg-slate-50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-2"
                            >
                                <div className={`${s.color} w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl mb-6 shadow-lg group-hover:rotate-6 transition-transform`}>
                                    <s.icon />
                                </div>
                                <span className="text-[10px] md:text-xs font-black text-center text-slate-900 uppercase tracking-wider">{s.title}</span>
                                <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{s.desc}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Success Stories Section */}
            <section className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto rounded-[4rem] bg-slate-900 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.4)] flex flex-col lg:flex-row border border-white/5 relative">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] -translate-y-1/2 translate-x-1/2"></div>

                        <div className="lg:w-1/2 p-8 md:p-20 flex flex-col justify-center relative z-10">
                            <motion.div
                                initial="initial"
                                whileInView="animate"
                                variants={fadeIn}
                                viewport={{ once: true }}
                            >
                                <div className="inline-flex items-center px-6 py-3 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-black mb-8 border border-emerald-500/20 tracking-widest">
                                    <FaCheckCircle className="mr-3" /> {t('caseStudyBadge') || 'MÜŞTERİ MEMNUNİYETİ'}
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[1.1]">
                                    {t('customersSuccessTitle')}
                                </h2>
                                <p className="text-xl text-slate-400 mb-12 leading-relaxed font-medium">
                                    {t('customersSuccessDesc')}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                                    {[
                                        { label: t('valPropSatisfy'), icon: FaHeart, color: "text-pink-400" },
                                        { label: t('valPropProfit'), icon: FaChartLine, color: "text-emerald-400" },
                                        { label: t('valPropStaff'), icon: FaUsers, color: "text-blue-400" },
                                        { label: t('valPropSpeed'), icon: FaRocket, color: "text-orange-400" },
                                        { label: t('valPropDigital'), icon: FaDesktop, color: "text-purple-400" },
                                        { label: t('valPropTrust'), icon: FaShieldAlt, color: "text-cyan-400" }
                                    ].map((res, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ x: 10 }}
                                            className="flex items-center gap-4 bg-white/5 p-5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all"
                                        >
                                            <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl ${res.color}`}>
                                                <res.icon />
                                            </div>
                                            <span className="text-white font-black text-base md:text-lg tracking-tight">{res.label}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                <button onClick={() => setShowDemoModal(true)} className="flex items-center gap-6 text-white font-black text-2xl hover:gap-8 transition-all group">
                                    {t('examineFeature')} <FaArrowRight className="text-blue-500 group-hover:translate-x-3 transition-transform" />
                                </button>
                            </motion.div>
                        </div>
                        <div className="lg:w-1/2 bg-[#0F172A] relative min-h-[600px] overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent"></div>

                            <div className="relative z-10">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.05, 1],
                                        rotate: [0, 5, 0]
                                    }}
                                    transition={{ duration: 10, repeat: Infinity }}
                                    className="w-48 h-48 md:w-64 md:h-64 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 flex items-center justify-center shadow-[0_0_100px_rgba(59,130,246,0.3)] relative"
                                >
                                    <FaUsers className="text-6xl md:text-8xl text-white/20" />
                                    {[
                                        { icon: FaUtensils, color: "text-blue-400", pos: "-top-12 -left-12" },
                                        { icon: FaChartLine, color: "text-emerald-400", pos: "-bottom-12 -right-12" },
                                        { icon: FaQrcode, color: "text-purple-400", pos: "-top-12 -right-12" },
                                        { icon: FaShieldAlt, color: "text-cyan-400", pos: "-bottom-12 -left-12" },
                                        { icon: FaHeart, color: "text-pink-400", pos: "top-1/2 -right-20 -translate-y-1/2" },
                                        { icon: FaRocket, color: "text-orange-400", pos: "top-1/2 -left-20 -translate-y-1/2" }
                                    ].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                y: [0, -15, 0],
                                                rotate: i % 2 === 0 ? [0, 10, 0] : [0, -10, 0]
                                            }}
                                            transition={{
                                                duration: 4,
                                                repeat: Infinity,
                                                delay: i * 0.7,
                                                ease: "easeInOut"
                                            }}
                                            className={`absolute ${item.pos} w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-2xl rounded-2xl md:rounded-3xl border border-white/10 flex items-center justify-center text-2xl md:text-3xl ${item.color} shadow-2xl`}
                                        >
                                            <item.icon />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

                            <div className="absolute bottom-8 left-8 right-8 grid grid-cols-2 gap-4">
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden group hover:bg-white/10 transition-colors"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                        <FaUsers className="text-6xl" />
                                    </div>
                                    <div className="text-slate-400 text-[10px] md:text-xs font-black uppercase mb-2 tracking-widest">{t('satisfiedClientsLabel')}</div>
                                    <div className="text-white text-3xl md:text-5xl font-black flex items-baseline gap-2">
                                        500+ <span className="text-[10px] text-blue-400 animate-pulse font-black">CANLI</span>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-emerald-600/10 backdrop-blur-3xl border border-emerald-500/20 p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden group hover:bg-emerald-600/20 transition-colors text-right"
                                >
                                    <div className="absolute top-0 left-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                        <FaChartLine className="text-6xl" />
                                    </div>
                                    <div className="text-emerald-400 text-[10px] md:text-xs font-black uppercase mb-2 tracking-widest">{t('averageGrowthLabel')}</div>
                                    <div className="text-white text-3xl md:text-5xl font-black">
                                        +35%
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Solutions Grid */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                            {t('marketingSectionTitle')}
                        </h2>
                        <div className="h-2 w-24 bg-blue-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: FaUtensils, title: t('kitchenStatTitle'), desc: t('kitchenStatDesc'), color: "blue", badge: "Advanced" },
                            { icon: FaCreditCard, title: t('splitPaymentTitle'), desc: t('splitPaymentDesc'), color: "emerald", badge: "Exclusive" },
                            { icon: FaLayerGroup, title: t('multiBranchTitle'), desc: t('multiBranchDesc'), color: "purple", badge: "Enterprise" },
                            { icon: FaMagic, title: t('aiTitle'), desc: t('aiDesc'), color: "pink", badge: "AI Powered" }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all border border-slate-100 flex flex-col h-full"
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-blue-50 text-blue-600 transition-transform group-hover:scale-110`}>
                                    <feature.icon className="text-3xl" />
                                </div>
                                <div className="mb-4">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-100 text-blue-600`}>
                                        {feature.badge}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-grow">
                                    {feature.desc}
                                </p>
                                <button className="flex items-center gap-2 font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                    LEARN MORE <FaArrowRight className="text-sm" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Management & Control Section */}
            <section className="py-24 bg-slate-50 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-16 px-4">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-blue-600 font-black tracking-[0.2em] text-xs uppercase block mb-4"
                        >
                            {t('mgmtControlTitle')}
                        </motion.span>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
                            {t('mgmtTitle')}
                        </h2>
                        <p className="text-xl text-slate-500 font-medium">
                            {t('mgmtNoTechRequired')} 🛠️
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: FaCogs, title: t('mgmtMenuUpdate'), color: "bg-blue-600" },
                            { icon: FaMagic, title: t('mgmtStockHide'), color: "bg-emerald-600" },
                            { icon: FaFire, title: t('mgmtCampaignDrive'), color: "bg-orange-600" },
                            { icon: FaBell, title: t('mgmtAnnounceDirect'), color: "bg-purple-600" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 group hover:scale-[1.02] transition-transform flex flex-col items-center text-center"
                            >
                                <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white text-2xl shadow-lg`}>
                                    <item.icon />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 leading-snug">
                                    {item.title}
                                </h3>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Waiter Calling Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto rounded-[3.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 p-8 md:p-20 text-white relative shadow-2xl">
                        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                            <FaBell className="absolute top-10 right-10 text-[20rem] rotate-12" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                            <div>
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    whileInView={{ x: 0, opacity: 1 }}
                                    className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full inline-block text-sm font-black tracking-widest uppercase mb-8 border border-white/20"
                                >
                                    {t('waiterCallMainTitle')}
                                </motion.div>
                                <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                                    {t('waiterCallTitle')}
                                </h2>
                                <p className="text-xl md:text-2xl text-emerald-50 leading-relaxed mb-10 font-medium opacity-90">
                                    {t('waiterCallDesc')}
                                </p>
                                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-emerald-600 text-3xl shadow-2xl">
                                        <FaCheckCircle />
                                    </div>
                                    <p className="text-xl font-black leading-tight italic">
                                        "{t('waiterCallFooter')}"
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <motion.div
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className="relative"
                                >
                                    <div className="w-64 h-64 md:w-80 md:h-80 bg-white/20 backdrop-blur-2xl rounded-full flex items-center justify-center border-4 border-white/30 shadow-2xl">
                                        <FaBell className="text-[8rem] md:text-[10rem] text-white animate-bounce" />
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 bg-white text-emerald-600 p-6 rounded-3xl shadow-2xl font-black text-xl flex items-center gap-3">
                                        <FaMagic /> SMART CALL
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Zero Error Section */}
            <section className="py-24 bg-slate-900 text-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-20 px-4">
                        <span className="text-orange-400 font-black tracking-[0.2em] text-xs uppercase block mb-6">{t('zeroErrorSectionTitle')}</span>
                        <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-8">
                            {t('qrToKitchenTitle')}
                        </h2>
                        <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
                            {t('qrToKitchenDesc')}
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                        {[
                            { step: "01", title: t('zeroErrorList1'), icon: FaQrcode, color: "bg-blue-600" },
                            { step: "02", title: t('zeroErrorList2'), icon: FaLayerGroup, color: "bg-orange-600" },
                            { step: "03", title: t('zeroErrorList3'), icon: FaUtensils, color: "bg-emerald-600" },
                            { step: "04", title: t('zeroErrorList4'), icon: FaRocket, color: "bg-pink-600" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.15 }}
                                className="relative z-10 bg-slate-800/50 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center text-center group hover:bg-slate-800 transition-colors"
                            >
                                <span className="absolute top-4 left-6 text-white/10 text-6xl font-black font-mono italic">{item.step}</span>
                                <div className={`${item.color} w-20 h-20 rounded-3xl mb-8 flex items-center justify-center text-4xl shadow-2xl group-hover:scale-110 transition-transform`}>
                                    <item.icon />
                                </div>
                                <h3 className="text-xl font-black leading-tight group-hover:text-white transition-colors">
                                    {item.title}
                                </h3>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Extra Income & Advertising Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2 order-2 lg:order-1">
                            <div className="grid grid-cols-2 gap-6 relative">
                                <motion.div
                                    whileHover={{ y: -10, scale: 1.05 }}
                                    className="aspect-square bg-white rounded-[3rem] flex flex-col items-center justify-center p-8 text-center border border-slate-100 shadow-xl relative z-10"
                                >
                                    <div className="w-20 h-20 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center text-4xl mb-6 shadow-xl shadow-blue-500/30">
                                        <FaChartLine />
                                    </div>
                                    <span className="text-slate-900 font-black text-xl leading-tight uppercase tracking-tight">{t('passiveIncomeLabel')}</span>
                                </motion.div>
                                <motion.div
                                    whileHover={{ y: -10, scale: 1.05 }}
                                    className="aspect-square bg-slate-900 text-white rounded-[3rem] flex flex-col items-center justify-center p-8 text-center shadow-2xl -mt-12 relative z-10"
                                >
                                    <div className="w-20 h-20 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center text-4xl mb-6 shadow-xl shadow-emerald-500/20">
                                        <FaGem />
                                    </div>
                                    <span className="font-black text-xl leading-tight uppercase tracking-tight">{t('premiumSpaceLabel')}</span>
                                </motion.div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 order-1 lg:order-2">
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="text-purple-600 font-black tracking-[0.2em] text-xs uppercase block mb-6 px-4 py-2 bg-purple-50 rounded-full w-fit"
                            >
                                {t('adIncomeTitle')}
                            </motion.span>
                            <h2 className="text-4xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
                                {t('adIncomeSubtitle')}
                            </h2>
                            <p className="text-2xl text-slate-500 font-medium leading-relaxed mb-12">
                                {t('adIncomeDesc')}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {[t('adTag1'), t('adTag2'), t('adTag3'), t('adTag4')].map((tag, i) => (
                                    <motion.span
                                        key={i}
                                        whileHover={{ scale: 1.1 }}
                                        className="px-8 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest border border-slate-200 shadow-sm"
                                    >
                                        #{tag}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-24 bg-slate-50 overflow-hidden">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[3.5rem] p-10 md:p-24 text-white text-center relative shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            className="relative z-10"
                        >
                            <span className="text-blue-200 font-black tracking-[0.3em] text-xs uppercase block mb-8">{t('noChangeTitle')}</span>
                            <h2 className="text-4xl md:text-7xl font-black mb-8 leading-tight">
                                {t('noChangeSubtitle')}
                            </h2>
                            <p className="text-xl md:text-3xl text-blue-100/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                                {t('noChangeDesc')}
                            </p>
                            <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl text-xl md:text-2xl font-black italic">
                                <FaRocket className="text-emerald-400" />
                                "{t('noChangeFooter')}"
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-32 bg-white px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black mb-4 text-slate-900">{t('faq')}</h2>
                        <p className="text-xl text-slate-500 font-medium">{t('faqDesc')}</p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border border-slate-100 rounded-3xl bg-slate-50 overflow-hidden transition-all hover:shadow-md">
                                <button
                                    onClick={() => toggleFAQ(i)}
                                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                            <faq.icon className="text-xl" />
                                        </div>
                                        <span className="font-bold text-lg text-slate-900">{faq.question}</span>
                                    </div>
                                    <FaChevronDown className={`text-slate-400 transition-transform duration-300 ${openFAQ === i ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {openFAQ === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-white px-6 pb-6 text-slate-600 font-medium leading-relaxed border-t border-slate-50"
                                        >
                                            <div className="pt-4 px-10">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-white pt-24 pb-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-16">
                        <div>
                            <div className="text-4xl font-black tracking-tighter mb-8 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">RestXQr</div>
                            <p className="text-xl text-slate-400 leading-relaxed font-medium max-w-md">{t('footerSlogan')}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                            <div>
                                <h4 className="text-xs font-black text-slate-500 mb-8 uppercase tracking-[0.3em]">{t('contactUs')}</h4>
                                <div className="space-y-4">
                                    <a href="tel:+436608682201" className="flex items-center gap-4 text-slate-300 hover:text-white transition-all font-bold">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400">
                                            <FaPhone />
                                        </div>
                                        +43 660 868 22 01
                                    </a>
                                    <div className="flex items-center gap-4 text-slate-300 font-bold">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400">
                                            <FaGlobe />
                                        </div>
                                        restxqr.com
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-500 mb-8 uppercase tracking-[0.3em]">{t('legalLinkSection')}</h4>
                                <div className="flex flex-col gap-4 text-slate-400 font-bold">
                                    <Link href="/datenschutz" className="hover:text-white transition-colors">{t('privacyPolicy')}</Link>
                                    <Link href="/terms" className="hover:text-white transition-colors">{t('termsOfService')}</Link>
                                    <Link href="/impressum" className="hover:text-white transition-colors">{t('legalInfo')}</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 text-center text-slate-600 text-sm font-medium">
                        &copy; {new Date().getFullYear()} RestXQr. {t('allRightsReserved')}
                    </div>
                </div>
            </footer>

            {/* Floating Contact Action */}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4">
                <a
                    href="https://wa.me/436608682201"
                    target="_blank"
                    className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:scale-110 active:scale-95 transition-all"
                >
                    <FaWhatsapp />
                </a>
            </div>

            <DemoRequestModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
        </main>
    );
}
