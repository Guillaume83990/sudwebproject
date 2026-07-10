/* ════════════════════════════════════════════════════════
   AGENCE IMMOBILIÈRE — Animations GSAP Luxe
   Requiert : GSAP 3.12.5 + ScrollTrigger
   ════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // Attendre que GSAP soit disponible
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* ── 1. BANDE PHOTOS — révélation séquentielle luxe ── */
    const photoItems = document.querySelectorAll('.immo-photo-item');
    if (photoItems.length) {
        gsap.to(photoItems, {
            opacity: 1,
            scaleY: 1,
            duration: 1.1,
            ease: 'power3.out',
            stagger: 0.12,
            scrollTrigger: {
                trigger: '.immo-photos-band',
                start: 'top 85%',
                once: true
            }
        });

        /* Zoom-in initial sur les images — retire le scale(1.08) au hover */
        document.querySelectorAll('.immo-photo-item img').forEach(img => {
            gsap.to(img, {
                scale: 1.04,
                duration: 1.4,
                ease: 'power2.out',
                delay: 0.2,
                scrollTrigger: {
                    trigger: img.closest('.immo-photo-item'),
                    start: 'top 85%',
                    once: true
                }
            });
        });
    }

    /* ── 2. PHOTO IMMERSIVE — parallax scroll ── */
    const parallaxImg = document.querySelector('.gsap-parallax-img img');
    if (parallaxImg) {
        gsap.to(parallaxImg, {
            y: '12%',
            ease: 'none',
            scrollTrigger: {
                trigger: '.immo-hero-photo',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2
            }
        });

        /* Texte overlay — apparition luxe */
        const photoText = document.querySelector('.immo-hero-photo-text');
        if (photoText) {
            gsap.fromTo(photoText,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: '.immo-hero-photo',
                        start: 'top 65%',
                        once: true
                    }
                }
            );
        }
    }

    /* ── 3. GSAP FADE-UP global (remplace ville-animations pour cette page) ── */
    document.querySelectorAll('.gsap-fade-up').forEach(el => {
        gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: .9,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                once: true
            }
        });
    });

    /* ── 4. CARDS LOCALES — entrée décalée avec ligne bleue ── */
    const localCards = document.querySelectorAll('.immo-local-card');
    if (localCards.length) {
        gsap.fromTo(localCards,
            { opacity: 0, y: 50, scale: 0.97 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.85,
                ease: 'power3.out',
                stagger: 0.15,
                scrollTrigger: {
                    trigger: '.immo-local-grid',
                    start: 'top 80%',
                    once: true
                }
            }
        );
    }

    /* ── 5. FONCTIONNALITÉS — cascade douce ── */
    const featCards = document.querySelectorAll('.immo-feat-card');
    if (featCards.length) {
        gsap.fromTo(featCards,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: 'power2.out',
                stagger: 0.1,
                scrollTrigger: {
                    trigger: '.immo-feats-grid',
                    start: 'top 82%',
                    once: true
                }
            }
        );
    }

    /* ── 6. TARIFS — entrée en éventail ── */
    const priceCards = document.querySelectorAll('.price-card');
    if (priceCards.length) {
        gsap.fromTo(priceCards,
            { opacity: 0, y: 40, rotateX: 4 },
            {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: 0.9,
                ease: 'power3.out',
                stagger: 0.18,
                scrollTrigger: {
                    trigger: '.price-grid',
                    start: 'top 82%',
                    once: true
                }
            }
        );
    }

    /* ── 7. HERO — split reveal titre ── */
    const heroTitle = document.querySelector('#h1-immo');
    if (heroTitle) {
        gsap.fromTo(heroTitle,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: 0.2 }
        );
    }

    const heroBadge = document.querySelector('.ville-hero-badge');
    if (heroBadge) {
        gsap.fromTo(heroBadge,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out', delay: 0.05 }
        );
    }

    const heroSub = document.querySelector('.ville-hero-sub');
    if (heroSub) {
        gsap.fromTo(heroSub,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.45 }
        );
    }

    const heroActions = document.querySelector('.ville-hero-actions');
    if (heroActions) {
        gsap.fromTo(heroActions,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.65 }
        );
    }

    const heroMetrics = document.querySelector('.ville-hero-metrics');
    if (heroMetrics) {
        gsap.fromTo(heroMetrics,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.85 }
        );
    }

    /* ── 8. VILLES GRID — apparition en losange ── */
    const villeCards = document.querySelectorAll('.immo-ville-card');
    if (villeCards.length) {
        gsap.fromTo(villeCards,
            { opacity: 0, scale: 0.95 },
            {
                opacity: 1,
                scale: 1,
                duration: 0.65,
                ease: 'back.out(1.2)',
                stagger: 0.08,
                scrollTrigger: {
                    trigger: '.immo-villes-grid',
                    start: 'top 84%',
                    once: true
                }
            }
        );
    }

    /* ── 9. FAQ items — ouverture glissante ── */
    document.querySelectorAll('.ville-faq-item').forEach(item => {
        item.addEventListener('toggle', () => {
            const p = item.querySelector('p');
            if (p && item.open) {
                gsap.fromTo(p,
                    { opacity: 0, y: -8 },
                    { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
                );
            }
        });
    });

    /* ── Reduced motion ── */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        ScrollTrigger.getAll().forEach(t => t.kill());
        gsap.globalTimeline.clear();
        document.querySelectorAll('.gsap-fade-up, .immo-photo-item, .immo-hero-photo-text').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }

});