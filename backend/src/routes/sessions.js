const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

// In-memory session store (production'da Redis kullanılabilir)
const sessions = new Map(); // key: `${restaurantId}-${tableNumber}-${qrToken}`, value: Session object

// Session structure:
// {
//   restaurantId: string,
//   tableNumber: number,
//   qrToken: string,
//   cart: CartItem[],
//   activeUsers: Set<string>, // clientId'ler
//   createdAt: Date,
//   lastUpdated: Date
// }

// Helper: Get session key
const getSessionKey = (restaurantId, tableNumber, qrToken) => {
  return `${restaurantId}-${tableNumber}-${qrToken}`;
};

// Helper: Generate client ID
const generateClientId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// POST /api/sessions/join - Join a session (QR kod okutulduğunda)
router.post('/join', async (req, res) => {
  try {
    const { restaurantId, tableNumber, qrToken } = req.body;
    
    if (!restaurantId || !tableNumber || !qrToken) {
      return res.status(400).json({
        success: false,
        message: 'restaurantId, tableNumber, and qrToken are required'
      });
    }

    const sessionKey = getSessionKey(restaurantId, tableNumber, qrToken);
    const clientId = generateClientId();

    // Session varsa kullanıcı ekle, yoksa oluştur
    if (sessions.has(sessionKey)) {
      const session = sessions.get(sessionKey);
      session.activeUsers.add(clientId);
      session.lastUpdated = new Date();
      console.log(`👤 User ${clientId} joined session ${sessionKey}. Active users: ${session.activeUsers.size}`);
    } else {
      // Yeni session oluştur
      const newSession = {
        restaurantId,
        tableNumber,
        qrToken,
        cart: [],
        activeUsers: new Set([clientId]),
        createdAt: new Date(),
        lastUpdated: new Date()
      };
      sessions.set(sessionKey, newSession);
      console.log(`✨ New session created: ${sessionKey} by user ${clientId}`);
    }

    const session = sessions.get(sessionKey);

    res.json({
      success: true,
      data: {
        clientId,
        sessionKey,
        activeUsersCount: session.activeUsers.size,
        cart: session.cart
      }
    });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/sessions/:sessionKey - Get session info
router.get('/:sessionKey', async (req, res) => {
  try {
    const { sessionKey } = req.params;
    const { clientId } = req.query;

    if (!sessions.has(sessionKey)) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const session = sessions.get(sessionKey);

    // Client ID varsa aktif kullanıcı olarak işaretle (heartbeat)
    if (clientId && session.activeUsers.has(clientId)) {
      session.lastUpdated = new Date();
    }

    res.json({
      success: true,
      data: {
        restaurantId: session.restaurantId,
        tableNumber: session.tableNumber,
        activeUsersCount: session.activeUsers.size,
        cart: session.cart,
        lastUpdated: session.lastUpdated
      }
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/sessions/:sessionKey/cart - Update cart
router.put('/:sessionKey/cart', async (req, res) => {
  try {
    const { sessionKey } = req.params;
    const { cart, clientId } = req.body;

    if (!sessions.has(sessionKey)) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const session = sessions.get(sessionKey);

    // Client ID kontrolü (opsiyonel, güvenlik için)
    if (clientId && !session.activeUsers.has(clientId)) {
      return res.status(403).json({
        success: false,
        message: 'User not in session'
      });
    }

    // Sepeti güncelle
    session.cart = cart || [];
    session.lastUpdated = new Date();

    console.log(`🛒 Cart updated for session ${sessionKey} by ${clientId || 'unknown'}. Items: ${session.cart.length}`);

    res.json({
      success: true,
      data: {
        cart: session.cart,
        activeUsersCount: session.activeUsers.size
      }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/sessions/:sessionKey/leave - Leave session
router.delete('/:sessionKey/leave', async (req, res) => {
  try {
    const { sessionKey } = req.params;
    const { clientId } = req.body;

    if (!sessions.has(sessionKey)) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const session = sessions.get(sessionKey);

    if (clientId) {
      session.activeUsers.delete(clientId);
      session.lastUpdated = new Date();
      console.log(`👋 User ${clientId} left session ${sessionKey}. Active users: ${session.activeUsers.size}`);

      // Eğer hiç aktif kullanıcı kalmadıysa session'ı temizle (opsiyonel)
      if (session.activeUsers.size === 0) {
        // 5 dakika sonra session'ı sil (kullanıcı geri dönebilir)
        setTimeout(() => {
          if (sessions.has(sessionKey)) {
            const checkSession = sessions.get(sessionKey);
            if (checkSession.activeUsers.size === 0) {
              sessions.delete(sessionKey);
              console.log(`🗑️ Session ${sessionKey} cleaned up (no active users)`);
            }
          }
        }, 5 * 60 * 1000); // 5 dakika
      }
    }

    res.json({
      success: true,
      data: {
        activeUsersCount: session.activeUsers.size
      }
    });
  } catch (error) {
    console.error('Leave session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/sessions/:sessionKey/order-complete - Order completed notification
router.post('/:sessionKey/order-complete', async (req, res) => {
  try {
    const { sessionKey } = req.params;
    const { clientId, orderId } = req.body;

    if (!sessions.has(sessionKey)) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const session = sessions.get(sessionKey);

    // Sepeti temizle
    session.cart = [];
    session.lastUpdated = new Date();

    console.log(`✅ Order completed for session ${sessionKey} by ${clientId}. Order ID: ${orderId}`);

    res.json({
      success: true,
      message: 'Order completed, cart cleared',
      data: {
        cart: [],
        activeUsersCount: session.activeUsers.size
      }
    });
  } catch (error) {
    console.error('Order complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Cleanup old sessions (periodic cleanup - can be called by cron)
router.post('/cleanup', async (req, res) => {
  try {
    const now = new Date();
    const maxAge = 30 * 60 * 1000; // 30 dakika

    let cleaned = 0;
    for (const [key, session] of sessions.entries()) {
      const age = now - session.lastUpdated;
      if (age > maxAge && session.activeUsers.size === 0) {
        sessions.delete(key);
        cleaned++;
      }
    }

    console.log(`🧹 Cleaned up ${cleaned} old sessions`);

    res.json({
      success: true,
      message: `Cleaned up ${cleaned} old sessions`,
      totalSessions: sessions.size
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
