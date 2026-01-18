module.exports = (sequelize, DataTypes) => {
  const Restaurant = sequelize.define('Restaurant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    features: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['qr_menu', 'basic_reports']
    },
    subscriptionPlan: {
      type: DataTypes.STRING(50),
      defaultValue: 'basic',
      field: 'subscription_plan'
    },
    subscriptionStatus: {
      type: DataTypes.STRING(20),
      defaultValue: 'active',
      field: 'subscription_status'
    },
    maxTables: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      field: 'max_tables',
      comment: 'Maksimum masa sayısı (plan limiti)'
    },
    maxMenuItems: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
      field: 'max_menu_items',
      comment: 'Maksimum menü ürünü sayısı (plan limiti)'
    },
    maxStaff: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      field: 'max_staff',
      comment: 'Maksimum personel sayısı (plan limiti)'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    parentRestaurantId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'parent_restaurant_id',
      references: {
        model: 'restaurants',
        key: 'id'
      },
      comment: 'Ana restoran ID (şube ise)'
    },
    branchName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'branch_name',
      comment: 'Şube adı (örn: "Kadıköy Şubesi")'
    },
    branchCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      field: 'branch_code',
      comment: 'Şube kodu (örn: "KDK-01")'
    },
    isBranch: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_branch',
      comment: 'Bu bir şube mi?'
    },
    kitchenStations: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'kitchen_stations',
      comment: 'Kitchen stations configuration: [{id, name, emoji, color, order}]'
    }
  }, {
    tableName: 'restaurants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['username']
      },
      {
        unique: true,
        fields: ['email']
      }
    ]
  });

  return Restaurant;
};
