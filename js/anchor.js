/* ═══════════════════════════════════════════════════════════════
   ANCHOR.JS — Sud Web Project
   L'arrivée sur une ancre depuis une autre page.

   Le navigateur saute à l'ancre avant que les polices, les images
   et Lenis soient prêts : il vise donc une position qui n'existe
   déjà plus une seconde plus tard, et le visiteur se retrouve
   n'importe où. On reprend la main, et on recale à mesure que les
   hauteurs se stabilisent.

   À CHARGER EN TOUT DERNIER, après titles.js.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    var target;
    try {
        target = document.querySelector(hash);
    } catch (e) {
        return;
    }
    if (!target) return;

    /* La nav ne doit pas recouvrir la section visée */
    var OFFSET = -90;

    function go() {
        if (window.SWP && window.SWP.scrollTo) {
            window.SWP.scrollTo(target, OFFSET);
            return;
        }
        var y = target.getBoundingClientRect().top + window.pageYOffset + OFFSET;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }

    /* Trois recalages : les hauteurs bougent trois fois — au
       chargement, à l'arrivée des polices, puis à celle des images. */
    window.addEventListener('load', function () {
        setTimeout(go, 120);
        setTimeout(go, 700);
    });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { setTimeout(go, 250); });
    }
})();