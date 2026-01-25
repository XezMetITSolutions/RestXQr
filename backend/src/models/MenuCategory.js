module.exports = (sequelize, DataTypes) => {
  const MenuCategory = sequelize.define('MenuCategory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'restaurant_id',
      references: {
        model: 'restaurants',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'display_order'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    kitchenStation: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'kitchen_station',
      comment: 'Kitchen station: izgara, makarna, soguk, tatli'
    },
    discountPercentage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'discount_percentage',
      comment: 'Category-wide discount percentage (0-100)'
    },
    discountStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'discount_start_date',
      comment: 'Category campaign start date'
    },
    discountEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'discount_end_date',
      comment: 'Category campaign end date'
    }
  }, {
    tableName: 'menu_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['restaurant_id']
      },
      {
        fields: ['restaurant_id', 'display_order']
      }
    ]
  });

  return MenuCategory;
};
