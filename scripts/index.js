const dots = [];
let dotsPaused = false;
let animationFrame = null;

function createGrid() {
    const grid = document.getElementById("dotGrid");
    grid.innerHTML = "";
    dots.length = 0;
    const spacing = 24;
    const columns = Math.ceil(window.innerWidth / spacing);
    const rows = Math.ceil(window.innerHeight / spacing);

    grid.style.setProperty("--columns", `${columns}`);
    grid.style.setProperty("--rows", `${rows}`);

    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const dot = document.createElement("div");
            dot.className = "dot";
            dots.push({element: dot, x: column * spacing + spacing / 2, y: row * spacing + spacing / 2});
            grid.appendChild(dot);
        }
    }
}

function updateDots(mouseX, mouseY, mouseX2, mouseY2) {
    const radius = 300;

    for (const dot of dots) {
        const dx1 = dot.x - mouseX;
        const dy1 = dot.y - mouseY;
        const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        const influence1 = Math.max(0, 1 - distance1 / radius);

        const dx2 = dot.x - mouseX2;
        const dy2 = dot.y - mouseY2;
        const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        const influence2 = Math.max(0, 1 - distance2 / radius);

        const combinedInfluence = Math.max(influence1, influence2);
        dot.element.style.setProperty("--scale", 1 + combinedInfluence * 2);
        dot.element.style.setProperty("--opacity", 0.12 + combinedInfluence);

        let H, S, L, light;
        if (document.documentElement.classList.contains("pink")) {
            H = 178;
            S = 100;
            L = 85;
        } else {
            light = document.documentElement.classList.contains("light");
            H = (dot.x * 0.12 + dot.y * 0.08 + mouseX * 0.04 + mouseY * 0.03) % 360;
            S = light ? 100 : 80;
            L = 45 + combinedInfluence * (light ? 15 : 20);
        }
        dot.element.style.setProperty("--color", `hsl(${H},${S}%,${L}%)`);
    }
}

function animate(time) {
    if (dotsPaused) {
        animationFrame = null;
        return;
    }
    const x1 = window.innerWidth / 2 + Math.sin(time * 0.00016) * window.innerWidth * 0.42;
    const y1 = window.innerHeight / 2 + Math.sin(time * 0.00026) * window.innerHeight * 0.42;
    const x2 = window.innerWidth / 2 + Math.sin(time * 0.00028 + 2) * window.innerWidth * 0.42;
    const y2 = window.innerHeight / 2 + Math.sin(time * 0.00011 + 4) * window.innerHeight * 0.42;
    updateDots(x1, y1, x2, y2);
    animationFrame = requestAnimationFrame(animate);
}

function pauseDots() {
    dotsPaused = true;
    if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
}

function resumeDots() {
    if (!dotsPaused) return;
    dotsPaused = false;
    animationFrame = requestAnimationFrame(animate);
}

createGrid();
window.addEventListener("resize", createGrid);
requestAnimationFrame(animate);


const themeToggles = document.querySelectorAll('input[name="mode"]');
const elements = [
    'hom',
    'adv',
    'gam',
    'pro',
    'cer',
    'mai'
].map(id => document.getElementById(`nav-${id}`));
const icons = [
    'house-with-garden',
    'rocket',
    'game-dice',
    'briefcase',
    'clipboard',
    'open-mailbox-with-raised-flag'
].map(n => `streamline-emojis:${n}`)
const picons = [
    'house',
    'rocketship',
    'dice',
    'briefcase',
    'clipboard',
    'mailbox'
].map(n => `at-icons:${n}`)

function updateNavIcons() {
    const isPink = document.documentElement.classList.contains('pink');
    elements.forEach((element, i) => {
        element.setAttribute('icon', isPink ? picons[i] : icons[i]);
        element.setAttribute('class', isPink ? "pink" : "");
    });
}

themeToggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
        document.documentElement.className = toggle.value;
        localStorage.setItem('theme', toggle.value);
        updateNavIcons();
    });
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.className = savedTheme;
    themeToggles.forEach(toggle => {
        toggle.checked = toggle.value === savedTheme;
    })
}

updateNavIcons();


async function inlineIcons() {
    const uses = [...document.querySelectorAll('use[href^="static/img/icons/"]')];
    if (!uses.length) return;

    const files = [...new Set(uses.map((u) => u.getAttribute('href').split('#')[0]))];
    const holder = document.createElement('div');
    holder.setAttribute('aria-hidden', 'true');
    holder.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
    document.body.prepend(holder);

    await Promise.all(files.map(async (file) => {
        try {
            const res = await fetch(file);
            const text = (await res.text()).replace(/<\?xml[^>]*\?>/, '');
            holder.insertAdjacentHTML('beforeend', text);
        } catch (e) {
            console.warn('Icon failed to load:', file, e);
        }
    }));

    holder.querySelectorAll('*').forEach((el) => {
        [...el.attributes].forEach((attr) => {
            if (attr.name !== 'style' && attr.value.includes('var(')) {
                el.style.setProperty(attr.name, attr.value);
                el.removeAttribute(attr.name);
            }
        });
    });

    uses.forEach((u) => {
        u.setAttribute('href', '#' + u.getAttribute('href').split('#')[1]);
    });
}

inlineIcons();


const isGamesPage = /\/games(?:\.html)?\/?$/.test(window.location.pathname);
const loading = document.getElementById("loading");
const goal = !loading ? 0 : (isGamesPage ? 2 : 1);
let eventsTriggered = 0;

const closeLoading = () => {
    if (loading && eventsTriggered === goal) loading.close();
};

if (loading) {
    addEventListener("py:ready", () => {
        eventsTriggered++;
        closeLoading();
    });
    loading.showModal();
}

document.addEventListener("DOMContentLoaded", function () {
    const sensors = Array.from(document.querySelectorAll('input[type="checkbox"]'));

    document.querySelectorAll("label.buffer").forEach((label) => {
        const checkbox = label.control;      // the input linked via for="..."
        const card = label.parentElement;    // .content-block or .glass-sub
        const trayDiv = label.querySelector(".tray");

        label.addEventListener("click", (event) => {
            if (event.target.closest("a, .expand")) return;

            const rect = trayDiv.getBoundingClientRect();
            const inAfterArea =
                event.clientY >= rect.bottom - 50 &&
                event.clientX >= rect.right - 150;
            if (!inAfterArea) event.preventDefault();
        });

        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                sensors.forEach((s) => {
                    if (s !== checkbox) s.checked = false;
                });
                if (isGamesPage) {
                    pauseDots();
                    gameManager.start(checkbox.id);
                }
                requestAnimationFrame(() => {
                    card.scrollIntoView({behavior: "smooth", block: "start"});
                });
            } else if (isGamesPage) {
                gameManager.pause();
                if (!sensors.some((s) => s.checked)) resumeDots();
            }
        });
    });

    if (isGamesPage) {
        document.addEventListener("p5SetupComplete", () => {
            eventsTriggered++;
            closeLoading();
        });
    }
});