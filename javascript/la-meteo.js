

const apiKey = "54ab11de1bb7acd090d2f9fc9ac734cb ";

async function checkWeather(coordonnees) {

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${coordonnees.latitude}&lon=${coordonnees.longitude}&appid=${apiKey}`;

    return fetch(apiUrl)
    .then(async (response) => {
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const mainWrapper = document.querySelector('.meteo-section');
        
        const data = await response.json();

        const infosVille = await obtenirVilleLaPlusProche(coordonnees.latitude, coordonnees.longitude);

        if (infosVille.ville !== null) {

            document.querySelector(".city").textContent = infosVille.ville; 
            document.querySelector(".temp").textContent = Math.round(data.main.temp) + "°C"; 
            document.querySelector(".hum").textContent = data.main.humidity + "%"; 
            // document.querySelector(".couverture").innerHTML = data.clouds.all + "%";

            const weatherIconId = data.weather[0].icon;

            let iconeMeteoChoisie

            if (weatherIconId.includes("01")) {
                iconeMeteoChoisie = document.querySelector("#clear-sky")
                document.querySelector("h1").textContent = "ensoleillé"
            } else if (weatherIconId.includes("02")) {
                iconeMeteoChoisie = document.querySelector("#few-clouds")
                document.querySelector("h1").textContent = "partiellement nuageux"
            } else if (weatherIconId.includes("03")) {
                iconeMeteoChoisie = document.querySelector("#broken-clouds")
                document.querySelector("h1").textContent = "couvert"
            } else if (weatherIconId.includes("04")) {
                iconeMeteoChoisie = document.querySelector("#scattered-clouds")
                document.querySelector("h1").textContent = "nuageux"
            } else if (weatherIconId.includes("09")) {
                iconeMeteoChoisie = document.querySelector("#shower-rain")
                document.querySelector("h1").textContent = "pluie abondante"
            } else if (weatherIconId.includes("10")) {
                iconeMeteoChoisie = document.querySelector("#rain")
                document.querySelector("h1").textContent = "pluie"
            } else if (weatherIconId.includes("11")) {
                iconeMeteoChoisie = document.querySelector("#snow")
                document.querySelector("h1").textContent = "neige"
            } else if (weatherIconId.includes("13")) {
                iconeMeteoChoisie = document.querySelector("#thunderstorm")
                document.querySelector("h1").textContent = "orage"
            } else if (weatherIconId.includes("50")) {
                iconeMeteoChoisie = document.querySelector("#scattered-clouds")
                document.querySelector("h1").textContent = "brouillard"
            }

            const allIcons = document.querySelectorAll('#meteo-section-img > img')
            allIcons.forEach(icon => {
                icon.classList.remove('show')
            })
            iconeMeteoChoisie.classList.add("show");

            // change favicon to the src of the element which
            const favicon = iconeMeteoChoisie.src
            document.querySelector('link[rel="icon"]').href = favicon

            hideLoader()
            mainWrapper.classList.add('show');
        
        } else {
            console.log(".")
            hideLoader()
            const reponseEl = document.getElementById('reponse');
            reponseEl.textContent = "L'API de géolocalisation n'a pas pu trouver votre ville.";
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
        await hideLoader()
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
    console.error('Erreur lors du fetch:', erreur);
    return { ville: null, country: null, postCode: null, region: null };
    });
}
