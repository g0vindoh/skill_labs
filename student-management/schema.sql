-- =====================================================
-- Student Management System - Database Schema
-- Database Name: student_management
-- =====================================================
-- INSTRUCTIONS:
-- 1. Open MySQL Workbench
-- 2. Create a new query tab
-- 3. Copy-paste this ENTIRE file
-- 4. Click the lightning bolt (Execute) button
-- =====================================================

CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

-- Users table for login/authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table for main CRUD operations
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roll_number VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    cgpa DECIMAL(3,2) DEFAULT 0.00,
    phone VARCHAR(15),
    address TEXT,
    status ENUM('active', 'inactive', 'graduated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- AI Chat History table
CREATE TABLE IF NOT EXISTS ai_chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default admin user (password: admin123)
-- bcrypt hash of 'admin123'
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@college.edu', '$2a$10$musFDUNGsAeLmi5pBF6QzeUIVIuL8kKY1wAoYFnltX1X5Cyre4pBG', 'admin');

-- Insert sample student data
INSERT INTO students (roll_number, name, email, department, semester, cgpa, phone, status) VALUES
('CS2024001', 'Aarav Sharma', 'aarav@college.edu', 'Computer Science', 5, 8.75, '9876543210', 'active'),
('CS2024002', 'Priya Patel', 'priya@college.edu', 'Computer Science', 5, 9.20, '9876543211', 'active'),
('EC2024001', 'Rahul Kumar', 'rahul@college.edu', 'Electronics', 3, 7.80, '9876543212', 'active'),
('ME2024001', 'Sneha Gupta', 'sneha@college.edu', 'Mechanical', 7, 8.50, '9876543213', 'active'),
('CE2024001', 'Vikram Singh', 'vikram@college.edu', 'Civil', 3, 7.20, '9876543214', 'active'),
('CS2024003', 'Ananya Reddy', 'ananya@college.edu', 'Computer Science', 7, 9.50, '9876543215', 'graduated'),
('EC2024002', 'Karthik Nair', 'karthik@college.edu', 'Electronics', 5, 8.10, '9876543216', 'active'),
('IT2024001', 'Divya Joshi', 'divya@college.edu', 'Information Technology', 3, 8.90, '9876543217', 'active'),
('ME2024002', 'Arjun Mehta', 'arjun@college.edu', 'Mechanical', 5, 6.80, '9876543218', 'inactive'),
('CS2024004', 'Neha Verma', 'neha@college.edu', 'Computer Science', 1, 0.00, '9876543219', 'active');
