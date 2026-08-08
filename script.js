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
const navbar =
    document.querySelector('.navbar');

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

const observerOptions = {

```
threshold: 0.1,

rootMargin:
    '0px 0px -50px 0px'
```

};

const observer =
new IntersectionObserver(
function (entries) {

```
        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add(
                    'visible'
                );

            }

        });

    },

    observerOptions
);
```

document
.querySelectorAll('.fade-in')
.forEach(element => {

```
    observer.observe(element);

});
```

/* ========================================
Active Navigation Link
======================================== */

window.addEventListener('scroll', function () {

```
const sections =
    document.querySelectorAll(
        'section[id]'
    );

const navLinks =
    document.querySelectorAll(
        '.nav-links a'
    );


let currentSection = '';


sections.forEach(section => {

    const sectionTop =
        section.offsetTop;

    const sectionHeight =
        section.clientHeight;


    if (
        window.scrollY >=
        sectionTop - 200
    ) {

        currentSection =
            section.getAttribute('id');

    }

});


navLinks.forEach(link => {

    link.classList.remove(
        'active'
    );


    if (
        link.getAttribute('href') ===
        '#' + currentSection
    ) {

        link.classList.add(
            'active'
        );

    }

});
```

});

/* ========================================
Contact Form
======================================== */

const contactForm =
document.querySelector(
'#contact-form'
);

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
