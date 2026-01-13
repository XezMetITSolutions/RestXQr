const express = require('express');
const router = express.Router();
const { Restaurant } = require('../models');

// Garson çağrıları için merkezi store (orders.js ile ortak kullanılır)
const waiterCalls = require('../lib/waiterStore');

// POST /api/waiter/call - Garson çağırma
router.post('/call', async (req, res) => {
  try {
    const { tableNumber, type, message, timestamp, restaurantId } = req.body;

    if (!tableNumber || !type || !message || !restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'tableNumber, type, message ve restaurantId gerekli'
      });
    }

    // Çağrı ID'si oluştur
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Çağrıyı store'a ekle
    const call = {
      id: callId,
      restaurantId,
      tableNumber: parseInt(tableNumber),
      type,
      message,
      timestamp: timestamp || new Date().toISOString(),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    waiterCalls.set(callId, call);

    console.log(`🔔 Garson çağrısı [${restaurantId}]: Masa ${tableNumber} - ${type} - ${message}`);

    // Real-time bildirim gönder
    try {
      const { publish } = require('../lib/realtime');
      publish('waiter_call', call);
    } catch (realtimeError) {
      console.warn('⚠️ Realtime notification failed for waiter call:', realtimeError.message);
    }

    res.status(201).json({
      success: true,
      data: call,
      message: 'Garson çağrısı gönderildi'
    });
  } catch (error) {
    console.error('POST /waiter/call error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/waiter/calls - Aktif çağrıları getir
router.get('/calls', async (req, res) => {
  try {
    const { restaurantId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'restaurantId gerekli'
      });
    }

    // Bu restorana ait aktif çağrıları getir
    const calls = Array.from(waiterCalls.values())
      .filter(call => call.restaurantId === restaurantId && call.status === 'active')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: calls
    });
  } catch (error) {
    console.error('GET /waiter/calls error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/waiter/calls/:id/resolve - Çağrıyı çöz
router.put('/calls/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;

    if (!waiterCalls.has(id)) {
      return res.status(404).json({
        success: false,
        message: 'Çağrı bulunamadı'
      });
    }

    // Çağrıyı çözülmüş olarak işaretle
    const call = waiterCalls.get(id);
    call.status = 'resolved';
    call.resolvedAt = new Date().toISOString();

    waiterCalls.set(id, call);

    console.log(`✅ Çağrı çözüldü: ${id} - Masa ${call.tableNumber}`);

    res.json({
      success: true,
      data: call,
      message: 'Çağrı çözüldü'
    });
  } catch (error) {
    console.error('PUT /waiter/calls/:id/resolve error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/waiter/calls/:id - Çağrıyı sil
router.delete('/calls/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!waiterCalls.has(id)) {
      return res.status(404).json({
        success: false,
        message: 'Çağrı bulunamadı'
      });
    }

    waiterCalls.delete(id);

    console.log(`🗑️ Çağrı silindi: ${id}`);

    res.json({
      success: true,
      message: 'Çağrı silindi'
    });
  } catch (error) {
    console.error('DELETE /waiter/calls/:id error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
