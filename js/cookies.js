/* ================================================
   COOKIES.JS — Sud Web Project
   RGPD conforme — adapté à la structure index.html
   ================================================ */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        var KEY = 'swp_cookie_consent';
        var banner = document.querySelector('.cookie-banner');
        var stored = localStorage.getItem(KEY);

        /* ── Déjà fait un choix ── */
        if (stored === 'accepted') {
            enableAnalytics();
            return;
        }
        if (stored === 'refused') {
            return; /* Bannière cachée, pas d'analytics */
        }

        /* ── Premier visit : afficher après 1.5s ── */
        if (banner) {
            setTimeout(function () {
                banner.style.display = 'block';
                /* Petite transition d'entrée */
                requestAnimationFrame(function () {
                    banner.style.transition = 'opacity .4s ease, transform .4s ease';
                    banner.style.opacity = '1';
                    banner.style.transform = 'translateX(-50%) translateY(0)';
                });
            }, 1500);
        }

        /* ── Bouton ACCEPTER ── */
        var acceptBtn = document.getElementById('cookie-accept');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', function () {
                localStorage.setItem(KEY, 'accepted');
                enableAnalytics();
                hideBanner();
            });
        }

        /* ── Bouton REFUSER ── */
        var refuseBtn = document.getElementById('cookie-refuse');
        if (refuseBtn) {
            refuseBtn.addEventListener('click', function () {
                localStorage.setItem(KEY, 'refused');
                hideBanner();
            });
        }

        /* ── Fermer au clic en dehors ── */
        document.addEventListener('click', function (e) {
            if (banner && banner.style.display !== 'none' && !banner.contains(e.target)) {
                /* Ne pas fermer automatiquement — laisser le choix explicite */
            }
        });

    });

    /* ── Masquer la bannière ── */
    function hideBanner() {
        var banner = document.querySelector('.cookie-banner');
        if (!banner) return;
        banner.style.transition = 'opacity .3s ease, transform .3s ease';
        banner.style.opacity = '0';
        banner.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(function () {
            banner.style.display = 'none';
        }, 350);
    }

    /* ── Activer les analytics (Cloudflare ou GA4) ── */
    function enableAnalytics() {
        /* Cloudflare Web Analytics — décommenter et remplacer TOKEN si utilisé */
        /*
        if (!document.getElementById('cf-analytics')) {
          var s = document.createElement('script');
          s.id    = 'cf-analytics';
          s.defer = true;
          s.src   = 'https://static.cloudflareinsights.com/beacon.min.js';
          s.setAttribute('data-cf-beacon', '{"token":"VOTRE_TOKEN_CF"}');
          document.head.appendChild(s);
        }
        */

        /* Google Analytics 4 — décommenter et remplacer G-XXXXXXXX si utilisé */
        /*
        if (!document.getElementById('ga4-script')) {
          var ga = document.createElement('script');
          ga.id  = 'ga4-script';
          ga.async = true;
          ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX';
          document.head.appendChild(ga);
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXX');
        }
        */
    }

    /* ── Utilitaire de reset pour tests ── */
    window.resetCookieConsent = function () {
        localStorage.removeItem('swp_cookie_consent');
        location.reload();
    };

})();