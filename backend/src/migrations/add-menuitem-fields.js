// Migration to add isPopular, preparationTime, and calories to menu_items table

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('menu_items');
    
    // Add isPopular if it doesn't exist
    if (!tableInfo.is_popular) {
      await queryInterface.addColumn('menu_items', 'is_popular', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }
    
    // Add preparationTime if it doesn't exist
    if (!tableInfo.preparation_time) {
      await queryInterface.addColumn('menu_items', 'preparation_time', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }
    
    // Add calories if it doesn't exist
    if (!tableInfo.calories) {
      await queryInterface.addColumn('menu_items', 'calories', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('menu_items', 'is_popular');
    await queryInterface.removeColumn('menu_items', 'preparation_time');
    await queryInterface.removeColumn('menu_items', 'calories');
  }
};


