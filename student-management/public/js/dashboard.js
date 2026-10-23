// =====================================================
// Dashboard JavaScript
// Demonstrates: API Calls (GET, POST, PUT, DELETE),
//   LocalStorage, Event Listeners, DOM Manipulation,
//   Async/Await, Error Handling, Dynamic UI Updates
// =====================================================

document.addEventListener('DOMContentLoaded', () => {

    // -----------------------------------------------
    // LOCAL STORAGE: Auth Check
    // Redirect to login if no session exists
    // -----------------------------------------------
    const currentUser = JSON.parse(localStorage.getItem('sms_currentUser'));
    if (!currentUser) {
        window.location.href = '/';
        return;
    }

    // Set user info in sidebar
    document.getElementById('userName').textContent = currentUser.username;
    document.getElementById('userRole').textContent = currentUser.role;
    document.getElementById('userAvatar').textContent = currentUser.username.charAt(0).toUpperCase();

    // -----------------------------------------------
    // ROLE-BASED ACCESS CONTROL
    // Admin: Full access (Add, Edit, Delete students)
    // Teacher: View students, Stats, AI Chat (no delete)
    // Student: View students, AI Chat only (read-only)
    // -----------------------------------------------
    const isAdmin = currentUser.role === 'admin';
    const isTeacher = currentUser.role === 'teacher';
    const isStudent = currentUser.role === 'student';

    // Hide "Add Student" nav for students
    if (isStudent) {
        document.getElementById('navAdd').style.display = 'none';
    }

    // Show role badge in sidebar
    const roleBadgeColors = { admin: '#ff6b9d', teacher: '#ffa726', student: '#00d4aa' };
    document.getElementById('userRole').style.color = roleBadgeColors[currentUser.role] || '#9898b0';

    // -----------------------------------------------
    // NAVIGATION: Section switching using event delegation
    // EVENT: click on nav links
    // -----------------------------------------------
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section-panel');
    const pageTitle = document.getElementById('pageTitle');

    const sectionTitles = {
        students: 'Students',
        addStudent: 'Add Student',
        statistics: 'Statistics',
        aiChat: 'AI Assistant',
        apiInfo: 'API Reference'
    };

    navLinks.forEach(link => {
        // EVENT: click - switches between dashboard sections
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = link.dataset.section;

            // Remove active from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Activate clicked section
            link.classList.add('active');
            const target = document.getElementById('section' + sectionName.charAt(0).toUpperCase() + sectionName.slice(1));
            if (target) target.classList.add('active');

            pageTitle.textContent = sectionTitles[sectionName] || 'Dashboard';

            // Load data for the section
            if (sectionName === 'students') loadStudents();
            if (sectionName === 'statistics') loadStats();
        });
    });

    // -----------------------------------------------
    // EVENT: click - Logout button
    // Clears localStorage and redirects to login
    // -----------------------------------------------
    document.getElementById('logoutBtn').addEventListener('click', () => {
        // LOCAL STORAGE: removeItem() - removes specific key
        localStorage.removeItem('sms_currentUser');
        localStorage.removeItem('sms_loginTime');
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = '/';
        }, 500);
    });

    // -----------------------------------------------
    // API CALL: GET /api/students
    // Fetches all students and displays in table
    // -----------------------------------------------
    async function loadStudents() {
        try {
            const department = document.getElementById('filterDepartment').value;
            const status = document.getElementById('filterStatus').value;
            const search = document.getElementById('searchInput').value;

            // Build query string from filters
            let url = '/api/students?';
            if (department) url += `department=${encodeURIComponent(department)}&`;
            if (status) url += `status=${status}&`;
            if (search) url += `search=${encodeURIComponent(search)}`;

            // API CALL: fetch() with GET method (default)
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                renderStudentsTable(data.data);
                updateStats(data.data);

                // LOCAL STORAGE: Cache last loaded data
                localStorage.setItem('sms_cachedStudents', JSON.stringify(data.data));
                localStorage.setItem('sms_lastFetch', new Date().toISOString());
            }
        } catch (error) {
            console.error('Load students error:', error);
            // LOCAL STORAGE: Load cached data if API fails
            const cached = localStorage.getItem('sms_cachedStudents');
            if (cached) {
                renderStudentsTable(JSON.parse(cached));
                showToast('Showing cached data (server unavailable)', 'info');
            }
        }
    }

    // -----------------------------------------------
    // DOM Manipulation: Render students table
    // Dynamically creates table rows from API data
    // -----------------------------------------------
    function renderStudentsTable(students) {
        const tbody = document.getElementById('studentsTableBody');
        tbody.innerHTML = ''; // Clear existing rows

        if (students.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">
                        No students found
                    </td>
                </tr>`;
            return;
        }

        students.forEach(student => {
            const tr = document.createElement('tr');
            // Role-based: Only admin sees Edit/Delete buttons
            const actionButtons = isAdmin
                ? `<button class="btn btn-warning btn-sm edit-btn" data-id="${student.id}" title="Edit">✏️</button>
                   <button class="btn btn-danger btn-sm delete-btn" data-id="${student.id}" title="Delete">🗑️</button>`
                : isTeacher
                ? `<button class="btn btn-warning btn-sm edit-btn" data-id="${student.id}" title="Edit">✏️</button>`
                : `<span style="color:var(--text-muted); font-size:12px;">View only</span>`;

            tr.innerHTML = `
                <td><strong>${student.roll_number}</strong></td>
                <td>${student.name}</td>
                <td>${student.department}</td>
                <td>${student.semester}</td>
                <td>${parseFloat(student.cgpa).toFixed(2)}</td>
                <td><span class="badge badge-${student.status}">${student.status}</span></td>
                <td>${actionButtons}</td>
            `;
            tbody.appendChild(tr);
        });

        // -----------------------------------------------
        // EVENT DELEGATION: Attach events to dynamic buttons
        // Instead of attaching to each button, we listen on parent
        // -----------------------------------------------
        attachTableEvents();
    }

    // -----------------------------------------------
    // Update stat cards from loaded data
    // -----------------------------------------------
    function updateStats(students) {
        document.getElementById('totalStudents').textContent = students.length;
        document.getElementById('activeStudents').textContent = students.filter(s => s.status === 'active').length;
        document.getElementById('graduatedStudents').textContent = students.filter(s => s.status === 'graduated').length;
        
        const avgCgpa = students.length > 0
            ? (students.reduce((sum, s) => sum + parseFloat(s.cgpa), 0) / students.length).toFixed(2)
            : '0.00';
        document.getElementById('avgCGPA').textContent = avgCgpa;
    }

    // -----------------------------------------------
    // EVENT: click on Edit/Delete buttons (dynamic)
    // -----------------------------------------------
    function attachTableEvents() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                
                // API CALL: GET /api/students/:id
                const response = await fetch(`/api/students/${id}`);
                const data = await response.json();
                
                if (data.success) {
                    openEditModal(data.data);
                }
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                
                if (!confirm('Are you sure you want to delete this student?')) return;

                try {
                    // API CALL: DELETE /api/students/:id
                    const response = await fetch(`/api/students/${id}`, {
                        method: 'DELETE'
                    });
                    const data = await response.json();

                    if (data.success) {
                        showToast('Student deleted successfully', 'success');
                        loadStudents(); // Refresh table
                    } else {
                        showToast(data.message, 'error');
                    }
                } catch (error) {
                    showToast('Delete failed', 'error');
                }
            });
        });
    }

    // -----------------------------------------------
    // Edit Modal - Open/Close Events
    // -----------------------------------------------
    function openEditModal(student) {
        document.getElementById('editId').value = student.id;
        document.getElementById('editName').value = student.name;
        document.getElementById('editEmail').value = student.email;
        document.getElementById('editDept').value = student.department;
        document.getElementById('editSemester').value = student.semester;
        document.getElementById('editCGPA').value = student.cgpa;
        document.getElementById('editStatus').value = student.status;
        document.getElementById('editModal').classList.add('show');
    }

    // EVENT: click - Close modal
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('editModal').classList.remove('show');
    });

    document.getElementById('cancelEdit').addEventListener('click', () => {
        document.getElementById('editModal').classList.remove('show');
    });

    // EVENT: submit - Edit form
    document.getElementById('editStudentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editId').value;

        try {
            // API CALL: PUT /api/students/:id
            const response = await fetch(`/api/students/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: document.getElementById('editName').value,
                    email: document.getElementById('editEmail').value,
                    department: document.getElementById('editDept').value,
                    semester: parseInt(document.getElementById('editSemester').value),
                    cgpa: parseFloat(document.getElementById('editCGPA').value),
                    status: document.getElementById('editStatus').value
                })
            });

            const data = await response.json();

            if (data.success) {
                showToast('Student updated successfully', 'success');
                document.getElementById('editModal').classList.remove('show');
                loadStudents();
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            showToast('Update failed', 'error');
        }
    });

    // -----------------------------------------------
    // EVENT: submit - Add Student Form with Validation
    // -----------------------------------------------
    document.getElementById('addStudentForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Form validation
        let isValid = true;
        const rollNo = document.getElementById('addRollNo').value.trim();
        const name = document.getElementById('addName').value.trim();
        const email = document.getElementById('addEmail').value.trim();
        const dept = document.getElementById('addDept').value;
        const semester = document.getElementById('addSemester').value;

        if (!rollNo) {
            document.getElementById('rollNoError').classList.add('show');
            document.getElementById('addRollNo').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('rollNoError').classList.remove('show');
            document.getElementById('addRollNo').classList.remove('error');
        }

        if (!name) {
            document.getElementById('nameError').classList.add('show');
            document.getElementById('addName').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('nameError').classList.remove('show');
            document.getElementById('addName').classList.remove('error');
        }

        // Email validation using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            document.getElementById('emailError').classList.add('show');
            document.getElementById('addEmail').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('emailError').classList.remove('show');
            document.getElementById('addEmail').classList.remove('error');
        }

        if (!dept) {
            document.getElementById('deptError').classList.add('show');
            isValid = false;
        } else {
            document.getElementById('deptError').classList.remove('show');
        }

        if (!semester || semester < 1 || semester > 8) {
            document.getElementById('semError').classList.add('show');
            document.getElementById('addSemester').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('semError').classList.remove('show');
            document.getElementById('addSemester').classList.remove('error');
        }

        if (!isValid) return;

        try {
            // API CALL: POST /api/students
            const response = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roll_number: rollNo,
                    name: name,
                    email: email,
                    department: dept,
                    semester: parseInt(semester),
                    cgpa: parseFloat(document.getElementById('addCGPA').value) || 0,
                    phone: document.getElementById('addPhone').value
                })
            });

            const data = await response.json();

            if (data.success) {
                showToast('Student added successfully!', 'success');
                document.getElementById('addStudentForm').reset();
                // Switch to students view
                document.querySelector('[data-section="students"]').click();
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            showToast('Failed to add student', 'error');
        }
    });

    // -----------------------------------------------
    // EVENT: click - Add Student button (navigation)
    // -----------------------------------------------
    document.getElementById('addStudentBtn').addEventListener('click', () => {
        document.querySelector('[data-section="addStudent"]').click();
    });

    // -----------------------------------------------
    // EVENT: change - Filters
    // -----------------------------------------------
    document.getElementById('filterDepartment').addEventListener('change', loadStudents);
    document.getElementById('filterStatus').addEventListener('change', loadStudents);

    // EVENT: input - Search (with debounce)
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(loadStudents, 300); // Wait 300ms after typing stops
    });

    // EVENT: click - Refresh
    document.getElementById('refreshBtn').addEventListener('click', () => {
        showToast('Data refreshed!', 'info');
        loadStudents();
    });

    // -----------------------------------------------
    // EVENT: click - Export Data to JSON (LocalStorage)
    // -----------------------------------------------
    document.getElementById('exportBtn').addEventListener('click', () => {
        const cached = localStorage.getItem('sms_cachedStudents');
        if (cached) {
            const blob = new Blob([cached], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'students_export.json';
            a.click();
            URL.revokeObjectURL(url);
            showToast('Data exported as JSON!', 'success');
        } else {
            showToast('No data to export. Load students first.', 'error');
        }
    });

    // -----------------------------------------------
    // API CALL: GET /api/students/stats/summary
    // Loads department-wise statistics
    // -----------------------------------------------
    async function loadStats() {
        try {
            const response = await fetch('/api/students/stats/summary');
            const data = await response.json();

            if (data.success) {
                const tbody = document.getElementById('statsTableBody');
                tbody.innerHTML = '';

                data.data.forEach(stat => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>${stat.department}</strong></td>
                        <td>${stat.total_students}</td>
                        <td>${stat.active_count}</td>
                        <td>${stat.avg_cgpa}</td>
                        <td>${parseFloat(stat.highest_cgpa).toFixed(2)}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        } catch (error) {
            showToast('Failed to load statistics', 'error');
        }
    }

    document.getElementById('refreshStatsBtn').addEventListener('click', loadStats);

    // -----------------------------------------------
    // AI CHAT: POST /api/ai/chat
    // Sends question to Groq AI and displays response
    // -----------------------------------------------
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');

    // EVENT: click - Send Chat
    document.getElementById('sendChatBtn').addEventListener('click', sendChat);

    // EVENT: keydown - Enter to send
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendChat();
    });

    async function sendChat() {
        const question = chatInput.value.trim();
        if (!question) return;

        // Add user message to chat
        addChatMessage(question, 'user');
        chatInput.value = '';

        // Show loading
        const loadingId = 'loading-' + Date.now();
        chatMessages.insertAdjacentHTML('beforeend',
            `<div class="chat-message ai" id="${loadingId}"><span class="spinner"></span> Thinking...</div>`
        );
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // API CALL: POST /api/ai/chat
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question,
                    userId: currentUser.id
                })
            });

            const data = await response.json();
            
            // Remove loading message
            document.getElementById(loadingId)?.remove();

            if (data.success) {
                addChatMessage(data.data.answer, 'ai');
                // LOCAL STORAGE: Save chat history locally
                saveChatToLocalStorage(question, data.data.answer);
            } else {
                addChatMessage('❌ ' + data.message, 'ai');
            }
        } catch (error) {
            document.getElementById(loadingId)?.remove();
            addChatMessage('❌ Connection error. Is the server running?', 'ai');
        }
    }

    function addChatMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `chat-message ${sender}`;
        div.textContent = text;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // LOCAL STORAGE: Save chat history
    function saveChatToLocalStorage(question, answer) {
        const history = JSON.parse(localStorage.getItem('sms_chatHistory') || '[]');
        history.push({ question, answer, time: new Date().toISOString() });
        // Keep last 50 chats only
        if (history.length > 50) history.shift();
        localStorage.setItem('sms_chatHistory', JSON.stringify(history));
    }

    // EVENT: click - Clear Chat
    document.getElementById('clearChatBtn').addEventListener('click', () => {
        chatMessages.innerHTML = `
            <div class="chat-message ai">
                👋 Chat cleared! Ask me anything.
            </div>`;
        localStorage.removeItem('sms_chatHistory');
        showToast('Chat history cleared', 'info');
    });

    // -----------------------------------------------
    // EVENT: click - Test Public API
    // Demonstrates GET API call and displays response
    // -----------------------------------------------
    document.getElementById('testApiBtn').addEventListener('click', async () => {
        try {
            // API CALL: GET /api/public/info
            const response = await fetch('/api/public/info');
            const data = await response.json();

            document.getElementById('apiResponse').textContent = JSON.stringify(data, null, 2);
            showToast('API call successful!', 'success');
        } catch (error) {
            document.getElementById('apiResponse').textContent = 'Error: ' + error.message;
            showToast('API call failed', 'error');
        }
    });

    // -----------------------------------------------
    // Toast Notification Helper
    // -----------------------------------------------
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // -----------------------------------------------
    // Initial Data Load
    // -----------------------------------------------
    loadStudents();
});
