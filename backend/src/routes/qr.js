const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Op } = require('sequelize');

// Models import
const models = require('../models');
const QRToken = models.QRToken;
const Restaurant = models.Restaurant;

// Helper: Generate secure token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Helper: Check if token is expired
const isTokenExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};

// POST /api/qr/generate - Generate QR token for a table
router.post('/generate', async (req, res) => {
  try {
    console.log('🔍 QR Generate endpoint called:', req.body);

    if (!QRToken || !Restaurant) {
      console.error('❌ Models not loaded:', { QRToken: !!QRToken, Restaurant: !!Restaurant });
      return res.status(503).json({
        success: false,
        message: 'QR system temporarily unavailable - models not loaded'
      });
    }

    const { restaurantId, tableNumber, duration = 2 } = req.body; // duration in hours

    console.log('📝 Request data:', { restaurantId, tableNumber, duration });

    if (!restaurantId || !tableNumber) {
      console.error('❌ Missing required fields:', { restaurantId, tableNumber });
      return res.status(400).json({
        success: false,
        message: 'Restaurant ID and table number are required'
      });
    }

    // Verify restaurant exists
    console.log('🔍 Checking restaurant:', restaurantId);
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      console.error('❌ Restaurant not found:', restaurantId);
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    console.log('✅ Restaurant found:', {
      id: restaurant.id,
      name: restaurant.name,
      username: restaurant.username
    });

    // Plan limiti kontrolü - Maksimum masa sayısı
    const maxTables = restaurant.maxTables || 10;
    if (tableNumber > maxTables) {
      console.error(`❌ Table limit exceeded: ${tableNumber} > ${maxTables}`);
      return res.status(403).json({
        success: false,
        message: `Plan limitiniz aşıldı! Maksimum ${maxTables} masa oluşturabilirsiniz. Paketinizi yükseltin.`,
        limit: maxTables,
        current: tableNumber,
        upgradeRequired: true
      });
    }

    // Try to reuse existing active, not expired token for this table
    const existing = await QRToken.findOne({
      where: {
        restaurantId,
        tableNumber,
        isActive: true,
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['createdAt', 'DESC']]
    });

    // Build subdomain-based URL if possible (restaurant.username kontrolü önce yapılmalı)
    if (!restaurant.username) {
      console.error('❌ Restaurant username is missing:', restaurant.id, restaurant.name);
      return res.status(400).json({
        success: false,
        message: 'Restaurant username is required for QR code generation'
      });
    }
    const sub = restaurant.username;
    const origin = process.env.FRONTEND_URL || `https://${sub}.restxqr.com`;

    let qrToken;
    if (existing) {
      // Reused tokens should also be long-lived (10 years) for permanent table QR codes
      const newExpiresAt = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000);
      await existing.update({ expiresAt: newExpiresAt });
      qrToken = existing;
      console.log('♻️ Reusing existing QR token:', {
        token: qrToken.token,
        tableNumber: qrToken.tableNumber,
        restaurantUsername: restaurant.username
      });
    } else {
      // Deactivate any lingering actives
      await QRToken.update(
        { isActive: false },
        { where: { restaurantId, tableNumber, isActive: true } }
      );

      const token = generateToken();
      // Süresiz QR kodlar için 10 yıl sonra expire et
      const expiresAt = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000);
      qrToken = await QRToken.create({
        restaurantId,
        tableNumber,
        token,
        expiresAt,
        isActive: true,
        createdBy: req.body.createdBy || 'waiter'
      });
      console.log('✨ Created new QR token:', {
        token: qrToken.token,
        tableNumber: qrToken.tableNumber,
        restaurantUsername: restaurant.username
      });
    }

    // Her zaman doğru subdomain ile URL oluştur
    const qrUrl = `${origin}/menu/?t=${qrToken.token}&table=${qrToken.tableNumber}`;

    console.log('🔗 QR URL generated:', {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      username: restaurant.username,
      subdomain: sub,
      qrUrl: qrUrl,
      isExisting: !!existing
    });

    res.status(existing ? 200 : 201).json({
      success: true,
      data: {
        id: qrToken.id,
        token: qrToken.token,
        tableNumber: qrToken.tableNumber,
        expiresAt: qrToken.expiresAt,
        qrUrl,
        qrData: qrUrl
      }
    });

  } catch (error) {
    console.error('❌ Generate QR token error:', error);
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/qr/verify/:token - Verify QR token
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!QRToken || !Restaurant) {
      console.error('❌ Models not loaded in verify route');
      return res.status(503).json({
        success: false,
        message: 'QR system temporarily unavailable - models not loaded'
      });
    }

    const qrToken = await QRToken.findOne({
      where: { token },
      include: [{
        model: Restaurant,
        as: 'Restaurant',
        attributes: ['id', 'name', 'username']
      }]
    });

    if (!qrToken) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code'
      });
    }

    // Token validity: Always accept existing tokens (disable isActive/expiry checks for permanent QR codes)
    const isKroren = qrToken.restaurantId === '37b0322a-e11f-4ef1-b108-83be310aaf4d' ||
      (qrToken.Restaurant && (qrToken.Restaurant.username === 'kroren' || qrToken.Restaurant.username === 'kroren-levent'));

    if (!qrToken.isActive && !isKroren) {
      return res.status(404).json({
        success: false,
        message: 'QR code has been deactivated'
      });
    }

    // Update last used time
    await qrToken.update({ usedAt: new Date() });

    res.json({
      success: true,
      data: {
        restaurantId: qrToken.restaurantId,
        restaurant: qrToken.Restaurant,
        tableNumber: qrToken.tableNumber,
        expiresAt: qrToken.expiresAt,
        remainingMinutes: Math.floor((new Date(qrToken.expiresAt) - new Date()) / 60000),
        isActive: isKroren ? true : qrToken.isActive,
        token: qrToken.token
      }
    });

  } catch (error) {
    console.error('Verify QR token error:', error);
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
      details: error.message
    });
  }
});

// POST /api/qr/refresh/:token - Refresh token expiration (waiter only)
router.post('/refresh/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { duration = 2 } = req.body; // duration in hours

    if (!QRToken) {
      console.error('❌ QRToken model not loaded in refresh route');
      return res.status(503).json({
        success: false,
        message: 'QR system temporarily unavailable'
      });
    }

    const qrToken = await QRToken.findOne({
      where: { token }
    });

    if (!qrToken) {
      return res.status(404).json({
        success: false,
        message: 'QR token not found'
      });
    }

    const newExpiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);

    await qrToken.update({
      expiresAt: newExpiresAt,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        expiresAt: newExpiresAt,
        message: `QR code refreshed for ${duration} hours`
      }
    });

  } catch (error) {
    console.error('Refresh QR token error:', error);
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
      details: error.message
    });
  }
});

// GET /api/qr/restaurant/:restaurantId/tables - Get all active QR codes for restaurant
router.get('/restaurant/:restaurantId/tables', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    console.log(`🔍 Fetching QR tokens for restaurant: ${restaurantId}`);

    if (!QRToken || !Restaurant) {
      console.error('❌ Models not loaded in GET tokens route');
      return res.status(503).json({
        success: false,
        message: 'QR system temporarily unavailable - models not loaded'
      });
    }

    const tokens = await QRToken.findAll({
      where: {
        restaurantId,
        isActive: true,
        expiresAt: {
          [Op.gt]: new Date() // Not expired
        }
      },
      order: [['tableNumber', 'ASC']],
      attributes: ['id', 'tableNumber', 'token', 'expiresAt', 'usedAt', 'createdAt']
    });

    console.log(`✅ Found ${tokens.length} active tokens for restaurant ${restaurantId}`);

    // Get restaurant to use correct subdomain
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      console.error(`❌ Restaurant not found: ${restaurantId}`);
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (!restaurant.username) {
      console.error(`❌ Restaurant username missing for ID: ${restaurantId}`);
      return res.status(400).json({
        success: false,
        message: 'Restaurant username missing'
      });
    }

    // Add QR URLs with correct subdomain
    const sub = restaurant.username;
    const baseUrl = process.env.FRONTEND_URL || `https://${sub}.restxqr.com`;

    console.log('📋 Generating QR URLs for restaurant:', {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      username: restaurant.username,
      subdomain: sub,
      baseUrl: baseUrl,
      tokenCount: tokens.length
    });

    const tokensWithUrls = tokens.map(tokenObj => {
      const qrUrl = `${baseUrl.replace(/\/$/, '')}/menu/?t=${tokenObj.token}&table=${tokenObj.tableNumber}`;
      return {
        ...tokenObj.toJSON(),
        qrUrl: qrUrl,
        scanCount: 0, // Default scan count
        remainingMinutes: tokenObj.expiresAt
          ? Math.floor((new Date(tokenObj.expiresAt).getTime() - Date.now()) / 60000)
          : 0
      };
    });

    res.json({
      success: true,
      data: tokensWithUrls
    });

  } catch (error) {
    console.error(`❌ Get restaurant QR tokens error for ID ${req.params.restaurantId}:`, error);
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// DELETE /api/qr/deactivate/:token - Deactivate QR token
router.delete('/deactivate/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!QRToken) {
      return res.status(503).json({ success: false, message: 'QR system unavailable' });
    }

    const qrToken = await QRToken.findOne({
      where: { token }
    });

    if (!qrToken) {
      return res.status(404).json({
        success: false,
        message: 'QR token not found'
      });
    }

    await qrToken.update({ isActive: false });

    res.json({
      success: true,
      message: 'QR code deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate QR token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/qr/deactivate-by-table - Deactivate active token for a table
router.post('/deactivate-by-table', async (req, res) => {
  try {
    const { restaurantId, tableNumber } = req.body;
    if (!restaurantId || !tableNumber) {
      return res.status(400).json({ success: false, message: 'restaurantId and tableNumber are required' });
    }

    if (!QRToken) {
      return res.status(503).json({ success: false, message: 'QR system unavailable' });
    }

    const activeToken = await QRToken.findOne({
      where: {
        restaurantId,
        tableNumber,
        isActive: true
      },
      order: [['createdAt', 'DESC']]
    });

    if (!activeToken) {
      return res.status(404).json({ success: false, message: 'Active QR token not found for table' });
    }

    await activeToken.update({ isActive: false });
    res.json({ success: true, message: 'QR token deactivated for table' });
  } catch (error) {
    console.error('Deactivate by table error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Cron job helper: Clean up expired tokens (call this periodically)
router.post('/cleanup', async (req, res) => {
  try {
    const result = await QRToken.update(
      { isActive: false },
      {
        where: {
          expiresAt: {
            [Op.lt]: new Date()
          },
          isActive: true
        }
      }
    );

    res.json({
      success: true,
      message: `Cleaned up ${result[0]} expired tokens`
    });

  } catch (error) {
    console.error('Cleanup expired tokens error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

