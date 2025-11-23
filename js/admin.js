// ===== MANAGE-EVENTS.JS - Admin event management (FIXED V2) =====

let allEvents = [];
let filteredEvents = [];
let currentStatus = 'pending';
let searchQuery = '';
let currentEventId = null;

// Load all events
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Manage Events page loaded');
    loadAllEvents();
    setupManageListeners();
    
    // Test if functions are accessible
    console.log('Testing global functions...');
    console.log('viewEventDetails:', typeof window.viewEventDetails);
    console.log('approveEvent:', typeof window.approveEvent);
    console.log('rejectEvent:', typeof window.rejectEvent);
    console.log('deleteEventAdmin:', typeof window.deleteEventAdmin);
});

// Load all events from API
async function loadAllEvents() {
    try {
        console.log('Loading all events...');
        const response = await fetch('../api/events/get_all_events.php');
        const data = await response.json();

        console.log('Manage events response:', data);

        if (data.success && data.events) {
            allEvents = data.events;
            console.log('✅ Events loaded:', allEvents.length);
            updateBadges();
            filterAndDisplayEvents();
        } else {
            console.warn('No events found');
            showEmptyState('Tidak ada event');
        }
    } catch (error) {
        console.error('❌ Error loading events:', error);
        showEmptyState('Gagal memuat event');
    }
}

// Update badge counts
function updateBadges() {
    const pending = allEvents.filter(e => e.status === 'pending').length;
    const approved = allEvents.filter(e => e.status === 'approved').length;
    const rejected = allEvents.filter(e => e.status === 'rejected').length;

    const pendingBadge = document.getElementById('pendingBadge');
    const approvedBadge = document.getElementById('approvedBadge');
    const rejectedBadge = document.getElementById('rejectedBadge');
    const allBadge = document.getElementById('allBadge');
    const pendingCount = document.getElementById('pendingCount');

    if (pendingBadge) pendingBadge.textContent = pending;
    if (approvedBadge) approvedBadge.textContent = approved;
    if (rejectedBadge) rejectedBadge.textContent = rejected;
    if (allBadge) allBadge.textContent = allEvents.length;
    if (pendingCount) pendingCount.textContent = pending;

    console.log('Badges updated - Pending:', pending, 'Approved:', approved, 'Rejected:', rejected);
}

// Filter and display events
function filterAndDisplayEvents() {
    let filtered = allEvents;

    // Filter by status
    if (currentStatus !== 'all') {
        filtered = filtered.filter(e => e.status === currentStatus);
    }

    // Filter by search query
    if (searchQuery) {
        filtered = filtered.filter(e =>
            e.title.toLowerCase().includes(searchQuery) ||
            e.organizer.toLowerCase().includes(searchQuery) ||
            (e.username && e.username.toLowerCase().includes(searchQuery)) ||
            e.description.toLowerCase().includes(searchQuery)
        );
    }

    filteredEvents = filtered;
    displayEvents(filtered);
}

// Display events
function displayEvents(events) {
    const grid = document.getElementById('manageEventsGrid');
    if (!grid) {
        console.error('manageEventsGrid not found!');
        return;
    }

    if (events.length === 0) {
        showEmptyState(searchQuery ? 'Tidak ada event yang sesuai pencarian' : `Tidak ada event ${currentStatus === 'all' ? '' : currentStatus}`);
        return;
    }

    console.log('Displaying', events.length, 'events');
    grid.innerHTML = events.map(event => createAdminEventCard(event)).join('');
    
    // After rendering, attach event listeners to buttons
    attachButtonListeners();
}

// Attach event listeners to buttons (alternative method)
function attachButtonListeners() {
    console.log('Attaching button listeners...');
    
    // View buttons
    document.querySelectorAll('.btn-view-detail').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = parseInt(this.getAttribute('data-id'));
            console.log('View button clicked for event:', eventId);
            viewEventDetailsHandler(eventId);
        });
    });
    
    // Approve buttons
    document.querySelectorAll('.btn-approve').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = parseInt(this.getAttribute('data-id'));
            console.log('Approve button clicked for event:', eventId);
            approveEventHandler(eventId);
        });
    });
    
    // Reject buttons
    document.querySelectorAll('.btn-reject').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = parseInt(this.getAttribute('data-id'));
            console.log('Reject button clicked for event:', eventId);
            rejectEventHandler(eventId);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = parseInt(this.getAttribute('data-id'));
            console.log('Delete button clicked for event:', eventId);
            deleteEventHandler(eventId);
        });
    });
}

// Create admin event card
function createAdminEventCard(event) {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const statusClass = event.status === 'pending' ? 'warning' : event.status === 'approved' ? 'success' : 'danger';
    const statusText = event.status === 'pending' ? 'Pending' : event.status === 'approved' ? 'Disetujui' : 'Ditolak';
    const statusIcon = event.status === 'pending' ? 'clock' : event.status === 'approved' ? 'check-circle' : 'times-circle';

    return `
        <div class="event-card" style="border-left: 4px solid var(--${statusClass}-color);">
            <div style="position: relative;">
                <img src="${event.image || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800'}" 
                     alt="${event.title}" class="event-image">
                <span class="event-badge">${event.category}</span>
                <span class="status-badge status-${event.status}" style="position: absolute; top: 1rem; left: 1rem;">
                    <i class="fas fa-${statusIcon}"></i> ${statusText}
                </span>
            </div>
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                
                <div class="event-info" style="background: var(--light-color); padding: 0.5rem; border-radius: 6px; margin-bottom: 0.75rem;">
                    <i class="fas fa-user" style="color: var(--primary-color);"></i>
                    <span><strong>Dibuat oleh:</strong> ${event.username || 'Unknown'}</span>
                </div>

                ${event.faculty ? `
                    <div class="event-info" style="background: var(--light-color); padding: 0.5rem; border-radius: 6px; margin-bottom: 0.5rem;">
                        <i class="fas fa-university" style="color: var(--primary-color);"></i>
                        <span><strong>${event.faculty}</strong></span>
                    </div>
                ` : ''}

                ${event.study_program ? `
                    <div class="event-info">
                        <i class="fas fa-graduation-cap"></i>
                        <span>${event.study_program}</span>
                    </div>
                ` : ''}

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

                ${event.rejected_reason ? `
                    <div style="margin-top: 1rem; padding: 0.75rem; background: #fee2e2; border-radius: 6px; font-size: 0.875rem;">
                        <strong style="color: #991b1b;">Alasan Penolakan:</strong>
                        <p style="color: #7f1d1d; margin-top: 0.25rem;">${event.rejected_reason}</p>
                    </div>
                ` : ''}
                
                <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn btn-outline btn-view-detail" data-id="${event.id}" style="flex: 1; padding: 0.5rem; font-size: 0.875rem;">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                    ${event.status === 'pending' ? `
                        <button class="btn btn-success btn-approve" data-id="${event.id}" style="flex: 1; padding: 0.5rem; font-size: 0.875rem;">
                            <i class="fas fa-check"></i> Setujui
                        </button>
                        <button class="btn btn-danger btn-reject" data-id="${event.id}" style="flex: 1; padding: 0.5rem; font-size: 0.875rem;">
                            <i class="fas fa-times"></i> Tolak
                        </button>
                    ` : ''}
                    <button class="btn btn-danger btn-delete" data-id="${event.id}" style="padding: 0.5rem; font-size: 0.875rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Setup listeners
function setupManageListeners() {
    console.log('Setting up manage listeners...');
    
    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStatus = btn.getAttribute('data-status');
            console.log('Tab changed to:', currentStatus);
            filterAndDisplayEvents();
        });
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            console.log('Search query:', searchQuery);
            filterAndDisplayEvents();
        });
    }

    // Approve modal
    const cancelApproveBtn = document.getElementById('cancelApproveBtn');
    const confirmApproveBtn = document.getElementById('confirmApproveBtn');

    if (cancelApproveBtn) {
        cancelApproveBtn.addEventListener('click', () => {
            document.getElementById('approveModal').classList.remove('active');
        });
    }

    if (confirmApproveBtn) {
        confirmApproveBtn.addEventListener('click', confirmApprove);
    }

    // Reject modal
    const cancelRejectBtn = document.getElementById('cancelRejectBtn');
    const confirmRejectBtn = document.getElementById('confirmRejectBtn');

    if (cancelRejectBtn) {
        cancelRejectBtn.addEventListener('click', () => {
            document.getElementById('rejectModal').classList.remove('active');
        });
    }

    if (confirmRejectBtn) {
        confirmRejectBtn.addEventListener('click', confirmReject);
    }

    // Delete modal
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            document.getElementById('deleteModal').classList.remove('active');
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDelete);
    }

    // Close modals with X button
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
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

// View event details handler
function viewEventDetailsHandler(eventId) {
    console.log('=== VIEW EVENT DETAILS ===');
    console.log('Event ID:', eventId);
    
    const event = allEvents.find(e => e.id == eventId);
    
    if (!event) {
        console.error('Event not found!');
        alert('Event tidak ditemukan!');
        return;
    }

    console.log('Event found:', event);

    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const statusBadge = `
        <span class="status-badge status-${event.status}" style="display: inline-flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${event.status === 'pending' ? 'clock' : event.status === 'approved' ? 'check-circle' : 'times-circle'}"></i>
            ${event.status === 'pending' ? 'Pending' : event.status === 'approved' ? 'Disetujui' : 'Ditolak'}
        </span>
    `;

    const content = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <img src="${event.image || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800'}" 
                 alt="${event.title}" 
                 style="max-width: 100%; height: 300px; object-fit: cover; border-radius: 12px;">
        </div>
        
        <h2 style="margin-bottom: 1rem;">${event.title}</h2>
        <div style="margin-bottom: 1.5rem;">
            ${statusBadge}
            <span class="event-badge" style="margin-left: 0.5rem;">${event.category}</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div class="info-item">
                <i class="fas fa-user" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
                <strong>Dibuat oleh:</strong> ${event.username || 'Unknown'}
            </div>
            ${event.faculty ? `
                <div class="info-item">
                    <i class="fas fa-university" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
                    <strong>Fakultas:</strong> ${event.faculty}
                </div>
            ` : ''}
            ${event.study_program ? `
                <div class="info-item">
                    <i class="fas fa-graduation-cap" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
                    <strong>Prodi:</strong> ${event.study_program}
                </div>
            ` : ''}
            <div class="info-item">
                <i class="fas fa-calendar" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
                <strong>Tanggal:</strong> ${formattedDate}
            </div>
            <div class="info-item">
                <i class="fas fa-clock" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
                <strong>Waktu:</strong> ${event.time} WITA
            </div>
            <div class="info-item">
                <i class="fas fa-map-marker-alt" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
                <strong>Lokasi:</strong> ${event.location}
            </div>
            <div class="info-item">
                <i class="fas fa-users" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
                <strong>Kapasitas:</strong> ${event.capacity} orang
            </div>
            <div class="info-item">
                <i class="fas fa-building" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
                <strong>Penyelenggara:</strong> ${event.organizer}
            </div>
        </div>

        <div style="margin-top: 1.5rem;">
            <h3 style="margin-bottom: 0.5rem;">Deskripsi Event</h3>
            <p style="color: var(--gray-color); line-height: 1.6;">${event.description}</p>
        </div>

        ${event.rejected_reason ? `
            <div style="margin-top: 1.5rem; padding: 1.5rem; background: #fee2e2; border-radius: 12px; border-left: 4px solid #ef4444;">
                <div style="display: flex; align-items: start; gap: 1rem;">
                    <i class="fas fa-exclamation-circle" style="color: #dc2626; font-size: 1.5rem; margin-top: 2px;"></i>
                    <div>
                        <h4 style="color: #991b1b; margin-bottom: 0.5rem;">Alasan Penolakan</h4>
                        <p style="color: #7f1d1d; line-height: 1.6;">${event.rejected_reason}</p>
                    </div>
                </div>
            </div>
        ` : ''}

        <div style="margin-top: 1.5rem; padding: 1rem; background: var(--light-color); border-radius: 8px; font-size: 0.875rem; color: var(--gray-color);">
            <i class="fas fa-clock"></i> Dibuat pada: ${new Date(event.created_at).toLocaleString('id-ID')}
        </div>
    `;

    const modalContent = document.getElementById('eventDetailsContent');
    const modal = document.getElementById('viewEventModal');
    
    if (modalContent && modal) {
        modalContent.innerHTML = content;
        modal.classList.add('active');
        console.log('✅ View modal opened');
    } else {
        console.error('Modal elements not found!');
    }
}

// Close view modal
function closeViewModal() {
    const modal = document.getElementById('viewEventModal');
    if (modal) {
        modal.classList.remove('active');
        console.log('View modal closed');
    }
}

// Make closeViewModal globally accessible
window.closeViewModal = closeViewModal;

// Approve event handler
function approveEventHandler(eventId) {
    console.log('=== APPROVE EVENT ===');
    console.log('Event ID:', eventId);
    
    currentEventId = eventId;
    const event = allEvents.find(e => e.id == eventId);

    if (event) {
        const preview = document.getElementById('approveEventPreview');
        if (preview) {
            preview.innerHTML = `
                <div style="padding: 1rem; background: var(--light-color); border-radius: 8px; margin-top: 1rem;">
                    <h4 style="margin-bottom: 0.5rem;">${event.title}</h4>
                    <p style="color: var(--gray-color); font-size: 0.875rem; margin-bottom: 0.25rem;">
                        <strong>Penyelenggara:</strong> ${event.organizer}
                    </p>
                    <p style="color: var(--gray-color); font-size: 0.875rem; margin-bottom: 0.25rem;">
                        <strong>Tanggal:</strong> ${event.date}
                    </p>
                    <p style="color: var(--gray-color); font-size: 0.875rem;">
                        <strong>Dibuat oleh:</strong> ${event.username || 'Unknown'}
                    </p>
                </div>
            `;
        }

        const modal = document.getElementById('approveModal');
        if (modal) {
            modal.classList.add('active');
            console.log('✅ Approve modal opened');
        }
    } else {
        console.error('Event not found!');
        alert('Event tidak ditemukan!');
    }
}

// Confirm approve
async function confirmApprove() {
    console.log('=== CONFIRMING APPROVE ===');
    console.log('Event ID:', currentEventId);
    
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
            document.getElementById('approveModal').classList.remove('active');
            loadAllEvents();
        } else {
            alert('❌ ' + (data.message || 'Gagal menyetujui event!'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Terjadi kesalahan!');
    }
}

// Reject event handler
function rejectEventHandler(eventId) {
    console.log('=== REJECT EVENT ===');
    console.log('Event ID:', eventId);
    
    currentEventId = eventId;
    const event = allEvents.find(e => e.id == eventId);

    if (event) {
        const preview = document.getElementById('rejectEventPreview');
        if (preview) {
            preview.innerHTML = `
                <div style="padding: 1rem; background: var(--light-color); border-radius: 8px; margin-top: 1rem; margin-bottom: 1rem;">
                    <h4 style="margin-bottom: 0.5rem;">${event.title}</h4>
                    <p style="color: var(--gray-color); font-size: 0.875rem; margin-bottom: 0.25rem;">
                        <strong>Penyelenggara:</strong> ${event.organizer}
                    </p>
                    <p style="color: var(--gray-color); font-size: 0.875rem; margin-bottom: 0.25rem;">
                        <strong>Tanggal:</strong> ${event.date}
                    </p>
                    <p style="color: var(--gray-color); font-size: 0.875rem;">
                        <strong>Dibuat oleh:</strong> ${event.username || 'Unknown'}
                    </p>
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
        }
    } else {
        console.error('Event not found!');
        alert('Event tidak ditemukan!');
    }
}

// Confirm reject
async function confirmReject() {
    const reasonField = document.getElementById('rejectReason');
    const reason = reasonField ? reasonField.value.trim() : '';

    console.log('=== CONFIRMING REJECT ===');
    console.log('Event ID:', currentEventId);
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
            document.getElementById('rejectModal').classList.remove('active');
            loadAllEvents();
        } else {
            alert('❌ ' + (data.message || 'Gagal menolak event!'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Terjadi kesalahan!');
    }
}

// Delete event handler
function deleteEventHandler(eventId) {
    console.log('=== DELETE EVENT ADMIN ===');
    console.log('Event ID:', eventId);
    
    currentEventId = eventId;
    const event = allEvents.find(e => e.id == eventId);

    if (event) {
        const preview = document.getElementById('deleteEventPreview');
        if (preview) {
            preview.innerHTML = `
                <div style="padding: 1rem; background: var(--light-color); border-radius: 8px; margin-top: 1rem;">
                    <h4 style="margin-bottom: 0.5rem;">${event.title}</h4>
                    <p style="color: var(--gray-color); font-size: 0.875rem; margin-bottom: 0.25rem;">
                        <strong>Status:</strong> <span class="status-badge status-${event.status}">${event.status}</span>
                    </p>
                    <p style="color: var(--gray-color); font-size: 0.875rem; margin-bottom: 0.25rem;">
                        <strong>Penyelenggara:</strong> ${event.organizer}
                    </p>
                    <p style="color: var(--gray-color); font-size: 0.875rem;">
                        <strong>Dibuat oleh:</strong> ${event.username || 'Unknown'}
                    </p>
                </div>
            `;
        }

        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.classList.add('active');
            console.log('✅ Delete modal opened');
        }
    } else {
        console.error('Event not found!');
        alert('Event tidak ditemukan!');
    }
}

// Confirm delete
async function confirmDelete() {
    console.log('=== CONFIRMING DELETE ===');
    console.log('Event ID:', currentEventId);
    
    if (!currentEventId) {
        alert('Event ID tidak ditemukan!');
        return;
    }
    
    try {
        const response = await fetch('../api/events/delete_event.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: currentEventId })
        });

        const data = await response.json();
        console.log('Delete response:', data);

        if (data.success) {
            alert('✅ Event berhasil dihapus!');
            document.getElementById('deleteModal').classList.remove('active');
            loadAllEvents();
        } else {
            alert('❌ ' + (data.message || 'Gagal menghapus event!'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Terjadi kesalahan!');
    }
}

// Show empty state
function showEmptyState(message) {
    const grid = document.getElementById('manageEventsGrid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; color: var(--gray-color);">
                <i class="fas fa-inbox" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">${message}</h3>
                <p>Event akan muncul di sini setelah user membuat event</p>
            </div>
        `;
    }
}

console.log('✅ manage-events.js loaded successfully');