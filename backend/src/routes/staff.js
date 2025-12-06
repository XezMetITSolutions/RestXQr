const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

// Safe model import with fallback
let Staff, Restaurant, MenuCategory, MenuItem;
try {
  const models = require('../models');
  Staff = models.Staff;
  Restaurant = models.Restaurant;
  MenuCategory = models.MenuCategory;
  MenuItem = models.MenuItem;
} catch (error) {
  console.error('Model import error:', error);
  Staff = null;
  Restaurant = null;
  MenuCategory = null;
  MenuItem = null;
}

// Helper function to check subdomain authorization
const checkSubdomainAuth = async (req, restaurantId) => {
  const subdomain = req.headers['x-subdomain'] || req.headers['x-forwarded-host']?.split('.')[0];
  
  if (!subdomain) {
    return { authorized: true }; // Development için subdomain kontrolü opsiyonel
  }
  
  try {
    const restaurant = await Restaurant.findByPk(restaurantId, { 
      attributes: ['id', 'name', 'username'] 
    });
    
    if (!restaurant) {
      return { authorized: false, message: 'Restaurant not found' };
    }
    
    if (restaurant.username !== subdomain) {
      console.log('🚨 Subdomain mismatch:', { 
        subdomain, 
        restaurantUsername: restaurant.username,
        restaurantId 
      });
      return { 
        authorized: false, 
        message: 'Bu subdomain için yetkiniz yok. Kendi subdomain\'inizden işlem yapın.' 
      };
    }
    
    return { authorized: true, restaurant };
  } catch (error) {
    console.error('Subdomain auth check error:', error);
    return { authorized: false, message: 'Authorization check failed' };
  }
};

// GET /api/staff/restaurant/:restaurantId - Get all staff for a restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    if (!Staff || !Restaurant) {
      return res.status(503).json({
        success: false,
        message: 'Staff system temporarily unavailable - models not loaded'
      });
    }

    const { restaurantId } = req.params;

    // Subdomain authorization check
    const authCheck = await checkSubdomainAuth(req, restaurantId);
    if (!authCheck.authorized) {
      return res.status(403).json({
        success: false,
        message: authCheck.message
      });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const staff = await Staff.findAll({
      where: { restaurantId },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Error getting staff:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/staff/create-demo - Create demo staff members
router.post('/create-demo', async (req, res) => {
  try {
    if (!Staff || !Restaurant) {
      return res.status(503).json({
        success: false,
        message: 'Staff system temporarily unavailable - models not loaded'
      });
    }

    console.log('🔍 Creating demo staff members...');
    
    // Find Hazal restaurant
    const hazalRestaurant = await Restaurant.findOne({
      where: { username: 'hazal' }
    });

    if (!hazalRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Hazal restaurant not found'
      });
    }

    console.log('✅ Hazal restaurant found:', hazalRestaurant.id);

    // Demo staff members
    const staffMembers = [
      {
        restaurantId: hazalRestaurant.id,
        username: 'hazal_kasa',
        password: '123456',
        name: 'Hazal Kasa',
        role: 'cashier',
        status: 'active'
      },
      {
        restaurantId: hazalRestaurant.id,
        username: 'hazal_garson',
        password: '123456',
        name: 'Hazal Garson',
        role: 'waiter',
        status: 'active'
      },
      {
        restaurantId: hazalRestaurant.id,
        username: 'hazal_mutfak',
        password: '123456',
        name: 'Hazal Mutfak',
        role: 'kitchen',
        status: 'active'
      }
    ];

    const createdStaff = [];
    
    for (const staffData of staffMembers) {
      try {
        // Check if staff already exists
        const existingStaff = await Staff.findOne({
          where: { 
            restaurantId: staffData.restaurantId,
            username: staffData.username 
          }
        });

        if (existingStaff) {
          console.log(`✅ Staff already exists: ${staffData.name}`);
          createdStaff.push(existingStaff);
        } else {
          const staff = await Staff.create(staffData);
          console.log(`✅ Staff created: ${staff.name} (${staff.id})`);
          createdStaff.push(staff);
        }
      } catch (error) {
        console.error(`❌ Error creating staff ${staffData.name}:`, error);
      }
    }

    console.log('✅ Demo staff creation completed');

    res.json({
      success: true,
      message: 'Demo staff members created successfully',
      data: createdStaff
    });

  } catch (error) {
    console.error('❌ Error creating demo staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating demo staff',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/staff/restaurant/:restaurantId - Create new staff member
router.post('/restaurant/:restaurantId', async (req, res) => {
  try {
    console.log('🔍 Staff creation request:', req.params, req.body);
    
    if (!Staff || !Restaurant) {
      console.log('❌ Models not loaded:', { Staff: !!Staff, Restaurant: !!Restaurant });
      return res.status(503).json({
        success: false,
        message: 'Staff system temporarily unavailable - models not loaded'
      });
    }

    const { restaurantId } = req.params;
    const { name, email, phone, role, username, password } = req.body;

    console.log('📝 Request data:', { restaurantId, name, email, username, role });

    if (!name || !email) {
      console.log('❌ Missing required fields:', { name, email });
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Subdomain authorization check
    const authCheck = await checkSubdomainAuth(req, restaurantId);
    if (!authCheck.authorized) {
      return res.status(403).json({
        success: false,
        message: authCheck.message
      });
    }

    // Verify restaurant exists
    console.log('🔍 Looking for restaurant:', restaurantId);
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      console.log('❌ Restaurant not found:', restaurantId);
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    console.log('✅ Restaurant found:', restaurant.name);
    
    // Plan limiti kontrolü - Maksimum personel sayısı
    const maxStaff = restaurant.maxStaff || 3;
    const currentStaffCount = await Staff.count({ where: { restaurantId } });
    
    if (currentStaffCount >= maxStaff) {
      console.error(`❌ Staff limit exceeded: ${currentStaffCount} >= ${maxStaff}`);
      return res.status(403).json({
        success: false,
        message: `Plan limitiniz aşıldı! Maksimum ${maxStaff} personel ekleyebilirsiniz. Paketinizi yükseltin.`,
        limit: maxStaff,
        current: currentStaffCount,
        upgradeRequired: true
      });
    }

    // Check if email already exists for this restaurant
    const existingStaff = await Staff.findOne({
      where: { 
        restaurantId,
        email: email 
      }
    });

    if (existingStaff) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already exists for this restaurant'
      });
    }

    console.log('✅ Email is unique, creating staff...');

    const staff = await Staff.create({
      restaurantId,
      name,
      email,
      username: username || null,
      password: password || null,
      phone: phone || null,
      role: role || 'waiter',
      status: 'active'
    });

    console.log('✅ Staff created successfully:', staff.id);

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: staff
    });
  } catch (error) {
    console.error('❌ Error creating staff:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/staff/:staffId - Update staff member
router.put('/:staffId', async (req, res) => {
  try {
    if (!Staff) {
      return res.status(503).json({
        success: false,
        message: 'Staff system temporarily unavailable - models not loaded'
      });
    }

    const { staffId } = req.params;
    const { name, email, phone, role, status, username, password } = req.body;

    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Subdomain authorization check
    const authCheck = await checkSubdomainAuth(req, staff.restaurantId);
    if (!authCheck.authorized) {
      return res.status(403).json({
        success: false,
        message: authCheck.message
      });
    }

    // Update fields
    if (name) staff.name = name;
    if (email) staff.email = email;
    if (username !== undefined) staff.username = username;
    if (password !== undefined) staff.password = password;
    if (phone !== undefined) staff.phone = phone;
    if (role) staff.role = role;
    if (status) staff.status = status;

    await staff.save();

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: staff
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/staff/:staffId - Delete staff member
router.delete('/:staffId', async (req, res) => {
  try {
    console.log('🗑️ [DELETE] Staff deletion request:', req.params);
    
    if (!Staff) {
      console.log('❌ [DELETE] Staff model not loaded');
      return res.status(503).json({
        success: false,
        message: 'Staff system temporarily unavailable - models not loaded'
      });
    }

    const { staffId } = req.params;
    console.log('🔍 [DELETE] Looking for staff with ID:', staffId, 'Type:', typeof staffId);

    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      console.log('❌ [DELETE] Staff not found:', staffId);
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Subdomain authorization check
    const authCheck = await checkSubdomainAuth(req, staff.restaurantId);
    if (!authCheck.authorized) {
      return res.status(403).json({
        success: false,
        message: authCheck.message
      });
    }

    console.log('✅ [DELETE] Staff found, deleting:', staff.id);
    await staff.destroy();

    console.log('✅ [DELETE] Staff deleted successfully');
    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('❌ [DELETE] Error deleting staff:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/staff/list - List all staff members
router.get('/list', async (req, res) => {
  try {
    if (!Staff || !Restaurant) {
      return res.status(503).json({
        success: false,
        message: 'Staff system temporarily unavailable - models not loaded'
      });
    }

    console.log('🔍 Listing all staff members...');
    
    const staffMembers = await Staff.findAll({
      include: [{
        model: Restaurant,
        as: 'restaurant',
        attributes: ['id', 'name', 'username']
      }]
    });

    console.log('✅ Found staff members:', staffMembers.length);

    res.json({
      success: true,
      message: 'Staff members listed successfully',
      data: staffMembers
    });

  } catch (error) {
    console.error('❌ Error listing staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing staff',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/staff/login - Staff login
router.post('/login', async (req, res) => {
  try {
    console.log('👤 STAFF LOGIN ENDPOINT CALLED');
    
    if (!Staff || !Restaurant) {
      return res.status(503).json({
        success: false,
        message: 'Staff system temporarily unavailable - models not loaded'
      });
    }

    const { username, password, subdomain } = req.body;
    
    console.log('👤 Staff login attempt:', { username, subdomain, password: password ? '***' : 'missing' });
    console.log('👤 Request body:', req.body);

    if (!username || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Subdomain kontrolü - güvenlik (staff bulmadan önce)
    const headerSubdomain = req.headers['x-subdomain'] || req.headers['x-forwarded-host']?.split('.')[0];
    console.log('🔍 Subdomain check:', { 
      subdomain, 
      headerSubdomain,
      'x-subdomain': req.headers['x-subdomain'],
      'x-forwarded-host': req.headers['x-forwarded-host'],
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer
    });

    // Find staff member by username (not password yet - we need to check hash)
    console.log('🔍 Looking for staff:', { username });
    const staff = await Staff.findOne({
      where: {
        username: username,
        status: 'active'
      }
    });

    if (!staff) {
      console.log('❌ Staff not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password (support both plain text and bcrypt hashed passwords)
    let passwordValid = false;
    if (staff.password === password) {
      // Plain text password match (legacy)
      passwordValid = true;
      console.log('✅ Password matched (plain text)');
    } else {
      // Try bcrypt comparison
      const bcrypt = require('bcryptjs');
      try {
        passwordValid = await bcrypt.compare(password, staff.password);
        if (passwordValid) {
          console.log('✅ Password matched (bcrypt)');
        }
      } catch (bcryptError) {
        console.log('⚠️ Bcrypt comparison failed, assuming plain text');
        passwordValid = false;
      }
    }

    if (!passwordValid) {
      console.log('❌ Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ Staff found:', staff.name, 'Role:', staff.role);

    // Restaurant bilgisini ayrı sorgu ile getir (include kaynaklı 500 hatalarını önler)
    let restaurantInfo = undefined;
    try {
      const r = await Restaurant.findByPk(staff.restaurantId, { attributes: ['id', 'name', 'username'] });
      restaurantInfo = r;
    } catch (e) {
      console.warn('⚠️ Restaurant fetch failed for staff login:', e?.message);
    }

    if (!restaurantInfo) {
      console.log('❌ Restaurant not found for staff');
      return res.status(401).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Subdomain kontrolü - güvenlik (restaurant bilgisi ile)
    if (subdomain && restaurantInfo.username !== subdomain) {
      console.log('🚨 Subdomain mismatch - security violation');
      return res.status(403).json({
        success: false,
        message: 'Bu subdomain için yetkiniz yok. Kendi subdomain\'inizden giriş yapın.'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        restaurantId: staff.restaurantId,
        restaurantName: restaurantInfo.name,
        restaurantUsername: restaurantInfo.username
      }
    });
  } catch (error) {
    console.error('Error during staff login:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/staff/restaurants - List all restaurants (debug)
router.get('/restaurants', async (req, res) => {
  try {
    console.log('📋 [RESTAURANTS] Fetching all restaurants...');
    console.log('📋 [RESTAURANTS] Restaurant model exists:', !!Restaurant);
    
    if (!Restaurant) {
      console.error('❌ [RESTAURANTS] Restaurant model not loaded');
      return res.status(503).json({
        success: false,
        message: 'Restaurant system temporarily unavailable'
      });
    }

    const restaurants = await Restaurant.findAll({
      attributes: ['id', 'name', 'username', 'email'],
      order: [['name', 'ASC']]
    });

    console.log('✅ [RESTAURANTS] Found restaurants:', restaurants.length);
    console.log('📊 [RESTAURANTS] Data:', JSON.stringify(restaurants, null, 2));

    res.json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    console.error('❌ [RESTAURANTS] Error getting restaurants:', error);
    console.error('❌ [RESTAURANTS] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/staff/all - List all staff (debug)
router.get('/all', async (req, res) => {
  try {
    console.log('🔍 Getting all staff...');
    
    if (!Staff) {
      console.log('❌ Staff model not loaded');
      return res.status(503).json({
        success: false,
        message: 'Staff model not loaded'
      });
    }

    // En basit kontrol: tablo/bağlantı hazır mı?
    let count = 0;
    try {
      count = await Staff.count();
    } catch (err) {
      console.error('❌ Staff.count() failed:', err.message);
      return res.status(503).json({ success: false, message: 'Staff table not ready', error: err.message });
    }
    console.log('✅ Staff count:', count);

    let staff = [];
    try {
      staff = await Staff.findAll({ order: [['createdAt', 'DESC']] });
    } catch (err) {
      console.error('❌ Staff.findAll() failed:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to query staff', error: err.message });
    }

    const simpleStaff = staff.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      username: member.username,
      role: member.role,
      status: member.status,
      restaurantId: member.restaurantId,
      createdAt: member.createdAt
    }));

    res.json({ success: true, data: simpleStaff, count });
  } catch (error) {
    console.error('❌ Error getting all staff:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/staff/test - Simple test endpoint
router.get('/test', async (req, res) => {
  try {
    console.log('🔍 Staff test endpoint called');
    
    if (!Staff) {
      console.log('❌ Staff model not loaded');
      return res.status(503).json({
        success: false,
        message: 'Staff model not loaded'
      });
    }

    console.log('✅ Staff model loaded, testing query...');

    // En basit query
    const count = await Staff.count();
    console.log('✅ Staff count:', count);

    res.json({
      success: true,
      message: 'Staff test successful',
      count: count,
      modelLoaded: !!Staff
    });
  } catch (error) {
    console.error('❌ Staff test error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Staff test failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/staff/restore-restaurants - Restore restaurant data
router.post('/restore-restaurants', async (req, res) => {
  try {
    console.log('🔍 Restoring restaurant data...');
    
    if (!Restaurant) {
      console.log('❌ Restaurant model not loaded');
      return res.status(503).json({
        success: false,
        message: 'Restaurant model not loaded'
      });
    }

    console.log('✅ Restaurant model loaded, creating restaurants...');

    // Restaurant verilerini yeniden oluştur
    const restaurants = [
      {
        name: 'Aksaray',
        username: 'aksaray',
        email: 'aksaray@aksaray.guzellestir.com',
        password: '123456', // Password eklendi
        phone: '+90 555 123 4567',
        address: 'Aksaray, İstanbul',
        description: 'Geleneksel Türk mutfağı',
        logo: null,
        coverImage: null,
        status: 'active'
      },
      {
        name: 'Hazal',
        username: 'hazal',
        email: 'hazal@hazal.com',
        password: '123456', // Password eklendi
        phone: '+90 555 234 5678',
        address: 'Hazal, İstanbul',
        description: 'Modern Türk mutfağı',
        logo: null,
        coverImage: null,
        status: 'active'
      },
      {
        name: 'Test Restoran',
        username: 'testuser',
        email: 'test@test.com',
        password: '123456', // Password eklendi
        phone: '+90 555 345 6789',
        address: 'Test, İstanbul',
        description: 'Test restoranı',
        logo: null,
        coverImage: null,
        status: 'active'
      }
    ];

    const createdRestaurants = [];
    
    for (const restaurantData of restaurants) {
      try {
        // Mevcut restaurant'ı kontrol et
        const existingRestaurant = await Restaurant.findOne({
          where: { username: restaurantData.username }
        });

        if (existingRestaurant) {
          console.log(`✅ Restaurant already exists: ${restaurantData.name}`);
          createdRestaurants.push(existingRestaurant);
        } else {
          const restaurant = await Restaurant.create(restaurantData);
          console.log(`✅ Restaurant created: ${restaurant.name} (${restaurant.id})`);
          createdRestaurants.push(restaurant);
        }
      } catch (error) {
        console.error(`❌ Error creating restaurant ${restaurantData.name}:`, error);
      }
    }

    console.log('✅ Restaurant restoration completed');

    res.json({
      success: true,
      message: 'Restaurants restored successfully',
      data: createdRestaurants
    });
  } catch (error) {
    console.error('❌ Error restoring restaurants:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Error restoring restaurants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/staff/create-hazal - Create Hazal staff manually
router.post('/create-hazal', async (req, res) => {
  try {
    if (!Staff || !Restaurant) {
      return res.status(503).json({
        success: false,
        message: 'Staff system temporarily unavailable - models not loaded'
      });
    }

    console.log('🔍 Creating Hazal staff manually...');
    
    // Find Hazal restaurant
    const hazalRestaurant = await Restaurant.findOne({
      where: { username: 'hazal' }
    });

    if (!hazalRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Hazal restaurant not found'
      });
    }

    console.log('✅ Hazal restaurant found:', hazalRestaurant.id);

    // Create staff
    const staff = await Staff.create({
      restaurantId: hazalRestaurant.id,
      username: 'hazal_kasa',
      password: '123456',
      name: 'Hazal Kasa',
      role: 'cashier',
      status: 'active'
    });

    console.log('✅ Hazal staff created:', staff.name);

    res.json({
      success: true,
      message: 'Hazal staff created successfully',
      data: staff
    });

  } catch (error) {
    console.error('❌ Error creating Hazal staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating Hazal staff',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/staff/create-aksaray - Create Aksaray staff members
router.post('/create-aksaray', async (req, res) => {
  try {
    if (!Staff || !Restaurant) {
      return res.status(503).json({
        success: false,
        message: 'Staff system temporarily unavailable - models not loaded'
      });
    }

    console.log('🔍 Creating Aksaray staff members...');
    
    // Find Aksaray restaurant
    const aksarayRestaurant = await Restaurant.findOne({
      where: { username: 'aksaray' }
    });

    if (!aksarayRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Aksaray restaurant not found'
      });
    }

    console.log('✅ Aksaray restaurant found:', aksarayRestaurant.id);

    // Aksaray staff members
    const staffMembers = [
      {
        restaurantId: aksarayRestaurant.id,
        username: 'elma',
        password: '123456',
        name: 'Elma Garson',
        email: 'elma@aksaray.com',
        role: 'waiter',
        status: 'active'
      },
      {
        restaurantId: aksarayRestaurant.id,
        username: 'portakal',
        password: '123456',
        name: 'Portakal Mutfak',
        email: 'portakal@aksaray.com',
        role: 'chef', // kitchen yerine chef kullan
        status: 'active'
      },
      {
        restaurantId: aksarayRestaurant.id,
        username: 'armut',
        password: '123456',
        name: 'Armut Kasa',
        email: 'armut@aksaray.com',
        role: 'cashier',
        status: 'active'
      }
    ];

    const createdStaff = [];
    
    for (const staffData of staffMembers) {
      try {
        // Check if staff already exists
        const existingStaff = await Staff.findOne({
          where: { 
            restaurantId: staffData.restaurantId,
            username: staffData.username 
          }
        });

        if (existingStaff) {
          console.log(`✅ Staff already exists: ${staffData.name}`);
          createdStaff.push(existingStaff);
        } else {
          const staff = await Staff.create(staffData);
          console.log(`✅ Staff created: ${staff.name} (${staff.id})`);
          createdStaff.push(staff);
        }
      } catch (error) {
        console.error(`❌ Error creating staff ${staffData.name}:`, error);
      }
    }

    console.log('✅ Aksaray staff creation completed');

    res.json({
      success: true,
      message: 'Aksaray staff members created successfully',
      data: createdStaff
    });

  } catch (error) {
    console.error('❌ Error creating Aksaray staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating Aksaray staff',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/staff/restore-menu - Restore menu data for Hazal
router.post('/restore-menu', async (req, res) => {
  try {
    if (!MenuCategory || !MenuItem || !Restaurant) {
      return res.status(503).json({
        success: false,
        message: 'Menu system temporarily unavailable - models not loaded'
      });
    }

    console.log('🔍 Restoring menu data for Hazal...');
    
    // Find Hazal restaurant
    const hazalRestaurant = await Restaurant.findOne({
      where: { username: 'hazal' }
    });

    if (!hazalRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Hazal restaurant not found'
      });
    }

    console.log('✅ Hazal restaurant found:', hazalRestaurant.id);

    // Demo menu categories
    const categories = [
      {
        restaurantId: hazalRestaurant.id,
        name: 'Ana Yemekler',
        description: 'Geleneksel Türk yemekleri',
        order: 1,
        isActive: true
      },
      {
        restaurantId: hazalRestaurant.id,
        name: 'Çorbalar',
        description: 'Sıcak çorbalar',
        order: 2,
        isActive: true
      },
      {
        restaurantId: hazalRestaurant.id,
        name: 'Salatalar',
        description: 'Taze salatalar',
        order: 3,
        isActive: true
      },
      {
        restaurantId: hazalRestaurant.id,
        name: 'İçecekler',
        description: 'Soğuk ve sıcak içecekler',
        order: 4,
        isActive: true
      }
    ];

    const createdCategories = [];
    
    for (const categoryData of categories) {
      try {
        const existingCategory = await MenuCategory.findOne({
          where: { 
            restaurantId: categoryData.restaurantId,
            name: categoryData.name 
          }
        });

        if (existingCategory) {
          console.log(`✅ Category already exists: ${categoryData.name}`);
          createdCategories.push(existingCategory);
        } else {
          const category = await MenuCategory.create(categoryData);
          console.log(`✅ Category created: ${category.name} (${category.id})`);
          createdCategories.push(category);
        }
      } catch (error) {
        console.error(`❌ Error creating category ${categoryData.name}:`, error);
      }
    }

    console.log('✅ Menu restoration completed');

    res.json({
      success: true,
      message: 'Menu data restored successfully',
      data: createdCategories
    });

  } catch (error) {
    console.error('❌ Error restoring menu:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring menu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
