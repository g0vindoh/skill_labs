-- =====================================================
-- FIX: Update admin password hash
-- Run this in MySQL Workbench after the initial schema
-- =====================================================

USE student_management;

-- Update admin password to correct bcrypt hash for 'admin123'
UPDATE users 
SET password = '$2a$10$musFDUNGsAeLmi5pBF6QzeUIVIuL8kKY1wAoYFnltX1X5Cyre4pBG' 
WHERE username = 'admin';

-- Verify the update
SELECT id, username, email, role, created_at FROM users;
