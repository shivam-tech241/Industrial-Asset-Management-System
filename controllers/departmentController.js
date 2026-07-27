const { Department } = require('../models');

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll();
    return res.status(200).json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return res.status(500).json({ message: 'Internal server error fetching departments.' });
  }
};

// Create a department (Admin only)
exports.createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Department name is required.' });
    }
    const newDepartment = await Department.create({ name });
    return res.status(201).json(newDepartment);
  } catch (error) {
    console.error('Error creating department:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Department name must be unique.' });
    }
    return res.status(500).json({ message: 'Internal server error creating department.' });
  }
};

// Update a department (Admin only)
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Department name is required.' });
    }

    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    department.name = name;
    await department.save();

    return res.status(200).json(department);
  } catch (error) {
    console.error('Error updating department:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Department name must be unique.' });
    }
    return res.status(500).json({ message: 'Internal server error updating department.' });
  }
};

// Delete a department (Admin only)
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    await department.destroy();
    return res.status(200).json({ message: 'Department deleted successfully.' });
  } catch (error) {
    console.error('Error deleting department:', error);
    return res.status(500).json({ message: 'Internal server error deleting department.' });
  }
};
