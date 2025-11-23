// ===== SCRIPT.JS - Main functionality for landing page =====

console.log('🚀 script.js loaded');

let allEvents = [];
let currentFilter = 'all';
let searchQuery = '';

// Load events on page load
document.addEventListener("DOMContentLoaded", async () => {
    console.log("📄 Page loaded, initializing...");

    // PENTING: Update expired events di database dulu
    await checkExpiredEvents();
    
    // Baru load events (yang sudah di-filter expired di server)
    await loadEvents();

    setupEventListeners();
});

// Check and update expired events
async function checkExpiredEvents() {
    try {
        console.log('⏰ Checking for expired events...');
        console.log('Current time (WIT):', new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jayapura' }));
        
        const response = await fetch('api/events/check_expired_events.php');
        const data = await response.json();

        console.log('📋 Expired check response:', data);

        if (data.success) {
            console.log('✅ Expired check complete');
            console.log('   - Timezone:', data.timezone);
            console.log('   - Events updated to expired:', data.updated);
            console.log('   - Total expired events:', data.total_expired);
            console.log('   - Total active events:', data.total_active);
            console.log('   - Server datetime (WIT):', data.current_datetime);
        } else {
            console.error('❌ Expired check failed:', data.message);
        }
    } catch (error) {
        console.error('❌ Error checking expired events:', error);
    }
}

// Load events from API
async function loadEvents() {
    console.log('📥 Loading events from API...');

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

            // DOUBLE CHECK: Filter hanya event yang belum expired
            allEvents = data.events.filter(e => e.expired == 0 || e.expired === '0');

            console.log("Active (non-expired) events:", allEvents.length);

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
    console.log('🎨 Displaying events:', events.length);

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

    // Attach click listeners to view detail buttons
    setTimeout(() => {
        attachViewDetailListeners();
    }, 100);

    console.log('✅ Events displayed successfully');
}

// Check if event expires soon (H-1)
function isExpiringSoon(eventDate, eventTime) {
    const now = new Date();
    const eventDateTime = new Date(eventDate + ' ' + eventTime);
    const diffTime = eventDateTime - now;
    const diffHours = diffTime / (1000 * 60 * 60);

    // Return true if event is within 24 hours (H-1)
    return diffHours > 0 && diffHours <= 24;
}

// Attach event listeners to View Detail buttons
function attachViewDetailListeners() {
    const viewButtons = document.querySelectorAll('.btn-view-detail');
    console.log('🔘 Attaching listeners to', viewButtons.length, 'view detail buttons');

    viewButtons.forEach((btn, index) => {
        const eventId = parseInt(btn.getAttribute('data-id'));
        console.log(`  - Button ${index + 1}: Event ID ${eventId}`);

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('👁️ View Detail clicked for event ID:', eventId);
            showEventDetail(eventId);
        });
    });

    console.log('✅ View detail listeners attached');
}

function createEventCard(event) {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Check if expiring soon (dalam 24 jam)
    const expiringSoon = isExpiringSoon(event.date, event.time);

    return `
        <div class="event-card" data-category="${event.category}">
            <div style="position: relative;">
                <img src="${event.image || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800'}" 
                     alt="${event.title}" class="event-image">

                <!-- Category badge -->
                <span class="event-badge" style="left: 1rem;">${event.category}</span>
            </div>

            <div class="event-content">
                <!-- Title dengan warning jika akan expired -->
                <h3 class="event-title">
                    ${event.title}
                    ${expiringSoon ? `<span class="expired-tag"><i class="fas fa-exclamation-triangle"></i> Segera Berakhir</span>` : ""}
                </h3>
                
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
                    <span>${event.time} WIT</span>
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

                <div style="margin-top: 1rem;">
                    <button class="btn btn-primary btn-block btn-view-detail" data-id="${event.id}">
                        <i class="fas fa-eye"></i> Lihat Detail
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Show event detail in modal
function showEventDetail(eventId) {
    console.log('=== SHOW EVENT DETAIL ===');
    console.log('Event ID:', eventId);

    const event = allEvents.find(e => e.id == eventId);

    if (!event) {
        console.error('❌ Event not found!');
        alert('Event tidak ditemukan!');
        return;
    }

    console.log('✅ Event found:', event);

    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const modalContent = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <img src="${event.image || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800'}" 
                 alt="${event.title}" 
                 style="max-width: 100%; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        </div>
        
        <div style="text-align: center; margin-bottom: 2rem;">
            <h2 style="margin-bottom: 0.5rem; font-size: 2rem; color: var(--dark-color);">${event.title}</h2>
            <span class="event-badge" style="font-size: 1rem; padding: 0.5rem 1rem;">${event.category}</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0; background: var(--light-color); padding: 1.5rem; border-radius: 12px;">
            ${event.faculty ? `
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas fa-university" style="color: white; font-size: 1.25rem;"></i>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; color: var(--gray-color); text-transform: uppercase; font-weight: 600;">Fakultas</div>
                        <div style="font-weight: 600; color: var(--dark-color);">${event.faculty}</div>
                    </div>
                </div>
            ` : ''}
            
            ${event.study_program ? `
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas fa-graduation-cap" style="color: white; font-size: 1.25rem;"></i>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; color: var(--gray-color); text-transform: uppercase; font-weight: 600;">Program Studi</div>
                        <div style="font-weight: 600; color: var(--dark-color);">${event.study_program}</div>
                    </div>
                </div>
            ` : ''}
            
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class="fas fa-calendar" style="color: white; font-size: 1.25rem;"></i>
                </div>
                <div>
                    <div style="font-size: 0.75rem; color: var(--gray-color); text-transform: uppercase; font-weight: 600;">Tanggal</div>
                    <div style="font-weight: 600; color: var(--dark-color);">${formattedDate}</div>
                </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class="fas fa-clock" style="color: white; font-size: 1.25rem;"></i>
                </div>
                <div>
                    <div style="font-size: 0.75rem; color: var(--gray-color); text-transform: uppercase; font-weight: 600;">Waktu</div>
                    <div style="font-weight: 600; color: var(--dark-color);">${event.time} WIT</div>
                </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class="fas fa-map-marker-alt" style="color: white; font-size: 1.25rem;"></i>
                </div>
                <div>
                    <div style="font-size: 0.75rem; color: var(--gray-color); text-transform: uppercase; font-weight: 600;">Lokasi</div>
                    <div style="font-weight: 600; color: var(--dark-color);">${event.location}</div>
                </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class="fas fa-users" style="color: #667eea; font-size: 1.25rem;"></i>
                </div>
                <div>
                    <div style="font-size: 0.75rem; color: var(--gray-color); text-transform: uppercase; font-weight: 600;">Kapasitas</div>
                    <div style="font-weight: 600; color: var(--dark-color);">${event.capacity} orang</div>
                </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class="fas fa-building" style="color: #f97316; font-size: 1.25rem;"></i>
                </div>
                <div>
                    <div style="font-size: 0.75rem; color: var(--gray-color); text-transform: uppercase; font-weight: 600;">Penyelenggara</div>
                    <div style="font-weight: 600; color: var(--dark-color);">${event.organizer}</div>
                </div>
            </div>
        </div>

        <div style="margin-top: 2rem; padding: 1.5rem; background: white; border-radius: 12px; border-left: 4px solid var(--primary-color);">
            <h3 style="margin-bottom: 1rem; color: var(--dark-color); display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-align-left"></i> Deskripsi Event
            </h3>
            <p style="color: var(--gray-color); line-height: 1.8; text-align: justify;">${event.description}</p>
        </div>

        <div style="margin-top: 1.5rem; padding: 1rem; background: var(--light-color); border-radius: 8px; text-align: center; font-size: 0.875rem; color: var(--gray-color);">
            <i class="fas fa-info-circle"></i> Event ini sudah disetujui oleh admin dan terbuka untuk umum
        </div>
    `;

    const modalContentElement = document.getElementById('eventModalContent');
    const modal = document.getElementById('viewEventModal');

    if (modalContentElement && modal) {
        modalContentElement.innerHTML = modalContent;
        modal.classList.add('active');
        console.log('✅ Modal opened successfully');
    } else {
        console.error('❌ Modal elements not found!');
    }
}

// Close event modal
function closeEventModal() {
    console.log('Closing event modal...');
    const modal = document.getElementById('viewEventModal');
    if (modal) {
        modal.classList.remove('active');
        console.log('✅ Modal closed');
    }
}

// Make function globally accessible
window.closeEventModal = closeEventModal;

// Setup event listeners
function setupEventListeners() {
    console.log('⚙️ Setting up event listeners...');

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

    // Close modal when clicking outside
    const modal = document.getElementById('viewEventModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeEventModal();
            }
        });
    }

    console.log('✅ Event listeners setup complete');
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

console.log('✅ script.js initialized successfully');