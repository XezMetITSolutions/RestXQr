module.exports = (sequelize, DataTypes) => {
  const MenuItem = sequelize.define('MenuItem', {
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
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'category_id',
      references: {
        model: 'menu_categories',
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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'image_url'
    },
    videoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'video_url',
      comment: 'Video menu URL'
    },
    videoThumbnail: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'video_thumbnail',
      comment: 'Video thumbnail image URL'
    },
    videoDuration: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'video_duration',
      comment: 'Video duration (e.g., "0:45")'
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_available'
    },
    isPopular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_popular'
    },
    preparationTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'preparation_time'
    },
    calories: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ingredients: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    allergens: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    portionSize: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'portion_size'
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'display_order'
    },
    subcategory: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    portion: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    kitchenStation: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'kitchen_station'
    },
    variations: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    options: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    type: {
      type: DataTypes.STRING(20),
      defaultValue: 'single'
    },
    bundleItems: {
      type: DataTypes.JSONB,
      defaultValue: [],
      field: 'bundle_items'
    },
    translations: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Language translations keyed by language code (e.g., en, zh)'
    },
    discountedPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'discounted_price',
      comment: 'Discounted price (if campaign is active)'
    },
    discountPercentage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'discount_percentage',
      comment: 'Discount percentage (0-100)'
    },
    discountStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'discount_start_date',
      comment: 'Campaign start date'
    },
    discountEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'discount_end_date',
      comment: 'Campaign end date'
    }
  }, {
    tableName: 'menu_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['restaurant_id']
      },
      {
        fields: ['category_id']
      },
      {
        fields: ['restaurant_id', 'category_id', 'display_order']
      }
    ]
  });

  return MenuItem;
};
p