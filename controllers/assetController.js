const { Asset, AssetCategory, Department, Section } = require('../models');

// Get all assets
exports.getAllAssets = async (req, res) => {
  try {
    const { department_id, section_id, status } = req.query;
    const whereClause = {};

    if (department_id) {
      whereClause.department_id = department_id;
    }
    if (section_id) {
      whereClause.section_id = section_id;
    }
    if (status) {
      whereClause.status = status;
    }

    const assets = await Asset.findAll({
      where: whereClause,
      include: [
        { model: AssetCategory, attributes: ['name'] },
        { model: Department, attributes: ['name'] },
        { model: Section, attributes: ['name'] }
      ]
    });

    return res.status(200).json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return res.status(500).json({ message: 'Internal server error fetching assets.' });
  }
};

// Get asset by ID
exports.getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findByPk(id, {
      include: [
        { model: AssetCategory, attributes: ['name'] },
        { model: Department, attributes: ['name'] },
        { model: Section, attributes: ['name'] }
      ]
    });

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found.' });
    }

    return res.status(200).json(asset);
  } catch (error) {
    console.error('Error fetching asset by ID:', error);
    return res.status(500).json({ message: 'Internal server error fetching asset details.' });
  }
};

// Create an asset (Admin and Technician only)
exports.createAsset = async (req, res) => {
  try {
    const {
      asset_tag,
      name,
      category_id,
      department_id,
      section_id,
      status,
      purchase_date,
      cost,
      vendor,
      warranty_expiry
    } = req.body;

    // Validate inputs
    if (!asset_tag || !name || !category_id || !department_id || !section_id) {
      return res.status(400).json({ message: 'asset_tag, name, category_id, department_id, and section_id are required.' });
    }

    // Verify foreign keys exist
    const categoryExists = await AssetCategory.findByPk(category_id);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category_id. AssetCategory does not exist.' });
    }

    const departmentExists = await Department.findByPk(department_id);
    if (!departmentExists) {
      return res.status(400).json({ message: 'Invalid department_id. Department does not exist.' });
    }

    const sectionExists = await Section.findOne({ where: { id: section_id, department_id } });
    if (!sectionExists) {
      return res.status(400).json({ message: 'Invalid section_id. Section does not exist or does not belong to the specified Department.' });
    }

    // Validate status ENUM if provided
    const allowedStatuses = ['Active', 'Under Maintenance', 'Faulty', 'Retired'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` });
    }

    const newAsset = await Asset.create({
      asset_tag,
      name,
      category_id,
      department_id,
      section_id,
      status: status || 'Active',
      purchase_date,
      cost,
      vendor,
      warranty_expiry
    });

    return res.status(201).json(newAsset);
  } catch (error) {
    console.error('Error creating asset:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Asset tag must be unique.' });
    }
    return res.status(500).json({ message: 'Internal server error creating asset.' });
  }
};

// Update an asset (Admin and Technician only)
exports.updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      asset_tag,
      name,
      category_id,
      department_id,
      section_id,
      status,
      purchase_date,
      cost,
      vendor,
      warranty_expiry
    } = req.body;

    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found.' });
    }

    // Verify foreign keys if they are updated
    if (category_id) {
      const categoryExists = await AssetCategory.findByPk(category_id);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category_id.' });
      }
      asset.category_id = category_id;
    }

    const deptId = department_id || asset.department_id;
    const sectId = section_id || asset.section_id;

    if (department_id) {
      const departmentExists = await Department.findByPk(department_id);
      if (!departmentExists) {
        return res.status(400).json({ message: 'Invalid department_id.' });
      }
      asset.department_id = department_id;
    }

    if (section_id || department_id) {
      // Verify section belongs to the department
      const sectionExists = await Section.findOne({ where: { id: sectId, department_id: deptId } });
      if (!sectionExists) {
        return res.status(400).json({ message: 'Section does not exist or does not belong to the department.' });
      }
      asset.section_id = sectId;
    }

    // Validate status ENUM
    if (status) {
      const allowedStatuses = ['Active', 'Under Maintenance', 'Faulty', 'Retired'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` });
      }
      asset.status = status;
    }

    if (asset_tag) asset.asset_tag = asset_tag;
    if (name) asset.name = name;
    if (purchase_date !== undefined) asset.purchase_date = purchase_date;
    if (cost !== undefined) asset.cost = cost;
    if (vendor !== undefined) asset.vendor = vendor;
    if (warranty_expiry !== undefined) asset.warranty_expiry = warranty_expiry;

    await asset.save();
    return res.status(200).json(asset);
  } catch (error) {
    console.error('Error updating asset:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Asset tag must be unique.' });
    }
    return res.status(500).json({ message: 'Internal server error updating asset.' });
  }
};

// Delete an asset (Admin only)
exports.deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found.' });
    }

    await asset.destroy();
    return res.status(200).json({ message: 'Asset deleted successfully.' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return res.status(500).json({ message: 'Internal server error deleting asset.' });
  }
};
