/* ═══════════════════════════════════════════════════════════════
   CONTACT.JS — Sud Web Project
   La section contact.

   Une règle absolue ici : ce fichier n'écoute jamais le formulaire
   et ne touche jamais à son envoi. C'est emailjs-contact.js qui
   s'en charge — un script d'animation qui intercepte un submit,
   c'est un formulaire cassé un jour ou l'autre.

   On anime l'arrivée, rien d'autre.

   Sans GSAP, tout reste visible et fonctionnel.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var contact = document.querySelector('.contact');
    if (!contact) return;

    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (PRM) return;
    if (typeof window.gsap === 'undefined') return;
    if (typeof window.ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    var M = (window.SWP && window.SWP.motion) || {
        ease: 'power3.out', easeMask: 'power2.inOut', d2: .9
    };

    /* ─────────────────────────────────────────────────────────
       1 · LA COLONNE DE GAUCHE
       Le libellé, le titre, l'invitation — puis la fiche.
       ───────────────────────────────────────────────────────── */
    var left = contact.querySelector('.contact-left');

    if (left) {
        var label = left.querySelector('.section-label');
        var lead = left.querySelector('p');

        gsap.fromTo([label, lead].filter(Boolean),
            { opacity: 0, y: 24 },
            {
                opacity: 1, y: 0,
                duration: M.d2, ease: M.ease, stagger: .12,
                scrollTrigger: { trigger: left, start: 'top 84%', once: true }
            }
        );

        /* Le filet supérieur se trace avant les lignes :
           la règle d'abord, comme partout ailleurs sur le site. */
        var sheet = left.querySelector('.cmethods');
        if (sheet) {
            gsap.fromTo(sheet,
                { scaleX: 0, transformOrigin: 'left center' },
                {
                    scaleX: 1, duration: 1, ease: M.easeMask,
                    scrollTrigger: { trigger: sheet, start: 'top 90%', once: true }
                }
            );

            gsap.fromTo(sheet.querySelectorAll('.cmethod'),
                { opacity: 0, y: 16 },
                {
                    opacity: 1, y: 0,
                    duration: .8, ease: M.ease, stagger: .08, delay: .2,
                    scrollTrigger: { trigger: sheet, start: 'top 90%', once: true }
                }
            );
        }
    }

    /* ─────────────────────────────────────────────────────────
       2 · LA LETTRE
       Les champs se posent un à un, du haut vers le bas — l'ordre
       dans lequel on les remplira.
       ───────────────────────────────────────────────────────── */
    var form = contact.querySelector('.cform');

    if (form) {
        var head = form.querySelector('h3');
        if (head) {
            gsap.fromTo(head,
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0, duration: M.d2, ease: M.ease,
                    scrollTrigger: { trigger: form, start: 'top 86%', once: true }
                }
            );
        }

        var fields = form.querySelectorAll('.fg');
        if (fields.length) {
            gsap.fromTo(fields,
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0,
                    duration: .8, ease: M.ease, stagger: .07, delay: .15,
                    scrollTrigger: { trigger: form, start: 'top 86%', once: true }
                }
            );
        }

        var btn = form.querySelector('.submit-btn');
        var note = form.querySelector('.form-note');

        gsap.fromTo([btn, note].filter(Boolean),
            { opacity: 0, y: 18 },
            {
                opacity: 1, y: 0,
                duration: .8, ease: M.ease, stagger: .1,
                scrollTrigger: { trigger: btn || form, start: 'top 94%', once: true }
            }
        );
    }
})();