// Load navbar dynamically
(function() {
    // Determine the base path based on current location
    const currentPath = window.location.pathname;
    let basePath = '/assets/';
    
    // Adjust base path for subdirectories
    if (currentPath.includes('/shop/')) {
        basePath = '../assets/';
    } else if (currentPath.includes('/event/')) {
        basePath = '../assets/';
    }
    
    // Load navbar HTML
    fetch(basePath + 'navbar.html')
        .then(response => response.text())
        .then(html => {
            // Insert navbar at the beginning of body
            const navContainer = document.createElement('div');
            navContainer.innerHTML = html;
            document.body.insertBefore(navContainer.firstChild, document.body.firstChild);
            
            // Add scroll effect
            window.addEventListener('scroll', () => {
                const nav = document.getElementById('welb-navbar');
                if (nav) {
                    if (window.scrollY > 20) {
                        nav.classList.add('scrolled');
                    } else {
                        nav.classList.remove('scrolled');
                    }
                }
            });
        })
        .catch(error => console.error('Error loading navbar:', error));
})();

