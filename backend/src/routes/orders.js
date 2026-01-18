const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
const { Op } = Sequelize;
const { Order, OrderItem, Restaurant, MenuItem, MenuCategory, QRToken } = require('../models');
const waiterCalls = require('../lib/waiterStore');

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
      where.status = status;
    } else if (tableNumber) {
      // Masa numarası ile sorgulanıyorsa ve status belirtilmemişse, sadece aktif siparişleri getir
      where.tableNumber = tableNumber;
      where.status = { [Op.notIn]: ['completed', 'cancelled'] };
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
      const itemStation = it.menuItem?.kitchenStation || it.menuItem?.category?.kitchenStation || 'default';

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
        kitchenStation: itemStation
      });
      orderIdToItems.set(it.orderId, list);
    }

    const data = orders.map(o => ({
      ...o.toJSON(),
      items: orderIdToItems.get(o.id) || []
    }));

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

    // Basic total calc if client did not send
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
      status: 'pending',
      totalAmount,
      notes: notes || null,
      orderType
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
router.options('/:id', (req, res) => {
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
    if (tableNumber) order.tableNumber = tableNumber;
    if (paidAmount !== undefined) order.paidAmount = paidAmount;
    if (discountAmount !== undefined) order.discountAmount = discountAmount;
    if (discountReason) order.discountReason = discountReason;
    if (cashierNote) order.cashierNote = cashierNote;
    if (approved !== undefined) order.approved = approved;

    await order.save();

    // Sipariş onaylandığında (false -> true) bildirim gönder
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

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('PUT /orders/:id error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;


