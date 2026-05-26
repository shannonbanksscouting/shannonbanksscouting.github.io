/* ============================================
   Shannon Banks 25th Limerick Scouting
   Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initThemeToggle();
    initScrollEffects();
    initShareActions();
    initAOS();
    initDeepLinkHighlight();
    initDynamicCopyright();
});

/* ---- DYNAMIC COPYRIGHT YEAR ---- */
function initDynamicCopyright() {
    const el = document.querySelector('.footer-bottom p');
    if (el && el.textContent.includes('©')) {
        el.textContent = el.textContent.replace(/© \d{4}/, `© ${new Date().getFullYear()}`);
    }
}

/* ---- NAVIGATION ---- */
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu on link click
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                document.body.style.overflow = '';
                hamburger.focus();
            }
        });
    }

    setActiveNavLink();
}

function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

/* ---- DARK MODE TOGGLE ---- */
function initThemeToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    // Load saved preference or use system preference
    const saved = localStorage.getItem('theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    }

    updateToggleIcon(toggle);

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        let next;
        if (current === 'dark') {
            next = 'light';
        } else if (current === 'light') {
            next = 'dark';
        } else {
            // No explicit theme — toggle away from system default
            next = prefersDark ? 'light' : 'dark';
        }

        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateToggleIcon(toggle);
    });
}

function updateToggleIcon(toggle) {
    const theme = document.documentElement.getAttribute('data-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (!theme && prefersDark);

    toggle.innerHTML = isDark
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

    toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

/* ---- SCROLL EFFECTS ---- */
function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const observer = new IntersectionObserver(
        ([entry]) => {
            navbar.classList.toggle('scrolled', !entry.isIntersecting);
        },
        { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );

    // Observe a sentinel element at the top of the page
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.position = 'absolute';
    sentinel.style.top = '0';
    document.body.prepend(sentinel);
    observer.observe(sentinel);

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/* ---- SHARE & COPY LINK ---- */
function initShareActions() {
    // Copy link buttons
    document.querySelectorAll('[data-action="copy-link"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const url = btn.getAttribute('data-url') || window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                showToast('Link copied!');
            }).catch(() => {
                // Fallback for older browsers
                const input = document.createElement('input');
                input.value = url;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
                showToast('Link copied!');
            });
        });
    });

    // WhatsApp share
    document.querySelectorAll('[data-action="share-whatsapp"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const text = btn.getAttribute('data-text') || document.title;
            const url = btn.getAttribute('data-url') || window.location.href;
            const waUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
            window.open(waUrl, '_blank', 'noopener,noreferrer');
        });
    });

    // Facebook share
    document.querySelectorAll('[data-action="share-facebook"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const url = btn.getAttribute('data-url') || window.location.href;
            const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            window.open(fbUrl, '_blank', 'noopener,noreferrer');
        });
    });
}

function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => {
        toast.classList.remove('visible');
    }, 2500);
}

/* ---- AOS INIT ---- */
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600,
            once: true,
            offset: 80,
            easing: 'ease-out-cubic'
        });
    }
}

/* ---- DEEP LINK HIGHLIGHT ---- */
function initDeepLinkHighlight() {
    const hash = window.location.hash;
    if (!hash) return;

    const target = document.querySelector(hash);
    if (target) {
        // Small delay to let page settle
        setTimeout(() => {
            target.classList.add('highlight-target');
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Remove highlight after animation
            setTimeout(() => {
                target.classList.remove('highlight-target');
            }, 2500);
        }, 300);
    }
}
