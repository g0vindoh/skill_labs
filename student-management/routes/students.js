// =====================================================
// Student CRUD Routes (RESTful API)
// Demonstrates all HTTP methods:
//   GET    /api/students      - Read all students
//   GET    /api/students/:id  - Read one student
//   POST   /api/students      - Create a student
//   PUT    /api/students/:id  - Update a student
//   DELETE /api/students/:id  - Delete a student
//   GET    /api/students/stats/summary - Aggregation query
// =====================================================

const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// -----------------------------------------------
// GET /api/students
// Method: GET - retrieves a list of resources
// Supports query params: ?department=CS&status=active
// -----------------------------------------------
router.get('/', async (req, res) => {
    try {
        const { department, status, search } = req.query;

        let query = 'SELECT * FROM students WHERE 1=1';
        const params = [];

        // Dynamic filtering using query parameters
        if (department) {
            query += ' AND department = ?';
            params.push(department);
        }
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        if (search) {
            query += ' AND (name LIKE ? OR roll_number LIKE ? OR email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await pool.execute(query, params);

        res.json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// -----------------------------------------------
// GET /api/students/stats/summary
// Aggregation query - department-wise statistics
// -----------------------------------------------
router.get('/stats/summary', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                department,
                COUNT(*) as total_students,
                ROUND(AVG(cgpa), 2) as avg_cgpa,
                MAX(cgpa) as highest_cgpa,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
            FROM students 
            GROUP BY department
            ORDER BY department
        `);

        res.json({ success: true, data: rows });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// -----------------------------------------------
// GET /api/students/:id
// Method: GET with URL parameter
// Retrieves a single resource by its ID
// -----------------------------------------------
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM students WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({ success: true, data: rows[0] });

    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// -----------------------------------------------
// POST /api/students
// Method: POST - creates a new resource
// Request body contains the new student data
// -----------------------------------------------
router.post('/', async (req, res) => {
    try {
        const { roll_number, name, email, department, semester, cgpa, phone, address } = req.body;

        // Server-side validation
        if (!roll_number || !name || !email || !department || !semester) {
            return res.status(400).json({
                success: false,
                message: 'Required fields: roll_number, name, email, department, semester'
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO students (roll_number, name, email, department, semester, cgpa, phone, address) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [roll_number, name, email, department, semester, cgpa || 0, phone || null, address || null]
        );

        res.status(201).json({
            success: true,
            message: 'Student added successfully',
            studentId: result.insertId
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Roll number already exists'
            });
        }
        console.error('Add student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// -----------------------------------------------
// PUT /api/students/:id
// Method: PUT - updates an existing resource
// Replaces the resource with the data in request body
// -----------------------------------------------
router.put('/:id', async (req, res) => {
    try {
        const { name, email, department, semester, cgpa, phone, address, status } = req.body;

        const [result] = await pool.execute(
            `UPDATE students SET 
                name = COALESCE(?, name),
                email = COALESCE(?, email),
                department = COALESCE(?, department),
                semester = COALESCE(?, semester),
                cgpa = COALESCE(?, cgpa),
                phone = COALESCE(?, phone),
                address = COALESCE(?, address),
                status = COALESCE(?, status)
             WHERE id = ?`,
            [name, email, department, semester, cgpa, phone, address, status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            message: 'Student updated successfully'
        });

    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// -----------------------------------------------
// DELETE /api/students/:id
// Method: DELETE - removes a resource
// -----------------------------------------------
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.execute(
            'DELETE FROM students WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });

    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
