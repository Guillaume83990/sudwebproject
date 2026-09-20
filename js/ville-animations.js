/**
 * VILLE-ANIMATIONS.JS — Sud Web Project — v2
 * GSAP + ScrollTrigger pour les pages villes et métiers.
 *
 * IMPORTANT : Les éléments sont VISIBLES par défaut en CSS.
 * GSAP les cache juste avant de les animer (gsap.set),
 * pas avant. Ça évite le flash de contenu invisible.
 *
 * CORRECTIF v2 — LA DOUBLE COUCHE
 * ville-lux.js anime déjà l'intro, les chiffres, les cartes
 * « pourquoi », les tarifs, les villes, la FAQ et le CTA — dans
 * une grammaire plus travaillée (le filet se trace, puis les
 * lignes montent). Ce fichier animait les mêmes éléments, avec
 * des seuils différents (85 %, 88 %, 90 %, 82 %).
 *
 * Résultat : deux ScrollTriggers par élément, deux tweens
 * concurrents, et overwrite:'auto' qui en tue un en cours de
 * route. Visuellement, des blocs qui démarrent, se figent, puis
 * repartent. Et une vingtaine de déclencheurs inutiles par page.
 *
 * gsap.killTweensOf() ne suffisait pas : il supprime un tween,
 * pas le ScrollTrigger qui le recrée.
 *
 * On détecte donc la présence de ville-lux.js et, s'il est là, on
 * lui laisse ses blocs. S'il est absent (pages qui ne le chargent
 * pas), tout le comportement d'origine est conservé.
 *
 * Ce fichier garde en propre : l'entrée du hero, les compteurs,
 * la parallaxe du hero et la micro-interaction des boutons.
 */

(function () {
    'use strict';

    // Sécurité : si pas sur une page ville ou GSAP absent
    if (typeof gsap === 'undefined') return;
    if (!document.querySelector('.ville-hero')) return;

    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var COARSE = window.matchMedia('(pointer: coarse)').matches;
    var hasST = typeof window.ScrollTrigger !== 'undefined';

    if (hasST) gsap.registerPlugin(ScrollTrigger);

    /* ville-lux.js est-il chargé sur cette page ?
       Il se déclare dans le HTML après nous : on ne peut pas
       attendre un drapeau posé à l'exécution, on lit la balise. */
    var LUX = !!document.querySelector('script[src*="ville-lux"]');

    /* Recalage groupé fourni par motion.js */
    var refresh = (window.SWP && window.SWP.refresh) || function () {
        if (hasST) ScrollTrigger.refresh();
    };

    var $$ = function (s, c) {
        return Array.prototype.slice.call((c || document).querySelectorAll(s));
    };

    /* Écarte les éléments situés dans un bloc que ville-lux possède */
    function outside(els, zones) {
        if (!LUX) return els;
        return els.filter(function (el) {
            for (var i = 0; i < zones.length; i++) {
                if (el.closest(zones[i])) return false;
            }
            return true;
        });
    }

    /* ─── Utilitaire : animer une liste d'éléments ─────────── */
    function reveal(els, vars, trigger) {
        if (PRM || !hasST) return;
        if (!els || !els.length) return;

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

    function safeFrom(selector, vars, trigger) {
        reveal($$(selector), vars, trigger);
    }

    /* ─── 1. HERO — séquence d'entrée ──────────────── */
    var heroEls = [
        '.ville-hero-badge',
        '.ville-hero-title',
        '.ville-hero-sub',
        '.ville-hero-actions',
        '.ville-hero-metrics'
    ];

    if (!PRM) {
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
    }

    /* ─── 2. SCROLL REVEALS ─────────────────────────────────
       Tout ce qui suit n'est joué QUE si ville-lux.js est absent,
       sauf les quelques blocs qu'il ne traite pas.
       ─────────────────────────────────────────────────────── */

    /* Blocs possédés par ville-lux.js */
    var LUX_ZONES = [
        '.ville-intro-text',
        '.ville-intro-img-wrap',
        '.ville-chiffres-grid',
        '.ville-pourquoi-grid',
        '.process-steps-grid',
        '.ville-tarifs',
        '.ville-villes-grid',
        '.ville-faq-list',
        '.ville-cta',
        '.seo-prose',
        '.st-real-card'
    ];

    /* Section labels — sauf ceux des blocs ci-dessus */
    reveal(outside($$('.section-label'), LUX_ZONES), { y: 20, duration: .6 });

    /* Titres H2 — sauf ceux découpés lettre par lettre par
       titles.js (ils portent un .split-reveal) */
    reveal(
        outside($$('.ville-h2'), LUX_ZONES).filter(function (el) {
            return !el.querySelector('.split-reveal');
        }),
        { y: 40, duration: .9 }
    );

    /* Punchline — sauf dans l'intro */
    reveal(outside($$('.ville-punchline'), LUX_ZONES), { y: 20, duration: .7 });

    /* Cartes métiers (stagger) — non traitées par ville-lux */
    safeFrom('.ville-metier-card', { y: 50, stagger: .1, duration: .7 });

    /* Lignes métiers (slide gauche) — .ville-metier-row, à ne pas
       confondre avec .st-metier-row, qui appartient à ville-lux */
    safeFrom('.ville-metier-row', { x: -30, y: 0, stagger: .1, duration: .6 });

    if (!LUX) {
        /* Repli complet pour les pages qui ne chargent pas
           ville-lux.js : comportement d'origine, intact. */
        safeFrom('.ville-chiffre-card', { y: 40, stagger: .12, duration: .7 });
        safeFrom('.ville-pourquoi-card', { y: 40, stagger: .12, duration: .7 });
        safeFrom('.process-item', { y: 40, stagger: .15, duration: .7 });
        safeFrom('.price-card', { y: 40, stagger: .12, duration: .7 });
        safeFrom('.ville-ville-card', { y: 40, stagger: .08, duration: .6 });
        safeFrom('.ville-faq-item', { y: 25, stagger: .07, duration: .6 });
        safeFrom('.ville-intro-img-wrap', { scale: .95, y: 0, duration: 1, ease: 'power2.out' });
        safeFrom('.ville-cta .section-title', { y: 30, duration: .8 });
        safeFrom('.ville-cta-sub', { y: 20, duration: .7 });
        safeFrom('.ville-cta-actions', { y: 20, duration: .7 });
    }

    /* ─── 3. COMPTEURS ANIMÉS ───────────────────────────────
       ville-lux.js a retiré les compteurs des cartes chiffres :
       on ne touche donc qu'à ceux placés ailleurs.
       ─────────────────────────────────────────────────────── */
    if (hasST && !PRM) {
        outside($$('.chiffre-num[data-count]'), ['.ville-chiffre-card']).forEach(function (el) {
            var target = parseFloat(el.getAttribute('data-count'));
            var suffix = el.getAttribute('data-suffix') || '';
            var prefix = el.getAttribute('data-prefix') || '';
            var isDecimal = String(target).indexOf('.') !== -1;

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
    }

    /* ─── 4. PARALLAXE IMAGE HERO ───────────────────────────
       Seule animation de ce fichier qui travaille à chaque frame.
       On la promeut sur sa propre couche et on la coupe sur
       téléphone, où elle coûte plus qu'elle ne rapporte.
       ─────────────────────────────────────────────────────── */
    var heroImg = document.querySelector('.ville-hero-img');
    if (heroImg && hasST && !PRM && !COARSE) {
        gsap.set(heroImg, { willChange: 'transform', force3D: true });
        gsap.to(heroImg, {
            yPercent: -15,
            ease: 'none',
            force3D: true,
            scrollTrigger: {
                trigger: '.ville-hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
                onLeave: function () { gsap.set(heroImg, { willChange: 'auto' }); },
                onLeaveBack: function () { gsap.set(heroImg, { willChange: 'auto' }); },
                onEnter: function () { gsap.set(heroImg, { willChange: 'transform' }); },
                onEnterBack: function () { gsap.set(heroImg, { willChange: 'transform' }); }
            }
        });
    }

    /* ─── 5. MICRO-INTERACTION MAGNÉTIQUE CTA ───────────────
       Un gsap.to par mousemove saturait la boucle d'animation
       pendant le survol. On ne garde qu'une écriture par frame,
       et rien du tout sur écran tactile.
       ─────────────────────────────────────────────────────── */
    if (!PRM && !COARSE) {
        $$('.btn-hero, .btn-primary, .btn-outline, .btn-ghost-hero').forEach(function (btn) {
            var frame = null;
            var mx = 0, my = 0;

            btn.addEventListener('mousemove', function (e) {
                var rect = btn.getBoundingClientRect();
                mx = e.clientX - rect.left - rect.width / 2;
                my = e.clientY - rect.top - rect.height / 2;

                if (frame) return;
                frame = requestAnimationFrame(function () {
                    frame = null;
                    gsap.to(btn, { x: mx * .12, y: my * .12, duration: .3, ease: 'power2.out' });
                });
            });

            btn.addEventListener('mouseleave', function () {
                if (frame) { cancelAnimationFrame(frame); frame = null; }
                gsap.to(btn, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1,.5)' });
            });
        });
    }

    /* ─── 6. RECALAGE après polices ─────────────────────────
       On passe par le recalage groupé de motion.js, qui attend
       que le scroll soit au repos.
       ─────────────────────────────────────────────────────── */
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { refresh(); });
    }

})();