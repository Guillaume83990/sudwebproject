/* ═══════════════════════════════════════════════════════════════
   MOTION.JS — Sud Web Project — v3
   Le liant du site. Trois rôles :

     1 · le scroll fluide (Lenis), synchronisé avec ScrollTrigger
     2 · une grammaire GSAP unique pour TOUTES les animations
     3 · les ancres et le retour en haut, adaptés au scroll fluide

   CORRECTIF v3 — LE SCROLL QUI SE BLOQUE ET REPART
   Deux causes traitées ici.

   a · LE RECALAGE PENDANT LE SCROLL
   ScrollTrigger.refresh() remesure toute la page. Appelé pendant
   que Lenis est en train d'interpoler, il produit un à-coup net :
   la page se fige le temps du calcul, puis rattrape. Plusieurs
   scripts l'appelaient directement, à n'importe quel moment.
   On expose désormais un recalage unique, groupé, et qui attend
   que le scroll soit au repos. Tous les scripts doivent passer
   par window.SWP.refresh().

   b · LA BARRE D'URL MOBILE
   Sur iOS et Android, la barre d'adresse qui se replie pendant le
   scroll déclenche un événement resize. ScrollTrigger écoute
   resize par défaut et recale toute la page — en plein scroll.
   C'est le blocage le plus visible sur téléphone. On retire resize
   des événements automatiques et on le remplace par un écouteur
   qui ne réagit qu'à un vrai changement de LARGEUR.

   CORRECTIF v2 — LE RÉGLAGE DU SCROLL (conservé)
   Lissage exponentiel court (lerp) plutôt que durée + courbe :
   la page rattrape le point visé en continu, avec un retard
   constant et bref. La molette répond immédiatement.
   Le luxe, c'est la précision, pas la lenteur.

   À CHARGER JUSTE APRÈS ScrollTrigger, AVANT global.js et tous les
   autres scripts.

   Dépendances : gsap, ScrollTrigger, lenis.min.js
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var CONFIG = {
        /* Force du lissage, entre 0 et 1.
           0.08 = très glissant mais flottant · 0.16 = quasi sec.
           0.11 est le point où c'est fluide ET précis. */
        LERP: 0.11,

        /* Sensibilité de la molette. En dessous de 1 on freine le
           défilement, ce qui donne exactement la sensation « ça
           rame ». On n'y touche pas. */
        WHEEL: 1,

        /* Scroll fluide au doigt : NON.
           L'inertie native des téléphones est excellente, et c'est
           en activant syncTouch qu'apparaissent les problèmes
           connus sur Safari iOS. Sans lui, Lenis n'intercepte que
           la molette — sur iPhone il est donc inerte, et le scroll
           natif reste intact. Ne pas passer à true. */
        SMOOTH_TOUCH: false,

        /* Décalage des ancres, pour que la nav ne recouvre pas la
           section visée */
        ANCHOR_OFFSET: -90,

        /* Durée d'un saut d'ancre. Assez court pour rester nerveux. */
        ANCHOR_DURATION: 1.0,

        /* Délai de groupage des demandes de recalage */
        REFRESH_DEBOUNCE: 120,

        /* Délai de réessai quand le scroll est encore en mouvement */
        REFRESH_RETRY: 180
    };

    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasGsap = typeof window.gsap !== 'undefined';
    var hasST = typeof window.ScrollTrigger !== 'undefined';

    /* ═════════════════════════════════════════════════════════
       1 · LA GRAMMAIRE GSAP
       Une seule courbe d'entrée, une seule courbe de masque, un
       seul point de déclenchement. Tout ce qui ne précise rien
       hérite de ces valeurs.
       ═══════════════════════════════════════════════════════ */
    if (hasGsap) {
        gsap.defaults({
            ease: 'power3.out',
            duration: 0.9,
            overwrite: 'auto'
        });
    }

    if (hasST) {
        gsap.registerPlugin(ScrollTrigger);

        ScrollTrigger.defaults({
            start: 'top 85%',
            toggleActions: 'play none none none'
        });

        /* resize est retiré de la liste : c'est lui qui provoque le
           recalage intempestif quand la barre d'URL mobile se
           replie. On le gère nous-mêmes, plus bas, en ne réagissant
           qu'à un changement de largeur. */
        ScrollTrigger.config({
            ignoreMobileResize: true,
            autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load'
        });
    }

    window.SWP = window.SWP || {};
    window.SWP.motion = {
        ease: 'power3.out',
        easeMask: 'power2.inOut',
        d1: 0.5,
        d2: 0.9,
        d3: 1.4
    };

    /* ═════════════════════════════════════════════════════════
       2 · LE SCROLL FLUIDE
       ═══════════════════════════════════════════════════════ */
    var lenis = null;

    function initLenis() {
        if (PRM) return;
        if (typeof window.Lenis === 'undefined') return;

        lenis = new Lenis({
            /* Lissage exponentiel : pas de durée, pas de courbe.
               La page suit le doigt de la molette avec un retard
               court et constant. */
            lerp: CONFIG.LERP,
            smoothWheel: true,
            syncTouch: CONFIG.SMOOTH_TOUCH,
            wheelMultiplier: CONFIG.WHEEL,
            touchMultiplier: 1.5,
            infinite: false
        });

        window.SWP.lenis = lenis;

        if (hasST) {
            /* Sans ces deux lignes, ScrollTrigger et Lenis dérivent
               l'un de l'autre et les parallaxes deviennent molles. */
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
            gsap.ticker.lagSmoothing(0);
        } else {
            var loop = function (t) { lenis.raf(t); requestAnimationFrame(loop); };
            requestAnimationFrame(loop);
        }
    }

    /* Le scroll est-il en mouvement ?
       Lenis expose isScrolling, mais la propriété a changé de forme
       selon les versions : on se replie sur une mesure directe. */
    var lastY = window.scrollY || 0;
    var lastT = 0;

    function isMoving() {
        if (lenis && typeof lenis.isScrolling !== 'undefined' && lenis.isScrolling) return true;
        var y = window.scrollY || window.pageYOffset || 0;
        var now = Date.now();
        var moved = Math.abs(y - lastY) > 1;
        if (moved) { lastY = y; lastT = now; return true; }
        /* on considère le scroll au repos 250 ms après le dernier
           déplacement, le temps que Lenis finisse d'interpoler */
        return (now - lastT) < 250;
    }

    /* ═════════════════════════════════════════════════════════
       3 · ANCRES ET RETOUR EN HAUT
       window.scrollTo ne connaît pas Lenis : il faut rebrancher.
       ═══════════════════════════════════════════════════════ */
    function scrollTo(target, offset) {
        if (lenis) {
            lenis.scrollTo(target, {
                offset: offset || 0,
                duration: CONFIG.ANCHOR_DURATION,
                easing: function (t) { return 1 - Math.pow(1 - t, 3); }
            });
        } else if (typeof target === 'number') {
            window.scrollTo({ top: target, behavior: 'smooth' });
        } else if (target && target.scrollIntoView) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function bindAnchors() {
        document.addEventListener('click', function (e) {
            var a = e.target.closest && e.target.closest('a[href^="#"]');
            if (!a) return;

            var id = a.getAttribute('href');
            if (!id || id === '#' || id.length < 2) return;

            var el = document.querySelector(id);
            if (!el) return;

            e.preventDefault();
            scrollTo(el, CONFIG.ANCHOR_OFFSET);

            if (history.replaceState) history.replaceState(null, '', id);
        });

        /* Le bouton de retour en haut de global.js appelle
           window.scrollTo : on le reprend avant lui */
        var btt = document.getElementById('back-to-top');
        if (btt) {
            btt.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                scrollTo(0);
            }, true);
        }
    }

    window.SWP.scrollTo = scrollTo;

    /* ═════════════════════════════════════════════════════════
       4 · LE RECALAGE
       Polices, images et preloader modifient les hauteurs après
       coup : sans recalage, les déclencheurs visent à côté.

       Une seule porte d'entrée : window.SWP.refresh().
       Les demandes sont groupées, et repoussées tant que le scroll
       bouge — un recalage en plein défilement est exactement ce
       qui fait décrocher la page.
       ═══════════════════════════════════════════════════════ */
    var refreshTimer = null;

    function doRefresh() {
        refreshTimer = null;

        if (isMoving()) {
            refreshTimer = setTimeout(doRefresh, CONFIG.REFRESH_RETRY);
            return;
        }

        if (hasST) ScrollTrigger.refresh();
        if (lenis) lenis.resize();
    }

    function refresh() {
        if (refreshTimer) clearTimeout(refreshTimer);
        refreshTimer = setTimeout(doRefresh, CONFIG.REFRESH_DEBOUNCE);
    }

    window.SWP.refresh = refresh;

    /* Le vrai redimensionnement : uniquement quand la LARGEUR
       change. Sur téléphone, la barre d'URL ne modifie que la
       hauteur — on l'ignore. */
    function bindResize() {
        var lastW = window.innerWidth;

        window.addEventListener('resize', function () {
            if (window.innerWidth === lastW) return;
            lastW = window.innerWidth;
            refresh();
        }, { passive: true });

        window.addEventListener('orientationchange', function () {
            lastW = window.innerWidth;
            setTimeout(refresh, 300);
        }, { passive: true });
    }

    function boot() {
        initLenis();
        bindAnchors();
        bindResize();

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(refresh);
        }
        window.addEventListener('load', function () { setTimeout(refresh, 120); });

        var root = document.documentElement;
        if (root.classList.contains('swp-preloading') && 'MutationObserver' in window) {
            var mo = new MutationObserver(function () {
                if (!root.classList.contains('swp-preloading')) {
                    mo.disconnect();
                    setTimeout(refresh, 200);
                }
            });
            mo.observe(root, { attributes: true, attributeFilter: ['class'] });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();