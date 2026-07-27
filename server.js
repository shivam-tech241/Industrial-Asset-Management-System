require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, Role, Department } = require('./models');

const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const assetCategoryRoutes = require('./routes/assetCategoryRoutes');
const assetRoutes = require('./routes/assetRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/asset-categories', assetCategoryRoutes);
app.use('/api/assets', assetRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Industrial Asset Management System backend is running.' });
});

// Seed function for essential database records
async function seedData() {
  const rolesToSeed = ['Admin', 'Technician', 'Viewer'];
  for (const roleName of rolesToSeed) {
    await Role.findOrCreate({
      where: { role_name: roleName },
      defaults: { role_name: roleName }
    });
  }
  console.log('Roles seeded successfully.');

  // Seed a default department so register endpoint works without FK issues
  await Department.findOrCreate({
    where: { id: 1 },
    defaults: { name: 'General' }
  });
  console.log('Default Department seeded successfully.');
}

// Startup Function
async function startServer() {
  console.log('Connecting to database...');
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync all models (creates tables if they don't exist)
    await sequelize.sync();
    console.log('All models synchronized successfully.');

    // Seed roles and departments
    await seedData();
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    console.warn('Note: Server will continue running, but database operations will fail until MySQL is running and configured in .env.');
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
