require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Industrial Asset Management System backend is running.' });
});

// Startup Function
async function startServer() {
  console.log('Connecting to database...');
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync all models (creates tables if they don't exist)
    await sequelize.sync();
    console.log('All models synchronized successfully.');
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
