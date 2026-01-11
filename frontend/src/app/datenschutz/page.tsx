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
            intro: 'Bu Gizlilik Politikası, restXqr olarak kişisel verilerinizi nasıl topladığımız, kullandığımız ve koruduğumuzu açıklamaktadır.',
            dataCollection: {
                title: 'Veri Toplama',
                text: 'Aşağıdaki bilgileri toplayabiliriz:',
                list: [
                    'İsim ve iletişim bilgileri',
                    'E-posta adresi',
                    'Telefon numarası',
                    'Kullanım verileri ve analitik bilgiler'
                ]
            },
            dataUse: {
                title: 'Veri Kullanımı',
                text: 'Toplanan veriler aşağıdaki amaçlarla kullanılır:',
                list: [
                    'Hizmetlerimizi sağlamak ve iyileştirmek',
                    'Müşteri desteği sunmak',
                    'Yasal yükümlülükleri yerine getirmek',
                    'Güvenliği sağlamak'
                ]
            },
            dataProtection: {
                title: 'Veri Koruma',
                text: 'Kişisel verilerinizin güvenliğini sağlamak için uygun teknik ve organizasyonel önlemler alıyoruz.'
            },
            rights: {
                title: 'Haklarınız',
                text: 'Aşağıdaki haklara sahipsiniz:',
                list: [
                    'Kişisel verilerinize erişim hakkı',
                    'Verilerinizin düzeltilmesini talep etme hakkı',
                    'Verilerinizin silinmesini talep etme hakkı',
                    'Veri işlemeye itiraz etme hakkı'
                ]
            },
            contact: {
                title: 'İletişim',
                text: 'Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:',
                email: 'info@restxqr.com',
                phone: '+43 660 868 22 01'
            }
        },
        de: {
            title: 'Datenschutzerklärung',
            lastUpdated: 'Letzte Aktualisierung: 11. Januar 2025',
            intro: 'Diese Datenschutzerklärung erklärt, wie restXqr Ihre persönlichen Daten sammelt, verwendet und schützt.',
            dataCollection: {
                title: 'Datenerfassung',
                text: 'Wir können folgende Informationen sammeln:',
                list: [
                    'Name und Kontaktinformationen',
                    'E-Mail-Adresse',
                    'Telefonnummer',
                    'Nutzungsdaten und Analysedaten'
                ]
            },
            dataUse: {
                title: 'Datenverwendung',
                text: 'Die gesammelten Daten werden für folgende Zwecke verwendet:',
                list: [
                    'Bereitstellung und Verbesserung unserer Dienste',
                    'Kundensupport',
                    'Erfüllung gesetzlicher Verpflichtungen',
                    'Gewährleistung der Sicherheit'
                ]
            },
            dataProtection: {
                title: 'Datenschutz',
                text: 'Wir ergreifen angemessene technische und organisatorische Maßnahmen, um die Sicherheit Ihrer persönlichen Daten zu gewährleisten.'
            },
            rights: {
                title: 'Ihre Rechte',
                text: 'Sie haben folgende Rechte:',
                list: [
                    'Recht auf Zugang zu Ihren persönlichen Daten',
                    'Recht auf Berichtigung Ihrer Daten',
                    'Recht auf Löschung Ihrer Daten',
                    'Recht auf Widerspruch gegen die Datenverarbeitung'
                ]
            },
            contact: {
                title: 'Kontakt',
                text: 'Bei Fragen zu unserer Datenschutzerklärung können Sie uns kontaktieren:',
                email: 'info@restxqr.com',
                phone: '+43 660 868 22 01'
            }
        },
        en: {
            title: 'Privacy Policy',
            lastUpdated: 'Last Updated: January 11, 2025',
            intro: 'This Privacy Policy explains how restXqr collects, uses, and protects your personal data.',
            dataCollection: {
                title: 'Data Collection',
                text: 'We may collect the following information:',
                list: [
                    'Name and contact information',
                    'Email address',
                    'Phone number',
                    'Usage data and analytics'
                ]
            },
            dataUse: {
                title: 'Data Use',
                text: 'The collected data is used for the following purposes:',
                list: [
                    'Providing and improving our services',
                    'Customer support',
                    'Fulfilling legal obligations',
                    'Ensuring security'
                ]
            },
            dataProtection: {
                title: 'Data Protection',
                text: 'We take appropriate technical and organizational measures to ensure the security of your personal data.'
            },
            rights: {
                title: 'Your Rights',
                text: 'You have the following rights:',
                list: [
                    'Right to access your personal data',
                    'Right to rectification of your data',
                    'Right to erasure of your data',
                    'Right to object to data processing'
                ]
            },
            contact: {
                title: 'Contact',
                text: 'For questions about our privacy policy, you can contact us:',
                email: 'info@restxqr.com',
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
