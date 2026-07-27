const { Section, Department } = require('../models');

// Get all sections (support filtering by department_id)
exports.getAllSections = async (req, res) => {
  try {
    const { department_id } = req.query;
    const whereClause = {};
    if (department_id) {
      whereClause.department_id = department_id;
    }

    const sections = await Section.findAll({
      where: whereClause,
      include: [{ model: Department, attributes: ['name'] }]
    });

    return res.status(200).json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return res.status(500).json({ message: 'Internal server error fetching sections.' });
  }
};

// Create a section (Admin only)
exports.createSection = async (req, res) => {
  try {
    const { name, department_id } = req.body;
    if (!name || !department_id) {
      return res.status(400).json({ message: 'Section name and department_id are required.' });
    }

    // Verify department exists
    const department = await Department.findByPk(department_id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    const newSection = await Section.create({ name, department_id });
    return res.status(201).json(newSection);
  } catch (error) {
    console.error('Error creating section:', error);
    return res.status(500).json({ message: 'Internal server error creating section.' });
  }
};

// Update a section (Admin only)
exports.updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department_id } = req.body;

    const section = await Section.findByPk(id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found.' });
    }

    if (department_id) {
      // Verify department exists
      const department = await Department.findByPk(department_id);
      if (!department) {
        return res.status(404).json({ message: 'Department not found.' });
      }
      section.department_id = department_id;
    }

    if (name) {
      section.name = name;
    }

    await section.save();
    return res.status(200).json(section);
  } catch (error) {
    console.error('Error updating section:', error);
    return res.status(500).json({ message: 'Internal server error updating section.' });
  }
};

// Delete a section (Admin only)
exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findByPk(id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found.' });
    }

    await section.destroy();
    return res.status(200).json({ message: 'Section deleted successfully.' });
  } catch (error) {
    console.error('Error deleting section:', error);
    return res.status(500).json({ message: 'Internal server error deleting section.' });
  }
};
