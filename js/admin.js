// ===== ADMIN.JS - Admin dashboard functionality =====

let pendingEvents = [];
let allAdminEvents = [];
let currentEventId = null;

// Load admin data
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing admin dashboard...');
    loadAdminStats();
    loadPendingEvents();
    setupAdminListeners();
});

// Load admin statistics
async function loadAdminStats() {
    try {
        const response = await fetch('../api/events/get_all_events.php');
        const data = await response.json();
        
        console.log('Admin stats response:', data);
        
        if (data.success && data.data && data.data.events) {
            allAdminEvents = data.data.events;
            updateAdminStats(data.data.events);
        } else {
            console.error('Invalid admin stats response:', data);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Update admin stats display
function updateAdminStats(events) {
    const totalEvents = document.getElementById('totalEvents');
    const pendingEventsEl = document.getElementById('pendingEvents');
    const approvedEventsEl = document.getElementById('approvedEvents');
    const rejectedEventsEl = document.getElementById('rejectedEvents');
    const pendingCount = document.getElementById('pendingCount');
    
    if (totalEvents) totalEvents.textContent = events.length;
    
    const pending = events.filter(e => e.status === 'pending').length;
    const approved = events.filter(e => e.status === 'approved').length;
    const rejected = events.filter(e => e.status === 'rejected').length;
    
    if (pendingEventsEl) pendingEventsEl.textContent = pending;
    if (approvedEventsEl) approvedEventsEl.textContent = approved;
    if (rejectedEventsEl) rejectedEventsEl.textContent = rejected;
    if (pendingCount) pendingCount.textContent = pending;
    
    console.log('Stats updated - Pending:', pending, 'Approved:', approved, 'Rejected:', rejected);
}

// Load pending events
async function loadPendingEvents() {
    try {
        const response = await fetch('../api/events/get_pending_events.php');
        const data = await response.json();
        
        console.log('Pending events response:', data);
        
        if (data.success && data.data && data.data.events) {
            pendingEvents = data.data.events;
            console.log('Pending events loaded:', pendingEvents.length, 'events');
            console.log('First event:', pendingEvents[0]);
            displayPendingEvents(pendingEvents);
        } else {
            console.error('Invalid pending events response:', data);
            pendingEvents = [];
            displayPendingEvents([]);
        }
    } catch (error) {
        console.error('Error loading pending events:', error);
        pendingEvents = [];
        displayPendingEvents([]);
    }
}

// Display pending events
function displayPendingEvents(events) {
    const container = document.getElementById('pendingEventsContainer');
    if (!container) {
        console.error('pendingEventsContainer not found!');
        return;
    }
    
    if (events.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--gray-color);">
                <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem; color: var(--success-color);"></i>
                <p>Tidak ada event yang menunggu review</p>
            </div>
        `;
        return;
    }
    
    console.log('Displaying', events.length, 'pending events');
    container.innerHTML = events.map(event => createPendingEventCard(event)).join('');
}

// Create pending event card
function createPendingEventCard(event) {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return `
        <div class="event-card" style="border: 2px solid var(--warning-color);">
            <div style="position: relative;">
                <img src="${event.image || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800'}" 
                     alt="${event.title}" class="event-image">
                <span class="event-badge">${event.category}</span>
                <span class="status-badge status-pending" style="position: absolute; top: 1rem; left: 1rem;">
                    Pending
                </span>
            </div>
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                
                <div class="event-info">
                    <i class="fas fa-user"></i>
                    <span>Dibuat oleh: <strong>${event.username || 'Unknown'}</strong></span>
                </div>
                <div class="event-info">
                    <i class="fas fa-calendar"></i>
                    <span>${formattedDate}</span>
                </div>
                <div class="event-info">
                    <i class="fas fa-clock"></i>
                    <span>${event.time} WITA</span>
                </div>
                <div class="event-info">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${event.location}</span>
                </div>
                <div class="event-info">
                    <i class="fas fa-users"></i>
                    <span>Kapasitas: ${event.capacity} orang</span>
                </div>
                
                <p class="event-description">${event.description}</p>
                
                <div style="font-size: 0.875rem; color: var(--gray-color); margin-top: 1rem;">
                    <strong>Penyelenggara:</strong> ${event.organizer}
                </div>
                
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button onclick="window.approveEventHandler(${event.id})" class="btn btn-success" style="flex: 1; padding: 0.5rem;">
                        <i class="fas fa-check"></i> Setujui
                    </button>
                    <button onclick="window.rejectEventHandler(${event.id})" class="btn btn-danger" style="flex: 1; padding: 0.5rem;">
                        <i class="fas fa-times"></i> Tolak
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Setup admin listeners
function setupAdminListeners() {
    console.log('Setting up admin listeners...');
    
    // Approve modal
    const approveModal = document.getElementById('approveModal');
    const cancelApproveBtn = document.getElementById('cancelApproveBtn');
    const confirmApproveBtn = document.getElementById('confirmApproveBtn');
    
    if (cancelApproveBtn) {
        cancelApproveBtn.addEventListener('click', () => {
            if (approveModal) approveModal.classList.remove('active');
        });
    }
    
    if (confirmApproveBtn) {
        confirmApproveBtn.addEventListener('click', confirmApprove);
    }
    
    // Reject modal
    const rejectModal = document.getElementById('rejectModal');
    const cancelRejectBtn = document.getElementById('cancelRejectBtn');
    const confirmRejectBtn = document.getElementById('confirmRejectBtn');
    
    if (cancelRejectBtn) {
        cancelRejectBtn.addEventListener('click', () => {
            if (rejectModal) rejectModal.classList.remove('active');
        });
    }
    
    if (confirmRejectBtn) {
        confirmRejectBtn.addEventListener('click', confirmReject);
    }
    
    // Close modals with close button
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Approve event handler - GLOBAL FUNCTION
window.approveEventHandler = function(eventId) {
    console.log('=== APPROVE EVENT HANDLER ===');
    console.log('Event ID:', eventId);
    console.log('Pending events array:', pendingEvents);
    console.log('Pending events length:', pendingEvents.length);
    
    currentEventId = eventId;
    
    // Find event in pendingEvents array
    const event = pendingEvents.find(e => {
        console.log('Checking event:', e.id, 'vs', eventId, 'Match:', e.id == eventId);
        return e.id == eventId; // Use == instead of === to handle string vs number
    });
    
    console.log('Event found:', event);
    
    if (event) {
        const preview = document.getElementById('approveEventPreview');
        if (preview) {
            preview.innerHTML = `
                <div style="padding: 1rem; background: var(--light-color); border-radius: 8px;">
                    <h4 style="margin-bottom: 0.5rem;">${event.title}</h4>
                    <p style="margin: 0.25rem 0;"><strong>Penyelenggara:</strong> ${event.organizer}</p>
                    <p style="margin: 0.25rem 0;"><strong>Tanggal:</strong> ${event.date}</p>
                    <p style="margin: 0.25rem 0;"><strong>Dibuat oleh:</strong> ${event.username || 'Unknown'}</p>
                </div>
            `;
        }
        
        const modal = document.getElementById('approveModal');
        if (modal) {
            modal.classList.add('active');
            console.log('✅ Approve modal opened');
        } else {
            console.error('❌ Approve modal not found!');
        }
    } else {
        console.error('❌ Event not found in pendingEvents array!');
        alert('Event tidak ditemukan! Coba refresh halaman.');
    }
};

// Confirm approve
async function confirmApprove() {
    console.log('=== CONFIRMING APPROVE ===');
    console.log('Current event ID:', currentEventId);
    
    if (!currentEventId) {
        alert('Event ID tidak ditemukan!');
        return;
    }
    
    try {
        const response = await fetch('../api/events/approve_event.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: currentEventId })
        });
        
        const data = await response.json();
        
        console.log('Approve response:', data);
        
        if (data.success) {
            alert('✅ Event berhasil disetujui!');
            
            const modal = document.getElementById('approveModal');
            if (modal) modal.classList.remove('active');
            
            // Reload data
            console.log('Reloading pending events and stats...');
            await loadPendingEvents();
            await loadAdminStats();
        } else {
            alert('❌ ' + (data.message || 'Gagal menyetujui event!'));
        }
    } catch (error) {
        console.error('Error approving event:', error);
        alert('❌ Terjadi kesalahan saat menyetujui event!');
    }
}

// Reject event handler - GLOBAL FUNCTION
window.rejectEventHandler = function(eventId) {
    console.log('=== REJECT EVENT HANDLER ===');
    console.log('Event ID:', eventId);
    
    currentEventId = eventId;
    
    // Find event in pendingEvents array
    const event = pendingEvents.find(e => e.id == eventId);
    
    console.log('Event found:', event);
    
    if (event) {
        const preview = document.getElementById('rejectEventPreview');
        if (preview) {
            preview.innerHTML = `
                <div style="padding: 1rem; background: var(--light-color); border-radius: 8px;">
                    <h4 style="margin-bottom: 0.5rem;">${event.title}</h4>
                    <p style="margin: 0.25rem 0;"><strong>Penyelenggara:</strong> ${event.organizer}</p>
                    <p style="margin: 0.25rem 0;"><strong>Tanggal:</strong> ${event.date}</p>
                    <p style="margin: 0.25rem 0;"><strong>Dibuat oleh:</strong> ${event.username || 'Unknown'}</p>
                </div>
            `;
        }
        
        const reasonField = document.getElementById('rejectReason');
        if (reasonField) {
            reasonField.value = '';
        }
        
        const modal = document.getElementById('rejectModal');
        if (modal) {
            modal.classList.add('active');
            console.log('✅ Reject modal opened');
        } else {
            console.error('❌ Reject modal not found!');
        }
    } else {
        console.error('❌ Event not found in pendingEvents array!');
        alert('Event tidak ditemukan! Coba refresh halaman.');
    }
};

// Confirm reject
async function confirmReject() {
    const reasonField = document.getElementById('rejectReason');
    const reason = reasonField ? reasonField.value.trim() : '';
    
    console.log('=== CONFIRMING REJECT ===');
    console.log('Current event ID:', currentEventId);
    console.log('Reason:', reason);
    
    if (!reason) {
        alert('Mohon masukkan alasan penolakan!');
        return;
    }
    
    if (!currentEventId) {
        alert('Event ID tidak ditemukan!');
        return;
    }
    
    try {
        const response = await fetch('../api/events/reject_event.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                id: currentEventId,
                reason: reason 
            })
        });
        
        const data = await response.json();
        
        console.log('Reject response:', data);
        
        if (data.success) {
            alert('✅ Event berhasil ditolak!');
            
            const modal = document.getElementById('rejectModal');
            if (modal) modal.classList.remove('active');
            
            // Reload data
            console.log('Reloading pending events and stats...');
            await loadPendingEvents();
            await loadAdminStats();
        } else {
            alert('❌ ' + (data.message || 'Gagal menolak event!'));
        }
    } catch (error) {
        console.error('Error rejecting event:', error);
        alert('❌ Terjadi kesalahan saat menolak event!');
    }
}

console.log('admin.js loaded successfully');
