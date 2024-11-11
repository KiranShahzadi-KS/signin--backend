// controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register user
exports.register = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if email already exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert new user into the database
        const [result] = await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

        // Retrieve the inserted user details
        const [newUser] = await db.query('SELECT id, email, password FROM users WHERE id = ?', [result.insertId]);

        // Return the response with user details, including hashed password
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser[0].id,
                email: newUser[0].email,
                password: newUser[0].password 
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed due to server error' });
    }
};


// Login user
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
};
