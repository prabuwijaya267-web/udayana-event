// ===== ADMIN-NAV.JS - Admin navbar dropdown with delay =====

console.log('✅ admin-nav.js loaded');

// Setup admin dropdown dengan delay
function setupAdminDropdown() {
    // Wait for DOM to be fully loaded
    const navUser = document.querySelector('.admin-nav .nav-user');
    
    if (!navUser) {
        console.warn('⚠️ Admin nav-user not found, retrying...');
        setTimeout(setupAdminDropdown, 100);
        return;
    }

    console.log('🎯 Setting up admin dropdown...');

    let hideTimeout;
    const userDropdown = navUser.querySelector('.user-dropdown');

    if (!userDropdown) {
        console.error('❌ Admin dropdown not found');
        return;
    }

    // Show dropdown on hover
    navUser.addEventListener('mouseenter', function() {
        console.log('👆 Mouse entered admin nav');
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
        console.log('👇 Mouse left admin nav, hiding in 400ms...');
        hideTimeout = setTimeout(() => {
            userDropdown.style.opacity = '0';
            userDropdown.style.visibility = 'hidden';
            userDropdown.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                userDropdown.style.display = 'none';
            }, 200);
        }, 50); // 400ms delay
    });

    // Keep dropdown open when hovering over it
    userDropdown.addEventListener('mouseenter', function() {
        console.log('👆 Mouse entered dropdown, canceling hide');
        clearTimeout(hideTimeout);
    });

    userDropdown.addEventListener('mouseleave', function() {
        console.log('👇 Mouse left dropdown, hiding in 400ms...');
        hideTimeout = setTimeout(() => {
            userDropdown.style.opacity = '0';
            userDropdown.style.visibility = 'hidden';
            userDropdown.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                userDropdown.style.display = 'none';
            }, 200);
        }, 400); // 400ms delay
    });

    console.log('✅ Admin dropdown setup complete');
}

// Setup logout handler untuk admin
function setupAdminLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🚪 Admin logout clicked');
            
            if (confirm('Apakah Anda yakin ingin logout?')) {
                localStorage.removeItem('user');
                window.location.href = '/udayana-event/index.html';
            }
        });
        console.log('✅ Admin logout handler attached');
    }
}

// Initialize saat DOM ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin nav initializing...');
    
    // Tunggu sebentar untuk memastikan navbar sudah di-render
    setTimeout(function() {
        setupAdminDropdown();
        setupAdminLogout();
    }, 200);
});

console.log('📄 admin-nav.js loaded');