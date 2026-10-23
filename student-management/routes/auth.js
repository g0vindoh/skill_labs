// =====================================================
// Authentication Routes
// Handles: POST /api/auth/login, POST /api/auth/register
// Methods: POST (creates/validates resources)
// =====================================================

const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');

const router = express.Router();

// -----------------------------------------------
// POST /api/auth/login
// Method: POST - used because we're sending sensitive
// credentials (password) in the request body
// -----------------------------------------------
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Server-side validation (defense in depth)
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Query database for user - parameterized query prevents SQL injection
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        // Check if user exists
        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const user = rows[0];

        // Compare hashed password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Success - return user data (excluding password)
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// -----------------------------------------------
// POST /api/auth/register
// Method: POST - creates a new user resource
// -----------------------------------------------
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Hash the password with salt rounds = 10
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into database
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role || 'student']
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: result.insertId
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Username or email already exists'
            });
        }
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
