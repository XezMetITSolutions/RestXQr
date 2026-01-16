const express = require('express');
const router = express.Router();
const { AdminUser } = require('../models');
const twoFactorAuth = require('../lib/twoFactorAuth');
const { encrypt, decrypt, hashBackupCodes } = require('../lib/adminAuth');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// POST /api/admin/2fa/setup - Initialize 2FA setup (requires authentication)
router.post('/setup', adminAuthMiddleware, async (req, res) => {
  try {
    const adminUser = await AdminUser.findByPk(req.adminUser.id);

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // If 2FA is already enabled but secret is corrupted, allow re-setup
    if (adminUser.two_factor_enabled && req.body.force !== true) {
      return res.status(400).json({
        success: false,
        message: '2FA zaten aktif. Yeniden kurmak için önce devre dışı bırakın.'
      });
    }

    // Reset 2FA if forcing re-setup
    if (req.body.force === true) {
      adminUser.two_factor_enabled = false;
      adminUser.two_factor_secret = null;
      adminUser.backup_codes = null;
      await adminUser.save();
    }

    // Generate new secret
    const secretData = twoFactorAuth.generateSecret(adminUser.username, 'RestXQR Admin');

    // Generate QR code
    const qrCodeDataURL = await twoFactorAuth.generateQRCode(secretData.qrCodeUrl);

    // Generate backup codes
    const backupCodes = twoFactorAuth.generateBackupCodes(10);

    // Encrypt and temporarily store secret (will be saved permanently after verification)
    const encryptedSecret = encrypt(secretData.secret);

    // Hash backup codes for storage
    const hashedBackupCodes = await hashBackupCodes(backupCodes);

    // Temporarily store in database (not enabled yet)
    adminUser.two_factor_secret = encryptedSecret;
    adminUser.backup_codes = hashedBackupCodes;
    await adminUser.save();

    res.json({
      success: true,
      data: {
        secret: secretData.secret,
        qrCodeUrl: secretData.qrCodeUrl,
        qrCodeDataURL: qrCodeDataURL,
        manualEntryKey: secretData.manualEntryKey,
        backupCodes: backupCodes // Return plain text codes for user to save
      },
      message: '2FA kurulumu başlatıldı. QR kodunu tarayın ve backup kodlarını saklayın.'
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: '2FA kurulumu başarısız'
    });
  }
});

// POST /api/admin/2fa/verify-setup - Verify and enable 2FA
router.post('/verify-setup', adminAuthMiddleware, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama kodu gereklidir'
      });
    }

    const adminUser = await AdminUser.findByPk(req.adminUser.id);

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Check if secret exists
    if (!adminUser.two_factor_secret) {
      return res.status(400).json({
        success: false,
        message: '2FA kurulumu başlatılmamış'
      });
    }

    // Verify TOTP token
    const secret = decrypt(adminUser.two_factor_secret);
    const isValidToken = twoFactorAuth.verifyToken(secret, token);

    if (!isValidToken) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz doğrulama kodu'
      });
    }

    // Enable 2FA
    adminUser.two_factor_enabled = true;
    await adminUser.save();

    res.json({
      success: true,
      message: '2FA başarıyla aktif edildi'
    });

  } catch (error) {
    console.error('2FA verify setup error:', error);
    res.status(500).json({
      success: false,
      message: '2FA doğrulama başarısız'
    });
  }
});

// GET /api/admin/2fa/status - Get 2FA status
router.get('/status', adminAuthMiddleware, async (req, res) => {
  try {
    const adminUser = await AdminUser.findByPk(req.adminUser.id, {
      attributes: ['id', 'two_factor_enabled', 'backup_codes']
    });

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      success: true,
      data: {
        twoFactorEnabled: adminUser.two_factor_enabled,
        backupCodesCount: adminUser.backup_codes ? adminUser.backup_codes.length : 0
      }
    });
  } catch (error) {
    console.error('2FA status error:', error);
    res.status(500).json({
      success: false,
      message: 'Durum bilgisi alınamadı'
    });
  }
});

// POST /api/admin/2fa/disable - Disable 2FA
router.post('/disable', adminAuthMiddleware, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama kodu gereklidir'
      });
    }

    const adminUser = await AdminUser.findByPk(req.adminUser.id);

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Check if 2FA is enabled
    if (!adminUser.two_factor_enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA zaten devre dışı'
      });
    }

    // Verify TOTP token
    const secret = decrypt(adminUser.two_factor_secret);
    const isValidToken = twoFactorAuth.verifyToken(secret, token);

    if (!isValidToken) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz doğrulama kodu'
      });
    }

    // Disable 2FA
    adminUser.two_factor_enabled = false;
    adminUser.two_factor_secret = null;
    adminUser.backup_codes = [];
    await adminUser.save();

    res.json({
      success: true,
      message: '2FA başarıyla devre dışı bırakıldı'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      message: '2FA devre dışı bırakma başarısız'
    });
  }
});

// POST /api/admin/2fa/regenerate-backup-codes - Regenerate backup codes
router.post('/regenerate-backup-codes', adminAuthMiddleware, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Doğrulama kodu gereklidir'
      });
    }

    const adminUser = await AdminUser.findByPk(req.adminUser.id);

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Check if 2FA is enabled
    if (!adminUser.two_factor_enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA aktif değil'
      });
    }

    // Verify TOTP token
    const secret = decrypt(adminUser.two_factor_secret);
    const isValidToken = twoFactorAuth.verifyToken(secret, token);

    if (!isValidToken) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz doğrulama kodu'
      });
    }

    // Generate new backup codes
    const newBackupCodes = twoFactorAuth.generateBackupCodes(10);
    const hashedBackupCodes = await hashBackupCodes(newBackupCodes);

    adminUser.backup_codes = hashedBackupCodes;
    await adminUser.save();

    res.json({
      success: true,
      data: {
        backupCodes: newBackupCodes
      },
      message: 'Backup kodları yenilendi'
    });

  } catch (error) {
    console.error('2FA regenerate backup codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Backup kodları yenileme başarısız'
    });
  }
});

module.exports = router;
