// ===== SCRIPT.JS - Main functionality for landing page with Faculty & Prodi =====

let allEvents = [];
let currentFilter = 'all';
let searchQuery = '';

// Load events on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Page loaded, initializing...');
    loadEvents();
    setupEventListeners();
});

// Load events from API
async function loadEvents() {
    console.log('=== LOADING EVENTS ===');
    
    try {
        const endpoint = 'api/events/get_events.php';
        console.log('Fetching from:', endpoint);
        
        const response = await fetch(endpoint);
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Data received:', data);
        console.log('Events count:', data.events ? data.events.length : 0);
        
        if (data.success && data.events && data.events.length > 0) {
            console.log('✅ Events loaded successfully:', data.events.length);
            allEvents = data.events;
            displayEvents(allEvents);
        } else {
            console.warn('⚠️ No events found');
            showEmptyState('Tidak ada event yang tersedia saat ini');
        }
    } catch (error) {
        console.error('❌ Error loading events:', error);
        showEmptyState('Gagal memuat event. Pastikan server PHP berjalan.');
    }
}

// Display events in grid
function displayEvents(events) {
    console.log('=== DISPLAYING EVENTS ===');
    console.log('Events to display:', events.length);
    
    const eventsGrid = document.getElementById('eventsGrid');
    
    if (!eventsGrid) {
        console.error('❌ Element #eventsGrid not found!');
        return;
    }
    
    if (!events || events.length === 0) {
        showEmptyState('Tidak ada event yang ditemukan');
        return;
    }
    
    console.log('Creating event cards...');
    eventsGrid.innerHTML = events.map(event => createEventCard(event)).join('');
    console.log('✅ Events displayed successfully');
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
    
    return `
        <div class="event-card" data-category="${event.category}">
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
            </div>
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
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
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentFilter = btn.getAttribute('data-category');
            filterEvents();
        });
    });
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
            event.organizer.toLowerCase().includes(searchQuery) ||
            (event.faculty && event.faculty.toLowerCase().includes(searchQuery)) ||
            (event.study_program && event.study_program.toLowerCase().includes(searchQuery))
        );
    }
    
    displayEvents(filtered);
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

console.log('✅ script.js loaded');