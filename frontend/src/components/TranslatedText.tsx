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
      // Cart Page Terms
      'Sepetiniz boş': { 'en': 'Your cart is empty', 'de': 'Ihr Warenkorb ist leer', 'tr': 'Sepetiniz boş', 'ar': 'سلة التسوق فارغة', 'ru': 'Ваша корзина пуста', 'fr': 'Votre panier est vide', 'es': 'Tu carrito está vacío', 'it': 'Il tuo carrello è vuoto' },
      'Menüden ürün ekleyerek başlayın': { 'en': 'Start by adding items from the menu', 'de': 'Beginnen Sie mit dem Hinzufügen von Artikeln aus dem Menü', 'tr': 'Menüden ürün ekleyerek başlayın', 'ar': 'ابدأ بإضافة عناصر من القائمة', 'ru': 'Начните с добавления блюд из меню', 'fr': 'Commencez par ajouter des articles du menu', 'es': 'Empieza añadiendo artículos del menú', 'it': 'Inizia aggiungendo articoli dal menu' },
      'Menüye Git': { 'en': 'Go to Menu', 'de': 'Zum Menü', 'tr': 'Menüye Git', 'ar': 'الذهاب للقائمة', 'ru': 'Перейти в меню', 'fr': 'Aller au menu', 'es': 'Ir al menú', 'it': 'Vai al menu' },
      'Ödeme Seçenekleri': { 'en': 'Payment Options', 'de': 'Zahlungsmöglichkeiten', 'tr': 'Ödeme Seçenekleri', 'ar': 'خيارات الدفع', 'ru': 'Варианты оплаты', 'fr': 'Options de paiement', 'es': 'Opciones de pago', 'it': 'Opzioni di pagamento' },
      'Kart': { 'en': 'Card', 'de': 'Karte', 'tr': 'Kart', 'ar': 'بطاقة', 'ru': 'Карта', 'fr': 'Carte', 'es': 'Tarjeta', 'it': 'Carta' },
      'Nakit': { 'en': 'Cash', 'de': 'Bar', 'tr': 'Nakit', 'ar': 'نقدي', 'ru': 'Наличные', 'fr': 'Espèces', 'es': 'Efectivo', 'it': 'Contanti' },
      'Garsona Bahşiş': { 'en': 'Tip to Waiter', 'de': 'Trinkgeld', 'tr': 'Garsona Bahşiş', 'ar': 'بقشيش للنادل', 'ru': 'Чаевые официанту', 'fr': 'Pourboire', 'es': 'Propina', 'it': 'Mancia al cameriere' },
      'Bağış Yap': { 'en': 'Donate', 'de': 'Spenden', 'tr': 'Bağış Yap', 'ar': 'تبرع', 'ru': 'Пожертвовать', 'fr': 'Faire un don', 'es': 'Donar', 'it': 'Fai una donazione' },
      'Sipariş Özeti': { 'en': 'Order Summary', 'de': 'Bestellübersicht', 'tr': 'Sipariş Özeti', 'ar': 'ملخص الطلب', 'ru': 'Сводка заказа', 'fr': 'Résumé de la commande', 'es': 'Resumen del pedido', 'it': 'Riepilogo ordine' },
      'Ara Toplam': { 'en': 'Subtotal', 'de': 'Zwischensumme', 'tr': 'Ara Toplam', 'ar': 'المجموع الفرعي', 'ru': 'Подитог', 'fr': 'Sous-total', 'es': 'Subtotal', 'it': 'Totale parziale' },
      'Bahşiş': { 'en': 'Tip', 'de': 'Gesamt', 'tr': 'Bahşiş', 'ar': 'بقشيش', 'ru': 'Чаевые', 'fr': 'Pourboire', 'es': 'Propina', 'it': 'Mancia' },
      'Bağış': { 'en': 'Donation', 'de': 'Spende', 'tr': 'Bağış', 'ar': 'تبرع', 'ru': 'Пожертвование', 'fr': 'Don', 'es': 'Donación', 'it': 'Donazione' },
      'Toplam': { 'en': 'Total', 'de': 'Gesamt', 'tr': 'Toplam', 'ar': 'المجموع', 'ru': 'Итого', 'fr': 'Total', 'es': 'Total', 'it': 'Totale' },
      'Ödemeyi Tamamla': { 'en': 'Complete Payment', 'de': 'Zahlung abschließen', 'tr': 'Ödemeyi Tamamla', 'ar': 'إتمام الدفع', 'ru': 'Завершить оплату', 'fr': 'Payer', 'es': 'Completar pago', 'it': 'Completa pagamento' },
      'Ödeme Onayı': { 'en': 'Payment Confirmation', 'de': 'Zahlungsbestätigung', 'tr': 'Ödeme Onayı', 'ar': 'تأكيد الدفع', 'ru': 'Подтверждение оплаты', 'fr': 'Confirmation de paiement', 'es': 'Confirmación de pago', 'it': 'Conferma pagamento' },
      'Toplam Tutar:': { 'en': 'Total Amount:', 'de': 'Gesamtbetrag:', 'tr': 'Toplam Tutar:', 'ar': 'المبلغ الإجمالي:', 'ru': 'Общая сумма:', 'fr': 'Montant total :', 'es': 'Importe total:', 'it': 'Importo totale:' },
      'İptal': { 'en': 'Cancel', 'de': 'Abbrechen', 'tr': 'İptal', 'ar': 'إلغاء', 'ru': 'Отмена', 'fr': 'Annuler', 'es': 'Cancelar', 'it': 'Annulla' },
      'Öde': { 'en': 'Pay', 'de': 'Bezahlen', 'tr': 'Öde', 'ar': 'دفع', 'ru': 'Оплатить', 'fr': 'Payer', 'es': 'Pagar', 'it': 'Paga' },
      'Bahşiş Miktarı': { 'en': 'Tip Amount', 'de': 'Trinkgeldbetrag', 'tr': 'Bahşiş Miktarı', 'ar': 'مبلغ الإكرامية', 'ru': 'Сумма чаевых', 'fr': 'Montant du pourboire', 'es': 'Monto de propina', 'it': 'Importo mancia' },
      'Hızlı Seçim': { 'en': 'Quick Select', 'de': 'Schnellauswahl', 'tr': 'Hızlı Seçim', 'ar': 'تحديد سريع', 'ru': 'Быстрый выбор', 'fr': 'Sélection rapide', 'es': 'Selección rápida', 'it': 'Selezione rapida' },
      'Manuel Miktar': { 'en': 'Manual Amount', 'de': 'Manueller Betrag', 'tr': 'Manuel Miktar', 'ar': 'مبلغ يدوي', 'ru': 'Ручной ввод', 'fr': 'Montant manuel', 'es': 'Monto manual', 'it': 'Importo manuale' },
      'Tamam': { 'en': 'OK', 'de': 'OK', 'tr': 'Tamam', 'ar': 'موافق', 'ru': 'ОК', 'fr': 'OK', 'es': 'OK', 'it': 'OK' },
      'Bağış Miktarı': { 'en': 'Donation Amount', 'de': 'Spendenbetrag', 'tr': 'Bağış Miktarı', 'ar': 'مبلغ التبرع', 'ru': 'Сумма пожертвования', 'fr': 'Montant du don', 'es': 'Monto de donación', 'it': 'Importo donazione' },
      // Call Waiter Page Terms
      'Masa Numaranız': { 'en': 'Your Table Number', 'de': 'Ihre Tischnummer', 'tr': 'Masa Numaranız', 'ar': 'رقم طاولتك', 'ru': 'Ваш номер стола', 'fr': 'Votre numéro de table', 'es': 'Tu número de mesa', 'it': 'Il tuo numero di tavolo' },
      'Hızlı İstekler': { 'en': 'Quick Requests', 'de': 'Schnellanfragen', 'tr': 'Hızlı İstekler', 'ar': 'طلبات سريعة', 'ru': 'Быстрые запросы', 'fr': 'Demandes rapides', 'es': 'Solicitudes rápidas', 'it': 'Richieste rapide' },
      'Su Getir': { 'en': 'Bring Water', 'de': 'Wasser bringen', 'tr': 'Su Getir', 'ar': 'إحضر ماء', 'ru': 'Принести воды', 'fr': 'Apporter de l\'eau', 'es': 'Traer agua', 'it': 'Porta acqua' },
      'Hesap İste': { 'en': 'Ask for Bill', 'de': 'Rechnung bitten', 'tr': 'Hesap İste', 'ar': 'طلب الفاتورة', 'ru': 'Попросить счет', 'fr': 'Demander l\'addition', 'es': 'Pedir la cuenta', 'it': 'Chiedi il conto' },
      'Masayı Temizle': { 'en': 'Clean Table', 'de': 'Tisch reinigen', 'tr': 'Masayı Temizle', 'ar': 'نظف الطاولة', 'ru': 'Убрать со стола', 'fr': 'Nettoyer la table', 'es': 'Limpiar mesa', 'it': 'Pulisci tavolo' },
      'Yardım Gerekiyor': { 'en': 'Need Help', 'de': 'Hilfe benötigt', 'tr': 'Yardım Gerekiyor', 'ar': 'بحاجة للمساعدة', 'ru': 'Нужна помощь', 'fr': 'Besoin d\'aide', 'es': 'Necesito ayuda', 'it': 'Serve aiuto' },
      'Özel İstek': { 'en': 'Special Request', 'de': 'Sonderwunsch', 'tr': 'Özel İstek', 'ar': 'طلب خاص', 'ru': 'Особый запрос', 'fr': 'Demande spéciale', 'es': 'Solicitud especial', 'it': 'Richiesta speciale' },
      'İsteğinizi buraya yazın...': { 'en': 'Type your request here...', 'de': 'Geben Sie hier Ihre Anfrage ein...', 'tr': 'İsteğinizi buraya yazın...', 'ar': 'اكتب طلبك هنا...', 'ru': 'Введите ваш запрос здесь...', 'fr': 'Tapez votre demande ici...', 'es': 'Escribe tu solicitud aquí...', 'it': 'Scrivi qui la tua richiesta...' },
      'İstek Gönder': { 'en': 'Send Request', 'de': 'Anfrage senden', 'tr': 'İstek Gönder', 'ar': 'إرسال الطلب', 'ru': 'Отправить запрос', 'fr': 'Envoyer la demande', 'es': 'Enviar solicitud', 'it': 'Invia richiesta' },
      'Aktif İstekler': { 'en': 'Active Requests', 'de': 'Aktive Anfragen', 'tr': 'Aktif İstekler', 'ar': 'الطلبات النشطة', 'ru': 'Активные запросы', 'fr': 'Demandes actives', 'es': 'Solicitudes activas', 'it': 'Richieste attive' },
      'Kaldır': { 'en': 'Remove', 'de': 'Entfernen', 'tr': 'Kaldır', 'ar': 'إزالة', 'ru': 'Удалить', 'fr': 'Supprimer', 'es': 'Eliminar', 'it': 'Rimuovi' },
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
