const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class TwoFactorAuthService {
  constructor() {
    this.secretLength = 32;
  }

  /**
   * Yeni bir 2FA secret'i oluştur
   * @param {string} username - Kullanıcı adı
   * @param {string} issuer - Uygulama adı
   * @returns {Object} Secret ve QR kod bilgileri
   */
  generateSecret(username, issuer = 'RestXQr') {
    const secret = speakeasy.generateSecret({
      name: username,
      issuer: issuer,
      length: this.secretLength
    });

    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url,
      manualEntryKey: secret.base32
    };
  }

  /**
   * QR kod URL'sini QR kod görseline dönüştür
   * @param {string} qrCodeUrl - QR kod URL'si
   * @returns {Promise<string>} Base64 QR kod görseli
   */
  async generateQRCode(qrCodeUrl) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(qrCodeUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('QR kod oluşturma hatası:', error);
      throw new Error('QR kod oluşturulamadı');
    }
  }

  /**
   * TOTP kodunu doğrula
   * @param {string} secret - Kullanıcının secret'i
   * @param {string} token - Girilen TOTP kodu
   * @param {number} window - Zaman penceresi (varsayılan: 2)
   * @returns {boolean} Doğrulama sonucu
   */
  verifyToken(secret, token, window = 2) {
    try {
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: window, // ±2 zaman dilimi toleransı
        time: Math.floor(Date.now() / 1000)
      });

      return verified;
    } catch (error) {
      console.error('TOTP doğrulama hatası:', error);
      return false;
    }
  }

  /**
   * Backup kodları oluştur
   * @param {number} count - Oluşturulacak kod sayısı (varsayılan: 10)
   * @returns {Array<string>} Backup kodları
   */
  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // 8 haneli rastgele kodlar
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Backup kodunu doğrula
   * @param {string} inputCode - Girilen backup kod
   * @param {Array<string>} backupCodes - Kullanıcının backup kodları
   * @returns {Object} Doğrulama sonucu ve güncellenmiş backup kodları
   */
  verifyBackupCode(inputCode, backupCodes) {
    const upperInputCode = inputCode.toUpperCase();
    const codeIndex = backupCodes.indexOf(upperInputCode);
    
    if (codeIndex !== -1) {
      // Kullanılan backup kodunu kaldır
      const updatedBackupCodes = [...backupCodes];
      updatedBackupCodes.splice(codeIndex, 1);
      
      return {
        verified: true,
        backupCodes: updatedBackupCodes
      };
    }
    
    return {
      verified: false,
      backupCodes: backupCodes
    };
  }

  /**
   * 2FA durumunu kontrol et
   * @param {string} secret - Kullanıcının secret'i
   * @returns {boolean} 2FA aktif mi?
   */
  is2FAEnabled(secret) {
    return secret && secret.length > 0;
  }

  /**
   * Güvenli secret saklama için hash'le
   * @param {string} secret - Orijinal secret
   * @returns {string} Hash'lenmiş secret
   */
  hashSecret(secret) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(secret).digest('hex');
  }

  /**
   * Secret'i şifrele
   * @param {string} secret - Orijinal secret
   * @param {string} password - Şifreleme anahtarı
   * @returns {string} Şifrelenmiş secret
   */
  encryptSecret(secret, password) {
    const crypto = require('crypto');
    const algorithm = 'aes-256-cbc';
    const key = crypto.createHash('sha256').update(password).digest();
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Secret'i şifresini çöz
   * @param {string} encryptedSecret - Şifrelenmiş secret
   * @param {string} password - Şifreleme anahtarı
   * @returns {string} Orijinal secret
   */
  decryptSecret(encryptedSecret, password) {
    const crypto = require('crypto');
    const algorithm = 'aes-256-cbc';
    const key = crypto.createHash('sha256').update(password).digest();
    
    const parts = encryptedSecret.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

module.exports = new TwoFactorAuthService();
