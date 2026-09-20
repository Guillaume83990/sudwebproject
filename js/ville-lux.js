/* ═══════════════════════════════════════════════════════════════
   VILLE-LUX.JS — Sud Web Project — v2
   Les animations des pages ville, dans la grammaire de l'accueil.

   Une règle partout : la RÈGLE arrive avant le CONTENU. Le filet
   se trace, puis les lignes montent derrière. C'est ce qui donne
   l'impression d'une mise en page qui se construit plutôt que
   d'éléments qui apparaissent.

   CORRECTIF v2 — LE SCROLL QUI DÉCROCHE
   Trois points.

   a · LE CLIP-PATH QUI RESTE POSÉ
   Les photos pleine largeur s'ouvrent par un masque clip-path,
   et leur image dérive ensuite en scrub. Or le clip-path restait
   appliqué au conteneur après l'ouverture. Tant qu'un clip-path
   est posé sur un parent, le navigateur ne peut plus composer le
   transform de l'enfant sur le GPU : il repeint l'image entière
   à chaque frame. Sur un visuel de 1400 px agrandi de 10 %, c'est
   le seul endroit de la page capable de faire tomber des frames —
   et la sensation de scroll qui se fige puis rattrape.
   On retire donc le clip-path dès que le masque a fini de
   s'ouvrir. L'état final est un masque plein : visuellement,
   strictement identique.

   b · LA PARALLAXE NON PROMUE
   L'image dérivait sans couche dédiée. On la promeut pendant la
   traversée et on la libère en sortie, pour ne pas immobiliser de
   mémoire graphique sur toute la page.

   c · LE RECALAGE DE LA FAQ
   Ouvrir une réponse change la hauteur du document, donc un
   recalage était déclenché 780 ms plus tard — parfois en plein
   scroll. On passe par le recalage groupé de motion.js, qui
   attend que le défilement soit au repos.

   ville-animations.js v2 ne traite plus les blocs pris en charge
   ici : il n'y a plus de tween concurrent à annuler.

   Sans GSAP, tout reste visible et cliquable.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasGsap = typeof window.gsap !== 'undefined';
    var hasST = typeof window.ScrollTrigger !== 'undefined';

    var $$ = function (s, c) {
        return Array.prototype.slice.call((c || document).querySelectorAll(s));
    };

    /* Recalage groupé fourni par motion.js : il patiente tant que
       le scroll bouge. Repli simple si motion.js est absent. */
    var refresh = (window.SWP && window.SWP.refresh) || function () {
        if (hasST) ScrollTrigger.refresh();
    };

    /* ═════════════════════════════════════════════════════════
       1 · L'ACCORDÉON EXCLUSIF
       Il fonctionne même sans GSAP — c'est de l'ergonomie, pas de
       la décoration. Six réponses ouvertes font un mur de texte.
       ═══════════════════════════════════════════════════════ */
    var faqItems = $$('.ville-faq-item');

    if (faqItems.length && hasGsap && !PRM) {
        faqItems.forEach(function (item) {
            var sum = item.querySelector('summary');
            var ans = item.querySelector('p');
            if (!sum || !ans) return;

            gsap.set(ans, { height: 0, opacity: 0 });
            item.open = false;

            sum.addEventListener('click', function (e) {
                e.preventDefault();

                if (item.open) {
                    gsap.killTweensOf(ans);
                    gsap.to(ans, {
                        height: 0, opacity: 0, duration: .45, ease: 'power2.inOut',
                        onComplete: function () { item.open = false; refresh(); }
                    });
                    return;
                }

                faqItems.forEach(function (other) {
                    if (other === item || !other.open) return;
                    var oa = other.querySelector('p');
                    gsap.killTweensOf(oa);
                    gsap.to(oa, {
                        height: 0, opacity: 0, duration: .4, ease: 'power2.inOut',
                        onComplete: function () { other.open = false; }
                    });
                });

                item.open = true;
                gsap.killTweensOf(ans);
                gsap.fromTo(ans,
                    { height: 0, opacity: 0 },
                    {
                        height: 'auto', opacity: 1, duration: .7, ease: 'power2.inOut',
                        onComplete: function () { refresh(); }
                    }
                );
            });
        });
    }

    if (PRM || !hasGsap || !hasST) return;

    gsap.registerPlugin(ScrollTrigger);

    var M = (window.SWP && window.SWP.motion) || {
        ease: 'power3.out', easeMask: 'power2.inOut', d2: .9, d3: 1.4
    };

    var isMobile = window.matchMedia('(max-width: 768px)').matches;
    var isCoarse = window.matchMedia('(pointer: coarse)').matches;

    /* ─────────────────────────────────────────────────────────
       Outil : le filet se trace, puis les lignes montent
       ───────────────────────────────────────────────────────── */
    function ruleThenRows(container, rows, opts) {
        opts = opts || {};
        if (!container) return;

        /* Le tracé passe par une classe : le filet est un
           pseudo-élément, donc aucun transform n'est posé sur le
           conteneur — un transform sur un ancêtre fausserait le
           calcul de position de tout ce qu'il contient. */
        ScrollTrigger.create({
            trigger: container,
            start: opts.start || 'top 88%',
            once: true,
            onEnter: function () { container.classList.add('is-ruled'); }
        });

        if (!rows || !rows.length) return;

        gsap.fromTo(rows,
            { opacity: 0, y: opts.y || 22 },
            {
                opacity: 1, y: 0,
                duration: opts.duration || .85,
                ease: M.ease,
                stagger: opts.stagger || .08,
                delay: .2,
                scrollTrigger: { trigger: container, start: opts.start || 'top 88%', once: true }
            }
        );
    }

    /* ═════════════════════════════════════════════════════════
       2 · LES PHOTOS PLEINE LARGEUR
       Masque à l'entrée, puis dérive interne. L'agrandissement
       reste faible : au-delà on voit le cadrage bouger.

       Le masque se retire de lui-même une fois ouvert : c'est ce
       qui rend la dérive composable sur le GPU. Voir l'en-tête.
       ═══════════════════════════════════════════════════════ */
    $$('.st-photo-hero, .st-photo-item, .ville-intro-img-wrap, .st-real-img').forEach(function (wrap) {
        var img = wrap.querySelector('img');

        gsap.fromTo(wrap,
            { clipPath: 'inset(0% 0% 100% 0%)' },
            {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: M.d3, ease: M.easeMask,
                scrollTrigger: { trigger: wrap, start: 'top 88%', once: true },
                onComplete: function () {
                    /* l'ouverture est finie : on rend le conteneur
                       transparent au compositeur */
                    gsap.set(wrap, { clearProps: 'clipPath' });
                }
            }
        );

        /* Pas de dérive sur écran tactile ni en dessous de 768 px :
           le gain visuel n'y compense pas le coût. */
        if (img && !isMobile && !isCoarse) {
            gsap.fromTo(img,
                { yPercent: -5, scale: 1.1 },
                {
                    yPercent: 5, scale: 1.1, ease: 'none',
                    force3D: true,
                    scrollTrigger: {
                        trigger: wrap,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1.2,
                        invalidateOnRefresh: true,
                        onToggle: function (self) {
                            gsap.set(img, { willChange: self.isActive ? 'transform' : 'auto' });
                        }
                    }
                }
            );
        }
    });

    /* ═════════════════════════════════════════════════════════
       3 · L'INTRO ET LES CHIFFRES
       ═══════════════════════════════════════════════════════ */
    var intro = document.querySelector('.ville-intro-text');
    if (intro) {
        /* li ajouté : les listes numérotées des blocs métier
           doivent suivre le même rythme que les paragraphes. */
        var introBits = $$('.section-label, p, li, .ville-punchline, .btn-primary', intro);
        gsap.fromTo(introBits,
            { opacity: 0, y: 24 },
            {
                opacity: 1, y: 0,
                duration: M.d2, ease: M.ease, stagger: .07,
                scrollTrigger: { trigger: intro, start: 'top 84%', once: true }
            }
        );
    }

    var chiffres = document.querySelector('.ville-chiffres-grid');
    ruleThenRows(chiffres, $$('.ville-chiffre-card'), { y: 18, stagger: .09 });

    /* Les chiffres ne défilent plus.
       Un compteur qui s'incrémente est un tic de page de vente : il
       appelle l'attention sur l'animation au lieu de la porter sur
       le fait. Chaque ligne se révèle par un masque — le chiffre
       monte derrière son propre filet, puis le libellé suit.
       Et le contenu reste toujours exact, même si le script ne
       se charge pas. */
    $$('.ville-chiffre-card').forEach(function (card, i) {
        var num = card.querySelector('.chiffre-num');
        var lbl = card.querySelector('.chiffre-label');

        if (num) {
            gsap.fromTo(num,
                { yPercent: 105, opacity: 0 },
                {
                    yPercent: 0, opacity: 1,
                    duration: 1.15, ease: M.easeMask, delay: .12 + i * 0.09,
                    scrollTrigger: { trigger: card, start: 'top 92%', once: true }
                }
            );
        }

        if (lbl) {
            gsap.fromTo(lbl,
                { opacity: 0, x: -12 },
                {
                    opacity: 1, x: 0,
                    duration: .9, ease: M.ease, delay: .32 + i * 0.09,
                    scrollTrigger: { trigger: card, start: 'top 92%', once: true }
                }
            );
        }
    });

    /* ═════════════════════════════════════════════════════════
       4 · LES MÉTIERS
       ═══════════════════════════════════════════════════════ */
    $$('.st-metier-row').forEach(function (row) {
        gsap.fromTo(row,
            { opacity: 0, y: 26 },
            {
                opacity: 1, y: 0, duration: .9, ease: M.ease,
                scrollTrigger: { trigger: row, start: 'top 88%', once: true }
            }
        );
    });

    /* ═════════════════════════════════════════════════════════
       5 · LA PROSE SEO
       Les titres arrivent avec leur filet, les paragraphes suivent.
       ═══════════════════════════════════════════════════════ */
    $$('.seo-prose h2').forEach(function (h) {
        gsap.fromTo(h,
            { opacity: 0, y: 22 },
            {
                opacity: 1, y: 0, duration: M.d2, ease: M.ease,
                scrollTrigger: { trigger: h, start: 'top 90%', once: true }
            }
        );
    });

    $$('.seo-prose p').forEach(function (p) {
        gsap.fromTo(p,
            { opacity: 0, y: 16 },
            {
                opacity: 1, y: 0, duration: .8, ease: M.ease,
                scrollTrigger: { trigger: p, start: 'top 94%', once: true }
            }
        );
    });

    /* ═════════════════════════════════════════════════════════
       6 · LES RÉALISATIONS
       ═══════════════════════════════════════════════════════ */
    $$('.st-real-card').forEach(function (card) {
        var body = card.querySelector('.st-real-body');
        if (!body) return;
        gsap.fromTo(body.children,
            { opacity: 0, y: 18 },
            {
                opacity: 1, y: 0,
                duration: .8, ease: M.ease, stagger: .06, delay: .22,
                scrollTrigger: { trigger: card, start: 'top 86%', once: true }
            }
        );
    });

    /* ═════════════════════════════════════════════════════════
       7 · POURQUOI ME CHOISIR
       ═══════════════════════════════════════════════════════ */
    var pq = document.querySelector('.ville-pourquoi-grid');
    ruleThenRows(pq, $$('.ville-pourquoi-card'), { y: 20, stagger: .07 });

    /* ═════════════════════════════════════════════════════════
       8 · LE PROCESS
       La ligne de liaison se trace, puis les étapes se posent.
       ═══════════════════════════════════════════════════════ */
    var proc = document.querySelector('.process-steps-grid');
    if (proc) {
        ScrollTrigger.create({
            trigger: proc, start: 'top 86%', once: true,
            onEnter: function () { proc.classList.add('is-drawn', 'is-ruled'); }
        });

        var steps = $$('.process-item');
        gsap.fromTo(steps,
            { opacity: 0, y: 22 },
            {
                opacity: 1, y: 0,
                duration: .85, ease: M.ease, stagger: .11, delay: .35,
                scrollTrigger: { trigger: proc, start: 'top 86%', once: true }
            }
        );
    }

    /* ═════════════════════════════════════════════════════════
       9 · LES TARIFS
       Le prix arrive APRÈS les prestations : on découvre l'offre,
       puis le montant. L'ordre inverse serait une étiquette.
       ═══════════════════════════════════════════════════════ */
    var pg = document.querySelector('.ville-tarifs .price-grid');
    if (pg) {
        ScrollTrigger.create({
            trigger: pg, start: 'top 88%', once: true,
            onEnter: function () { pg.classList.add('is-ruled'); }
        });

        $$('.ville-tarifs .price-card').forEach(function (card) {
            var feats = card.querySelectorAll('.price-feats li');
            var head = card.querySelector('.price-head');
            var cta = card.querySelector('a');

            gsap.fromTo(card,
                { opacity: 0, y: 24 },
                {
                    opacity: 1, y: 0, duration: .85, ease: M.ease, delay: .2,
                    scrollTrigger: { trigger: card, start: 'top 88%', once: true }
                }
            );

            if (feats.length) {
                gsap.fromTo(feats,
                    { opacity: 0, y: 12 },
                    {
                        opacity: 1, y: 0, duration: .65, ease: M.ease,
                        stagger: .04, delay: .38,
                        scrollTrigger: { trigger: card, start: 'top 88%', once: true }
                    }
                );
            }

            if (head) {
                gsap.fromTo(head,
                    { opacity: 0, y: 18 },
                    {
                        opacity: 1, y: 0, duration: .85, ease: M.ease, delay: .55,
                        scrollTrigger: { trigger: card, start: 'top 88%', once: true }
                    }
                );
            }

            if (cta) {
                gsap.fromTo(cta,
                    { opacity: 0 },
                    {
                        opacity: 1, duration: .7, ease: 'none', delay: .7,
                        scrollTrigger: { trigger: card, start: 'top 88%', once: true }
                    }
                );
            }
        });
    }

    /* ═════════════════════════════════════════════════════════
       10 · LE MAILLAGE VILLES
       ═══════════════════════════════════════════════════════ */
    var vg = document.querySelector('.ville-villes-grid');
    ruleThenRows(vg, $$('.ville-ville-card'), { y: 20, stagger: .06 });

    /* ═════════════════════════════════════════════════════════
       11 · LA FAQ
       ═══════════════════════════════════════════════════════ */
    var fl = document.querySelector('.ville-faq-list');
    ruleThenRows(fl, faqItems, { y: 18, stagger: .06 });

    /* ═════════════════════════════════════════════════════════
       12 · LE CTA FINAL
       ═══════════════════════════════════════════════════════ */
    var cta = document.querySelector('.ville-cta');
    if (cta) {
        var bits = $$('.section-head, .ville-cta-sub, .ville-cta-actions, .ville-seo-text', cta);
        gsap.fromTo(bits,
            { opacity: 0, y: 24 },
            {
                opacity: 1, y: 0,
                duration: M.d2, ease: M.ease, stagger: .1,
                scrollTrigger: { trigger: cta, start: 'top 82%', once: true }
            }
        );
    }
})();