const { AssetCategory } = require('../models');

// Get all asset categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await AssetCategory.findAll();
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching asset categories:', error);
    return res.status(500).json({ message: 'Internal server error fetching asset categories.' });
  }
};

// Create an asset category (Admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }
    const newCategory = await AssetCategory.create({ name });
    return res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating asset category:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Category name must be unique.' });
    }
    return res.status(500).json({ message: 'Internal server error creating asset category.' });
  }
};

// Update an asset category (Admin only)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const category = await AssetCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Asset category not found.' });
    }

    category.name = name;
    await category.save();

    return res.status(200).json(category);
  } catch (error) {
    console.error('Error updating asset category:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Category name must be unique.' });
    }
    return res.status(500).json({ message: 'Internal server error updating asset category.' });
  }
};

// Delete an asset category (Admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await AssetCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Asset category not found.' });
    }

    await category.destroy();
    return res.status(200).json({ message: 'Asset category deleted successfully.' });
  } catch (error) {
    console.error('Error deleting asset category:', error);
    return res.status(500).json({ message: 'Internal server error deleting asset category.' });
  }
};
