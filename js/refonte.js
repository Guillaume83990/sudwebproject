/* ═══════════════════════════════════════════════════════════════
   REFONTE.JS — Sud Web Project — v2
   La démonstration en quatre temps, sur environ quatre secondes :

     1 · le score « avant » monte péniblement, par à-coups
     2 · un trait le raye
     3 · le score « après » claque
     4 · le filet du bas retraverse la page d'un seul coup

   Tout tient dans un principe : c'est le CONTRASTE DE VITESSE qui
   convainc, pas les nombres. Le visiteur ressent la lenteur avant
   de lire le chiffre qui la décrit.

   Sans GSAP, tout s'affiche à l'état final : rien n'est perdu.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var block = document.querySelector('.refonte-block');
    var score = document.querySelector('.refonte-score');
    if (!block || !score) return;

    var beforeNum = score.querySelector('.rf-before-num');
    var afterNum = score.querySelector('.rf-after');
    var slow = block.querySelector('.rf-line-run--slow');
    var fast = block.querySelector('.rf-line-run--fast');

    var BEFORE = 34;
    var AFTER = 97;

    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setFinal() {
        if (beforeNum) beforeNum.textContent = BEFORE;
        if (afterNum) afterNum.textContent = AFTER;
        score.classList.add('is-struck');
        block.classList.add('is-fast');
        if (slow) slow.style.width = '100%';
        if (fast) fast.style.width = '100%';
    }

    if (PRM || typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
        setFinal();
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var M = (window.SWP && window.SWP.motion) || { ease: 'power3.out', easeMask: 'power2.inOut' };

    function reset() {
        if (beforeNum) beforeNum.textContent = '0';
        if (afterNum) afterNum.textContent = '0';
        score.classList.remove('is-struck');
        block.classList.remove('is-fast');
        if (slow) gsap.set(slow, { width: '0%' });
        if (fast) gsap.set(fast, { width: '0%' });
    }

    var tl = gsap.timeline({ paused: true });

    /* ── 1 · Le compte laborieux ─────────────────────────────
       steps() donne les à-coups : le chiffre n'avance pas de
       façon continue, il bute. C'est ce détail qui fait ressentir
       la lenteur plutôt que de l'annoncer. */
    var b = { v: 0 };
    tl.to(b, {
        v: BEFORE,
        duration: 2.4,
        ease: 'steps(9)',
        onUpdate: function () {
            if (beforeNum) beforeNum.textContent = Math.round(b.v);
        }
    }, 0);

    if (slow) {
        tl.to(slow, { width: '100%', duration: 2.4, ease: 'steps(9)' }, 0);
    }

    /* ── 2 · La rature ─────────────────────────────────────── */
    tl.call(function () { score.classList.add('is-struck'); }, null, 2.5);

    /* ── 3 · Le chiffre qui claque ─────────────────────────── */
    var a = { v: 0 };
    tl.to(a, {
        v: AFTER,
        duration: 0.85,
        ease: 'power4.out',
        onUpdate: function () {
            if (afterNum) afterNum.textContent = Math.round(a.v);
        }
    }, 2.95);

    /* ── 4 · Le filet retraverse d'un trait ────────────────── */
    if (fast) {
        tl.fromTo(fast, { width: '0%' },
            { width: '100%', duration: 0.5, ease: 'power3.out' }, 2.95);
    }

    tl.call(function () { block.classList.add('is-fast'); }, null, 3.1);

    /* ── Entrée du bloc, puis lancement ────────────────────── */
    gsap.fromTo(score,
        { opacity: 0, y: 30 },
        {
            opacity: 1, y: 0, duration: 1, ease: M.ease,
            scrollTrigger: { trigger: score, start: 'top 85%', once: true }
        }
    );

    ScrollTrigger.create({
        trigger: block,
        start: 'top 70%',
        onEnter: function () { reset(); tl.restart(); },
        onEnterBack: function () { reset(); tl.restart(); }
    });

    reset();
})();