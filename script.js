// Fix: browsers auto-restore the last scroll position on refresh/reopen
// (independent of URL hash). Force every load to start at the top.
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('load', function () {
    if (window.location.hash) {
        history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
});

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

// Generic carousel engine (used for Projects and Certifications)
//
// Design notes (rewrite): sizing is handled entirely by CSS via a
// --vc (visible-count) custom property and a flex-basis calc() on each
// card — this reacts to the real container width instantly and natively,
// so there is no JS-measured pixel width to ever go stale. The only
// thing JS measures is the actual rendered width of a card at the exact
// moment it needs to build a transform — always a fresh, live
// measurement, never a cached one — which is what makes the dot
// indicator and the visible cards guaranteed to agree.
function initCarousel(config) {
    const wrapper = document.querySelector(config.wrapperSelector);
    if (!wrapper) return;

    const track = wrapper.querySelector('.carousel-track');
    const cards = Array.from(track.children);
    const prevBtn = config.arrows ? wrapper.querySelector('.carousel-prev') : null;
    const nextBtn = config.arrows ? wrapper.querySelector('.carousel-next') : null;
    const dotsContainer = document.querySelector(config.dotsSelector);
    const viewport = wrapper.querySelector('.carousel-viewport');

    const GAP = config.gap || 32;
    let visibleCount = config.desktopCount || 3;
    let current = 0;

    function getVisibleCount() {
        const w = window.innerWidth;
        if (w <= 640) return config.mobileCount || 1;
        if (w <= 900) return config.tabletCount || 2;
        return config.desktopCount || 3;
    }

    function getMaxIndex() {
        return Math.max(0, cards.length - visibleCount);
    }

    // Fresh measurement every time — never cached across calls, so it can
    // never disagree with what's actually on screen.
    function getStepPx() {
        const rect = cards[0].getBoundingClientRect();
        return rect.width + GAP;
    }

    function applyVisibleCount() {
        visibleCount = getVisibleCount();
        wrapper.style.setProperty('--vc', visibleCount);
        const maxIndex = getMaxIndex();
        if (current > maxIndex) current = maxIndex;
    }

    function buildDots() {
        if (!dotsContainer) return;
        const maxIndex = getMaxIndex();
        dotsContainer.innerHTML = '';
        for (let i = 0; i <= maxIndex; i++) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'carousel-dot';
            dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
            dot.addEventListener('click', () => {
                current = i;
                render();
            });
            dotsContainer.appendChild(dot);
        }
    }

    // Applies the current index to the screen: transform + disabled
    // states + active dot. This is the single source of truth for what
    // gets drawn, called after every navigation and every layout pass.
    function render() {
        const maxIndex = getMaxIndex();
        const step = getStepPx();
        const offset = current * step;
        if (Number.isFinite(offset)) {
            track.style.transform = 'translateX(' + (-offset) + 'px)';
        }

        if (prevBtn) prevBtn.classList.toggle('carousel-disabled', false);
        if (nextBtn) nextBtn.classList.toggle('carousel-disabled', false);

        if (dotsContainer) {
            const dots = Array.from(dotsContainer.children);
            dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
        }
    }

    function layout() {
        applyVisibleCount();
        buildDots();
        render();
    }

    // Wraparound navigation: past the last slide jumps back to the
    // first, and vice versa — no more clicking all the way back.
    function goPrev() {
        const maxIndex = getMaxIndex();
        current = current === 0 ? maxIndex : current - 1;
        render();
    }

    function goNext() {
        const maxIndex = getMaxIndex();
        current = current === maxIndex ? 0 : current + 1;
        render();
    }

    if (prevBtn) prevBtn.addEventListener('click', goPrev);
    if (nextBtn) nextBtn.addEventListener('click', goNext);

    // Touch/swipe support (distinguishes a tap from a real swipe so
    // tap-to-flip on certification cards still works)
    let touchStartX = 0;
    let touchStartY = 0;
    let draggedFar = false;

    viewport.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        draggedFar = false;
    }, { passive: true });

    viewport.addEventListener('touchmove', e => {
        const dx = Math.abs(e.changedTouches[0].screenX - touchStartX);
        const dy = Math.abs(e.changedTouches[0].screenY - touchStartY);
        if (dx > 10 && dx > dy) draggedFar = true;
    }, { passive: true });

    viewport.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        const delta = touchEndX - touchStartX;
        if (delta > 50) {
            goPrev();
        } else if (delta < -50) {
            goNext();
        }
        if (config.onSwipeEnd) config.onSwipeEnd(draggedFar);
    }, { passive: true });

    // Optional mouse-wheel navigation (desktop certifications carousel)
    if (config.wheel) {
        let wheelLocked = false;
        wrapper.addEventListener('wheel', e => {
            if (Math.abs(e.deltaY) < 10) return;
            e.preventDefault();
            if (wheelLocked) return;
            wheelLocked = true;
            if (e.deltaY > 0) goNext(); else goPrev();
            setTimeout(() => { wheelLocked = false; }, 450);
        }, { passive: false });
    }

    // Re-run layout whenever the container's real size changes for ANY
    // reason (resize, font/icon load reflow, zoom). Sizing itself is
    // handled by CSS, so this just keeps --vc and the dot count correct.
    if (window.ResizeObserver) {
        new ResizeObserver(() => layout()).observe(viewport);
    } else {
        window.addEventListener('resize', layout);
    }
    window.addEventListener('load', layout);
    layout();

    return { goPrev, goNext };
}

// Projects carousel
initCarousel({
    wrapperSelector: '.carousel-wrapper',
    dotsSelector: '.carousel-dots',
    arrows: true,
    wheel: false,
    desktopCount: 3,
    tabletCount: 2,
    mobileCount: 1,
    gap: 32
});

// Certifications carousel — wheel-to-navigate (desktop), swipe (mobile), no arrows
let certJustDragged = false;
initCarousel({
    wrapperSelector: '.cert-carousel-wrapper',
    dotsSelector: '.cert-carousel-dots',
    arrows: false,
    wheel: true,
    desktopCount: 3,
    tabletCount: 2,
    mobileCount: 1,
    gap: 24,
    onSwipeEnd: function (draggedFar) {
        if (draggedFar) {
            certJustDragged = true;
            setTimeout(() => { certJustDragged = false; }, 300);
        }
    }
});

// Certification flip cards (tap/click to flip; suppressed right after a swipe)
document.querySelectorAll('.certification-card').forEach(card => {
    function toggleFlip() {
        if (certJustDragged) return;
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

// ==========================================================
// Sadhik AI — Portfolio Assistant (rule-based, no external API)
// ==========================================================
(function () {

    const portfolioKnowledge = {

        personal: {
            keywords: ['who is sadhik', 'about sadhik', 'tell me about sadhik', 'what does sadhik do', 'who are you', 'introduce'],
            answer: "Sadhik Salim is an MBA Finance graduate from Marian Institute of Management, Kuttikkanam, based in Idukki, Kerala. He works across financial reporting, GST compliance, bookkeeping and business analytics, and combines his finance background with tools like Excel, Power BI, SQL and Python to build finance automation projects."
        },

        education: {
            keywords: ['education', 'study', 'studied', 'degree', 'mba', 'b.com', 'bcom', 'college', 'university', 'cgpa', 'qualification', 'ugc net', 'school', 'sslc', '10th', 'plus two', '+2', 'higher secondary'],
            answer: "Sadhik holds an MBA in Finance from Marian Institute of Management, Kuttikkanam (2024–2026), where he was recognized as Best Outgoing Student. Before that, he completed a B.Com in Finance & Taxation from Mahatma Gandhi University, Kottayam (2020–2023) with a CGPA of 8.06. His schooling includes SSLC (Class 10) from Carmel Matha High School, Mankadavu, with 98% marks, and Higher Secondary (+2) in Commerce from SNDP HSS, Adimali, with 90.6% marks. He has also qualified UGC NET."
        },

        dob: {
            keywords: ['date of birth', 'dob', 'born', 'birthday', 'how old', 'age of sadhik', "sadhik's age"],
            answer: function () {
                const dob = new Date(2003, 6, 29); // 29 July 2003
                const today = new Date();
                let age = today.getFullYear() - dob.getFullYear();
                const hasHadBirthdayThisYear =
                    today.getMonth() > dob.getMonth() ||
                    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
                if (!hasHadBirthdayThisYear) age--;
                return `Sadhik was born on 29th July 2003, which makes him ${age} years old.`;
            }
        },

        publications: {
            keywords: ['publication', 'publications', 'paper', 'papers', 'conference', 'presented', 'seminar'],
            answer: "Sadhik has presented and published papers at multiple academic conferences: the International Conference ICBTS 2026 at Marian Institute of Management, Marian College Kuttikkanam (Autonomous); the National Seminar (NSSFDS-2025) at St. Thomas College (Autonomous), Thrissur; and an International Conference 2025 at Girideepam Business School, Kottayam."
        },

        languages: {
            keywords: ['language', 'languages', 'speak', 'fluent'],
            answer: "Sadhik is proficient in English and Malayalam."
        },

        whyMba: {
            keywords: ['why mba', 'why did he choose mba', 'why an mba'],
            answer: "Sadhik pursued an MBA to build on his B.Com foundation in finance and taxation with broader business, analytics and management knowledge — giving him the skills to combine financial expertise with data-driven decision-making."
        },

        skills: {
            keywords: ['skills', 'skillset', 'excel', 'power bi', 'powerbi', 'sql', 'python', 'tableau', 'tally', 'gst', 'data analytics', 'what can he do', 'tools'],
            answer: "Sadhik's key skills include Advanced Excel, Power BI, Tableau, SQL, Python, Tally Prime, GST compliance, financial analysis & reporting, and data analytics — alongside soft skills like leadership, critical thinking and problem-solving."
        },

        experience: {
            keywords: ['experience', 'work history', 'internship', 'job', 'worked', 'accountant', 'muthoottu', 'highrange', 'cbs ventures'],
            answer: "Sadhik has three professional experiences: Assistant Accountant at Highrange Infrastructure LLP (Jun 2023–Jul 2024), Summer Intern at Muthoottu Mini Financiers Ltd (Apr–Jun 2025), and Finance Associate Intern at CBS Ventures Pvt. Ltd. His work spans bookkeeping, GST verification, bank & inventory reconciliation, payroll, and cost analysis using Tally Prime and Excel."
        },

        certifications: {
            keywords: ['certification', 'certifications', 'course', 'courses', 'certified', 'training'],
            answer: "Sadhik holds certifications including Data Analytics Toolbox (Udemy), Microsoft Advanced Excel 365 Expert, Tally Prime & GST (Relent Cyber College), Power BI, Tableau & Python (The Strategist), Financial Accounting & Analysis (IIM Bangalore, NPTEL), Domain Analytics in Finance using R and Power BI (KPMG), Data Analytics Essentials (Cisco Networking Academy), and Python Essentials 1 (Cisco Networking Academy)."
        },

        projectsOverview: {
            keywords: ['projects', 'what has he built', 'what has sadhik built', 'portfolio projects', 'apps'],
            answer: "Sadhik has built five finance-focused web tools: ReconPro Lite (ledger/bank reconciliation), CleanXcel (Excel data-cleaning automation), BankLens (bank statement analytics), TaxPilot (income tax & GST planning), and FinancialScope (financial statement analysis). All are client-side, browser-based tools — try the links in the Projects section above!",
            followUps: ["Tell me about TaxPilot", "Tell me about FinancialScope", "What is ReconPro Lite?"]
        },

        taxPilot: {
            keywords: ['taxpilot', 'tax pilot'],
            answer: "TaxPilot is a browser-based income tax and GST planning assistant. It walks users through tax computation scenarios and liability estimates to make return preparation and planning easier — and like Sadhik's other tools, it runs entirely client-side, so no data ever leaves the device."
        },

        financialScope: {
            keywords: ['financialscope', 'financial scope'],
            answer: "FinancialScope is a financial statement analysis dashboard. It turns raw financial statements into key ratios and visual summaries to support faster, clearer business and investment decisions."
        },

        reconPro: {
            keywords: ['reconpro', 'recon pro', 'reconciliation tool'],
            answer: "ReconPro Lite is a browser-based ledger vs. bank/GST statement reconciliation tool. You upload two Excel files, map the columns, and instantly get exact, partial, and unmatched records — entirely client-side, no data leaves the device."
        },

        cleanXcel: {
            keywords: ['cleanxcel', 'clean xcel'],
            answer: "CleanXcel is an Excel/CSV data-quality automation tool. It fixes blanks, whitespace, duplicate rows, and date formats automatically, while flagging ambiguous data for human review, with a full audit log for every change."
        },

        bankLens: {
            keywords: ['banklens', 'bank lens'],
            answer: "BankLens is a bank statement analytics dashboard. It extracts and classifies transactions from PDF, Excel, or CSV statements to surface cash flow trends, top vendors, charges, and data-quality issues for management review."
        },

        automation: {
            keywords: ['finance automation', 'why automation', 'interested in automation'],
            answer: "Sadhik's interest in finance automation comes from pairing financial know-how with technology — the goal is cutting repetitive manual work, improving data accuracy, and making financial analysis faster and easier to act on."
        },

        career: {
            keywords: ['career', 'looking for', 'interested in', 'career interest', 'roles', 'job search'],
            answer: "Sadhik is interested in roles that combine finance, taxation, financial analysis, business analytics and technology-driven automation — bridging traditional accounting work with modern data tools."
        },

        achievements: {
            keywords: ['achievement', 'achievements', 'award', 'awards', 'leadership', 'finance club', 'emerging leader'],
            answer: "Highlights include the Best Outgoing Student Award (MBA Batch 2024–2026), UGC NET qualification, the 'Emerging Leader' award, 1st Prize in the Finance Game at Talentime'40 (CUSAT) and Simthesis 17.0, and serving as Finance Club President. He also led the external design team for Caligo 2025 and volunteered with NSS from 2020–2023."
        },

        mbaProject: {
            keywords: ['research', 'dissertation', 'academic project', 'sustainable finance', 'green consumerism', 'mba project', 'thesis'],
            answer: "For his MBA, Sadhik's project is titled 'The emergence of sustainable financial services: examining the green consumerism and spending behaviour in banking services and financial products' — exploring how sustainability trends are shaping customer behaviour in banking and financial services."
        },

        contact: {
            keywords: ['contact', 'email', 'phone', 'reach him', 'linkedin', 'connect'],
            answer: "You can reach Sadhik at sadhiksalim001@gmail.com, by phone at +91 95447 32071, or connect on LinkedIn at linkedin.com/in/sadhik-salim. There's also a Get In Touch section further down this page."
        }
    };

    const intentList = Object.values(portfolioKnowledge);

    const suggestedStarters = [
        "What projects has Sadhik built?",
        "What are Sadhik's key skills?",
        "Tell me about TaxPilot"
    ];

    const fallbackAnswer = "I'm currently designed to answer questions about Sadhik's portfolio, education, skills, experience and projects. Try asking me about his projects, skills, education or career interests.";
    const fallbackFollowUps = ["View Projects", "View Skills", "View Education"];

    function matchIntent(userText) {
        const text = userText.toLowerCase();
        let best = null;
        let bestScore = 0;

        intentList.forEach(intent => {
            let score = 0;
            intent.keywords.forEach(kw => {
                if (text.includes(kw)) score += kw.length; // longer/more specific keyword wins
            });
            if (score > bestScore) {
                bestScore = score;
                best = intent;
            }
        });

        return best;
    }

    function getResponse(userText) {
        const intent = matchIntent(userText);
        if (intent) {
            const text = typeof intent.answer === 'function' ? intent.answer() : intent.answer;
            return { text: text, followUps: intent.followUps || null };
        }
        return { text: fallbackAnswer, followUps: fallbackFollowUps };
    }

    // ---------- UI wiring ----------
    const toggleBtn = document.getElementById('ai-toggle-btn');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('ai-close-btn');
    const messagesEl = document.getElementById('ai-chat-messages');
    const inputEl = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-send-btn');

    if (!toggleBtn) return; // chatbot markup not present

    let started = false;

    function scrollToBottom() {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addBotMessage(text) {
        const el = document.createElement('div');
        el.className = 'ai-msg ai-msg-bot';
        el.textContent = text;
        messagesEl.appendChild(el);
        scrollToBottom();
    }

    function addUserMessage(text) {
        const el = document.createElement('div');
        el.className = 'ai-msg ai-msg-user';
        el.textContent = text;
        messagesEl.appendChild(el);
        scrollToBottom();
    }

    function addQuickReplies(options) {
        const wrap = document.createElement('div');
        wrap.className = 'ai-quick-replies';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ai-quick-reply-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => handleUserQuery(opt));
            wrap.appendChild(btn);
        });
        messagesEl.appendChild(wrap);
        scrollToBottom();
    }

    function showTyping() {
        const el = document.createElement('div');
        el.className = 'ai-typing';
        el.id = 'ai-typing-indicator';
        el.innerHTML = '<span></span><span></span><span></span>';
        messagesEl.appendChild(el);
        scrollToBottom();
    }

    function hideTyping() {
        const el = document.getElementById('ai-typing-indicator');
        if (el) el.remove();
    }

    function handleUserQuery(text) {
        const trimmed = text.trim();
        if (!trimmed) return;

        addUserMessage(trimmed);
        inputEl.value = '';
        showTyping();

        const delay = 500 + Math.random() * 500;
        setTimeout(() => {
            hideTyping();
            const response = getResponse(trimmed);
            addBotMessage(response.text);
            if (response.followUps) {
                addQuickReplies(response.followUps);
            }
        }, delay);
    }

    function openChat() {
        chatWindow.classList.add('open');
        toggleBtn.classList.add('active');
        if (!started) {
            started = true;
            addBotMessage("👋 Welcome to Sadhik's portfolio! I'm Sadhik's portfolio assistant. Ask me about his education, skills, experience, certifications, projects or career interests.");
            addQuickReplies(suggestedStarters);
        }
        inputEl.focus();
    }

    function closeChat() {
        chatWindow.classList.remove('open');
        toggleBtn.classList.remove('active');
    }

    toggleBtn.addEventListener('click', () => {
        chatWindow.classList.contains('open') ? closeChat() : openChat();
    });

    closeBtn.addEventListener('click', closeChat);

    sendBtn.addEventListener('click', () => handleUserQuery(inputEl.value));

    inputEl.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleUserQuery(inputEl.value);
        }
    });

})();

// Border glow — glow follows the cursor while hovering each experience card
document.querySelectorAll('.timeline-content').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--glow-x', x + '%');
        card.style.setProperty('--glow-y', y + '%');
    });
});
