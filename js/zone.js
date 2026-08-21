/* ═══════════════════════════════════════════════════════════════
   ZONE.JS — Sud Web Project — v2
   Zone d'intervention et services complémentaires.

   La v1 dessinait un trait de côte. Le plan ayant cédé la place à
   un sommaire, l'animation se resserre : le filet supérieur se
   trace, puis les entrées se posent en cascade, colonne gauche et
   colonne droite en alternance — c'est ainsi qu'on lit un
   sommaire, pas de haut en bas d'une seule colonne.

   Sans GSAP, tout reste visible et cliquable.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var zone = document.querySelector('.zone');
    var svc = document.querySelector('.services-compl');
    if (!zone && !svc) return;

    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (PRM) return;
    if (typeof window.gsap === 'undefined') return;
    if (typeof window.ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    var M = (window.SWP && window.SWP.motion) || {
        ease: 'power3.out', easeMask: 'power2.inOut', d2: .9
    };

    /* ═════════════════════════════════════════════════════════
       1 · LE SOMMAIRE DES VILLES
       ═══════════════════════════════════════════════════════ */
    if (zone) {
        var grid = zone.querySelector('.zone-grid');
        var cards = Array.prototype.slice.call(zone.querySelectorAll('.zone-card'));

        /* Le filet supérieur se trace avant que rien n'arrive :
           la règle d'abord, le contenu ensuite. */
        if (grid) {
            gsap.fromTo(grid,
                { '--dummy': 0, scaleX: 0, transformOrigin: 'left center' },
                {
                    scaleX: 1, duration: 1, ease: M.easeMask,
                    scrollTrigger: { trigger: grid, start: 'top 88%', once: true }
                }
            );
        }

        if (cards.length) {
            gsap.fromTo(cards,
                { opacity: 0, y: 22 },
                {
                    opacity: 1, y: 0,
                    duration: .85, ease: M.ease,
                    /* Décalage court : un sommaire se parcourt vite,
                       une cascade lente le ferait attendre. */
                    stagger: .055,
                    delay: .2,
                    scrollTrigger: { trigger: grid || zone, start: 'top 86%', once: true }
                }
            );
        }

        var seo = zone.querySelector('.zone-seo');
        if (seo) {
            gsap.fromTo(seo.children,
                { opacity: 0, y: 18 },
                {
                    opacity: 1, y: 0,
                    duration: .8, ease: M.ease, stagger: .09,
                    scrollTrigger: { trigger: seo, start: 'top 90%', once: true }
                }
            );
        }
    }

    /* ═════════════════════════════════════════════════════════
       2 · LES SERVICES
       Deux lignes seulement : la cascade reste très serrée, sinon
       la seconde se fait attendre.
       ═══════════════════════════════════════════════════════ */
    if (svc) {
        var sGrid = svc.querySelector('.services-compl-grid');
        var rows = svc.querySelectorAll('.svc-card');

        if (sGrid) {
            gsap.fromTo(sGrid,
                { scaleX: 0, transformOrigin: 'left center' },
                {
                    scaleX: 1, duration: 1, ease: M.easeMask,
                    scrollTrigger: { trigger: sGrid, start: 'top 88%', once: true }
                }
            );
        }

        if (rows.length) {
            gsap.fromTo(rows,
                { opacity: 0, y: 22 },
                {
                    opacity: 1, y: 0,
                    duration: .85, ease: M.ease, stagger: .12, delay: .2,
                    scrollTrigger: { trigger: sGrid || svc, start: 'top 88%', once: true }
                }
            );
        }
    }
})();