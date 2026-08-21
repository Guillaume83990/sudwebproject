/* ═══════════════════════════════════════════════════════════════
   BREATH.JS — Sud Web Project
   La respiration éditoriale.

   Les mots s'allument au rythme EXACT du défilement — pas sur une
   durée fixe. C'est ce qui change tout : le visiteur ne regarde
   pas une animation, il la produit. S'il s'arrête, elle s'arrête.

   Aucun mot n'est jamais caché par le CSS : si ce script ne se
   charge pas, la phrase reste parfaitement lisible.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var sections = Array.prototype.slice.call(document.querySelectorAll('.breath'));
    if (!sections.length) return;

    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ─────────────────────────────────────────────────────────
       1 · DÉCOUPAGE EN MOTS
       On traverse les <em> sans casser leur mise en forme.
       ───────────────────────────────────────────────────────── */
    function splitWords(line) {
        if (line.dataset.split === '1') return;

        var textNodes = [];
        (function collect(n) {
            for (var i = 0; i < n.childNodes.length; i++) {
                var c = n.childNodes[i];
                if (c.nodeType === 3) textNodes.push(c);
                else if (c.nodeType === 1) collect(c);
            }
        })(line);

        textNodes.forEach(function (node) {
            var parts = node.textContent.split(/(\s+)/);
            var frag = document.createDocumentFragment();

            parts.forEach(function (p) {
                if (!p) return;
                if (/^\s+$/.test(p)) {
                    frag.appendChild(document.createTextNode(' '));
                    return;
                }
                var w = document.createElement('span');
                w.className = 'breath-word';
                w.textContent = p;
                frag.appendChild(w);
            });

            if (node.parentNode) node.parentNode.replaceChild(frag, node);
        });

        line.dataset.split = '1';
    }

    sections.forEach(function (section) {
        var line = section.querySelector('.breath-line');
        if (!line) return;

        /* Le filet vertical se trace dès l'entrée, quoi qu'il arrive */
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries, obs) {
                if (entries[0].isIntersecting) {
                    section.classList.add('is-marked');
                    obs.disconnect();
                }
            }, { threshold: 0.2 }).observe(section);
        } else {
            section.classList.add('is-marked');
        }

        if (PRM) return;
        if (typeof window.gsap === 'undefined') return;
        if (typeof window.ScrollTrigger === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);
        splitWords(line);

        var words = line.querySelectorAll('.breath-word');
        if (!words.length) return;

        /* ─────────────────────────────────────────────────────
           2 · L'ALLUMAGE
           Lié au scroll (scrub), pas à une durée. Les mots
           s'éclairent l'un après l'autre pendant que la phrase
           traverse l'écran.
           ───────────────────────────────────────────────────── */
        gsap.set(words, { opacity: 0.14 });

        gsap.to(words, {
            opacity: 1,
            ease: 'none',
            stagger: 0.4,
            scrollTrigger: {
                trigger: section,
                start: 'top 72%',
                end: 'bottom 68%',
                scrub: 0.6
            }
        });

        /* Un très léger glissement de la phrase entière : il ne se
           remarque pas, mais c'est lui qui donne la profondeur. */
        gsap.fromTo(line,
            { y: 22 },
            {
                y: -22,
                ease: 'none',
                scrollTrigger: {
                    trigger: section,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.2
                }
            }
        );
    });
})();