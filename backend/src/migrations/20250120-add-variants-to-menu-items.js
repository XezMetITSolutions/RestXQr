'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('menu_items', 'variants', {
            type: Sequelize.JSONB,
            allowNull: true,
            defaultValue: []
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('menu_items', 'variants');
    }
};
