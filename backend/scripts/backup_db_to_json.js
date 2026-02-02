const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const dotEnvPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: dotEnvPath });

// Try to get config from models/index.js but we want to avoid side-effects of immediate connection
// So we re-implement a basic connection logic here using the same env vars.

const BACKUP_DIR = path.join(__dirname, '../backups');

async function backupDatabase() {
    console.log('--- Database Backup Script ---');

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl && process.env.NODE_ENV !== 'production') {
        console.log('⚠️ DATABASE_URL not found in environment variables.');
        console.log(`Checking looking for .env at: ${dotEnvPath}`);
        if (!fs.existsSync(dotEnvPath)) {
            console.error('❌ .env file not found!');
            console.log('Please create a .env file in the backend directory with DATABASE_URL.');
            return;
        }
    }

    // Use the same config logic as src/models/index.js
    const connectionUrl = dbUrl || 'postgresql://localhost:5432/masapp';
    console.log(`🔌 Connecting to: ${connectionUrl.replace(/:[^:@]+@/, ':****@')} ...`);

    const sequelize = new Sequelize(connectionUrl, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        }
    });

    const {
        Restaurant, MenuCategory, MenuItem, Order, OrderItem,
        Feature, QRToken, Staff, Branch, ApiKey, Delivery,
        POSDevice, Transaction, AIRecommendation, VideoMenuItem,
        Event, InventoryItem, AdminUser, SupportTicket
    } = require('../src/models');

    // Map models 
    const models = {
        Restaurant, MenuCategory, MenuItem, Order, OrderItem,
        Feature, QRToken, Staff, Branch, ApiKey, Delivery,
        POSDevice, Transaction, AIRecommendation, VideoMenuItem,
        Event, InventoryItem, AdminUser, SupportTicket
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sessionBackupDir = path.join(BACKUP_DIR, `backup-${timestamp}`);

    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR);
    }
    if (!fs.existsSync(sessionBackupDir)) {
        fs.mkdirSync(sessionBackupDir);
    }

    try {
        await sequelize.authenticate();
        console.log('✅ Connected successfully.');

        let totalRecords = 0;

        for (const [modelName, Model] of Object.entries(models)) {
            try {
                process.stdout.write(`📦 Backing up ${modelName}... `);
                const records = await Model.findAll();
                const plainRecords = records.map(r => r.get({ plain: true }));

                const filePath = path.join(sessionBackupDir, `${modelName}.json`);
                fs.writeFileSync(filePath, JSON.stringify(plainRecords, null, 2));
                console.log(`✅ ${plainRecords.length} records`);
                totalRecords += plainRecords.length;
            } catch (err) {
                console.log(`❌ Failed: ${err.message}`);
            }
        }

        console.log(`\n✨ Backup completed successfully!`);
        console.log(`📂 Location: ${sessionBackupDir}`);
        console.log(`📊 Total Records: ${totalRecords}`);

    } catch (error) {
        console.error('\n❌ Fatal: Unable to connect to the database.');
        console.error('Error:', error.message);
        console.log('\nMake sure your .env file in the backend folder contains the correct DATABASE_URL.');
    } finally {
        await sequelize.close();
    }
}

backupDatabase();
