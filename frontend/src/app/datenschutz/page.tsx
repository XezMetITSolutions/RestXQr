'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import useLanguageStore from '@/store/useLanguageStore';
import { LanguageProvider } from '@/context/LanguageContext';

function DatenschutzContent() {
    const { t, language, setLanguage } = useLanguageStore();

    useEffect(() => {
        const pathLang = window.location.pathname.split('/')[1];
        if (pathLang === 'de' || pathLang === 'en' || pathLang === 'tr') {
            setLanguage(pathLang);
        }
    }, [setLanguage]);

    const content = {
        tr: {
            title: 'Gizlilik Politikası',
            lastUpdated: 'Son Güncelleme: 11 Ocak 2025',
            intro: 'RestXQr olarak güvenliğinize önem veriyoruz. Bu politika, dijital menü hizmetlerimiz sırasında verilerinizin nasıl işlendiğini belirtir.',
            dataCollection: {
                title: 'Hangi Verileri Topluyoruz?',
                text: 'Hizmet kalitemizi artırmak adına şu verileri işleyebiliriz:',
                list: [
                    'İletişim bilgileri (Ad, E-posta, Telefon)',
                    'Restoran işletme bilgileri',
                    'Sistem kullanım istatistikleri',
                    'IP adresi ve tarayıcı bilgileri (Güvenlik amaçlı)'
                ]
            },
            dataUse: {
                title: 'Verilerin Kullanım Amacı',
                text: 'Toplanan veriler şu amaçlarla sınırlı kalmak kaydıyla kullanılır:',
                list: [
                    'Sipariş süreçlerinin yönetimi',
                    'Kullanıcı paneline erişim sağlanması',
                    'Yazılım güncellemeleri ve teknik destek',
                    'Yasal bildirimlerin yapılması'
                ]
            },
            dataProtection: {
                title: 'Veri Güvenliği',
                text: 'Verileriniz endüstri standardı SSL sertifikaları ve şifrelenmiş veri tabanları ile korunmaktadır. Üçüncü şahıslarla ticari amaçla paylaşılmaz.'
            },
            rights: {
                title: 'Kullanıcı Hakları',
                text: 'KVKK ve GDPR kapsamında şu haklara sahipsiniz:',
                list: [
                    'Verilerinizin kopyasını talep etme',
                    'Hatalı bilgilerin düzeltilmesini isteme',
                    'Hesap silme ile birlikte verilerin yok edilmesini talep etme'
                ]
            },
            contact: {
                title: 'Bize Ulaşın',
                text: 'Veri güvenliği hakkında sorularınız için:',
                email: 'privacy@restxqr.com',
                phone: '+43 660 868 22 01'
            }
        },
        de: {
            title: 'Datenschutzerklärung',
            lastUpdated: 'Letzte Aktualisierung: 11. Januar 2025',
            intro: 'Detaillierte Informationen zum Schutz Ihrer persönlichen Daten bei der Nutzung von RestXQr.',
            dataCollection: {
                title: 'Datenerfassung',
                text: 'Wir erfassen folgende Daten zur Optimierung unserer Dienste:',
                list: [
                    'Kontaktdaten (Name, E-Mail)',
                    'Unternehmensdaten für Rechnungsstellung',
                    'Nutzungsstatistiken',
                    'Sicherheitsrelevante Logfiles'
                ]
            },
            dataUse: {
                title: 'Verwendung der Daten',
                text: 'Die Daten werden ausschließlich verwendet für:',
                list: [
                    'Bereitstellung der digitalen Menüplattform',
                    'Supportanfragen',
                    'Systemstabilität und Sicherheit'
                ]
            },
            dataProtection: {
                title: 'Sicherheit',
                text: 'Ihre Daten werden nach modernsten Sicherheitsstandards (SSL/Verschlüsselung) gespeichert.'
            },
            rights: {
                title: 'Ihre Rechte',
                text: 'Sie haben das Recht auf Auskunft, Löschung und Berichtigung Ihrer Daten gemäß DSGVO.',
                list: [
                    'Recht auf Auskunft',
                    'Recht auf Löschung',
                    'Recht auf Datenübertragbarkeit'
                ]
            },
            contact: {
                title: 'Kontakt',
                text: 'Bei Fragen zum Datenschutz:',
                email: 'privacy@restxqr.com',
                phone: '+43 660 868 22 01'
            }
        },
        en: {
            title: 'Privacy Policy',
            lastUpdated: 'Last Updated: January 11, 2025',
            intro: 'Learn how RestXQr handles your private information with care and security.',
            dataCollection: {
                title: 'Data Collection',
                text: 'We collect certain data to provide better services:',
                list: [
                    'Contact information',
                    'Business details',
                    'Analytic data for performance',
                    'Security logs'
                ]
            },
            dataUse: {
                title: 'Purpose of Processing',
                text: 'Data is used for:',
                list: [
                    'Managing digital menu operations',
                    'Customer support',
                    'Fulfilling legal and billing requirements'
                ]
            },
            dataProtection: {
                title: 'Data Security',
                text: 'Standard encryption techniques are used to protect your data across our platforms.'
            },
            rights: {
                title: 'Your Rights',
                text: 'Under GDPR, you have several rights regarding your data:',
                list: [
                    'Right to access',
                    'Right to be forgotten',
                    'Right to data correction'
                ]
            },
            contact: {
                title: 'Contact Us',
                text: 'For any privacy concerns:',
                email: 'privacy@restxqr.com',
                phone: '+43 660 868 22 01'
            }
        }
    };

    const currentContent = content[language as keyof typeof content] || content.de;

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
                            <FaShieldAlt className="text-3xl text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-900">{currentContent.title}</h1>
                            <p className="text-gray-500 mt-2">{currentContent.lastUpdated}</p>
                        </div>
                    </div>

                    <div className="prose prose-lg max-w-none mt-8 space-y-8">
                        <p className="text-gray-700 text-lg leading-relaxed">{currentContent.intro}</p>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentContent.dataCollection.title}</h2>
                            <p className="text-gray-700 mb-4">{currentContent.dataCollection.text}</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                {currentContent.dataCollection.list.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentContent.dataUse.title}</h2>
                            <p className="text-gray-700 mb-4">{currentContent.dataUse.text}</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                {currentContent.dataUse.list.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentContent.dataProtection.title}</h2>
                            <p className="text-gray-700 leading-relaxed">{currentContent.dataProtection.text}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentContent.rights.title}</h2>
                            <p className="text-gray-700 mb-4">{currentContent.rights.text}</p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                {currentContent.rights.list.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
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

export default function DatenschutzPage() {
    return (
        <LanguageProvider>
            <DatenschutzContent />
        </LanguageProvider>
    );
}
