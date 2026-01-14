'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('restaurants', 'parent_restaurant_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'restaurants',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Ana restoran ID (şube ise)'
    });

    await queryInterface.addColumn('restaurants', 'branch_name', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Şube adı (örn: "Kadıköy Şubesi")'
    });

    await queryInterface.addColumn('restaurants', 'branch_code', {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: true,
      comment: 'Şube kodu (örn: "KDK-01")'
    });

    await queryInterface.addColumn('restaurants', 'is_branch', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Bu bir şube mi?'
    });

    // Index ekle
    await queryInterface.addIndex('restaurants', ['parent_restaurant_id'], {
      name: 'restaurants_parent_restaurant_id_idx'
    });

    await queryInterface.addIndex('restaurants', ['branch_code'], {
      name: 'restaurants_branch_code_idx',
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('restaurants', 'restaurants_branch_code_idx');
    await queryInterface.removeIndex('restaurants', 'restaurants_parent_restaurant_id_idx');
    await queryInterface.removeColumn('restaurants', 'is_branch');
    await queryInterface.removeColumn('restaurants', 'branch_code');
    await queryInterface.removeColumn('restaurants', 'branch_name');
    await queryInterface.removeColumn('restaurants', 'parent_restaurant_id');
  }
};
