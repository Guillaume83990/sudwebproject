/* ═══════════════════════════════════════════════════════════════
   EXTRAS.JS — Sud Web Project
   Maintenance et options à la carte.

   Trois mouvements, discrets par construction : ces deux blocs
   arrivent après les formules, le visiteur y consulte plus qu'il
   n'y découvre. L'animation doit accompagner la lecture, pas la
   retenir.

   Sans GSAP, tout s'affiche à l'état final.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var care = document.querySelector('.care');
    var opts = document.querySelector('.opts');
    if (!care && !opts) return;

    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var M = (window.SWP && window.SWP.motion) || {
        ease: 'power3.out', easeMask: 'power2.inOut', d2: .9
    };

    function setFinal() {
        var cols = document.querySelector('.care-cols');
        if (cols) cols.classList.add('is-drawn');
        document.querySelectorAll('.care-amount[data-value]').forEach(function (el) {
            el.textContent = el.getAttribute('data-value');
        });
    }

    if (PRM || typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
        setFinal();
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* ═════════════════════════════════════════════════════════
       1 · LA MAINTENANCE
       ═══════════════════════════════════════════════════════ */
    if (care) {
        var head = care.querySelector('.care-head');
        var cols = care.querySelector('.care-cols');
        var link = care.querySelector('.care-link');

        if (head) {
            gsap.fromTo(head.children,
                { opacity: 0, y: 22 },
                {
                    opacity: 1, y: 0, duration: M.d2, ease: M.ease, stagger: .08,
                    scrollTrigger: { trigger: care, start: 'top 84%', once: true }
                }
            );
        }

        /* Le filet vertical se trace avant que les colonnes n'arrivent :
           la règle d'abord, le contenu ensuite. */
        if (cols) {
            ScrollTrigger.create({
                trigger: cols,
                start: 'top 82%',
                once: true,
                onEnter: function () { cols.classList.add('is-drawn'); }
            });

            care.querySelectorAll('.care-col').forEach(function (col, i) {
                gsap.fromTo(col.children,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0,
                        duration: .8, ease: M.ease, stagger: .06,
                        delay: .25 + i * 0.14,
                        scrollTrigger: { trigger: cols, start: 'top 82%', once: true }
                    }
                );
            });
        }

        /* Les mensualités s'incrémentent — brièvement, ce ne sont
           pas les chiffres qui portent la section. */
        care.querySelectorAll('.care-amount[data-value]').forEach(function (el, i) {
            var target = parseInt(el.getAttribute('data-value'), 10);
            if (isNaN(target)) return;
            var obj = { v: 0 };
            el.textContent = '0';

            ScrollTrigger.create({
                trigger: el,
                start: 'top 88%',
                once: true,
                onEnter: function () {
                    gsap.to(obj, {
                        v: target,
                        duration: .9 + i * .25,
                        ease: 'power3.out',
                        delay: .35,
                        onUpdate: function () { el.textContent = Math.round(obj.v); },
                        onComplete: function () { el.textContent = target; }
                    });
                }
            });
        });

        if (link) {
            gsap.fromTo(link,
                { opacity: 0, y: 16 },
                {
                    opacity: 1, y: 0, duration: .75, ease: M.ease, delay: .5,
                    scrollTrigger: { trigger: care, start: 'top 72%', once: true }
                }
            );
        }
    }

    /* ═════════════════════════════════════════════════════════
       2 · LES OPTIONS
       Une cascade serrée : c'est une liste qu'on parcourt, pas une
       suite de révélations.
       ═══════════════════════════════════════════════════════ */
    if (opts) {
        var oHead = opts.querySelector('.opts-head');
        var rows = opts.querySelectorAll('.opt-row');
        var foot = opts.querySelector('.opts-foot');

        if (oHead) {
            gsap.fromTo(oHead.children,
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0, duration: M.d2, ease: M.ease, stagger: .08,
                    scrollTrigger: { trigger: opts, start: 'top 84%', once: true }
                }
            );
        }

        if (rows.length) {
            gsap.fromTo(rows,
                { opacity: 0, y: 18 },
                {
                    opacity: 1, y: 0,
                    duration: .7, ease: M.ease, stagger: .055,
                    scrollTrigger: { trigger: opts.querySelector('.opt-list'), start: 'top 86%', once: true }
                }
            );
        }

        if (foot) {
            gsap.fromTo(foot,
                { opacity: 0 },
                {
                    opacity: 1, duration: .8, ease: 'none', delay: .3,
                    scrollTrigger: { trigger: foot, start: 'top 92%', once: true }
                }
            );
        }
    }
})();