// =====================================================
// Main Server File - Express.js Application
// Framework: Express.js (Node.js web framework)
// Middleware: cors, express.json, express.static
// =====================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./db');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const aiRoutes = require('./routes/ai');

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;

// -----------------------------------------------
// Middleware Setup
// Middleware = functions that execute during request lifecycle
// -----------------------------------------------

// CORS - allows cross-origin requests (for API calls from frontend)
app.use(cors());

// Parse JSON request bodies (for POST/PUT requests)
app.use(express.json());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Request logger middleware (custom) - logs every API call
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();  // Pass to next middleware
});

// -----------------------------------------------
// Route Mounting
// Each route module handles a specific resource
// -----------------------------------------------
app.use('/api/auth', authRoutes);       // Authentication routes
app.use('/api/students', studentRoutes); // Student CRUD routes
app.use('/api/ai', aiRoutes);           // AI integration routes

// -----------------------------------------------
// Public API endpoint - no auth required
// Demonstrates a simple GET API
// -----------------------------------------------
app.get('/api/public/info', (req, res) => {
    res.json({
        success: true,
        data: {
            name: 'Student Management System',
            version: '1.0.0',
            description: 'College project demonstrating Node.js, MySQL, and AI integration',
            endpoints: {
                auth: ['/api/auth/login', '/api/auth/register'],
                students: ['/api/students', '/api/students/:id', '/api/students/stats/summary'],
                ai: ['/api/ai/chat', '/api/ai/history/:userId'],
                public: ['/api/public/info']
            }
        }
    });
});

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// -----------------------------------------------
// Error handling middleware (must be last)
// -----------------------------------------------
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// -----------------------------------------------
// Start Server
// -----------------------------------------------
async function startServer() {
    await testConnection();  // Test DB before starting

    app.listen(PORT, () => {
        console.log(`\n🚀 Server running at http://localhost:${PORT}`);
        console.log(`📁 Frontend: http://localhost:${PORT}`);
        console.log(`📡 API Base: http://localhost:${PORT}/api`);
        console.log(`\n--- Server is ready! ---\n`);
    });
}

startServer();
