// Countdown Timer
function updateCountdown() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5); // 5 days from now
    targetDate.setHours(0, 0, 0, 0);

    const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        if (daysEl) daysEl.innerText = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.innerText = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.innerText = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.innerText = seconds.toString().padStart(2, '0');

        if (distance < 0) {
            clearInterval(timer);
            const wrapper = document.querySelector('.countdown-grid');
            if (wrapper) wrapper.innerHTML = "<h2 class='heading-xl'>YA EMPEZÓ!</h2>";
        }
    }, 1000);
}

// Calendar Logic
function initCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    if (!calendarDays) return;

    let date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();

    const months = [
        "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
        "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    ];

    const eventsData = {
        10: { title: "Bajo Mundo x Planta", info: "Vicky + Bleggg", img: "img/prox-1.png" },
        21: { title: "Edición Intensa", info: "Secret Lineup", img: "img/prox-2.png" },
        28: { title: "Networking DJ", info: "Terraza G10", img: "img/prox-2.png" }
    };

    const tooltip = document.getElementById('calendarTooltip');

    function renderCalendar() {
        calendarDays.innerHTML = `
            <span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sa</span><span>Do</span>
        `;

        currentMonthYear.innerText = `${months[currentMonth]} ${currentYear}`;

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        let startDay = firstDay === 0 ? 6 : firstDay - 1;

        const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = startDay; i > 0; i--) {
            const span = document.createElement('span');
            span.className = 'calendar-date muted';
            span.innerText = prevMonthDays - i + 1;
            calendarDays.appendChild(span);
        }

        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const span = document.createElement('span');
            span.className = 'calendar-date';
            if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                span.classList.add('active');
            }
            if (eventsData[i] && currentMonth === today.getMonth()) {
                span.style.border = "2px solid white";
                span.addEventListener('mouseenter', (e) => {
                    const data = eventsData[i];
                    tooltip.innerHTML = `
                        <img src="${data.img}" alt="Event">
                        <h4>${data.title}</h4>
                        <p>${data.info}</p>
                    `;
                    tooltip.style.display = 'block';
                    const rect = span.getBoundingClientRect();
                    const widgetRect = document.querySelector('.calendar-widget').getBoundingClientRect();
                    tooltip.style.left = `${rect.left - widgetRect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
                    tooltip.style.top = `${rect.top - widgetRect.top - tooltip.offsetHeight - 15}px`;
                });
                span.addEventListener('mouseleave', () => {
                    tooltip.style.display = 'none';
                });
            }
            span.innerText = i;
            span.addEventListener('click', () => {
                document.querySelectorAll('.calendar-date').forEach(d => d.classList.remove('active'));
                span.classList.add('active');
            });
            calendarDays.appendChild(span);
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar();
    });

    renderCalendar();
}

// Past Events Tabs
function initPastEventsTabs() {
    const tabs = document.querySelectorAll('.tab-year');
    if (tabs.length === 0) return;
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const selectedYear = tab.getAttribute('data-year');
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.past-events-grid').forEach(grid => {
                grid.style.display = 'none';
            });
            const targetGrid = document.getElementById(`grid-${selectedYear}`);
            if (targetGrid) targetGrid.style.display = 'grid';
        });
    });
}

// Particles Animation
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const particleCount = 40;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 5 + 2 + 'px';
        const left = Math.random() * 100 + '%';
        const delay = Math.random() * 5 + 's';
        const duration = Math.random() * 10 + 5 + 's';
        particle.style.width = size;
        particle.style.height = size;
        particle.style.left = left;
        particle.style.animationDelay = delay;
        particle.style.setProperty('--d', duration);
        container.appendChild(particle);
    }
}

// Winner Particles
function initWinnerParticles() {
    const container = document.getElementById('winnerParticles');
    if (!container) return;
    const count = 30;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'winner-particle';
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 150 + 100;
        const x = Math.cos(angle) * radius + 'px';
        const y = Math.sin(angle) * radius + 'px';
        const size = Math.random() * 6 + 2 + 'px';
        const delay = Math.random() * 3 + 's';
        const duration = Math.random() * 2 + 2 + 's';
        p.style.width = size;
        p.style.height = size;
        p.style.left = '50%';
        p.style.top = '50%';
        p.style.animationDelay = delay;
        p.style.setProperty('--d', duration);
        p.style.setProperty('--x', x);
        p.style.setProperty('--y', y);
        container.appendChild(p);
    }
}

// Glossary Logic
function initGlossary() {
    const glossaryContainer = document.getElementById('glossary-container');
    const letterBtns = document.querySelectorAll('.letter-btn');
    if (!glossaryContainer || letterBtns.length === 0) return;

    const glossaryData = [
        { term: "Abusador", desc: "Alguien que destaca mucho, que rompe en la pista o en la música.", letter: "A" },
        { term: "Bajo Mundo", desc: "El estilo de vida urbano, la calle y la autenticidad de los barrios.", letter: "B" },
        { term: "Chucky", desc: "Estar modo Chucky es estar activo, con energía o con ganas de fiesta.", letter: "C" },
        { term: "Dembow", desc: "Ritmo base de la música urbana dominicana que nos mueve.", letter: "D" },
        { term: "Flow", desc: "Estilo personal, carisma y forma de moverse.", letter: "F" },
        { term: "Klk", desc: "¿Qué lo que? El saludo oficial del Bajo Mundo.", letter: "K" }
    ];

    function renderGlossary(filterLetter = 'A') {
        const filtered = glossaryData.filter(item => item.letter === filterLetter);
        if (filtered.length === 0) {
            glossaryContainer.innerHTML = '<p style="text-align:center;opacity:0.5;padding:2rem;">No hay términos con esta letra todavía...</p>';
            return;
        }
        glossaryContainer.innerHTML = filtered.map(item => `
            <div class="glossary-card">
                <h4>${item.term}</h4>
                <p class="glossary-desc">${item.desc}</p>
            </div>
        `).join('');
    }

    letterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            letterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderGlossary(btn.innerText);
        });
    });
    renderGlossary('A');
}

// Login Tabs
function initLoginTabs() {
    const tabs = document.querySelectorAll('.login-tab');
    const loginForm = document.querySelector('.login-card form');
    if (!tabs.length || !loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const activeTab = document.querySelector('.login-tab.active');
        const role = activeTab ? activeTab.innerText.trim().toLowerCase() : 'usuario';
        let target = 'index.html';
        if (role === 'artista') target = 'dashboard-artista.html';
        window.location.href = target;
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

// DOM Init
document.addEventListener('DOMContentLoaded', () => {
    console.log('Bajo Mundo Hub Local Ready');
    updateCountdown();
    initCalendar();
    initPastEventsTabs();
    initParticles();
    initWinnerParticles();
    initGlossary();
    initLoginTabs();
    
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });
});
