'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FaCookie, FaArrowLeft } from 'react-icons/fa';
import useLanguageStore from '@/store/useLanguageStore';
import { LanguageProvider } from '@/context/LanguageContext';

function CookiesContent() {
    const { t, language, setLanguage } = useLanguageStore();

    useEffect(() => {
        // Sayfa dilini ayarla
        const pathLang = window.location.pathname.split('/')[1];
        if (pathLang === 'de' || pathLang === 'en' || pathLang === 'tr') {
            setLanguage(pathLang);
        }
    }, [setLanguage]);

    const content = {
        tr: {
            title: 'Çerez Politikası',
            lastUpdated: 'Son Güncelleme: 11 Ocak 2025',
            intro: 'Bu Çerez Politikası, restXqr web sitesi ve hizmetlerimizde çerezlerin nasıl kullanıldığını açıklamaktadır.',
            whatAreCookies: {
                title: 'Çerezler Nedir?',
                text: 'Çerezler, web sitelerini ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır. Bu dosyalar, web sitesinin düzgün çalışmasını sağlar ve kullanıcı deneyimini iyileştirir.'
            },
            howWeUse: {
                title: 'Çerezleri Nasıl Kullanıyoruz?',
                text: 'Çerezleri aşağıdaki amaçlarla kullanıyoruz:',
                list: [
                    'Web sitesinin temel işlevlerini sağlamak',
                    'Kullanıcı tercihlerini hatırlamak',
                    'Site performansını analiz etmek',
                    'Kullanıcı deneyimini iyileştirmek'
                ]
            },
            types: {
                title: 'Çerez Türleri',
                essential: {
                    title: 'Zorunlu Çerezler',
                    text: 'Web sitesinin çalışması için gerekli olan çerezlerdir. Bu çerezler olmadan sitenin bazı özellikleri çalışmayabilir.'
                },
                analytics: {
                    title: 'Analitik Çerezler',
                    text: 'Web sitesinin nasıl kullanıldığını anlamamıza yardımcı olan çerezlerdir. Bu çerezler, sayfa görüntülemelerini ve kullanıcı davranışlarını analiz eder.'
                },
                functional: {
                    title: 'İşlevsel Çerezler',
                    text: 'Dil tercihleri gibi kullanıcı tercihlerini hatırlayan çerezlerdir.'
                }
            },
            manage: {
                title: 'Çerezleri Yönetme',
                text: 'Tarayıcı ayarlarınızdan çerezleri yönetebilir veya silebilirsiniz. Ancak, bazı çerezleri devre dışı bırakmak web sitesinin bazı özelliklerinin çalışmamasına neden olabilir.'
            },
            contact: {
                title: 'İletişim',
                text: 'Çerez politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:',
                email: 'info@restxqr.com',
                phone: '+43 660 868 22 01'
            }
        },
        de: {
            title: 'Cookie-Richtlinie',
            lastUpdated: 'Letzte Aktualisierung: 11. Januar 2025',
            intro: 'Diese Cookie-Richtlinie erklärt, wie Cookies auf der restXqr-Website und in unseren Diensten verwendet werden.',
            whatAreCookies: {
                title: 'Was sind Cookies?',
                text: 'Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie Websites besuchen. Diese Dateien ermöglichen es der Website, ordnungsgemäß zu funktionieren und verbessern die Benutzererfahrung.'
            },
            howWeUse: {
                title: 'Wie verwenden wir Cookies?',
                text: 'Wir verwenden Cookies für folgende Zwecke:',
                list: [
                    'Bereitstellung der grundlegenden Funktionen der Website',
                    'Speichern von Benutzereinstellungen',
                    'Analyse der Website-Performance',
                    'Verbesserung der Benutzererfahrung'
                ]
            },
            types: {
                title: 'Cookie-Arten',
                essential: {
                    title: 'Notwendige Cookies',
                    text: 'Dies sind Cookies, die für das Funktionieren der Website erforderlich sind. Ohne diese Cookies funktionieren einige Funktionen der Website möglicherweise nicht.'
                },
                analytics: {
                    title: 'Analyse-Cookies',
                    text: 'Diese Cookies helfen uns zu verstehen, wie die Website verwendet wird. Sie analysieren Seitenaufrufe und Benutzerverhalten.'
                },
                functional: {
                    title: 'Funktionale Cookies',
                    text: 'Dies sind Cookies, die Benutzereinstellungen wie Sprachpräferenzen speichern.'
                }
            },
            manage: {
                title: 'Cookies verwalten',
                text: 'Sie können Cookies über Ihre Browsereinstellungen verwalten oder löschen. Das Deaktivieren einiger Cookies kann jedoch dazu führen, dass einige Funktionen der Website nicht funktionieren.'
            },
            contact: {
                title: 'Kontakt',
                text: 'Bei Fragen zu unserer Cookie-Richtlinie können Sie uns kontaktieren:',
                email: 'info@restxqr.com',
                phone: '+43 660 868 22 01'
            }
        },
        en: {
            title: 'Cookie Policy',
            lastUpdated: 'Last Updated: January 11, 2025',
            intro: 'This Cookie Policy explains how cookies are used on the restXqr website and our services.',
            whatAreCookies: {
                title: 'What are Cookies?',
                text: 'Cookies are small text files that are stored on your device when you visit websites. These files enable the website to function properly and improve user experience.'
            },
            howWeUse: {
                title: 'How We Use Cookies',
                text: 'We use cookies for the following purposes:',
                list: [
                    'Providing basic website functionality',
                    'Remembering user preferences',
                    'Analyzing website performance',
                    'Improving user experience'
                ]
            },
            types: {
                title: 'Types of Cookies',
                essential: {
                    title: 'Essential Cookies',
                    text: 'These are cookies that are necessary for the website to function. Without these cookies, some features of the website may not work.'
                },
                analytics: {
                    title: 'Analytics Cookies',
                    text: 'These cookies help us understand how the website is used. They analyze page views and user behavior.'
                },
                functional: {
                    title: 'Functional Cookies',
                    text: 'These are cookies that remember user preferences such as language settings.'
                }
            },
            manage: {
                title: 'Managing Cookies',
                text: 'You can manage or delete cookies through your browser settings. However, disabling some cookies may cause some website features to not work.'
            },
            contact: {
                title: 'Contact',
                text: 'For questions about our cookie policy, you can contact us:',
                email: 'info@restxqr.com',
                phone: '+43 660 868 22 01'
            }
        }
    };

    const currentContent = content[language as keyof typeof content] || content.en;

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
                            <FaCookie className="text-3xl text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-900">{currentContent.title}</h1>
                            <p className="text-gray-500 mt-2">{currentContent.lastUpdated}</p>
                        </div>
                    </div>

                    <div className="prose prose-lg max-w-none mt-8 space-y-8">
                        <p className="text-gray-700 text-lg leading-relaxed">{currentContent.intro}</p>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentContent.whatAreCookies.title}</h2>
                            <p className="text-gray-700 leading-relaxed">{currentContent.whatAreCookies.text}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentContent.howWeUse.title}</h2>
                            <p className="text-gray-700 mb-4">{currentContent.howWeUse.text}</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                {currentContent.howWeUse.list.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentContent.types.title}</h2>
                            
                            <div className="space-y-6">
                                <div className="bg-blue-50 p-6 rounded-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{currentContent.types.essential.title}</h3>
                                    <p className="text-gray-700">{currentContent.types.essential.text}</p>
                                </div>

                                <div className="bg-green-50 p-6 rounded-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{currentContent.types.analytics.title}</h3>
                                    <p className="text-gray-700">{currentContent.types.analytics.text}</p>
                                </div>

                                <div className="bg-purple-50 p-6 rounded-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{currentContent.types.functional.title}</h3>
                                    <p className="text-gray-700">{currentContent.types.functional.text}</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentContent.manage.title}</h2>
                            <p className="text-gray-700 leading-relaxed">{currentContent.manage.text}</p>
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

export default function CookiesPage() {
    return (
        <LanguageProvider>
            <CookiesContent />
        </LanguageProvider>
    );
}
