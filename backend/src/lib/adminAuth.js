const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '15m'; // 15 minutes
const JWT_REFRESH_EXPIRATION = '7d'; // 7 days

// Encryption for sensitive data (2FA secrets, backup codes)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

/**
 * Hash password using bcrypt
 */
async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against hash
 */
async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 */
function generateAccessToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        type: 'access'
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRATION,
        issuer: 'RestXQR',
        subject: user.id
    });
}

/**
 * Generate JWT refresh token
 */
function generateRefreshToken(user) {
    const payload = {
        id: user.id,
        type: 'refresh'
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRATION,
        issuer: 'RestXQR',
        subject: user.id
    });
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Encrypt sensitive data
 */
function encrypt(text) {
    if (!text) return null;

    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data
 */
function decrypt(encryptedText) {
    if (!encryptedText) return null;

    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Hash backup code for storage
 */
async function hashBackupCode(code) {
    return await bcrypt.hash(code.toUpperCase(), 10);
}

/**
 * Verify backup code
 */
async function verifyBackupCode(code, hash) {
    return await bcrypt.compare(code.toUpperCase(), hash);
}

/**
 * Hash array of backup codes
 */
async function hashBackupCodes(codes) {
    const hashedCodes = [];
    for (const code of codes) {
        const hash = await hashBackupCode(code);
        hashedCodes.push(hash);
    }
    return hashedCodes;
}

module.exports = {
    hashPassword,
    verifyPassword,
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    encrypt,
    decrypt,
    hashBackupCode,
    hashBackupCodes,
    verifyBackupCode,
    JWT_SECRET,
    JWT_EXPIRATION
};
