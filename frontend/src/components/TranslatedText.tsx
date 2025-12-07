'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface TranslatedTextProps {
  children: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export default function TranslatedText({
  children,
  className = '',
  as: Component = 'span'
}: TranslatedTextProps) {
  const { translate, currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState(children);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Only run on client side

    // Static dictionary for common UI terms to avoid API calls and ensure instant switching
    const staticTranslations: { [key: string]: { [key: string]: string } } = {
      'Menü': { 'en': 'Menu', 'de': 'Menü', 'tr': 'Menü', 'ar': 'قائمة', 'ru': 'Меню', 'fr': 'Menu', 'es': 'Menú', 'it': 'Menu' },
      'Sepet': { 'en': 'Cart', 'de': 'Warenkorb', 'tr': 'Sepet', 'ar': 'سلة', 'ru': 'Корзина', 'fr': 'Panier', 'es': 'Carrito', 'it': 'Carrello' },
      'Garson Çağır': { 'en': 'Call Waiter', 'de': 'Kellner rufen', 'tr': 'Garson Çağır', 'ar': 'نداء النادل', 'ru': 'Вызов официанта', 'fr': 'Appeler serveur', 'es': 'Llamar camarero', 'it': 'Chiama cameriere' },
      'Detayları Gör': { 'en': 'View Details', 'de': 'Details', 'tr': 'Detayları Gör', 'ar': 'عرض التفاصيل', 'ru': 'Подробнее', 'fr': 'Voir détails', 'es': 'Ver detalles', 'it': 'Vedi dettagli' },
      'Sepete Ekle': { 'en': 'Add to Cart', 'de': 'In den Warenkorb', 'tr': 'Sepete Ekle', 'ar': 'أضف إلى السلة', 'ru': 'В корзину', 'fr': 'Ajouter', 'es': 'Añadir', 'it': 'Aggiungi' },
      'Popüler': { 'en': 'Popular', 'de': 'Beliebt', 'tr': 'Popüler', 'ar': 'شائع', 'ru': 'Популярное', 'fr': 'Populaire', 'es': 'Popular', 'it': 'Popolare' },
      'Menüde ara...': { 'en': 'Search menu...', 'de': 'Menü durchsuchen...', 'tr': 'Menüde ara...', 'ar': 'بحث في القائمة...', 'ru': 'Поиск по меню...', 'fr': 'Rechercher...', 'es': 'Buscar...', 'it': 'Cerca...' },
      'WiFi Şifresi': { 'en': 'WiFi Password', 'de': 'WLAN-Passwort', 'tr': 'WiFi Şifresi', 'ar': 'كلمة مرور WiFi', 'ru': 'Пароль WiFi', 'fr': 'Mot de passe WiFi', 'es': 'Contraseña WiFi', 'it': 'Password WiFi' },
      "Google'da Değerlendir": { 'en': 'Rate on Google', 'de': 'Auf Google bewerten', 'tr': "Google'da Değerlendir", 'ar': 'قيم على جوجل', 'ru': 'Оценить в Google', 'fr': 'Évaluer sur Google', 'es': 'Calificar en Google', 'it': 'Valuta su Google' },
      'Yorum Yap': { 'en': 'Review', 'de': 'Bewerten', 'tr': 'Yorum Yap', 'ar': 'مراجعة', 'ru': 'Отзыв', 'fr': 'Avis', 'es': 'Reseña', 'it': 'Recensione' },
      'Çalışma Saatleri': { 'en': 'Working Hours', 'de': 'Öffnungszeiten', 'tr': 'Çalışma Saatleri', 'ar': 'ساعات العمل', 'ru': 'Часы работы', 'fr': 'Heures ouverture', 'es': 'Horario', 'it': 'Orari' },
      "Instagram'da Takip Et": { 'en': 'Follow on Instagram', 'de': 'Auf Instagram folgen', 'tr': "Instagram'da Takip Et", 'ar': 'تابع على انستغرام', 'ru': 'Instagram', 'fr': 'Suivre Instagram', 'es': 'Seguir Instagram', 'it': 'Segui Instagram' },
      'WiFi Password': { 'en': 'WiFi Password', 'de': 'WLAN-Passwort', 'tr': 'WiFi Şifresi', 'ar': 'كلمة مرور WiFi', 'ru': 'Пароль WiFi', 'fr': 'Mot de passe WiFi', 'es': 'Contraseña WiFi', 'it': 'Password WiFi' },
    };

    const translateContent = async () => {
      // Check static dictionary first
      const langCode = currentLanguage === 'German' ? 'de' :
        (currentLanguage === 'English' ? 'en' :
          (currentLanguage === 'Turkish' ? 'tr' :
            (currentLanguage === 'Arabic' ? 'ar' :
              (currentLanguage === 'Russian' ? 'ru' :
                (currentLanguage === 'French' ? 'fr' :
                  (currentLanguage === 'Spanish' ? 'es' :
                    (currentLanguage === 'Italian' ? 'it' : 'en')))))));

      if (staticTranslations[children] && staticTranslations[children][langCode]) {
        console.log(`Using static translation for "${children}": ${staticTranslations[children][langCode]}`);
        setTranslatedText(staticTranslations[children][langCode]);
        return;
      }

      if (currentLanguage === 'Turkish') {
        setTranslatedText(children);
        return;
      }

      setIsLoading(true);
      try {
        const translated = await translate(children);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedText(children);
      } finally {
        setIsLoading(false);
      }
    };

    translateContent();
  }, [children, currentLanguage, translate, isClient]);

  return (
    <Component className={`${className} ${isLoading ? 'opacity-70' : ''}`}>
      {translatedText}
    </Component>
  );
}
