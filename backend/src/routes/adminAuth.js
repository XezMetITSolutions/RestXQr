const express = require('express');
const router = express.Router();
const { AdminUser } = require('../models');
const {
    hashPassword,
    verifyPassword,
    generateAccessToken,
    generateRefreshToken,
    verifyToken
} = require('../lib/adminAuth');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// POST /api/admin/auth/login - Initial login with username/password
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Kullanıcı adı ve şifre gereklidir'
            });
        }

        // Find admin user (Allow both username or email)
        const adminUser = await AdminUser.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { username: username },
                    { email: username }
                ]
            }
        });

        if (!adminUser) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz kullanıcı adı/email veya şifre'
            });
        }

        // Check if account is locked
        if (adminUser.isLocked()) {
            const remainingTime = Math.ceil((adminUser.locked_until - new Date()) / 1000 / 60);
            return res.status(403).json({
                success: false,
                message: `Hesap kilitli. Lütfen ${remainingTime} dakika bekleyin.`,
                locked: true,
                locked_until: adminUser.locked_until
            });
        }

        // Check if account is active
        if (adminUser.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Hesap aktif değil'
            });
        }

        // Verify password
        const isPasswordValid = await verifyPassword(password, adminUser.password_hash);

        if (!isPasswordValid) {
            // Increment failed login attempts
            await adminUser.incrementLoginAttempts();

            const remainingAttempts = 5 - adminUser.login_attempts;
            if (remainingAttempts > 0) {
                return res.status(401).json({
                    success: false,
                    message: `Geçersiz şifre. ${remainingAttempts} deneme hakkınız kaldı.`,
                    remaining_attempts: remainingAttempts
                });
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'Hesap 30 dakika süreyle kilitlendi.',
                    locked: true,
                    locked_until: adminUser.locked_until
                });
            }
        }

        // Password is correct
        // Check if 2FA is enabled
        if (adminUser.two_factor_enabled) {
            // Don't generate full token yet, user needs to verify 2FA
            return res.json({
                success: true,
                requires2FA: true,
                userId: adminUser.id,
                message: '2FA doğrulaması gerekli'
            });
        }

        // 2FA not enabled, generate tokens and login
        const accessToken = generateAccessToken(adminUser);
        const refreshToken = generateRefreshToken(adminUser);

        // Reset login attempts and update last login
        await adminUser.resetLoginAttempts();

        res.json({
            success: true,
            data: {
                user: {
                    id: adminUser.id,
                    username: adminUser.username,
                    email: adminUser.email,
                    name: adminUser.name,
                    role: adminUser.role,
                    twoFactorEnabled: adminUser.two_factor_enabled
                },
                accessToken,
                refreshToken
            },
            message: 'Giriş başarılı'
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Giriş hatası'
        });
    }
});

// POST /api/admin/auth/verify-2fa - Verify 2FA code after initial login
router.post('/verify-2fa', async (req, res) => {
    try {
        console.log('2FA verification requested');
        const { userId, token } = req.body;
        console.log('UserId:', userId, 'Token length:', token?.length);

        if (!userId || !token) {
            return res.status(400).json({
                success: false,
                message: 'Kullanıcı ID ve token gereklidir'
            });
        }

        // Find admin user
        const adminUser = await AdminUser.findByPk(userId);
        console.log('Admin user found:', !!adminUser);

        if (!adminUser) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        // Check if 2FA is enabled
        console.log('2FA enabled:', adminUser.two_factor_enabled);
        if (!adminUser.two_factor_enabled) {
            return res.status(400).json({
                success: false,
                message: '2FA aktif değil'
            });
        }

        // Verify 2FA token or backup code
        const twoFactorAuth = require('../lib/twoFactorAuth');
        const { decrypt } = require('../lib/adminAuth');

        let isValid = false;
        let usedBackupCode = false;

        console.log('Encrypted secret exists:', !!adminUser.two_factor_secret);
        
        // Decrypt the secret first
        const decryptedSecret = decrypt(adminUser.two_factor_secret);
        console.log('Decrypted secret exists:', !!decryptedSecret);
        
        // Try TOTP first
        isValid = twoFactorAuth.verifyToken(decryptedSecret, token);
        console.log('TOTP verification result:', isValid);

        // If TOTP fails, try backup codes
        if (!isValid && token.length > 6) {
            const bcrypt = require('bcrypt');
            const backupCodes = adminUser.backup_codes || [];
            
            // Check if token matches any hashed backup code
            for (let i = 0; i < backupCodes.length; i++) {
                const isMatch = await bcrypt.compare(token.toUpperCase(), backupCodes[i]);
                if (isMatch) {
                    isValid = true;
                    usedBackupCode = true;
                    // Remove used backup code
                    backupCodes.splice(i, 1);
                    adminUser.backup_codes = backupCodes;
                    await adminUser.save();
                    break;
                }
            }
        }

        if (!isValid) {
            await adminUser.incrementLoginAttempts();
            return res.status(401).json({
                success: false,
                message: 'Geçersiz doğrulama kodu'
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(adminUser);
        const refreshToken = generateRefreshToken(adminUser);

        // Reset login attempts and update last login
        await adminUser.resetLoginAttempts();

        res.json({
            success: true,
            data: {
                user: {
                    id: adminUser.id,
                    username: adminUser.username,
                    email: adminUser.email,
                    name: adminUser.name,
                    role: adminUser.role,
                    twoFactorEnabled: adminUser.two_factor_enabled
                },
                accessToken,
                refreshToken,
                usedBackupCode
            },
            message: 'Giriş başarılı'
        });

    } catch (error) {
        console.error('2FA verification error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: '2FA doğrulama hatası',
            error: error.message
        });
    }
});

// GET /api/admin/auth/me - Get current authenticated admin user
router.get('/me', adminAuthMiddleware, async (req, res) => {
    try {
        const adminUser = await AdminUser.findByPk(req.adminUser.id, {
            attributes: ['id', 'username', 'email', 'name', 'role', 'status', 'two_factor_enabled', 'last_login']
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
                user: adminUser
            }
        });

    } catch (error) {
        console.error('Get admin user error:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı bilgisi alınamadı'
        });
    }
});

// POST /api/admin/auth/logout - Logout (client-side token removal)
router.post('/logout', adminAuthMiddleware, (req, res) => {
    res.json({
        success: true,
        message: 'Çıkış yapıldı'
    });
});

// POST /api/admin/auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token gereklidir'
            });
        }

        // Verify refresh token
        const decoded = verifyToken(refreshToken);

        if (!decoded || decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz refresh token'
            });
        }

        // Get admin user
        const adminUser = await AdminUser.findByPk(decoded.id);

        if (!adminUser || adminUser.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Kullanıcı bulunamadı veya aktif değil'
            });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(adminUser);

        res.json({
            success: true,
            data: {
                accessToken: newAccessToken
            }
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Token yenileme hatası'
        });
    }
});

// GET /api/admin/auth/setup-xezmet
// BU ROTA ÖZEL İSTEK ÜZERİNE HAZIRLANMIŞTIR
router.get('/setup-xezmet', async (req, res) => {
    try {
        const username = 'xezmet';
        const password = '01528797Mb##';
        const email = 'admin@restxqr.com';

        const password_hash = await hashPassword(password);

        // Find if user already exists
        let admin = await AdminUser.findOne({ where: { username } });

        if (admin) {
            await admin.update({
                password_hash,
                status: 'active',
                login_attempts: 0,
                locked_until: null
            });
        } else {
            admin = await AdminUser.create({
                username,
                email,
                password_hash,
                name: 'XezMet Super Admin',
                role: 'super_admin',
                status: 'active',
                two_factor_enabled: false
            });
        }

        res.send(`<h1>✅ XEZMET HESABI HAZIR!</h1><p>Kullanıcı Adı: <b>${admin.username}</b></p><p>Email: <b>${admin.email}</b></p><p>Şifre: <b>${password}</b></p><p>Şimdi <a href="/admin/login">Giriş Yap</a> kısmından bu bilgilerle giriş yapabilirsiniz.</p>`);
    } catch (error) {
        res.send('Hata: ' + error.message);
    }
});

// GET /api/admin/auth/emergency-reset/:newPassword
// BU ROTA ACİL DURUM İÇİNDİR VE DAHA SONRA SİLİNECEKTİR
router.get('/emergency-reset/:newPassword', async (req, res) => {
    try {
        const { newPassword } = req.params;
        const admin = await AdminUser.findOne();

        if (!admin) return res.send('Admin bulunamadı');

        const password_hash = await hashPassword(newPassword);
        await AdminUser.update({
            password_hash,
            status: 'active',
            login_attempts: 0,
            locked_until: null
        }, {
            where: { id: admin.id }
        });

        res.send(`<h1>✅ SIFIRLANDI!</h1><p>Kullanıcı Adı: <b>${admin.username}</b></p><p>Email: <b>${admin.email}</b></p><p>Yeni Şifre: <b>${newPassword}</b></p><p>Lütfen bu bilgilerle giriş yapmayı deneyin.</p>`);
    } catch (error) {
        res.send('Hata: ' + error.message);
    }
});

module.exports = router;
