/* ============================================
   EVENT PAGES - COMBINED JAVASCRIPT
   ============================================ */

// Detect which page we're on
const isListPage = $('#events-list').length > 0;
const isDetailPage = $('#event-container').length > 0;

$(document).ready(function() {
    if (isListPage) {
        loadEvents();
        setupFilters();
    } else if (isDetailPage) {
        loadEventData();
    }
});

/* ============================================
   EVENT LIST PAGE FUNCTIONS
   ============================================ */

let allEvents = [];
let filteredEvents = [];

// Load events from CSV
async function loadEvents() {
    try {
        const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBM6wStS4hY_N-6mz2JXz-OIzLYTkvduELyVbwYTijgyiCe2ufxWNJCEkPvhfQv2izp86aR4C9JucM/pub?gid=0&single=true&output=csv';
        const response = await fetch(csvUrl);
        
        if (!response.ok) {
            throw new Error('Failed to load events data');
        }
        
        const csvText = await response.text();
        
        Papa.parse(csvText, {
            header: true,
            dynamicTyping: false,
            skipEmptyLines: true,
            complete: function(results) {
                allEvents = results.data;
                filteredEvents = allEvents;
                
                // Sort by date (newest first)
                filteredEvents.sort((a, b) => {
                    return new Date(b.startDate) - new Date(a.startDate);
                });
                
                renderEvents();
                $('#loading').addClass('d-none');
                $('#filters').removeClass('d-none');
                $('#events-count').removeClass('d-none');
            },
            error: function(error) {
                showError('Failed to parse events data: ' + error.message);
            }
        });
        
    } catch (error) {
        showError('Failed to load events: ' + error.message);
    }
}

// Setup filters
function setupFilters() {
    $('#search-input').on('keyup', applyFilters);
    $('#status-filter').on('change', applyFilters);
    $('#price-filter').on('change', applyFilters);
}

// Apply filters
function applyFilters() {
    const searchTerm = $('#search-input').val().toLowerCase();
    const statusFilter = $('#status-filter').val();
    const priceFilter = $('#price-filter').val();
    
    filteredEvents = allEvents.filter(event => {
        // Search filter
        const matchesSearch = 
            event.name.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm) ||
            event.organizerName.toLowerCase().includes(searchTerm) ||
            (event.locationCity && event.locationCity.toLowerCase().includes(searchTerm));
        
        if (!matchesSearch) return false;
        
        // Status filter
        if (statusFilter !== 'all') {
            const eventStatus = getEventStatus(event);
            if (eventStatus !== statusFilter) return false;
        }
        
        // Price filter
        if (priceFilter !== 'all') {
            const price = parseFloat(event.registerPrice);
            const isFree = isNaN(price) || price === 0;
            
            if (priceFilter === 'free' && !isFree) return false;
            if (priceFilter === 'paid' && isFree) return false;
        }
        
        return true;
    });
    
    renderEvents();
}

// Render events
function renderEvents() {
    const container = $('#events-list');
    container.empty();
    
    // Update count
    $('#count-number').text(filteredEvents.length);
    
    if (filteredEvents.length === 0) {
        $('#empty-state').removeClass('d-none');
        return;
    }
    
    $('#empty-state').addClass('d-none');
    
    filteredEvents.forEach(event => {
        const card = createEventCard(event);
        container.append(card);
    });
}

// Create event card
function createEventCard(event) {
    const status = getEventStatus(event);
    const statusBadge = getStatusBadgeHTML(status);
    const priceDisplay = getPriceDisplay(event);
    const startDate = formatDate(event.startDate);
    const startTime = formatTime(event.startDate);
    
    // Truncate description
    const description = event.description.length > 150 
        ? event.description.substring(0, 150) + '...'
        : event.description;
    
    const card = $(`
        <div class="col-md-6 col-lg-4">
            <a href="detail.html?id=${event.id}" class="event-card">
                <div class="event-card-image">
                    <i class="fa-solid fa-calendar-days"></i>
                </div>
                <div class="event-card-body">
                    <div class="event-card-header">
                        <h3 class="event-card-title">${escapeHtml(event.name)}</h3>
                        ${statusBadge}
                    </div>
                    
                    <div class="event-meta">
                        <div class="event-meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>${startDate}</span>
                        </div>
                        <div class="event-meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${startTime}</span>
                        </div>
                        ${event.locationCity ? `
                            <div class="event-meta-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${escapeHtml(event.locationCity)}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="event-description">
                        ${escapeHtml(description)}
                    </div>
                    
                    <div class="event-footer">
                        <div class="event-organizer">
                            <i class="fas fa-users"></i>
                            <span>${escapeHtml(event.organizerName)}</span>
                        </div>
                        <div class="event-price ${priceDisplay === 'Free' ? '' : 'paid'}">
                            ${priceDisplay}
                        </div>
                    </div>
                </div>
            </a>
        </div>
    `);
    
    return card;
}

// Get status badge HTML
function getStatusBadgeHTML(status) {
    switch (status) {
        case 'live':
            return '<span class="event-badge badge-live">Live Now</span>';
        case 'upcoming':
            return '<span class="event-badge badge-upcoming">Upcoming</span>';
        case 'past':
            return '<span class="event-badge badge-past">Past Event</span>';
    }
}

/* ============================================
   EVENT DETAIL PAGE FUNCTIONS
   ============================================ */

let currentEvent = null;

// Extract event ID from URL
function getEventIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    
    if (idParam) {
        return idParam;
    }
    
    // Extract from path
    const path = window.location.pathname;
    const match = path.match(/\/event\/([^\/]+)/);
    return match ? match[1] : null;
}

// Load event data
async function loadEventData() {
    const eventId = getEventIdFromUrl();
    
    if (!eventId) {
        showError('No event ID provided');
        return;
    }
    
    try {
        // Load events data from CSV file with cache-busting
        const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBM6wStS4hY_N-6mz2JXz-OIzLYTkvduELyVbwYTijgyiCe2ufxWNJCEkPvhfQv2izp86aR4C9JucM/pub?gid=0&single=true&output=csv';
        const response = await fetch(csvUrl);
        
        if (!response.ok) {
            throw new Error('Failed to load events data');
        }
        
        const csvText = await response.text();
        
        // Parse CSV using Papa Parse
        Papa.parse(csvText, {
            header: true,
            dynamicTyping: false,
            skipEmptyLines: true,
            complete: function(results) {
                const event = results.data.find(e => e.id === eventId);
                
                if (!event) {
                    showError('Event not found');
                    return;
                }
                
                currentEvent = event;
                renderEvent(event);
            },
            error: function(error) {
                console.error('Error parsing CSV:', error);
                showError('Failed to parse event data: ' + error.message);
            }
        });
        
    } catch (error) {
        console.error('Error loading event:', error);
        showError('Failed to load event data: ' + error.message);
    }
}

// Render event data
function renderEvent(event) {
    $('#loading').addClass('d-none');
    $('#event-container').removeClass('d-none');
    
    // Update page title
    document.title = `${event.name} - Bitcoin Events Thailand`;
    
    // Render each section
    renderDefaultImage(event);
    renderActionButtons(event);
    renderEventHeader(event);
    renderOrganizer(event);
    renderEventDetails(event);
    renderLocation(event);
    renderDescription(event);
}

// Render Default Image
function renderDefaultImage(event) {
    const html = `
        <div class="main-image">
            <img src="/public/icon.png" alt="${event.name}" id="main-event-image">
        </div>
    `;
    
    $('#event-images').html(html);
}

// Render Action Buttons
function renderActionButtons(event) {
    let html = '';
    
    // Register button
    if (event.registerUrl && event.registerUrl.trim() !== '') {
        html += `
            <button class="btn btn-primary" onclick="handleRegister()">
                <i class="fas fa-external-link-alt me-2"></i>Register
            </button>
        `;
    }
    
    // Add to Calendar button
    html += `
        <button class="btn btn-outline-primary" onclick="handleAddToCalendar()">
            <i class="fas fa-calendar me-2"></i>Add to Calendar
        </button>
    `;
    
    // Share button
    html += `
        <button class="btn btn-outline-primary" onclick="handleShare()">
            <i class="fas fa-share-alt me-2"></i>Share Event
        </button>
    `;
    
    $('#action-buttons').html(html);
}

// Handle Register
function handleRegister() {
    if (currentEvent.registerUrl && currentEvent.registerUrl.trim() !== '') {
        window.open(currentEvent.registerUrl, '_blank');
    }
}

// Handle Add to Calendar
function handleAddToCalendar() {
    const event = currentEvent;
    const startDate = new Date(event.startDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = event.endDate && event.endDate.trim() !== ''
        ? new Date(event.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
        : startDate;
    
    const title = encodeURIComponent(event.name);
    const details = encodeURIComponent(event.description);
    const location = event.locationBuildingName && event.locationCity
        ? encodeURIComponent(`${event.locationBuildingName}, ${event.locationCity}`)
        : '';
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
    
    window.open(calendarUrl, '_blank');
}

// Handle Share
async function handleShare() {
    const shareData = {
        title: currentEvent.name,
        text: currentEvent.description,
        url: window.location.href
    };
    
    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error('Error sharing:', err);
            copyToClipboard(window.location.href);
        }
    } else {
        copyToClipboard(window.location.href);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Render Event Header
function renderEventHeader(event) {
    const status = getEventStatus(event);
    const statusBadge = getStatusBadge(status);
    const priceDisplay = getPriceDisplay(event);
    
    const startDate = formatDate(event.startDate);
    const startTime = formatTime(event.startDate);
    
    let html = `
        <div class="mb-3">
            ${statusBadge}
        </div>
        <h1>${event.name}</h1>
        <div class="event-meta">
            <div>
                <i class="fas fa-calendar"></i>
                ${startDate}
            </div>
            <div>
                <i class="fas fa-clock"></i>
                ${startTime}
            </div>
            ${priceDisplay ? `<div class="event-price">${priceDisplay}</div>` : ''}
        </div>
    `;
    
    $('#event-header').html(html);
}

// Get Status Badge
function getStatusBadge(status) {
    switch (status) {
        case 'live':
            return '<span class="badge badge-live">Live Now</span>';
        case 'upcoming':
            return '<span class="badge badge-upcoming">Upcoming</span>';
        case 'past':
            return '<span class="badge badge-past">Past Event</span>';
    }
}

// Render Organizer
function renderOrganizer(event) {
    if (!event.organizerName) return;
    
    const html = `
        <div class="organizer-info">
            <div class="organizer-avatar">
                <i class="fas fa-users"></i>
            </div>
            <div class="organizer-details">
                <h6>${event.organizerName}</h6>
                <small>Event Organizer</small>
            </div>
        </div>
    `;
    
    $('#organizer-section .card-body').html(html);
    $('#organizer-section').removeClass('d-none');
}

// Render Event Details (Date/Time)
function renderEventDetails(event) {
    let html = `
        <div class="detail-item">
            <i class="fas fa-calendar"></i>
            <strong>Start:</strong>
            <span>${formatDateTime(event.startDate)}</span>
        </div>
    `;
    
    if (event.endDate) {
        html += `
            <div class="detail-item">
                <i class="fas fa-calendar"></i>
                <strong>End:</strong>
                <span>${formatDateTime(event.endDate)}</span>
            </div>
        `;
    }
    
    $('#details-container').html(html);
}

// Render Location
function renderLocation(event) {
    if (!event.locationBuildingName) return;
    
    const html = `
        <div class="location-info">
            <i class="fas fa-map-marker-alt"></i>
            <div class="location-details">
                <h6>${event.locationBuildingName}</h6>
                <p>${event.locationAddress}, ${event.locationCity}</p>
                ${event.locationGoogleMapsUrl && event.locationGoogleMapsUrl.trim() !== '' ? `
                    <a href="${event.locationGoogleMapsUrl}" target="_blank" class="map-link">
                        <i class="fas fa-map-pin"></i>
                        View on Google Maps
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                ` : ''}
            </div>
        </div>
    `;
    
    $('#location-container').html(html);
    $('#location-section').removeClass('d-none');
}

// Render Description
function renderDescription(event) {
    $('#description-container').text(event.description);
}

/* ============================================
   SHARED UTILITY FUNCTIONS
   ============================================ */

// Show error
function showError(message) {
    $('#loading').addClass('d-none');
    $('#error-message').text(message);
    $('#error-container').removeClass('d-none');
}

// Get event status
function getEventStatus(event) {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = event.endDate && event.endDate.trim() !== ''
        ? new Date(event.endDate)
        : new Date(start.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours
    
    if (now >= start && now <= end) return 'live';
    if (now < start) return 'upcoming';
    return 'past';
}

// Get price display
function getPriceDisplay(event) {
    const price = parseFloat(event.registerPrice);
    
    if (isNaN(price) || price === 0) {
        return 'Free';
    }
    
    if (price > 0 && event.registerCurrency) {
        return `${price} ${event.registerCurrency}`;
    }
    
    return null;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format time
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format date time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

