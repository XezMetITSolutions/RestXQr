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

        // Find admin user
        const adminUser = await AdminUser.findOne({ where: { username } });

        if (!adminUser) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz kullanıcı adı veya şifre'
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
        const { userId, token } = req.body;

        if (!userId || !token) {
            return res.status(400).json({
                success: false,
                message: 'Kullanıcı ID ve token gereklidir'
            });
        }

        // Find admin user
        const adminUser = await AdminUser.findByPk(userId);

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

        // Verify 2FA token or backup code
        const { verifyTOTP, verifyBackupCodeForUser } = require('../lib/twoFactorAuth');

        let isValid = false;
        let usedBackupCode = false;

        // Try TOTP first
        isValid = verifyTOTP(adminUser.two_factor_secret, token);

        // If TOTP fails, try backup codes
        if (!isValid && token.length > 6) {
            const backupResult = await verifyBackupCodeForUser(adminUser, token);
            if (backupResult.verified) {
                isValid = true;
                usedBackupCode = true;
                // Save updated backup codes
                await adminUser.save();
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
        res.status(500).json({
            success: false,
            message: 'Doğrulama hatası'
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

module.exports = router;
