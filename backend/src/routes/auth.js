const express = require('express');
const router = express.Router();
const { Restaurant } = require('../models');
const bcrypt = require('bcryptjs');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth route is working',
    timestamp: new Date().toISOString()
  });
});

// Restaurant login endpoint
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt received');
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    console.log('🔍 Looking for restaurant:', username);
    
    // Restaurant'ı username ile bul
    const restaurant = await Restaurant.findOne({
      where: { username }
    });
    
    if (!restaurant) {
      console.log('❌ Restaurant not found:', username);
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    console.log('✅ Restaurant found:', restaurant.name);
    
    // Subdomain kontrolü - güvenlik
    const subdomain = req.headers['x-subdomain'] || req.headers['x-forwarded-host']?.split('.')[0];
    console.log('🔍 Subdomain check:', { 
      subdomain, 
      restaurantUsername: restaurant.username,
      'x-subdomain': req.headers['x-subdomain'],
      'x-forwarded-host': req.headers['x-forwarded-host'],
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer
    });
    
    if (subdomain && restaurant.username !== subdomain) {
      console.log('🚨 Subdomain mismatch - security violation');
      return res.status(403).json({
        success: false,
        message: 'Bu subdomain için yetkiniz yok. Kendi subdomain\'inizden giriş yapın.'
      });
    }
    
    // Password kontrolü (support both plain text and bcrypt hashed)
    let passwordValid = false;
    if (restaurant.password === password) {
      // Plain text password match (legacy)
      passwordValid = true;
      console.log('✅ Password matched (plain text)');
    } else {
      // Try bcrypt comparison
      try {
        passwordValid = await bcrypt.compare(password, restaurant.password);
        if (passwordValid) {
          console.log('✅ Password matched (bcrypt)');
        }
      } catch (bcryptError) {
        console.log('⚠️ Bcrypt comparison failed');
        passwordValid = false;
      }
    }

    if (!passwordValid) {
      console.log('❌ Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    console.log('✅ Login successful for:', restaurant.name);
    
    // Password'u response'dan çıkar
    const { password: _, ...restaurantData } = restaurant.toJSON();
    
    res.json({
      success: true,
      data: restaurantData,
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/register', (req, res) => {
  res.json({
    message: 'Register endpoint - to be implemented',
    status: 'placeholder'
  });
});

router.post('/logout', (req, res) => {
  res.json({
    message: 'Logout endpoint - to be implemented',
    status: 'placeholder'
  });
});

module.exports = router;


