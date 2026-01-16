const readline = require('readline');
const { AdminUser } = require('../models');
const { hashPassword } = require('../lib/adminAuth');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createSuperAdmin() {
    try {
        console.log('\n🔐 RestXQR Superadmin Oluşturma\n');
        console.log('Bu script ile ilk superadmin kullanıcısını oluşturabilirsiniz.\n');

        // Check if admin already exists
        const existingAdmin = await AdminUser.findOne();
        if (existingAdmin) {
            const answer = await question('⚠️  Zaten bir admin kullanıcı mevcut. Yeni admin eklemek istiyor musunuz? (evet/hayir): ');
            if (answer.toLowerCase() !== 'evet' && answer.toLowerCase() !== 'e') {
                console.log('İşlem iptal edildi.');
                rl.close();
                process.exit(0);
            }
        }

        // Get user input
        const username = await question('Kullanıcı adı: ');
        if (!username || username.length < 3) {
            console.log('❌ Kullanıcı adı en az 3 karakter olmalıdır.');
            rl.close();
            process.exit(1);
        }

        const email = await question('Email: ');
        if (!email || !email.includes('@')) {
            console.log('❌ Geçerli bir email adresi giriniz.');
            rl.close();
            process.exit(1);
        }

        const name = await question('Ad Soyad: ');
        if (!name) {
            console.log('❌ Ad soyad boş olamaz.');
            rl.close();
            process.exit(1);
        }

        const password = await question('Şifre (min. 8 karakter): ');
        if (!password || password.length < 8) {
            console.log('❌ Şifre en az 8 karakter olmalıdır.');
            rl.close();
            process.exit(1);
        }

        const confirmPassword = await question('Şifre (tekrar): ');
        if (password !== confirmPassword) {
            console.log('❌ Şifreler eşleşmiyor.');
            rl.close();
            process.exit(1);
        }

        // Check if username or email already exists
        const existingUser = await AdminUser.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            console.log('❌ Bu kullanıcı adı veya email zaten kullanılıyor.');
            rl.close();
            process.exit(1);
        }

        // Hash password
        console.log('\n⏳ Şifre hash\'leniyor...');
        const password_hash = await hashPassword(password);

        // Create admin user
        console.log('⏳ Admin kullanıcı oluşturuluyor...');
        const adminUser = await AdminUser.create({
            username,
            email,
            name,
            password_hash,
            role: 'super_admin',
            status: 'active',
            two_factor_enabled: false
        });

        console.log('\n✅ Superadmin başarıyla oluşturuldu!\n');
        console.log('Kullanıcı Bilgileri:');
        console.log('-------------------');
        console.log(`ID: ${adminUser.id}`);
        console.log(`Kullanıcı Adı: ${adminUser.username}`);
        console.log(`Email: ${adminUser.email}`);
        console.log(`Ad Soyad: ${adminUser.name}`);
        console.log(`Rol: ${adminUser.role}`);
        console.log(`Durum: ${adminUser.status}`);
        console.log('\n⚠️  ÖNEMLİ: Giriş yaptıktan sonra 2FA\'yı aktifleştirmeyi unutmayın!\n');
        console.log('Admin paneline giriş için: https://restxqr.com/admin/login\n');

        rl.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Hata oluştu:', error.message);
        rl.close();
        process.exit(1);
    }
}

// Veritabanı bağlantısı
const { connectDB } = require('../models');

console.log('📦 Veritabanı bağlantısı kuruluyor...');
connectDB()
    .then(() => {
        console.log('✅ Veritabanı bağlantısı başarılı.\n');
        return createSuperAdmin();
    })
    .catch((error) => {
        console.error('❌ Veritabanı bağlantı hatası:', error.message);
        rl.close();
        process.exit(1);
    });
