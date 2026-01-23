/**
 * Permissions API Routes
 * Role-based authorization için yetki yönetimi API'si
 */
const express = require('express');
const router = express.Router();
const { Restaurant, Staff } = require('../models');
const staffAuth = require('../middleware/staffAuth');

// Permissions are now stored persistently in Restaurant.settings.permissions

// Default permissions for each role
const getDefaultPermissions = (role) => {
  if (role === 'kitchen') {
    return [
      {
        id: 'kitchen_view_orders',
        label: 'Siparişleri Görüntüleme',
        description: 'Bekleyen ve hazırlanan siparişleri görüntüleyebilir',
        enabled: true,
        locked: true
      },
      {
        id: 'kitchen_mark_preparing',
        label: 'Hazırlanıyor İşaretleme',
        description: 'Siparişleri "Hazırlanıyor" olarak işaretleyebilir',
        enabled: true,
        locked: false
      },
      {
        id: 'kitchen_mark_ready',
        label: 'Hazır İşaretleme',
        description: 'Siparişleri "Hazır" olarak işaretleyebilir',
        enabled: true,
        locked: false
      },
      {
        id: 'kitchen_cancel_order',
        label: 'Sipariş İptal Etme',
        description: 'Siparişleri iptal edebilir',
        enabled: false,
        locked: false
      },
      {
        id: 'kitchen_view_history',
        label: 'Sipariş Geçmişi Görüntüleme',
        description: 'Tamamlanan siparişlerin geçmişini görüntüleyebilir',
        enabled: true,
        locked: false
      },
      {
        id: 'kitchen_edit_menu',
        label: 'Menü Düzenleme',
        description: 'Menü öğelerini düzenleyebilir (stok durumu, hazırlama süresi)',
        enabled: true,
        locked: false
      },
      {
        id: 'kitchen_priority',
        label: 'Sipariş Önceliği Belirleme',
        description: 'Siparişlerin hazırlanma önceliğini değiştirebilir',
        enabled: true,
        locked: false
      }
    ];
  } else if (role === 'waiter') {
    return [
      {
        id: 'waiter_view_orders',
        label: 'Siparişleri Görüntüleme',
        description: 'Tüm siparişleri görüntüleyebilir',
        enabled: true,
        locked: true
      },
      {
        id: 'waiter_create_order',
        label: 'Sipariş Oluşturma',
        description: 'Yeni sipariş oluşturabilir',
        enabled: true,
        locked: true
      },
      {
        id: 'waiter_mark_served',
        label: 'Servis Edildi İşaretleme',
        description: 'Siparişleri "Servis Edildi" olarak işaretleyebilir',
        enabled: true,
        locked: false
      },
      {
        id: 'waiter_mark_completed',
        label: 'Tamamlandı İşaretleme',
        description: 'Siparişleri "Tamamlandı" olarak işaretleyebilir',
        enabled: true,
        locked: false
      },
      {
        id: 'waiter_cancel_order',
        label: 'Sipariş İptal Etme',
        description: 'Siparişleri iptal edebilir',
        enabled: true,
        locked: false
      },
      {
        id: 'waiter_edit_order',
        label: 'Sipariş Düzenleme',
        description: 'Mevcut siparişleri düzenleyebilir',
        enabled: true,
        locked: false
      },
      {
        id: 'waiter_view_tables',
        label: 'Masa Durumu Görüntüleme',
        description: 'Masa durumlarını ve doluluğunu görüntüleyebilir',
        enabled: true,
        locked: false
      }
    ];
  } else if (role === 'cashier') {
    return [
      {
        id: 'cashier_view_orders',
        label: 'Siparişleri Görüntüleme',
        description: 'Tüm siparişleri görüntüleyebilir',
        enabled: true,
        locked: true
      },
      {
        id: 'cashier_approve_orders',
        label: 'Sipariş Onaylama',
        description: 'Siparişleri onaylayabilir (mutfağa gönderme)',
        enabled: true,
        locked: true
      },
      {
        id: 'cashier_reject_orders',
        label: 'Sipariş Reddetme',
        description: 'Siparişleri reddedebilir',
        enabled: true,
        locked: false
      },
      {
        id: 'cashier_process_payment',
        label: 'Ödeme Alma',
        description: 'Tamamlanan siparişlerden ödeme alabilir',
        enabled: true,
        locked: true
      },
      {
        id: 'cashier_apply_discount',
        label: 'İndirim Uygulama',
        description: 'Siparişlere indirim uygulayabilir',
        enabled: true,
        locked: false
      },
      {
        id: 'cashier_view_reports',
        label: 'Raporları Görüntüleme',
        description: 'Günlük/haftalık/aylık satış raporlarını görüntüleyebilir',
        enabled: true,
        locked: false
      },
      {
        id: 'cashier_manage_refunds',
        label: 'İade İşlemleri',
        description: 'İade işlemlerini gerçekleştirebilir',
        enabled: true,
        locked: false
      }
    ];
  }

  return [];
};

// Helper function to initialize permissions for a restaurant
const initializePermissions = async (restaurant) => {
  if (!restaurant.settings) restaurant.settings = {};

  if (!restaurant.settings.permissions) {
    restaurant.settings.permissions = {
      kitchen: getDefaultPermissions('kitchen'),
      waiter: getDefaultPermissions('waiter'),
      cashier: getDefaultPermissions('cashier')
    };
    // Save the initialized permissions
    restaurant.changed('settings', true);
    await restaurant.save();
  }
  return restaurant.settings.permissions;
};

// GET /api/permissions/:restaurantId - Get all permissions for a restaurant
router.get('/:restaurantId', staffAuth, async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Check if restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Initialize permissions if not exists
    const permissions = await initializePermissions(restaurant);

    res.json({
      success: true,
      permissions: permissions
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/permissions/:restaurantId/:role - Get permissions for a specific role
router.get('/:restaurantId/:role', staffAuth, async (req, res) => {
  try {
    const { restaurantId, role } = req.params;

    if (!['kitchen', 'waiter', 'cashier'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Initialize permissions if not exists
    const allPermissions = await initializePermissions(restaurant);

    res.json({
      success: true,
      permissions: allPermissions[role] || []
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching role permissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/permissions/:restaurantId - Update all permissions for a restaurant
router.put('/:restaurantId', staffAuth, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { permissions } = req.body;

    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid permissions data'
      });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Initialize permissions if not exists
    await initializePermissions(restaurant);

    // Update permissions in settings
    // Create a new object to ensure Sequelize detects the change
    const settings = JSON.parse(JSON.stringify(restaurant.settings || {}));
    const currentPermissions = settings.permissions || {};

    if (permissions.kitchen) {
      currentPermissions.kitchen = permissions.kitchen;
    }

    if (permissions.waiter) {
      currentPermissions.waiter = permissions.waiter;
    }

    if (permissions.cashier) {
      currentPermissions.cashier = permissions.cashier;
    }

    settings.permissions = currentPermissions;
    restaurant.settings = settings;
    restaurant.changed('settings', true);
    await restaurant.save();

    res.json({
      success: true,
      message: 'Permissions updated successfully'
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating permissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/permissions/:restaurantId/:role - Update permissions for a specific role
router.put('/:restaurantId/:role', staffAuth, async (req, res) => {
  try {
    const { restaurantId, role } = req.params;
    const { permissions } = req.body;

    if (!['kitchen', 'waiter', 'cashier'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid permissions data'
      });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Initialize permissions if not exists
    await initializePermissions(restaurant);

    // Update permissions for the role
    // Create a new object to ensure Sequelize detects the change
    const settings = JSON.parse(JSON.stringify(restaurant.settings || {}));
    const currentPermissions = settings.permissions || {};

    currentPermissions[role] = permissions;
    settings.permissions = currentPermissions;

    restaurant.settings = settings;
    restaurant.changed('settings', true);
    await restaurant.save();

    res.json({
      success: true,
      message: `${role} permissions updated successfully`
    });
  } catch (error) {
    console.error('Error updating role permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating role permissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to check if a staff member has a specific permission
const hasPermission = async (staffId, permissionId) => {
  try {
    // Find staff
    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      return false;
    }

    // Get role and restaurant
    const { role, restaurantId } = staff;

    // Get permissions from restaurant settings
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) return false;

    // Initialize permissions if not exists
    const allPermissions = await initializePermissions(restaurant);

    // Map roles to permission categories
    let permissionCategory;
    if (role === 'chef' || role === 'kitchen') permissionCategory = 'kitchen';
    else if (role === 'waiter') permissionCategory = 'waiter';
    else if (role === 'cashier') permissionCategory = 'cashier';
    else if (role === 'manager' || role === 'admin') return true; // Managers and admins have all permissions
    else return false;

    // Check staff-specific overrides first
    if (staff.permissions && staff.permissions[permissionId] !== undefined) {
      return staff.permissions[permissionId];
    }

    // Fallback to role-based permissions
    const permission = allPermissions[permissionCategory]?.find(p => p.id === permissionId);
    return permission?.enabled || false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

// POST /api/permissions/check - Check if a staff member has a specific permission
router.post('/check', async (req, res) => {
  try {
    const { staffId, permissionId } = req.body;

    if (!staffId || !permissionId) {
      return res.status(400).json({
        success: false,
        message: 'staffId and permissionId are required'
      });
    }

    const hasAccess = await hasPermission(staffId, permissionId);

    res.json({
      success: true,
      hasPermission: hasAccess
    });
  } catch (error) {
    console.error('Error checking permission:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking permission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = {
  router,
  hasPermission // Export for use in other middleware
};
