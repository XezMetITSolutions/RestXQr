const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
const { Op } = Sequelize;
const { Order, OrderItem, Restaurant, MenuItem, MenuCategory, QRToken } = require('../models');
const waiterCalls = require('../lib/waiterStore');

const resolveDrinkStationForTable = (restaurant, tableNumber, menuItemCategoryId, itemKitchenStation = '') => {
  try {
    // KROREN SPECIAL LOGIC
    if (restaurant?.username === 'kroren' || restaurant?.name === 'Kroren' || restaurant?.name === 'Kroren Restaurant') {
      // Sadece içecek/bar istasyonu olan ürünler için bu kuralı uygula
      // Veya itemKitchenStation 'icecek' içeriyorsa
      if (itemKitchenStation && (
        itemKitchenStation.toLowerCase().includes('icecek') ||
        itemKitchenStation.toLowerCase().includes('bar') ||
        itemKitchenStation.toLowerCase().includes('drink')
      )) {
        const t = Number(tableNumber);
        if (Number.isFinite(t)) {
          if (t >= 1 && t <= 18) return 'icecek1';
          if (t >= 19 && t <= 42) return 'icecek2';
        }
      }
    }

    const cfg = restaurant?.settings?.drinkStationRouting;
    if (!cfg?.drinkCategoryId || !Array.isArray(cfg?.floors) || cfg.floors.length === 0) return null;
    if (!tableNumber) return null;
    if (!menuItemCategoryId) return null;

    const drinkCategoryId = String(cfg.drinkCategoryId);
    if (String(menuItemCategoryId) !== drinkCategoryId) return null;

    const t = Number(tableNumber);
    if (!Number.isFinite(t)) return null;

    const match = cfg.floors.find((f) => {
      const start = Number(f.startTable);
      const end = Number(f.endTable);
      return Number.isFinite(start) && Number.isFinite(end) && t >= start && t <= end;
    });

    return match?.stationId || null;
  } catch (e) {
    return null;
  }
};

// DEBUG ROUTE: Get last 10 orders from ANY restaurant
router.get('/debug/all', async (req, res) => {
  try {
    const orders = await Order.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [{ model: Restaurant, as: 'restaurant', attributes: ['name', 'username'] }]
    });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// DEBUG ROUTE: Delete active orders
router.post('/debug/delete-active-orders', async (req, res) => {
  console.log('🗑️ Delete active orders endpoint called via orders router');
  try {
    const { restaurantUsername } = req.body;
    let where = {
      status: { [Op.in]: ['pending', 'preparing', 'ready'] }
    };

    if (restaurantUsername) {
      const restaurant = await Restaurant.findOne({ where: { username: restaurantUsername } });
      if (restaurant) {
        where.restaurantId = restaurant.id;
      }
    }

    const activeOrders = await Order.findAll({ where });
    const orderIds = activeOrders.map(o => o.id);

    if (orderIds.length > 0) {
      await OrderItem.destroy({ where: { orderId: { [Op.in]: orderIds } } });
      const deletedCount = await Order.destroy({ where: { id: { [Op.in]: orderIds } } });

      res.json({
        success: true,
        message: `${deletedCount} aktif sipariş başarıyla silindi`,
        deletedCount,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: true,
        message: 'Silinecek aktif sipariş bulunamadı',
        deletedCount: 0,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Delete Active Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Aktif siparişler silinirken hata oluştu',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/orders?restaurantId=...&status=...
router.get('/', async (req, res) => {
  try {
    const { restaurantId, status, tableNumber, approved } = req.query;
    console.log('🔍 GET /api/orders request:', { restaurantId, status, tableNumber, approved });

    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'restaurantId is required' });
    }

    // Eğer restaurantId string ise (username/id ayrımı), gerçek UUID'yi bulmaya çalış
    let actualRestaurantId = restaurantId;
    if (typeof restaurantId === 'string' && !restaurantId.includes('-')) {
      console.log('🔍 Resolving restaurantId from username:', restaurantId);
      const restaurant = await Restaurant.findOne({ where: { username: restaurantId } });
      if (restaurant) {
        actualRestaurantId = restaurant.id;
        console.log('✅ Resolved to UUID:', actualRestaurantId);
      }
    }

    const where = { restaurantId: actualRestaurantId };

    if (status && status !== 'all') {
      if (status.includes(',')) {
        where.status = { [Op.in]: status.split(',') };
      } else {
        where.status = status;
      }

      // OPTIMIZATION: If querying for active orders, limit to last 3 hours
      // This prevents fetching old 'stuck' orders that slow down the system
      if (['pending', 'preparing', 'ready'].some(s => status.includes(s))) {
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
        where.created_at = { [Op.gte]: threeHoursAgo };
      }
    } else if (tableNumber) {
      // Masa numarası ile sorgulanıyorsa ve status belirtilmemişse, sadece aktif siparişleri getir
      where.tableNumber = tableNumber;
      where.status = { [Op.notIn]: ['completed', 'cancelled'] };

      // Limit table lookups to last 24 hours just in case
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      where.created_at = { [Op.gte]: twentyFourHoursAgo };
    }

    if (approved === 'true') {
      where.approved = true;
    } else if (approved === 'false') {
      where.approved = false;
    }

    console.log('🎯 Final SQL Where:', where);

    const orders = await Order.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    const restaurantForRouting = await Restaurant.findByPk(actualRestaurantId);

    // Attach items (join OrderItem -> MenuItem) and normalize shape for frontends
    const orderIds = orders.map(o => o.id);
    const items = await OrderItem.findAll({
      where: { orderId: orderIds },
      include: [
        {
          model: MenuItem,
          as: 'menuItem',
          attributes: ['id', 'name', 'price', 'imageUrl', 'categoryId', 'kitchenStation'],
          include: [
            {
              model: MenuCategory,
              as: 'category',
              attributes: ['kitchenStation']
            }
          ]
        }
      ]
    });

    const orderIdToItems = new Map();
    for (const it of items) {
      const list = orderIdToItems.get(it.orderId) || [];
      const orderForItem = orders.find(o => o.id === it.orderId);
      const drinkStation = resolveDrinkStationForTable(
        restaurantForRouting,
        orderForItem?.tableNumber,
        it.menuItem?.categoryId,
        it.menuItem?.kitchenStation || it.menuItem?.category?.kitchenStation
      );
      const itemStation = drinkStation || it.menuItem?.kitchenStation || it.menuItem?.category?.kitchenStation || 'default';

      list.push({
        id: it.menuItemId || it.id,
        name: it.menuItem?.name || 'Ürün',
        quantity: Number(it.quantity || 1),
        price: Number(it.unitPrice || 0),
        notes: it.notes || '',
        image: it.menuItem?.imageUrl || null,
        category: 'food',
        status: 'preparing',
        prepTime: 10,
        kitchenStation: itemStation,
        categoryId: it.menuItem?.categoryId // Kategori ID'sini ekle (filtreleme için)
      });
      orderIdToItems.set(it.orderId, list);
    }

    // İçecek kategorilerini bul (mutfak paneli için filtreleme)
    let drinkCategoryIds = [];
    if (req.query.excludeDrinks === 'true') {
      const drinkCategories = await MenuCategory.findAll({
        where: {
          restaurantId: actualRestaurantId,
          name: {
            [Op.iLike]: '%içecek%'
          }
        }
      });
      drinkCategoryIds = drinkCategories.map(cat => cat.id);
      console.log('🚫 İçecekler filtreleniyor, kategori IDs:', drinkCategoryIds);
    }

    const data = orders.map(o => {
      let orderItems = orderIdToItems.get(o.id) || [];

      // İçecekleri filtrele (mutfak paneli için)
      if (req.query.excludeDrinks === 'true' && drinkCategoryIds.length > 0) {
        orderItems = orderItems.filter(item => !drinkCategoryIds.includes(item.categoryId));
      }

      return {
        ...o.toJSON(),
        items: orderItems
      };
    }).filter(order => order.items.length > 0); // İçecek dışında ürünü olmayan siparişleri kaldır


    res.json({ success: true, data });
  } catch (error) {
    console.error('GET /orders error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { restaurantId, tableNumber, customerName, items = [], notes, orderType = 'dine_in' } = req.body;
    if (!restaurantId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'restaurantId and items are required' });
    }

    console.log('📦 Order creation request:', { restaurantId, tableNumber, itemsCount: items.length });

    // Eğer restaurantId string ise (username), gerçek ID'yi bul
    let actualRestaurantId = restaurantId;
    if (typeof restaurantId === 'string' && !restaurantId.includes('-')) {
      console.log('🔍 Looking up restaurant by username:', restaurantId);
      const restaurant = await Restaurant.findOne({ where: { username: restaurantId } });
      if (!restaurant) {
        return res.status(404).json({ success: false, message: `Restaurant with username '${restaurantId}' not found` });
      }
      actualRestaurantId = restaurant.id;
      console.log('✅ Found restaurant:', { username: restaurantId, id: actualRestaurantId });
    }

    // İçecek kategorisi kontrolü - İçecekler otomatik onaylansın
    let hasDrinks = false;
    let hasFood = false;

    try {
      // İçecek kategorilerini bul
      const drinkCategories = await MenuCategory.findAll({
        where: {
          restaurantId: actualRestaurantId,
          name: {
            [Op.iLike]: '%içecek%'
          }
        }
      });

      const drinkCategoryIds = drinkCategories.map(cat => cat.id);

      // Siparişteki ürünleri kontrol et
      for (const it of items) {
        let menuItem = null;

        // MenuItem'ı bul
        if (it.menuItemId) {
          menuItem = await MenuItem.findByPk(it.menuItemId);
        } else if (it.name) {
          menuItem = await MenuItem.findOne({
            where: { restaurantId: actualRestaurantId, name: it.name }
          });
        }

        // Kategori kontrolü
        if (menuItem && drinkCategoryIds.includes(menuItem.categoryId)) {
          hasDrinks = true;
        } else {
          hasFood = true;
        }
      }
    } catch (error) {
      console.error('İçecek kontrolü hatası:', error);
    }

    // Sadece içecek varsa otomatik onaylansın
    const autoApprove = hasDrinks && !hasFood;
    console.log(`📋 Sipariş analizi: hasDrinks=${hasDrinks}, hasFood=${hasFood}, autoApprove=${autoApprove}`);

    // Total amount hesapla
    let totalAmount = 0;
    for (const it of items) {
      const qty = Number(it.quantity || 1);
      const unitPrice = Number(it.unitPrice || it.price || 0);
      totalAmount += qty * unitPrice;
    }


    const order = await Order.create({
      restaurantId: actualRestaurantId,
      tableNumber: tableNumber || null,
      customerName: customerName || null,
      status: autoApprove ? 'approved' : 'pending', // İçecek ise direkt approved
      totalAmount,
      notes: notes || null,
      orderType,
      approved: autoApprove // İçecek ise direkt onaylı
    });

    for (const it of items) {
      const qty = Number(it.quantity || 1);
      const unitPrice = Number(it.unitPrice || it.price || 0);

      // Resolve a valid menuItemId: prefer provided UUID; else try name lookup; else create placeholder
      let resolvedMenuItemId = it.menuItemId;
      const looksLikeUuid = typeof resolvedMenuItemId === 'string' && resolvedMenuItemId.length >= 8 && resolvedMenuItemId.includes('-');
      if (!resolvedMenuItemId || !looksLikeUuid) {
        try {
          // Try find by name within this restaurant
          if (it.name) {
            const found = await MenuItem.findOne({ where: { restaurantId: actualRestaurantId, name: it.name } });
            if (found) {
              resolvedMenuItemId = found.id;
            } else {
              // ensure default category exists
              let defCat = await MenuCategory.findOne({ where: { restaurantId: actualRestaurantId, name: 'Genel' } });
              if (!defCat) {
                defCat = await MenuCategory.create({ restaurantId: actualRestaurantId, name: 'Genel' });
              }
              const created = await MenuItem.create({
                restaurantId: actualRestaurantId,
                categoryId: defCat.id,
                name: it.name,
                price: unitPrice,
                description: it.notes || null
              });
              resolvedMenuItemId = created.id;
            }
          }
        } catch (e) {
          console.warn('MenuItem resolve failed, using null id:', e?.message);
        }
      }

      await OrderItem.create({
        orderId: order.id,
        menuItemId: resolvedMenuItemId,
        quantity: qty,
        unitPrice,
        totalPrice: qty * unitPrice,
        notes: it.notes || null
      });
    }

    // Order started: keep QR active until payment; do NOT deactivate here
    // Deactivation should occur after payment is completed. Placeholder logic below if needed later:
    // await QRToken.update({ isActive: false }, { where: { restaurantId, tableNumber, isActive: true } });

    // 1 dakika sonra panellere gönder (iptal/değişiklik için süre tanı)
    const { publish } = require('../lib/realtime');

    // Sipariş oluşturulduğunda hemen panellere gönderme, 1 dakika bekle
    // Sipariş oluşturulduğunda hemen panellere gönder - SADECE ONAYLANMIŞSA
    if (order.approved) {
      try {
        publish('new_order', {
          orderId: order.id,
          restaurantId: order.restaurantId,
          tableNumber: order.tableNumber,
          items: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            notes: item.notes || ''
          })),
          totalAmount: order.totalAmount,
          timestamp: new Date().toISOString()
        });
        console.log(`✅ Sipariş ${order.id} anında panellere gönderildi`);
      } catch (error) {
        console.error('❌ Sipariş panellere gönderilirken hata:', error);
      }
    } else {
      console.log(`ℹ️ Sipariş ${order.id} oluşturuldu ancak onaylanmadı, şimdilik panellere gönderilmiyor.`);
    }

    res.status(201).json({
      success: true,
      data: order,
      message: order.approved ? 'Order created and sent to panels.' : 'Order created. Waiting for cashier approval.',
      confirmationTime: 60 // Frontend'e 60 saniye bilgisi gönder
    });
  } catch (error) {
    console.error('POST /orders error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/orders/bulk?restaurantId=... (MUST BE BEFORE /:id route)
router.delete('/bulk', async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'restaurantId is required' });
    }

    console.log('🗑️ Bulk delete request for restaurant:', restaurantId);

    // Önce bu restorana ait tüm siparişleri bul
    const orders = await Order.findAll({ where: { restaurantId } });
    const orderIds = orders.map(o => o.id);

    if (orderIds.length === 0) {
      return res.json({ success: true, message: 'No orders to delete', deletedCount: 0 });
    }

    // Önce OrderItem'ları sil
    const deletedItems = await OrderItem.destroy({ where: { orderId: orderIds } });
    console.log(`🗑️ Deleted ${deletedItems} order items`);

    // Sonra Order'ları sil
    const deletedOrders = await Order.destroy({ where: { restaurantId } });
    console.log(`🗑️ Deleted ${deletedOrders} orders`);

    res.json({
      success: true,
      message: `Deleted ${deletedOrders} orders and ${deletedItems} items`,
      deletedCount: deletedOrders
    });
  } catch (error) {
    console.error('DELETE /orders/bulk error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/orders/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ DELETE /api/orders/${id} isteği alındı`);

  try {
    if (id.startsWith('table-') && id.endsWith('-grouped')) {
      const tableToken = id.replace('table-', '').replace('-grouped', '');
      const { restaurantId } = req.query;
      let targetRestaurantId = restaurantId;

      if (!targetRestaurantId) {
        const subdomain = req.headers['x-subdomain'] || req.headers['x-forwarded-host']?.split('.')[0];
        if (subdomain) {
          const restaurant = await Restaurant.findOne({ where: { username: subdomain } });
          targetRestaurantId = restaurant?.id;
        }
      }

      if (!targetRestaurantId) {
        return res.status(400).json({
          success: false,
          message: 'restaurantId is required to delete grouped orders'
        });
      }

      const where = { restaurantId: targetRestaurantId };
      if (tableToken === 'null') {
        where.tableNumber = null;
      } else {
        where.tableNumber = Number(tableToken);
      }

      const orders = await Order.findAll({ where });
      const orderIds = orders.map(order => order.id);

      if (orderIds.length === 0) {
        return res.json({ success: true, message: 'No grouped orders found', deletedCount: 0 });
      }

      await OrderItem.destroy({ where: { orderId: orderIds } });
      const deletedOrders = await Order.destroy({ where });

      return res.json({
        success: true,
        message: 'Grouped orders deleted successfully',
        deletedCount: deletedOrders
      });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      console.log(`❌ Sipariş bulunamadı: ID ${id}`);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // OrderItem'lar model tanımındaki CASCADE sayesinde otomatik silinecektir.
    // Ancak garantici olmak için manuel silmeyi de tutabiliriz veya temizlik yapabiliriz.
    // Burada Sequelize'in CASCADE'i kullanması için sadece order.destroy() yeterlidir.
    await order.destroy();

    console.log(`✅ Sipariş başarıyla silindi: ID ${id}`);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error(`❌ DELETE /orders/${id} hatası:`, error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// OPTIONS preflight isteği için (CORS)
router.options('*', (req, res) => {
  res.sendStatus(200);
});

// PUT /api/orders/:id (status update) - MUST BE AFTER /bulk route
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (id.startsWith('table-') && id.endsWith('-grouped')) {
      return res.status(400).json({
        success: false,
        message: 'Grouped order ids are virtual. Update individual orders instead.'
      });
    }
    const { status, items, totalAmount, tableNumber, paidAmount, discountAmount, discountReason, cashierNote, approved } = req.body;
    const allowed = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'invalid status' });
    }

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const oldApproved = order.approved;

    // Alanları güncelle
    const previousStatus = order.status;
    if (status) order.status = status;
    if (tableNumber !== undefined) order.tableNumber = tableNumber;
    if (paidAmount !== undefined) order.paidAmount = paidAmount;
    if (discountAmount !== undefined) order.discountAmount = discountAmount;
    if (discountReason) order.discountReason = discountReason;
    if (cashierNote) order.cashierNote = cashierNote;
    if (approved !== undefined) order.approved = approved;

    await order.save();

    // Sipariş onaylandığında (false -> true) bildirim gönder VE YAZDIR
    const { publish } = require('../lib/realtime');
    if (approved === true && oldApproved === false) {
      try {
        publish('order_approved', {
          orderId: order.id,
          restaurantId: order.restaurantId,
          tableNumber: order.tableNumber,
          status: order.status,
          timestamp: new Date().toISOString()
        });
        console.log(`✅ Sipariş ${id} onaylandı ve bildirim gönderildi.`);
        let printResults = [];

        // YAZICI ÇIKTISI: Sipariş onaylandığında otomatik yazdır
        try {
          const printerService = require('../services/printerService');
          const restaurant = await Restaurant.findByPk(order.restaurantId);

          if (restaurant && restaurant.printerConfig) {
            // Sipariş itemlarını al
            const orderItems = await OrderItem.findAll({
              where: { orderId: order.id },
              include: [{
                model: MenuItem,
                as: 'menuItem',
                attributes: ['name', 'kitchenStation', 'categoryId', 'translations']
              }]
            });

            // İstasyonlara göre grupla
            const itemsByStation = {};
            for (const item of orderItems) {
              const drinkStation = resolveDrinkStationForTable(
                restaurant,
                order.tableNumber,
                item.menuItem?.categoryId,
                item.menuItem?.kitchenStation
              );
              const station = drinkStation || item.menuItem?.kitchenStation || 'default';
              if (!itemsByStation[station]) {
                itemsByStation[station] = [];
              }
              itemsByStation[station].push({
                name: item.menuItem?.name || 'Ürün',
                quantity: item.quantity,
                notes: item.notes || '',
                translations: item.menuItem?.translations || {}
              });
            }

            // Her istasyona yazdır
            for (const [stationId, stationItems] of Object.entries(itemsByStation)) {
              const printerConfig = restaurant.printerConfig[stationId];

              if (printerConfig && printerConfig.enabled && printerConfig.ip) {
                console.log(`🖨️ ${stationId} istasyonuna yazdırılıyor (${printerConfig.ip})...`);

                // PrinterService'e istasyon ekle/güncelle
                printerService.addOrUpdateStation(stationId, {
                  name: stationId,
                  ip: printerConfig.ip,
                  port: printerConfig.port || 9100,
                  enabled: true,
                  type: require('node-thermal-printer').PrinterTypes.EPSON,
                  characterSet: require('node-thermal-printer').CharacterSet.PC857_TURKISH,
                  codePage: 'CP857'
                });

                // Yazdır
                const printResult = await printerService.printOrderAdvanced(stationId, {
                  orderNumber: order.id.substring(0, 8),
                  tableNumber: order.tableNumber || 'Paket',
                  items: stationItems
                });

                if (printResult.success) {
                  console.log(`✅ ${stationId} (${printerConfig.ip}) istasyonuna yazdırıldı`);
                } else {
                  console.error(`❌ ${stationId} (${printerConfig.ip}) yazdırma hatası:`, printResult.error);
                }

                printResults.push({
                  stationId,
                  success: printResult.success,
                  error: printResult.error,
                  isLocalIP: printResult.isLocalIP,
                  ip: printerConfig.ip,
                  stationItems
                });
              } else {
                console.log(`⚠️ ${stationId} istasyonu için yazıcı yapılandırılmamış`);
              }
            }
            order.printResults = printResults; // Geçici olarak ekle
          }
        } catch (printError) {
          console.error('❌ Yazdırma hatası:', printError);
          // Yazdırma hatası sipariş onayını engellemez
        }
      } catch (err) {
        console.error('❌ Onay bildirimi gönderilirken hata:', err);
      }
    }

    // Durum değişikliğini panellere bildir
    try {
      publish('order_update', {
        orderId: order.id,
        restaurantId: order.restaurantId,
        status: order.status,
        tableNumber: order.tableNumber
      });

      // Mutfaktan hazır bilgisi geldiğinde garsona otomatik çağrı gönder
      if (status === 'ready' && previousStatus !== 'ready') {
        const callId = `ready_${order.id}_${Date.now()}`;
        const call = {
          id: callId,
          restaurantId: order.restaurantId,
          tableNumber: order.tableNumber,
          type: 'ready',
          message: `Masa ${order.tableNumber}: Sipariş Hazır!`,
          status: 'active',
          createdAt: new Date().toISOString()
        };

        // Merkezi store'a ekle (polling için)
        waiterCalls.set(callId, call);

        // Anlık bildirim gönder
        publish('waiter_call', call);
        console.log(`🔔 Otomatik hazır bildirimi gönderildi: Masa ${order.tableNumber}`);
      }
    } catch (realtimeError) {
      console.warn('Realtime update failed:', realtimeError.message);
    }

    // Ödeme tamamlandığında QR token'ı yenile (eski token'ı deaktive et, yeni token oluştur)
    if (status === 'completed' && previousStatus !== 'completed' && order.tableNumber) {
      try {
        console.log(`💳 Ödeme tamamlandı, QR token yenileniyor: Masa ${order.tableNumber}, Restoran ${order.restaurantId}`);

        // Mevcut aktif token'ı deaktive et
        await QRToken.update(
          { isActive: false },
          {
            where: {
              restaurantId: order.restaurantId,
              tableNumber: order.tableNumber,
              isActive: true
            }
          }
        );

        // Yeni token oluştur (10 yıl geçerli)
        const crypto = require('crypto');
        const generateToken = () => crypto.randomBytes(32).toString('hex');
        const newToken = generateToken();
        const expiresAt = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000); // 10 yıl

        const newQRToken = await QRToken.create({
          restaurantId: order.restaurantId,
          tableNumber: order.tableNumber,
          token: newToken,
          expiresAt: expiresAt,
          isActive: true,
          createdBy: 'system'
        });

        console.log(`✅ Yeni QR token oluşturuldu: Masa ${order.tableNumber}, Token: ${newToken.substring(0, 20)}...`);
      } catch (error) {
        console.error('❌ QR token yenileme hatası:', error);
        // Hata olsa bile sipariş güncellemesi devam etsin
      }
    }

    // Consolidated print results
    let combinedPrintResults = order.printResults || [];

    // ÖDEME ÇIKTISI: Ödeme tamamlandığında otomatik yazdır
    if (status === 'completed' && previousStatus !== 'completed') {
      try {
        console.log(`🖨️ Ödeme tamamlandı, yazdırılıyor: Sipariş ${order.id}`);
        const printerService = require('../services/printerService');
        const printResults = [];

        const restaurant = await Restaurant.findByPk(order.restaurantId);
        if (!restaurant || !restaurant.printerConfig) {
          console.warn('⚠️ Restaurant or printerConfig not found for payment print');
          combinedPrintResults = [...combinedPrintResults, ...printResults];
          const responseData = order.get({ plain: true });
          responseData.printResults = combinedPrintResults;
          return res.json({ success: true, data: responseData });
        }

        const orderItems = await OrderItem.findAll({
          where: { orderId: order.id },
          include: [{
            model: MenuItem,
            as: 'menuItem',
            attributes: ['name', 'kitchenStation', 'categoryId', 'translations']
          }]
        });

        // İstasyonlara göre grupla
        const itemsByStation = {};
        for (const item of orderItems) {
          const drinkStation = resolveDrinkStationForTable(
            restaurant,
            order.tableNumber,
            item.menuItem?.categoryId,
            item.menuItem?.kitchenStation
          );
          const station = drinkStation || item.menuItem?.kitchenStation || 'default';
          if (!itemsByStation[station]) itemsByStation[station] = [];
          itemsByStation[station].push({
            name: item.menuItem?.name || 'Ürün',
            quantity: item.quantity,
            notes: (item.notes || '') + ' (ÖDEME ALINDI)',
            translations: item.menuItem?.translations || {}
          });
        }

        for (const [stationId, stationItems] of Object.entries(itemsByStation)) {
          const printerConfig = restaurant.printerConfig ? restaurant.printerConfig[stationId] : null;

          if (printerConfig && printerConfig.enabled && printerConfig.ip) {
            printerService.addOrUpdateStation(stationId, {
              name: stationId,
              ip: printerConfig.ip,
              port: printerConfig.port || 9100,
              enabled: true,
              type: require('node-thermal-printer').PrinterTypes.EPSON,
              characterSet: require('node-thermal-printer').CharacterSet.PC857_TURKISH,
              codePage: 'CP857'
            });

            const printResult = await printerService.printOrderAdvanced(stationId, {
              orderNumber: order.id.substring(0, 8),
              tableNumber: order.tableNumber || 'Paket',
              items: stationItems
            });

            printResults.push({
              stationId,
              success: printResult.success,
              error: printResult.error,
              isLocalIP: printResult.isLocalIP,
              ip: printerConfig.ip,
              stationItems
            });
          }
        }
        combinedPrintResults = [...combinedPrintResults, ...printResults];
      } catch (printError) {
        console.error('❌ Ödeme sonrası yazdırma hatası:', printError);
      }
    }

    // Items değiştiyse güncelle
    if (items && Array.isArray(items)) {
      // Mevcut order items'ları sil
      await OrderItem.destroy({ where: { orderId: id } });

      // Yeni items'ları ekle
      for (const item of items) {
        await OrderItem.create({
          orderId: id,
          menuItemId: item.id || item.menuItemId,
          quantity: item.quantity || 1,
          unitPrice: item.price || item.unitPrice || 0,
          notes: item.notes || ''
        });
      }

      // Total amount'u güncelle
      if (totalAmount) {
        order.totalAmount = totalAmount;
        await order.save();
      }
    }

    const responseData = order.get({ plain: true });
    responseData.printResults = combinedPrintResults;
    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('PUT /orders/:id error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/orders/:id/print (Manual printing for debug/retry)
router.post('/:id/print', async (req, res) => {
  const steps = [];
  const log = (msg, type = 'info') => {
    const entry = { timestamp: new Date().toISOString(), message: msg, type };
    steps.push(entry);
    console.log(`[PRINT-DEBUG] ${msg}`);
  };

  try {
    const { id } = req.params;
    log(`Baskı isteği alındı. Sipariş ID: ${id}`);

    const order = await Order.findByPk(id);
    if (!order) {
      log('Sipariş veritabanında bulunamadı', 'error');
      return res.status(404).json({ success: false, message: 'Order not found', steps });
    }

    log(`Sipariş bulundu. Masa: ${order.tableNumber || 'Paket'}`);

    const restaurant = await Restaurant.findByPk(order.restaurantId);
    if (!restaurant) {
      log('Restoran bulunamadı', 'error');
      return res.status(404).json({ success: false, message: 'Restaurant not found', steps });
    }

    if (!restaurant.printerConfig) {
      log('Restoranda yazıcı yapılandırması (printerConfig) bulunamadı', 'error');
      return res.status(400).json({ success: false, message: 'No printer config', steps });
    }

    log('Yazıcı yapılandırması kontrol ediliyor...');

    // Sipariş itemlarını al
    const orderItems = await OrderItem.findAll({
      where: { orderId: order.id },
      include: [{
        model: MenuItem,
        as: 'menuItem',
        attributes: ['name', 'kitchenStation', 'categoryId']
      }]
    });

    log(`${orderItems.length} adet sipariş kalemi bulundu.`);

    // İstasyonlara göre grupla
    const itemsByStation = {};
    for (const item of orderItems) {
      const drinkStation = resolveDrinkStationForTable(
        restaurant,
        order.tableNumber,
        item.menuItem?.categoryId,
        item.menuItem?.kitchenStation
      );
      const station = drinkStation || item.menuItem?.kitchenStation || 'default';
      if (!itemsByStation[station]) {
        itemsByStation[station] = [];
      }
      itemsByStation[station].push({
        name: item.menuItem?.name || 'Ürün',
        quantity: item.quantity,
        notes: item.notes || ''
      });
    }

    const stationsToPrint = Object.keys(itemsByStation);
    log(`Yazdırılacak istasyonlar: ${stationsToPrint.join(', ')}`);

    const printerService = require('../services/printerService');
    const results = [];

    for (const stationId of stationsToPrint) {
      const stationItems = itemsByStation[stationId];
      const printerConfig = restaurant.printerConfig[stationId];

      log(`--- [${stationId}] İstasyonu İşleniyor ---`);

      if (printerConfig && printerConfig.enabled && printerConfig.ip) {
        log(`Sistem Yapılandırması: ${stationId} istasyonu için hedef IP: ${printerConfig.ip}, Port: ${printerConfig.port || 9100}`);
        log(`Yapılandırma durumu: ${printerConfig.enabled ? 'AKTİF' : 'PASİF'}`);

        // PrinterService'e istasyon ekle/güncelle
        printerService.addOrUpdateStation(stationId, {
          name: stationId,
          ip: printerConfig.ip,
          port: printerConfig.port || 9100,
          enabled: true,
          type: require('node-thermal-printer').PrinterTypes.EPSON,
          characterSet: require('node-thermal-printer').CharacterSet.PC857_TURKISH,
          codePage: 'CP857'
        });

        log(`${stationId} yazıcısına bağlanılıyor (Hızlı kontrol)...`);

        // Yazdır - isPrinterConnected hanging durumuna karşı timeout ekleyebiliriz ama 
        // printerService içindeki timeout'a güvenebiliriz. Bir adım daha log ekleyelim.
        log(`İşlem başlatıldı: ${stationId} (${printerConfig.ip}:${printerConfig.port || 9100})`);
        const printResult = await printerService.printOrderAdvanced(stationId, {
          orderNumber: order.id.substring(0, 8),
          tableNumber: order.tableNumber || 'Paket',
          items: stationItems
        });

        if (printResult.success) {
          log(`${stationId} yazıcısına başarıyla gönderildi (${printerConfig.ip})`, 'success');
          results.push({ stationId, success: true });
        } else {
          log(`${stationId} (${printerConfig.ip}) yazdırma hatası: ${printResult.error}`, 'error');
          results.push({
            stationId,
            success: false,
            error: printResult.error,
            isLocalIP: printResult.isLocalIP,
            ip: printerConfig.ip,
            stationItems
          });
        }
      } else {
        log(`${stationId} istasyonu için aktif yazıcı bulunamadı (enabled: ${printerConfig?.enabled}, ip: ${printerConfig?.ip})`, 'warning');
        results.push({ stationId, success: false, error: 'Printer not configured or disabled' });
      }
    }

    const overallSuccess = results.some(r => r.success);
    res.json({
      success: overallSuccess,
      message: overallSuccess ? 'Baskı işlemi tamamlandı' : 'Hiçbir yazıcıya gönderilemedi',
      results,
      steps
    });

  } catch (error) {
    log(`Sistem hatası: ${error.message}`, 'error');
    res.status(500).json({ success: false, message: 'Internal server error', steps });
  }
});

// POST /api/orders/:id/print-info (Information receipt for cashier)
router.post('/:id/print-info', async (req, res) => {
  const steps = [];
  const log = (msg, type = 'info') => {
    steps.push({ timestamp: new Date().toISOString(), message: msg, type });
    console.log(`[PRINT-INFO] ${msg}`);
  };

  try {
    const { id } = req.params;
    const { cashierName } = req.body;
    log(`Bilgi fişi isteği alındı. ID: ${id}`);

    let orders = [];
    let tableNumber = null;
    let restaurantId = null;

    if (id.startsWith('table-') && id.endsWith('-grouped')) {
      const tableToken = id.replace('table-', '').replace('-grouped', '');
      tableNumber = tableToken === 'null' ? null : Number(tableToken);

      // Need restaurantId from query or body if it's a virtual ID
      restaurantId = req.query.restaurantId || req.body.restaurantId;
      if (!restaurantId) {
        return res.status(400).json({ success: false, message: 'restaurantId required for grouped orders', steps });
      }

      orders = await Order.findAll({
        where: {
          restaurantId,
          tableNumber,
          status: { [Op.notIn]: ['completed', 'cancelled'] }
        },
        include: [{
          model: OrderItem,
          as: 'items',
          include: [{ model: MenuItem, as: 'menuItem' }]
        }]
      });
      log(`Gruplanmış siparişler bulundu: ${orders.length} adet.`);
    } else {
      const order = await Order.findByPk(id, {
        include: [{
          model: OrderItem,
          as: 'items',
          include: [{ model: MenuItem, as: 'menuItem' }]
        }]
      });
      if (!order) return res.status(404).json({ success: false, message: 'Order not found', steps });
      orders = [order];
      tableNumber = order.tableNumber;
      restaurantId = order.restaurantId;
      log(`Tekil sipariş bulundu.`);
    }

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'No active orders found for this table', steps });
    }

    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found', steps });

    // Ürünleri birleştir
    const consolidatedItems = [];
    orders.forEach(o => {
      o.items.forEach(it => {
        consolidatedItems.push({
          name: it.menuItem?.name || 'Ürün',
          quantity: Number(it.quantity),
          price: Number(it.unitPrice)
        });
      });
    });

    // Kasa yazıcısını bul (varsayılan: 'kasa' veya 'default')
    // PrinterConfig içinde stationId'lere bakarız. Eğer 'kasa' yoksa, ilk aktif olanı dene?
    // Kullanıcı genelde kasadan çıkartacağı için 'kasa' isimli bir station arayalım.
    let targetStation = 'kasa';
    if (!restaurant.printerConfig || !restaurant.printerConfig[targetStation]) {
      // Eğer 'kasa' yoksa 'default' dene
      if (restaurant.printerConfig && restaurant.printerConfig['default']) {
        targetStation = 'default';
      } else if (restaurant.printerConfig) {
        // İlk bulunanı seç
        targetStation = Object.keys(restaurant.printerConfig)[0] || 'default';
      }
    }

    const printerConfig = restaurant.printerConfig ? restaurant.printerConfig[targetStation] : null;
    log(`Hedef yazıcı istasyonu: ${targetStation}`);

    if (printerConfig && printerConfig.enabled && printerConfig.ip) {
      const printerService = require('../services/printerService');

      printerService.addOrUpdateStation(targetStation, {
        name: targetStation,
        ip: printerConfig.ip,
        port: printerConfig.port || 9100,
        enabled: true,
        type: require('node-thermal-printer').PrinterTypes.EPSON,
        characterSet: require('node-thermal-printer').CharacterSet.PC857_TURKISH,
        codePage: 'CP857'
      });

      const printResult = await printerService.printInformationReceipt(targetStation, {
        orderNumber: id.includes('grouped') ? `TBL-${tableNumber}` : id,
        tableNumber: tableNumber || 'Paket',
        items: consolidatedItems,
        cashierName: cashierName || 'Kasiyer'
      });

      if (printResult.success) {
        log(`Bilgi fişi başarıyla yazdırıldı: ${targetStation} (${printerConfig.ip})`, 'success');
        return res.json({ success: true, message: 'Bilgi fişi yazdırıldı', steps });
      } else {
        log(`Yazdırma hatası: ${printResult.error}`, 'error');
        return res.json({
          success: false,
          error: printResult.error,
          isLocalIP: printResult.isLocalIP,
          ip: printerConfig.ip,
          stationItems: consolidatedItems, // Failover için items gönder
          steps
        });
      }
    } else {
      log('Yazıcı yapılandırması eksik veya devre dışı', 'error');
      return res.status(400).json({ success: false, message: 'Printer not configured', steps });
    }

  } catch (error) {
    log(`Sistem hatası: ${error.message}`, 'error');
    res.status(500).json({ success: false, message: 'Internal server error', steps });
  }
});

module.exports = router;


