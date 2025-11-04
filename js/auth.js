// ===== AUTH.JS - Handle Login, Register, Session =====

// Check if user is logged in
function checkAuth(requiredRole = null) {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        // Not logged in, redirect to login
        if (window.location.pathname.includes('/user/') || window.location.pathname.includes('/admin/')) {
            window.location.href = '../login.html';
        }
        return false;
    }

    // Check role
    if (requiredRole && user.role !== requiredRole) {
        alert('Anda tidak memiliki akses ke halaman ini!');
        window.location.href = user.role === 'admin' ? '../admin/dashboard.html' : '../user/dashboard.html';
        return false;
    }

    // Update UI with user info
    const userNameElements = document.querySelectorAll('#userName, #userNameDisplay');
    userNameElements.forEach(el => {
        if (el) el.textContent = user.username;
    });

    return true;
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

        // Show loading
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';

        try {
            // Tentukan path API yang benar
            const apiPath = window.location.pathname.includes('/user/') || window.location.pathname.includes('/admin/')
                ? '../api/auth/login.php'
                : 'api/auth/login.php';

            console.log('Mengirim ke:', apiPath);
            console.log('Data:', { username, password: '***' });

            const response = await fetch(apiPath, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Response data:', data);

            if (data.success && data.user) {
                // Save user data to localStorage
                localStorage.setItem('user', JSON.stringify(data.user));

                // Show success message
                showAlert('Login berhasil! Mengalihkan...', 'success');

                // Redirect based on role
                setTimeout(() => {
                    if (data.user.role === 'admin') {
                        window.location.href = 'admin/dashboard.html';
                    } else {
                        window.location.href = 'user/dashboard.html';
                    }
                }, 1000);
            } else {
                showAlert(data.message || 'Login gagal!', 'error');
                btnText.style.display = 'inline-block';
                btnLoading.style.display = 'none';
            }
        } catch (error) {
            console.error('Error detail:', error);
            showAlert('Terjadi kesalahan! Pastikan server PHP berjalan.', 'error');
            btnText.style.display = 'inline-block';
            btnLoading.style.display = 'none';
        }
    });

    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }
}

// Register Form Handler
// Register Form Handler
if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');
    const alertMessage = document.getElementById('alertMessage');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Password strength indicator
    passwordInput.addEventListener('input', (e) => {
        const password = e.target.value;
        const strengthBar = document.querySelector('.strength-bar');

        if (strengthBar) {
            const strength = calculatePasswordStrength(password);
            strengthBar.style.width = strength.percentage + '%';
            strengthBar.style.backgroundColor = strength.color;
        }
    });

    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }

    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', () => {
            const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordInput.setAttribute('type', type);
            toggleConfirmPassword.classList.toggle('fa-eye');
            toggleConfirmPassword.classList.toggle('fa-eye-slash');
        });
    }

    // SUBMIT FORM - KODE BARU
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Validation
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

        // Show loading
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';

        try {
            // Tentukan path API yang benar
            const apiPath = window.location.pathname.includes('/user/') || window.location.pathname.includes('/admin/')
                ? '../api/auth/register.php'
                : 'api/auth/register.php';

            console.log('Mengirim ke:', apiPath);
            console.log('Data:', { username, email, password: '***' });

            const response = await fetch(apiPath, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });

            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                showAlert('Registrasi berhasil! Mengalihkan ke halaman login...', 'success');

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showAlert(data.message || 'Registrasi gagal!', 'error');
                btnText.style.display = 'inline-block';
                btnLoading.style.display = 'none';
            }
        } catch (error) {
            console.error('Error detail:', error);
            showAlert('Terjadi kesalahan! Pastikan server PHP berjalan.', 'error');
            btnText.style.display = 'inline-block';
            btnLoading.style.display = 'none';
        }
    });
}

// Logout handler
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Apakah Anda yakin ingin logout?')) {
                localStorage.removeItem('user');
                window.location.href = '../login.html';
            }
        });
    }
});

// Helper Functions
function showAlert(message, type) {
    const alertMessage = document.getElementById('alertMessage');
    if (!alertMessage) return;

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

    let color = '#ef4444'; // red
    if (strength >= 50) color = '#f59e0b'; // yellow
    if (strength >= 75) color = '#10b981'; // green

    return { percentage: strength, color };
}