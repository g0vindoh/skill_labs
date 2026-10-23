// =====================================================
// Login & Register Page JavaScript
// Demonstrates: Form Validation, Event Listeners,
//               LocalStorage, API Calls (POST), 
//               DOM Manipulation, Tab Switching
// =====================================================

document.addEventListener('DOMContentLoaded', () => {

    // DOM Element References - Login
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    const loginBtn = document.getElementById('loginBtn');
    const rememberMe = document.getElementById('rememberMe');
    const lsStatus = document.getElementById('lsStatus');

    // DOM Element References - Register
    const regUsername = document.getElementById('regUsername');
    const regEmail = document.getElementById('regEmail');
    const regPassword = document.getElementById('regPassword');
    const regConfirmPassword = document.getElementById('regConfirmPassword');
    const regRole = document.getElementById('regRole');

    // Tab buttons
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');

    // -----------------------------------------------
    // EVENT: click - Tab switching (Login / Register)
    // Toggles visibility of forms
    // -----------------------------------------------
    tabLogin.addEventListener('click', () => {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabLogin.style.background = 'var(--accent-primary)';
        tabLogin.style.color = 'white';
        tabRegister.style.background = 'var(--bg-glass)';
        tabRegister.style.color = 'var(--text-secondary)';
    });

    tabRegister.addEventListener('click', () => {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabRegister.style.background = 'var(--accent-primary)';
        tabRegister.style.color = 'white';
        tabLogin.style.background = 'var(--bg-glass)';
        tabLogin.style.color = 'var(--text-secondary)';
    });

    // -----------------------------------------------
    // LOCAL STORAGE: Check for saved credentials
    // -----------------------------------------------
    function checkLocalStorage() {
        try {
            const savedUser = localStorage.getItem('sms_username');
            const savedRemember = localStorage.getItem('sms_remember');

            if (savedUser && savedRemember === 'true') {
                usernameInput.value = savedUser;
                rememberMe.checked = true;
            }

            const currentUser = localStorage.getItem('sms_currentUser');
            if (currentUser) {
                window.location.href = '/dashboard';
                return;
            }

            lsStatus.textContent = 'LocalStorage: Active ✓';
        } catch (e) {
            lsStatus.textContent = 'LocalStorage: Not available';
        }
    }

    checkLocalStorage();

    // -----------------------------------------------
    // LOGIN FORM VALIDATION
    // -----------------------------------------------
    function validateLoginForm() {
        let isValid = true;

        const username = usernameInput.value.trim();
        if (!username) {
            usernameInput.classList.add('error');
            usernameError.textContent = 'Username is required';
            usernameError.classList.add('show');
            isValid = false;
        } else if (username.length < 3) {
            usernameInput.classList.add('error');
            usernameError.textContent = 'Username must be at least 3 characters';
            usernameError.classList.add('show');
            isValid = false;
        } else {
            usernameInput.classList.remove('error');
            usernameError.classList.remove('show');
        }

        const password = passwordInput.value;
        if (!password) {
            passwordInput.classList.add('error');
            passwordError.textContent = 'Password is required';
            passwordError.classList.add('show');
            isValid = false;
        } else if (password.length < 5) {
            passwordInput.classList.add('error');
            passwordError.textContent = 'Password must be at least 5 characters';
            passwordError.classList.add('show');
            isValid = false;
        } else {
            passwordInput.classList.remove('error');
            passwordError.classList.remove('show');
        }

        return isValid;
    }

    // -----------------------------------------------
    // REGISTER FORM VALIDATION
    // -----------------------------------------------
    function validateRegisterForm() {
        let isValid = true;

        // Username validation
        if (!regUsername.value.trim() || regUsername.value.trim().length < 3) {
            document.getElementById('regUsernameError').classList.add('show');
            regUsername.classList.add('error');
            isValid = false;
        } else {
            document.getElementById('regUsernameError').classList.remove('show');
            regUsername.classList.remove('error');
        }

        // Email validation using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regEmail.value.trim() || !emailRegex.test(regEmail.value.trim())) {
            document.getElementById('regEmailError').classList.add('show');
            regEmail.classList.add('error');
            isValid = false;
        } else {
            document.getElementById('regEmailError').classList.remove('show');
            regEmail.classList.remove('error');
        }

        // Password validation
        if (!regPassword.value || regPassword.value.length < 6) {
            document.getElementById('regPasswordError').classList.add('show');
            regPassword.classList.add('error');
            isValid = false;
        } else {
            document.getElementById('regPasswordError').classList.remove('show');
            regPassword.classList.remove('error');
        }

        // Confirm password match
        if (regPassword.value !== regConfirmPassword.value) {
            document.getElementById('regConfirmError').classList.add('show');
            regConfirmPassword.classList.add('error');
            isValid = false;
        } else {
            document.getElementById('regConfirmError').classList.remove('show');
            regConfirmPassword.classList.remove('error');
        }

        return isValid;
    }

    // -----------------------------------------------
    // EVENT: input - Real-time validation (clear errors)
    // -----------------------------------------------
    usernameInput.addEventListener('input', () => {
        if (usernameInput.value.trim().length >= 3) {
            usernameInput.classList.remove('error');
            usernameError.classList.remove('show');
        }
    });

    passwordInput.addEventListener('input', () => {
        if (passwordInput.value.length >= 5) {
            passwordInput.classList.remove('error');
            passwordError.classList.remove('show');
        }
    });

    // -----------------------------------------------
    // EVENT: submit - Login Form
    // API CALL: POST /api/auth/login
    // -----------------------------------------------
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateLoginForm()) return;

        loginBtn.innerHTML = '<span class="spinner"></span> Logging in...';
        loginBtn.disabled = true;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: usernameInput.value.trim(),
                    password: passwordInput.value
                })
            });

            const data = await response.json();

            if (data.success) {
                // LOCAL STORAGE: Save user session with role info
                localStorage.setItem('sms_currentUser', JSON.stringify(data.user));
                localStorage.setItem('sms_loginTime', new Date().toISOString());

                if (rememberMe.checked) {
                    localStorage.setItem('sms_username', usernameInput.value.trim());
                    localStorage.setItem('sms_remember', 'true');
                } else {
                    localStorage.removeItem('sms_username');
                    localStorage.removeItem('sms_remember');
                }

                loginBtn.innerHTML = '✓ Success! Redirecting...';
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 800);

            } else {
                loginBtn.innerHTML = 'Login';
                loginBtn.disabled = false;
                showToast(data.message, 'error');
            }

        } catch (error) {
            console.error('Login error:', error);
            loginBtn.innerHTML = 'Login';
            loginBtn.disabled = false;
            showToast('Connection failed. Is the server running?', 'error');
        }
    });

    // -----------------------------------------------
    // EVENT: submit - Register Form
    // API CALL: POST /api/auth/register
    // Creates a new user account in the database
    // -----------------------------------------------
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateRegisterForm()) return;

        const registerBtn = document.getElementById('registerBtn');
        registerBtn.innerHTML = '<span class="spinner"></span> Creating account...';
        registerBtn.disabled = true;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: regUsername.value.trim(),
                    email: regEmail.value.trim(),
                    password: regPassword.value,
                    role: regRole.value
                })
            });

            const data = await response.json();

            if (data.success) {
                showToast('Account created! You can now login.', 'success');
                registerBtn.innerHTML = '✓ Account Created!';

                // Switch to login tab after 1 second
                setTimeout(() => {
                    tabLogin.click();
                    // Pre-fill the username
                    usernameInput.value = regUsername.value.trim();
                    registerForm.reset();
                    registerBtn.innerHTML = 'Create Account';
                    registerBtn.disabled = false;
                }, 1200);

            } else {
                registerBtn.innerHTML = 'Create Account';
                registerBtn.disabled = false;
                showToast(data.message, 'error');
            }

        } catch (error) {
            console.error('Register error:', error);
            registerBtn.innerHTML = 'Create Account';
            registerBtn.disabled = false;
            showToast('Connection failed. Is the server running?', 'error');
        }
    });

    // -----------------------------------------------
    // Toast Notification Function
    // -----------------------------------------------
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
});
