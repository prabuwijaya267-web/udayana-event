// ===== SCRIPT.JS - Main functionality for landing page and user dashboard =====

let allEvents = [];
let currentFilter = 'all';
let searchQuery = '';

// Load events on page load
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    setupEventListeners();
});

// Load events from API
async function loadEvents() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const endpoint = user ? '../api/events/get_events.php' : 'api/events/get_events.php';
        
        const response = await fetch(endpoint);
        const data = await response.json();
        
        if (data.success) {
            allEvents = data.events;
            displayEvents(allEvents);
            
            // Update stats if on dashboard
            updateDashboardStats();
        } else {
            showEmptyState('Tidak ada event tersedia');
        }
    } catch (error) {
        console.error('Error loading events:', error);
        showEmptyState('Gagal memuat event. Pastikan server PHP berjalan.');
    }
}

// Display events in grid
function displayEvents(events) {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;
    
    if (events.length === 0) {
        showEmptyState('Tidak ada event yang ditemukan');
        return;
    }
    
    eventsGrid.innerHTML = events.map(event => createEventCard(event)).join('');
}

// Create event card HTML
function createEventCard(event) {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const statusBadge = event.status ? `
        <span class="status-badge status-${event.status}">
            ${event.status === 'pending' ? 'Menunggu' : event.status === 'approved' ? 'Disetujui' : 'Ditolak'}
        </span>
    ` : '';
    
    return `
        <div class="event-card" data-category="${event.category}">
            <div style="position: relative;">
                <img src="${event.image || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800'}" 
                     alt="${event.title}" class="event-image">
                <span class="event-badge">${event.category}</span>
            </div>
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                ${statusBadge}
                
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
                
                ${event.status && event.status !== 'approved' ? `
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button onclick="editEvent(${event.id})" class="btn btn-primary" style="flex: 1; padding: 0.5rem;">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="deleteEvent(${event.id})" class="btn btn-danger" style="padding: 0.5rem;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : ''}
                
                ${event.rejected_reason ? `
                    <div style="margin-top: 1rem; padding: 1rem; background: #fee2e2; border-radius: 8px; font-size: 0.875rem;">
                        <strong style="color: #991b1b;">Alasan Penolakan:</strong>
                        <p style="color: #7f1d1d; margin-top: 0.5rem;">${event.rejected_reason}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            filterEvents();
        });
    }
    
    // Category filter
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            currentFilter = btn.getAttribute('data-category');
            filterEvents();
        });
    });
    
    // Create event modal
    const createEventBtn = document.getElementById('createEventBtn');
    const createEventModal = document.getElementById('createEventModal');
    const cancelCreateBtn = document.getElementById('cancelCreateBtn');
    
    if (createEventBtn && createEventModal) {
        createEventBtn.addEventListener('click', () => {
            createEventModal.classList.add('active');
        });
        
        if (cancelCreateBtn) {
            cancelCreateBtn.addEventListener('click', () => {
                createEventModal.classList.remove('active');
            });
        }
        
        // Close modal when clicking outside
        createEventModal.addEventListener('click', (e) => {
            if (e.target === createEventModal) {
                createEventModal.classList.remove('active');
            }
        });
        
        // Close modal with close button
        const closeBtn = createEventModal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                createEventModal.classList.remove('active');
            });
        }
    }
    
    // Create event form
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', handleCreateEvent);
    }
}

// Filter events
function filterEvents() {
    let filtered = allEvents;
    
    // Filter by category
    if (currentFilter !== 'all') {
        filtered = filtered.filter(event => event.category === currentFilter);
    }
    
    // Filter by search query
    if (searchQuery) {
        filtered = filtered.filter(event => 
            event.title.toLowerCase().includes(searchQuery) ||
            event.description.toLowerCase().includes(searchQuery) ||
            event.location.toLowerCase().includes(searchQuery) ||
            event.organizer.toLowerCase().includes(searchQuery)
        );
    }
    
    displayEvents(filtered);
}

// Handle create event
async function handleCreateEvent(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Anda harus login terlebih dahulu!');
        return;
    }
    
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
    
    try {
        const response = await fetch('../api/events/add_event.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Event berhasil dibuat! Menunggu persetujuan admin.');
            document.getElementById('createEventModal').classList.remove('active');
            document.getElementById('createEventForm').reset();
            loadEvents(); // Reload events
        } else {
            alert(data.message || 'Gagal membuat event!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan! Pastikan server PHP berjalan.');
    }
}

// Edit event
function editEvent(eventId) {
    // TODO: Implement edit functionality
    alert('Fitur edit akan segera hadir!');
}

// Delete event
async function deleteEvent(eventId) {
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
            loadEvents();
        } else {
            alert(data.message || 'Gagal menghapus event!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan!');
    }
}

// Update dashboard stats
function updateDashboardStats() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    // Filter user's events
    const userEvents = allEvents.filter(e => e.user_id === user.id);
    
    const totalEvents = document.getElementById('totalEvents');
    const pendingEvents = document.getElementById('pendingEvents');
    const approvedEvents = document.getElementById('approvedEvents');
    const rejectedEvents = document.getElementById('rejectedEvents');
    
    if (totalEvents) totalEvents.textContent = userEvents.length;
    if (pendingEvents) pendingEvents.textContent = userEvents.filter(e => e.status === 'pending').length;
    if (approvedEvents) approvedEvents.textContent = userEvents.filter(e => e.status === 'approved').length;
    if (rejectedEvents) rejectedEvents.textContent = userEvents.filter(e => e.status === 'rejected').length;
    
    // Display recent events on dashboard
    const recentEventsGrid = document.getElementById('recentEventsGrid');
    if (recentEventsGrid) {
        const recentEvents = userEvents.slice(0, 3);
        if (recentEvents.length > 0) {
            recentEventsGrid.innerHTML = recentEvents.map(event => createEventCard(event)).join('');
        } else {
            recentEventsGrid.innerHTML = '<p style="text-align: center; color: var(--gray-color); padding: 2rem;">Belum ada event</p>';
        }
    }
    
    // Display upcoming public events
    const upcomingEventsGrid = document.getElementById('upcomingEventsGrid');
    if (upcomingEventsGrid) {
        const approvedEvents = allEvents.filter(e => e.status === 'approved').slice(0, 3);
        if (approvedEvents.length > 0) {
            upcomingEventsGrid.innerHTML = approvedEvents.map(event => createEventCard(event)).join('');
        } else {
            upcomingEventsGrid.innerHTML = '<p style="text-align: center; color: var(--gray-color); padding: 2rem;">Belum ada event</p>';
        }
    }
}

// Show empty state
function showEmptyState(message) {
    const eventsGrid = document.getElementById('eventsGrid');
    if (eventsGrid) {
        eventsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--gray-color);">
                <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p style="font-size: 1.1rem;">${message}</p>
            </div>
        `;
    }
}