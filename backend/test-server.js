const express = require('express');
const app = express();
const PORT = 3002;

app.use(express.json());

// Test endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 2FA test endpoint
app.get('/api/admin/2fa/status', (req, res) => {
  res.json({
    success: true,
    data: {
      twoFactorEnabled: false,
      backupCodesCount: 0
    }
  });
});

// 2FA setup endpoint
app.post('/api/admin/2fa/setup', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'xezmet' && password === '01528797Mb##') {
    res.json({
      success: true,
      data: {
        secret: 'JBSWY3DPEHPK3PXP',
        qrCodeUrl: 'otpauth://totp/xezmet?secret=JBSWY3DPEHPK3PXP&issuer=RestXQr',
        qrCodeDataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        manualEntryKey: 'JBSWY3DPEHPK3PXP',
        backupCodes: ['ABC12345', 'DEF67890', 'GHI13579', 'JKL24680', 'MNO97531']
      },
      message: '2FA kurulumu başlatıldı'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Geçersiz kullanıcı adı veya şifre'
    });
  }
});

// 2FA verify setup endpoint
app.post('/api/admin/2fa/verify-setup', (req, res) => {
  const { username, password, token } = req.body;
  
  if (username === 'xezmet' && password === '01528797Mb##' && token === '123456') {
    res.json({
      success: true,
      data: {
        backupCodes: ['ABC12345', 'DEF67890', 'GHI13579', 'JKL24680', 'MNO97531']
      },
      message: '2FA başarıyla aktif edildi'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Geçersiz doğrulama kodu'
    });
  }
});

// 2FA login endpoint
app.post('/api/admin/2fa/login', (req, res) => {
  const { username, password, token } = req.body;
  
  if (username === 'xezmet' && password === '01528797Mb##' && token === '123456') {
    res.json({
      success: true,
      data: {
        user: {
          id: '1',
          username: 'xezmet',
          email: 'xezmet@restxqr.com',
          name: 'XezMet Super Admin',
          role: 'super_admin',
          status: 'active',
          twoFactorEnabled: true
        },
        token: 'jwt_token_here'
      },
      message: 'Giriş başarılı'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Geçersiz doğrulama kodu'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 2FA API: http://localhost:${PORT}/api/admin/2fa/status`);
});
