/* ═══════════════════════════════════════════════════════════════
   METIERS.JS — Sud Web Project — v3
   Index éditorial des métiers :
     · chaque visuel s'ouvre par un masque quand sa ligne entre
     · parallaxe interne de l'image pendant le défilement
     · la ligne survolée s'active (desktop), ou celle au centre
       de l'écran (tactile)

   Plus aucun élément flottant : rien ne peut recouvrir un lien.
   GSAP est optionnel — sans lui, tout reste visible et cliquable.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var section = document.querySelector('.hub-metiers');
    if (!section) return;

    var rows = Array.prototype.slice.call(section.querySelectorAll('.mx-row'));
    if (!rows.length) return;

    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ─────────────────────────────────────────────────────────
       1 · ACTIVATION D'UNE LIGNE
       ───────────────────────────────────────────────────────── */
    var current = -1;

    function activate(i) {
        if (i === current) return;
        current = i;
        rows.forEach(function (r, k) { r.classList.toggle('is-active', k === i); });
    }

    if (finePointer) {
        rows.forEach(function (row, i) {
            row.addEventListener('pointerenter', function () { activate(i); });
        });
        section.addEventListener('pointerleave', function () {
            rows.forEach(function (r) { r.classList.remove('is-active'); });
            current = -1;
        });
    } else if ('IntersectionObserver' in window) {
        /* Au doigt : la ligne au centre de l'écran s'active */
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) activate(rows.indexOf(e.target));
            });
        }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
        rows.forEach(function (r) { io.observe(r); });
    }

    /* ─────────────────────────────────────────────────────────
       2 · ANIMATIONS
       ───────────────────────────────────────────────────────── */
    if (PRM) return;
    if (typeof window.gsap === 'undefined') return;
    if (typeof window.ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    /* Le texte de chaque ligne monte, décalé */
    rows.forEach(function (row) {
        var head = row.querySelector('.mx-head');
        var num = row.querySelector('.mx-num');
        var media = row.querySelector('.mx-media');
        var img = media && media.querySelector('img');

        if (head) {
            gsap.fromTo([num, head].filter(Boolean),
                { opacity: 0, y: 26 },
                {
                    opacity: 1, y: 0, duration: .85, ease: 'power3.out', stagger: .08,
                    scrollTrigger: { trigger: row, start: 'top 88%', once: true }
                }
            );
        }

        /* Le visuel s'ouvre par un masque, de bas en haut */
        if (media) {
            gsap.fromTo(media,
                { clipPath: 'inset(0% 0% 100% 0%)', opacity: 0 },
                {
                    clipPath: 'inset(0% 0% 0% 0%)', opacity: 1,
                    duration: 1.15, ease: 'power3.inOut',
                    scrollTrigger: { trigger: row, start: 'top 86%', once: true }
                }
            );
        }

        /* Parallaxe interne : l'image glisse moins vite que son cadre.
           L'échelle est pilotée ici et non en CSS — GSAP écrit dans
           transform, les deux ne peuvent pas cohabiter. */
        if (img) {
            gsap.fromTo(img,
                { yPercent: -4.5, scale: 1.12 },
                {
                    yPercent: 4.5, scale: 1.12, ease: 'none',
                    scrollTrigger: {
                        trigger: row,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1.1
                    }
                }
            );
        }
    });

    /* Le filet supérieur de l'index se trace */
    var list = section.querySelector('.mx-list');
    if (list) {
        gsap.fromTo(list,
            { '--mx-line': '0%' },
            {
                duration: 1.2, ease: 'power2.out',
                scrollTrigger: { trigger: list, start: 'top 90%', once: true }
            }
        );
    }
})();