// =====================================================
// Database Connection Module
// Uses mysql2 with promise-based API for async/await
// Connection pooling for better performance
// =====================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool (reuses connections efficiently)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,       // Max 10 simultaneous connections
    queueLimit: 0              // Unlimited queue
});

// Test connection on startup
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Database connected successfully!');
        connection.release();  // Release back to pool
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);       // Exit if DB not available
    }
}

module.exports = { pool, testConnection };
