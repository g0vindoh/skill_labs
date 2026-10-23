# 🎓 Student Management System

A full-stack College Student Management Portal built with **Node.js**, **Express**, **MySQL**, and **Groq AI (LLaMA 3.3)**.

## ✨ Features

- 🔐 **Authentication & Authorization**:
  - Secure password hashing using `bcryptjs`
  - Multi-role support: **Admin** (Full CRUD), **Teacher** (Edit & View), **Student** (Read-Only)
  - Real-time client-side and server-side form validation
  - Persistent login & remember-me using browser `localStorage`
- 📋 **Student Record Management (CRUD)**:
  - Add, View, Edit, and Delete student records
  - Search by Name, Roll Number, or Email with debounce
  - Filter by Department and Status (Active, Inactive, Graduated)
  - Export student data to JSON
- 📊 **Department Statistics**:
  - Real-time dynamic aggregation queries for average CGPA, student counts, and top performers
- 🤖 **AI Academic Assistant**:
  - Integrated with Groq AI API (`llama-3.3-70b-versatile`)
  - Fast answers to academic & course questions
  - Stores chat history in MySQL and cached locally in `localStorage`
- 🔌 **RESTful API**:
  - Structured endpoints with proper HTTP status codes and error handling

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL (Connection pooling with `mysql2/promise`)
- **AI Integration**: Groq SDK (`llama-3.3-70b-versatile`)
- **Frontend**: Vanilla HTML5, Modern CSS (Glassmorphism, Dark Theme, CSS Variables), Vanilla JavaScript (Fetch API, DOM Events, LocalStorage)

---

## 🚀 Quick Setup Guide

### 1. Database Setup
1. Open **MySQL Workbench** or MySQL CLI.
2. Run the SQL script located in `student-management/schema.sql` to create database `student_management` and initial tables.

### 2. Environment Variables
Create a `.env` file in the `student-management` folder (or copy `.env.example`):
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=student_management
GROQ_API_KEY=your_groq_api_key
PORT=3000
```

### 3. Installation & Run
```bash
cd student-management
npm install
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Default Credentials
- **Admin**: `admin` / `admin123`
- Or use the **Register** tab to create a new Student/Teacher account!
