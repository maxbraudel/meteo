// LOADERS ET ALERTES SUR LA PAGE

// fonction pour afficher des messages à acôté de l'animation de chargement

function showAlert(message) {
    const alertEl = document.querySelector('.alert');
    const alertTextEl = alertEl.querySelector('p');
    alertTextEl.textContent = message;
    alertEl.classList.add('show-alert');
}

async function hideAlert() {
    const alertEl = document.querySelector('.alert');
    alertEl.classList.remove('show-alert');
    setTimeout(() => {
        alertEl.classList.remove('show-alert');
        return
    }, 500);

    await delay(500);
}

// fonction pour cacher le chargement (la fonction pour l'afficher est dans layout.js)

async function hideLoader() {

    hideAlert()

    const loadingEl = document.querySelector('.loader');
    loadingEl.classList.remove('show-loader');
    setTimeout(() => {
        loadingEl.classList.remove('loader-stage-1');
        loadingEl.classList.remove('loader-stage-2');
        return
    }, 500);

    await delay(500);
}

// FONCTION POUR OBTENIR LES COORDONNEES GPS DEPUIS LE NAVIGATEUR

// GPS NAVIGATEUR

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
        console.log("Votre navigateur n'est pas compatible avec la géolocalisation.");
        await hideLoader();
        const reponseEl = document.getElementById("reponse");
        reponseEl.textContent = "Votre navigateur n'est pas compatible avec la géolocalisation.";
        return null;
    }
}

async function montrerErreursGeolocalisation(erreur) {
    const reponseEl = document.getElementById("reponse");
    switch (erreur.code) {
        case erreur.PERMISSION_DENIED:
            await hideLoader();
            reponseEl.textContent = "Vous devez autoriser la géolocalisation pour connaitre votre parcours.";
            reponseEl.style.textAlign = "center";
            break;
        case erreur.POSITION_UNAVAILABLE:
            await hideLoader();
            reponseEl.textContent = "Votre navigateur ne peut pas vous donner l'information de votre position actuelle.";
            reponseEl.style.textAlign = "center";
            break;
        case erreur.TIMEOUT:
            await hideLoader();
            reponseEl.textContent = "Le temps imparti pour obtenir votre position a expiré.";
            reponseEl.style.textAlign = "center";
            break;
        case erreur.UNKNOWN_ERROR:
            await hideLoader();
            reponseEl.textContent = "Une erreur inconnue s'est produite.";
            reponseEl.style.textAlign = "center";
            break;
    }
}


// API OPENWEATHERMAP

async function obtenirDonneesMeteo(lat, lon) {

    // Url de l'API openweathermap
    const apiKey = 'a27d442453213cecadd12d84e1c3fe77';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    return fetch(url)
    .then(async (response) => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const data = await response.json();
        return {
            location: data.name,
            temperature: data.main.temp,
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
        }
    })
    .catch(async (erreur) => {
        console.error('Erreur lors de la récupération de la météo:', erreur);
        testerUrlAPIEtReloadSiDisponible(url, 1000, response => response.ok);
        const reponseEl = document.getElementById('reponse');
        await hideLoader()
        reponseEl.style.textAlign = 'center';
        reponseEl.textContent = "L'API météo est indisponible.";

    })
}


// API BIGDATACLOUD

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

        const infosVille = {
            ville: ville,
            pays: pays,
            codePostal: codePostal,
            region: region
        };

        // Retourner les informations de la ville
        return infosVille;
    })
    .catch(async (erreur) => {

        console.error('Erreur lors de la récupération de la ville:', erreur);

        const reponseEl = document.getElementById('reponse');
        await hideLoader()
        reponseEl.style.textAlign = 'center';
        reponseEl.textContent = "L'API de géolocalisation n'a pas pu trouver votre ville.";

        testerUrlAPIEtReloadSiDisponible(url, 1000, response => response.ok);


        return null;
    });
}


// FONCTION D'INITIALISATION DU PARCOURS

async function creerParcoursPersonnalise() {

    // Obtenir les coordonnées GPS

    const coordonnesGPS = await obtenirCoordonneesGps()

    if (coordonnesGPS) {

        // Obtenir les informations de la ville

        const latitude = coordonnesGPS.coords.latitude;
        const longitude = coordonnesGPS.coords.longitude;

        const donneesVille = await obtenirVilleLaPlusProche(latitude, longitude)

        if (donneesVille) {

            // Obtenir les informations météorologiques
            
            const donneesMeteo = await obtenirDonneesMeteo(latitude, longitude)

            if (donneesMeteo) {
                const result = { donneesVille, donneesMeteo };

                // Lancer la requête API de l'IA

                envoyerRequeteIA(result);
            }

        }

    }

}

// API OLLAMA

async function envoyerRequeteIA(inputObject) {

    const url = 'https://ollama.maxbraudel.com/api/generate';

    // Afficher des messages pendant le chargement

    showLoader(2)
    const alertFirstTimeOut = setTimeout(() => {
        showAlert('Génération de votre parcours')
    }, 3000)

    const alertSecondTimeOut = setTimeout(() => {
        showAlert('Cela peut prendre un moment')
    }, 10000)

    const alertThirdTimeOut = setTimeout(() => {
        showAlert('Encore un peu de patience 😢')
    }, 20000)

    const alertFourthTimeOut = setTimeout(() => {
        showAlert(`L'IA charge le modèle dans la RAM 🥵`)
    }, 25000)

    const donneesVille = inputObject.donneesVille
    const donneesMeteo = inputObject.donneesMeteo

    // Convertir tous les nombres avec séparateur de virgule (format francophone)
    donneesMeteo.temperature = donneesMeteo.temperature.toString().replace('.', ',')
    donneesMeteo.humidity = donneesMeteo.humidity.toString().replace('.', ',')
    donneesMeteo.windSpeed = donneesMeteo.windSpeed.toString().replace('.', ',')

    // Template du prompt envoyé à l'IA
    const message = `
        Que peut-on faire dans la ville de ${donneesVille.ville} et ses alentours ?.
        Tu dois proposer un parcours adapté aux conditions météorologiques du jour.
        Information météorologiques : température : ${donneesMeteo.temperature}°C, humidité : ${donneesMeteo.humidity}%, vent : ${donneesMeteo.windSpeed}km/h.
        Informations sur la ville : code postal : ${donneesVille.codePostal}, région : ${donneesVille.region}, pays : ${donneesVille.pays}.
        Commence à introduire la ville en une phrase et la météo du jour, puis rédige une liste ordonnée d'activités détaillées que l'on peut faire d'après les données météo, en lien avec des lieux connus propres à la ville ou à ses alentours..
        Utilise la virgule plutôt que le point pour marquer les décimales dans les chiffres.
        Exemple de notation interdite pour un nombre : 1.4
        Exemple de notation autorisée pour un nombre : 1,4
        Ajoute un emoji au tout début de chaque activité dans la liste. 
        Les emojis doivent être variés et illustrent les activités.
        Modèle de paragraphe dans la liste : {numéro}. {emoji} {nom de l'activité} : {description détaillée}. 
        Exemple : 1. 🏃‍♂️ Jogger : {description détaillée}.
    `;

    // Partie claire de la réponse
    const reponseEl = document.getElementById('reponse');
    // Partie floutée et sombre de la réponse
    const reponseBackEl = document.getElementById('reponse-back');

    try {
        const reponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3.2-vision:latest',
                prompt: message,
                stream: true,
                reset_context: true
            })
        });

        // Supprimer les timeouts de messages
        clearTimeout(alertFirstTimeOut)
        clearTimeout(alertSecondTimeOut)
        clearTimeout(alertThirdTimeOut)
        clearTimeout(alertFourthTimeOut)
        await hideLoader()
        scrollEnBas();

        // Streamer la réponse
        const reader = reponse.body.getReader();
        const decoder = new TextDecoder();

        reponseEl.classList.add('justify-text');

        // Créer un pointeur à côté du dernier mot généré
        const pointeurIconElement = `
            <img class="pointeur no-select" src="./img/pointeur.png">
        `

        // Remplacer chaque tiret "-" par un tiret suivi du mot-joineur "\u2060" pour que le nom de la ville soit affiché en une fois
        function lierLesTiretsDansUnString(input) {
            return input.replace(/-/g, '-\u2060');
        }

        // Générer le début du contenu de la réponse
        const baseContent = `<div class="titre no-select">Quelques idées de parcours à ${lierLesTiretsDansUnString(donneesVille.ville)}</div>${pointeurIconElement}`

        reponseEl.innerHTML = baseContent
        reponseBackEl.innerHTML = baseContent

        let wordsArray = []
        let shadowWordsArray = []

        while (true) {

            const allPointers = document.querySelectorAll('.pointeur')

            // Ajouter l'animation d'apparition aux pointeurs (celui sur la partie claire et celui sur la partie floutée)
            allPointers.forEach(pointeur => {
                if (!pointeur.classList.contains('pointeur-animation')) {
                    pointeur.classList.add('pointeur-animation')
                }
            })

            // Lorsque la génération de la réponse est terminée, supprimer les pointeurs
            const { done, value } = await reader.read();
            if (done) {
                
                allPointers.forEach(pointeur => {
                    pointeur.classList.remove('pointeur-animation')

                    setTimeout(() => {
                        pointeur.remove()
                    }, 1000)

                })
                
                break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                // Tester si l'utilisateur est au bas de la page
                const isUserAtBottom = verfiierSiUtilisateurScrollEnBas();

                try {
                    const parsedLine = JSON.parse(line);
                    if (parsedLine.response) {

                        const newSpan = document.createElement('span');
                        newSpan.classList.add('word');
                        const newShadowSpan = newSpan.cloneNode(true);

                        let newWord = parsedLine.response;

                        // Supprimer le caractère * s'il est présent dans un token (l'IA a tendence a générer du contenu markdown mais je ne le prends pas en compte)

                        newWord = newWord.replace(/\*/g, '')

                        // On supprime les indications de sexe des tokens qui contiennent des emojis

                        if (newWord === '♂' || newWord === '♀') {
                            newWord = '';
                        }

                        // Si le nouveau mot est un point et que le dernier mot est un nombre, ajouter un retour à la ligne avant (pour afficher de belles listes)
                        if (wordsArray && wordsArray.length > 0 && newWord === '.') {

                            const lastWordElement = wordsArray[wordsArray.length - 1];
                            const lastLastLastWordElement = wordsArray[wordsArray.length - 3] || null;
                            const lastShadowWordElement = shadowWordsArray[shadowWordsArray.length - 1];

                            if (lastWordElement.textContent.match(/^\d/) && (lastLastLastWordElement === null || !lastLastLastWordElement.textContent.match(/^\d/))) {
                                // ajouter une balise br avant le dernier mot
                                const br = document.createElement('br');
                                const span = document.createElement('span');
                                span.classList.add('indent');

                                const brShadow = br.cloneNode(true);
                                const spanShadow = span.cloneNode(true);
                                
                                if (wordsArray.length > 2) {
                                    lastWordElement.parentNode.insertBefore(br, lastWordElement);
                                    lastShadowWordElement.parentNode.insertBefore(brShadow, lastShadowWordElement);
                                }
                                lastWordElement.parentNode.insertBefore(span, lastWordElement);
                                lastShadowWordElement.parentNode.insertBefore(spanShadow, lastShadowWordElement);
                            }
                        }

                        // add the last word to lastWord array
                        wordsArray.push(newSpan)
                        shadowWordsArray.push(newShadowSpan)

                        newSpan.innerHTML = newWord;
                        newShadowSpan.innerHTML = newWord;

                        // Ajouter le nouveau mot au contenu de la réponse (sur la partie claire et sur la partie floutée)
                        reponseEl.insertBefore(newSpan, reponseEl.querySelector('.pointeur'))
                        reponseBackEl.insertBefore(newShadowSpan, reponseBackEl.querySelector('.pointeur'))


                        // FONCTION POUR DÉTECTER LES EMOJIS
                        function containsEmoji(text) {
                            const emojiRegex = /^(?:[\u2700-\u27bf]|(?:[\ud83c\udde6-\ud83c\uddff]){2}|[\ud800\udc00-\udbff\udfff]|[\u2600-\u26FF\u2700-\u27BF]|(?:[\ud83d\udc00-\ud83d\ude4f]|[\ud83d\ude80-\ud83d\udeff]|[\u2600-\u26ff]|[\u2700-\u27bf]|\ud83c[\udde0-\ud83c\uddff])+)$/u;
                            
                            return emojiRegex.test(text.trim());
                        }

                        if (containsEmoji(newWord) === true) {
                            // Afficher un gros emoji flouté à côté de l'emoji existant sur le paragraphe clair
                            const bigEmojiElement = document.createElement('span');
                            bigEmojiElement.textContent = newWord;
                            bigEmojiElement.classList.add('big-emoji');
                            bigEmojiElement.classList.add('no-select');
                            bigEmojiElement.style.left = "-300px";
                            bigEmojiElement.style.transform = `rotate(${Math.random() * 120 - 60}deg)`;

                            newSpan.appendChild(bigEmojiElement);
                        }

                        // Ajouter l'animation d'apparition aux nouveaux mots
                        setTimeout(() => {
                            const allWords = document.querySelectorAll('.word')
                            allWords.forEach(word => {
                                word.classList.add('word-animation')
                            })
                        }, 1)
                    }
                } catch (parseError) {

                    // Il se peut que le token ne soit pas valide, donc on affiche une erreur sur la page 
                    // mais ça ne pose pas de problème, le génération peut continuer
                    console.error('Erreur lors du fetch du token IA:', parseError);
                    
                    // On cache le pointer (il sera réafficher quand le prochain token valide sera généré)
                    allPointers.forEach(pointeur => {
                        pointeur.classList.remove('pointeur-animation')    
                    })

                } finally {
                    if (isUserAtBottom) {
                        scrollEnBas();
                    } else {
                        // stopper le mouvement de scroll en cours
                        window.scrollTo({
                            top: window.scrollY,
                            left: window.scrollX,
                            behavior: "instant" 
                        });

                        // afficher la scrollbar
                        document.querySelector('html').classList.remove('disable-scroll');
                    }
                }
            }
        }
    } catch (erreur) {
        console.error('Erreur lors du fetch:', erreur);
        clearTimeout(alertFirstTimeOut)
        clearTimeout(alertSecondTimeOut)
        clearTimeout(alertThirdTimeOut)
        clearTimeout(alertFourthTimeOut)
        await hideLoader()
        reponseEl.innerHTML = "L'API Ollama est inaccessible, veuillez réessayer plus tard.";
        testerUrlAPIEtReloadSiDisponible(url, 1000, response => response.body.getReader());
        reponseEl.classList.remove('justify-text');
        reponseEl.style.textAlign = 'center';
        reponseBackEl.innerHTML = "";
    }
}

// FONCTIONS DE SCROLL AUTO

let displayScrollTimeout

function scrollEnBas() {

    // supprimer le timeout d'affichage de la scrollbar car elle doit encore être cachée
    clearTimeout(displayScrollTimeout);
    document.querySelector('html').classList.add('disable-scroll');

    // Scroller jusqu'au bas de la page
    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
    });

    // afficher la scrollbar au bout de 1 seconde
    displayScrollTimeout = setTimeout(() => {
        document.querySelector('html').classList.remove('disable-scroll');
    }, 1000);
}

function verfiierSiUtilisateurScrollEnBas() {
    // Tester si l'utilisateur est au bas de la page
    const scrollPosition = window.scrollY + window.innerHeight;
    // La valeur de threshold est calculée en fonction de la taille de la scrollbar
    const threshold = 15; 
    const bottomPosition = document.documentElement.scrollHeight;

    return scrollPosition >= bottomPosition - threshold;
}

// INITILISATION DU PARCOURS APRES LE DOM CHARGÉ

document.addEventListener('DOMContentLoaded', () => {
    showLoader(1)
    creerParcoursPersonnalise()
})