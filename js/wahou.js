/* ═══════════════════════════════════════════════════════════════
   WAHOU.JS — Sud Web Project — accueil uniquement
   Voir css/wahou.css pour l'idée d'ensemble.

     1 · l'entrée : les panneaux arrivent des profondeurs
     2 · la main : la scène s'incline avec le pointeur
     3 · la vidéo : la visite Portolan joue dans son panneau et
         dans sa carte du portfolio (chargée au premier geste)
     4 · la lampe : la couleur apparaît autour du pointeur
     5 · la plongée : on entre dans Portolan (ordinateur seulement)

   Dépendances : gsap, ScrollTrigger (sinon : tout reste statique).
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var hero = document.querySelector('.hero');
    var deck = hero && hero.querySelector('.stage-deck');
    if (!hero || !deck) return;

    var root = document.documentElement;
    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var SMALL = window.matchMedia('(max-width: 768px)').matches;
    var conn = navigator.connection || {};
    var SAVE = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
    var G = window.gsap;

    var panels = {
        swp: deck.querySelector('.mk-swp'),
        browser: deck.querySelector('.mk-browser'),
        wire: deck.querySelector('.mk-wire'),
        code: deck.querySelector('.mk-code')
    };
    var list = [panels.swp, panels.browser, panels.wire, panels.code].filter(Boolean);

    if (PRM) return;

    /* ═════════════════════════════════════════════════════════
       1 · L'ENTRÉE
       Les panneaux sortent de la profondeur l'un après l'autre,
       du plus lointain au plus proche, une fois l'intro finie.
       ═══════════════════════════════════════════════════════ */
    if (G) {
        /* Portolan porte l'image principale de la page (LCP) : il reste
           visible dès le premier affichage et vient seulement de plus loin.
           Sur téléphone, la scène est à plat : pas d'entrée, rien à calculer. */
        if (!SMALL) list.forEach(function (el) {
            var lcp = el === panels.browser;
            G.set(el, { '--ez': lcp ? '-260px' : '-520px', '--eo': lcp ? 1 : 0 });
        });
    }

    var entered = false;
    function entrance() {
        if (!G || entered || SMALL) return;
        entered = true;
        G.to(list, {
            '--ez': '0px', '--eo': 1,
            duration: 1.9,
            ease: 'expo.out',
            stagger: .14,
            delay: .15
        });
    }

    if (root.classList.contains('swp-preloading')) {
        var mo = new MutationObserver(function () {
            if (!root.classList.contains('swp-preloading')) { mo.disconnect(); entrance(); }
        });
        mo.observe(root, { attributes: true, attributeFilter: ['class'] });
        /* Filet : l'intro ne dure jamais plus de 9 s */
        setTimeout(function () { mo.disconnect(); entrance(); }, 9500);
    } else {
        entrance();
    }

    /* ═════════════════════════════════════════════════════════
       2 · LA MAIN
       La scène s'incline doucement vers le pointeur. Les panneaux
       étant à des profondeurs différentes, l'inclinaison suffit à
       créer la parallaxe. Sans souris : une lente respiration.
       ═══════════════════════════════════════════════════════ */
    var tilt = { x: 0, y: 0, tx: 0, ty: 0 };
    var dive = 0;           /* 0 → 1 pendant la plongée */
    var heroVisible = true;
    var rafTilt = null;
    var t0 = performance.now();

    if (FINE) {
        window.addEventListener('pointermove', function (e) {
            if (!heroVisible) return;
            tilt.tx = (e.clientX / window.innerWidth - .5);
            tilt.ty = (e.clientY / window.innerHeight - .5);
        }, { passive: true });
    }

    function tiltLoop(now) {
        rafTilt = requestAnimationFrame(tiltLoop);
        var k = 1 - dive;
        var tx = tilt.tx, ty = tilt.ty;
        if (!FINE) {
            var s = (now - t0) / 1000;
            tx = Math.sin(s * .35) * .35;
            ty = Math.cos(s * .27) * .25;
        }
        tilt.x += (tx - tilt.x) * .06;
        tilt.y += (ty - tilt.y) * .06;
        var ry = tilt.x * 9 * k;
        var rx = -tilt.y * 6 * k;
        deck.style.transform = 'rotateX(' + rx.toFixed(3) + 'deg) rotateY(' + ry.toFixed(3) + 'deg)';
    }

    if (!SMALL && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            heroVisible = entries[0].isIntersecting;
            if (heroVisible && !rafTilt) rafTilt = requestAnimationFrame(tiltLoop);
            if (!heroVisible && rafTilt) { cancelAnimationFrame(rafTilt); rafTilt = null; }
        }).observe(hero);
    }

    /* ═════════════════════════════════════════════════════════
       3 · LA VIDÉO DE LA VISITE
       La capture reste l'image principale (rien ne change pour le
       premier affichage). La vidéo se charge au premier geste,
       joue quand elle est visible et se met en pause sinon.
       ═══════════════════════════════════════════════════════ */
    var VIDEO = SMALL ? 'assets/video/portolan-visite-640.mp4' : 'assets/video/portolan-visite-832.mp4';
    var videos = [];

    function makeVideo(host, cls) {
        if (!host) return null;
        var v = document.createElement('video');
        v.className = cls;
        v.muted = true;
        v.defaultMuted = true;
        v.loop = true;
        v.playsInline = true;
        v.setAttribute('muted', '');
        v.setAttribute('playsinline', '');
        v.setAttribute('aria-hidden', 'true');
        v.setAttribute('tabindex', '-1');
        v.preload = 'none';
        v.addEventListener('playing', function () { v.classList.add('is-playing'); });
        var img = host.querySelector('img');
        if (img && img.nextSibling) host.insertBefore(v, img.nextSibling); else host.appendChild(v);
        videos.push(v);
        return v;
    }

    var shot = panels.browser && panels.browser.querySelector('.mk-shot');
    var pfFirst = document.querySelector('.pf-work--wide:not(.pf-reg) .pf-frame');

    if (!SAVE) {
        var started = false;
        var gestures = ['pointermove', 'scroll', 'touchstart', 'keydown', 'wheel'];
        function startVideos() {
            if (started) return;
            started = true;
            gestures.forEach(function (e) { window.removeEventListener(e, startVideos); });
            /* Les vidéos n'entrent dans la page qu'ici : le premier affichage
               (et l'image principale mesurée par Google) n'est jamais touché */
            makeVideo(shot, 'mk-video');
            makeVideo(pfFirst, 'pf-video');
            videos.forEach(function (v) {
                v.src = VIDEO;
                v.preload = 'auto';
                watch(v);
            });
        }
        window.addEventListener('load', function () {
            gestures.forEach(function (e) { window.addEventListener(e, startVideos, { once: true, passive: true }); });
            /* Sans geste au bout de 4 s, on charge quand même, au calme */
            setTimeout(function () {
                (window.requestIdleCallback || function (cb) { setTimeout(cb, 1); })(startVideos);
            }, 4000);
        });

        function watch(v) {
            if (!('IntersectionObserver' in window)) { v.play().catch(function () { }); return; }
            new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () { }); }
                    else v.pause();
                });
            }, { rootMargin: '120px 0px' }).observe(v.parentNode);
        }

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) videos.forEach(function (v) { v.pause(); });
        });
    }

    /* ═════════════════════════════════════════════════════════
       4 · LA LAMPE
       ═══════════════════════════════════════════════════════ */
    if (FINE && G) {
        root.classList.add('swp-lamp');

        var targets = Array.prototype.slice.call(document.querySelectorAll('.pf-frame, .hero .mk-shot'));
        targets.forEach(function (el) {
            var halo = document.createElement('span');
            halo.className = 'swp-halo';
            halo.setAttribute('aria-hidden', 'true');
            el.appendChild(halo);

            var rect = null;
            var pending = null;

            function radius() {
                var w = el.offsetWidth;
                return Math.round(Math.max(170, Math.min(340, w * .3)));
            }

            function place(e) {
                if (!rect) rect = el.getBoundingClientRect();
                /* Les panneaux du hero sont inclinés : on reste sur une
                   approximation plane, suffisante pour une lumière douce */
                var sx = el.offsetWidth / (rect.width || 1);
                var sy = el.offsetHeight / (rect.height || 1);
                el.style.setProperty('--lx', ((e.clientX - rect.left) * sx).toFixed(1) + 'px');
                el.style.setProperty('--ly', ((e.clientY - rect.top) * sy).toFixed(1) + 'px');
            }

            el.parentNode.addEventListener('pointerenter', function (e) {
                rect = el.getBoundingClientRect();
                place(e);
                el.classList.add('is-lamping');
                G.to(el, { '--lr': radius() + 'px', duration: .9, ease: 'expo.out', overwrite: 'auto' });
            });

            el.parentNode.addEventListener('pointermove', function (e) {
                if (pending) return;
                pending = requestAnimationFrame(function () {
                    pending = null;
                    rect = el.getBoundingClientRect();
                    place(e);
                });
            }, { passive: true });

            el.parentNode.addEventListener('pointerleave', function () {
                el.classList.remove('is-lamping');
                G.to(el, { '--lr': '0px', duration: .6, ease: 'power2.out', overwrite: 'auto' });
            });
        });
    }

    /* ═════════════════════════════════════════════════════════
       5 · LA PLONGÉE
       Le hero se fige le temps d'un demi-écran. Le texte s'efface,
       les panneaux secondaires s'écartent, et Portolan vient se
       placer au centre, de face, en grand, puis révèle ses
       couleurs. Ordinateur seulement : sur téléphone, un
       épinglage contrarie le geste naturel du pouce.
       ═══════════════════════════════════════════════════════ */
    if (!G || typeof window.ScrollTrigger === 'undefined' || !panels.browser) return;
    G.registerPlugin(ScrollTrigger);

    var mm = G.matchMedia();
    mm.add('(min-width: 1100px) and (min-height: 620px) and (hover: hover) and (pointer: fine)', function () {
        root.classList.add('swp-dive');

        var stage = hero.querySelector('.hero-stage');
        var content = hero.querySelector('.hero-content');
        var side = hero.querySelector('.hero-side-text');
        var glow = hero.querySelector('.stage-glow');
        var b = panels.browser;

        var note = document.createElement('div');
        note.className = 'dive-note';
        note.setAttribute('aria-hidden', 'true');
        note.innerHTML = '<b>N° 01</b><i></i>Portolan · courtier en yachts · projet de démonstration';
        hero.appendChild(note);

        /* Valeurs de départ posées à la main, hors contexte GSAP : un
           rafraîchissement de ScrollTrigger ne peut pas les annuler */
        function base() {
            list.forEach(function (el) {
                el.style.setProperty('--px', '0px'); el.style.setProperty('--py', '0px');
                el.style.setProperty('--pz', '0px'); el.style.setProperty('--po', '1');
                el.style.setProperty('--ps', '1');
            });
            b.style.setProperty('--tint', '1');
        }
        base();

        /* Où est le centre de Portolan, sans tenir compte des
           transformations ? offsetLeft/offsetTop les ignorent. */
        function geo() {
            var vw = window.innerWidth, vh = window.innerHeight;
            var cx = stage.offsetLeft + b.offsetLeft + b.offsetWidth / 2;
            var cy = stage.offsetTop - stage.offsetHeight / 2 + b.offsetTop + b.offsetHeight / 2;
            var s = Math.min(vw * .74 / b.offsetWidth, vh * .7 / b.offsetHeight);
            return { dx: vw / 2 - cx, dy: vh / 2 - cy - vh * .02, s: s };
        }

        /* Une seule progression 0 → 1, répartie à la main entre les
           éléments. Plus lisible qu'une timeline, et aucune valeur
           ne peut être « rembobinée » par un rafraîchissement. */
        var ease2 = G.parseEase('power2.inOut');
        var ease1 = G.parseEase('power1.inOut');
        var g = geo();
        function seg(p, a, z) { return Math.max(0, Math.min(1, (p - a) / (z - a))); }
        function set(el, k, v) { if (el) el.style.setProperty(k, v); }
        var cap = b.querySelector('.mk-cap');

        function render(p) {
            dive = Math.min(1, p * 1.6);
            var c = seg(p, 0, .35);
            if (content) { content.style.opacity = (1 - c).toFixed(3); content.style.transform = c ? 'translate3d(0,' + (-70 * c).toFixed(1) + 'px,0)' : ''; }
            if (side) side.style.opacity = (1 - seg(p, 0, .25)).toFixed(3);
            if (cap) cap.style.opacity = (1 - seg(p, 0, .2)).toFixed(3);

            var k = seg(p, 0, .45);
            set(panels.code, '--pz', (640 * k) + 'px'); set(panels.code, '--px', (180 * k) + 'px'); set(panels.code, '--po', 1 - k);
            k = seg(p, .02, .47);
            set(panels.wire, '--pz', (420 * k) + 'px'); set(panels.wire, '--px', (-260 * k) + 'px'); set(panels.wire, '--py', (120 * k) + 'px'); set(panels.wire, '--po', 1 - k);
            k = seg(p, .04, .54);
            set(panels.swp, '--pz', (-420 * k) + 'px'); set(panels.swp, '--px', (-220 * k) + 'px'); set(panels.swp, '--po', 1 - k);

            if (glow) { k = seg(p, 0, .7); glow.style.transform = k ? 'scale(' + (1 + .9 * k).toFixed(3) + ')' : ''; glow.style.opacity = (1 - .45 * k).toFixed(3); }

            k = ease2(seg(p, .06, .76));
            set(b, '--px', (g.dx * k).toFixed(1) + 'px');
            set(b, '--py', (g.dy * k).toFixed(1) + 'px');
            set(b, '--ps', (1 + (g.s - 1) * k).toFixed(4));
            /* Le panneau se redresse : ses deux angles reviennent à zéro */
            b.style.transform = k ? 'rotateY(' + (-26 * (1 - k)).toFixed(2) + 'deg) rotateX(' + (7 * (1 - k)).toFixed(2) + 'deg)' : '';
            set(b, '--tint', (1 - ease1(seg(p, .62, .9))).toFixed(3));
            note.style.opacity = seg(p, .72, .9).toFixed(3);
        }

        /* L'épinglage passe par position: sticky dans .hero-pin : le pin
           de ScrollTrigger déplacerait le hero dans le DOM, et Chrome
           cesserait alors de compter son image comme image principale. */
        var pin = hero.parentNode.classList.contains('hero-pin') ? hero.parentNode : null;
        if (!pin) return;
        function sizePin() { pin.style.height = Math.round(hero.offsetHeight + window.innerHeight * .85) + 'px'; }
        sizePin();

        var st = ScrollTrigger.create({
            trigger: pin,
            start: 'top top',
            end: 'bottom bottom',
            onRefreshInit: sizePin,
            onRefresh: function (self) { g = geo(); render(self.progress); }
        });

        /* Un léger amorti, à la manière d'un scrub */
        var cur = 0;
        G.ticker.add(tick);
        function tick() {
            var target = st.progress;
            if (Math.abs(target - cur) < .0005) { if (cur !== target) { cur = target; render(cur); } return; }
            cur += (target - cur) * .14;
            render(cur);
        }
        render(0);

        return function () {
            G.ticker.remove(tick);
            st.kill();
            pin.style.height = '';
            root.classList.remove('swp-dive');
            note.remove();
            dive = 0;
            [content, side, glow, cap].forEach(function (el) { if (el) { el.style.opacity = ''; el.style.transform = ''; } });
            b.style.transform = '';
            base();
        };
    });
})();
