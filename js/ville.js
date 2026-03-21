/**
 * ville.js — Sud Web Project
 * JS commun à toutes les pages villes
 * S'appuie sur i18n.js (même moteur que l'index)
 * ─────────────────────────────────────────────
 * · Nav scroll + burger identique à l'index
 * · Cursor premium (pointer:fine uniquement)
 * · Split-reveal scroll sur les titres
 * · data-scroll reveal
 * · Compteurs métriques
 * · Back to top
 * · Année footer
 */
(function () {
    'use strict';

    var raf = requestAnimationFrame.bind(window);
    var $ = function (s, c) { return (c || document).querySelector(s); };
    var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
    var onScr = function (fn) { window.addEventListener('scroll', fn, { passive: true }); };
    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isFine = window.matchMedia('(pointer:fine)').matches;

    /* ── NAV ─────────────────────────────────────── */
    var nav = $('#main-nav');
    var navToggle = $('#nav-toggle');
    var navMenu = $('#nav-menu');
    var navOverlay = $('#nav-overlay');

    function openMenu() {
        if (!navMenu) return;
        navMenu.classList.add('active');
        if (navToggle) navToggle.classList.add('active');
        if (navOverlay) navOverlay.classList.add('active');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        $$('li', navMenu).forEach(function (li, i) {
            li.style.opacity = '0';
            li.style.transform = 'translateX(16px)';
            li.style.transition = 'opacity .3s ease, transform .3s ease';
            setTimeout(function () { li.style.opacity = '1'; li.style.transform = 'none'; }, i * 55 + 80);
        });
    }

    function closeMenu() {
        if (!navMenu) return;
        navMenu.classList.remove('active');
        if (navToggle) navToggle.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.contains('active') ? closeMenu() : openMenu();
        });
        if (navOverlay) navOverlay.addEventListener('click', closeMenu);
        $$('a', navMenu).forEach(function (a) { a.addEventListener('click', closeMenu); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    }

    var navTick = false;
    onScr(function () {
        if (!navTick) {
            navTick = true;
            raf(function () {
                if (nav) nav.classList.toggle('scrolled', window.pageYOffset > 80);
                navTick = false;
            });
        }
    });

    /* ── CURSOR PREMIUM ──────────────────────────── */
    var cursor = $('#cursor');
    var cursorDot = cursor && cursor.querySelector('.cursor-dot');
    var cursorRing = cursor && cursor.querySelector('.cursor-ring');

    if (cursor && isFine && !PRM) {
        var mx = 0, my = 0, rx = 0, ry = 0;
        document.addEventListener('mousemove', function (e) {
            mx = e.clientX; my = e.clientY;
            if (cursorDot) { cursorDot.style.left = mx + 'px'; cursorDot.style.top = my + 'px'; }
        });
        (function loop() {
            rx += (mx - rx) * 0.13; ry += (my - ry) * 0.13;
            if (cursorRing) { cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px'; }
            raf(loop);
        })();
        var HS = 'a, button, .ville-link-card, .why-card, .ville-chiffre-card';
        document.addEventListener('mouseover', function (e) {
            if (e.target.closest && e.target.closest(HS) && cursorRing) {
                cursorRing.style.width = '56px'; cursorRing.style.height = '56px';
                cursorRing.style.borderColor = 'rgba(96,165,250,.85)';
            }
        });
        document.addEventListener('mouseout', function (e) {
            if (e.target.closest && e.target.closest(HS) && cursorRing) {
                cursorRing.style.width = '36px'; cursorRing.style.height = '36px';
                cursorRing.style.borderColor = 'rgba(96,165,250,.5)';
            }
        });
        document.addEventListener('mouseleave', function () { if (cursor) cursor.style.opacity = '0'; });
        document.addEventListener('mouseenter', function () { if (cursor) cursor.style.opacity = '1'; });
    } else if (cursor) {
        cursor.style.display = 'none';
    }

    /* ── SPLIT REVEAL (titres H2 au scroll) ──────── */
    if (!PRM) {
        var splitObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var spans = $$('.split-reveal', entry.target);
                if (entry.target.classList.contains('split-reveal')) spans = [entry.target];
                spans.forEach(function (sp, i) {
                    setTimeout(function () { sp.classList.add('revealed'); }, i * 150 + 60);
                });
                splitObs.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        var seen = new Set();
        $$('.split-reveal').forEach(function (el) {
            var parent = el.closest('.section-head, .ville-intro-text, .ville-h2, .ville-cta');
            var target = parent || el;
            if (!seen.has(target)) { seen.add(target); splitObs.observe(target); }
        });
    }

    /* ── DATA-SCROLL REVEAL ──────────────────────── */
    var scrollObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry, i) {
            if (!entry.isIntersecting) return;
            setTimeout(function () { entry.target.classList.add('is-visible'); }, i * 75);
            scrollObs.unobserve(entry.target);
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    $$('[data-scroll]').forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('is-visible');
        } else {
            scrollObs.observe(el);
        }
    });

    /* ── SECTION LABELS ──────────────────────────── */
    if (!PRM) {
        var lblObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                e.target.style.opacity = '1';
                e.target.style.transform = 'none';
                lblObs.unobserve(e.target);
            });
        }, { threshold: 0.3 });
        $$('.section-label').forEach(function (el) {
            el.style.cssText += 'opacity:0;transform:translateX(-10px);transition:opacity .5s ease,transform .5s ease';
            lblObs.observe(el);
        });
    }

    /* ── COMPTEURS HÉRO ──────────────────────────── */
    if (!PRM) {
        $$('.metric-n').forEach(function (el) {
            var raw = el.textContent.trim();
            var num = parseInt(raw);
            var suf = raw.replace(/[0-9]/g, '');
            if (isNaN(num)) return;
            var start = null;
            (function step(ts) {
                if (!start) start = ts;
                var p = Math.min((ts - start) / 1400, 1);
                var ease = 1 - Math.pow(2, -10 * p);
                el.textContent = Math.floor(ease * num) + suf;
                if (p < 1) raf(step);
                else el.textContent = num + suf;
            })(performance.now());
        });
    }

    /* ── GLOW CARDS ──────────────────────────────── */
    $$('.why-card, .ville-chiffre-card').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            var r = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
    });

    /* ── BACK TO TOP ─────────────────────────────── */
    var btt = $('#back-to-top');
    var bttTick = false;
    if (btt) {
        onScr(function () {
            if (!bttTick) {
                bttTick = true;
                raf(function () { btt.classList.toggle('visible', window.pageYOffset > 500); bttTick = false; });
            }
        });
        btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }


    /* ── MORPH BUTTON ───────────────────────────── */
    var morphBtn = $('#morph-btn');
    var morphTick = false;

    if (morphBtn) {
        /* Apparition au scroll — même seuil que l'index */
        onScr(function () {
            if (!morphTick) {
                morphTick = true;
                raf(function () {
                    morphBtn.classList.toggle('visible', window.pageYOffset > 700);
                    morphTick = false;
                });
            }
        });

        /* Textes rotatifs FR/EN selon la langue active */
        function getMorphTexts() {
            if (window.SWPi18n && window.SWPi18n.getLang() === 'en') {
                return ['New project', "Let's talk!", 'Free quote', 'Get in touch!'];
            }
            return ['Nouveau projet', 'Discutons !', 'Devis gratuit', 'Parlons-en !'];
        }

        var mIdx = 0;
        var morphTextEl = morphBtn.querySelector('.morph-text');
        var morphTimer = null;

        morphBtn.addEventListener('mouseenter', function () {
            var texts = getMorphTexts();
            morphTimer = setInterval(function () {
                mIdx = (mIdx + 1) % texts.length;
                if (morphTextEl) morphTextEl.textContent = texts[mIdx];
            }, 340);
        });

        morphBtn.addEventListener('mouseleave', function () {
            clearInterval(morphTimer);
            mIdx = 0;
            if (morphTextEl) morphTextEl.textContent = getMorphTexts()[0];
        });

        /* Mise à jour quand la langue change via i18n.js */
        window._swpUpdateMorph = function () {
            clearInterval(morphTimer);
            mIdx = 0;
            if (morphTextEl) morphTextEl.textContent = getMorphTexts()[0];
        };
    }

    /* ── ANNÉE ───────────────────────────────────── */
    var yr = $('#current-year');
    if (yr) yr.textContent = new Date().getFullYear();

})();