'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FaBuilding, FaArrowLeft } from 'react-icons/fa';
import useLanguageStore from '@/store/useLanguageStore';
import { LanguageProvider } from '@/context/LanguageContext';

function ImpressumContent() {
    const { t, language, setLanguage } = useLanguageStore();

    useEffect(() => {
        const pathLang = window.location.pathname.split('/')[1];
        if (pathLang === 'de' || pathLang === 'en' || pathLang === 'tr') {
            setLanguage(pathLang);
        }
    }, [setLanguage]);

    const content = {
        tr: {
            title: 'Yasal Bilgiler',
            lastUpdated: 'Son Güncelleme: 11 Ocak 2025',
            company: {
                title: 'Şirket Bilgileri',
                name: 'RestXQr Tech Solutions',
                address: 'Viyana, Avusturya',
                email: 'info@restxqr.com',
                phone: '+43 660 868 22 01'
            },
            responsible: {
                title: 'Sorumlu Kişi',
                text: 'İçerik Yönetimi:',
                name: 'RestXQr Operasyon Ekibi'
            },
            disclaimer: {
                title: 'Sorumluluk Reddi',
                text: 'Web sitemizdeki tüm bilgiler genel bilgilendirme içindir. Bilgilerin doğruluğunu sağlamak için azami çaba gösterilmektedir.'
            },
            copyright: {
                title: 'Telif Hakkı',
                text: 'Tüm hakları saklıdır. RestXQr sistemindeki metin, görsel ve yazılımlar izinsiz kullanılamaz.'
            },
            contact: {
                title: 'İletişim',
                text: 'Kurumsal iletişim kanallarımız:',
                email: 'info@restxqr.com',
                phone: '+43 660 868 22 01'
            }
        },
        de: {
            title: 'Impressum',
            lastUpdated: 'Letzte Aktualisierung: 11. Januar 2025',
            company: {
                title: 'Firmenangaben',
                name: 'RestXQr Tech Solutions',
                address: 'Wien, Österreich',
                email: 'info@restxqr.com',
                phone: '+43 660 868 22 01'
            },
            responsible: {
                title: 'Verantwortlich',
                text: 'Verantwortlich für den Inhalt:',
                name: 'RestXQr Operations Team'
            },
            disclaimer: {
                title: 'Haftungsausschluss',
                text: 'Alle Inhalte dienen der allgemeinen Information. Wir übernehmen keine Haftung für externe Links.'
            },
            copyright: {
                title: 'Urheberrecht',
                text: 'Alle Rechte vorbehalten. Inhalte dürfen nicht ohne Genehmigung kopiert werden.'
            },
            contact: {
                title: 'Kontakt',
                text: 'Kontaktieren Sie uns unter:',
                email: 'info@restxqr.com',
                phone: '+43 660 868 22 01'
            }
        },
        en: {
            title: 'Legal Information',
            lastUpdated: 'Last Updated: January 11, 2025',
            company: {
                title: 'Company Information',
                name: 'RestXQr Tech Solutions',
                address: 'Vienna, Austria',
                email: 'info@restxqr.com',
                phone: '+43 660 868 22 01'
            },
            responsible: {
                title: 'Responsible Person',
                text: 'Responsible for content:',
                name: 'RestXQr Operations Team'
            },
            disclaimer: {
                title: 'Disclaimer',
                text: 'The information is for general purposes only. We strive for accuracy but cannot guarantee it.'
            },
            copyright: {
                title: 'Copyright',
                text: 'All rights reserved. Unauthorized duplication is prohibited.'
            },
            contact: {
                title: 'Contact',
                text: 'Corporate contact details:',
                email: 'info@restxqr.com',
                phone: '+43 660 868 22 01'
            }
        }
    };

    const currentContent = content[language as keyof typeof content] || content.de;

    useEffect(() => {
        document.title = `${currentContent.title} | RestXQr`;
    }, [currentContent, language]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
                    <FaArrowLeft className="mr-2" />
                    <span>{language === 'de' ? 'Zurück zur Startseite' : language === 'en' ? 'Back to Home' : 'Ana Sayfaya Dön'}</span>
                </Link>

                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-blue-100 p-4 rounded-full">
                            <FaBuilding className="text-3xl text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-900">{currentContent.title}</h1>
                            <p className="text-gray-500 mt-2">{currentContent.lastUpdated}</p>
                        </div>
                    </div>

                    <div className="prose prose-lg max-w-none mt-8 space-y-8">
                        <section className="bg-blue-50 p-6 rounded-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentContent.company.title}</h2>
                            <div className="space-y-2 text-gray-700">
                                <p><strong>{language === 'de' ? 'Firmenname' : language === 'en' ? 'Company Name' : 'Şirket Adı'}:</strong> {currentContent.company.name}</p>
                                <p><strong>{language === 'de' ? 'Adresse' : language === 'en' ? 'Address' : 'Adres'}:</strong> {currentContent.company.address}</p>
                                <p><strong>E-Mail:</strong> <a href={`mailto:${currentContent.company.email}`} className="text-blue-600 hover:underline">{currentContent.company.email}</a></p>
                                <p><strong>{language === 'de' ? 'Telefon' : language === 'en' ? 'Phone' : 'Telefon'}:</strong> <a href={`tel:${currentContent.company.phone.replace(/\s/g, '')}`} className="text-blue-600 hover:underline">{currentContent.company.phone}</a></p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentContent.responsible.title}</h2>
                            <p className="text-gray-700 mb-2">{currentContent.responsible.text}</p>
                            <p className="text-gray-700 font-semibold">{currentContent.responsible.name}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentContent.disclaimer.title}</h2>
                            <p className="text-gray-700 leading-relaxed">{currentContent.disclaimer.text}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentContent.copyright.title}</h2>
                            <p className="text-gray-700 leading-relaxed">{currentContent.copyright.text}</p>
                        </section>

                        <section className="bg-gray-50 p-6 rounded-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentContent.contact.title}</h2>
                            <p className="text-gray-700 mb-4">{currentContent.contact.text}</p>
                            <div className="space-y-2">
                                <p className="text-gray-700">
                                    <strong>E-Mail:</strong> <a href={`mailto:${currentContent.contact.email}`} className="text-blue-600 hover:underline">{currentContent.contact.email}</a>
                                </p>
                                <p className="text-gray-700">
                                    <strong>{language === 'de' ? 'Telefon' : language === 'en' ? 'Phone' : 'Telefon'}:</strong> <a href={`tel:${currentContent.contact.phone.replace(/\s/g, '')}`} className="text-blue-600 hover:underline">{currentContent.contact.phone}</a>
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ImpressumPage() {
    return (
        <LanguageProvider>
            <ImpressumContent />
        </LanguageProvider>
    );
}
