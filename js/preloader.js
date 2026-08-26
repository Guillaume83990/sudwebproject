/* ═══════════════════════════════════════════════════════════════
   SWP PRELOADER — « La signature »
   Une ligne de lumière construit le symbole, le nom apparaît,
   puis la signature rejoint sa place définitive dans le header.

   Dépendance : GSAP 3 uniquement (déjà chargé par le site).
   Aucune scène 3D : le symbole est le SVG du header, tracé au
   stroke-dashoffset. Le vol est un transform composité.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var CONFIG = {
        ANCHOR: '#swp-logo-anchor',   // le logo du header — destination
        SPEED: 1,                     // 1 = tempo de référence · 1.3 = plus rapide · 0.8 = plus lent
        WATCHDOG_MS: 9000             // au-delà, on rend la main quoi qu'il arrive
    };

    var root = document.documentElement;
    var pre = document.getElementById('swp-preloader');
    if (!pre) return;

    var bg = document.getElementById('swp-pre-bg');
    var mark = document.getElementById('swp-pre-mark');
    var seed = document.getElementById('swp-pre-seed');
    var trace = document.getElementById('swp-pre-trace');
    var fill = document.getElementById('swp-pre-fill');
    var glyph = document.getElementById('swp-pre-glyph');
    var wordEl = document.getElementById('swp-pre-word');
    var rule = document.getElementById('swp-pre-rule');
    var anchor = document.querySelector(CONFIG.ANCHOR);

    var watchdog = null;

    /* ─────────────────────────────────────────────────────────────
       SORTIE — un seul chemin de sortie, quel que soit le scénario
       ───────────────────────────────────────────────────────────── */
    var done = false;
    function finish() {
        if (done) return;
        done = true;
        root.classList.remove('swp-preloading');
        pre.style.display = 'none';
        if (anchor) anchor.style.opacity = '';
        if (watchdog) { clearTimeout(watchdog); watchdog = null; }
        if (window.__swpFailsafe) { clearTimeout(window.__swpFailsafe); window.__swpFailsafe = null; }
        window.__swpIntroDone = true;
        // Point d'accroche pour les scripts qui veulent démarrer après l'intro
        window.dispatchEvent(new CustomEvent('swp:intro-done'));
    }

    /* ─────────────────────────────────────────────────────────────
       CAS DE SORTIE IMMÉDIATE
       ───────────────────────────────────────────────────────────── */
    var reduceMotion = false;
    try {
        reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { }

    if (window.__swpSkipIntro || reduceMotion || !window.gsap) {
        finish();
        return;
    }

    // On reprend la main sur le failsafe posé dans le <head>
    if (window.__swpFailsafe) clearTimeout(window.__swpFailsafe);
    watchdog = setTimeout(finish, CONFIG.WATCHDOG_MS);

    /* ─────────────────────────────────────────────────────────────
       LE NOM — SUD / WEB (accentué) / PROJECT
       ───────────────────────────────────────────────────────────── */
    var letters = [];
    (function buildWord() {
        if (!wordEl) return;
        var parts = [
            { text: 'SUD', accent: false },
            { text: 'WEB', accent: true },
            { text: 'PROJECT', accent: false }
        ];
        parts.forEach(function (part, pi) {
            part.text.split('').forEach(function (ch) {
                var s = document.createElement('span');
                s.textContent = ch;
                if (part.accent) s.className = 'accent';
                wordEl.appendChild(s);
                letters.push(s);
            });
            if (pi < parts.length - 1) {
                var gap = document.createElement('span');
                gap.className = 'gap';
                gap.innerHTML = '&nbsp;';
                wordEl.appendChild(gap);
            }
        });
    })();

    /* ─────────────────────────────────────────────────────────────
       DESTINATION — mesurée, jamais codée en dur
       ───────────────────────────────────────────────────────────── */
    var TARGET = { x: 0, y: 0, scale: 1, ok: false };

    function measureFlight() {
        if (!anchor || !mark) return;
        var a = mark.getBoundingClientRect();
        var b = anchor.getBoundingClientRect();
        if (!a.width || !b.width) return;
        TARGET.x = (b.left + b.width / 2) - (a.left + a.width / 2);
        TARGET.y = (b.top + b.height / 2) - (a.top + a.height / 2);
        TARGET.scale = b.width / a.width;
        TARGET.ok = true;
    }

    /* ─────────────────────────────────────────────────────────────
       SÉQUENCE — une seule timeline
       ───────────────────────────────────────────────────────────── */
    function run() {
        // Le logo du header s'efface : c'est la signature qui viendra l'occuper
        if (anchor) anchor.style.opacity = '0';

        // Longueur exacte du contour, mesurée sur le tracé réel
        var len = 0;
        if (trace && typeof trace.getTotalLength === 'function') {
            len = trace.getTotalLength();
            gsap.set(trace, { strokeDasharray: len, strokeDashoffset: len });
        }

        var tl = gsap.timeline({ onComplete: finish });
        tl.timeScale(CONFIG.SPEED);

        /* ── Phase 1 · Respiration — 0.00 → 0.40 ── */
        tl.to(bg, { opacity: 1, duration: 0.40, ease: 'power1.out' }, 0);

        /* ── Phase 2 · La ligne de lumière — 0.35 → 0.90 ── */
        tl.fromTo(seed,
            { scaleX: 0, opacity: 0 },
            { scaleX: 1, opacity: 1, duration: 0.55, ease: 'power2.out' }, 0.35);

        /* ── Phase 3 · Le tracé du symbole — 0.85 → 2.15 ──
           Le cœur de la séquence : la ligne devient le contour. */
        if (len) {
            tl.to(trace, { strokeDashoffset: 0, duration: 1.30, ease: 'power1.inOut' }, 0.85);
        }
        tl.to(seed, { opacity: 0, duration: 0.45, ease: 'power1.in' }, 1.10);

        /* ── Phase 4 · Le symbole se remplit — 2.15 → 2.80 ── */
        tl.to([fill, glyph], { opacity: 1, duration: 0.60, ease: 'power2.out' }, 2.15);
        tl.to(trace, { opacity: 0, duration: 0.55, ease: 'power1.in' }, 2.25);

        /* ── Phase 5 · Le nom, puis le filet de signature — 2.55 → 4.10 ── */
        if (letters.length) {
            tl.to(letters, {
                opacity: 1, y: 0, duration: 0.70,
                stagger: 0.05, ease: 'power3.out'
            }, 2.55);
        }
        tl.to(rule, { scaleX: 1, duration: 0.80, ease: 'power2.inOut' }, 3.30);

        /* ── Phase 6 · La signature rejoint le header — 4.10 → 5.15 ──
           La mesure est faite juste avant le tween : les valeurs sont
           résolues à l'exécution, donc justes même si la page a bougé. */
        tl.call(measureFlight, null, 4.10);
        tl.to(mark, {
            x: function () { return TARGET.ok ? TARGET.x : 0; },
            y: function () { return TARGET.ok ? TARGET.y : 0; },
            scale: function () { return TARGET.ok ? TARGET.scale : 1; },
            duration: 1.05, ease: 'power3.inOut'
        }, 4.10);
        tl.to([wordEl, rule], { opacity: 0, duration: 0.55, ease: 'power2.in' }, 4.10);

        /* ── Phase 7 · Passage de relais — 5.15 → 5.85 ── */
        if (anchor) tl.to(anchor, { opacity: 1, duration: 0.22, ease: 'none' }, 5.15);
        tl.to(mark, { opacity: 0, duration: 0.22, ease: 'none' }, 5.22);

        /* Le site reprend la main */
        tl.call(function () { root.classList.remove('swp-preloading'); }, null, 5.30);
        tl.to(bg, { opacity: 0, duration: 0.55, ease: 'power2.inOut' }, 5.30);
        tl.to(pre, { opacity: 0, duration: 0.30, ease: 'none' }, 5.55);
    }

    /* ─────────────────────────────────────────────────────────────
       DÉMARRAGE — après les polices, sinon le header n'a pas
       encore ses dimensions finales et l'atterrissage tombe à côté
       ───────────────────────────────────────────────────────────── */
    function boot() {
        try {
            if (document.fonts && document.fonts.ready) {
                Promise.race([
                    document.fonts.ready,
                    new Promise(function (r) { setTimeout(r, 400); })
                ]).then(run, run);
            } else {
                run();
            }
        } catch (err) {
            finish();
        }
    }

    if (document.readyState === 'complete') boot();
    else window.addEventListener('load', boot);
})();