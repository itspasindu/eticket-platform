const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// HELPER: Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role: role }, // payload — data stored inside token
    process.env.JWT_SECRET,     // secret key — used to sign the token
    { expiresIn: '7d' }         // token expires in 7 days
  );
};

// REGISTER — POST /api/auth/register

const register = async (req, res) => {
  try {
    // 1. Get data from request body
    const { name, email, password, role } = req.body;

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // 3. Hash the password
    // bcrypt generates a "salt" (random string) and mixes it with password
    // The "10" is the salt rounds — higher = more secure but slower
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create the user in database
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // NEVER store plain password
      role: role || 'user',     // default to 'user' if not provided
    });

    // 5. Generate token for immediate login after register
    const token = generateToken(user._id, user.role);

    // 6. Send response
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// LOGIN — POST /api/auth/login

const login = async (req, res) => {
  try {
    // 1. Get data from request body
    const { email, password } = req.body;

    // 2. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. Compare password with hashed password in DB
    // bcrypt.compare() hashes the input and compares — returns true/false
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 4. Generate token
    const token = generateToken(user._id, user.role);

    // 5. Send response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET PROFILE — GET /api/auth/me

const getMe = async (req, res) => {
  try {
    // req.user is set by auth middleware (we'll build this next)
    const user = await User.findById(req.user.id).select('-password');
    // .select('-password') means return everything EXCEPT password

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login, getMe };