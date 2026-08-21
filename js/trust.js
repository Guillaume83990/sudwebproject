/* ═══════════════════════════════════════════════════════════════
   TRUST.JS — Sud Web Project
   Questions fréquentes et paroles clients.

   FAQ · l'accordéon devient exclusif : une seule question ouverte
   à la fois. Ce n'est pas une contrainte, c'est ce qui donne le
   calme — six réponses dépliées, c'est un mur de texte.
   La hauteur est animée, ce que <details> ne sait pas faire seul.

   PAROLES · celle qui passe au centre de l'écran s'éclaire, les
   autres s'estompent. On n'en lit qu'une à la fois.

   Sans GSAP, l'accordéon reste fonctionnel en natif.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasGsap = typeof window.gsap !== 'undefined';
    var hasST = typeof window.ScrollTrigger !== 'undefined';

    if (hasGsap && hasST) gsap.registerPlugin(ScrollTrigger);

    var M = (window.SWP && window.SWP.motion) || {
        ease: 'power3.out', easeMask: 'power2.inOut', d2: .9
    };

    /* ═════════════════════════════════════════════════════════
       1 · LA FAQ
       ═══════════════════════════════════════════════════════ */
    var list = document.querySelector('.qa-list');

    if (list) {
        var items = Array.prototype.slice.call(list.querySelectorAll('.faq-item'));

        if (hasGsap && !PRM) {
            items.forEach(function (item) {
                var sum = item.querySelector('summary');
                var ans = item.querySelector('p');
                if (!sum || !ans) return;

                gsap.set(ans, { height: 0, opacity: 0 });
                item.open = false;

                function openItem() {
                    item.open = true;
                    gsap.killTweensOf(ans);
                    gsap.fromTo(ans,
                        { height: 0, opacity: 0 },
                        { height: 'auto', opacity: 1, duration: .7, ease: M.easeMask }
                    );
                }

                function closeItem() {
                    gsap.killTweensOf(ans);
                    gsap.to(ans, {
                        height: 0, opacity: 0, duration: .45, ease: 'power2.inOut',
                        onComplete: function () { item.open = false; }
                    });
                }

                sum.addEventListener('click', function (e) {
                    e.preventDefault();

                    if (item.open) {
                        closeItem();
                        return;
                    }

                    /* Exclusif : on referme ce qui était ouvert */
                    items.forEach(function (other) {
                        if (other === item || !other.open) return;
                        var oa = other.querySelector('p');
                        gsap.killTweensOf(oa);
                        gsap.to(oa, {
                            height: 0, opacity: 0, duration: .4, ease: 'power2.inOut',
                            onComplete: function () { other.open = false; }
                        });
                    });

                    openItem();

                    /* Les hauteurs changent : les déclencheurs en aval
                       viseraient à côté sans ce recalage */
                    setTimeout(function () {
                        if (hasST) ScrollTrigger.refresh();
                    }, 780);
                });
            });
        }

        /* Révélation des lignes */
        if (hasGsap && hasST && !PRM) {
            gsap.fromTo(items,
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0,
                    duration: .8, ease: M.ease, stagger: .06,
                    scrollTrigger: { trigger: list, start: 'top 86%', once: true }
                }
            );

            var aside = document.querySelector('.qa-aside');
            if (aside) {
                gsap.fromTo(aside.children,
                    { opacity: 0, y: 24 },
                    {
                        opacity: 1, y: 0,
                        duration: M.d2, ease: M.ease, stagger: .09,
                        scrollTrigger: { trigger: aside, start: 'top 84%', once: true }
                    }
                );
            }
        }
    }

    /* ═════════════════════════════════════════════════════════
       2 · LES PAROLES
       ═══════════════════════════════════════════════════════ */
    var voices = Array.prototype.slice.call(document.querySelectorAll('.testi-card'));

    if (voices.length) {

        /* Repli : sans observateur, tout est lisible */
        if (!('IntersectionObserver' in window) || PRM) {
            voices.forEach(function (v) { v.classList.add('is-focus'); });
        } else {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    e.target.classList.toggle('is-focus', e.isIntersecting);
                });
            }, { rootMargin: '-38% 0px -38% 0px', threshold: 0 });

            voices.forEach(function (v) { io.observe(v); });
        }

        if (hasGsap && hasST && !PRM) {
            var meta = document.querySelector('.voice-meta');
            if (meta) {
                gsap.fromTo(meta.children,
                    { opacity: 0, y: 18 },
                    {
                        opacity: 1, y: 0,
                        duration: .8, ease: M.ease, stagger: .1,
                        scrollTrigger: { trigger: meta, start: 'top 88%', once: true }
                    }
                );
            }

            voices.forEach(function (v) {
                var quote = v.querySelector('p');
                var auth = v.querySelector('.testi-auth');

                gsap.fromTo([quote, auth].filter(Boolean),
                    { y: 26 },
                    {
                        y: 0,
                        duration: 1.1, ease: M.ease, stagger: .1,
                        scrollTrigger: { trigger: v, start: 'top 88%', once: true }
                    }
                );
            });
        }
    }
})();