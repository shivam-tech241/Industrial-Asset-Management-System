const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role, Department } = require('../models');

// Helper to validate email format
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role_id, department_id } = req.body;

    // Validate inputs
    if (!name || !email || !password || !role_id || !department_id) {
      return res.status(400).json({ message: 'All fields (name, email, password, role_id, department_id) are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Verify role exists
    const role = await Role.findByPk(role_id);
    if (!role) {
      return res.status(400).json({ message: 'Invalid role_id. Role does not exist.' });
    }

    // Verify department exists
    const department = await Department.findByPk(department_id);
    if (!department) {
      return res.status(400).json({ message: 'Invalid department_id. Department does not exist.' });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await User.create({
      name,
      email,
      password_hash: passwordHash,
      role_id,
      department_id
    });

    // Convert to JSON and remove password hash
    const userResponse = newUser.toJSON();
    delete userResponse.password_hash;

    return res.status(201).json({
      message: 'User registered successfully.',
      user: userResponse
    });
  } catch (error) {
    console.error('Error in user registration:', error);
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find the user and include their Role
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, attributes: ['role_name'] }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT
    const payload = {
      id: user.id,
      role: user.Role ? user.Role.role_name : null,
      department_id: user.department_id
    };

    const tokenSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';
    const token = jwt.sign(payload, tokenSecret, { expiresIn: '1d' });

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.Role ? user.Role.role_name : null,
        department_id: user.department_id
      }
    });
  } catch (error) {
    console.error('Error in user login:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
};
