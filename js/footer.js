/* ═══════════════════════════════════════════════════════════════
   FOOTER.JS — Sud Web Project
   Le colophon.

   Un footer ne doit pas retenir : le visiteur y arrive soit pour
   naviguer, soit parce qu'il a fini. L'animation reste donc très
   courte et très basse — elle installe, elle ne met pas en scène.

   Sans GSAP, tout reste visible.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var footer = document.querySelector('.footer');
    if (!footer) return;

    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (PRM) return;
    if (typeof window.gsap === 'undefined') return;
    if (typeof window.ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    var M = (window.SWP && window.SWP.motion) || {
        ease: 'power3.out', easeMask: 'power2.inOut', d2: .9
    };

    /* ─────────────────────────────────────────────────────────
       1 · LA MARQUE ET LES COLONNES
       ───────────────────────────────────────────────────────── */
    var brand = footer.querySelector('.footer-brand');
    var cols = footer.querySelectorAll('.footer-col');

    if (brand) {
        gsap.fromTo(brand.children,
            { opacity: 0, y: 20 },
            {
                opacity: 1, y: 0,
                duration: .8, ease: M.ease, stagger: .08,
                scrollTrigger: { trigger: footer, start: 'top 90%', once: true }
            }
        );
    }

    if (cols.length) {
        gsap.fromTo(cols,
            { opacity: 0, y: 18 },
            {
                opacity: 1, y: 0,
                duration: .75, ease: M.ease, stagger: .09, delay: .12,
                scrollTrigger: { trigger: footer, start: 'top 90%', once: true }
            }
        );
    }

    /* ─────────────────────────────────────────────────────────
       2 · LA SIGNATURE
       Un fondu long et une montée minime : c'est un filigrane, il
       ne doit jamais attirer le regard en arrivant.
       ───────────────────────────────────────────────────────── */
    var mark = footer.querySelector('.footer-mark');

    if (mark) {
        gsap.fromTo(mark,
            { opacity: 0, y: 26 },
            {
                opacity: 1, y: 0,
                duration: 1.6, ease: M.easeMask,
                scrollTrigger: { trigger: mark, start: 'top 96%', once: true }
            }
        );
    }

    /* ─────────────────────────────────────────────────────────
       3 · LA BARRE LÉGALE ET LE COLOPHON
       ───────────────────────────────────────────────────────── */
    var bottom = footer.querySelector('.footer-bottom');
    var seo = footer.querySelector('.footer-seo');

    if (bottom) {
        gsap.fromTo(bottom.children,
            { opacity: 0 },
            {
                opacity: 1, duration: .9, ease: 'none', stagger: .1,
                scrollTrigger: { trigger: bottom, start: 'top 97%', once: true }
            }
        );
    }

    if (seo) {
        gsap.fromTo(seo,
            { opacity: 0 },
            {
                opacity: 1, duration: 1.1, ease: 'none',
                scrollTrigger: { trigger: seo, start: 'top 99%', once: true }
            }
        );
    }
})();