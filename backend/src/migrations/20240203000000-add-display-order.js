
'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Check and add displayOrder to MenuCategories
            const categoriesTable = await queryInterface.describeTable('MenuCategories');
            if (!categoriesTable.displayOrder) {
                await queryInterface.addColumn('MenuCategories', 'displayOrder', {
                    type: Sequelize.INTEGER,
                    defaultValue: 0,
                    allowNull: false
                }, { transaction });
                console.log('Added displayOrder to MenuCategories');
            }

            // Check and add displayOrder to MenuItems
            const itemsTable = await queryInterface.describeTable('MenuItems');
            if (!itemsTable.displayOrder) {
                await queryInterface.addColumn('MenuItems', 'displayOrder', {
                    type: Sequelize.INTEGER,
                    defaultValue: 0,
                    allowNull: false
                }, { transaction });
                console.log('Added displayOrder to MenuItems');
            }

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },

    down: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            const categoriesTable = await queryInterface.describeTable('MenuCategories');
            if (categoriesTable.displayOrder) {
                await queryInterface.removeColumn('MenuCategories', 'displayOrder', { transaction });
            }

            const itemsTable = await queryInterface.describeTable('MenuItems');
            if (itemsTable.displayOrder) {
                await queryInterface.removeColumn('MenuItems', 'displayOrder', { transaction });
            }

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
