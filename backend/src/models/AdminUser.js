module.exports = (sequelize, DataTypes) => {
  const AdminUser = sequelize.define('AdminUser', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    role: {
      type: DataTypes.ENUM('super_admin'),
      defaultValue: 'super_admin',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'locked'),
      defaultValue: 'active',
      allowNull: false
    },
    two_factor_secret: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Encrypted TOTP secret'
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    backup_codes: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of encrypted backup codes'
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Account locked until this timestamp'
    }
  }, {
    tableName: 'admin_users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['username']
      },
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['status']
      }
    ]
  });

  // Instance methods
  AdminUser.prototype.isLocked = function() {
    if (!this.locked_until) return false;
    return new Date() < this.locked_until;
  };

  AdminUser.prototype.incrementLoginAttempts = async function() {
    this.login_attempts += 1;
    
    // Lock account after 5 failed attempts for 30 minutes
    if (this.login_attempts >= 5) {
      this.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }
    
    await this.save();
  };

  AdminUser.prototype.resetLoginAttempts = async function() {
    this.login_attempts = 0;
    this.locked_until = null;
    this.last_login = new Date();
    await this.save();
  };

  return AdminUser;
};
