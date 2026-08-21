/* ═══════════════════════════════════════════════════════════════
   TITLES.JS — Sud Web Project
   Révélation des grands titres, lettre par lettre.

   Chaque mot devient une fenêtre, chaque lettre glisse dedans.
   En Instrument Serif, c'est le mouvement qui donne le plus de
   présence à un titre — bien plus qu'une apparition en bloc.

   COHABITATION AVEC GLOBAL.JS
   global.js enveloppe déjà les .split-reveal dans un .rv-inner et
   les anime par transition CSS. On ne le supprime pas : on force
   le .rv-inner à rester visible et on anime les lettres à
   l'intérieur. Aucune suppression de code n'est nécessaire.

   À CHARGER EN DERNIER, après global.js et lux.js.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (PRM) return;
    if (typeof window.gsap === 'undefined') return;
    if (typeof window.ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    var M = (window.SWP && window.SWP.motion) || {
        ease: 'power3.out', easeMask: 'power2.inOut', d2: 0.9, d3: 1.4
    };

    /* Les titres concernés — grands formats uniquement.
       Un titre de carte animé lettre par lettre ferait gadget. */
    var SELECTOR = [
        '.hero-title .split-reveal',
        '.ville-hero-title',
        '.section-title .split-reveal',
        '.about-title .split-reveal',
        '.contact-title .split-reveal',
        '.ville-h2 .split-reveal',
        '.refonte-title'
    ].join(',');

    /* ─────────────────────────────────────────────────────────
       1 · DÉCOUPAGE
       On enveloppe chaque mot (la fenêtre) puis chaque lettre
       (le mobile). Les espaces sont préservés pour que le titre
       continue de se couper naturellement en fin de ligne.
       ───────────────────────────────────────────────────────── */
    function splitNode(node) {
        var text = node.textContent;
        if (!text || !text.trim()) return null;

        var frag = document.createDocumentFragment();
        var words = text.split(/(\s+)/);

        words.forEach(function (w) {
            if (!w) return;

            if (/^\s+$/.test(w)) {
                frag.appendChild(document.createTextNode(' '));
                return;
            }

            var wordEl = document.createElement('span');
            wordEl.className = 'swp-word';

            for (var i = 0; i < w.length; i++) {
                var c = document.createElement('span');
                c.className = 'swp-char';
                c.textContent = w[i];
                wordEl.appendChild(c);
            }
            frag.appendChild(wordEl);
        });

        return frag;
    }

    /* Parcours récursif : on traverse <em>, <strong>, <a>… sans
       casser leur mise en forme */
    function splitElement(el) {
        if (el.classList.contains('swp-split')) return;

        var walker = [];
        (function collect(n) {
            for (var i = 0; i < n.childNodes.length; i++) {
                var child = n.childNodes[i];
                if (child.nodeType === 3) walker.push(child);
                else if (child.nodeType === 1 && !child.classList.contains('swp-word')) {
                    collect(child);
                }
            }
        })(el);

        walker.forEach(function (textNode) {
            var frag = splitNode(textNode);
            if (frag && textNode.parentNode) {
                textNode.parentNode.replaceChild(frag, textNode);
            }
        });

        el.classList.add('swp-split');
    }

    /* ─────────────────────────────────────────────────────────
       2 · ANIMATION
       ───────────────────────────────────────────────────────── */
    function setup() {
        var targets = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
        if (!targets.length) return;

        targets.forEach(function (el) {
            /* global.js a peut-être déjà posé un .rv-inner : on
               travaille dedans, et on le neutralise pour qu'il
               n'anime plus rien lui-même */
            var host = el.querySelector('.rv-inner') || el;
            if (host !== el) {
                host.style.transform = 'none';
                host.style.opacity = '1';
                host.style.transition = 'none';
            }

            splitElement(host);

            var chars = host.querySelectorAll('.swp-char');
            if (!chars.length) return;

            gsap.set(chars, { yPercent: 108 });

            /* Le déclencheur porte sur le bloc titre entier, pas sur
               chaque ligne : les deux lignes d'un même titre doivent
               s'enchaîner, pas se déclencher séparément. */
            var trigger = el.closest('h1, h2, h3') || el;

            gsap.to(chars, {
                yPercent: 0,
                duration: M.d3,
                ease: M.easeMask,
                stagger: { each: 0.012, from: 'start' },
                scrollTrigger: {
                    trigger: trigger,
                    start: 'top 88%',
                    once: true
                }
            });
        });
    }

    /* ─────────────────────────────────────────────────────────
       3 · DÉMARRAGE
       global.js enveloppe les titres du hero sur DOMContentLoaded,
       et après le preloader. On attend que la page soit stable.
       ───────────────────────────────────────────────────────── */
    function boot() {
        setup();
        setTimeout(function () {
            setup();                       /* rattrape les titres du hero */
            ScrollTrigger.refresh();
        }, 400);
    }

    var root = document.documentElement;

    if (root.classList.contains('swp-preloading') && 'MutationObserver' in window) {
        var mo = new MutationObserver(function () {
            if (!root.classList.contains('swp-preloading')) {
                mo.disconnect();
                setTimeout(boot, 150);
            }
        });
        mo.observe(root, { attributes: true, attributeFilter: ['class'] });
        setTimeout(boot, 12000);           /* filet */
    } else if (document.readyState === 'complete') {
        boot();
    } else {
        window.addEventListener('load', boot);
    }
})();