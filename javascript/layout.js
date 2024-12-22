document.addEventListener('DOMContentLoaded', function () {

    // NAVIGATION MENU

    const navBar = document.getElementById('navBar');
    const menuIcon = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const returnButton = document.getElementById('return');

    // Ouverture du menu mobile
    menuIcon.addEventListener('click', () => {
        mobileMenu.style.display = 'flex';
        navBar.style.display = 'none'
    });

    // Fermeture du menu mobile
    returnButton.addEventListener('click', () => {
        mobileMenu.style.display = 'none';
        navBar.style.removeProperty('display')
    });

})

/* FUNCTIONS */

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function testerUrlAPIEtReloadSiDisponible(url, interval = 2000, condition = response => response.ok) {
    // Variable pour stocker l'identifiant du setInterval
    let checkInterval;
    
    // Fonction qui effectue la vérification
    async function checkAPI() {
        try {
            // Effectue la requête
            const response = await fetch(url);
            
            // Vérifie si la condition est remplie
            const shouldReload = await condition(response);
            
            // Si la condition est remplie, recharge la page
            if (shouldReload) {
                console.log('Condition positive détectée, rechargement de la page...');
                window.location.reload();
            }
        } catch (error) {
            // supprimer 8 premiers caractères url
            const urlSansProtocol = url.substring(8)
            const nomDuService = urlSansProtocol.split('/')[0]
            console.error(`Erreur lors de la vérification de l'API :`, nomDuService);
        }
    }
    
    // Démarre la vérification périodique
    checkInterval = setInterval(checkAPI, interval);
    
    // Retourne une fonction pour arrêter la vérification
    return function stopChecking() {
        if (checkInterval) {
            clearInterval(checkInterval);
            console.log('Vérification arrêtée');
        }
    };
}

/* LOADER ELEMENTS */

function showLoader(stage) {
    const loadingEl = document.querySelector('.loader');

    setTimeout(() => {
        loadingEl.classList.add('show-loader');
    }, 1);

    if (stage === 1) {
        loadingEl.classList.remove('loader-stage-2');
        loadingEl.classList.add('loader-stage-1');
    } else if (stage === 2) {
        loadingEl.classList.remove('loader-stage-1');
        loadingEl.classList.add('loader-stage-2');
    }
}