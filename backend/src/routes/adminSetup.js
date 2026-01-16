const express = require('express');
const router = express.Router();
const { AdminUser } = require('../models');
const { hashPassword } = require('../lib/adminAuth');

// POST /api/admin/setup/create-first-admin - İlk superadmin oluştur
router.post('/create-first-admin', async (req, res) => {
    try {
        const { username, email, name, password } = req.body;

        // Validation
        if (!username || !email || !name || !password) {
            return res.status(400).json({
                success: false,
                message: 'Tüm alanlar gereklidir'
            });
        }

        // Check if any admin already exists
        const existingAdmin = await AdminUser.findOne();

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Sistemde zaten bir admin mevcut. Bu endpoint sadece ilk kurulum için kullanılabilir.'
            });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir email adresi giriniz'
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Şifre en az 8 karakter olmalıdır'
            });
        }

        // Hash password
        const password_hash = await hashPassword(password);

        // Create first admin
        const adminUser = await AdminUser.create({
            username,
            email,
            name,
            password_hash,
            role: 'super_admin',
            status: 'active',
            two_factor_enabled: false
        });

        res.json({
            success: true,
            data: {
                user: {
                    id: adminUser.id,
                    username: adminUser.username,
                    email: adminUser.email,
                    name: adminUser.name,
                    role: adminUser.role,
                    status: adminUser.status
                }
            },
            message: 'İlk superadmin başarıyla oluşturuldu!'
        });

    } catch (error) {
        console.error('Create first admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Superadmin oluşturma hatası',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/admin/setup/check - Admin var mı kontrol et
router.get('/check', async (req, res) => {
    try {
        const adminCount = await AdminUser.count();

        res.json({
            success: true,
            data: {
                hasAdmin: adminCount > 0,
                adminCount: adminCount
            }
        });
    } catch (error) {
        console.error('Setup check error:', error);
        res.status(500).json({
            success: false,
            message: 'Kontrol hatası'
        });
    }
});

module.exports = router;
