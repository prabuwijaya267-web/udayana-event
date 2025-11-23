// ===== USER-DASHBOARD.JS - User dashboard functionality =====

console.log('✅ user-dashboard.js loaded');

let userEvents = [];
let publicEvents = [];

// Load dashboard data
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Page loaded, initializing...');
    loadUserStats();
    loadRecentEvents();
    loadUpcomingEvents();
    setupDashboardListeners();
});

// Load user statistics
async function loadUserStats() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            window.location.href = '../login.html';
            return;
        }

        console.log('Loading stats for user:', user.id);

        const response = await fetch('../api/events/get_my_events.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: user.id })
        });

        const data = await response.json();
        console.log('Stats response:', data);

        if (data.success && data.events) {
            userEvents = data.events;
            updateStatsDisplay(data.events);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Update stats display
function updateStatsDisplay(events) {
    const totalEvents = document.getElementById('totalEvents');
    const pendingEvents = document.getElementById('pendingEvents');
    const approvedEvents = document.getElementById('approvedEvents');
    const rejectedEvents = document.getElementById('rejectedEvents');

    if (totalEvents) totalEvents.textContent = events.length;
    
    const pending = events.filter(e => e.status === 'pending').length;
    const approved = events.filter(e => e.status === 'approved').length;
    const rejected = events.filter(e => e.status === 'rejected').length;

    if (pendingEvents) pendingEvents.textContent = pending;
    if (approvedEvents) approvedEvents.textContent = approved;
    if (rejectedEvents) rejectedEvents.textContent = rejected;

    console.log('Stats updated - Total:', events.length, 'Pending:', pending, 'Approved:', approved, 'Rejected:', rejected);
}

// Load recent user events
async function loadRecentEvents() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;

        const response = await fetch('../api/events/get_my_events.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: user.id })
        });

        const data = await response.json();
        console.log('Recent events response:', data);

        if (data.success && data.events) {
            const recentEvents = data.events.slice(0, 3); // Show only 3 recent events
            displayRecentEvents(recentEvents);
        } else {
            showEmptyState('recentEventsGrid', 'Belum ada event yang dibuat');
        }
    } catch (error) {
        console.error('Error loading recent events:', error);
        showEmptyState('recentEventsGrid', 'Gagal memuat event');
    }
}

// Display recent events
function displayRecentEvents(events) {
    const grid = document.getElementById('recentEventsGrid');
    if (!grid) return;

    if (events.length === 0) {
        showEmptyState('recentEventsGrid', 'Belum ada event yang dibuat');
        return;
    }

    grid.innerHTML = events.map(event => createEventCard(event)).join('');
}

// Load upcoming public events
async function loadUpcomingEvents() {
    try {
        console.log('Loading upcoming events...');
        const response = await fetch('../api/events/get_events.php');
        const data = await response.json();
        console.log('Upcoming events response:', data);

        if (data.success && data.events) {
            const upcomingEvents = data.events.slice(0, 3); // Show only 3 upcoming events
            displayUpcomingEvents(upcomingEvents);
        } else {
            showEmptyState('upcomingEventsGrid', 'Tidak ada event yang tersedia');
        }
    } catch (error) {
        console.error('Error loading upcoming events:', error);
        showEmptyState('upcomingEventsGrid', 'Gagal memuat event');
    }
}

// Display upcoming events
function displayUpcomingEvents(events) {
    const grid = document.getElementById('upcomingEventsGrid');
    if (!grid) return;

    if (events.length === 0) {
        showEmptyState('upcomingEventsGrid', 'Tidak ada event yang tersedia');
        return;
    }

    grid.innerHTML = events.map(event => createPublicEventCard(event)).join('');
}

// Create event card (for user's events)
function createEventCard(event) {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const statusClass = event.status === 'pending' ? 'yellow' : event.status === 'approved' ? 'green' : 'red';
    const statusText = event.status === 'pending' ? 'Pending' : event.status === 'approved' ? 'Disetujui' : 'Ditolak';
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
                
                ${event.faculty ? `
                    <div class="event-info" style="background: var(--light-color); padding: 0.5rem; border-radius: 6px; margin-bottom: 0.5rem;">
                        <i class="fas fa-university" style="color: var(--primary-color);"></i>
                        <span><strong>${event.faculty}</strong></span>
                    </div>
                ` : ''}
                
                <div class="event-info">
                    <i class="fas fa-calendar"></i>
                    <span>${formattedDate}</span>
                </div>
                <div class="event-info">
                    <i class="fas fa-clock"></i>
                    <span>${event.time} WIT</span>
                </div>
                <div class="event-info">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${event.location}</span>
                </div>
                
                <p class="event-description">${event.description}</p>
            </div>
        </div>
    `;
}

// Create public event card
function createPublicEventCard(event) {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
        <div class="event-card">
            <div style="position: relative;">
                <img src="${event.image || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800'}" 
                     alt="${event.title}" class="event-image">
                <span class="event-badge">${event.category}</span>
            </div>
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                
                ${event.faculty ? `
                    <div class="event-info" style="background: var(--light-color); padding: 0.5rem; border-radius: 6px; margin-bottom: 0.5rem;">
                        <i class="fas fa-university" style="color: var(--primary-color);"></i>
                        <span><strong>${event.faculty}</strong></span>
                    </div>
                ` : ''}
                
                <div class="event-info">
                    <i class="fas fa-calendar"></i>
                    <span>${formattedDate}</span>
                </div>
                <div class="event-info">
                    <i class="fas fa-clock"></i>
                    <span>${event.time} WIT</span>
                </div>
                <div class="event-info">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${event.location}</span>
                </div>
                
                <p class="event-description">${event.description}</p>
                
                <div style="font-size: 0.875rem; color: var(--gray-color); margin-top: 1rem;">
                    <strong>Penyelenggara:</strong> ${event.organizer}
                </div>
            </div>
        </div>
    `;
}

// Setup dashboard listeners
function setupDashboardListeners() {
    const createEventBtn = document.getElementById('createEventBtn');
    const createEventModal = document.getElementById('createEventModal');
    const cancelCreateBtn = document.getElementById('cancelCreateBtn');
    const createEventForm = document.getElementById('createEventForm');

    if (createEventBtn) {
        createEventBtn.addEventListener('click', () => {
            createEventModal.classList.add('active');
        });
    }

    if (cancelCreateBtn) {
        cancelCreateBtn.addEventListener('click', () => {
            createEventModal.classList.remove('active');
            resetForm();
        });
    }

    if (createEventForm) {
        createEventForm.addEventListener('submit', handleCreateEvent);
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
}

// Handle create event
async function handleCreateEvent(e) {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const eventData = {
        user_id: user.id,
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        category: document.getElementById('eventCategory').value,
        capacity: document.getElementById('eventCapacity').value,
        organizer: document.getElementById('eventOrganizer').value,
        faculty: document.getElementById('eventFaculty').value,
        study_program: document.getElementById('eventStudyProgram').value,
        image: document.getElementById('eventImage').value,
        description: document.getElementById('eventDescription').value
    };

    console.log('Creating event with data:', eventData);

    try {
        const response = await fetch('../api/events/add_event.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });

        const data = await response.json();
        console.log('Create event response:', data);

        if (data.success) {
            alert('✅ Event berhasil dibuat! Menunggu persetujuan admin.');
            document.getElementById('createEventModal').classList.remove('active');
            resetForm();
            // Reload dashboard data
            loadUserStats();
            loadRecentEvents();
        } else {
            alert('❌ ' + (data.message || 'Gagal membuat event!'));
        }
    } catch (error) {
        console.error('Error creating event:', error);
        alert('❌ Terjadi kesalahan saat membuat event!');
    }
}

// Reset form
function resetForm() {
    const form = document.getElementById('createEventForm');
    if (form) form.reset();
    const studyProgramSelect = document.getElementById('eventStudyProgram');
    if (studyProgramSelect) studyProgramSelect.disabled = true;
}

// Show empty state
function showEmptyState(gridId, message) {
    const grid = document.getElementById(gridId);
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem 2rem; color: var(--gray-color);">
                <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

console.log('✅ Dashboard initialized');