const express = require('express');
const router = express.Router();
const { Sequelize, Op } = require('sequelize');
const { Order, OrderItem, Restaurant, MenuItem, MenuCategory, QRToken } = require('../models');
const waiterCalls = require('../lib/waiterStore');

const resolveDrinkStationForTable = (restaurant, tableNumber, menuItemCategoryId, itemKitchenStation = '', categoryName = '', productName = '') => {
  try {
    // KROREN SPECIAL LOGIC
    if (
      restaurant?.username === 'kroren' ||
      restaurant?.username === 'kroren-levent' ||
      restaurant?.name?.includes('Kroren')
    ) {
      const lowerStation = itemKitchenStation ? itemKitchenStation.toLowerCase().trim() : '';

      // 1. İçecekler - Eğer istasyon 'icecek' ise masa numarasına göre böl
      // 'icecek1' ve 'icecek2' de gelse aynı mantığı koruyalım ki hata payı kalmasın
      if (lowerStation.includes('icecek') || lowerStation.includes('bar') || lowerStation.includes('drink')) {
        const t = Number(tableNumber);
        if (Number.isFinite(t)) {
          if (t >= 1 && t <= 18) return 'icecek1';
          if (t >= 19 && t <= 42) return 'icecek2';
          return 'icecek1'; // Default
        }
      }

      // 2. Diğerleri - Kullanıcının panelden yaptığı eşleştirmeyi (kitchenStation) doğrudan kullan
      // Ör: 'kavurma', 'ramen', 'manti', 'kebap'
      if (lowerStation) {
        return lowerStation;
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

// DEBUG ROUTE: Delete orders by date
router.post('/bulk-delete-by-date', async (req, res) => {
  const { username, date } = req.body;
  console.log(`🗑️ Bulk delete request for ${username} on ${date}`);

  try {
    if (!username || !date) {
      return res.status(400).json({ success: false, message: 'username and date are required' });
    }

    const restaurant = await Restaurant.findOne({ where: { username } });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const orders = await Order.findAll({
      where: {
        restaurantId: restaurant.id,
        created_at: { [Op.between]: [start, end] }
      }
    });

    const orderIds = orders.map(o => o.id);

    if (orderIds.length === 0) {
      return res.json({ success: true, message: 'No orders found for this date', deletedCount: 0 });
    }

    // Delete items first due to FK constraints
    await OrderItem.destroy({ where: { orderId: { [Op.in]: orderIds } } });
    const deletedCount = await Order.destroy({ where: { id: { [Op.in]: orderIds } } });

    res.json({
      success: true,
      message: `${deletedCount} orders deleted successfully`,
      deletedCount
    });
  } catch (error) {
    console.error('❌ Bulk Delete Error:', error);
    res.status(500).json({ success: false, message: error.message });
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
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(restaurantId);

    if (typeof restaurantId === 'string' && !isUuid) {
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

      // Removed the 3-hour optimization as it was causing orders to disappear 
      // when stay duration exceeded 3h or during clock sync issues.
      /*
      if (['pending', 'preparing', 'ready'].some(s => status.includes(s))) {
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
        where.created_at = { [Op.gte]: threeHoursAgo };
      }
      */
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

    // Kasa ve Debug panelleri için performans ve güncel veri odağı
    if (req.query.from === 'cashier' || req.query.from === 'debug') {
      // Günlük ciro ve aktif siparişler için son 24 saati getir (performans için)
      if (!status || status === 'all') {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        where.created_at = { [Op.gte]: twentyFourHoursAgo };
      }
    }

    console.log(`🎯 GET /api/orders construction:`, {
      resId: restaurantId,
      finalId: actualRestaurantId,
      statusFilter: status,
      isUuid,
      where: JSON.stringify(where)
    });

    const orders = await Order.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    console.log(`📊 Found ${orders.length} orders in DB for these filters.`);

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
              attributes: ['kitchenStation', 'name']
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
        it.menuItem?.kitchenStation || it.menuItem?.category?.kitchenStation,
        it.menuItem?.category?.name,
        it.menuItem?.name
      );
      const itemStation = drinkStation || it.menuItem?.kitchenStation || 'default';

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
        categoryId: it.menuItem?.categoryId, // Kategori ID'sini ekle (filtreleme için)
        variations: it.variations || [] // Varyasyonları ekle
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
    });

    // Kasa/Debug için hepsi kalsın, mutfak için boşalanlar elensin
    const isSpecialPanel = req.query.from === 'cashier' || req.query.from === 'debug';
    const finalData = isSpecialPanel
      ? data
      : data.filter(order => order.items.length > 0);

    console.log(`📡 GET /orders Response: returning ${finalData.length} orders. (SpecialPanel=${isSpecialPanel})`);

    res.json({
      success: true,
      data: finalData,
      _debug: isSpecialPanel ? { where, query: req.query, rawCount: orders.length } : undefined
    });
  } catch (error) {
    console.error('💥 GET /orders error:', error);
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
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(restaurantId);

    if (typeof restaurantId === 'string' && !isUuid) {
      console.log('🔍 Looking up restaurant by username:', restaurantId);
      const restaurant = await Restaurant.findOne({ where: { username: restaurantId } });
      if (!restaurant) {
        return res.status(404).json({ success: false, message: `Restaurant with username '${restaurantId}' not found` });
      }
      actualRestaurantId = restaurant.id;
      console.log('✅ Found restaurant:', { username: restaurantId, id: actualRestaurantId });
    }

    // Safety check for UUID format - be more lenient if it looks like a username we just resolved
    if (typeof actualRestaurantId !== 'string' || actualRestaurantId.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurantId format. Must be a valid UUID or username.'
      });
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

    // Total amount hesapla ve verileri temizle
    let totalAmount = 0;
    const sanitizedItems = [];

    for (const it of items) {
      const qty = Math.max(1, Number(it.quantity) || 1);
      const unitPrice = parseFloat(String(it.unitPrice || it.price || 0));
      const lineTotal = qty * (isNaN(unitPrice) ? 0 : unitPrice);

      totalAmount += lineTotal;

      // Item bazlı kitchen station resolve (içecek ayrımı için)
      let itemNote = it.notes || '';

      sanitizedItems.push({
        ...it,
        quantity: qty,
        unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
        totalPrice: lineTotal,
        notes: itemNote
      });
    }

    if (isNaN(totalAmount)) totalAmount = 0;

    // OrderType validation (DB ENUM sync)
    const validOrderTypes = ['dine_in', 'takeaway', 'delivery'];
    const finalOrderType = validOrderTypes.includes(orderType) ? orderType : 'dine_in';

    console.log('✅ Finalizing order with total:', totalAmount);

    const order = await Order.create({
      restaurantId: actualRestaurantId,
      tableNumber: tableNumber || null,
      customerName: customerName || null,
      status: 'pending',
      totalAmount: totalAmount.toFixed(2),
      notes: notes || null,
      orderType: finalOrderType,
      approved: autoApprove
    });

    for (const it of sanitizedItems) {
      // Resolve a valid menuItemId
      let resolvedMenuItemId = it.menuItemId;
      const looksLikeUuid = typeof resolvedMenuItemId === 'string' &&
        resolvedMenuItemId.length >= 8 &&
        resolvedMenuItemId.includes('-');

      if (!resolvedMenuItemId || !looksLikeUuid) {
        try {
          if (it.name) {
            const found = await MenuItem.findOne({ where: { restaurantId: actualRestaurantId, name: it.name } });
            if (found) {
              resolvedMenuItemId = found.id;
            } else {
              let defCat = await MenuCategory.findOne({ where: { restaurantId: actualRestaurantId, name: 'Genel' } });
              if (!defCat) {
                defCat = await MenuCategory.create({ restaurantId: actualRestaurantId, name: 'Genel' });
              }
              const created = await MenuItem.create({
                restaurantId: actualRestaurantId,
                categoryId: defCat.id,
                name: typeof it.name === 'string' ? it.name : 'Ürün',
                price: it.unitPrice,
                description: it.notes || null
              });
              resolvedMenuItemId = created.id;
            }
          }
        } catch (e) {
          console.warn('MenuItem resolve failed:', e.message);
        }
      }

      await OrderItem.create({
        orderId: order.id,
        menuItemId: resolvedMenuItemId,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
        notes: it.notes || null,
        variations: it.variations || []
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
    console.error('❌ POST /orders CRITICAL ERROR:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({
      success: false,
      message: 'Sipariş oluşturulurken sunucu hatası oluştu',
      error: error.message
    });
  }
});


// POST /api/orders/merge
router.post('/merge', async (req, res) => {
  try {
    const { restaurantId, sourceTableId, targetTableId } = req.body;
    console.log('Merge Request:', req.body);

    if (!restaurantId || !sourceTableId || !targetTableId) {
      return res.status(400).json({ success: false, message: 'Missing parameters' });
    }

    if (sourceTableId === targetTableId) {
      return res.status(400).json({ success: false, message: 'Tables must be different' });
    }

    const sourceTableNumber = typeof sourceTableId === 'string' ? parseInt(sourceTableId.replace('table-', '')) : sourceTableId;
    const targetTableNumber = typeof targetTableId === 'string' ? parseInt(targetTableId.replace('table-', '')) : targetTableId;

    // Find active orders
    const sourceOrder = await Order.findOne({
      where: {
        restaurantId,
        tableNumber: sourceTableNumber,
        status: { [Op.in]: ['pending', 'preparing', 'ready', 'approved'] },
        approved: true
      }
    });

    const targetOrder = await Order.findOne({
      where: {
        restaurantId,
        tableNumber: targetTableNumber,
        status: { [Op.in]: ['pending', 'preparing', 'ready', 'approved'] },
        approved: true
      }
    });

    if (!sourceOrder) {
      return res.status(404).json({ success: false, message: 'Source table has no active order' });
    }

    // If target has no order, just move source to target
    if (!targetOrder) {
      sourceOrder.tableNumber = targetTableNumber;
      await sourceOrder.save();

      // Notify updates
      const { publish } = require('../lib/realtime');
      publish('order_update', {
        orderId: sourceOrder.id,
        restaurantId,
        status: sourceOrder.status,
        tableNumber: targetTableNumber
      });

      return res.json({ success: true, message: 'Table moved successfully' });
    }

    // If both exist, merge items
    // Move items from source to target
    await OrderItem.update(
      { orderId: targetOrder.id },
      { where: { orderId: sourceOrder.id } }
    );

    // Update target totals
    targetOrder.totalAmount = Number(targetOrder.totalAmount) + Number(sourceOrder.totalAmount);
    await targetOrder.save();

    // Delete source order
    await sourceOrder.destroy();

    // Notify updates
    const { publish } = require('../lib/realtime');
    publish('order_update', {
      orderId: targetOrder.id,
      restaurantId,
      status: targetOrder.status,
      tableNumber: targetTableNumber
    });

    // Also notify source table is now empty 
    publish('order_update', {
      orderId: sourceOrder.id,
      restaurantId,
      status: 'cancelled',
      tableNumber: sourceTableNumber
    });

    res.json({ success: true, message: 'Tables merged successfully' });

  } catch (error) {
    console.error('Merge error:', error);
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
  // PUT /api/orders/:id
  try {
    const { id } = req.params;
    const { status, items, totalAmount, tableNumber, paidAmount, discountAmount, discountReason, cashierNote, approved } = req.body;

    console.log(`📝 Order Update Request: ${id}`, { status, itemsIn: items?.length });

    if (id.startsWith('table-') && id.endsWith('-grouped')) {
      return res.status(400).json({
        success: false,
        message: 'Grouped order ids are virtual. Update individual orders instead.'
      });
    }

    const allowed = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'invalid status' });
    }

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const oldApproved = order.approved;
    const previousStatus = order.status;

    // Sync items and update order
    if (status) order.status = status;
    if (tableNumber !== undefined) order.tableNumber = tableNumber;
    if (paidAmount !== undefined) order.paidAmount = paidAmount;
    if (discountAmount !== undefined) order.discountAmount = discountAmount;
    if (totalAmount !== undefined) order.totalAmount = totalAmount;
    if (discountReason) order.discountReason = discountReason;
    if (cashierNote) order.cashierNote = cashierNote;
    if (approved !== undefined) order.approved = approved;

    if (items && Array.isArray(items)) {
      // Atomic-like sync: delete and recreate items
      await OrderItem.destroy({ where: { orderId: id } });
      for (const item of items) {
        const mId = item.menuItemId || item.id;
        if (!mId) continue;

        let unitPrice = parseFloat(String(item.price || item.unitPrice || 0));

        // If price is 0 or NaN, try to look it up from MenuItem table
        if (isNaN(unitPrice) || unitPrice <= 0) {
          try {
            const menuItem = await MenuItem.findByPk(mId);
            if (menuItem) {
              unitPrice = parseFloat(String(menuItem.price || 0));
            }
          } catch (e) {
            console.warn(`Price lookup failed for item ${mId}:`, e.message);
          }
        }

        // Final safety check to ensure it's a valid number
        if (isNaN(unitPrice)) unitPrice = 0;

        const qty = Number(item.quantity || 1);

        // Calculate total price with fallback to provided total
        // First try to calculate from unit price
        let totalPrice = unitPrice * qty;

        // If calculation resulted in invalid number or 0 (and we have a provided total),
        // or if we just want to trust the frontend more:
        // Let's verify against provided totalPrice if available
        if (item.totalPrice !== undefined && item.totalPrice !== null) {
          const providedTotal = parseFloat(String(item.totalPrice));
          if (!isNaN(providedTotal)) {
            // Use provided total if calculation failed or if we prefer frontend value
            // Here we prioritize calculation if unitPrice is valid, but use provided as fallback?
            // actually, let's use provided total if it exists and is valid number, 
            // as frontend might have specific logic (discounts/modifiers not captured here)
            totalPrice = providedTotal;
          }
        }

        // Final safety check
        if (isNaN(totalPrice) || totalPrice === null) totalPrice = 0;

        try {
          console.log(`🛠️ Creating OrderItem for Order ${id}:`, {
            menuItemId: mId,
            qty,
            unitPrice,
            totalPrice,
            isPriceNull: totalPrice === null,
            isPriceNaN: isNaN(totalPrice)
          });

          if (totalPrice === null) {
            console.error('CRITICAL: totalPrice is null despite checks!');
            totalPrice = 0;
          }

          await OrderItem.create({
            orderId: id,
            menuItemId: mId,
            quantity: qty,
            unitPrice: unitPrice,
            totalPrice: totalPrice,
            notes: item.notes || '',
            variations: item.variations || []
          });
        } catch (err) {
          console.error('❌ OrderItem create failed:', err.message, {
            orderId: id,
            menuItemId: mId
          });
          throw err;
        }
      }
    }

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
              if (!itemsByStation[station]) itemsByStation[station] = [];
              itemsByStation[station].push({
                name: item.menuItem?.name || 'Ürün',
                quantity: item.quantity,
                notes: item.notes || '',
                translations: item.menuItem?.translations || {},
                variations: item.variations || []
              });
            }

            // Kasa yazıcısına da bir kopyasını gönder (Sipariş Fişi olarak)
            const cashierStation = restaurant.printerConfig['kasa'] ? 'kasa' : (restaurant.printerConfig['default'] ? 'default' : Object.keys(restaurant.printerConfig)[0]);
            if (cashierStation && !itemsByStation[cashierStation]) {
              itemsByStation[cashierStation] = orderItems.map(it => ({
                name: it.menuItem?.name || 'Ürün',
                quantity: it.quantity,
                notes: it.notes || '',
                translations: it.menuItem?.translations || {},
                variations: it.variations || []
              }));
            }

            // Her istasyona yazdır
            for (const [stationId, stationItems] of Object.entries(itemsByStation)) {
              const printerConfig = restaurant.printerConfig[stationId];
              if (printerConfig && printerConfig.enabled && printerConfig.ip) {
                console.log(`🖨️ ${stationId} istasyonuna yazdırılıyor (${printerConfig.ip})...`);

                const printResult = await printerService.printOrderWithConfig({
                  name: stationId,
                  ip: printerConfig.ip,
                  port: printerConfig.port || 9100,
                  enabled: true,
                  type: require('node-thermal-printer').PrinterTypes.EPSON,
                  characterSet: require('node-thermal-printer').CharacterSet.PC857_TURKISH,
                  codePage: 'CP857',
                  language: printerConfig.language || (stationId === 'kitchen' ? 'zh' : 'tr')
                }, {
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
            order.printResults = printResults;
          }
        } catch (printError) {
          console.error('❌ Yazdırma hatası:', printError);
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
    // KROREN ÖZEL: Kroren için QR kodları kalıcıdır, yenileme yapma.
    const isKroren = order.restaurantId === '37b0322a-e11f-4ef1-b108-83be310aaf4d' ||
      (order.restaurant && (order.restaurant.username === 'kroren' || order.restaurant.username === 'kroren-levent'));

    if (status === 'completed' && previousStatus !== 'completed' && order.tableNumber && !isKroren) {
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

        // Kasa yazıcısını belirle (Öncelik: 'kasa' -> 'default')
        const cashierStationId = restaurant.printerConfig['kasa'] ? 'kasa' : (restaurant.printerConfig['default'] ? 'default' : Object.keys(restaurant.printerConfig)[0]);

        if (cashierStationId) {
          const printerConfig = restaurant.printerConfig[cashierStationId];

          if (printerConfig && printerConfig.enabled && printerConfig.ip) {
            console.log(`🖨️ KASA FİŞİ (Ödeme) yazdırılıyor: ${cashierStationId} (${printerConfig.ip})...`);
            printerService.addOrUpdateStation(cashierStationId, {
              name: cashierStationId,
              ip: printerConfig.ip,
              port: printerConfig.port || 9100,
              enabled: true,
              type: require('node-thermal-printer').PrinterTypes.EPSON,
              characterSet: require('node-thermal-printer').CharacterSet.PC857_TURKISH,
              codePage: 'CP857'
            });

            // Bilgi fişi formatında ödeme özeti yazdır
            const printResult = await printerService.printInformationReceipt(cashierStationId, {
              orderNumber: order.id.substring(0, 8),
              tableNumber: order.tableNumber || 'Paket',
              items: orderItems.map(it => ({
                name: it.menuItem?.name || 'Ürün',
                quantity: it.quantity,
                price: Number(it.unitPrice)
              })),
              cashierName: order.cashierNote?.includes('KART') ? 'KARTLI ÖDEME' : 'NAKİT ÖDEME'
            }, restaurant);

            printResults.push({
              stationId: cashierStationId,
              success: printResult.success,
              error: printResult.error,
              isLocalIP: printResult.isLocalIP,
              ip: printerConfig.ip,
              type: 'payment_receipt'
            });
          }
        }
        combinedPrintResults = [...combinedPrintResults, ...printResults];
      } catch (printError) {
        console.error('❌ Ödeme sonrası yazdırma hatası:', printError);
      }
    }

    // NOTE: Items are already processed above (lines 760-831) with proper totalPrice calculation.
    // This duplicate block was removed as it was causing notNull Violation errors.
    // If you need to update totalAmount separately:
    if (totalAmount !== undefined && !items) {
      order.totalAmount = totalAmount;
      await order.save();
    }

    const responseData = order.get({ plain: true });
    responseData.printResults = combinedPrintResults;
    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('PUT /orders/:id error:', error);
    res.status(500).json({ success: false, message: error.message, error: error.message });
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
        attributes: ['name', 'kitchenStation', 'categoryId'],
        include: [{ model: MenuCategory, as: 'category', attributes: ['name'] }]
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
        item.menuItem?.kitchenStation,
        item.menuItem?.category?.name,
        item.menuItem?.name
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
      }, restaurant);

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


