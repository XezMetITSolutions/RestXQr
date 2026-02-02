'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FaFileContract, FaArrowLeft } from 'react-icons/fa';
import useLanguageStore from '@/store/useLanguageStore';
import { LanguageProvider } from '@/context/LanguageContext';

function TermsContent() {
    const { t, language, setLanguage } = useLanguageStore();

    useEffect(() => {
        const pathLang = window.location.pathname.split('/')[1];
        if (pathLang === 'de' || pathLang === 'en' || pathLang === 'tr') {
            setLanguage(pathLang);
        }
    }, [setLanguage]);

    const content = {
        tr: {
            title: 'Kullanım Koşulları',
            lastUpdated: 'Son Güncelleme: 11 Ocak 2025',
            sections: [
                {
                    title: '1. Kabul Edilme',
                    text: 'RestXQr servislerini kullanarak bu koşulları peşinen kabul etmiş sayılırsınız.'
                },
                {
                    title: '2. Hizmet Tanımı',
                    text: 'RestXQr, restoranlar için dijital menü ve sipariş yönetim sistemleri sunan bir SaaS platformudur.'
                },
                {
                    title: '3. Kullanıcı Sorumlulukları',
                    text: 'Kullanıcılar, sisteme yüklenen içeriklerin doğruluğundan ve yasalara uygunluğundan bizzat sorumludur.'
                },
                {
                    title: '4. Fikri Mülkiyet',
                    text: 'Yazılımın tüm hakları RestXQr\'a aittir. İzinsiz kopyalanamaz veya çoğaltılamaz.'
                }
            ]
        },
        de: {
            title: 'Nutzungsbedingungen',
            lastUpdated: 'Letzte Aktualisierung: 11. Januar 2025',
            sections: [
                {
                    title: '1. Akzeptanz',
                    text: 'Durch die Nutzung der Dienste von RestXQr akzeptieren Sie diese Bedingungen.'
                },
                {
                    title: '2. Leistungsbeschreibung',
                    text: 'RestXQr ist eine SaaS-Plattform, die digitale Menü- und Bestellmanagementsysteme für Restaurants anbietet.'
                },
                {
                    title: '3. Nutzerverantwortung',
                    text: 'Nutzer sind für die Richtigkeit und Rechtmäßigkeit der in das System hochgeladenen Inhalte verantwortlich.'
                },
                {
                    title: '4. Geistiges Eigentum',
                    text: 'Alle Rechte an der Software liegen bei RestXQr. Unbefugtes Kopieren ist untersagt.'
                }
            ]
        },
        en: {
            title: 'Terms of Service',
            lastUpdated: 'Last Updated: January 11, 2025',
            sections: [
                {
                    title: '1. Acceptance',
                    text: 'By using RestXQr services, you agree to these terms and conditions.'
                },
                {
                    title: '2. Service Description',
                    text: 'RestXQr is a SaaS platform providing digital menu and order management systems for restaurants.'
                },
                {
                    title: '3. User Responsibilities',
                    text: 'Users are responsible for the accuracy and legality of the content uploaded to the system.'
                },
                {
                    title: '4. Intellectual Property',
                    text: 'All rights to the software belong to RestXQr. Unauthorized copying is prohibited.'
                }
            ]
        }
    };

    const currentContent = content[language as keyof typeof content] || content.de;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
                    <FaArrowLeft className="mr-2" />
                    <span>{language === 'de' ? 'Zurück' : language === 'en' ? 'Back' : 'Geri'}</span>
                </Link>

                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-blue-100 p-4 rounded-full">
                            <FaFileContract className="text-3xl text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-900">{currentContent.title}</h1>
                            <p className="text-gray-500 mt-2">{currentContent.lastUpdated}</p>
                        </div>
                    </div>

                    <div className="prose prose-lg max-w-none mt-8 space-y-8">
                        {currentContent.sections.map((section, index) => (
                            <section key={index}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                                <p className="text-gray-700 leading-relaxed">{section.text}</p>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TermsPage() {
    return (
        <LanguageProvider>
            <TermsContent />
        </LanguageProvider>
    );
}
