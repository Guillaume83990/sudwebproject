/* ═══════════════════════════════════════════════════════════════
   VILLE-HERO.JS — Sud Web Project
   Le hero des pages ville. GABARIT — il sert les 20 pages.

   LA PROFONDEUR SANS WEBGL
   Trois plans défilent à trois vitesses : l'image lentement, le
   nom géant plus vite, le contenu plus vite encore. C'est ce
   décalage qui produit le relief — pas une scène 3D. Sur vingt
   pages, Three.js aurait coûté 600 ko pour un effet que l'image
   porte déjà seule.

   ville-animations.js anime les mêmes cibles dans sa séquence
   d'ouverture. On lui reprend la main ici plutôt que de le
   modifier : deux scripts qui écrivent la même propriété
   produisent toujours un mouvement erratique.

   Sans GSAP, tout reste visible et lisible.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var hero = document.querySelector('.ville-hero');
    if (!hero) return;

    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Le filet des coordonnées se trace quoi qu'il arrive */
    requestAnimationFrame(function () { hero.classList.add('is-set'); });

    if (PRM) return;
    if (typeof window.gsap === 'undefined') return;
    if (typeof window.ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    var M = (window.SWP && window.SWP.motion) || {
        ease: 'power3.out', easeMask: 'power2.inOut', d2: .9, d3: 1.4
    };

    var isMobile = window.matchMedia('(max-width: 768px)').matches;

    var img = hero.querySelector('.ville-hero-img');
    var mark = hero.querySelector('.ville-mark');
    var badge = hero.querySelector('.ville-hero-badge');
    var title = hero.querySelector('.ville-hero-title');
    var sub = hero.querySelector('.ville-hero-sub');
    var actions = hero.querySelector('.ville-hero-actions');
    var metrics = hero.querySelector('.ville-hero-metrics');
    var coord = hero.querySelector('.ville-coord-val');

    /* ─────────────────────────────────────────────────────────
       1 · ON REPREND LA MAIN
       ───────────────────────────────────────────────────────── */
    var seq = [badge, title, sub, actions, metrics].filter(Boolean);
    gsap.killTweensOf(seq);
    gsap.set(seq, { clearProps: 'all' });

    /* ─────────────────────────────────────────────────────────
       2 · L'ENTRÉE
       Le nom du lieu arrive en premier et lentement : c'est
       l'arrivée quelque part, pas l'ouverture d'une page.
       ───────────────────────────────────────────────────────── */
    var tl = gsap.timeline({ delay: .15 });

    if (mark) {
        tl.fromTo(mark,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 1.8, ease: M.easeMask }, 0);
    }

    if (badge) tl.fromTo(badge, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .8, ease: M.ease }, .2);
    if (title) tl.fromTo(title, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: M.d3, ease: M.easeMask }, .3);
    if (sub) tl.fromTo(sub, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: M.d2, ease: M.ease }, .55);
    if (actions) tl.fromTo(actions, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: M.d2, ease: M.ease }, .68);
    if (metrics) tl.fromTo(metrics, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: M.d2, ease: M.ease }, .8);
    if (coord) tl.fromTo(coord, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'none' }, 1.1);

    /* ─────────────────────────────────────────────────────────
       3 · LES TROIS PLANS
       Amplitudes volontairement faibles : au-delà, on voit le
       cadrage bouger, ce qui trahit l'effet au lieu de le servir.
       ───────────────────────────────────────────────────────── */
    if (!isMobile) {

        if (img) {
            gsap.killTweensOf(img);
            gsap.fromTo(img,
                { yPercent: -4, scale: 1.08 },
                {
                    yPercent: 7, scale: 1.08, ease: 'none',
                    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1.3 }
                }
            );
        }

        if (mark) {
            gsap.to(mark, {
                yPercent: -34, ease: 'none',
                scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 }
            });
        }

        var content = hero.querySelector('.container');
        if (content) {
            gsap.to(content, {
                yPercent: -14, opacity: .35, ease: 'none',
                scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .8 }
            });
        }

    } else if (img) {
        gsap.set(img, { scale: 1.04 });
    }
})();