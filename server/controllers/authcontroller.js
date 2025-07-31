const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose'); // Import Mongoose to check connection state

// Function to generate a JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
    // --- DEBUGGING LINE ---
    // Check the database connection state when the request comes in.
    // 1 means connected. 0 means disconnected.
    console.log('Mongoose Connection ReadyState:', mongoose.connection.readyState);

    try {
        const { name, email, password, role } = req.body;

        // 1. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Create new user (password will be hashed by the pre-save hook)
        const user = await User.create({ name, email, password, role });

        // 3. If user was created, send back user info and a token
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        // Also log the error to the console for more details
        console.error('Error in registerUser:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Authenticate a user (login)
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await User.findOne({ email });

        // 2. If user exists, compare provided password with stored hashed password
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error in loginUser:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
