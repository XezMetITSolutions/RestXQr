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

                // FIXED: alter: true kaldırıldı (timeout/crash önlemek için)
                // Sadece tablo yoksa oluşturur
                await AdminUser.sync();

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
        console.log('🔄 Manual database sync requested (light mode)...');

        // Önce kritik tablonun (AdminUser) senkronize olduğundan emin olalım
        try {
            await AdminUser.sync();
            console.log('✅ AdminUser table synced successfully');
        } catch (adminSyncError) {
            console.error('⚠️ AdminUser specific sync failed:', adminSyncError);
        }

        // Genel sync denemesi
        await sequelize.sync();

        console.log('✅ Manual database sync completed');

        res.json({
            success: true,
            message: 'Veritabanı tabloları kontrol edildi (Light Sync). Eksik tablolar oluşturuldu.'
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

// POST /api/admin/setup/reset-db - HARD RESET (Data Loss)
router.post('/reset-db', async (req, res) => {
    try {
        const { sequelize } = require('../models');
        console.log('☢️ HARD DATABASE RESET REQUESTED (ITERATIVE MODE)...');

        // "out of shared memory" hatasını önlemek için "DROP SCHEMA" yerine
        // tabloları ve tipleri TEK TEK siliyoruz (Iterative Dozer Strategy)

        // 1. Tabloları bul ve sil
        console.log('🔥 Fetching tables...');
        try {
            const [tables] = await sequelize.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`);
            console.log(`Found ${tables.length} tables.`);

            // Disable triggers/constraints loop is hard, so we rely on CASCADE
            for (const t of tables) {
                console.log(`🗑️ Dropping table: ${t.tablename}`);
                await sequelize.query(`DROP TABLE IF EXISTS "public"."${t.tablename}" CASCADE`);
            }
        } catch (tableError) {
            console.error('Error dropping tables:', tableError);
            throw tableError;
        }

        // 2. Enum/Type'ları bul ve sil
        console.log('🔥 Fetching types...');
        try {
            const [types] = await sequelize.query(`
                SELECT t.typname as typename
                FROM pg_type t 
                JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
                WHERE n.nspname = 'public' AND t.typtype = 'e';
            `);
            console.log(`Found ${types.length} custom types.`);

            for (const t of types) {
                console.log(`🗑️ Dropping type: ${t.typename}`);
                await sequelize.query(`DROP TYPE IF EXISTS "public"."${t.typename}" CASCADE`);
            }
        } catch (typeError) {
            console.error('Error dropping types:', typeError);
            // Types are less critical, continue
        }

        console.log('✅ Cleaned up schema successfully.');

        // 3. Tabloları yeniden oluştur (Sync)
        console.log('🏗️ Rebuilding tables...');
        await sequelize.sync();
        console.log('✅ Tables rebuilt.');

        res.json({
            success: true,
            message: 'Veritabanı "Iterative Mode" ile sıfırlandı. Tüm tablolar tek tek temizlendi ve yeniden oluşturuldu.'
        });
    } catch (error) {
        console.error('Hard reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Reset hatası: ' + error.message,
            stack: error.stack
        });
    }
});

module.exports = router;
