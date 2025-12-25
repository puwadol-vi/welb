// *** สำคัญ: เปลี่ยนเป็น Production URL ของคุณ ***
const WEBHOOK_URL = 'https://n8n.kaetkung.uk/webhook/register-event'; 

// Load statistics from CSV
function loadStats() {
    if (typeof Papa === 'undefined') {
        console.warn('PapaParse not loaded, skipping stats');
        return;
    }
    
    Papa.parse('https://docs.google.com/spreadsheets/d/e/2PACX-1vR7UWrVDmXzeG8UHvLU6NAuGucC9GPMy5CRQTzl4pX_BqqRTXnKcczWu78U0oO8dpUR06H5-a_dnHIM/pub?output=csv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            const data = results.data.filter(row => row.name && row.name.trim() !== '');
            
            // Count unique values
            const provinces = [...new Set(data.map(d => d.province).filter(Boolean))];
            const categories = [...new Set(data.map(d => d.category).filter(Boolean))];
            
            // Update DOM elements by ID
            const shopCountEl = document.getElementById('shopCount');
            const provinceCountEl = document.getElementById('provinceCount');
            const categoryCountEl = document.getElementById('categoryCount');
            
            if (shopCountEl) shopCountEl.textContent = data.length + '+';
            if (provinceCountEl) provinceCountEl.textContent = provinces.length + '+';
            if (categoryCountEl) categoryCountEl.textContent = categories.length + '+';
        },
        error: function(err) {
            console.error('Error loading stats:', err);
        }
    });
}

// Load stats when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadStats);
} else {
    loadStats();
}

function toggleMenu() {
    const menu = document.getElementById('mobileNavMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

function toggleFaq(el) {
    const item = el.parentElement;
    const wasActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!wasActive) item.classList.add('active');
}

// ฟังก์ชันสำหรับขยาย/ย่อรายละเอียด Event (บน Mobile)
function toggleDescription(btn) {
    const card = btn.closest('.card');
    const description = card.querySelector('.event-description');
    
    if (description.classList.contains('expanded')) {
        description.classList.remove('expanded');
        btn.innerHTML = 'อ่านเพิ่มเติม ▼';
    } else {
        description.classList.add('expanded');
        btn.innerHTML = 'ย่อ ▲';
    }
}

// ฟังก์ชันเปิด Modal สำหรับ Event Registration
// รองรับทั้ง: openRegisterModal('ชื่อ Event') และ openRegisterModal(element)
function openRegisterModal(eventNameOrElement) {
    let eventName = "";

    // ตรวจสอบว่าเป็น Element หรือ String
    if (typeof eventNameOrElement === 'object' && eventNameOrElement !== null) {
        // ถ้าเป็น Element ให้ดึงค่าจาก data-event หรือ data-name
        eventName = eventNameOrElement.getAttribute('data-event') 
                 || eventNameOrElement.getAttribute('data-name') 
                 || eventNameOrElement.innerText 
                 || "Unknown Event";
    } else if (typeof eventNameOrElement === 'string') {
        // ถ้าเป็น String ใช้ตรงๆ
        eventName = eventNameOrElement;
    }

    // อัพเดท Modal
    document.getElementById('eventModalTitle').innerText = eventName;
    document.getElementById('inputEventName').value = eventName; 
    document.getElementById('eventModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeEventModal() {
    document.getElementById('eventModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function openShopModal(e) {
    if(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    document.getElementById('shopModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    const mobileMenu = document.getElementById('mobileNavMenu');
    if(mobileMenu) {
        mobileMenu.classList.remove('active');
    }
}

function closeShopModal() {
    document.getElementById('shopModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function submitForm(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    
    btn.innerText = 'กำลังบันทึก...';
    btn.disabled = true;

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => {
        if(res.ok) {
            alert('บันทึกข้อมูลสำเร็จ! ทีมงานจะตรวจสอบและดำเนินการต่อครับ');
            e.target.reset();
            closeEventModal();
            closeShopModal();
        } else {
            alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
        }
    })
    .catch(err => {
        console.error(err);
        alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    })
    .finally(() => {
        btn.innerText = originalText;
        btn.disabled = false;
    });
}

// ============================================================
// Event Delegation สำหรับปุ่ม Event Registration
// รองรับทั้ง onclick="openRegisterModal('...')" และ data-event attribute
// ============================================================
document.addEventListener('click', function(e) {
    // หาปุ่มที่มี class 'event-register-btn' หรือมี data-event attribute
    const btn = e.target.closest('.event-register-btn, [data-event]');
    
    if (btn) {
        e.preventDefault();
        e.stopPropagation();
        
        const eventName = btn.getAttribute('data-event') 
                       || btn.getAttribute('data-name')
                       || btn.innerText;
        
        openRegisterModal(eventName);
    }
});

// Smooth scroll สำหรับ anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if(href && href !== '#' && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                const mobileMenu = document.getElementById('mobileNavMenu');
                if(mobileMenu) {
                    mobileMenu.classList.remove('active');
                }
            }
        }
    });
});

// Nav scroll effect is now handled in navbar.js

// ปิด Modal เมื่อคลิกนอก Modal
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeEventModal();
        closeShopModal();
    }
});

// ปิด Modal ด้วยปุ่ม Escape
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeEventModal();
        closeShopModal();
    }
});

