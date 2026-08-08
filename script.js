/* ========================================
Portfolio JavaScript
======================================== */

/* ========================================
Smooth Scrolling
======================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

```
anchor.addEventListener('click', function (event) {

    const targetId = this.getAttribute('href');

    // Ignore empty hash links
    if (!targetId || targetId === '#') {
        return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
        return;
    }

    event.preventDefault();

    target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

});
```

});

/* ========================================
Navbar Scroll Effect
======================================== */

window.addEventListener('scroll', function () {

```
const navbar = document.querySelector('.navbar');

if (!navbar) {
    return;
}

if (window.scrollY > 100) {

    navbar.style.background =
        'rgba(15, 23, 42, 0.95)';

} else {

    navbar.style.background =
        'rgba(15, 23, 42, 0.9)';

}
```

});

/* ========================================
Fade-in Animation on Scroll
======================================== */

const fadeElements = document.querySelectorAll('.fade-in');

if ('IntersectionObserver' in window) {

```
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(
    function (entries) {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add('visible');

                // Stop observing once the animation has happened
                observer.unobserve(entry.target);

            }

        });

    },
    observerOptions
);

fadeElements.forEach(element => {
    observer.observe(element);
});
```

} else {

```
// Fallback for older browsers
fadeElements.forEach(element => {
    element.classList.add('visible');
});
```

}

/* ========================================
Active Navigation Link
======================================== */

function updateActiveNavigation() {

```
const sections = document.querySelectorAll('section[id]');

const navLinks = document.querySelectorAll('.nav-links a');

if (!sections.length || !navLinks.length) {
    return;
}

let currentSection = '';

sections.forEach(section => {

    const sectionTop = section.offsetTop;

    const sectionHeight = section.offsetHeight;

    if (
        window.scrollY >=
        sectionTop - 200
    ) {

        currentSection =
            section.getAttribute('id');

    }

});

navLinks.forEach(link => {

    link.classList.remove('active');

    if (
        link.getAttribute('href') ===
        '#' + currentSection
    ) {

        link.classList.add('active');

    }

});
```

}

window.addEventListener(
'scroll',
updateActiveNavigation
);

/* ========================================
Contact Form
======================================== */

const contactForm =
document.querySelector('#contactForm');

if (contactForm) {

```
contactForm.addEventListener(
    'submit',
    function (event) {

        event.preventDefault();

        alert(
            'Thank you for your message! I will get back to you soon.'
        );

        contactForm.reset();

    }
);
```

}

/* ========================================
Initial Navigation State
======================================== */

document.addEventListener(
'DOMContentLoaded',
function () {

```
    updateActiveNavigation();

}
```

);
