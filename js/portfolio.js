/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO.JS — Sud Web Project
   La galerie.

   Quatre gestes, tous au service de la même idée : on ne regarde
   pas des cartes, on parcourt une salle.

     1 · la cimaise se trace du haut vers le bas
     2 · chaque œuvre bascule contre le mur, comme un cadre qu'on
         redresse — et son trait d'accroche se tend
     3 · les grandes pièces défilent PLUS LENTEMENT que les petites :
         c'est la parallaxe différentielle qui crée la profondeur
         d'un mur, pas les ombres
     4 · le curseur devient « Voir » sur une œuvre

   Sans GSAP, tout reste visible et cliquable.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var gallery = document.querySelector('.pf-gallery');
    if (!gallery) return;

    var works = Array.prototype.slice.call(gallery.querySelectorAll('.pf-work'));
    if (!works.length) return;

    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var isMobile = window.matchMedia('(max-width: 768px)').matches;

    var M = (window.SWP && window.SWP.motion) || {
        ease: 'power3.out', easeMask: 'power2.inOut', d2: .9, d3: 1.4
    };

    /* ═════════════════════════════════════════════════════════
       1 · LE COMPTEUR
       ═══════════════════════════════════════════════════════ */
    var counter = gallery.querySelector('.pf-count b');
    var total = works.length;

    function setCount(i) {
        if (counter) counter.textContent = ('0' + (i + 1)).slice(-2);
    }

    if ('IntersectionObserver' in window && counter) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) setCount(works.indexOf(e.target));
            });
        }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
        works.forEach(function (w) { io.observe(w); });
    }

    /* ═════════════════════════════════════════════════════════
       2 · LE CURSEUR « VOIR »
       Il ne se pose jamais sur un lien : il suit le pointeur et
       les liens restent cliquables (pointer-events: none).
       ═══════════════════════════════════════════════════════ */
    if (finePointer && !PRM) {
        var cur = document.createElement('div');
        cur.id = 'pf-cursor';
        cur.setAttribute('aria-hidden', 'true');
        cur.textContent = 'Voir';
        document.body.appendChild(cur);

        var p = { x: 0, y: 0, tx: 0, ty: 0 };
        var running = false, raf = null;

        function loop() {
            raf = requestAnimationFrame(loop);
            p.x += (p.tx - p.x) * 0.18;
            p.y += (p.ty - p.y) * 0.18;
            cur.style.transform =
                'translate3d(' + p.x + 'px,' + p.y + 'px,0) translate(-50%,-50%)';
        }

        works.forEach(function (work) {
            var frame = work.querySelector('.pf-frame');
            if (!frame) return;
            var soon = work.classList.contains('pf-work--soon');

            frame.addEventListener('pointerenter', function (e) {
                p.tx = p.x = e.clientX;
                p.ty = p.y = e.clientY;
                cur.textContent = soon ? 'Bientôt' : 'Voir';
                cur.classList.add('is-on');
                document.body.classList.add('pf-hovering');
                if (!running) { running = true; loop(); }
            });

            frame.addEventListener('pointermove', function (e) {
                p.tx = e.clientX;
                p.ty = e.clientY;
            }, { passive: true });

            frame.addEventListener('pointerleave', function () {
                cur.classList.remove('is-on');
                document.body.classList.remove('pf-hovering');
                setTimeout(function () {
                    if (!cur.classList.contains('is-on') && raf) {
                        cancelAnimationFrame(raf);
                        raf = null;
                        running = false;
                    }
                }, 400);
            });
        });
    }

    /* ═════════════════════════════════════════════════════════
       3 · LES ANIMATIONS
       ═══════════════════════════════════════════════════════ */
    if (PRM) {
        works.forEach(function (w) { w.classList.add('is-hung'); });
        return;
    }
    if (typeof window.gsap === 'undefined') {
        works.forEach(function (w) { w.classList.add('is-hung'); });
        return;
    }
    if (typeof window.ScrollTrigger === 'undefined') {
        works.forEach(function (w) { w.classList.add('is-hung'); });
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* ── La cimaise se trace ── */
    var rail = gallery.querySelector('.pf-rail');
    if (rail) {
        gsap.to(rail, {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: gallery,
                start: 'top 75%',
                end: 'bottom 80%',
                scrub: 0.8
            }
        });
    }

    works.forEach(function (work) {
        var frame = work.querySelector('.pf-frame');
        var label = work.querySelector('.pf-label');
        var img = frame && frame.querySelector('img');
        var wide = work.classList.contains('pf-work--wide');
        var small = work.classList.contains('pf-work--small');

        /* ── L'accrochage : le cadre bascule contre le mur ──
           Une rotation de 8° qui revient au plan. C'est le geste
           physique de redresser un cadre, pas un fondu. */
        if (frame) {
            gsap.set(work, { perspective: 1400 });
            gsap.fromTo(frame,
                { rotationX: 8, y: 42, opacity: 0, transformOrigin: 'center top' },
                {
                    rotationX: 0, y: 0, opacity: 1,
                    duration: M.d3,
                    ease: M.easeMask,
                    scrollTrigger: { trigger: work, start: 'top 86%', once: true }
                }
            );
        }

        /* Le trait d'accroche se tend, une fois le cadre posé */
        ScrollTrigger.create({
            trigger: work,
            start: 'top 84%',
            once: true,
            onEnter: function () { work.classList.add('is-hung'); }
        });

        /* Le cartel arrive après l'œuvre : on regarde, puis on lit */
        if (label) {
            gsap.fromTo(label,
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0,
                    duration: M.d2,
                    ease: M.ease,
                    delay: .22,
                    scrollTrigger: { trigger: work, start: 'top 84%', once: true }
                }
            );
        }

        /* ── La parallaxe différentielle ──
           Les grandes pièces bougent peu, les petites beaucoup.
           C'est ce décalage qui donne la profondeur du mur. */
        if (img && !isMobile) {
            /* Amplitude volontairement faible : l'agrandissement
               nécessaire au déplacement rogne l'image, et une capture
               d'écran ne supporte pas d'être rognée — on y voit le
               travail, pas un paysage. */
            var amp = wide ? 2.2 : (small ? 3.4 : 2.8);
            gsap.fromTo(img,
                { yPercent: -amp, scale: 1.05 },
                {
                    yPercent: amp, scale: 1.05, ease: 'none',
                    scrollTrigger: {
                        trigger: work,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1.1
                    }
                }
            );
        } else if (img) {
            gsap.set(img, { scale: 1 });
        }

        /* Léger flottement de l'œuvre entière — imperceptible,
           et c'est justement ce qui donne le relief */
        if (!isMobile && !wide) {
            gsap.fromTo(work,
                { y: 26 },
                {
                    y: -26, ease: 'none',
                    scrollTrigger: {
                        trigger: work,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1.5
                    }
                }
            );
        }
    });

    setCount(0);
})();