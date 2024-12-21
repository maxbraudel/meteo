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

function refreshLocalisation() {
    localStorage.removeItem('position');
    localStorage.removeItem('infosVille');
}

function refreshLocalisationAndReload() {
    localStorage.removeItem('position');
    localStorage.removeItem('infosVille');
    location.reload();
}

/* FUNCTIONS */

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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