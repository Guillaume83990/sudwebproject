/* ═══════════════════════════════════════════════════════════════
   HERO-FX.JS — Sud Web Project — v3
   Reflets de lumière sur l'eau, en WebGL. Shader écrit à la main.

   CORRECTIF v3 — LE BUG PRINCIPAL
   La v2 attendait un événement 'swp:intro-done' que preloader.js
   n'émet jamais : le shader ne démarrait qu'au bout de 11 s, donc
   invisible en pratique. On surveille désormais directement la
   disparition de la classe .swp-preloading, avec un filet à 3 s.

   Intensité remontée : assez présente pour se voir sur l'eau,
   assez contenue pour ne jamais redevenir du brouillard.

   Dépendance : three.min.js.
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var CONFIG = {
        INTENSITY: 0.72,    // v1 : 1.0 (brouillard) — v2 : 0.42 (invisible)
        SPEED: 0.05,
        POINTER: 0.4,
        MAX_DPR: 1.5
    };

    var hero = document.querySelector('.hero');
    if (!hero) return;
    if (typeof window.THREE === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) CONFIG.POINTER = 0;

    var canvas = document.createElement('canvas');
    canvas.id = 'hero-fx';
    canvas.setAttribute('aria-hidden', 'true');
    hero.appendChild(canvas);

    var renderer, scene, camera, material, raf = null, running = false;
    var start = performance.now();
    var pointer = { x: 0.74, y: 0.3, tx: 0.74, ty: 0.3 };

    /* ─────────────────────────────────────────────────────────
       LE SHADER
       Bruit fractal très étiré à l'horizontale et à haute
       fréquence : des rides fines, pas des masses. Seules les
       crêtes s'allument — c'est ce qui donne des reflets plutôt
       que des nuages.
       ───────────────────────────────────────────────────────── */
    var FRAG = [
        'precision highp float;',
        'varying vec2 vUv;',
        'uniform float uTime;',
        'uniform vec2  uRes;',
        'uniform vec2  uPointer;',
        'uniform float uIntensity;',

        'vec2 hash(vec2 p){',
        '  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));',
        '  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);',
        '}',

        'float noise(vec2 p){',
        '  vec2 i = floor(p), f = fract(p);',
        '  vec2 u = f * f * (3.0 - 2.0 * f);',
        '  return mix(mix(dot(hash(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),',
        '                 dot(hash(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),',
        '             mix(dot(hash(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),',
        '                 dot(hash(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);',
        '}',

        'float fbm(vec2 p){',
        '  float v = 0.0, a = 0.5;',
        '  for(int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.07; a *= 0.5; }',
        '  return v;',
        '}',

        'void main(){',
        '  vec2 uv = vUv;',
        '  float aspect = uRes.x / max(uRes.y, 1.0);',
        '  vec2 p = vec2(uv.x * aspect, uv.y);',

        /* Haute fréquence + fort étirement horizontal : des rides */
        '  vec2 q = vec2(p.x * 3.2, p.y * 10.0);',

        '  float t = uTime;',
        '  float n1 = fbm(q + vec2(t * 1.1, t * 0.2));',
        '  float n2 = fbm(q * 1.7 + vec2(-t * 0.7, n1 * 0.9));',

        /* Seules les crêtes s\'allument */
        '  float crest = abs(n1 * 0.62 + n2 * 0.38);',
        '  crest = 1.0 - smoothstep(0.0, 0.21, crest);',
        '  crest = pow(crest, 3.0);',

        '  vec2 pt = vec2(uPointer.x * aspect, uPointer.y);',
        '  float d = distance(p, pt);',
        '  float glow = exp(-d * d * 8.0) * 0.3;',

        /* Les reflets vivent sur l\'eau, en bas de l\'image */
        '  float water = smoothstep(0.78, 0.05, uv.y);',

        '  float vig = smoothstep(1.05, 0.3, distance(uv, vec2(0.5)) * 1.3);',

        /* La moitié gauche porte le texte : on y coupe presque tout */
        '  float clear = smoothstep(0.3, 0.7, uv.x);',
        '  clear = mix(0.05, 1.0, clear);',

        '  float amount = (crest * water + glow * water) * vig * clear * uIntensity;',
        '  amount = clamp(amount, 0.0, 0.6);',

        '  vec3 deep  = vec3(0.086, 0.322, 0.678);',
        '  vec3 light = vec3(0.643, 0.831, 1.0);',
        '  vec3 col = mix(deep, light, clamp(crest * 1.2, 0.0, 1.0));',

        '  gl_FragColor = vec4(col * amount, 1.0);',
        '}'
    ].join('\n');

    var VERT = [
        'varying vec2 vUv;',
        'void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }'
    ].join('\n');

    function init() {
        try {
            renderer = new THREE.WebGLRenderer({
                canvas: canvas, alpha: false, antialias: false,
                powerPreference: 'high-performance'
            });
        } catch (e) {
            canvas.remove();
            return false;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.MAX_DPR));
        renderer.setSize(hero.offsetWidth, hero.offsetHeight, false);

        scene = new THREE.Scene();
        camera = new THREE.Camera();
        material = new THREE.ShaderMaterial({
            vertexShader: VERT,
            fragmentShader: FRAG,
            uniforms: {
                uTime: { value: 0 },
                uRes: { value: new THREE.Vector2(hero.offsetWidth, hero.offsetHeight) },
                uPointer: { value: new THREE.Vector2(0.74, 0.3) },
                uIntensity: { value: CONFIG.INTENSITY }
            },
            depthTest: false,
            depthWrite: false
        });
        scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
        return true;
    }

    function resize() {
        if (!renderer) return;
        var w = hero.offsetWidth, h = hero.offsetHeight;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.MAX_DPR));
        renderer.setSize(w, h, false);
        material.uniforms.uRes.value.set(w, h);
    }

    function frame() {
        raf = requestAnimationFrame(frame);
        pointer.x += (pointer.tx - pointer.x) * 0.04;
        pointer.y += (pointer.ty - pointer.y) * 0.04;
        material.uniforms.uPointer.value.set(pointer.x, pointer.y);
        material.uniforms.uTime.value = (performance.now() - start) * 0.001 * CONFIG.SPEED;
        renderer.render(scene, camera);
    }

    function play() { if (!running) { running = true; frame(); } }
    function pause() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

    function onPointer(e) {
        var r = hero.getBoundingClientRect();
        pointer.tx = (e.clientX - r.left) / r.width;
        pointer.ty = 1 - (e.clientY - r.top) / r.height;
    }

    function boot() {
        if (!init()) return;

        window.addEventListener('resize', resize, { passive: true });
        if (CONFIG.POINTER > 0) {
            hero.addEventListener('pointermove', onPointer, { passive: true });
        }

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (e) {
                e[0].isIntersecting ? play() : pause();
            }, { threshold: 0 }).observe(hero);
        } else {
            play();
        }

        document.addEventListener('visibilitychange', function () {
            document.hidden ? pause() : play();
        });

        setTimeout(function () { canvas.classList.add('is-ready'); }, 500);
    }

    /* ─────────────────────────────────────────────────────────
       DÉMARRAGE — trois voies, la première qui aboutit gagne
       ───────────────────────────────────────────────────────── */
    var started = false;
    function go() { if (!started) { started = true; boot(); } }

    var root = document.documentElement;

    if (root.classList.contains('swp-preloading')) {
        /* On surveille la fin réelle du preloader : la classe
           .swp-preloading disparaît quand le rideau se lève */
        if ('MutationObserver' in window) {
            var mo = new MutationObserver(function () {
                if (!root.classList.contains('swp-preloading')) {
                    mo.disconnect();
                    go();
                }
            });
            mo.observe(root, { attributes: true, attributeFilter: ['class'] });
        }
        document.addEventListener('swp:intro-done', go);
        setTimeout(go, 12000);          // filet ultime
    } else if (document.readyState === 'complete') {
        go();
    } else {
        window.addEventListener('load', function () { setTimeout(go, 300); });
    }
})();