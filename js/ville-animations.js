/**
 * ville-animations.js — Sud Web Project
 * GSAP + ScrollTrigger pour les pages villes.
 * 
 * IMPORTANT : Les éléments sont VISIBLES par défaut en CSS.
 * GSAP les cache juste avant de les animer (gsap.set),
 * pas avant. Ça évite le flash de contenu invisible.
 */

(function () {
    'use strict';

    // Sécurité : si pas sur une page ville ou GSAP absent
    if (typeof gsap === 'undefined') return;
    if (!document.querySelector('.ville-hero')) return;

    gsap.registerPlugin(ScrollTrigger);

    /* ─── Utilitaire : animer seulement si l'élément existe ── */
    function safeFrom(targets, vars, trigger) {
        var els = document.querySelectorAll(targets);
        if (!els.length) return;

        // On cache d'abord
        gsap.set(els, { opacity: 0, y: vars.y || 0, x: vars.x || 0, scale: vars.scale || 1 });

        if (vars.stagger) {
            // Groupe stagger
            ScrollTrigger.create({
                trigger: trigger || els[0].closest('section') || els[0],
                start: 'top 88%',
                once: true,
                onEnter: function () {
                    gsap.to(els, {
                        opacity: 1, y: 0, x: 0, scale: 1,
                        duration: vars.duration || .8,
                        ease: vars.ease || 'power3.out',
                        stagger: vars.stagger
                    });
                }
            });
        } else {
            // Individuel
            els.forEach(function (el) {
                ScrollTrigger.create({
                    trigger: el,
                    start: 'top 90%',
                    once: true,
                    onEnter: function () {
                        gsap.to(el, {
                            opacity: 1, y: 0, x: 0, scale: 1,
                            duration: vars.duration || .8,
                            ease: vars.ease || 'power3.out'
                        });
                    }
                });
            });
        }
    }

    /* ─── 1. HERO — séquence d'entrée ──────────────── */
    // On cache d'abord les éléments hero
    var heroEls = [
        '.ville-hero-badge',
        '.ville-hero-title',
        '.ville-hero-sub',
        '.ville-hero-actions',
        '.ville-hero-metrics'
    ];

    heroEls.forEach(function (sel) {
        var el = document.querySelector(sel);
        if (el) gsap.set(el, { opacity: 0, y: 30 });
    });

    // Séquence
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    var badge = document.querySelector('.ville-hero-badge');
    var title = document.querySelector('.ville-hero-title');
    var sub = document.querySelector('.ville-hero-sub');
    var actions = document.querySelector('.ville-hero-actions');
    var metrics = document.querySelector('.ville-hero-metrics');

    if (badge) tl.to(badge, { opacity: 1, y: 0, duration: .6 }, .3);
    if (title) tl.to(title, { opacity: 1, y: 0, duration: 1, ease: 'expo.out' }, .5);
    if (sub) tl.to(sub, { opacity: 1, y: 0, duration: .8 }, .8);
    if (actions) tl.to(actions, { opacity: 1, y: 0, duration: .7 }, 1);
    if (metrics) tl.to(metrics, { opacity: 1, y: 0, duration: .7 }, 1.1);

    /* ─── 2. SCROLL REVEALS ─────────────────────────── */

    // Section labels
    safeFrom('.section-label', { y: 20, duration: .6 });

    // Titres H2
    safeFrom('.ville-h2', { y: 40, duration: .9 });

    // Chiffres (stagger par groupe)
    safeFrom('.ville-chiffre-card', { y: 40, stagger: .12, duration: .7 });

    // Cartes métiers (stagger)
    safeFrom('.ville-metier-card', { y: 50, stagger: .1, duration: .7 });

    // Lignes métiers (slide gauche)
    safeFrom('.ville-metier-row', { x: -30, y: 0, stagger: .1, duration: .6 });

    // Pourquoi (stagger)
    safeFrom('.ville-pourquoi-card', { y: 40, stagger: .12, duration: .7 });

    // Process (stagger)
    safeFrom('.process-item', { y: 40, stagger: .15, duration: .7 });

    // Tarifs (stagger)
    safeFrom('.price-card', { y: 40, stagger: .12, duration: .7 });

    // Villes (stagger)
    safeFrom('.ville-ville-card', { y: 40, stagger: .08, duration: .6 });

    // FAQ
    safeFrom('.ville-faq-item', { y: 25, stagger: .07, duration: .6 });

    // Punchline
    safeFrom('.ville-punchline', { y: 20, duration: .7 });

    // Image intro
    safeFrom('.ville-intro-img-wrap', { scale: .95, y: 0, duration: 1, ease: 'power2.out' });

    // CTA final
    safeFrom('.ville-cta .section-title', { y: 30, duration: .8 });
    safeFrom('.ville-cta-sub', { y: 20, duration: .7 });
    safeFrom('.ville-cta-actions', { y: 20, duration: .7 });

    /* ─── 3. COMPTEURS ANIMÉS ───────────────────────── */
    document.querySelectorAll('.chiffre-num[data-count]').forEach(function (el) {
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var prefix = el.getAttribute('data-prefix') || '';
        var isDecimal = String(target).indexOf('.') !== -1;
        var original = el.textContent;

        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: function () {
                gsap.to({ val: 0 }, {
                    val: target,
                    duration: 1.8,
                    ease: 'power2.out',
                    onUpdate: function () {
                        var v = this.targets()[0].val;
                        el.textContent = prefix + (isDecimal ? v.toFixed(1) : Math.round(v)) + suffix;
                    }
                });
            }
        });
    });

    /* ─── 4. PARALLAXE IMAGE HERO ───────────────────── */
    var heroImg = document.querySelector('.ville-hero-img');
    if (heroImg) {
        gsap.to(heroImg, {
            yPercent: -15,
            ease: 'none',
            scrollTrigger: {
                trigger: '.ville-hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    /* ─── 5. MICRO-INTERACTION MAGNÉTIQUE CTA ──────── */
    document.querySelectorAll('.btn-hero, .btn-primary, .btn-outline, .btn-ghost-hero').forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
            var rect = btn.getBoundingClientRect();
            var x = e.clientX - rect.left - rect.width / 2;
            var y = e.clientY - rect.top - rect.height / 2;
            gsap.to(btn, { x: x * .12, y: y * .12, duration: .3, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', function () {
            gsap.to(btn, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1,.5)' });
        });
    });

    /* ─── 6. REFRESH après polices ─────────────────── */
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }

})();