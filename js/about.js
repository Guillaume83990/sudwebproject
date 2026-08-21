/* ═══════════════════════════════════════════════════════════════
   ABOUT.JS — Sud Web Project
   La section « à propos ».

   L'ordre d'apparition raconte quelque chose : le portrait, puis
   la déclaration, puis les faits. On rencontre quelqu'un avant de
   lire ses arguments — jamais l'inverse.

   Sans GSAP, tout reste visible.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var about = document.querySelector('.about');
    if (!about) return;

    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (PRM) return;
    if (typeof window.gsap === 'undefined') return;
    if (typeof window.ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    var M = (window.SWP && window.SWP.motion) || {
        ease: 'power3.out', easeMask: 'power2.inOut', d2: .9, d3: 1.4
    };

    var isMobile = window.matchMedia('(max-width: 768px)').matches;

    /* ─────────────────────────────────────────────────────────
       1 · LE PORTRAIT
       Un masque qui s'ouvre du bas vers le haut, puis une dérive
       interne très lente. Le visage ne bouge pas — c'est le cadre
       qui respire autour de lui.
       ───────────────────────────────────────────────────────── */
    var wrap = about.querySelector('.about-img-wrap');
    var img = wrap && wrap.querySelector('img');
    var deco = about.querySelector('.about-deco');

    if (wrap) {
        gsap.fromTo(wrap,
            { clipPath: 'inset(0% 0% 100% 0%)' },
            {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: M.d3,
                ease: M.easeMask,
                scrollTrigger: { trigger: wrap, start: 'top 88%', once: true }
            }
        );
    }

    if (img && !isMobile) {
        gsap.fromTo(img,
            { yPercent: -5, scale: 1.08 },
            {
                yPercent: 5, scale: 1.08, ease: 'none',
                scrollTrigger: {
                    trigger: wrap,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.3
                }
            }
        );
    }

    if (deco) {
        gsap.fromTo(deco.children,
            { opacity: 0, y: 12 },
            {
                opacity: 1, y: 0,
                duration: .8, ease: M.ease, stagger: .09, delay: .7,
                scrollTrigger: { trigger: wrap, start: 'top 88%', once: true }
            }
        );
    }

    /* ─────────────────────────────────────────────────────────
       2 · LA DÉCLARATION
       Le libellé, la phrase, puis le paragraphe. Le titre lui-même
       est pris en charge par titles.js — on ne le touche pas.
       ───────────────────────────────────────────────────────── */
    var label = about.querySelector('.about-text .section-label');
    var statement = about.querySelector('.about-statement');
    var lead = about.querySelector('.about-lead');

    var intro = [label, statement, lead].filter(Boolean);

    if (intro.length) {
        gsap.fromTo(intro,
            { opacity: 0, y: 26 },
            {
                opacity: 1, y: 0,
                duration: M.d2, ease: M.ease, stagger: .12,
                scrollTrigger: { trigger: about.querySelector('.about-text'), start: 'top 84%', once: true }
            }
        );
    }

    /* ─────────────────────────────────────────────────────────
       3 · LA FICHE
       Chaque ligne monte derrière son filet. Le filet supérieur se
       trace d'abord : la règle avant le contenu, comme partout
       ailleurs sur le site.
       ───────────────────────────────────────────────────────── */
    var sheet = about.querySelector('.about-pts');
    var rows = about.querySelectorAll('.about-pt');

    if (sheet) {
        gsap.fromTo(sheet,
            { scaleX: 0, transformOrigin: 'left center' },
            {
                scaleX: 1, duration: 1, ease: M.easeMask,
                scrollTrigger: { trigger: sheet, start: 'top 88%', once: true }
            }
        );
    }

    if (rows.length) {
        gsap.fromTo(rows,
            { opacity: 0, y: 18 },
            {
                opacity: 1, y: 0,
                duration: .8, ease: M.ease, stagger: .09, delay: .22,
                scrollTrigger: { trigger: sheet || about, start: 'top 88%', once: true }
            }
        );
    }

    /* ─────────────────────────────────────────────────────────
       4 · LA SIGNATURE
       ───────────────────────────────────────────────────────── */
    var sign = about.querySelector('.about-sign');
    var cta = about.querySelector('.about-text .btn-primary');

    var end = [sign, cta].filter(Boolean);
    if (end.length) {
        gsap.fromTo(end,
            { opacity: 0, y: 16 },
            {
                opacity: 1, y: 0,
                duration: .8, ease: M.ease, stagger: .12, delay: .35,
                scrollTrigger: { trigger: end[0], start: 'top 92%', once: true }
            }
        );
    }
})();