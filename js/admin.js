// ===== ADMIN.JS - Admin dashboard functionality =====

let pendingEvents = [];
let allAdminEvents = [];

// Load admin data
document.addEventListener('DOMContentLoaded', () => {
    loadAdminStats();
    loadPendingEvents();
    setupAdminListeners();
});

// Load admin statistics
async function loadAdminStats() {
    try {
        const response = await fetch('../api/events/get_all_events.php');
        const data = await response.json();
        
        if (data.success) {
            allAdminEvents = data.events;
            updateAdminStats(data.events);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Update admin stats display
function updateAdminStats(events) {
    const totalEvents = document.getElementById('totalEvents');
    const pendingEvents = document.getElementById('pendingEvents');
    const approvedEvents = document.getElementById('approvedEvents');
    const rejectedEvents = document.getElementById('rejectedEvents');
    const pendingCount = document.getElementById('pendingCount');
    
    if (totalEvents) totalEvents.textContent = events.length;
    
    const pending = events.filter(e => e.status === 'pending').length;
    const approved = events.filter(e => e.status === 'approved').length;
    const rejected = events.filter(e => e.status === 'rejected').length;
    
    if (pendingEvents) pendingEvents.textContent = pending;
    if (approvedEvents) approvedEvents.textContent = approved;
    if (rejectedEvents) rejectedEvents.textContent = rejected;
    if (pendingCount) pendingCount.textContent = pending;
}

// Load pending events
async function loadPendingEvents() {
    try {
        const response = await fetch('../api/events/get_pending_events.php');
        const data = await response.json();
        
        if (data.success) {
            pendingEvents = data.events;
            displayPendingEvents(data.events);
        }
    } catch (error) {
        console.error('Error loading pending events:', error);
    }
}

// Display pending events
function displayPendingEvents(events) {
    const container = document.getElementById('pendingEventsContainer');
    if (!container) return;
    
    if (events.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--gray-color);">
                <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem; color: var(--success-color);"></i>
                <p>Tidak ada event yang menunggu review</p>
            </div>
        `;
        return;
    }
    
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
                    <button onclick="approveEvent(${event.id})" class="btn btn-success" style="flex: 1; padding: 0.5rem;">
                        <i class="fas fa-check"></i> Setujui
                    </button>
                    <button onclick="rejectEvent(${event.id})" class="btn btn-danger" style="flex: 1; padding: 0.5rem;">
                        <i class="fas fa-times"></i> Tolak
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Setup admin listeners
function setupAdminListeners() {
    // Approve modal
    const approveModal = document.getElementById('approveModal');
    const cancelApproveBtn = document.getElementById('cancelApproveBtn');
    const confirmApproveBtn = document.getElementById('confirmApproveBtn');
    
    if (cancelApproveBtn) {
        cancelApproveBtn.addEventListener('click', () => {
            approveModal.classList.remove('active');
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
            rejectModal.classList.remove('active');
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
}

let currentEventId = null;

// Approve event
function approveEvent(eventId) {
    currentEventId = eventId;
    const event = pendingEvents.find(e => e.id === eventId);
    
    if (event) {
        const preview = document.getElementById('approveEventPreview');
        preview.innerHTML = `
            <h4>${event.title}</h4>
            <p><strong>Penyelenggara:</strong> ${event.organizer}</p>
            <p><strong>Tanggal:</strong> ${event.date}</p>
        `;
        
        document.getElementById('approveModal').classList.add('active');
    }
}

// Confirm approve
async function confirmApprove() {
    try {
        const response = await fetch('../api/events/approve_event.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: currentEventId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Event berhasil disetujui!');
            document.getElementById('approveModal').classList.remove('active');
            loadPendingEvents();
            loadAdminStats();
        } else {
            alert(data.message || 'Gagal menyetujui event!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan!');
    }
}

// Reject event
function rejectEvent(eventId) {
    currentEventId = eventId;
    const event = pendingEvents.find(e => e.id === eventId);
    
    if (event) {
        const preview = document.getElementById('rejectEventPreview');
        preview.innerHTML = `
            <h4>${event.title}</h4>
            <p><strong>Penyelenggara:</strong> ${event.organizer}</p>
            <p><strong>Tanggal:</strong> ${event.date}</p>
        `;
        
        document.getElementById('rejectReason').value = '';
        document.getElementById('reject Modal').classList.add('active');
    }
}

// Confirm reject
async function confirmReject() {
    const reason = document.getElementById('rejectReason').value.trim();
    
    if (!reason) {
        alert('Mohon masukkan alasan penolakan!');
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
        
        if (data.success) {
            alert('Event berhasil ditolak!');
            document.getElementById('rejectModal').classList.remove('active');
            loadPendingEvents();
            loadAdminStats();
        } else {
            alert(data.message || 'Gagal menolak event!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan!');
    }
}