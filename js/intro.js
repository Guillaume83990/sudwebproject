'use strict';

/* ═══════════════════════════════════════════════════
   INTRO.JS — Sud Web Project — Performance Edition
   Optimisations Lighthouse 90+ :
   · Particules réduites à 60 max (vs 300)
   · Connexions supprimées (O(n²) → O(1))
   · requestAnimationFrame stoppé après révélation
   · Pause automatique si onglet inactif
   · Radial gradients remplacés par fillStyle simple
   ═══════════════════════════════════════════════════ */

// ── CONFIG ────────────────────────────────────────
var isMobile = window.innerWidth < 768;
var CONFIG = {
    particleCount: isMobile ? 35 : 60,   /* 300 → 60 */
    hexRadius: isMobile ? 90 : 140,
    codeSize: isMobile ? 50 : 72,
    duration: 2600,
    color: '#60A5FA',
    glowColor: '#3B82F6',
};

// ── CANVAS ────────────────────────────────────────
var canvas = document.getElementById('particles-canvas');
var ctx = canvas.getContext('2d');
var W, H, cx, cy;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cx = W / 2;
    cy = H / 2;
}
resize();
window.addEventListener('resize', resize, { passive: true });

// ── PARTICLE ──────────────────────────────────────
function Particle(tx, ty, isCode) {
    var angle = Math.random() * Math.PI * 2;
    var dist = Math.random() * 500 + 300;
    this.x = cx + Math.cos(angle) * dist;
    this.y = cy + Math.sin(angle) * dist;
    this.tx = tx;
    this.ty = ty;
    this.size = isCode ? 2.2 : Math.random() * 1.5 + 0.5;
    this.isCode = isCode;
    this.progress = 0;
    this.arrived = false;
    this.speed = Math.random() * 0.35 + 0.75;
    this.oscOff = Math.random() * Math.PI * 2;
}

Particle.prototype.update = function (delta) {
    if (!this.arrived) {
        this.progress += delta * this.speed;
        if (this.progress >= 1) { this.progress = 1; this.arrived = true; }
        var e = 1 - Math.pow(1 - this.progress, 3);
        this.x += (this.tx - this.x) * e * 0.1;
        this.y += (this.ty - this.y) * e * 0.1;
    } else {
        var t = Date.now() * 0.001;
        this.x = this.tx + Math.sin(t * 2 + this.oscOff) * 1.1;
        this.y = this.ty + Math.cos(t * 2 + this.oscOff) * 1.1;
    }
};

/* Dessin simplifié : plus de radialGradient par particule */
Particle.prototype.draw = function () {
    ctx.fillStyle = this.isCode ? '#ffffff' : CONFIG.color;
    ctx.globalAlpha = this.isCode ? 0.95 : 0.75;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
};

// ── HEXAGONE ──────────────────────────────────────
function hexPoints(r, perSide) {
    var pts = [];
    for (var i = 0; i < 6; i++) {
        var a1 = (i * 60 - 90) * Math.PI / 180;
        var a2 = ((i + 1) * 60 - 90) * Math.PI / 180;
        var x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
        var x2 = cx + Math.cos(a2) * r, y2 = cy + Math.sin(a2) * r;
        for (var j = 0; j < perSide; j++) {
            var t = j / perSide;
            pts.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t, isCode: false });
        }
    }
    return pts;
}

// ── SYMBOLE </> ───────────────────────────────────
function codePoints(size) {
    var pts = [];
    for (var i = 0; i < 8; i++) {
        var t = i / 8;
        pts.push({ x: cx - size / 2 + t * size / 3, y: cy - size / 3 + t * size / 1.5, isCode: true });
        pts.push({ x: cx - size / 2 + t * size / 3, y: cy + size / 3 - t * size / 1.5, isCode: true });
    }
    for (var i = 0; i < 10; i++) {
        var t = i / 10;
        pts.push({ x: cx - size / 4 + t * size / 2, y: cy + size / 2.5 - t * size * 1.2, isCode: true });
    }
    for (var i = 0; i < 8; i++) {
        var t = i / 8;
        pts.push({ x: cx + size / 2 - t * size / 3, y: cy - size / 3 + t * size / 1.5, isCode: true });
        pts.push({ x: cx + size / 2 - t * size / 3, y: cy + size / 3 - t * size / 1.5, isCode: true });
    }
    return pts;
}

// ── INIT PARTICULES ───────────────────────────────
var particles = [];
var rafId = null;
var revealed = false;
var startTime = Date.now();

function init() {
    var all = hexPoints(CONFIG.hexRadius, 5).concat(codePoints(CONFIG.codeSize));

    /* Shuffle et limiter */
    all.sort(function () { return Math.random() - 0.5; });
    var max = Math.min(all.length, CONFIG.particleCount);
    for (var i = 0; i < max; i++) {
        particles.push(new Particle(all[i].x, all[i].y, all[i].isCode));
    }
}

// ── BARRE PROGRESSION ─────────────────────────────
var progressBar = document.querySelector('.intro-progress');
function updateProgress(elapsed) {
    if (!progressBar) return;
    progressBar.style.width = Math.min(elapsed / CONFIG.duration * 100, 100) + '%';
}

// ── BOUCLE ANIMATION ──────────────────────────────
function animate() {
    var elapsed = Date.now() - startTime;

    /* Fond semi-transparent traînée */
    ctx.fillStyle = 'rgba(8,12,20,0.14)';
    ctx.fillRect(0, 0, W, H);

    var delta = 1 / (CONFIG.duration / 16);
    ctx.globalAlpha = 1;

    for (var i = 0; i < particles.length; i++) {
        particles[i].update(delta);
        particles[i].draw();
    }

    ctx.globalAlpha = 1;
    updateProgress(elapsed);

    if (!revealed && elapsed > CONFIG.duration) {
        revealed = true;
        revealContent();
        /* On continue l'animation mais moins fréquemment */
        scheduleIdle();
        return;
    }

    if (!revealed) {
        rafId = requestAnimationFrame(animate);
    }
}

/* Après révélation : animation très ralentie (1 frame / 100ms) */
function scheduleIdle() {
    rafId = setTimeout(function () {
        if (document.hidden) { scheduleIdle(); return; }
        var i;
        ctx.fillStyle = 'rgba(8,12,20,0.08)';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
        for (i = 0; i < particles.length; i++) {
            particles[i].update(0.002);
            particles[i].draw();
        }
        ctx.globalAlpha = 1;
        scheduleIdle();
    }, 100); /* 10fps au lieu de 60fps */
}

/* Pause si onglet caché */
document.addEventListener('visibilitychange', function () {
    if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        clearTimeout(rafId);
    }
});

// ── RÉVÉLATION CONTENU ────────────────────────────
function revealContent() {
    var loading = document.getElementById('loading');
    var content = document.getElementById('content');
    var elements = [
        document.querySelector('.intro-eyebrow'),
        document.querySelector('.logo-wrap'),
        document.querySelector('.brand-name'),
        document.querySelector('.location'),
        document.querySelector('.tagline'),
        document.querySelector('.enter-button'),
    ];

    if (loading) loading.classList.add('hidden');
    if (content) { content.classList.remove('hidden'); content.classList.add('visible'); }

    elements.forEach(function (el, i) {
        if (!el) return;
        setTimeout(function () { el.classList.add('in'); }, i * 120);
    });

    document.querySelectorAll('.corner-info, .side-label, .deco-line-h').forEach(function (el) {
        setTimeout(function () { el.classList.add('in'); }, 750);
    });
}

// ── SORTIE RIDEAU ─────────────────────────────────
function startExit() {
    var btn = document.getElementById('enter-btn');
    if (!revealed || (btn && btn.disabled)) return;
    if (btn) btn.disabled = true;

    /* Stopper l'animation canvas */
    clearTimeout(rafId);
    cancelAnimationFrame(rafId);

    var content = document.getElementById('content');
    if (content) {
        content.style.transition = 'opacity .2s ease';
        content.style.opacity = '0';
    }

    /* Rideau 5 panneaux */
    var curtain = document.createElement('div');
    curtain.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;pointer-events:none;';
    var delays = [.18, .09, 0, .09, .18];
    for (var i = 0; i < 5; i++) {
        var p = document.createElement('div');
        p.style.cssText = 'flex:1;background:#080C14;transform:scaleY(0);transform-origin:bottom;transition:transform .75s cubic-bezier(.76,0,.24,1) ' + delays[i] + 's;';
        curtain.appendChild(p);
    }
    document.body.appendChild(curtain);

    setTimeout(function () {
        curtain.querySelectorAll('div').forEach(function (p) { p.style.transform = 'scaleY(1)'; });
    }, 50);

    setTimeout(function () { window.location.href = 'index.html'; }, 950);
}

// ── EVENTS ────────────────────────────────────────
document.getElementById('enter-btn').addEventListener('click', startExit);
document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && revealed) startExit();
});

// ── START ─────────────────────────────────────────
init();
animate();