//Supprimer le filigrane

const loopToRemoveWatermark = setInterval(() => {
    
    if (document.querySelector('spline-viewer')) {

        const customTag = document.querySelector('spline-viewer');
        const shadowRoot = customTag.shadowRoot;

        const logo = shadowRoot.querySelector('#logo');
        if (logo) {
            logo.remove();
            clearInterval(loopToRemoveWatermark);
        }

    }

}, 1);