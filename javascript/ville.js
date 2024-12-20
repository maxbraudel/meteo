function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

function refreshLocalisation() {
    localStorage.setItem('position', null);
    localStorage.setItem('infosVille', null);
    localStorage.clear();
    location.reload();
}

async function obtenirLocalisation() {
    // Vérifier si la géolocalisation est supportée
    console.log(localStorage.getItem('position'))
    if  (localStorage.getItem('position') && JSON.parse(localStorage.getItem('position')).coords.latitude) {
        console.log('position trouvée dans la base de données')
        montrerPosition(JSON.parse(localStorage.getItem('position')));
        console.log(localStorage.getItem('position'))
        return;
    }
    showLoader(1)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                localStorage.setItem('position', JSON.stringify(position));
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

        localStorage.setItem('infosVille', JSON.stringify(infosVille));

        // Retourner les informations de la ville
        return infosVille;
    })
    .catch((erreur) => {
    console.error('Erreur lors du fetch:', erreur);
    return { ville: null, country: null, postCode: null, region: null };
    });
}

async function montrerPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    if (localStorage.getItem('infosVille') && JSON.parse(localStorage.getItem('infosVille')).ville) {
        console.log('infosVille trouvée dans la base de données')
        envoyerRequeteApi(JSON.parse(localStorage.getItem('infosVille')));
        return;
    }

    obtenirVilleLaPlusProche(latitude, longitude).then((result) => {
        if (result.ville && result.pays && result.codePostal && result.region) {
            envoyerRequeteApi(result);
        } else {
            const reponseEl = document.getElementById('reponse');
            reponseEl.textContent = "L'API de géolocalisation n'a pas pu trouver votre ville.";
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
document.addEventListener('DOMContentLoaded', obtenirLocalisation);        

async function envoyerRequeteApi(inputObject) {

    showLoader(2)
    showAlert('Génération de votre parcours')

    const alertTimeOut = setTimeout(() => {
        showAlert('Cela peut prendre un moment')
    }, 10000)

    // const message = `Que peut-on faire dans la ville de ${inputObject.ville} et ses alentours ? Voici quelques informations supplémentaire sur la ville : code postal : ${inputObject.codePostal}, région : ${inputObject.region}, pays : ${inputObject.pays}. (emojis)`;
    const message = `
        Que peut-on faire dans la ville de ${inputObject.ville} et ses alentours ?.
        Informations sur la ville : code postal : ${inputObject.codePostal}, région : ${inputObject.region}, pays : ${inputObject.pays}.
        Commence à introduire la ville en une phrase puis rédige une liste ordonnée d'activités détaillées en lien avec des lieux connus propres à la ville ou à ses alentours..
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

        clearTimeout(alertTimeOut)
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
        const baseContent = `<div class="titre no-select">Quelques idées de parcours à ${lierLesTiretsDansUnString(inputObject.ville)}</div>${pointeurIconElement}`

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
                    // Parse le JSON de la réponse
                    console.log(line)

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
                    console.error('Erreur lors du fetch:', parseError);
                                            
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
        await hideLoader()
        reponseEl.innerHTML = "L'API est inacessible, veuillez réessayer plus tard.";
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