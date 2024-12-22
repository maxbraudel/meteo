

const apiKey = "54ab11de1bb7acd090d2f9fc9ac734cb ";

async function checkWeather(coordonnees) {

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${coordonnees.latitude}&lon=${coordonnees.longitude}&appid=${apiKey}`;

    return fetch(apiUrl)
    .then(async (response) => {
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const mainWrapper = document.querySelector('main');
        
        const data = await response.json();

        const infosVille = await obtenirVilleLaPlusProche(coordonnees.latitude, coordonnees.longitude);

        if (infosVille.ville !== null) {

            document.querySelector(".city").textContent = infosVille.ville; 
            document.querySelector(".temp").textContent = Math.round(data.main.temp) + "°C"; 
            document.querySelector(".hum").textContent = data.main.humidity + "%"; 
            // document.querySelector(".couverture").innerHTML = data.clouds.all + "%";

            const weatherIconId = data.weather[0].icon;

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
            } else {
                document.querySelector("main").classList.remove("night-mode")
            }

            // change favicon to the src of the element which
            const favicon = imageMeteo.src
            document.querySelector('link[rel="icon"]').href = favicon

            hideLoader()
            mainWrapper.classList.add('show');
        
        }
    
    })
    .catch (error => {
        console.error('Erreur lors de la récupération de la météo:', error);
        hideLoader()
        const reponseEl = document.getElementById('reponse');
        reponseEl.textContent = "L'API météo est indisponible.";
        testerUrlAPIEtReloadSiDisponible(apiUrl, 1000, response => response.ok);
    })

}

async function obtenirLocalisation() {
    showLoader(1)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position)=> {
                checkWeather(position.coords);
                setInterval(() => {
                    checkWeather(position.coords);
                }, 60000)
            }, 
            montrerErreursGeolocalisation,
            {
                enableHighAccuracy: true,
                timeout: 10000, 
                maximumAge: 0
            }
        );
    } else {
        console.log("Votre navigateur n'est pas compatible avec la géolocalisation.")
        hideLoader()
        const reponseEl = document.getElementById('reponse');
        reponseEl.textContent = "Votre navigateur n'est pas compatible avec la géolocalisation.";
    }
}

obtenirLocalisation()

async function montrerErreursGeolocalisation(erreur) {
    const reponseEl = document.getElementById('reponse');
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

async function hideLoader() {
    const loadingEl = document.querySelector('.loader');
    loadingEl.classList.remove('show-loader');
    loadingEl.classList.remove('loader-stage-1');
    loadingEl.classList.remove('loader-stage-2');
}

async function obtenirVilleLaPlusProche(lat, lon) {
// Url de l'API de Nominatim
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`;
    return fetch(url)
    .then((reponse) => {
        if (!reponse.ok) {
            throw new Error('Erreur réseau');
        }
        return reponse.json();
        })
        .then((donnes) => {
        // Recup les informations de la ville
        const ville = donnes.city
        const codePostal = donnes.postcode
        const region = donnes.principalSubdivision
        const pays = donnes.countryName 

        const infosVille = {
            ville: ville,
            pays: pays,
            codePostal: codePostal,
            region: region
        };

        // Retourner les informations de la ville
        return infosVille;
    })
    .catch((erreur) => {
        console.error('Erreur lors de la récupération de la ville:', erreur);
        hideLoader()
        const reponseEl = document.getElementById('reponse');
        reponseEl.textContent = "L'API de géolocalisation n'a pas pu trouver votre ville.";
        testerUrlAPIEtReloadSiDisponible(url, 1000, response => response.ok);
    return { ville: null, country: null, postCode: null, region: null };
    });
}