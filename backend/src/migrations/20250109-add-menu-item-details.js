'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('menu_items', 'ingredients', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Comma-separated list of ingredients'
    });

    await queryInterface.addColumn('menu_items', 'allergens', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of allergens: gluten, dairy, eggs, nuts, peanuts, soy, fish, shellfish'
    });

    await queryInterface.addColumn('menu_items', 'portion_size', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'e.g., "250g", "1 portion", "Large"'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('menu_items', 'ingredients');
    await queryInterface.removeColumn('menu_items', 'allergens');
    await queryInterface.removeColumn('menu_items', 'portion_size');
  }
};
