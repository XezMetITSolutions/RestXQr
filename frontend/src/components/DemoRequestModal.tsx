'use client';

import { useState } from 'react';
import { FaTimes, FaEnvelope, FaPhone, FaBuilding, FaUser, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import useLanguageStore from '@/store/useLanguageStore';

interface DemoRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DemoRequestModal({ isOpen, onClose }: DemoRequestModalProps) {
    const { t, language } = useLanguageStore();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const translations = {
        tr: {
            title: 'Demo Talep Formu',
            subtitle: 'Demo erişimi için lütfen formu doldurun. Size en kısa sürede ulaşacağız.',
            name: 'Ad Soyad',
            email: 'E-posta',
            phone: 'Telefon',
            company: 'Şirket/Restoran Adı',
            message: 'Mesajınız (Opsiyonel)',
            submit: 'Demo Talep Et',
            cancel: 'İptal',
            success: 'Talebiniz alındı!',
            successMessage: 'En kısa sürede size ulaşacağız.',
            required: 'Bu alan zorunludur',
            invalidEmail: 'Geçerli bir e-posta adresi giriniz'
        },
        de: {
            title: 'Demo anfordern',
            subtitle: 'Bitte füllen Sie das Formular aus, um Zugang zur Demo zu erhalten. Wir werden uns so schnell wie möglich bei Ihnen melden.',
            name: 'Name',
            email: 'E-Mail',
            phone: 'Telefon',
            company: 'Firmen-/Restaurantname',
            message: 'Ihre Nachricht (Optional)',
            submit: 'Demo anfordern',
            cancel: 'Abbrechen',
            success: 'Ihre Anfrage wurde erhalten!',
            successMessage: 'Wir werden uns so schnell wie möglich bei Ihnen melden.',
            required: 'Dieses Feld ist erforderlich',
            invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
        },
        en: {
            title: 'Request Demo',
            subtitle: 'Please fill out the form to request demo access. We will contact you as soon as possible.',
            name: 'Full Name',
            email: 'Email',
            phone: 'Phone',
            company: 'Company/Restaurant Name',
            message: 'Your Message (Optional)',
            submit: 'Request Demo',
            cancel: 'Cancel',
            success: 'Your request has been received!',
            successMessage: 'We will contact you as soon as possible.',
            required: 'This field is required',
            invalidEmail: 'Please enter a valid email address'
        }
    };

    const trans = translations[language as keyof typeof translations] || translations.en;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name || !formData.email || !formData.phone) {
            alert(trans.required);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert(trans.invalidEmail);
            return;
        }

        setIsSubmitting(true);

        try {
            // Send to backend or email service
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
            const response = await fetch(`${apiUrl}/demo-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    language,
                    timestamp: new Date().toISOString(),
                    source: 'landing-page'
                }),
            });

            if (response.ok) {
                setIsSubmitted(true);
                // Reset form after 3 seconds
                setTimeout(() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', company: '', message: '' });
                    onClose();
                }, 3000);
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Demo request error:', error);
            // Fallback: Open email client
            const subject = encodeURIComponent(`Demo Request - ${formData.name}`);
            const body = encodeURIComponent(
                `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nCompany: ${formData.company}\nMessage: ${formData.message}`
            );
            window.location.href = `mailto:info@restxqr.com?subject=${subject}&body=${body}`;
            setIsSubmitted(true);
            setTimeout(() => {
                setIsSubmitted(false);
                setFormData({ name: '', email: '', phone: '', company: '', message: '' });
                onClose();
            }, 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">{trans.title}</h2>
                        <p className="text-gray-600 mt-1 text-sm">{trans.subtitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes className="text-2xl" />
                    </button>
                </div>

                {isSubmitted ? (
                    <div className="p-12 text-center">
                        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaCheckCircle className="text-green-600 text-4xl" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{trans.success}</h3>
                        <p className="text-gray-600">{trans.successMessage}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <FaUser className="inline mr-2 text-gray-400" />
                                {trans.name} *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <FaEnvelope className="inline mr-2 text-gray-400" />
                                {trans.email} *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <FaPhone className="inline mr-2 text-gray-400" />
                                {trans.phone} *
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <FaBuilding className="inline mr-2 text-gray-400" />
                                {trans.company}
                            </label>
                            <input
                                type="text"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {trans.message}
                            </label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                {trans.cancel}
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-black hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        {language === 'de' ? 'Wird gesendet...' : language === 'en' ? 'Sending...' : 'Gönderiliyor...'}
                                    </>
                                ) : (
                                    trans.submit
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
