const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AssetCategory = sequelize.define('AssetCategory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'asset_categories',
  timestamps: false
});

module.exports = AssetCategory;
