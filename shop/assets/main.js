// Bitcoin Shops Thailand - Main JavaScript

let map = null;
let allMarkers = {};
let markerClusterGroup = null;


const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR7UWrVDmXzeG8UHvLU6NAuGucC9GPMy5CRQTzl4pX_BqqRTXnKcczWu78U0oO8dpUR06H5-a_dnHIM/pub?gid=0&single=true&output=csv';
// const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKY3l6jRcq-uNKdIM4xMbHfCWHrZj4-wH3M_MV_2ZYfyusw6uTA2Yi8ncA-LonHIvGk6e9SvT0e2oi/pub?gid=0&single=true&output=csv';

$(document).ready(function() {
    $.fn.dataTable.ext.errMode = 'none';
    
    // 🚀 Add cache-busting timestamp to force fresh data on every page load
    const cacheBustedUrl = GOOGLE_SHEET_CSV_URL + '&timestamp=' + new Date().getTime();
    
    // Load data from Google Sheets instead of local CSV
    Papa.parse(cacheBustedUrl, {
        download: true, header: true, skipEmptyLines: true,
        complete: function(results) {
            let data = results.data.filter(row => row.name && row.name.trim() !== '');
            
            // Shuffle data for random display
            for (let i = data.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [data[i], data[j]] = [data[j], data[i]];
            }

            initApp(data);
        },
        error: function(err) {
            $('#loadingSpinner').html('<p class="text-danger">เกิดข้อผิดพลาดในการโหลดข้อมูลจาก Google Sheet<br><small>กรุณาตรวจสอบว่า Sheet ถูกเผยแพร่แล้ว (File → Share → Publish to web)</small></p>');
            console.error('CSV Load Error:', err);
        }
    });
    $('#btnList').click(function() { switchView('list'); });
    $('#btnMap').click(function() { switchView('map'); });
});

function switchView(viewName) {
    if(viewName === 'list') {
        $('#btnList').addClass('active'); $('#btnMap').removeClass('active');
        $('#listViewSection').show(); $('#mapViewSection').hide();
    } else {
        $('#btnMap').addClass('active'); $('#btnList').removeClass('active');
        $('#listViewSection').hide(); $('#mapViewSection').show();
        if(map) setTimeout(() => map.invalidateSize(), 200);
    }
}

function jumpToMap(index) {
    switchView('map');
    const marker = allMarkers[index];
    if (marker && markerClusterGroup) {
        setTimeout(() => {
            markerClusterGroup.zoomToShowLayer(marker, function() { marker.openPopup(); });
        }, 300);
    }
}

function initApp(data) {
    $('#loadingSpinner').fadeOut(300, function() { $('#mainContent').fadeIn(300); });

    const rawCategories = [...new Set(data.map(d => d.category).filter(Boolean))];
    const categories = rawCategories.filter(c => c.length < 30).sort();
    const provinces = [...new Set(data.map(d => d.province).filter(Boolean))];

    provinces.sort((a, b) => {
        const isThaiA = /^[ก-๙]/.test(a); const isThaiB = /^[ก-๙]/.test(b);
        if (isThaiA && !isThaiB) return -1; if (!isThaiA && isThaiB) return 1;
        return a.localeCompare(b, 'th');
    });

    $('#lastUpdate').text(new Date().toLocaleDateString('th-TH'));
    provinces.forEach(p => $('#provinceFilter').append(`<option value="${p}">${p}</option>`));
    categories.forEach(c => $('#categoryFilter').append(`<option value="${c}">${c}</option>`));

    const tableData = data.map((row, index) => {
        const cat = row.category || 'Others';
        let badgeClass = getBadgeClass(cat);
        let linkHtml = getLinkHtml(row);
        let phoneHtml = row.phone ? `<div class="small text-muted mt-1"><i class="fas fa-phone-alt me-1"></i> ${row.phone}</div>` : '';
        let mapBtnHtml = '';
        if(row.lat && row.lon && !isNaN(row.lat)) {
            mapBtnHtml = `<button onclick="jumpToMap(${index})" class="btn btn-jumptomap" title="ดูบนแผนที่"><i class="fas fa-map-marker-alt"></i></button>`;
        }
        return [
            `<div class="fw-bold text-dark">${row.name}</div>${phoneHtml}`,
            `<span class="badge badge-cat ${badgeClass}">${cat}</span>`,
            `<div class="d-flex align-items-center">${mapBtnHtml}<span class="text-secondary">${row.province || '-'}</span></div>`,
            linkHtml, row.details || ''
        ];
    });

    const table = $('#shopsTable').DataTable({
        data: tableData, dom: '<"d-none"l>rtip', pageLength: 10, ordering: false,
        language: {
            zeroRecords: "<div class='text-center py-5 text-muted'>ไม่พบข้อมูลร้านค้า</div>",
            info: "<span class='text-muted small'>แสดง _START_-_END_ จากทั้งหมด _TOTAL_ ร้าน</span>",
            infoEmpty: "ไม่พบข้อมูล", infoFiltered: "",
            paginate: { next: '<i class="fas fa-chevron-right"></i>', previous: '<i class="fas fa-chevron-left"></i>' }
        },
        columnDefs: [{ targets: 4, visible: false, searchable: true }],
        drawCallback: function(settings) {
            var api = this.api();
            var rows = api.rows({ search: 'applied' }).data();
            $('#totalShops').text(rows.length);
            
            var visibleProvinces = new Set();
            var visibleCats = new Set();
            
            rows.each(function(r) {
                var provText = $('<div>').html(r[2]).text().trim();
                if(provText && provText !== '-') visibleProvinces.add(provText);
                var catText = $('<div>').html(r[1]).text().trim();
                if(catText) visibleCats.add(catText);
            });
            
            $('#totalProvinces').text(visibleProvinces.size);
            $('#totalCats').text(visibleCats.size);
        }
    });

    $('#searchInput').on('keyup', function() { table.search(this.value).draw(); });
    $('#provinceFilter').on('change', function() { table.column(2).search(this.value ? this.value : '', true, false).draw(); });
    $('#categoryFilter').on('change', function() { table.column(1).search(this.value ? `^${this.value}$` : '', true, false).draw(); });
    initMap(data);
}

function initMap(data) {
    map = L.map('map').setView([13.7563, 100.5018], 6);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CARTO', subdomains: 'abcd', maxZoom: 20
    }).addTo(map);

    markerClusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        disableClusteringAtZoom: 15,
        maxClusterRadius: 30
    });

    data.forEach((row, index) => {
        if(row.lat && row.lon && !isNaN(row.lat) && !isNaN(row.lon)) {
            let badgeClass = getBadgeClass(row.category || '');
            let googleMapLink = `https://www.google.com/maps/search/?api=1&query=${row.lat},${row.lon}`;
            let popupContent = `
                <div class="map-popup text-center">
                    <h6 class="fw-bold mb-1">${row.name}</h6>
                    <span class="badge badge-cat ${badgeClass} mb-2">${row.category || 'General'}</span>
                    <p class="small text-muted mb-1"><i class="fas fa-map-marker-alt"></i> ${row.province || ''}</p>
                    <a href="${googleMapLink}" target="_blank" class="btn btn-primary btn-sm btn-map-dir text-white">
                        <i class="fas fa-location-arrow"></i> นำทาง (Google Maps)
                    </a>
                </div>`;
            const marker = L.marker([row.lat, row.lon]).bindPopup(popupContent);
            markerClusterGroup.addLayer(marker);
            allMarkers[index] = marker;
        }
    });
    map.addLayer(markerClusterGroup);
}

function getBadgeClass(cat) {
    if(cat.includes('Food') || cat.includes('Restaurant') || cat.includes('Cafe')) return 'bg-food';
    if(cat.includes('Accom') || cat.includes('Hotel')) return 'bg-accom';
    if(cat.includes('Shop') || cat.includes('Store')) return 'bg-shop';
    if(cat.includes('Health') || cat.includes('Clinic')) return 'bg-health';
    if(cat.includes('Cannabis') || cat.includes('Service')) return 'bg-cannabis';
    if(cat.includes('Service')) return 'bg-service';
    return 'bg-light text-dark';
}

function getLinkHtml(row) {
    if(!row.final_link) return '<span class="text-muted small">-</span>';
    let btnClass = 'btn-web', icon = 'fa-globe', label = 'Website';
    if(row.final_link.includes('facebook')) { btnClass = 'btn-fb'; icon = 'fa-facebook'; label = 'Facebook'; }
    else if(row.final_link.includes('instagram')) { btnClass = 'btn-ig'; icon = 'fa-instagram'; label = 'Instagram'; }
    return `<a href="${row.final_link}" target="_blank" class="btn btn-contact ${btnClass}"><i class="fab ${icon} me-1"></i> ${label}</a>`;
}

