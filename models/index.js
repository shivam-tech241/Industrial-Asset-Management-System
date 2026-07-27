const sequelize = require('../config/db');

// Import models
const Role = require('./role');
const Department = require('./department');
const Section = require('./section');
const User = require('./user');
const AssetCategory = require('./assetCategory');
const Asset = require('./asset');
const MaintenanceLog = require('./maintenanceLog');
const FaultReport = require('./faultReport');

// Define Associations

// Department & Section (One-to-Many)
Department.hasMany(Section, { foreignKey: 'department_id', onDelete: 'CASCADE' });
Section.belongsTo(Department, { foreignKey: 'department_id' });

// Role & User (One-to-Many)
Role.hasMany(User, { foreignKey: 'role_id', onDelete: 'RESTRICT' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// Department & User (One-to-Many)
Department.hasMany(User, { foreignKey: 'department_id', onDelete: 'RESTRICT' });
User.belongsTo(Department, { foreignKey: 'department_id' });

// AssetCategory & Asset (One-to-Many)
AssetCategory.hasMany(Asset, { foreignKey: 'category_id', onDelete: 'RESTRICT' });
Asset.belongsTo(AssetCategory, { foreignKey: 'category_id' });

// Department & Asset (One-to-Many)
Department.hasMany(Asset, { foreignKey: 'department_id', onDelete: 'RESTRICT' });
Asset.belongsTo(Department, { foreignKey: 'department_id' });

// Section & Asset (One-to-Many)
Section.hasMany(Asset, { foreignKey: 'section_id', onDelete: 'RESTRICT' });
Asset.belongsTo(Section, { foreignKey: 'section_id' });

// Asset & MaintenanceLog (One-to-Many)
Asset.hasMany(MaintenanceLog, { foreignKey: 'asset_id', onDelete: 'CASCADE' });
MaintenanceLog.belongsTo(Asset, { foreignKey: 'asset_id' });

// User & MaintenanceLog (One-to-Many)
User.hasMany(MaintenanceLog, { foreignKey: 'performed_by', as: 'maintenanceLogs', onDelete: 'RESTRICT' });
MaintenanceLog.belongsTo(User, { foreignKey: 'performed_by', as: 'performer' });

// Asset & FaultReport (One-to-Many)
Asset.hasMany(FaultReport, { foreignKey: 'asset_id', onDelete: 'CASCADE' });
FaultReport.belongsTo(Asset, { foreignKey: 'asset_id' });

// User & FaultReport (One-to-Many)
User.hasMany(FaultReport, { foreignKey: 'reported_by', as: 'faultReports', onDelete: 'RESTRICT' });
FaultReport.belongsTo(User, { foreignKey: 'reported_by', as: 'reporter' });

module.exports = {
  sequelize,
  Role,
  Department,
  Section,
  User,
  AssetCategory,
  Asset,
  MaintenanceLog,
  FaultReport
};
