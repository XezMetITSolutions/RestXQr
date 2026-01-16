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

        // Self-healing: If table doesn't exist, create it and retry
        if (error.original && error.original.code === '42P01') { // Postgres code for undefined_table
            try {
                console.log('⚠️ Admin table missing, attempting to auto-create...');
                await AdminUser.sync({ alter: true });
                console.log('✅ Admin table created successfully');

                const adminCount = await AdminUser.count();
                return res.json({
                    success: true,
                    data: {
                        hasAdmin: adminCount > 0,
                        adminCount: adminCount
                    },
                    message: 'Database initialized automatically'
                });
            } catch (syncError) {
                console.error('Auto-creation failed:', syncError);
                // Fall through to error response
            }
        }

        res.status(500).json({
            success: false,
            message: 'Kontrol hatası: ' + error.message,
            stack: error.stack
        });
    }
});

// POST /api/admin/setup/sync-db - Force sync database
router.post('/sync-db', async (req, res) => {
    try {
        const { sequelize } = require('../models');
        console.log('🔄 Manual database sync requested...');
        await sequelize.sync({ alter: true });
        console.log('✅ Manual database sync completed');

        res.json({
            success: true,
            message: 'Veritabanı şeması başarıyla güncellendi (Tables synced).'
        });
    } catch (error) {
        console.error('Manual sync error:', error);
        res.status(500).json({
            success: false,
            message: 'Sync hatası: ' + error.message,
            stack: error.stack
        });
    }
});

module.exports = router;
