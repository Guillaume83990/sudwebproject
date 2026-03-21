/**
 * index.js — Sud Web Project — Ultra Premium
 * ══════════════════════════════════════════════════
 * Inspiré de nobl.io & accordion.net.au
 *
 * 01 · Preloader compteur
 * 02 · Scramble text (titres)
 * 03 · Split reveal (clip-path)
 * 04 · Scroll reveal (data-scroll)
 * 05 · Image wipe reveal (portfolio)
 * 06 · Compteurs animés (métriques)
 * 07 · Cursor magnétique premium
 * 08 · Magnetic buttons
 * 09 · Parallax multi-couches
 * 10 · Glow radial cards
 * 11 · Nav + menu mobile animé
 * 12 · Particules canvas
 * 13 · Morph button dd.nyc
 * 14 · Back to top
 * ══════════════════════════════════════════════════
 * Zéro dépendance · passive:true · will-change propre
 * prefers-reduced-motion respecté partout
 */
(function () {
    'use strict';

    /* ── UTILS ─────────────────────────────────────── */
    var raf = requestAnimationFrame.bind(window);
    var $ = function (s, c) { return (c || document).querySelector(s); };
    var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
    var onScr = function (fn) { window.addEventListener('scroll', fn, { passive: true }); };
    var PRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isMob = window.innerWidth < 768;
    var isFine = window.matchMedia('(pointer:fine)').matches;

    /* Chars pour scramble */
    var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    function rnd(max) { return Math.random() * max | 0; }
    function rndChar() { return CHARS[rnd(CHARS.length)]; }

    /* ══════════════════════════════════════════════
       01 · PRELOADER
       Barre de progression + compteur % + fade out
    ══════════════════════════════════════════════ */
    var loader = $('#preloader');
    var loaderBar = loader && loader.querySelector('.preloader-bar');
    var loaderN = loader && loader.querySelector('.preloader-count');

    function startApp() {
        /* Déclencher hero animations après preloader */
        heroReveal();
        setTimeout(animCounters, 1400);
    }

    if (loader && !PRM) {
        document.body.style.overflow = 'hidden';
        var pct = 0;

        function tick() {
            /* Vitesse variable : rapide au début, lente vers la fin */
            var step = pct < 60 ? rnd(6) + 3
                : pct < 90 ? rnd(3) + 1
                    : 1;
            pct = Math.min(pct + step, 100);
            if (loaderN) loaderN.textContent = pct + '%';
            if (loaderBar) loaderBar.style.width = pct + '%';

            if (pct < 100) {
                setTimeout(tick, pct < 60 ? 30 : pct < 90 ? 60 : 120);
            } else {
                /* Fade out + slide up */
                loader.style.transition = 'opacity .6s ease, transform .6s ease';
                loader.style.opacity = '0';
                loader.style.transform = 'translateY(-100%)';
                document.body.style.overflow = '';
                setTimeout(function () {
                    loader.style.display = 'none';
                    startApp();
                }, 650);
            }
        }
        tick();
    } else {
        window.addEventListener('DOMContentLoaded', startApp);
        if (PRM) {
            $$('.split-reveal').forEach(function (el) { el.classList.add('revealed'); });
            $$('[data-scroll]').forEach(function (el) { el.classList.add('is-visible'); });
        }
    }

    /* ══════════════════════════════════════════════
       02 · SCRAMBLE TEXT — nobl.io signature
       Brouille les caractères aléatoirement
       puis révèle le vrai texte lettre par lettre
    ══════════════════════════════════════════════ */
    function scramble(el, finalText, opts) {
        opts = opts || {};
        var delay = opts.delay || 0;
        var duration = opts.duration || 700;
        if (PRM) { el.textContent = finalText; return; }

        var total = Math.ceil(duration / 35);
        var frame = 0;
        var unlocked = 0;
        var timer;

        function step() {
            var out = '';
            for (var i = 0; i < finalText.length; i++) {
                if (finalText[i] === ' ' || finalText[i] === '\n') { out += finalText[i]; continue; }
                out += i < unlocked ? finalText[i] : rndChar();
            }
            el.textContent = out;
            frame++;
            /* Déverrouiller une lettre tous les N frames */
            var unlockEvery = Math.max(1, Math.floor(total / finalText.replace(/\s/g, '').length));
            if (frame % unlockEvery === 0) unlocked++;
            if (unlocked >= finalText.length) {
                el.textContent = finalText;
                clearInterval(timer);
            }
        }

        setTimeout(function () {
            timer = setInterval(step, 35);
        }, delay);
    }

    /* Exposer scramble pour i18n.js */
    window._swpScramble = function (el, text, duration) {
        scramble(el, text, { delay: 0, duration: duration || 400 });
    };

    /* ══════════════════════════════════════════════
       03 · HERO REVEAL
       Animations de la section hero au load
    ══════════════════════════════════════════════ */
    function heroReveal() {
        if (PRM) {
            $$('.hero-content .split-reveal').forEach(function (el) { el.classList.add('revealed'); });
            return;
        }

        /* Titres H1 */
        $$('.hero-title .split-reveal').forEach(function (el, i) {
            var text = el.textContent.trim();
            setTimeout(function () {
                el.classList.add('revealed');
                scramble(el, text, { delay: 0, duration: 600 });
            }, 300 + i * 220);
        });

        /* Séquence eyebrow → sub → actions → metrics */
        var heroSeq = ['.hero-eyebrow', '.hero-sub', '.hero-actions', '.hero-metrics', '.hero-scroll-hint'];
        heroSeq.forEach(function (sel, i) {
            var el = $(sel);
            if (!el) return;
            el.style.cssText += 'opacity:0;transform:translateY(18px);transition:opacity .65s ease,transform .65s ease';
            setTimeout(function () {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 600 + i * 130);
        });

        /* Visual hero */
        var vis = $('.hero-visual');
        if (vis) {
            vis.style.cssText += 'opacity:0;transform:translateX(30px);transition:opacity .9s ease,transform .9s ease';
            setTimeout(function () {
                vis.style.opacity = '1';
                vis.style.transform = 'translateX(0)';
            }, 450);
        }
    }

    /* ══════════════════════════════════════════════
       04 · SPLIT REVEAL au scroll (H2 sections)
    ══════════════════════════════════════════════ */
    if (!PRM) {
        var splitObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var spans = $$('.split-reveal', entry.target);
                if (entry.target.classList.contains('split-reveal')) spans = [entry.target];
                spans.forEach(function (sp, i) {
                    /* Révélation fluide clip-path uniquement — pas de scramble sur H2 */
                    setTimeout(function () {
                        sp.classList.add('revealed');
                    }, i * 150 + 60);
                });
                splitObs.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        var seen = new Set();
        $$('.split-reveal').forEach(function (el) {
            var parent = el.closest('.section-head, .about-text, .contact-left, .about-title, .faq-grid');
            var target = parent || el;
            if (!seen.has(target)) { seen.add(target); splitObs.observe(target); }
        });
    }

    /* ══════════════════════════════════════════════
       05 · SCROLL REVEAL (data-scroll)
    ══════════════════════════════════════════════ */
    var scrollObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry, i) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            setTimeout(function () { el.classList.add('is-visible'); }, i * 75);
            scrollObs.unobserve(el);
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    $$('[data-scroll]').forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            /* Déjà dans le viewport au chargement — révéler immédiatement */
            el.classList.add('is-visible');
        } else {
            scrollObs.observe(el);
        }
    });

    /* Sécurité : après 2s, révéler tout ce qui n'est toujours pas visible */
    setTimeout(function () {
        $$('[data-scroll]:not(.is-visible)').forEach(function (el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight + 200) {
                el.classList.add('is-visible');
            }
        });
    }, 2000);

    /* Section labels */
    if (!PRM) {
        var lblObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                e.target.style.opacity = '1';
                e.target.style.transform = 'none';
                lblObs.unobserve(e.target);
            });
        }, { threshold: 0.3 });

        $$('.section-label, .section-label-sm').forEach(function (el) {
            el.style.cssText += 'opacity:0;transform:translateX(-10px);transition:opacity .5s ease,transform .5s ease';
            lblObs.observe(el);
        });
    }

    /* ══════════════════════════════════════════════
       06 · IMAGE WIPE REVEAL — accordion.net.au
       Les images portfolio se dévoilent avec un
       masque qui glisse de gauche à droite
    ══════════════════════════════════════════════ */
    if (!PRM) {
        var imgObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry, i) {
                if (!entry.isIntersecting) return;
                var wrap = entry.target;
                setTimeout(function () {
                    wrap.classList.add('img-revealed');
                }, i * 100);
                imgObs.unobserve(wrap);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -20px 0px' });

        $$('.pf-img').forEach(function (el) {
            /* img-wipe désactivé — images visibles immédiatement */
            /* el.classList.add('img-wipe'); */
            imgObs.observe(el);
        });
    }

    /* ══════════════════════════════════════════════
       07 · COMPTEURS ANIMÉS — hero metrics
       24h / 100% / 10+ comptent depuis 0
    ══════════════════════════════════════════════ */
    function animCounters() {
        if (PRM) return;
        $$('.metric-n').forEach(function (el) {
            var raw = el.textContent.trim();
            var num = parseInt(raw);
            var suf = raw.replace(/[0-9]/g, '');
            if (isNaN(num)) return;
            var start = null;
            var dur = 1400;
            function step(ts) {
                if (!start) start = ts;
                var p = Math.min((ts - start) / dur, 1);
                /* ease out expo */
                var ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
                el.textContent = Math.floor(ease * num) + suf;
                if (p < 1) raf(step);
                else el.textContent = num + suf;
            }
            raf(step);
        });
    }

    /* ══════════════════════════════════════════════
       08 · CURSOR MAGNÉTIQUE PREMIUM
       Dot instantané · Ring lagué · States
    ══════════════════════════════════════════════ */
    var cursor = $('#cursor');
    var cursorDot = cursor && cursor.querySelector('.cursor-dot');
    var cursorRing = cursor && cursor.querySelector('.cursor-ring');

    if (cursor && isFine && !PRM) {
        var mx = 0, my = 0, rx = 0, ry = 0;

        document.addEventListener('mousemove', function (e) {
            mx = e.clientX; my = e.clientY;
            if (cursorDot) {
                cursorDot.style.left = mx + 'px';
                cursorDot.style.top = my + 'px';
            }
        });

        /* Ring : lag smooth */
        (function loop() {
            rx += (mx - rx) * 0.13;
            ry += (my - ry) * 0.13;
            if (cursorRing) {
                cursorRing.style.left = rx + 'px';
                cursorRing.style.top = ry + 'px';
            }
            raf(loop);
        })();

        /* Hover sur éléments interactifs */
        document.addEventListener('mouseover', function (e) {
            if (!e.target.closest) return;
            if (e.target.closest('a, button, .pf-card, .why-card, .testi-card, .zone-card')) {
                if (cursorRing) {
                    cursorRing.style.width = '58px';
                    cursorRing.style.height = '58px';
                    cursorRing.style.borderColor = 'rgba(96,165,250,.85)';
                    cursorRing.style.background = 'rgba(59,130,246,.07)';
                    cursorRing.style.mixBlendMode = 'normal';
                }
            }
        });
        document.addEventListener('mouseout', function (e) {
            if (!e.target.closest) return;
            if (e.target.closest('a, button, .pf-card, .why-card, .testi-card, .zone-card')) {
                if (cursorRing) {
                    cursorRing.style.width = '36px';
                    cursorRing.style.height = '36px';
                    cursorRing.style.borderColor = 'rgba(96,165,250,.5)';
                    cursorRing.style.background = 'transparent';
                }
            }
        });

        /* Click feedback */
        document.addEventListener('mousedown', function () {
            if (cursorDot) { cursorDot.style.transform = 'translate(-50%,-50%) scale(2.5)'; cursorDot.style.opacity = '.4'; }
        });
        document.addEventListener('mouseup', function () {
            if (cursorDot) { cursorDot.style.transform = 'translate(-50%,-50%) scale(1)'; cursorDot.style.opacity = '1'; }
        });

        document.addEventListener('mouseleave', function () { if (cursor) cursor.style.opacity = '0'; });
        document.addEventListener('mouseenter', function () { if (cursor) cursor.style.opacity = '1'; });
    } else if (cursor) {
        cursor.style.display = 'none';
    }

    /* ══════════════════════════════════════════════
       09 · MAGNETIC BUTTONS
       Les gros CTA attirent le curseur vers le centre
    ══════════════════════════════════════════════ */
    if (isFine && !PRM && !isMob) {
        $$('.btn-hero, .nav-cta, .morph-btn').forEach(function (btn) {
            btn.addEventListener('mousemove', function (e) {
                var r = btn.getBoundingClientRect();
                var dx = (e.clientX - (r.left + r.width / 2)) * 0.32;
                var dy = (e.clientY - (r.top + r.height / 2)) * 0.32;
                btn.style.transition = 'transform .15s ease';
                btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
            });
            btn.addEventListener('mouseleave', function () {
                btn.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
                btn.style.transform = 'none';
            });
        });
    }

    /* ══════════════════════════════════════════════
       10 · PARALLAX MULTI-COUCHES
    ══════════════════════════════════════════════ */
    if (!PRM) {
        var heroImg = $('.hero-img-wrap picture img') || $('.hero-img-wrap img');
        var paraTick = false;

        if (heroImg) {
            heroImg.style.willChange = 'transform';
            onScr(function () {
                if (!paraTick) {
                    raf(function () {
                        var y = window.pageYOffset;
                        if (y < window.innerHeight * 1.5) {
                            heroImg.style.transform = 'translateY(' + (y * 0.14) + 'px)';
                        }
                        paraTick = false;
                    });
                    paraTick = true;
                }
            });
        }

        /* Depth parallax sur les cartes portfolio — mobile désactivé */
        if (!isMob) {
            var pfCards = $$('.pf-card');
            var pfTick = false;
            pfCards.forEach(function (c) { c.style.willChange = 'transform'; });

            onScr(function () {
                if (!pfTick) {
                    raf(function () {
                        pfCards.forEach(function (card, i) {
                            var rect = card.getBoundingClientRect();
                            var center = rect.top + rect.height / 2 - window.innerHeight / 2;
                            /* Les cartes du milieu bougent plus */
                            var depth = (i % 3 === 1) ? 0.045 : 0.022;
                            card.style.transform = 'translateY(' + (center * depth) + 'px)';
                        });
                        pfTick = false;
                    });
                    pfTick = true;
                }
            });
        }
    }

    /* ══════════════════════════════════════════════
       11 · GLOW RADIAL SUR LES CARTES
    ══════════════════════════════════════════════ */
    $$('.why-card, .price-card, .testi-card, .maint-plan').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            var r = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
    });

    /* ══════════════════════════════════════════════
       12 · NAV + MENU MOBILE ANIMÉ
    ══════════════════════════════════════════════ */
    var nav = $('#main-nav');
    var navToggle = $('#nav-toggle');
    var navMenu = $('#nav-menu');
    var navOverlay = $('#nav-overlay');

    function openMenu() {
        navMenu.classList.add('active');
        navToggle.classList.add('active');
        navOverlay.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        /* Liens qui entrent en cascade */
        $$('li', navMenu).forEach(function (li, i) {
            li.style.opacity = '0';
            li.style.transform = 'translateX(16px)';
            li.style.transition = 'opacity .3s ease,transform .3s ease';
            setTimeout(function () { li.style.opacity = '1'; li.style.transform = 'none'; }, i * 55 + 80);
        });
    }
    function closeMenu() {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        navOverlay.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.contains('active') ? closeMenu() : openMenu();
        });
        if (navOverlay) navOverlay.addEventListener('click', closeMenu);
        $$('a', navMenu).forEach(function (a) { a.addEventListener('click', closeMenu); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    }

    var navTick = false;
    onScr(function () {
        if (!navTick) {
            raf(function () {
                if (nav) nav.classList.toggle('scrolled', window.pageYOffset > 80);
                navTick = false;
            });
            navTick = true;
        }
    });

    /* ══════════════════════════════════════════════
       13 · PARTICULES CANVAS — optimisées mobile
    ══════════════════════════════════════════════ */
    var canvas = $('#particles-bg');
    if (canvas && !PRM) {
        var ctx = canvas.getContext('2d');
        var CW, CH;

        function resizePt() { CW = canvas.width = window.innerWidth; CH = canvas.height = window.innerHeight; }
        resizePt();
        window.addEventListener('resize', resizePt, { passive: true });

        var COUNT = isMob ? 16 : 42;

        function Pt() { this.init(); }
        Pt.prototype.init = function () {
            this.x = Math.random() * CW;
            this.y = Math.random() * CH;
            this.r = Math.random() * 1.5 + 0.3;
            this.vx = (Math.random() - 0.5) * 0.28;
            this.vy = (Math.random() - 0.5) * 0.28;
            this.o = Math.random() * 0.3 + 0.06;
        };
        Pt.prototype.update = function () {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > CW) this.vx *= -1;
            if (this.y < 0 || this.y > CH) this.vy *= -1;
        };
        Pt.prototype.draw = function () {
            ctx.fillStyle = 'rgba(96,165,250,' + this.o + ')';
            ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill();
        };

        var pts = [];
        for (var k = 0; k < COUNT; k++) pts.push(new Pt());

        function drawLines() {
            for (var a = 0; a < pts.length - 1; a++) {
                for (var b = a + 1; b < pts.length; b++) {
                    var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y;
                    var d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 105) {
                        ctx.strokeStyle = 'rgba(59,130,246,' + ((105 - d) / 105 * 0.08) + ')';
                        ctx.lineWidth = 0.5;
                        ctx.beginPath(); ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y); ctx.stroke();
                    }
                }
            }
        }

        function animPt() {
            ctx.clearRect(0, 0, CW, CH);
            pts.forEach(function (p) { p.update(); p.draw(); });
            if (!isMob) drawLines();
            raf(animPt);
        }
        animPt();
    }

    /* ══════════════════════════════════════════════
       14 · MORPH BUTTON — dd.nyc style
    ══════════════════════════════════════════════ */
    var morphBtn = $('#morph-btn');
    var morphTick = false;

    if (morphBtn) {
        onScr(function () {
            if (!morphTick) {
                raf(function () {
                    morphBtn.classList.toggle('visible', window.pageYOffset > 700);
                    morphTick = false;
                });
                morphTick = true;
            }
        });

        var mIdx = 0;
        var morphTextEl = morphBtn.querySelector('.morph-text');
        var morphTimer = null;

        /* Textes selon la langue active au moment du hover */
        function getMorphTexts() {
            if (window.SWPi18n && window.SWPi18n.getLang() === 'en') {
                return ['New project', "Let's talk!", 'Free quote', 'Get in touch!'];
            }
            return ['Nouveau projet', 'Discutons !', 'Devis gratuit', 'Parlons-en !'];
        }

        morphBtn.addEventListener('mouseenter', function () {
            var texts = getMorphTexts();
            morphTimer = setInterval(function () {
                mIdx = (mIdx + 1) % texts.length;
                if (morphTextEl) morphTextEl.textContent = texts[mIdx];
            }, 340);
        });
        morphBtn.addEventListener('mouseleave', function () {
            clearInterval(morphTimer);
            mIdx = 0;
            if (morphTextEl) morphTextEl.textContent = getMorphTexts()[0];
        });

        /* Exposer pour que i18n.js mette à jour le texte au changement de langue */
        window._swpUpdateMorph = function () {
            clearInterval(morphTimer);
            mIdx = 0;
            if (morphTextEl) morphTextEl.textContent = getMorphTexts()[0];
        };
    }

    /* ══════════════════════════════════════════════
       15 · BACK TO TOP
    ══════════════════════════════════════════════ */
    var btt = $('#back-to-top');
    var bttTick = false;

    if (btt) {
        onScr(function () {
            if (!bttTick) {
                raf(function () { btt.classList.toggle('visible', window.pageYOffset > 500); bttTick = false; });
                bttTick = true;
            }
        });
        btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    /* ══════════════════════════════════════════════
       16 · FOOTER ANNÉE
    ══════════════════════════════════════════════ */
    var yr = $('#current-year');
    if (yr) yr.textContent = new Date().getFullYear();

    /* ══════════════════════════════════════════════
       CONSOLE
    ══════════════════════════════════════════════ */
    console.log('%c🌴 Sud Web Project — Saint-Tropez', 'color:#60A5FA;font-size:16px;font-weight:bold;');
    console.log('%c⚡ Performance · SEO · Sur-mesure', 'color:#3B82F6;font-size:12px;');
    console.log('%c📧 contact@sudwebproject.com', 'color:#10B981;font-size:12px;');

})();