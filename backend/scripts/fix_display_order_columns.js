
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Load .env from backend root

const { sequelize } = require('../src/models');
const { QueryTypes } = require('sequelize');

async function fixDisplayOrderColumns() {
    try {
        console.log('Veritabanı bağlantısı kontrol ediliyor...');
        await sequelize.authenticate();
        console.log('Bağlantı başarılı.');

        const queryInterface = sequelize.getQueryInterface();

        // 1. MenuCategories için displayOrder kontrolü
        try {
            console.log('Checking MenuCategories table...');
            const tableInfo = await queryInterface.describeTable('MenuCategories');

            if (!tableInfo.displayOrder) {
                console.log('Adding displayOrder column to MenuCategories...');
                await queryInterface.addColumn('MenuCategories', 'displayOrder', {
                    type: 'INTEGER',
                    defaultValue: 0,
                    allowNull: false
                });
                console.log('Added to MenuCategories.');
            } else {
                console.log('MenuCategories.displayOrder already exists.');
            }
        } catch (err) {
            console.error('Error with MenuCategories:', err.message);
        }

        // 2. MenuItems için displayOrder kontrolü
        try {
            console.log('Checking MenuItems table...');
            const tableInfo = await queryInterface.describeTable('MenuItems');

            if (!tableInfo.displayOrder) {
                console.log('Adding displayOrder column to MenuItems...');
                await queryInterface.addColumn('MenuItems', 'displayOrder', {
                    type: 'INTEGER',
                    defaultValue: 0,
                    allowNull: false
                });
                console.log('Added to MenuItems.');
            } else {
                console.log('MenuItems.displayOrder already exists.');
            }
        } catch (err) {
            console.error('Error with MenuItems:', err.message);
        }

        console.log('İşlem tamamlandı.');
        process.exit(0);
    } catch (error) {
        console.error('Ana hata:', error);
        process.exit(1);
    }
}

fixDisplayOrderColumns();
