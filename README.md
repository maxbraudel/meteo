# Compte Rendu
#### Max Braudel - Lou Gardet - Marie Blanchard

**[weatherforyou.maxbraudel.com](https://weatherforyou.maxbraudel.com)**


☀️ “Weather for you” est un site où vous pouvez consulter la météo et avoir des propositions d’activités en fonction de votre localisation actuelle.

## Choix d’architecture

Notre site se divise en 3 pages 
- ```index.html``` : explique le concept et redirige l’utilisateur vers les autres pages
- ```la-météo.html``` : affiche les informations météo selon les coordonnées GSP de l’utilisateur
- ```ma-ville.html``` : affiche un parcours personnalisé selon la ville et la météo

Nous avons utilisé HTML 5, CSS 3 ainsi que JavaScript. Pour chaque language, sont répertoriés les pages correspondantes. Il y a également un fichier global en js et css car certains éléments sont présents dans les 3 pages : header, footer et quelques fonctions pratiques

Voici une vision globale de notre arborescence :

```
meteo/
├─ .gitignore
├─ css/
│  ├─ index.css
│  ├─ la-meteo.css
│  ├─ layout.css
│  └─ ma-ville.css
├─ img/
│  ├─ activtes.png
│  ├─ conditions/
│  │  ├─ day/
│  │  │  ├─ broken clouds.svg
│  │  │  ├─ clear sky.svg
│  │  │  ├─ ...
│  │  └─ night/
│  │     ├─ broken clouds.svg
│  │     ├─ clear sky.svg
│  │     ├─ ...
│  ├─ favicon.png
│  ├─ meteo.png
│  └─ soleil.png
├─ javascript/
│  ├─ index.js
│  ├─ la-meteo.js
│  ├─ layout.js
│  └─ ma-ville.js
├─ index.html
├─ la-meteo.html
└─ ma-ville.html
```

## Choix sémantiques

**Structure** :
- Utilisation de balises structurantes : ```<header>```, ```<nav>```, ```<main>```...
- Diviser le corps du site en ```<section>``` pour réduire l’utilisation des ```<div>```
- Hiérarchie des titres respectée
- Structure avec des ‘id’ pour les éléments uniques et des ‘class’ pour les éléments réutiliser
- Code commenté pour ne pas s’y perdre !

**Accessibilité** : 
- Utilisation des attributs ‘alt’ pour les images
- Utilisation des attributs ARIA (Accessible Rich Internet Applications)

## Choix techniques

Nous avons utilisés 3 APIs :
- **OpenWeatherMap** : collecter des informations météo à partir de données GSP
- **BigDataCloud** : collecter des informations sur la ville la plus proche à partir des données GSP
- **Ollama** : communication avec une IA locale hébergée localement dans un conteneur Docker (llama3.2-vision) et récupération du flux de tokens générés en continu

Nous avons implémenté des fallbacks intelligents pour chaque requête API :

On fetch l’API -> l’API est indisponible -> on affichage un message d’erreur sur la page -> on fetch à nouveau l’API à intervalle régulier jusqu’à la réception d’une réponse positive (généralement response.ok) -> on reload la page lorsque l’API est de nouveau disponible

Nous rendons le site accessible depuis un nom de domaine pour permettre au navigateur d’enregistrer les préférences de l’utilisateur en matière de localisation et ainsi éviter que la position GPS soit demandée à chaque fois :
**[weatherforyou.maxbraudel.com](https://weatherforyou.maxbraudel.com)**

## Choix esthétiques

Nous avons utilisés un canvas de Spline pour afficher une animation de nuage sur la Landing Page.

Des transitions et animations permettent d’adoucir la navigation entre les pages et de mieux gérer l’apparition du contenu après un fetch.

Des fichiers SVG ont principalement été choisi pour optimiser la qualité du rendu.