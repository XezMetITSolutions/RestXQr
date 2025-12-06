const express = require('express');
const router = express.Router();

// Basit 2FA servisi (speakeasy olmadan)
const twoFactorAuth = {
  generateSecret: (username, issuer = 'RestXQr') => {
    const secret = 'JBSWY3DPEHPK3PXP'; // Demo secret
    return {
      secret: secret,
      qrCodeUrl: `otpauth://totp/${username}?secret=${secret}&issuer=${issuer}`,
      manualEntryKey: secret
    };
  },
  
  generateQRCode: async (qrCodeUrl) => {
    // Demo QR kod (gerçek uygulamada qrcode paketi kullanılacak)
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  },
  
  verifyToken: (secret, token) => {
    // Demo doğrulama (gerçek uygulamada speakeasy kullanılacak)
    return token === '123456';
  },
  
  generateBackupCodes: (count = 10) => {
    return Array.from({ length: count }, () => Math.random().toString(36).substring(2, 10).toUpperCase());
  },
  
  verifyBackupCode: (inputCode, backupCodes) => {
    const upperInputCode = inputCode.toUpperCase();
    const codeIndex = backupCodes.indexOf(upperInputCode);
    
    if (codeIndex !== -1) {
      const updatedBackupCodes = [...backupCodes];
      updatedBackupCodes.splice(codeIndex, 1);
      return { verified: true, backupCodes: updatedBackupCodes };
    }
    
    return { verified: false, backupCodes: backupCodes };
  }
};

// Demo admin verisi (gerçek uygulamada veritabanından gelecek)
const adminData = {
  id: '1',
  username: 'xezmet',
  password: '01528797Mb##',
  email: 'xezmet@restxqr.com',
  name: 'XezMet Super Admin',
  role: 'super_admin',
  status: 'active',
  twoFactorSecret: 'JBSWY3DPEHPK3PXP', // Demo secret aktif
  backupCodes: ['ABC12345', 'DEF67890', 'GHI13579', 'JKL24680', 'MNO97531'], // Demo backup kodları
  twoFactorEnabled: true // 2FA aktif
};

// POST /api/admin/2fa/setup - 2FA kurulumu başlat
router.post('/setup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kullanıcı doğrulama
    if (username !== adminData.username || password !== adminData.password) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kullanıcı adı veya şifre'
      });
    }

    // Zaten 2FA aktifse
    if (adminData.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA zaten aktif'
      });
    }

    // Yeni secret oluştur
    const secretData = twoFactorAuth.generateSecret(username, 'RestXQr Admin');
    
    // QR kod oluştur
    const qrCodeDataURL = await twoFactorAuth.generateQRCode(secretData.qrCodeUrl);
    
    // Backup kodları oluştur
    const backupCodes = twoFactorAuth.generateBackupCodes(10);

    // Geçici olarak secret'i sakla (gerçek uygulamada veritabanında saklanacak)
    adminData.twoFactorSecret = secretData.secret;
    adminData.backupCodes = backupCodes;

    res.json({
      success: true,
      data: {
        secret: secretData.secret,
        qrCodeUrl: secretData.qrCodeUrl,
        qrCodeDataURL: qrCodeDataURL,
        manualEntryKey: secretData.manualEntryKey,
        backupCodes: backupCodes
      },
      message: '2FA kurulumu başlatıldı'
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: '2FA kurulumu başarısız'
    });
  }
});

// POST /api/admin/2fa/verify-setup - 2FA kurulumunu doğrula ve aktif et
router.post('/verify-setup', async (req, res) => {
  try {
    const { username, password, token } = req.body;

    // Kullanıcı doğrulama
    if (username !== adminData.username || password !== adminData.password) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kullanıcı adı veya şifre'
      });
    }

    // Secret kontrolü
    if (!adminData.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: '2FA kurulumu başlatılmamış'
      });
    }

    // TOTP token doğrulama
    const isValidToken = twoFactorAuth.verifyToken(adminData.twoFactorSecret, token);
    
    if (!isValidToken) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz doğrulama kodu'
      });
    }

    // 2FA'yı aktif et
    adminData.twoFactorEnabled = true;

    res.json({
      success: true,
      data: {
        backupCodes: adminData.backupCodes
      },
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

// POST /api/admin/2fa/login - 2FA ile giriş
router.post('/login', async (req, res) => {
  try {
    const { username, password, token } = req.body;

    // Kullanıcı doğrulama
    if (username !== adminData.username || password !== adminData.password) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kullanıcı adı veya şifre'
      });
    }

    // 2FA kontrolü
    if (!adminData.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA aktif değil'
      });
    }

    // TOTP token doğrulama
    const isValidToken = twoFactorAuth.verifyToken(adminData.twoFactorSecret, token);
    
    if (!isValidToken) {
      // Backup kod kontrolü
      const backupResult = twoFactorAuth.verifyBackupCode(token, adminData.backupCodes);
      
      if (!backupResult.verified) {
        return res.status(401).json({
          success: false,
          message: 'Geçersiz doğrulama kodu'
        });
      }
      
      // Backup kod kullanıldı, güncelle
      adminData.backupCodes = backupResult.backupCodes;
    }

    // Başarılı giriş
    res.json({
      success: true,
      data: {
        user: {
          id: adminData.id,
          username: adminData.username,
          email: adminData.email,
          name: adminData.name,
          role: adminData.role,
          status: adminData.status,
          twoFactorEnabled: adminData.twoFactorEnabled
        },
        token: 'jwt_token_here' // Gerçek uygulamada JWT token
      },
      message: 'Giriş başarılı'
    });

  } catch (error) {
    console.error('2FA login error:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş başarısız'
    });
  }
});

// GET /api/admin/2fa/status - 2FA durumu
router.get('/status', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        twoFactorEnabled: adminData.twoFactorEnabled,
        backupCodesCount: adminData.backupCodes.length
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

// POST /api/admin/2fa/disable - 2FA'yı devre dışı bırak
router.post('/disable', async (req, res) => {
  try {
    const { username, password, token } = req.body;

    // Kullanıcı doğrulama
    if (username !== adminData.username || password !== adminData.password) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kullanıcı adı veya şifre'
      });
    }

    // 2FA kontrolü
    if (!adminData.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA zaten devre dışı'
      });
    }

    // TOTP token doğrulama
    const isValidToken = twoFactorAuth.verifyToken(adminData.twoFactorSecret, token);
    
    if (!isValidToken) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz doğrulama kodu'
      });
    }

    // 2FA'yı devre dışı bırak
    adminData.twoFactorEnabled = false;
    adminData.twoFactorSecret = null;
    adminData.backupCodes = [];

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

// POST /api/admin/2fa/regenerate-backup-codes - Backup kodları yenile
router.post('/regenerate-backup-codes', async (req, res) => {
  try {
    const { username, password, token } = req.body;

    // Kullanıcı doğrulama
    if (username !== adminData.username || password !== adminData.password) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kullanıcı adı veya şifre'
      });
    }

    // 2FA kontrolü
    if (!adminData.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA aktif değil'
      });
    }

    // TOTP token doğrulama
    const isValidToken = twoFactorAuth.verifyToken(adminData.twoFactorSecret, token);
    
    if (!isValidToken) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz doğrulama kodu'
      });
    }

    // Yeni backup kodları oluştur
    const newBackupCodes = twoFactorAuth.generateBackupCodes(10);
    adminData.backupCodes = newBackupCodes;

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
