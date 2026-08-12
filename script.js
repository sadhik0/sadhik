// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(15, 23, 42, 0.95)';
    } else {
        navbar.style.background = 'rgba(15, 23, 42, 0.9)';
    }
});

// Fade in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Active navigation link
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Projects carousel
(function () {
    const wrapper = document.querySelector('.carousel-wrapper');
    if (!wrapper) return;

    const viewport = wrapper.querySelector('.carousel-viewport');
    const track = wrapper.querySelector('.carousel-track');
    const cards = Array.from(track.children);
    const prevBtn = wrapper.querySelector('.carousel-prev');
    const nextBtn = wrapper.querySelector('.carousel-next');
    const dotsContainer = document.querySelector('.carousel-dots');

    const GAP = 32; // px, matches CSS gap: 2rem
    let visibleCount = 3;
    let cardWidth = 0;
    let current = 0;

    function getVisibleCount() {
        const w = window.innerWidth;
        if (w <= 640) return 1;
        if (w <= 900) return 2;
        return 3;
    }

    function layout() {
        visibleCount = getVisibleCount();
        const viewportWidth = viewport.clientWidth;
        cardWidth = (viewportWidth - GAP * (visibleCount - 1)) / visibleCount;

        cards.forEach(card => {
            card.style.width = cardWidth + 'px';
        });

        const maxIndex = Math.max(0, cards.length - visibleCount);
        if (current > maxIndex) current = maxIndex;

        buildDots(maxIndex);
        update();
    }

    function buildDots(maxIndex) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i <= maxIndex; i++) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'carousel-dot';
            dot.setAttribute('aria-label', 'Go to project ' + (i + 1));
            dot.addEventListener('click', () => {
                current = i;
                update();
            });
            dotsContainer.appendChild(dot);
        }
    }

    function update() {
        const maxIndex = Math.max(0, cards.length - visibleCount);
        const offset = current * (cardWidth + GAP);
        track.style.transform = 'translateX(' + (-offset) + 'px)';

        prevBtn.classList.toggle('carousel-disabled', current === 0);
        nextBtn.classList.toggle('carousel-disabled', current === maxIndex);

        const dots = Array.from(dotsContainer.children);
        dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    }

    prevBtn.addEventListener('click', () => {
        current = Math.max(0, current - 1);
        update();
    });

    nextBtn.addEventListener('click', () => {
        const maxIndex = Math.max(0, cards.length - visibleCount);
        current = Math.min(maxIndex, current + 1);
        update();
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    viewport.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    viewport.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        const delta = touchEndX - touchStartX;
        const maxIndex = Math.max(0, cards.length - visibleCount);
        if (delta > 50) {
            current = Math.max(0, current - 1);
            update();
        } else if (delta < -50) {
            current = Math.min(maxIndex, current + 1);
            update();
        }
    }, { passive: true });

    window.addEventListener('resize', layout);
    layout();
})();

// Certification flip cards
document.querySelectorAll('.certification-card').forEach(card => {
    function toggleFlip() {
        card.classList.toggle('flipped');
    }
    card.addEventListener('click', toggleFlip);
    card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFlip();
        }
    });
});
