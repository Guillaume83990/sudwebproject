/* ═══════════════════════════════════════════════════════════════
   LUX.JS — Sud Web Project
   Couche d'animation GSAP. Ne refait PAS ce que global.js gère
   déjà (révélation des titres, nav, curseur) : ce fichier apporte
   uniquement ce qui manquait.
     · révélation par masque + parallaxe interne des images
     · scroll horizontal du portfolio (desktop)
     · tilt 3D des cartes
     · compteurs des chiffres clés
     · parallaxe douce des intitulés de section
   Dépendances : gsap + ScrollTrigger (chargés avant).
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ─────────────────────────────────────────────────────────
       RÉGLAGES — les trois interrupteurs du fichier
       ───────────────────────────────────────────────────────── */
    var CONFIG = {
        HORIZONTAL_PORTFOLIO: true,   // scroll horizontal du portfolio
        HORIZONTAL_MIN_WIDTH: 1200,   // en dessous : grille classique
        CARD_TILT: true,              // inclinaison 3D au pointeur
        TILT_MAX: 4.5                 // degrés — au-delà ça devient gadget
    };

    if (typeof window.gsap === 'undefined') return;
    if (typeof window.ScrollTrigger === 'undefined') return;

    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (PRM) return;

    gsap.registerPlugin(ScrollTrigger);

    var $$ = function (s, c) {
        return Array.prototype.slice.call((c || document).querySelectorAll(s));
    };
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ─────────────────────────────────────────────────────────
       0 · STYLES INJECTÉS
       Le tilt écrit dans `transform` : il faut neutraliser les
       translations de survol prévues en CSS, sinon les deux se
       disputent la même propriété.
       ───────────────────────────────────────────────────────── */
    var css = document.createElement('style');
    css.textContent =
        '.lux-tilt{transform-style:preserve-3d;will-change:transform}' +
        '.lux-tilt:hover{transform:none}' +
        '.lux-reveal{clip-path:inset(0 0 100% 0)}' +
        '.lux-img-inner{will-change:transform}' +
        '.lux-h-track{display:flex!important;flex-wrap:nowrap!important;' +
        'grid-template-columns:none!important;will-change:transform}' +
        '.lux-h-track>*{flex:0 0 min(380px,80vw)}';
    document.head.appendChild(css);

    /* ═════════════════════════════════════════════════════════
       1 · LES IMAGES
       Deux effets combinés : un masque qui s'ouvre vers le haut,
       et une parallaxe interne — l'image bouge moins vite que son
       cadre. C'est ce décalage qui crée la profondeur.
       ═══════════════════════════════════════════════════════ */
    var IMG_WRAPS = [
        '.hero-img-wrap',
        '.about-img-wrap',
        '.pf-img',
        '.st-photo-item',
        '.st-photo-hero',
        '.st-real-img',
        '.ville-intro-img-wrap'
    ].join(',');

    $$(IMG_WRAPS).forEach(function (wrap) {
        var img = wrap.querySelector('img');
        if (!img) return;

        wrap.style.overflow = 'hidden';
        img.classList.add('lux-img-inner');

        /* Masque d'ouverture — une seule fois, à l'entrée */
        gsap.fromTo(wrap,
            { clipPath: 'inset(0% 0% 100% 0%)' },
            {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 1.15,
                ease: 'power3.inOut',
                scrollTrigger: { trigger: wrap, start: 'top 88%', once: true }
            }
        );

        /* Parallaxe interne — l'image est surdimensionnée puis
           glissée lentement pendant le défilement */
        gsap.fromTo(img,
            { yPercent: -9, scale: 1.16 },
            {
                yPercent: 9,
                ease: 'none',
                scrollTrigger: {
                    trigger: wrap,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.1
                }
            }
        );
    });

    /* Le panoramique pleine largeur mérite une amplitude plus forte */
    $$('.st-photo-hero img').forEach(function (img) {
        gsap.fromTo(img,
            { yPercent: -13 },
            {
                yPercent: 13,
                ease: 'none',
                scrollTrigger: {
                    trigger: img.closest('.st-photo-hero'),
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                }
            }
        );
    });

    /* ═════════════════════════════════════════════════════════
       2 · LE PORTFOLIO EN SCROLL HORIZONTAL
       Desktop large uniquement. La section se fige, la rangée
       défile latéralement, puis la page reprend son cours.
       Le HTML n'est pas modifié : les cartes restent dans l'ordre
       et lisibles par les moteurs.
       ═══════════════════════════════════════════════════════ */
    if (CONFIG.HORIZONTAL_PORTFOLIO) {
        ScrollTrigger.matchMedia({
            ['(min-width: ' + CONFIG.HORIZONTAL_MIN_WIDTH + 'px)']: function () {
                var section = document.querySelector('.portfolio');
                var track = document.querySelector('.pf-grid');
                if (!section || !track) return;

                track.classList.add('lux-h-track');

                var distance = function () {
                    return Math.max(0, track.scrollWidth - track.parentElement.offsetWidth);
                };
                if (distance() <= 0) {
                    track.classList.remove('lux-h-track');
                    return;
                }

                var tween = gsap.to(track, {
                    x: function () { return -distance(); },
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top top',
                        end: function () { return '+=' + (distance() + window.innerHeight * 0.4); },
                        pin: true,
                        scrub: 1,
                        anticipatePin: 1,
                        invalidateOnRefresh: true
                    }
                });

                return function () {
                    /* Sortie propre si l'écran redescend sous le seuil */
                    tween.scrollTrigger && tween.scrollTrigger.kill(true);
                    tween.kill();
                    gsap.set(track, { x: 0 });
                    track.classList.remove('lux-h-track');
                };
            }
        });
    }

    /* ═════════════════════════════════════════════════════════
       3 · LE TILT 3D DES CARTES
       Coupé au tactile — une inclinaison qui suit un doigt n'a
       aucun sens et coûte cher en rendu.
       ═══════════════════════════════════════════════════════ */
    if (CONFIG.CARD_TILT && finePointer) {
        var TILT_TARGETS = [
            '.why-card',
            '.price-card',
            '.testi-card',
            '.hub-v3-card',
            '.etude-card',
            '.svc-card',
            '.st-service-card',
            '.ville-pourquoi-card',
            '.ville-chiffre-card',
            '.zone-card'
        ].join(',');

        $$(TILT_TARGETS).forEach(function (card) {
            card.classList.add('lux-tilt');
            var parent = card.parentElement;
            if (parent && !parent.style.perspective) parent.style.perspective = '1400px';

            var qx = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power3.out' });
            var qy = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power3.out' });
            var qz = gsap.quickTo(card, 'y', { duration: .5, ease: 'power3.out' });

            card.addEventListener('pointermove', function (e) {
                var r = card.getBoundingClientRect();
                var px = (e.clientX - r.left) / r.width - .5;
                var py = (e.clientY - r.top) / r.height - .5;
                qx(px * CONFIG.TILT_MAX * 2);
                qy(-py * CONFIG.TILT_MAX * 2);
                qz(-8);
                /* Reflet spéculaire : réutilise les variables que
                   global.js alimente déjà sur certaines cartes */
                card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                card.style.setProperty('--my', (e.clientY - r.top) + 'px');
            }, { passive: true });

            card.addEventListener('pointerleave', function () {
                qx(0); qy(0); qz(0);
            });
        });
    }

    /* ═════════════════════════════════════════════════════════
       4 · LES COMPTEURS
       ville-animations.js ne comptait que les éléments portant un
       attribut data-count — absent de vos pages, donc rien ne se
       passait. On lit directement le contenu affiché.
       ═══════════════════════════════════════════════════════ */
    $$('.chiffre-num').forEach(function (el) {
        if (el.hasAttribute('data-count')) return;   // déjà géré ailleurs
        var raw = el.textContent.trim();
        var match = raw.match(/^([^\d]*)([\d\s  ]+)(.*)$/);
        if (!match) return;

        var prefix = match[1];
        var digits = match[2].replace(/[\s ]/g, '');
        var suffix = match[3];
        var target = parseInt(digits, 10);
        if (isNaN(target)) return;

        var hasSpace = /[\s ]/.test(match[2]);
        var fmt = function (v) {
            var n = Math.round(v);
            return hasSpace ? n.toLocaleString('fr-FR') : String(n);
        };

        var obj = { v: 0 };
        el.textContent = prefix + fmt(0) + suffix;

        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: function () {
                gsap.to(obj, {
                    v: target,
                    duration: 1.9,
                    ease: 'power2.out',
                    onUpdate: function () { el.textContent = prefix + fmt(obj.v) + suffix; },
                    onComplete: function () { el.textContent = raw; }
                });
            }
        });
    });

    /* ═════════════════════════════════════════════════════════
       5 · PARALLAXE DOUCE DES INTITULÉS
       Les petits libellés de section montent légèrement plus vite
       que la page. Effet quasi subliminal — c'est le but.
       ═══════════════════════════════════════════════════════ */
    $$('.section-label, .section-label-sm').forEach(function (el) {
        gsap.to(el, {
            y: -26,
            ease: 'none',
            scrollTrigger: {
                trigger: el.closest('section') || el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.4
            }
        });
    });

    /* ═════════════════════════════════════════════════════════
       6 · UN SEUL EFFET MAGNÉTIQUE
       global.js et ville-animations.js en appliquaient chacun un
       sur .btn-hero : les deux écrivaient dans `transform`, ce qui
       produisait un mouvement erratique. On repart d'un élément
       propre, sans écouteur hérité.
       ═══════════════════════════════════════════════════════ */
    if (finePointer) {
        $$('.btn-hero, .btn-primary, .nav-cta').forEach(function (btn) {
            var clean = btn.cloneNode(true);
            clean.removeAttribute('style');
            btn.parentNode.replaceChild(clean, btn);

            var mx = gsap.quickTo(clean, 'x', { duration: .45, ease: 'power3.out' });
            var my = gsap.quickTo(clean, 'y', { duration: .45, ease: 'power3.out' });

            clean.addEventListener('pointermove', function (e) {
                var r = clean.getBoundingClientRect();
                mx((e.clientX - r.left - r.width / 2) * .22);
                my((e.clientY - r.top - r.height / 2) * .22);
            }, { passive: true });

            clean.addEventListener('pointerleave', function () { mx(0); my(0); });
        });
    }

    /* ═════════════════════════════════════════════════════════
       7 · RECALAGE
       Les polices et les images modifient les hauteurs après coup :
       sans ça, les déclencheurs se calent sur de mauvaises valeurs.
       ═══════════════════════════════════════════════════════ */
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });

    /* Le preloader de l'accueil décale tout : on recale à sa sortie */
    document.addEventListener('swp:intro-done', function () {
        ScrollTrigger.refresh();
    });

})();