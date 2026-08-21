/* ═══════════════════════════════════════════════════════════════
   PRICING.JS — Sud Web Project
   L'échelle de gamme.

   Quatre mouvements, un seul propos : faire SENTIR la montée.

     1 · la jauge de gauche se remplit au rythme exact du scroll
     2 · chaque strate entre : nom, puis prestations, puis prix
     3 · les prix s'incrémentent — et le palier le plus haut compte
         plus longtemps que le premier
     4 · la strate au centre de l'écran s'éclaire

   Sans GSAP, tout s'affiche à l'état final.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var scale = document.querySelector('.tier-scale');
    if (!scale) return;

    var tiers = Array.prototype.slice.call(scale.querySelectorAll('.tier'));
    if (!tiers.length) return;

    var fill = scale.querySelector('.tier-gauge-fill');
    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    var M = (window.SWP && window.SWP.motion) || {
        ease: 'power3.out', easeMask: 'power2.inOut', d2: .9, d3: 1.4
    };

    /* ─────────────────────────────────────────────────────────
       1 · LE PALIER ACTIF
       Au survol sur desktop, au défilement au doigt.
       ───────────────────────────────────────────────────────── */
    var current = -1;

    function activate(i) {
        if (i === current) return;
        current = i;
        tiers.forEach(function (t, k) { t.classList.toggle('is-active', k === i); });
    }

    if (finePointer) {
        tiers.forEach(function (t, i) {
            t.addEventListener('pointerenter', function () { activate(i); });
        });
        scale.addEventListener('pointerleave', function () {
            tiers.forEach(function (t) { t.classList.remove('is-active'); });
            current = -1;
        });
    } else if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) activate(tiers.indexOf(e.target));
            });
        }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
        tiers.forEach(function (t) { io.observe(t); });
    }

    /* ─────────────────────────────────────────────────────────
       2 · REPLI SANS GSAP
       ───────────────────────────────────────────────────────── */
    function setFinal() {
        if (fill) fill.style.height = '100%';
        tiers.forEach(function (t) {
            var n = t.querySelector('.tier-num[data-value]');
            if (n) n.firstChild && (n.firstChild.textContent = n.getAttribute('data-display') || n.getAttribute('data-value'));
        });
    }

    if (PRM || typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
        setFinal();
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* ─────────────────────────────────────────────────────────
       3 · LA JAUGE
       Liée au scroll (scrub) : si le visiteur s'arrête, elle
       s'arrête. C'est lui qui gravit l'échelle, pas une animation
       qui se joue devant lui.
       ───────────────────────────────────────────────────────── */
    if (fill) {
        gsap.fromTo(fill,
            { height: '0%' },
            {
                height: '100%',
                ease: 'none',
                scrollTrigger: {
                    trigger: scale,
                    start: 'top 70%',
                    end: 'bottom 75%',
                    scrub: 0.7
                }
            }
        );
    }

    /* ─────────────────────────────────────────────────────────
       4 · LES STRATES
       ───────────────────────────────────────────────────────── */
    tiers.forEach(function (tier, i) {
        var idx = tier.querySelector('.tier-idx');
        var name = tier.querySelector('.tier-name');
        var forWho = tier.querySelector('.tier-for');
        var carry = tier.querySelector('.tier-carry');
        var feats = tier.querySelectorAll('.tier-feats li');
        var price = tier.querySelector('.tier-price');

        var head = [idx, name, forWho, carry].filter(Boolean);

        gsap.fromTo(head,
            { opacity: 0, y: 26 },
            {
                opacity: 1, y: 0,
                duration: M.d2, ease: M.ease, stagger: .07,
                scrollTrigger: { trigger: tier, start: 'top 86%', once: true }
            }
        );

        if (feats.length) {
            gsap.fromTo(feats,
                { opacity: 0, y: 14 },
                {
                    opacity: 1, y: 0,
                    duration: .7, ease: M.ease, stagger: .045, delay: .18,
                    scrollTrigger: { trigger: tier, start: 'top 86%', once: true }
                }
            );
        }

        /* Le prix arrive en dernier : on découvre l'offre, puis le
           montant. L'ordre inverse serait une étiquette de magasin. */
        if (price) {
            gsap.fromTo(price,
                { opacity: 0, y: 22 },
                {
                    opacity: 1, y: 0,
                    duration: M.d2, ease: M.ease, delay: .26,
                    scrollTrigger: { trigger: tier, start: 'top 86%', once: true }
                }
            );
        }

        /* ── Le compte du montant ──
           Plus le palier est haut, plus le chiffre met de temps à
           s'établir : la durée elle-même dit la valeur. */
        var num = tier.querySelector('.tier-num[data-value]');
        if (num) {
            var target = parseInt(num.getAttribute('data-value'), 10);
            if (!isNaN(target)) {
                var slot = num.querySelector('.tier-amount') || num;
                var obj = { v: 0 };
                var dur = 1.1 + i * 0.45;

                slot.textContent = '0';

                ScrollTrigger.create({
                    trigger: tier,
                    start: 'top 82%',
                    once: true,
                    onEnter: function () {
                        gsap.to(obj, {
                            v: target,
                            duration: dur,
                            ease: 'power3.out',
                            delay: .3,
                            onUpdate: function () {
                                slot.textContent = Math.round(obj.v).toLocaleString('fr-FR');
                            },
                            onComplete: function () {
                                slot.textContent = target.toLocaleString('fr-FR');
                            }
                        });
                    }
                });
            }
        }
    });
})();