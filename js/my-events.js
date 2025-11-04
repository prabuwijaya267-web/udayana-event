// ===== MY-EVENTS.JS - User's events management =====

let myEvents = [];
let currentStatus = 'all';

// Load user's events
document.addEventListener('DOMContentLoaded', () => {
    loadMyEvents();
    setupMyEventsListeners();
});

// Load my events from API
// Load my events from API
async function loadMyEvents() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            window.location.href = '../login.html';
            return;
        }

        const response = await fetch('../api/events/get_my_events.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: user.id })
        });

        const data = await response.json();

        console.log('My events response:', data); // Debug

        if (data.success && data.events) {
            myEvents = data.events; // ✅ Langsung akses data.events
            displayMyEvents(myEvents);
        } else {
            showEmptyState('Belum ada event yang dibuat');
        }
    } catch (error) {
        console.error('Error loading events:', error);
        showEmptyState('Gagal memuat event');
    }
}

// Display my events
function displayMyEvents(events) {
    const grid = document.getElementById('myEventsGrid');
    if (!grid) return;

    // Filter by status
    let filtered = events;
    if (currentStatus !== 'all') {
        filtered = events.filter(e => e.status === currentStatus);
    }

    if (filtered.length === 0) {
        showEmptyState(`Tidak ada event dengan status ${currentStatus === 'all' ? '' : currentStatus}`);
        return;
    }

    grid.innerHTML = filtered.map(event => createMyEventCard(event)).join('');
}

// Create my event card
function createMyEventCard(event) {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const statusClass = event.status === 'pending' ? 'yellow' : event.status === 'approved' ? 'green' : 'red';
    const statusText = event.status === 'pending' ? 'Menunggu Review' : event.status === 'approved' ? 'Disetujui' : 'Ditolak';
    const statusIcon = event.status === 'pending' ? 'clock' : event.status === 'approved' ? 'check-circle' : 'times-circle';

    return `
        <div class="event-card" style="border-left: 4px solid var(--${statusClass === 'yellow' ? 'warning' : statusClass === 'green' ? 'success' : 'danger'}-color);">
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
                    <div style="margin-top: 1rem; padding: 1rem; background: #fee2e2; border-radius: 8px; border-left: 3px solid #ef4444;">
                        <div style="display: flex; align-items: start; gap: 0.5rem;">
                            <i class="fas fa-exclamation-circle" style="color: #dc2626; margin-top: 2px;"></i>
                            <div>
                                <strong style="color: #991b1b; font-size: 0.875rem;">Alasan Penolakan:</strong>
                                <p style="color: #7f1d1d; margin-top: 0.5rem; font-size: 0.875rem;">${event.rejected_reason}</p>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem;">
                    <button onclick="viewEventDetails(${event.id})" class="btn btn-outline" style="flex: 1; padding: 0.5rem; font-size: 0.875rem;">
                        <i class="fas fa-eye"></i> Lihat
                    </button>
                    ${event.status === 'pending' || event.status === 'rejected' ? `
                        <button onclick="editMyEvent(${event.id})" class="btn btn-primary" style="flex: 1; padding: 0.5rem; font-size: 0.875rem;">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="deleteMyEvent(${event.id})" class="btn btn-danger" style="padding: 0.5rem; font-size: 0.875rem;">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Setup listeners
function setupMyEventsListeners() {
    // Tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStatus = btn.getAttribute('data-status');
            displayMyEvents(myEvents);
        });
    });

    // Create event button
    const createEventBtn = document.getElementById('createEventBtn');
    const createEventModal = document.getElementById('createEventModal');
    const cancelCreateBtn = document.getElementById('cancelCreateBtn');

    if (createEventBtn) {
        createEventBtn.addEventListener('click', () => {
            openCreateModal();
        });
    }

    if (cancelCreateBtn) {
        cancelCreateBtn.addEventListener('click', () => {
            createEventModal.classList.remove('active');
            resetForm();
        });
    }

    // Close modal with X button
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
            resetForm();
        });
    });

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                resetForm();
            }
        });
    });

    // Form submit
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', handleSubmitEvent);
    }
}

// Open create modal
function openCreateModal() {
    document.getElementById('modalTitle').textContent = 'Buat Event Baru';
    document.getElementById('submitBtnText').textContent = 'Kirim untuk Ditinjau';
    document.getElementById('eventId').value = '';
    resetForm();
    document.getElementById('createEventModal').classList.add('active');
}

// Edit event
function editMyEvent(eventId) {
    const event = myEvents.find(e => e.id === eventId);
    if (!event) return;

    // Fill form with event data
    document.getElementById('modalTitle').textContent = 'Edit Event';
    document.getElementById('submitBtnText').textContent = 'Update Event';
    document.getElementById('eventId').value = event.id;
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time;
    document.getElementById('eventLocation').value = event.location;
    document.getElementById('eventCategory').value = event.category;
    document.getElementById('eventCapacity').value = event.capacity;
    document.getElementById('eventOrganizer').value = event.organizer;
    document.getElementById('eventImage').value = event.image || '';
    document.getElementById('eventDescription').value = event.description;

    document.getElementById('createEventModal').classList.add('active');
}

// Handle form submit
async function handleSubmitEvent(e) {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const eventId = document.getElementById('eventId').value;
    const isEdit = eventId !== '';

    const eventData = {
        user_id: user.id,
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        category: document.getElementById('eventCategory').value,
        capacity: document.getElementById('eventCapacity').value,
        organizer: document.getElementById('eventOrganizer').value,
        image: document.getElementById('eventImage').value,
        description: document.getElementById('eventDescription').value
    };

    if (isEdit) {
        eventData.id = parseInt(eventId);
    }

    try {
        const endpoint = isEdit ? '../api/events/update_event.php' : '../api/events/add_event.php';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });

        const data = await response.json();

        if (data.success) {
            alert(isEdit ? 'Event berhasil diupdate!' : 'Event berhasil dibuat! Menunggu persetujuan admin.');
            document.getElementById('createEventModal').classList.remove('active');
            resetForm();
            loadMyEvents();
        } else {
            alert(data.message || 'Gagal menyimpan event!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan!');
    }
}

// Delete event
async function deleteMyEvent(eventId) {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini?')) {
        return;
    }

    try {
        const response = await fetch('../api/events/delete_event.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: eventId })
        });

        const data = await response.json();

        if (data.success) {
            alert('Event berhasil dihapus!');
            loadMyEvents();
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
    const event = myEvents.find(e => e.id === eventId);
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
            ${event.status === 'pending' ? 'Menunggu Review' : event.status === 'approved' ? 'Disetujui' : 'Ditolak'}
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
            <div class="info-item">
                <i class="fas fa-clock" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
                <strong>Dibuat:</strong> ${new Date(event.created_at).toLocaleDateString('id-ID')}
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
    `;

    document.getElementById('eventDetailsContent').innerHTML = content;
    document.getElementById('viewEventModal').classList.add('active');
}

// Close view modal
function closeViewModal() {
    document.getElementById('viewEventModal').classList.remove('active');
}

// Reset form
function resetForm() {
    const form = document.getElementById('createEventForm');
    if (form) form.reset();
    document.getElementById('eventId').value = '';
}

// Show empty state
function showEmptyState(message) {
    const grid = document.getElementById('myEventsGrid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; color: var(--gray-color);">
                <i class="fas fa-calendar-times" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">${message}</h3>
                <p style="margin-bottom: 1.5rem;">Mulai buat event pertama Anda!</p>
                <button onclick="openCreateModal()" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Buat Event Baru
                </button>
            </div>
        `;
    }
}