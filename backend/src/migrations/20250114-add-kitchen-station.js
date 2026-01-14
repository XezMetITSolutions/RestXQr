'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('menu_items', 'kitchen_station', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Kitchen station: izgara, makarna, soguk, tatli'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('menu_items', 'kitchen_station');
  }
};
