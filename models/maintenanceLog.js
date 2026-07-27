const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MaintenanceLog = sequelize.define('MaintenanceLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'assets',
      key: 'id'
    }
  },
  performed_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('Completed', 'Pending', 'In Progress'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  next_due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'maintenance_logs',
  timestamps: false
});

module.exports = MaintenanceLog;
