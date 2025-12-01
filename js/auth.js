// ===== AUTH.JS - Complete Authentication Handler =====

// Base project path
const BASE_PATH = '/udayana-event';

// Check if user is logged in
function checkAuth(requiredRole = null) {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('/user/') || path.includes('/admin/')) {
            window.location.href = `${BASE_PATH}/login.html`;
        }
        return false;
    }

    if (requiredRole && user.role !== requiredRole) {
        alert('Anda tidak memiliki akses ke halaman ini!');
        window.location.href = user.role === 'admin'
            ? `${BASE_PATH}/admin/dashboard.html`
            : `${BASE_PATH}/user/dashboard.html`;
        return false;
    }

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

        const existingLinks = navMenu.querySelectorAll('a:not(.btn-login):not(.btn-register)');
        let homeEventsAboutHTML = '';
        existingLinks.forEach(link => {
            const text = link.textContent.trim().toLowerCase();
            if (text.includes('home') || text.includes('events') || text.includes('tentang') || text.includes('udayana event')) {
                homeEventsAboutHTML += link.outerHTML;
            }
        });

        navMenu.innerHTML = homeEventsAboutHTML + userMenuHTML;

        setupLogoutHandler();
        
        setTimeout(() => {
            setupUserDropdownWithDelay();
        }, 100);
    } else {
        setupLogoutHandler();
    }
}

// Setup user dropdown with delay
function setupUserDropdownWithDelay() {
    const navUser = document.querySelector('.nav-user');
    
    if (!navUser) return;

    let hideTimeout;
    const userDropdown = navUser.querySelector('.user-dropdown');

    if (!userDropdown) return;

    navUser.addEventListener('mouseenter', function() {
        clearTimeout(hideTimeout);
        userDropdown.style.display = 'block';
        
        setTimeout(() => {
            userDropdown.style.opacity = '1';
            userDropdown.style.visibility = 'visible';
            userDropdown.style.transform = 'translateY(0)';
        }, 10);
    });

    navUser.addEventListener('mouseleave', function() {
        hideTimeout = setTimeout(() => {
            userDropdown.style.opacity = '0';
            userDropdown.style.visibility = 'hidden';
            userDropdown.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                userDropdown.style.display = 'none';
            }, 200);
        }, 50);
    });

    userDropdown.addEventListener('mouseenter', function() {
        clearTimeout(hideTimeout);
    });

    userDropdown.addEventListener('mouseleave', function() {
        hideTimeout = setTimeout(() => {
            userDropdown.style.opacity = '0';
            userDropdown.style.visibility = 'hidden';
            userDropdown.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                userDropdown.style.display = 'none';
            }, 200);
        }, 200);
    });
}

// Setup logout handler
function setupLogoutHandler() {
    document.addEventListener('click', function (e) {
        const target = e.target;
        if (target && (target.id === 'logoutBtn' || target.closest && target.closest('#logoutBtn'))) {
            e.preventDefault();
            if (confirm('Apakah Anda yakin ingin logout?')) {
                localStorage.removeItem('user');
                window.location.href = `${BASE_PATH}/index.html`;
            }
        }
    }, { once: false });
}

// Show create event modal
function showCreateEventModal() {
    window.location.href = `${BASE_PATH}/user/my-events.html`;
}

// Helper to get API base path
function apiPath(relative) {
    let r = relative.startsWith('/') ? relative : `/${relative}`;
    return `${BASE_PATH}${r}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    
    // Setup register form if exists
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        setupRegisterForm();
    }
});

// Setup register form handler
function setupRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    const alertMessage = document.getElementById('alertMessage');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Password visibility toggles
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

    // Password strength indicator
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            const strengthBar = document.querySelector('.strength-bar');
            
            if (!strengthBar) return;

            let strength = 0;
            if (password.length >= 6) strength += 25;
            if (password.length >= 8) strength += 25;
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
            if (/[0-9]/.test(password)) strength += 25;

            strengthBar.style.width = strength + '%';
            
            if (strength < 50) {
                strengthBar.style.background = '#ef4444';
            } else if (strength < 75) {
                strengthBar.style.background = '#f59e0b';
            } else {
                strengthBar.style.background = '#10b981';
            }
        });
    }

    // Form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Validation
        if (!agreeTerms) {
            showAlert('error', 'Anda harus menyetujui syarat dan ketentuan!');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('error', 'Password tidak cocok!');
            return;
        }

        if (password.length < 6) {
            showAlert('error', 'Password minimal 6 karakter!');
            return;
        }

        // Show loading
        const btnText = document.querySelector('.btn-text');
        const btnLoading = document.querySelector('.btn-loading');
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';

        try {
            const response = await fetch('api/auth/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (data.success) {
                showAlert('success', 'Registrasi berhasil! Mengalihkan ke halaman login...');
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showAlert('error', data.message || 'Registrasi gagal!');
                btnText.style.display = 'inline-block';
                btnLoading.style.display = 'none';
            }
        } catch (error) {
            console.error('Register error:', error);
            showAlert('error', 'Terjadi kesalahan! Pastikan server berjalan.');
            btnText.style.display = 'inline-block';
            btnLoading.style.display = 'none';
        }
    });

    function showAlert(type, message) {
        alertMessage.className = 'alert alert-' + type;
        alertMessage.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> 
            ${message}
        `;
        alertMessage.style.display = 'block';

        setTimeout(() => {
            alertMessage.style.display = 'none';
        }, 5000);
    }
}

console.log('✅ auth.js loaded successfully');