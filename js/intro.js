'use strict';

/* ═══════════════════════════════════════════════════
   INTRO.JS — Sud Web Project — Ultra Premium
   Garde l'animation particules hexagone originale.
   Ajoute :
   · Barre de progression premium
   · Révélation des textes en cascade fine
   · Anneau orbit + grain
   · Sortie avec rideau de 5 panneaux
   ═══════════════════════════════════════════════════ */

// ── CONFIG ────────────────────────────────────────
const CONFIG = {
    particleCount: 300,
    hexagonRadius: window.innerWidth < 768 ? 100 : 150,
    codeSymbolSize: window.innerWidth < 768 ? 55 : 80,
    animationDuration: 2800,  /* légèrement plus rapide */
    glowColor: '#3B82F6',
    particleColor: '#60A5FA',
};

// ── CANVAS ────────────────────────────────────────
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;
let centerX = width / 2;
let centerY = height / 2;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    centerX = width / 2;
    centerY = height / 2;
}, { passive: true });

// ── PARTICLE ──────────────────────────────────────
class Particle {
    constructor(targetX, targetY, isCode = false) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 600 + 400;
        this.x = centerX + Math.cos(angle) * distance;
        this.y = centerY + Math.sin(angle) * distance;
        this.targetX = targetX;
        this.targetY = targetY;
        this.size = isCode ? 2.5 : Math.random() * 1.8 + 0.6;
        this.isCode = isCode;
        this.progress = 0;
        this.arrived = false;
        this.oscOffset = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.4 + 0.8; /* vitesse variable */
    }

    update(delta) {
        if (!this.arrived) {
            this.progress += delta * this.speed;
            if (this.progress >= 1) { this.progress = 1; this.arrived = true; }
            const e = 1 - Math.pow(1 - this.progress, 3);
            this.x += (this.targetX - this.x) * e * 0.1;
            this.y += (this.targetY - this.y) * e * 0.1;
        } else {
            const t = Date.now() * 0.001;
            const osc = Math.sin(t * 2 + this.oscOffset) * 1.2;
            this.x = this.targetX + osc;
            this.y = this.targetY + Math.cos(t * 2 + this.oscOffset) * 1.2;
        }
    }

    draw() {
        const glow = this.isCode ? 14 : 7;
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glow);
        grad.addColorStop(0, this.isCode ? CONFIG.glowColor : CONFIG.particleColor);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.isCode ? '#fff' : CONFIG.particleColor;
        ctx.globalAlpha = this.isCode ? 1 : 0.85;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// ── HEXAGONE ──────────────────────────────────────
function hexPoints(cx, cy, r, perSide) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
        const a1 = ((i * 60) - 90) * Math.PI / 180;
        const a2 = (((i + 1) * 60) - 90) * Math.PI / 180;
        const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
        const x2 = cx + Math.cos(a2) * r, y2 = cy + Math.sin(a2) * r;
        for (let j = 0; j < perSide; j++) {
            const t = j / perSide;
            pts.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t, isCode: false });
        }
    }
    return pts;
}

// ── SYMBOLE </> ───────────────────────────────────
function codePoints(cx, cy, size) {
    const pts = [];
    for (let i = 0; i < 15; i++) {
        const t = i / 15;
        pts.push({ x: cx - size / 2 + t * size / 3, y: cy - size / 3 + t * size / 1.5, isCode: true });
        pts.push({ x: cx - size / 2 + t * size / 3, y: cy + size / 3 - t * size / 1.5, isCode: true });
    }
    for (let i = 0; i < 20; i++) {
        const t = i / 20;
        pts.push({ x: cx - size / 4 + t * size / 2, y: cy + size / 2.5 - t * size * 1.2, isCode: true });
    }
    for (let i = 0; i < 15; i++) {
        const t = i / 15;
        pts.push({ x: cx + size / 2 - t * size / 3, y: cy - size / 3 + t * size / 1.5, isCode: true });
        pts.push({ x: cx + size / 2 - t * size / 3, y: cy + size / 3 - t * size / 1.5, isCode: true });
    }
    return pts;
}

// ── INIT ──────────────────────────────────────────
const particles = [];
let animDone = false;

function init() {
    const all = [
        ...hexPoints(centerX, centerY, CONFIG.hexagonRadius, 10),
        ...codePoints(centerX, centerY, CONFIG.codeSymbolSize),
    ];
    all.forEach(p => particles.push(new Particle(p.x, p.y, p.isCode)));
    while (particles.length < CONFIG.particleCount) {
        const a = Math.random() * Math.PI * 2;
        const d = Math.random() * CONFIG.hexagonRadius * 0.7;
        particles.push(new Particle(centerX + Math.cos(a) * d, centerY + Math.sin(a) * d));
    }
}

// ── BARRE DE PROGRESSION ──────────────────────────
const progressBar = document.querySelector('.intro-progress');
let startTime = Date.now();

function updateProgress() {
    if (!progressBar) return;
    const pct = Math.min((Date.now() - startTime) / CONFIG.animationDuration * 100, 100);
    progressBar.style.width = pct + '%';
}

// ── ANIMATION ─────────────────────────────────────
function animate() {
    /* Fond semi-transparent pour effet traînée */
    ctx.fillStyle = 'rgba(8, 12, 20, 0.12)';
    ctx.fillRect(0, 0, width, height);

    const elapsed = Date.now() - startTime;
    const delta = 1 / (CONFIG.animationDuration / 16);

    particles.forEach(p => { p.update(delta); p.draw(); });

    /* Connexions entre particules proches — apparaissent progressivement */
    const connThreshold = Math.min((elapsed / CONFIG.animationDuration) * 60, 55);
    if (connThreshold > 10) {
        ctx.globalAlpha = Math.min((elapsed - CONFIG.animationDuration * 0.4) / 800, 1) * 0.4;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < connThreshold) {
                    ctx.strokeStyle = `rgba(96,165,250,${(connThreshold - d) / connThreshold * 0.35})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
    }

    updateProgress();

    if (!animDone && elapsed > CONFIG.animationDuration) {
        animDone = true;
        revealContent();
    }

    requestAnimationFrame(animate);
}

// ── RÉVÉLATION DU CONTENU ─────────────────────────
function revealContent() {
    const loading = document.getElementById('loading');
    const content = document.getElementById('content');
    const eyebrow = document.querySelector('.intro-eyebrow');
    const logoWrap = document.querySelector('.logo-wrap');
    const brand = document.querySelector('.brand-name');
    const location = document.querySelector('.location');
    const tagline = document.querySelector('.tagline');
    const enterBtn = document.querySelector('.enter-button');
    const corners = document.querySelectorAll('.corner-info, .side-label, .deco-line-h, .grid-lines');

    if (loading) loading.classList.add('hidden');
    if (content) { content.classList.remove('hidden'); content.classList.add('visible'); }

    /* Cascade : chaque élément avec un délai fin */
    const seq = [
        { el: eyebrow, delay: 0 },
        { el: logoWrap, delay: 100 },
        { el: brand, delay: 240 },
        { el: location, delay: 380 },
        { el: tagline, delay: 480 },
        { el: enterBtn, delay: 620 },
    ];

    seq.forEach(({ el, delay }) => {
        if (!el) return;
        setTimeout(() => el.classList.add('in'), delay);
    });

    /* Éléments décoratifs */
    corners.forEach(el => { if (el) setTimeout(() => el.classList.add('in'), 800); });
}

// ── BOUTON ENTRER — avec rideau ────────────────────
function startExit() {
    const btn = document.getElementById('enter-btn');
    if (!animDone || (btn && btn.disabled)) return;
    if (btn) btn.disabled = true;

    /* Fondu du contenu */
    const content = document.getElementById('content');
    if (content) {
        content.style.transition = 'opacity .2s ease, transform .2s ease';
        content.style.opacity = '0';
        content.style.transform = 'scale(.97)';
    }

    /* Rideau de 5 panneaux */
    const curtain = document.createElement('div');
    curtain.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;pointer-events:none;';

    const delays = [.18, .09, 0, .09, .18]; /* centre en premier */
    for (let i = 0; i < 5; i++) {
        const p = document.createElement('div');
        p.style.cssText = `flex:1;background:#080C14;transform:scaleY(0);transform-origin:bottom;transition:transform .8s cubic-bezier(.76,0,.24,1) ${delays[i]}s;`;
        curtain.appendChild(p);
    }
    document.body.appendChild(curtain);

    /* Déclencher */
    setTimeout(() => {
        curtain.querySelectorAll('div').forEach(p => p.style.transform = 'scaleY(1)');
    }, 150);

    /* Redirect */
    setTimeout(() => { window.location.href = 'index.html'; }, 1100);
}

document.getElementById('enter-btn').addEventListener('click', startExit);
document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && animDone) startExit();
});

// ── DÉMARRAGE ─────────────────────────────────────
init();
animate();

console.log('%c🌴 Sud Web Project — Saint-Tropez', 'color:#60A5FA;font-size:14px;font-weight:bold;');
console.log(`%c✨ ${particles.length} particules actives`, 'color:#3B82F6;');