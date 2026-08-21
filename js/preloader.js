/* ═══════════════════════════════════════════════════════════════
   SWP PRELOADER — Sud Web Project
   Construction du logo par tracé, rotation 360°, atterrissage header.
   Dépendances : Three.js r128 + GSAP 3 (chargés avant ce fichier)
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ─────────────────────────────────────────────────────────────
       RÉGLAGES — c'est ici et nulle part ailleurs
       ───────────────────────────────────────────────────────────── */
    var CONFIG = {
        ROTATION_DURATION: 4.8,        // durée d'UN tour complet, en secondes
        PLAY_ONCE_PER_SESSION: false,  // true = ne rejoue pas si déjà vu dans l'onglet
        ANCHOR_SELECTOR: '#swp-logo-anchor', // le logo du header, cible d'atterrissage
        HEADER_HEX_RATIO: 0.45,        // rayon de l'hexagone / hauteur du SVG header
        WATCHDOG_MS: 4000              // si Three/GSAP ne chargent pas : on révèle
    };

    // Palette — mesurée sur le logo du header
    var BRAND = {
        face: 0x3B82F6,   // faces de l'hexagone  (= fill du SVG)
        side: 0x1D4ED8,   // tranches             (= fin du dégradé du SVG)
        edge: 0x93C4FD,   // arêtes lumineuses
        glyph: 0xFFFFFF,  // le </>
        glyphSide: 0xDCE7F5,
        glow: 0x3B82F6,
        dust: 0x2563EB
    };

    var HEX_R = 1.25, HEX_DEPTH = 0.44, BEVEL = 0.07;

    /* Les 5 traits du </> — coordonnées locales */
    var GLYPH_SEGMENTS = [
        [[-0.66, 0.00], [-0.26, 0.34]],
        [[-0.66, 0.00], [-0.26, -0.34]],
        [[-0.13, -0.37], [0.13, 0.37]],
        [[0.66, 0.00], [0.26, 0.34]],
        [[0.66, 0.00], [0.26, -0.34]]
    ];

    /* ─────────────────────────────────────────────────────────────
       ÉLÉMENTS
       ───────────────────────────────────────────────────────────── */
    var root = document.documentElement;
    var preloader = document.getElementById('swp-preloader');
    var preBg = document.getElementById('swp-pre-bg');
    var preVignette = document.getElementById('swp-pre-vignette');
    var wordEl = document.getElementById('swp-pre-word');
    var captionEl = document.getElementById('swp-pre-caption');
    var anchor = document.querySelector(CONFIG.ANCHOR_SELECTOR);

    if (!preloader) return;

    /* ─────────────────────────────────────────────────────────────
       SORTIE IMMÉDIATE — cas où on ne joue pas la séquence
       ───────────────────────────────────────────────────────────── */
    function finish() {
        root.classList.remove('swp-preloading');
        preloader.style.display = 'none';
        if (anchor) anchor.style.opacity = '';
        if (window.__swpFailsafe) { clearTimeout(window.__swpFailsafe); window.__swpFailsafe = null; }
    }

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var alreadySeen = false;
    try {
        alreadySeen = CONFIG.PLAY_ONCE_PER_SESSION &&
            sessionStorage.getItem('swp_intro_seen') === '1';
    } catch (e) { /* sessionStorage indisponible : on joue */ }

    if (reduceMotion || alreadySeen || !window.THREE || !window.gsap) {
        finish();
        return;
    }
    try { sessionStorage.setItem('swp_intro_seen', '1'); } catch (e) { }

    // On prend la main : le failsafe du <head> est remplacé par le nôtre
    if (window.__swpFailsafe) clearTimeout(window.__swpFailsafe);
    window.__swpFailsafe = setTimeout(finish, CONFIG.WATCHDOG_MS + 12000);

    /* ─────────────────────────────────────────────────────────────
       LE MOT — SUD / WEB (bleu) / PROJECT
       ───────────────────────────────────────────────────────────── */
    var WORD = 'SUDWEBPROJECT';
    WORD.split('').forEach(function (ch, i) {
        var s = document.createElement('span');
        s.textContent = ch;
        if (i >= 3 && i < 6) s.className = 'accent';
        wordEl.appendChild(s);
    });
    var letters = wordEl.querySelectorAll('span');

    /* ─────────────────────────────────────────────────────────────
       SCÈNE
       ───────────────────────────────────────────────────────────── */
    var renderer, scene, camera, raf;
    var logoGroup, hexBody, hexFaceMat, hexSideMat, edgeMat,
        glyphFaceMat, glyphSideMat, hexGlow, ambientField;
    var edgeBars = [], glyphBars = [], allLogoMats = [];

    var V = [];
    for (var i = 0; i < 6; i++) {
        var a = Math.PI / 6 + i * Math.PI / 3;
        V.push([HEX_R * Math.cos(a), HEX_R * Math.sin(a)]);
    }

    function hexagonShape(radius) {
        var shape = new THREE.Shape();
        for (var i = 0; i < 6; i++) {
            var ang = Math.PI / 6 + i * Math.PI / 3;
            var x = radius * Math.cos(ang), y = radius * Math.sin(ang);
            if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
        }
        shape.closePath();
        return shape;
    }

    // Barre dont l'origine est au point de départ : scale.x 0 → 1 = le trait se dessine
    function growBar(ax, ay, bx, by, thick, depth, materials, overshoot) {
        var dx = bx - ax, dy = by - ay;
        var len = Math.sqrt(dx * dx + dy * dy) + (overshoot || 0);
        var geo = new THREE.BoxGeometry(len, thick, depth);
        geo.translate(len / 2, 0, 0);
        var mesh = new THREE.Mesh(geo, materials);
        mesh.position.set(ax, ay, 0);
        mesh.rotation.z = Math.atan2(dy, dx);
        mesh.scale.x = 0;
        return mesh;
    }

    function initThree() {
        renderer = new THREE.WebGLRenderer({
            antialias: true, alpha: true, powerPreference: 'high-performance'
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        // PAS d'outputEncoding : MeshBasicMaterial doit restituer la couleur brute
        preloader.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 220);
        camera.position.set(0, 0.25, 7.4);

        // Champ d'ambiance, loin derrière : ne voile jamais le logo
        var DCOUNT = window.innerWidth < 640 ? 130 : 240;
        var dpos = new Float32Array(DCOUNT * 3);
        for (var d = 0; d < DCOUNT; d++) {
            dpos[d * 3] = (Math.random() - 0.5) * 26;
            dpos[d * 3 + 1] = (Math.random() - 0.5) * 17;
            dpos[d * 3 + 2] = -6 - Math.random() * 20;
        }
        var dgeo = new THREE.BufferGeometry();
        dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
        ambientField = new THREE.Points(dgeo, new THREE.PointsMaterial({
            color: BRAND.dust, size: 0.024, transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
        }));
        scene.add(ambientField);

        logoGroup = new THREE.Group();
        scene.add(logoGroup);

        /* Matériaux NON ÉCLAIRÉS : la couleur affichée EST la couleur déclarée */
        edgeMat = new THREE.MeshBasicMaterial({ color: BRAND.edge, transparent: true, opacity: 0 });
        glyphFaceMat = new THREE.MeshBasicMaterial({ color: BRAND.glyph, transparent: true, opacity: 0 });
        glyphSideMat = new THREE.MeshBasicMaterial({ color: BRAND.glyphSide, transparent: true, opacity: 0 });
        hexFaceMat = new THREE.MeshBasicMaterial({ color: BRAND.face, transparent: true, opacity: 0 });
        hexSideMat = new THREE.MeshBasicMaterial({ color: BRAND.side, transparent: true, opacity: 0 });
        allLogoMats = [edgeMat, glyphFaceMat, glyphSideMat, hexFaceMat, hexSideMat];

        // 1 — les 6 arêtes de l'hexagone
        for (var e = 0; e < 6; e++) {
            var p = V[e], q = V[(e + 1) % 6];
            var bar = growBar(p[0], p[1], q[0], q[1], 0.055, 0.055, edgeMat, 0.05);
            logoGroup.add(bar);
            edgeBars.push(bar);
        }

        // 2 — les 5 traits du </>  (BoxGeometry : 0..3 = flancs, 4/5 = faces)
        var glyphMats = [glyphSideMat, glyphSideMat, glyphSideMat, glyphSideMat,
            glyphFaceMat, glyphFaceMat];
        GLYPH_SEGMENTS.forEach(function (seg) {
            var b = growBar(seg[0][0], seg[0][1], seg[1][0], seg[1][1], 0.105, 0.68, glyphMats, 0.05);
            b.scale.y = 0.26;
            b.scale.z = 0.09;
            logoGroup.add(b);
            glyphBars.push(b);
        });

        // 3 — le volume plein (ExtrudeGeometry : groupe 0 = faces, groupe 1 = tranches)
        var hexGeo = new THREE.ExtrudeGeometry(hexagonShape(HEX_R), {
            depth: HEX_DEPTH, bevelEnabled: true,
            bevelThickness: BEVEL, bevelSize: BEVEL, bevelSegments: 4
        });
        hexGeo.center();
        hexBody = new THREE.Mesh(hexGeo, [hexFaceMat, hexSideMat]);
        hexBody.scale.z = 0.04;
        logoGroup.add(hexBody);

        // halo, derrière : n'altère jamais la couleur des faces
        var glowGeo = new THREE.ExtrudeGeometry(hexagonShape(HEX_R * 1.24), {
            depth: 0.04, bevelEnabled: false
        });
        glowGeo.center();
        hexGlow = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({
            color: BRAND.glow, transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending, depthWrite: false
        }));
        hexGlow.position.z = -0.55;
        scene.add(hexGlow);

        logoGroup.rotation.x = -0.16;

        window.addEventListener('resize', onResize);
        animate();
    }

    function onResize() {
        if (!renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    function animate() {
        raf = requestAnimationFrame(animate);
        ambientField.rotation.y += 0.0003;
        renderer.render(scene, camera);
    }

    function stopRender() {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
        window.removeEventListener('resize', onResize);
        if (renderer) {
            renderer.dispose();
            if (renderer.domElement && renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
        }
    }

    /* Position monde du logo du header — recalculée au moment du saut,
       donc juste quel que soit l'écran ou si vous déplacez le logo */
    function headerTarget() {
        var r = anchor.getBoundingClientRect();
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var ndcX = (cx / window.innerWidth) * 2 - 1;
        var ndcY = -((cy / window.innerHeight) * 2 - 1);
        var dist = camera.position.z;
        var h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * dist;
        var w = h * camera.aspect;
        var worldPerPx = h / window.innerHeight;
        var targetRadiusPx = r.height * CONFIG.HEADER_HEX_RATIO;
        return {
            x: ndcX * w / 2 + camera.position.x,
            y: ndcY * h / 2 + camera.position.y,
            scale: (targetRadiusPx * worldPerPx) / HEX_R
        };
    }

    /* ─────────────────────────────────────────────────────────────
       SÉQUENCE
       ───────────────────────────────────────────────────────────── */
    function runSequence() {
        if (anchor) anchor.style.opacity = '0';

        var tl = gsap.timeline();
        var ROT_START = 3.5;
        var ROT_END = ROT_START + CONFIG.ROTATION_DURATION;   // 8.3s

        /* Phase 1 — 0 → 1.4s : le contour se trace, arête par arête */
        tl.to(ambientField.material, { opacity: 0.28, duration: 0.9, ease: 'power1.out' }, 0);
        tl.to(edgeMat, { opacity: 1, duration: 0.28, ease: 'power1.out' }, 0.06);
        edgeBars.forEach(function (bar, i) {
            tl.to(bar.scale, { x: 1, duration: 0.32, ease: 'power2.inOut' }, 0.1 + i * 0.19);
        });

        /* Phase 2 — 1.2 → 2.2s : les 5 traits du </> */
        tl.to([glyphFaceMat, glyphSideMat], { opacity: 1, duration: 0.25, ease: 'power1.out' }, 1.2);
        glyphBars.forEach(function (bar, i) {
            tl.to(bar.scale, { x: 1, duration: 0.30, ease: 'power2.inOut' }, 1.25 + i * 0.15);
        });

        /* Phase 3 — 2.2 → 3.4s : matérialisation en volume */
        tl.to(camera.position, { z: 6.2, duration: 1.4, ease: 'power2.inOut' }, 2.2);
        tl.to([hexFaceMat, hexSideMat], { opacity: 1, duration: 0.9, ease: 'power2.out' }, 2.3);
        tl.to(hexBody.scale, { z: 1, duration: 1.05, ease: 'power3.out' }, 2.3);
        glyphBars.forEach(function (bar, i) {
            tl.to(bar.scale, { y: 1, z: 1, duration: 0.8, ease: 'power3.out' }, 2.4 + i * 0.05);
        });
        tl.to(edgeMat, { opacity: 1, duration: 0.7, ease: 'power1.inOut' }, 2.6);
        tl.to(hexGlow.material, { opacity: 0.3, duration: 1.0, ease: 'power1.in' }, 2.4);

        /* Phase 4 — 3.5 → 8.3s : UN tour complet de 360° */
        tl.to(logoGroup.scale, { x: 1.06, y: 1.06, z: 1.06, duration: 0.28, ease: 'power2.out' }, ROT_START);
        tl.to(logoGroup.scale, { x: 1, y: 1, z: 1, duration: 0.42, ease: 'power2.inOut' }, ROT_START + 0.28);
        tl.to(logoGroup.rotation, {
            y: Math.PI * 2, duration: CONFIG.ROTATION_DURATION, ease: 'power1.inOut'
        }, ROT_START);

        /* Phase 5 — le nom apparaît pendant la rotation */
        tl.to(letters, { opacity: 1, y: '0%', duration: 0.6, stagger: 0.05, ease: 'power3.out' }, 4.1);
        tl.to(captionEl, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 5.0);

        /* Phase 6 — rotation terminée → le logo rejoint le header */
        tl.call(function () {
            var t = headerTarget();
            gsap.to(logoGroup.rotation, { x: 0, duration: 1.1, ease: 'power2.inOut' });
            gsap.to(logoGroup.position, { x: t.x, y: t.y, z: 0, duration: 1.25, ease: 'power3.inOut' });
            gsap.to(logoGroup.scale, { x: t.scale, y: t.scale, z: t.scale, duration: 1.25, ease: 'power3.inOut' });
            gsap.to(hexGlow.material, { opacity: 0, duration: 0.65, ease: 'power1.in' });
        }, null, ROT_END);

        tl.to([letters, captionEl], { opacity: 0, y: -14, duration: 0.5, ease: 'power2.in' }, ROT_END);
        tl.to([preBg, preVignette], { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, ROT_END + 0.15);
        tl.to(ambientField.material, { opacity: 0, duration: 0.85, ease: 'power1.in' }, ROT_END + 0.15);

        /* Le site reprend la main : on relâche le scroll et les animations du hero */
        tl.call(function () {
            root.classList.remove('swp-preloading');
        }, null, ROT_END + 0.15);

        /* Passage de relais : le logo 3D cède la place au SVG du header */
        tl.to(anchor, { opacity: 1, duration: 0.3, ease: 'power1.out' }, ROT_END + 1.1);
        tl.to(allLogoMats, { opacity: 0, duration: 0.3, ease: 'power1.in' }, ROT_END + 1.15);

        tl.call(function () {
            stopRender();
            finish();
        }, null, ROT_END + 1.5);
    }

    /* ─────────────────────────────────────────────────────────────
       DÉMARRAGE
       ───────────────────────────────────────────────────────────── */
    function boot() {
        if (!anchor) { finish(); return; }   // pas d'ancre = pas de séquence
        try {
            initThree();
            runSequence();
        } catch (err) {
            console.warn('[SWP preloader]', err);
            stopRender();
            finish();
        }
    }

    if (document.readyState === 'complete') boot();
    else window.addEventListener('load', boot);
})();