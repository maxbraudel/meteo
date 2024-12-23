
// FETCH API OPENWEATHERMAP (pour obtenir les informations météorologiques)

async function obtenirDonneesMeteo(lat, long) {
    
    const apiKey = "54ab11de1bb7acd090d2f9fc9ac734cb ";

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${lat}&lon=${long}&appid=${apiKey}`;

    return fetch(apiUrl)
    .then(async (response) => {
        
        if (!response.ok) {
            throw new Error(`Erreur fetch: ${response.status}`);
        }
        
        const donneesMeteo = await response.json();

        return donneesMeteo;
    })
    .catch(async (erreur) => {
        document.querySelector('.meteo-section').remove();
        document.querySelector('main').classList.add('show');
        console.error('Erreur lors de la récupération de la météo:', erreur);
        hideLoader()
        const reponseEl = document.getElementById('reponse');
        reponseEl.textContent = "L'API météo est indisponible.";
        testerUrlAPIEtReloadSiDisponible(apiUrl, 1000, response => response.ok);
        return null;
    })
}

// RECUPERER LES COORDONNÉES GPS

async function obtenirCoordonneesGps() {
    if (navigator.geolocation) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Résout avec les coordonnées GPS
                    resolve(position);
                },
                (erreur) => {
                    // Gestion des erreurs de géolocalisation
                    montrerErreursGeolocalisation(erreur).then(() => {
                        reject(erreur);
                    });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        });
    } else {
        console.log("Votre navigateur n'est pas compatible avec la géolocalisation.")
        document.querySelector('.meteo-section').remove();
        document.querySelector('main').classList.add('show');
        hideLoader()
        const reponseEl = document.getElementById('reponse');
        reponseEl.textContent = "Votre navigateur n'est pas compatible avec la géolocalisation.";
        return null;
    }
}

async function montrerErreursGeolocalisation(erreur) {
    const reponseEl = document.getElementById('reponse');
    document.querySelector('.meteo-section').remove();
    document.querySelector('main').classList.add('show');
    // Handle error cases
    switch (erreur.code) {
        case erreur.PERMISSION_DENIED:
            await hideLoader()
            reponseEl.textContent = "Vous devez autoriser la géolocalisation pour connaitre la météo.";
            reponseEl.style.textAlign = 'center';
            break;
        case erreur.POSITION_UNAVAILABLE:
            await hideLoader()
            reponseEl.textContent = "Votre navigateur ne peut pas vous donner l'information de votre position actuelle.";
            reponseEl.style.textAlign = 'center';
            break;
        case erreur.TIMEOUT:
            await hideLoader()
            reponseEl.textContent = "Le temps imparti pour obtenir votre position a expiré.";
            reponseEl.style.textAlign = 'center';
            break;
        case erreur.UNKNOWN_ERROR:
            await hideLoader()
            reponseEl.textContent = "Une erreur inconnue s'est produite.";
            reponseEl.style.textAlign = 'center';
            break;
    }
}

// CACHER LE LOADER (la fonction pour l'afficher est dans layout.js)

async function hideLoader() {
    const loadingEl = document.querySelector('.loader');
    loadingEl.classList.remove('show-loader');
    loadingEl.classList.remove('loader-stage-1');
    loadingEl.classList.remove('loader-stage-2');
}

// FETCH API BIGDATACLOUD (pour obtenir les informations de la ville la plus proche)

async function obtenirVilleLaPlusProche(lat, lon) {

    // Url de l'API de Nominatim
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`;
    
    return fetch(url)
    .then((reponse) => {
        if (!reponse.ok) {
            throw new Error(reponse.statusText);
        }

        return reponse.json();
        })
        .then((donnes) => {
        // Recup les informations de la ville
        const ville = donnes.city
        const codePostal = donnes.postcode
        const region = donnes.principalSubdivision
        const pays = donnes.countryName 

        const donneesVille = {
            ville: ville,
            pays: pays,
            codePostal: codePostal,
            region: region
        };

        // Retourner les informations de la ville
        return donneesVille;
    })
    .catch(async (erreur) => {

        console.error('Erreur lors de la récupération de la ville:', erreur);

        document.querySelector('.meteo-section').remove();
        document.querySelector('main').classList.add('show');

        const reponseEl = document.getElementById('reponse');
        await hideLoader()
        reponseEl.style.textAlign = 'center';
        reponseEl.textContent = "L'API de géolocalisation n'a pas pu trouver votre ville.";

        testerUrlAPIEtReloadSiDisponible(url, 1000, response => response.ok);


        return null;
    });
}

// AFFICHER LES INFORMATIONS MÉTÉOROLOGIQUES

async function afficherMeteo(result) {

    const donneesVille = result.donneesVille
    const donneesMeteo = result.donneesMeteo

    document.querySelector(".city").textContent = donneesVille.ville; 
    document.querySelector(".temp").textContent = Math.round(donneesMeteo.main.temp) + "°C"; 
    document.querySelector(".hum").textContent = donneesMeteo.main.humidity + "%"; 
    document.querySelector(".couverture").innerHTML = donneesMeteo.clouds.all + "%";

    const weatherIconId = donneesMeteo.weather[0].icon;

    const imageMeteo = document.querySelector("#meteo-img")

    if (weatherIconId === "01d") {
        imageMeteo.setAttribute("src", "img/conditions/day/clear sky.svg")
        document.querySelector("h1").textContent = "ensoleillé"
    } else if (weatherIconId === "02d") {
        imageMeteo.setAttribute("src", "img/conditions/day/few clouds.svg")
        document.querySelector("h1").textContent = "partiellement nuageux"
    } else if (weatherIconId === "03d") {
        imageMeteo.setAttribute("src", "img/conditions/day/broken clouds.svg")
        document.querySelector("h1").textContent = "couvert"
    } else if (weatherIconId === "04d") {
        imageMeteo.setAttribute("src", "img/conditions/day/scattered clouds.svg")
        document.querySelector("h1").textContent = "nuageux"
    } else if (weatherIconId === "09d") {
        imageMeteo.setAttribute("src", "img/conditions/day/shower rain.svg")
        document.querySelector("h1").textContent = "pluie abondante"
    } else if (weatherIconId === "10d") {
        imageMeteo.setAttribute("src", "img/conditions/day/rain.svg")
        document.querySelector("h1").textContent = "pluie"
    } else if (weatherIconId === "11d") {
        imageMeteo.setAttribute("src", "img/conditions/day/snow.svg")
        document.querySelector("h1").textContent = "neige"
    } else if (weatherIconId === "13d") {
        imageMeteo.setAttribute("src", "img/conditions/day/thunderstorm.svg")
        document.querySelector("h1").textContent = "orage"
    } else if (weatherIconId === "50d") {
        imageMeteo.setAttribute("src", "img/conditions/night/scattered clouds.svg")
        document.querySelector("h1d").textContent = "brouillard"
    } if (weatherIconId === "01n" ){
        imageMeteo.setAttribute("src", "img/conditions/night/clear sky.svg")
        document.querySelector("h1").textContent = "ensoleillé"
    } else if (weatherIconId === "02n" ){
        imageMeteo.setAttribute("src", "img/conditions/night/few clouds.svg")
        document.querySelector("h1").textContent = "partiellement nuageux"
    } else if (weatherIconId === "03n" ){
        imageMeteo.setAttribute("src", "img/conditions/night/broken clouds.svg")
        document.querySelector("h1").textContent = "couvert"
    } else if (weatherIconId === "04n" ){
        imageMeteo.setAttribute("src", "img/conditions/night/scattered clouds.svg")
        document.querySelector("h1").textContent = "nuageux"
    } else if (weatherIconId === "09n" ){
        imageMeteo.setAttribute("src", "img/conditions/night/shower rain.svg")
        document.querySelector("h1").textContent = "pluie abondante"
    } else if (weatherIconId === "10n" ){
        imageMeteo.setAttribute("src", "img/conditions/night/rain.svg")
        document.querySelector("h1").textContent = "pluie"
    } else if (weatherIconId === "11n" ){
        imageMeteo.setAttribute("src", "img/conditions/night/snow.svg")
        document.querySelector("h1").textContent = "neige"
    } else if (weatherIconId === "13n" ){
        imageMeteo.setAttribute("src", "img/conditions/night/thunderstorm.svg")
        document.querySelector("h1").textContent = "orage"
    } else if (weatherIconId === "50n" ){
        imageMeteo.setAttribute("src", "img/conditions/night/scattered clouds.svg")
        document.querySelector("h1d").textContent = "brouillard"
    } 

    if (weatherIconId.includes("n") ){
        document.querySelector("main").classList.add("night-mode")
        document.getElementById("mobile-menu-btn").style.color = "#fff"
    } else {
        document.querySelector("main").classList.remove("night-mode")
        document.getElementById("mobile-menu-btn").style.color = "#000"
    }

    // change favicon to the src of the element which
    const favicon = imageMeteo.src
    document.querySelector('link[rel="icon"]').href = favicon

    hideLoader()
    document.querySelector('main').classList.add('show');

}

// INITILISATION DE LA METEO

async function initialisationMeteo() {

    showLoader(1)

    // Obtenir les coordonnées GPS

    const coordonnesGPS = await obtenirCoordonneesGps()

    console.log('Coordonnées GPS :', coordonnesGPS)

    if (coordonnesGPS) {

        // Obtenir les informations de la ville

        const donneesVille = await obtenirVilleLaPlusProche(coordonnesGPS.latitude, coordonnesGPS.longitude);

        console.log('Informations de la ville :', donneesVille)

        if (donneesVille) {

            const donneesMeteo = await obtenirDonneesMeteo(coordonnesGPS.coords.latitude, coordonnesGPS.coords.longitude);

            console.log('Données météorologiques :', donneesMeteo)

            if (donneesMeteo) {

                const result = { donneesVille, donneesMeteo };
                afficherMeteo(result);

            }
        }
    }
}

// INITILISATION DE LA METEO APRES LE DOM CHARGÉ

document.addEventListener('DOMContentLoaded', () => {
    initialisationMeteo()
})