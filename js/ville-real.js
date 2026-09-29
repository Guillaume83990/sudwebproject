/* ═══════════════════════════════════════════════════════════════
   VILLE-REAL.JS — Sud Web Project — pages villes
   La lampe sur les cartes « Réalisations » (même geste que sur
   l'accueil) et, sur téléphone, la couleur révélée quand la
   carte passe au centre de l'écran. Voir css/ville-real.css.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var cards = Array.prototype.slice.call(document.querySelectorAll('.st-real-card'));
    if (!cards.length) return;

    var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Téléphone : la carte au centre de l'écran révèle ses couleurs */
    if (!FINE && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { e.target.classList.toggle('is-lit', e.isIntersecting); });
        }, { rootMargin: '-38% 0px -38% 0px', threshold: 0 });
        cards.forEach(function (c) { io.observe(c); });
        return;
    }
    if (!FINE || PRM) return;

    document.documentElement.classList.add('swp-lamp');

    cards.forEach(function (card) {
        var el = card.querySelector('.st-real-img');
        if (!el) return;
        var halo = document.createElement('span');
        halo.className = 'swp-halo';
        halo.setAttribute('aria-hidden', 'true');
        el.appendChild(halo);

        var pending = null, r = 0, target = 0, raf = null;

        function radius() { return Math.round(Math.max(150, Math.min(300, el.offsetWidth * .34))); }

        /* Le rayon s'ouvre et se referme en douceur, sans dépendre de GSAP */
        function grow() {
            raf = null;
            r += (target - r) * .16;
            if (Math.abs(target - r) < .5) r = target;
            el.style.setProperty('--lr', r.toFixed(1) + 'px');
            if (r !== target) raf = requestAnimationFrame(grow);
        }

        function place(e) {
            var b = el.getBoundingClientRect();
            el.style.setProperty('--lx', (e.clientX - b.left).toFixed(1) + 'px');
            el.style.setProperty('--ly', (e.clientY - b.top).toFixed(1) + 'px');
        }

        card.addEventListener('pointerenter', function (e) {
            place(e);
            el.classList.add('is-lamping');
            target = radius();
            if (!raf) raf = requestAnimationFrame(grow);
        });
        card.addEventListener('pointermove', function (e) {
            if (pending) return;
            pending = requestAnimationFrame(function () { pending = null; place(e); });
        }, { passive: true });
        card.addEventListener('pointerleave', function () {
            el.classList.remove('is-lamping');
            target = 0;
            if (!raf) raf = requestAnimationFrame(grow);
        });
    });
})();
