// Scroll reveal animation
const reveals = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const revealPoint = 100;

        if (elementTop < windowHeight - revealPoint) {
            element.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Fetch Google Scholar stats dynamically
async function fetchScholarStats() {
    const scholarUrl = 'https://scholar.google.com/citations?user=AjYkTi8AAAAJ&hl=en';
    const corsProxies = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?'
    ];

    for (const proxy of corsProxies) {
        try {
            const response = await fetch(proxy + encodeURIComponent(scholarUrl));
            if (!response.ok) continue;

            const html = await response.text();

            // Parse citation metrics from HTML
            const citationsMatch = html.match(/Citations<\/a><\/td><td class="gsc_rsb_std">([0-9,]+)/);
            const hIndexMatch = html.match(/h-index<\/a><\/td><td class="gsc_rsb_std">(\d+)/);
            const i10IndexMatch = html.match(/i10-index<\/a><\/td><td class="gsc_rsb_std">(\d+)/);

            if (citationsMatch) {
                document.getElementById('citations').textContent = citationsMatch[1];
            }
            if (hIndexMatch) {
                document.getElementById('h-index').textContent = hIndexMatch[1];
            }
            if (i10IndexMatch) {
                document.getElementById('i10-index').textContent = i10IndexMatch[1];
            }

            console.log('Scholar stats updated successfully');
            return; // Success, exit
        } catch (error) {
            console.log('Proxy failed, trying next...', error);
        }
    }
    console.log('Using cached scholar stats (all proxies failed)');
}

// Fetch stats on page load
window.addEventListener('load', fetchScholarStats);
