/* ================================================
   EMAILJS CONTACT FORM
   Gestion du formulaire avec EmailJS + Redirection
   ================================================ */

(function () {
    'use strict';

    // Initialiser EmailJS avec ta Public Key
    emailjs.init('xACs9Tf2rOKGB5fIV');

    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('.submit-btn');
            const originalHTML = submitBtn.innerHTML;

            // Désactiver le bouton pendant l'envoi
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Envoi en cours...</span>';

            // Envoyer via EmailJS
            emailjs.sendForm('service_d2fohuj', 'template_aoqc49m', this)
                .then(function (response) {
                    console.log('✅ Email envoyé avec succès !', response.status, response.text);

                    // Rediriger vers la page de remerciement
                    window.location.href = 'https://www.sudwebproject.com/merci.html';

                }, function (error) {
                    console.error('❌ Erreur d\'envoi:', error);

                    // Afficher un message d'erreur
                    showNotification('❌ Erreur d\'envoi. Contactez-moi : contact@sudwebproject.com', 'error');

                    // Réactiver le bouton
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalHTML;
                });
        });
    }

    // Fonction pour afficher les notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 2rem;
            background: ${type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            backdrop-filter: blur(10px);
            font-weight: 600;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Ajouter les animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

})();