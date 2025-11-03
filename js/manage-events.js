// ===== MANAGE-EVENTS.JS - Admin event management =====

let allEvents = [];
let filteredEvents = [];
let currentStatus = 'pending';
let searchQuery = '';
let currentEventId = null;

// Load all events
document.addEventListener('DOMContentLoaded', () => {
    loadAllEvents();
    setupManageListeners();
});

// Load all events from API
async function loadAllEvents() {
    try {
        const response = await fetch('../api/events/get_all_events.php');
        const data = await response.json();

        if (data.success) {
            allEvents = data.events;
            updateBadges();
            filterAndDisplayEvents();
        } else {
            showEmptyState('Tidak ada event');
        }
    } catch (error) {
        console.error('Error loading events:', error);
        showEmptyState('Gagal memuat event');
    }
}

// Update badge counts
function updateBadges() {
    const pending = allEvents.filter(e => e.status === 'pending').length;
    const approved = allEvents.filter(e => e.status === 'approved').length;
    const rejected = allEvents.filter(e => e.status === 'rejected').length;

    document.getElementById('pendingBadge').textContent = pending;
    document.getElementById('approvedBadge').textContent = approved;
    document.getElementById('rejectedBadge').textContent = rejected;
    document.getElementById('allBadge').textContent = allEvents.length;
    document.getElementById('pendingCount').textContent = pending;
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
    if (!grid) return;

    if (events.length === 0) {
        showEmptyState(searchQuery ? 'Tidak ada event yang sesuai pencarian' : `Tidak ada event ${currentStatus === 'all' ? '' : currentStatus}`);
        return;
    }

    grid.innerHTML = events.map(event => createAdminEventCard(event)).join('');
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
                    <button onclick="viewEventDetails(${event.id})" class="btn btn-outline" style="flex: 1; padding: 0.5rem; font-size: 0.875rem;">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                    ${event.status === 'pending' ? `
                        <button onclick="approveEvent(${event.id})" class="btn btn-success" style="flex: 1; padding: 0.5rem; font-size: 0.875rem;">
                            <i class="fas fa-check"></i> Setujui
                        </button>
                        <button onclick="rejectEvent(${event.id})" class="btn btn-danger" style="flex: 1; padding: 0.5rem; font-size: 0.875rem;">
                            <i class="fas fa-times"></i> Tolak
                        </button>
                    ` : ''}
                    <button onclick="deleteEventAdmin(${event.id})" class="btn btn-danger" style="padding: 0.5rem; font-size: 0.875rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Setup listeners
function setupManageListeners() {
    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStatus = btn.getAttribute('data-status');
            filterAndDisplayEvents();
        });
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
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

// Approve event
function approveEvent(eventId) {
    currentEventId = eventId;
    const event = allEvents.find(e => e.id === eventId);

    if (event) {
        const preview = document.getElementById('approveEventPreview');
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
            loadAllEvents();
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
    const event = allEvents.find(e => e.id === eventId);

    if (event) {
        const preview = document.getElementById('rejectEventPreview');
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

        document.getElementById('rejectReason').value = '';
        document.getElementById('rejectModal').classList.add('active');
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
            loadAllEvents();
        } else {
            alert(data.message || 'Gagal menolak event!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan!');
    }
}

// Delete event (admin)
function deleteEventAdmin(eventId) {
    currentEventId = eventId;
    const event = allEvents.find(e => e.id === eventId);

    if (event) {
        const preview = document.getElementById('deleteEventPreview');
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

        document.getElementById('deleteModal').classList.add('active');
    }
}

// Confirm delete
async function confirmDelete() {
    try {
        const response = await fetch('../api/events/delete_event.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: currentEventId })
        });

        const data = await response.json();

        if (data.success) {
            alert('Event berhasil dihapus!');
            document.getElementById('deleteModal').classList.remove('active');
            loadAllEvents();
        } else {
            alert(data.message || 'Gagal menghapus event!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan!');
    }
}

// View event details
function viewEventDetails(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;

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

    document.getElementById('eventDetailsContent').innerHTML = content;
    document.getElementById('viewEventModal').classList.add('active');
}

// Close view modal
function closeViewModal() {
    document.getElementById('viewEventModal').classList.remove('active');
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