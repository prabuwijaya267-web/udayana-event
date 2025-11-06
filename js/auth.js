// ===== AUTH.JS - Handle Login, Register, Session =====

// Base project path (sesuaikan jika folder project bukan /udayana-event)
const BASE_PATH = '/udayana-event';

// Check if user is logged in
function checkAuth(requiredRole = null) {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        // Not logged in, redirect to login if on protected folders
        const path = window.location.pathname.toLowerCase();
        if (path.includes('/user/') || path.includes('/admin/')) {
            window.location.href = `${BASE_PATH}/user/login.html`;
        }
        return false;
    }

    // Check role
    if (requiredRole && user.role !== requiredRole) {
        alert('Anda tidak memiliki akses ke halaman ini!');
        window.location.href = user.role === 'admin'
            ? `${BASE_PATH}/admin/dashboard.html`
            : `${BASE_PATH}/user/dashboard.html`;
        return false;
    }

    // Update UI with user info
    const userNameElements = document.querySelectorAll('#userName, #userNameDisplay');
    userNameElements.forEach(el => {
        if (el) el.textContent = user.username;
    });

    return true;
}

// Update navbar based on login status
function updateNavbar() {
    const user = JSON.parse(localStorage.getItem('user'));
    const navMenu = document.querySelector('.nav-menu');

    if (!navMenu) return;

    if (user) {
        // User is logged in - show user menu (use absolute links)
        const userMenuHTML = user.role === 'admin'
            ? `
                <a href="${BASE_PATH}/admin/dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                <div class="nav-user">
                    <i class="fas fa-user-circle"></i>
                    <span>${user.username}</span>
                    <div class="user-dropdown">
                        <a href="${BASE_PATH}/admin/dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                        <a href="${BASE_PATH}/admin/manage-events.html"><i class="fas fa-tasks"></i> Kelola Event</a>
                        <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                    </div>
                </div>
            `
            : `
                <a href="${BASE_PATH}/user/dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                <a href="${BASE_PATH}/user/my-events.html"><i class="fas fa-list"></i> Event Saya</a>
                <div class="nav-user">
                    <i class="fas fa-user-circle"></i>
                    <span>${user.username}</span>
                    <div class="user-dropdown">
                        <a href="${BASE_PATH}/user/dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                        <a href="${BASE_PATH}/user/my-events.html"><i class="fas fa-list"></i> Event Saya</a>
                        <a href="#" onclick="showCreateEventModal()"><i class="fas fa-plus"></i> Buat Event</a>
                        <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                    </div>
                </div>
            `;

        // Keep Home / Events / Tentang items if present, then append user menu
        const existingLinks = navMenu.querySelectorAll('a:not(.btn-login):not(.btn-register)');
        let homeEventsAboutHTML = '';
        existingLinks.forEach(link => {
            const text = link.textContent.trim().toLowerCase();
            if (text.includes('home') || text.includes('events') || text.includes('tentang') || text.includes('udayana event')) {
                homeEventsAboutHTML += link.outerHTML;
            }
        });

        navMenu.innerHTML = homeEventsAboutHTML + userMenuHTML;

        // Setup logout handler after DOM update
        setupLogoutHandler();
    } else {
        // If not logged in, do nothing (HTML default)
        // But ensure any dynamic logout btn removed
        setupLogoutHandler();
    }
}

// Setup logout handler
function setupLogoutHandler() {
    // Use event delegation as nav may be re-rendered
    document.addEventListener('click', function (e) {
        const target = e.target;
        // handle <a id="logoutBtn"> or its inner <i> or <span>
        if (target && (target.id === 'logoutBtn' || target.closest && target.closest('#logoutBtn'))) {
            e.preventDefault();
            if (confirm('Apakah Anda yakin ingin logout?')) {
                localStorage.removeItem('user');
                window.location.href = `${BASE_PATH}/index.html`;
            }
        }
    }, { once: false });
}

// Show create event modal (redirect to my-events page)
function showCreateEventModal() {
    // Redirect to my-events (absolute)
    window.location.href = `${BASE_PATH}/user/my-events.html`;
}

// Helper to get API base path (absolute)
function apiPath(relative) {
    // relative e.g. '/api/auth/login.php' or 'api/auth/login.php'
    // normalize to start with '/'
    let r = relative.startsWith('/') ? relative : `/${relative}`;
    return `${BASE_PATH}${r}`;
}

// Login Form Handler
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const alertMessage = document.getElementById('alertMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const btnText = document.querySelector('.btn-text');
        const btnLoading = document.querySelector('.btn-loading');

        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline-block';

        try {
            // use absolute API path to avoid relative mistakes
            const loginApi = apiPath('/api/auth/login.php');
            console.log('Mengirim ke:', loginApi);

            const response = await fetch(loginApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            console.log('Response data:', data);

            if (data.success && data.user) {
                // Save user data to localStorage
                localStorage.setItem('user', JSON.stringify(data.user));

                // Show success message
                showAlert('Login berhasil! Mengalihkan...', 'success');

                // Redirect based on role (absolute)
                setTimeout(() => {
                    if (data.user.role === 'admin') {
                        window.location.href = `${BASE_PATH}/admin/dashboard.html`;
                    } else {
                        window.location.href = `${BASE_PATH}/user/dashboard.html`;
                    }
                }, 800);
            } else {
                showAlert(data.message || 'Login gagal!', 'error');
                if (btnText) btnText.style.display = 'inline-block';
                if (btnLoading) btnLoading.style.display = 'none';
            }
        } catch (error) {
            console.error('Error detail:', error);
            showAlert('Terjadi kesalahan! Pastikan server PHP berjalan.', 'error');
            if (btnText) btnText.style.display = 'inline-block';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    });

    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }
}

// Register Form Handler
if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Password strength indicator
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            const strengthBar = document.querySelector('.strength-bar');
            if (strengthBar) {
                const strength = calculatePasswordStrength(password);
                strengthBar.style.width = strength.percentage + '%';
                strengthBar.style.backgroundColor = strength.color;
            }
        });
    }

    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }

    if (toggleConfirmPassword && confirmPasswordInput) {
        toggleConfirmPassword.addEventListener('click', () => {
            const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordInput.setAttribute('type', type);
            toggleConfirmPassword.classList.toggle('fa-eye');
            toggleConfirmPassword.classList.toggle('fa-eye-slash');
        });
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
        const agreeTerms = document.getElementById('agreeTerms') ? document.getElementById('agreeTerms').checked : false;

        if (password !== confirmPassword) {
            showAlert('Password tidak cocok!', 'error');
            return;
        }

        if (!agreeTerms) {
            showAlert('Anda harus menyetujui syarat dan ketentuan!', 'error');
            return;
        }

        const btnText = document.querySelector('.btn-text');
        const btnLoading = document.querySelector('.btn-loading');

        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline-block';

        try {
            const registerApi = apiPath('/api/auth/register.php');

            const response = await fetch(registerApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (data.success) {
                showAlert('Registrasi berhasil! Mengalihkan ke halaman login...', 'success');
                setTimeout(() => {
                    window.location.href = `${BASE_PATH}/user/login.html`;
                }, 1200);
            } else {
                showAlert(data.message || 'Registrasi gagal!', 'error');
                if (btnText) btnText.style.display = 'inline-block';
                if (btnLoading) btnLoading.style.display = 'none';
            }
        } catch (error) {
            console.error('Error detail:', error);
            showAlert('Terjadi kesalahan! Pastikan server PHP berjalan.', 'error');
            if (btnText) btnText.style.display = 'inline-block';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});

// Helper Functions
function showAlert(message, type) {
    const alertMessage = document.getElementById('alertMessage');
    if (!alertMessage) {
        // fallback: simple alert
        // console.log(`[${type}] ${message}`);
        return;
    }

    alertMessage.textContent = message;
    alertMessage.className = `alert alert-${type}`;
    alertMessage.style.display = 'block';

    setTimeout(() => {
        alertMessage.style.display = 'none';
    }, 5000);
}

function calculatePasswordStrength(password) {
    let strength = 0;

    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z\d]/.test(password)) strength += 10;

    let color = '#ef4444';
    if (strength >= 50) color = '#f59e0b';
    if (strength >= 75) color = '#10b981';

    return { percentage: strength, color };
}
