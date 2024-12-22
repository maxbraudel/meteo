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

async function obtenirLocalisation() {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // montrer un nouveau loader pendant la géolocalisation
                montrerPosition(position);
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

async function getWeatherByCoordinates(lat, lon) {
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


        return { ville: null, country: null, postCode: null, region: null };
    });
}

async function montrerPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    obtenirVilleLaPlusProche(latitude, longitude).then((localizationDatas) => {
        if (localizationDatas.ville && localizationDatas.pays && localizationDatas.codePostal && localizationDatas.region) {
            getWeatherByCoordinates(latitude, longitude).then((weathersDatas) => {

                if (weathersDatas) {
                    const result = { localizationDatas, weathersDatas };
                    envoyerRequeteApi(result);
                }

            })
        }
    });

}

async function montrerErreursGeolocalisation(erreur) {
    const reponseEl = document.getElementById('reponse');
    // Handle error cases
    switch (erreur.code) {
        case erreur.PERMISSION_DENIED:
            await hideLoader()
            reponseEl.textContent = "Vous devez autoriser la géolocalisation pour connaitre votre parcours.";
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

// si le dom est chargé on lance la géolocalisation
document.addEventListener('DOMContentLoaded', () => {
    showLoader(1)
    obtenirLocalisation()
})

async function envoyerRequeteApi(inputObject) {

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
        showAlert('🥵')
    }, 25000)

    const localizationDatas = inputObject.localizationDatas
    const weathersDatas = inputObject.weathersDatas

    // convert all numbers to string with comma separator
    weathersDatas.temperature = weathersDatas.temperature.toString().replace('.', ',')
    weathersDatas.humidity = weathersDatas.humidity.toString().replace('.', ',')
    weathersDatas.windSpeed = weathersDatas.windSpeed.toString().replace('.', ',')

    // const message = `Que peut-on faire dans la ville de ${inputObject.ville} et ses alentours ? Voici quelques informations supplémentaire sur la ville : code postal : ${inputObject.codePostal}, région : ${inputObject.region}, pays : ${inputObject.pays}. (emojis)`;
    const message = `
        Que peut-on faire dans la ville de ${localizationDatas.ville} et ses alentours ?.
        Tu dois proposer un parcours adapté aux conditions météorologiques du jour.
        Information météorologiques : température : ${weathersDatas.temperature}°C, humidité : ${weathersDatas.humidity}%, vent : ${weathersDatas.windSpeed}km/h.
        Informations sur la ville : code postal : ${localizationDatas.codePostal}, région : ${localizationDatas.region}, pays : ${localizationDatas.pays}.
        Commence à introduire la ville en une phrase et la météo du jour, puis rédige une liste ordonnée d'activités détaillées que l'on peut faire d'après les données météo, en lien avec des lieux connus propres à la ville ou à ses alentours..
        Utilise la virgule plutôt que le point pour marquer les décimales dans les chiffres.
        Exemple de notation interdite pour un nombre : 1.4
        Exemple de notation autorisée pour un nombre : 1,4
        Ajoute un emoji au tout début de chaque activité dans la liste. 
        Les emojis doivent être variés et illustrent les activités.
        Modèle de paragraphe dans la liste : {numéro}. {emoji} {nom de l'activité} : {description détaillée}. 
        Exemple : 1. 🏃‍♂️ Jogger : {description détaillée}.
    `;

    const reponseEl = document.getElementById('reponse');
    const reponseBackEl = document.getElementById('reponse-back');

    try {
        const reponse = await fetch('https://ollama.maxbraudel.com/api/generate', {
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

        clearTimeout(alertFirstTimeOut)
        clearTimeout(alertSecondTimeOut)
        clearTimeout(alertThirdTimeOut)
        clearTimeout(alertFourthTimeOut)
        await hideLoader()
        scrollToBottom();

        // Streamer la réponse
        const reader = reponse.body.getReader();
        const decoder = new TextDecoder();
        let reponseComplete = '';

        reponseEl.classList.add('justify-text');

        const pointeurIconElement = `
            <img class="pointeur no-select" src="https://s3-alpha-sig.figma.com/img/cbae/6d24/89985c6fa0c99d2e33f7e705ad894935?Expires=1735516800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=qgKjsTz-mAcgYLXc70oB~eYmJxklVP1lZN98tcCvw326pgp4gtmnCUSJy68veYAXEWfSeiqDbDlQ69ps~NwHx69XIcb3zmu5mCM2oQX4f2BZjC1GJ3-MKo3dPClZe8gh8YGpx9Xhu6J6kC4gNcOylN3U5KF98ZubYWIJ0KXTCpQMZrvuAMwzUPOUsuFxYKLhu72uqLII3GSk95~TczKGfwIktjAHVTV653zKEE6uvvZ1WIeRFUnbc~f2dbJBYLKpLiRuFaJ2-qvC28HFtyNyBfHPOAsVBW8KWc4dt5z7MqEmhptqDzxlMv80Lpeb8~jIBt7z~QcwVRDbv0ww2lr~Ng__">
        `
        function lierLesTiretsDansUnString(input) {
            // Replace every hyphen "-" with a hyphen followed by the WORD JOINER "\u2060"
            return input.replace(/-/g, '-\u2060');
        }
        const baseContent = `<div class="titre no-select">Quelques idées de parcours à ${lierLesTiretsDansUnString(localizationDatas.ville)}</div>${pointeurIconElement}`

        reponseEl.innerHTML = baseContent
        reponseBackEl.innerHTML = baseContent

        setTimeout(() => {
            const allpointeurs = document.querySelectorAll('.pointeur')
            allpointeurs.forEach(pointeur => {
                pointeur.classList.add('pointeur-animation')
            })
        }, 1)

        let wordsArray = []
        let shadowWordsArray = []

        while (true) {

            const allPointers = document.querySelectorAll('.pointeur')

            allPointers.forEach(pointeur => {
                if (!pointeur.classList.contains('pointeur-animation')) {
                    pointeur.classList.add('pointeur-animation')
                }
            })

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

            document.querySelector('.pointeur').classList.add('pointeur-animation');

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                // Tester si l'utilisateur est au bas de la page
                const isUserAtBottom = testIfUserIsAtBottom();

                try {

                    const parsedLine = JSON.parse(line);
                    if (parsedLine.response) {

                        const newSpan = document.createElement('span');
                        newSpan.classList.add('word');
                        const newShadowSpan = newSpan.cloneNode(true);

                        let newWord = parsedLine.response;

                        newWord = newWord.replace(/\*/g, '')

                        if (newWord === '♂' || newWord === '♀') {
                            newWord = '';
                        }

                        function containsEmoji(text) {
                            const emojiRegex = /^(?:[\u2700-\u27bf]|(?:[\ud83c\udde6-\ud83c\uddff]){2}|[\ud800\udc00-\udbff\udfff]|[\u2600-\u26FF\u2700-\u27BF]|(?:[\ud83d\udc00-\ud83d\ude4f]|[\ud83d\ude80-\ud83d\udeff]|[\u2600-\u26ff]|[\u2700-\u27bf]|\ud83c[\udde0-\ud83c\uddff])+)$/u;
                            
                            return emojiRegex.test(text.trim());
                        }


                        // if the new word is a dot and the last word is a number add a br before
                        if (wordsArray && wordsArray.length > 0 && newWord === '.') {

                            const lastWordElement = wordsArray[wordsArray.length - 1];
                            const lastLastLastWordElement = wordsArray[wordsArray.length - 3] || null;

                            const lastShadowWordElement = shadowWordsArray[shadowWordsArray.length - 1];

                            if (lastWordElement.textContent.match(/^\d/) && (lastLastLastWordElement === null || !lastLastLastWordElement.textContent.match(/^\d/))) {
                                // add a br before last word element
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

                        

                        reponseEl.insertBefore(newSpan, reponseEl.querySelector('.pointeur'))
                        reponseBackEl.insertBefore(newShadowSpan, reponseBackEl.querySelector('.pointeur'))


                        if (containsEmoji(newWord) === true) {
                            // log the coordinates of reponseEl

                            const bigEmojiElement = document.createElement('span');
                            bigEmojiElement.textContent = newWord;
                            bigEmojiElement.classList.add('big-emoji');
                            bigEmojiElement.classList.add('no-select');
                            bigEmojiElement.style.left = "-300px";
                            bigEmojiElement.style.transform = `rotate(${Math.random() * 120 - 60}deg)`;

                            newSpan.appendChild(bigEmojiElement);
                        }

                        setTimeout(() => {
                            const allWords = document.querySelectorAll('.word')
                            allWords.forEach(word => {
                                word.classList.add('word-animation')
                            })
                        }, 1)
                    }
                } catch (parseError) {
                    console.error('Erreur lors du fetch du token IA:', parseError);
                                            
                    allPointers.forEach(pointeur => {
                        pointeur.classList.remove('pointeur-animation')    
                    })

                } finally {
                    if (isUserAtBottom) {
                        scrollToBottom();
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
        reponseEl.innerHTML = "L'API Ollama est inacessible, veuillez réessayer plus tard.";
        testerUrlAPIEtReloadSiDisponible('https://ollama.maxbraudel.com/api/generate', 1000, response => response.body.getReader());
        reponseEl.classList.remove('justify-text');
        reponseEl.style.textAlign = 'center';
        reponseBackEl.innerHTML = "";
    }
}

let displayScrollTimeout

function scrollToBottom() {

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

function testIfUserIsAtBottom() {
    // Tester si l'utilisateur est au bas de la page
    const scrollPosition = window.scrollY + window.innerHeight;
    // La valeur de threshold est calculée en fonction de la taille de la scrollbar
    const threshold = 15; 
    const bottomPosition = document.documentElement.scrollHeight;

    return scrollPosition >= bottomPosition - threshold;
}