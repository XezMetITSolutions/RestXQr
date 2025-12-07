'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export const staticDictionary: { [key: string]: { [key: string]: string } } = {
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

  // Dashboard Terms
  'Kontrol Paneli': { 'en': 'Dashboard', 'de': 'Dashboard', 'tr': 'Kontrol Paneli', 'ar': 'لوحة القيادة', 'ru': 'Панель управления', 'fr': 'Tableau de bord', 'es': 'Panel de control', 'it': 'Pannello di controllo' },
  'Hoş geldiniz': { 'en': 'Welcome', 'de': 'Willkommen', 'tr': 'Hoş geldiniz', 'ar': 'أهلا بك', 'ru': 'Добро пожаловать', 'fr': 'Bienvenue', 'es': 'Bienvenido', 'it': 'Benvenuto' },
  'Premium Plan': { 'en': 'Premium Plan', 'de': 'Premium-Plan', 'tr': 'Premium Plan', 'ar': 'خطة مميزة', 'ru': 'Премиум план', 'fr': 'Plan Premium', 'es': 'Plan Premium', 'it': 'Piano Premium' },
  'Bugünkü Siparişler': { 'en': 'Today\'s Orders', 'de': 'Heutige Bestellungen', 'tr': 'Bugünkü Siparişler', 'ar': 'طلبات اليوم', 'ru': 'Заказы сегодня', 'fr': 'Commandes d\'aujourd\'hui', 'es': 'Pedidos de hoy', 'it': 'Ordini di oggi' },
  'Bugünkü Ciro': { 'en': 'Today\'s Revenue', 'de': 'Heutiger Umsatz', 'tr': 'Bugünkü Ciro', 'ar': 'إيرادات اليوم', 'ru': 'Выручка сегодня', 'fr': 'Chiffre d\'affaires du jour', 'es': 'Ingresos de hoy', 'it': 'Entrate di oggi' },
  'Aktif durumda': { 'en': 'Active', 'de': 'Aktiv', 'tr': 'Aktif durumda', 'ar': 'نشط', 'ru': 'Активный', 'fr': 'Actif', 'es': 'Activo', 'it': 'Attivo' },
  'Artış trendi': { 'en': 'Upward trend', 'de': 'Aufwärtstrend', 'tr': 'Artış trendi', 'ar': 'اتجاه تصاعدي', 'ru': 'Восходящий тренд', 'fr': 'Tendance à la hausse', 'es': 'Tendencia al alza', 'it': 'Trend in crescita' },
  'Toplam Masa': { 'en': 'Total Tables', 'de': 'Tische gesamt', 'tr': 'Toplam Masa', 'ar': 'إجمالي الطاولات', 'ru': 'Всего столов', 'fr': 'Total des tables', 'es': 'Total mesas', 'it': 'Totale tavoli' },
  'Masa yönetimi aktif': { 'en': 'Table management active', 'de': 'Tischverwaltung aktiv', 'tr': 'Masa yönetimi aktif', 'ar': 'إدارة الجدول نشطة', 'ru': 'Управление столами активно', 'fr': 'Gestion des tables active', 'es': 'Gestión de mesas activa', 'it': 'Gestione tavoli attiva' },
  'Hızlı İşlemler': { 'en': 'Quick Actions', 'de': 'Schnellaktionen', 'tr': 'Hızlı İşlemler', 'ar': 'إجراءات سريعة', 'ru': 'Быстрые действия', 'fr': 'Actions rapides', 'es': 'Acciones rápidas', 'it': 'Azioni rapide' },
  'Yeni Ürün': { 'en': 'New Item', 'de': 'Neues Produkt', 'tr': 'Yeni Ürün', 'ar': 'عنصر جديد', 'ru': 'Новый товар', 'fr': 'Nouvel article', 'es': 'Nuevo artículo', 'it': 'Nuovo articolo' },
  'Siparişleri Gör': { 'en': 'View Orders', 'de': 'Bestellungen ansehen', 'tr': 'Siparişleri Gör', 'ar': 'عرض الطلبات', 'ru': 'Смотреть заказы', 'fr': 'Voir les commandes', 'es': 'Ver pedidos', 'it': 'Visualizza ordini' },
  'Menüyü Düzenle': { 'en': 'Edit Menu', 'de': 'Menü bearbeiten', 'tr': 'Menüyü Düzenle', 'ar': 'تعديل القائمة', 'ru': 'Редактировать меню', 'fr': 'Modifier le menu', 'es': 'Editar menú', 'it': 'Modifica menu' },
  'Duyurular (Aktif)': { 'en': 'Announcements (Active)', 'de': 'Ankündigungen (Aktiv)', 'tr': 'Duyurular (Aktif)', 'ar': 'الإعلانات (نشطة)', 'ru': 'Объявления (Активные)', 'fr': 'Annonces (Actives)', 'es': 'Anuncios (Activos)', 'it': 'Annunci (Attivi)' },
  'Aylık Performans': { 'en': 'Monthly Performance', 'de': 'Monatliche Leistung', 'tr': 'Aylık Performans', 'ar': 'الأداء الشهري', 'ru': 'Месячная эффективность', 'fr': 'Performance mensuelle', 'es': 'Rendimiento mensual', 'it': 'Performance mensile' },
  'Bu ay harika gidiyorsunuz! 🚀': { 'en': 'You are doing great this month! 🚀', 'de': 'Sie machen das diesen Monat großartig! 🚀', 'tr': 'Bu ay harika gidiyorsunuz! 🚀', 'ar': 'أنت تقوم بعمل رائع هذا الشهر! 🚀', 'ru': 'Отличная работа в этом месяце! 🚀', 'fr': 'Vous vous débrouillez très bien ce mois-ci ! 🚀', 'es': '¡Lo estás haciendo genial este mes! 🚀', 'it': 'Stai andando alla grande questo mese! 🚀' },
  'Henüz veri bulunmuyor 📊': { 'en': 'No data yet 📊', 'de': 'Noch keine Daten 📊', 'tr': 'Henüz veri bulunmuyor 📊', 'ar': 'لا توجد بيانات بعد 📊', 'ru': 'Данных пока нет 📊', 'fr': 'Pas encore de données 📊', 'es': 'Aún no hay datos 📊', 'it': 'Ancora nessun dato 📊' },
  'Aylık Ciro': { 'en': 'Monthly Revenue', 'de': 'Monatlicher Umsatz', 'tr': 'Aylık Ciro', 'ar': 'الإيرادات الشهرية', 'ru': 'Ежемесячная выручка', 'fr': 'Revenu mensuel', 'es': 'Ingresos mensuales', 'it': 'Entrate mensili' },
  'Toplam Sipariş': { 'en': 'Total Orders', 'de': 'Gesamtbestellungen', 'tr': 'Toplam Sipariş', 'ar': 'إجمالي الطلبات', 'ru': 'Всего заказов', 'fr': 'Commandes totales', 'es': 'Pedidos totales', 'it': 'Ordini totali' },
  'Ortalama Puan': { 'en': 'Average Rating', 'de': 'Durchschnittliche Bewertung', 'tr': 'Ortalama Puan', 'ar': 'متوسط التقييم', 'ru': 'Средний рейтинг', 'fr': 'Note moyenne', 'es': 'Calificación promedio', 'it': 'Valutazione media' },
  'Müşteri Memnuniyeti': { 'en': 'Customer Satisfaction', 'de': 'Kundenzufriedenheit', 'tr': 'Müşteri Memnuniyeti', 'ar': 'رضا العملاء', 'ru': 'Удовлетворенность клиентов', 'fr': 'Satisfaction client', 'es': 'Satisfacción del cliente', 'it': 'Soddisfazione del cliente' },

  // Sidebar Terms
  'Siparişler': { 'en': 'Orders', 'de': 'Bestellungen', 'tr': 'Siparişler', 'ar': 'الطلبات', 'ru': 'Заказы', 'fr': 'Commandes', 'es': 'Pedidos', 'it': 'Ordini' },
  'Menü Yönetimi': { 'en': 'Menu Management', 'de': 'Menüverwaltung', 'tr': 'Menü Yönetimi', 'ar': 'إدارة القائمة', 'ru': 'Управление меню', 'fr': 'Gestion du menu', 'es': 'Gestión de menú', 'it': 'Gestione menu' },
  'QR Kodlar': { 'en': 'QR Codes', 'de': 'QR-Codes', 'tr': 'QR Kodlar', 'ar': 'رموز الاستجابة السريعة', 'ru': 'QR-коды', 'fr': 'Codes QR', 'es': 'Códigos QR', 'it': 'Codici QR' },
  'Masa Yönetimi': { 'en': 'Table Management', 'de': 'Tischverwaltung', 'tr': 'Masa Yönetimi', 'ar': 'إدارة الجدول', 'ru': 'Управление столами', 'fr': 'Gestion des tables', 'es': 'Gestión de mesas', 'it': 'Gestione tavoli' },
  'Personel': { 'en': 'Staff', 'de': 'Personal', 'tr': 'Personel', 'ar': 'الموظفين', 'ru': 'Персонал', 'fr': 'Personnel', 'es': 'Personal', 'it': 'Personale' },
  'Raporlar': { 'en': 'Reports', 'de': 'Berichte', 'tr': 'Raporlar', 'ar': 'التقارير', 'ru': 'Отчеты', 'fr': 'Rapports', 'es': 'Informes', 'it': 'Rapporti' },
  'Ayarlar': { 'en': 'Settings', 'de': 'Einstellungen', 'tr': 'Ayarlar', 'ar': 'الإعدادات', 'ru': 'Настройки', 'fr': 'Paramètres', 'es': 'Ajustes', 'it': 'Impostazioni' },
  'Destek': { 'en': 'Support', 'de': 'Support', 'tr': 'Destek', 'ar': 'الدعم', 'ru': 'Поддержка', 'fr': 'Support', 'es': 'Soporte', 'it': 'Supporto' },
  'Stok Yönetimi': { 'en': 'Inventory Management', 'de': 'Bestandsverwaltung', 'tr': 'Stok Yönetimi', 'ar': 'إدارة المخزون', 'ru': 'Управление запасами', 'fr': 'Gestion des stocks', 'es': 'Gestión de inventario', 'it': 'Gestione inventario' },
  'Şube Yönetimi': { 'en': 'Branch Management', 'de': 'Filialverwaltung', 'tr': 'Şube Yönetimi', 'ar': 'إدارة الفروع', 'ru': 'Управление филиалами', 'fr': 'Gestion des succursales', 'es': 'Gestión de sucursales', 'it': 'Gestione filiali' },
  'API Yönetimi': { 'en': 'API Management', 'de': 'API-Verwaltung', 'tr': 'API Yönetimi', 'ar': 'إدارة API', 'ru': 'Управление API', 'fr': 'Gestion API', 'es': 'Gestión de API', 'it': 'Gestione API' },
  'Paket Servis': { 'en': 'Delivery', 'de': 'Lieferung', 'tr': 'Paket Servis', 'ar': 'توصيل', 'ru': 'Доставка', 'fr': 'Livraison', 'es': 'Entrega', 'it': 'Consegna' },
  'POS Entegrasyonu': { 'en': 'POS Integration', 'de': 'POS-Integration', 'tr': 'POS Entegrasyonu', 'ar': 'تكامل نقاط البيع', 'ru': 'Интеграция POS', 'fr': 'Intégration POS', 'es': 'Integración POS', 'it': 'Integrazione POS' },
  'Muhasebe': { 'en': 'Accounting', 'de': 'Buchhaltung', 'tr': 'Muhasebe', 'ar': 'محاسبة', 'ru': 'Бухгалтерия', 'fr': 'Comptabilité', 'es': 'Contabilidad', 'it': 'Contabilità' },
  'AI Önerileri': { 'en': 'AI Recommendations', 'de': 'KI-Empfehlungen', 'tr': 'AI Önerileri', 'ar': 'توصيات الذكاء الاصطناعي', 'ru': 'Рекомендации ИИ', 'fr': 'Recommandations IA', 'es': 'Recomendaciones de IA', 'it': 'Raccomandazioni AI' },
  'Video Menü': { 'en': 'Video Menu', 'de': 'Videomenü', 'tr': 'Video Menü', 'ar': 'قائمة الفيديو', 'ru': 'Видео меню', 'fr': 'Menu vidéo', 'es': 'Menú de video', 'it': 'Menu video' },
  'Etkinlikler': { 'en': 'Events', 'de': 'Veranstaltungen', 'tr': 'Etkinlikler', 'ar': 'الأحداث', 'ru': 'События', 'fr': 'Événements', 'es': 'Eventos', 'it': 'Eventi' },
  'Yönetim Paneli': { 'en': 'Management Panel', 'de': 'Verwaltungspanel', 'tr': 'Yönetim Paneli', 'ar': 'لوحة الإدارة', 'ru': 'Панель управления', 'fr': 'Panneau de gestion', 'es': 'Panel de gestión', 'it': 'Pannello di gestione' },
  'Çıkış Yap': { 'en': 'Logout', 'de': 'Abmelden', 'tr': 'Çıkış Yap', 'ar': 'تسجيل الخروج', 'ru': 'Выйти', 'fr': 'Se déconnecter', 'es': 'Cerrar sesión', 'it': 'Disconnettersi' },
  'Bugün': { 'en': 'Today', 'de': 'Heute', 'tr': 'Bugün', 'ar': 'اليوم', 'ru': 'Сегодня', 'fr': 'Aujourd\'hui', 'es': 'Hoy', 'it': 'Oggi' },
  'Tümünü Gör →': { 'en': 'See All →', 'de': 'Alle ansehen →', 'tr': 'Tümünü Gör →', 'ar': 'عرض الكل ←', 'ru': 'Смотреть все →', 'fr': 'Voir tout →', 'es': 'Ver todo →', 'it': 'Vedi tutto →' },
  'Hazır': { 'en': 'Ready', 'de': 'Bereit', 'tr': 'Hazır', 'ar': 'جاهز', 'ru': 'Готово', 'fr': 'Prêt', 'es': 'Listo', 'it': 'Pronto' },
  'Hazırlanıyor': { 'en': 'Preparing', 'de': 'Zubereitung', 'tr': 'Hazırlanıyor', 'ar': 'قيد الإعداد', 'ru': 'Готовится', 'fr': 'En préparation', 'es': 'Preparando', 'it': 'In preparazione' },
  'Kaldır': { 'en': 'Remove', 'de': 'Entfernen', 'tr': 'Kaldır', 'ar': 'إزالة', 'ru': 'Удалить', 'fr': 'Supprimer', 'es': 'Eliminar', 'it': 'Rimuovi' },
  'İstek gönderildi!': { 'en': 'Request sent!', 'de': 'Anfrage gesendet!', 'tr': 'İstek gönderildi!', 'ar': 'تم إرسال الطلب!', 'ru': 'Запрос отправлен!', 'fr': 'Demande envoyée !', 'es': '¡Solicitud enviada!', 'it': 'Richiesta inviata!' },
  'İsteğiniz garson ekibimize iletilecektir. En kısa sürede size yardımcı olacağız.': { 'en': 'Your request will be forwarded to our waiter team. We will help you as soon as possible.', 'de': 'Ihre Anfrage wird an unser Serviceteam weitergeleitet. Wir werden Ihnen so schnell wie möglich helfen.', 'tr': 'İsteğiniz garson ekibimize iletilecektir. En kısa sürede size yardımcı olacağız.', 'ar': 'سيتم إرسال طلبك إلى فريق النادل لدينا. سنساعدك في أقرب وقت ممكن.', 'ru': 'Ваш запрос будет передан нашей команде официантов. Мы поможем вам как можно скорее.', 'fr': 'Votre demande sera transmise à notre équipe de serveurs. Nous vous aiderons dès que possible.', 'es': 'Su solicitud será enviada a nuestro equipo de camareros. Le ayudaremos lo antes posible.', 'it': 'La tua richiesta verrà inoltrata al nostro team di camerieri. Ti aiuteremo il prima possibile.' },

  // New Terms for Menu Management
  'Durum': { 'en': 'Status', 'de': 'Status', 'tr': 'Durum' },
  'Tümü': { 'en': 'All', 'de': 'Alle', 'tr': 'Tümü' },
  'Mevcut': { 'en': 'Available', 'de': 'Vorhanden', 'tr': 'Mevcut' },
  'Tükendi': { 'en': 'Out of Stock', 'de': 'Ausverkauft', 'tr': 'Tükendi' },
  'Tükenen ürünleri göster': { 'en': 'Show out of stock items', 'de': 'Ausverkaufte Artikel anzeigen', 'tr': 'Tükenen ürünleri göster' },
  'Ürün': { 'en': 'Product', 'de': 'Produkt', 'tr': 'Ürün' },
  'Kategori': { 'en': 'Category', 'de': 'Kategorie', 'tr': 'Kategori' },
  'Detaylar': { 'en': 'Details', 'de': 'Details', 'tr': 'Detaylar' },
  'Fiyat': { 'en': 'Price', 'de': 'Preis', 'tr': 'Fiyat' },
  'İşlemler': { 'en': 'Actions', 'de': 'Aktionen', 'tr': 'İşlemler' },
  'Ara...': { 'en': 'Search...', 'de': 'Suchen...', 'tr': 'Ara...' },
  'Seçimi Temizle': { 'en': 'Clear Selection', 'de': 'Auswahl löschen', 'tr': 'Seçimi Temizle' },
  'ürün seçildi': { 'en': 'items selected', 'de': 'Elemente ausgewählt', 'tr': 'ürün seçildi' },
  'Fiyat Düzenle': { 'en': 'Edit Price', 'de': 'Preis bearbeiten', 'tr': 'Fiyat Düzenle' },
  'Sil': { 'en': 'Delete', 'de': 'Löschen', 'tr': 'Sil' },
  'Menü Kalemleri': { 'en': 'Menu Items', 'de': 'Menüartikel', 'tr': 'Menü Kalemleri' },
  'Kategoriler': { 'en': 'Categories', 'de': 'Kategorien', 'tr': 'Kategoriler' },
  'İstatistikler': { 'en': 'Statistics', 'de': 'Statistiken', 'tr': 'İstatistikler' },
  'Kategori Yok': { 'en': 'No Category', 'de': 'Keine Kategorie', 'tr': 'Kategori Yok' },
  'Alerjen': { 'en': 'Allergen', 'de': 'Allergene', 'tr': 'Alerjen' },
  'Malzemeler': { 'en': 'Ingredients', 'de': 'Zutaten', 'tr': 'Malzemeler' },
  'Aktif': { 'en': 'Active', 'de': 'Aktiv', 'tr': 'Aktif' },
  'Pasif': { 'en': 'Passive', 'de': 'Passiv', 'tr': 'Pasif' },
  'Backend verileri üzerinden hesaplanır': { 'en': 'Calculated via backend data', 'de': 'Wird über Backend-Daten berechnet', 'tr': 'Backend verileri üzerinden hesaplanır' },
  'Menü İstatistikleri': { 'en': 'Menu Statistics', 'de': 'Menüstatistiken', 'tr': 'Menü İstatistikleri' },
  'Toplam Ürün': { 'en': 'Total Items', 'de': 'Gesamtzahl Produkte', 'tr': 'Toplam Ürün' },
  'Popüler Ürünler': { 'en': 'Popular Items', 'de': 'Beliebte Produkte', 'tr': 'Popüler Ürünler' },
  'Kategori Sayısı': { 'en': 'Category Count', 'de': 'Anzahl Kategorien', 'tr': 'Kategori Sayısı' },
  'Ortalama Fiyat': { 'en': 'Average Price', 'de': 'Durchschnittspreis', 'tr': 'Ortalama Fiyat' },
  'Ürünü Düzenle': { 'en': 'Edit Item', 'de': 'Produkt bearbeiten', 'tr': 'Ürünü Düzenle' },
  'Yeni Ürün Ekle': { 'en': 'Add New Item', 'de': 'Neues Produkt hinzufügen', 'tr': 'Yeni Ürün Ekle' },
  'Ürün Adı *': { 'en': 'Product Name *', 'de': 'Produktname *', 'tr': 'Ürün Adı *' },
  'Açıklama': { 'en': 'Description', 'de': 'Beschreibung', 'tr': 'Açıklama' },
  'Çeviriler': { 'en': 'Translations', 'de': 'Übersetzungen', 'tr': 'Çeviriler' },
  'Seçili diller için ürün adı ve açıklamasını düzenleyin.': { 'en': 'Edit name and description for selected languages.', 'de': 'Namen und Beschreibung für ausgewählte Sprachen bearbeiten.', 'tr': 'Seçili diller için ürün adı ve açıklamasını düzenleyin.' },
  'Çevriliyor...': { 'en': 'Translating...', 'de': 'Wird übersetzt...', 'tr': 'Çevriliyor...' },
  'Otomatik Çevir': { 'en': 'Auto Translate', 'de': 'Automatisch übersetzen', 'tr': 'Otomatik Çevir' },
  'Fiyat (₺) *': { 'en': 'Price (₺) *', 'de': 'Preis (₺) *', 'tr': 'Fiyat (₺) *' },
  'Kategori *': { 'en': 'Category *', 'de': 'Kategorie *', 'tr': 'Kategori *' },
  'Kategori Seçin': { 'en': 'Select Category', 'de': 'Kategorie wählen', 'tr': 'Kategori Seçin' },
  'Önce kategori ekleyin': { 'en': 'Add category first', 'de': 'Zuerst Kategorie hinzufügen', 'tr': 'Önce kategori ekleyin' },
  'Kalori': { 'en': 'Calories', 'de': 'Kalorien', 'tr': 'Kalori' },
  'Hazırlık Süresi': { 'en': 'Prep Time', 'de': 'Zubereitungszeit', 'tr': 'Hazırlık Süresi' },
  'Hazırlık Süresi (dakika)': { 'en': 'Prep Time (minutes)', 'de': 'Zubereitungszeit (Minuten)', 'tr': 'Hazırlık Süresi (dakika)' },
  'Ürün Fotoğrafı': { 'en': 'Product Photo', 'de': 'Produktfoto', 'tr': 'Ürün Fotoğrafı' },
  'Kameradan Çek': { 'en': 'Take Photo', 'de': 'Foto aufnehmen', 'tr': 'Kameradan Çek' },
  'Dosyadan Yükle': { 'en': 'Upload File', 'de': 'Datei hochladen', 'tr': 'Dosyadan Yükle' },
  'dk': { 'en': 'min', 'de': 'Min', 'tr': 'dk' },
  'Düzenle': { 'en': 'Edit', 'de': 'Bearbeiten', 'tr': 'Düzenle' },
  'Yeni Kategori Ekle': { 'en': 'Add New Category', 'de': 'Neue Kategorie hinzufügen', 'tr': 'Yeni Kategori Ekle' },
  'Henüz kategori yok': { 'en': 'No categories yet', 'de': 'Noch keine Kategorien', 'tr': 'Henüz kategori yok' },
  'Menü ürünlerinizi düzenlemek için kategoriler oluşturun': { 'en': 'Create categories to organize your menu items', 'de': 'Erstellen Sie Kategorien, um Ihre Menüpunkte zu organisieren', 'tr': 'Menü ürünlerinizi düzenlemek için kategoriler oluşturun' },
  'İlk Kategoriyi Ekle': { 'en': 'Add First Category', 'de': 'Erste Kategorie hinzufügen', 'tr': 'İlk Kategoriyi Ekle' },
  'Gluten': { 'en': 'Gluten', 'de': 'Gluten', 'tr': 'Gluten' },
  'Süt': { 'en': 'Milk', 'de': 'Milch', 'tr': 'Süt' },
  'Yumurta': { 'en': 'Egg', 'de': 'Ei', 'tr': 'Yumurta' },
  'Fındık': { 'en': 'Hazelnut', 'de': 'Haselnuss', 'tr': 'Fındık' },
  'Fıstık': { 'en': 'Peanut', 'de': 'Erdnuss', 'tr': 'Fıstık' },
  'Soya': { 'en': 'Soy', 'de': 'Soja', 'tr': 'Soya' },
  'Balık': { 'en': 'Fish', 'de': 'Fisch', 'tr': 'Balık' },
  'Kabuklu Deniz Ürünleri': { 'en': 'Shellfish', 'de': 'Schalentiere', 'tr': 'Kabuklu Deniz Ürünleri' },
  'Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.': { 'en': 'File size too large. Max 5MB.', 'de': 'Dateigröße zu groß. Max 5MB.', 'tr': 'Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.' },
  'Lütfen sadece resim dosyası seçin.': { 'en': 'Please select only image files.', 'de': 'Bitte wählen Sie nur Bilddateien aus.', 'tr': 'Lütfen sadece resim dosyası seçin.' },
  'Resim başarıyla yüklendi!': { 'en': 'Image uploaded successfully!', 'de': 'Bild erfolgreich hochgeladen!', 'tr': 'Resim başarıyla yüklendi!' },
  'Resim yüklenemedi: ': { 'en': 'Image upload failed: ', 'de': 'Bild-Upload fehlgeschlagen: ', 'tr': 'Resim yüklenemedi: ' },
  'Resim yüklenirken hata oluştu: ': { 'en': 'Error uploading image: ', 'de': 'Fehler beim Hochladen des Bildes: ', 'tr': 'Resim yüklenirken hata oluştu: ' },
  'Telefon kamerası': { 'en': 'Phone camera', 'de': 'Handykamera', 'tr': 'Telefon kamerası' },
  'PNG, JPG, GIF': { 'en': 'PNG, JPG, GIF', 'de': 'PNG, JPG, GIF', 'tr': 'PNG, JPG, GIF' },
  'AI Görsel İşleme Aktif!': { 'en': 'AI Image Processing Active!', 'de': 'KI-Bildverarbeitung aktiv!', 'tr': 'AI Görsel İşleme Aktif!' },
  'Otomatik arka plan kaldırma': { 'en': 'Auto background removal', 'de': 'Automatische Hintergrundentfernung', 'tr': 'Otomatik arka plan kaldırma' },
  'Renk ve parlaklık optimizasyonu': { 'en': 'Color and brightness optimization', 'de': 'Farb- und Helligkeitsoptimierung', 'tr': 'Renk ve parlaklık optimizasyonu' },
  'Akıllı boyutlandırma': { 'en': 'Smart resizing', 'de': 'Intelligente Größenanpassung', 'tr': 'Akıllı boyutlandırma' },
  'Keskinlik artırma': { 'en': 'Sharpening', 'de': 'Schärfung', 'tr': 'Keskinlik artırma' },
  'Kameradan çekmek daha profesyonel sonuçlar verir': { 'en': 'Taking photo with camera gives professional results', 'de': 'Das Aufnehmen von Fotos mit der Kamera liefert professionellere Ergebnisse', 'tr': 'Kameradan çekmek daha profesyonel sonuçlar verir' },
  'Seçilen Fotoğraf:': { 'en': 'Selected Photo:', 'de': 'Ausgewähltes Foto:', 'tr': 'Seçilen Fotoğraf:' },
  'Ürün Durumu': { 'en': 'Product Status', 'de': 'Produktstatus', 'tr': 'Ürün Durumu' },
  'Popüler Ürün': { 'en': 'Popular Product', 'de': 'Beliebtes Produkt', 'tr': 'Popüler Ürün' },
  'İptal': { 'en': 'Cancel', 'de': 'Abbrechen', 'tr': 'İptal' },
  'Kaydet': { 'en': 'Save', 'de': 'Speichern', 'tr': 'Kaydet' },
  'Güncelle': { 'en': 'Update', 'de': 'Aktualisieren', 'tr': 'Güncelle' },
  'Ürün başarıyla güncellendi!': { 'en': 'Item updated successfully!', 'de': 'Produkt erfolgreich aktualisiert!', 'tr': 'Ürün başarıyla güncellendi!' },
  'Ürün güncellenirken bir hata oluştu: ': { 'en': 'Error occurred while updating item: ', 'de': 'Fehler beim Aktualisieren des Produkts: ', 'tr': 'Ürün güncellenirken bir hata oluştu: ' },
  'Lütfen ürün adı, fiyat ve kategori alanlarını doldurun!': { 'en': 'Please fill in product name, price and category fields!', 'de': 'Bitte füllen Sie die Felder Produktname, Preis und Kategorie aus!', 'tr': 'Lütfen ürün adı, fiyat ve kategori alanlarını doldurun!' },
  'Ürün başarıyla eklendi!': { 'en': 'Item added successfully!', 'de': 'Produkt erfolgreich hinzugefügt!', 'tr': 'Ürün başarıyla eklendi!' },
  'Ürün eklenirken bir hata oluştu: ': { 'en': 'Error occurred while adding item: ', 'de': 'Fehler beim Hinzufügen des Produkts: ', 'tr': 'Ürün eklenirken bir hata oluştu: ' },
  'Kategoriyi Düzenle': { 'en': 'Edit Category', 'de': 'Kategorie bearbeiten', 'tr': 'Kategoriyi Düzenle' },
  'Kategori Adı *': { 'en': 'Category Name *', 'de': 'Kategoriename *', 'tr': 'Kategori Adı *' },
  'Lütfen kategori adını girin!': { 'en': 'Please enter category name!', 'de': 'Bitte Kategoriename eingeben!', 'tr': 'Lütfen kategori adını girin!' },
  'Kategori işlemi sırasında bir hata oluştu: ': { 'en': 'Error occurred during category operation: ', 'de': 'Fehler bei der Kategorieoperation: ', 'tr': 'Kategori işlemi sırasında bir hata oluştu: ' },
  'Fotoğraf Çek': { 'en': 'Take Photo', 'de': 'Foto aufnehmen', 'tr': 'Fotoğraf Çek' },
  'Ürünü çerçeve içine alın': { 'en': 'Frame the product', 'de': 'Produkt einrahmen', 'tr': 'Ürünü çerçeve içine alın' },
  'Toplu Ürün İçe Aktar': { 'en': 'Bulk Product Import', 'de': 'Massenproduktimport', 'tr': 'Toplu Ürün İçe Aktar' },
  'CSV Formatı': { 'en': 'CSV Format', 'de': 'CSV-Format', 'tr': 'CSV Formatı' },
  'CSV dosyanız şu sütunları içermelidir:': { 'en': 'Your CSV file must include these columns:', 'de': 'Ihre CSV-Datei muss diese Spalten enthalten:', 'tr': 'CSV dosyanız şu sütunları içermelidir:' },
  'CSV Dosyası Yükle': { 'en': 'Upload CSV File', 'de': 'CSV-Datei hochladen', 'tr': 'CSV Dosyası Yükle' },
  'Tıklayın veya dosyayı sürükleyin': { 'en': 'Click or drag file', 'de': 'Klicken oder Datei ziehen', 'tr': 'Tıklayın veya dosyayı sürükleyin' },
  'Maksimum dosya boyutu: 5MB': { 'en': 'Max file size: 5MB', 'de': 'Maximale Dateigröße: 5MB', 'tr': 'Maksimum dosya boyutu: 5MB' },
  'Örnek Şablon': { 'en': 'Example Template', 'de': 'Beispielvorlage', 'tr': 'Örnek Şablon' },
  'Şablonu İndir': { 'en': 'Download Template', 'de': 'Vorlage herunterladen', 'tr': 'Şablonu İndir' },
  'Hızlı İçe Aktar': { 'en': 'Quick Import', 'de': 'Schnellimport', 'tr': 'Hızlı İçe Aktar' },
  'Yüzlerce ürünü tek seferde ekleyin': { 'en': 'Add hundreds of products at once', 'de': 'Hunderte Produkte auf einmal hinzufügen', 'tr': 'Yüzlerce ürünü tek seferde ekleyin' },
  'Otomatik Doğrulama': { 'en': 'Auto Validation', 'de': 'Automatische Validierung', 'tr': 'Otomatik Doğrulama' },
  'Hatalı veriler otomatik tespit edilir': { 'en': 'Invalid data is automatically detected', 'de': 'Ungültige Daten werden automatisch erkannt', 'tr': 'Hatalı veriler otomatik tespit edilir' },
  'CSV yükleme özelliği yakında aktif olacak! 🚀': { 'en': 'CSV upload feature coming soon! 🚀', 'de': 'CSV-Upload-Funktion kommt bald! 🚀', 'tr': 'CSV yükleme özelliği yakında aktif olacak! 🚀' },
  'Ürün Çevirileri': { 'en': 'Product Translations', 'de': 'Produktübersetzungen', 'tr': 'Ürün Çevirileri' },
  'Kapat': { 'en': 'Close', 'de': 'Schließen', 'tr': 'Kapat' },
  'Toplu Fiyat Düzenle': { 'en': 'Bulk Price Edit', 'de': 'Massenpreisbearbeitung', 'tr': 'Toplu Fiyat Düzenle' },
  'ürünün fiyatını güncelleyeceksiniz.': { 'en': 'products price will be updated.', 'de': 'Produktpreise werden aktualisiert.', 'tr': 'ürünün fiyatını güncelleyeceksiniz.' },
  'İşlem Türü': { 'en': 'Operation Type', 'de': 'Operationstyp', 'tr': 'İşlem Türü' },
  'Arttır': { 'en': 'Increase', 'de': 'Erhöhen', 'tr': 'Arttır' },
  'Azalt': { 'en': 'Decrease', 'de': 'Verringern', 'tr': 'Azalt' },
  'Değer Türü': { 'en': 'Value Type', 'de': 'Werttyp', 'tr': 'Değer Türü' },
  'Yüzde': { 'en': 'Percentage', 'de': 'Prozentsatz', 'tr': 'Yüzde' },
  '₺ Sabit': { 'en': '₺ Fixed', 'de': '₺ Fest', 'tr': '₺ Sabit' },
  'Değer': { 'en': 'Value', 'de': 'Wert', 'tr': 'Değer' },
  'Fiyatları %': { 'en': 'Prices %', 'de': 'Preise %', 'tr': 'Fiyatları %' },
  'Fiyatlara ₺': { 'en': 'Prices ₺', 'de': 'Preise ₺', 'tr': 'Fiyatlara ₺' },
  'ekle': { 'en': 'add', 'de': 'hinzufügen', 'tr': 'ekle' },
  'çıkar': { 'en': 'deduct', 'de': 'abziehen', 'tr': 'çıkar' },
  'arttır': { 'en': 'increase', 'de': 'erhöhen', 'tr': 'arttır' },
  'azalt': { 'en': 'decrease', 'de': 'verringern', 'tr': 'azalt' },


};

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

      if (staticDictionary[children] && staticDictionary[children][langCode]) {
        // console.log(`Using static translation for "${children}": ${staticDictionary[children][langCode]}`);
        setTranslatedText(staticDictionary[children][langCode]);
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
