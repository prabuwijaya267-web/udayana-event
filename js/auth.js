// ===== AUTH.JS - Handle Login, Register, Session with Dropdown Delay =====

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
        
        // Setup dropdown with delay
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

    // Show dropdown on hover
    navUser.addEventListener('mouseenter', function() {
        clearTimeout(hideTimeout);
        userDropdown.style.display = 'block';
        
        setTimeout(() => {
            userDropdown.style.opacity = '1';
            userDropdown.style.visibility = 'visible';
            userDropdown.style.transform = 'translateY(0)';
        }, 10);
    });

    // Hide dropdown with delay
    navUser.addEventListener('mouseleave', function() {
        hideTimeout = setTimeout(() => {
            userDropdown.style.opacity = '0';
            userDropdown.style.visibility = 'hidden';
            userDropdown.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                userDropdown.style.display = 'none';
            }, 200);
        }, 50); // 400ms delay - bisa diubah sesuai keinginan
    });

    // Keep dropdown open when hovering over it
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
        }, 300); // 400ms delay
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
});

// ... rest of auth.js (login form, register form, etc.)