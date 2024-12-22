// Supprimer le logo Spline du canvas

document.addEventListener('DOMContentLoaded', () => {
    const loopToRemoveWatermark = setInterval(() => {
        
        if (document.querySelector('spline-viewer')) {

            const customTag = document.querySelector('spline-viewer');
            const shadowRoot = customTag.shadowRoot;

            if (shadowRoot.querySelector('#logo')) {
                const logo = shadowRoot.querySelector('#logo');
                logo.remove();
                clearInterval(loopToRemoveWatermark);
            }

        }

    }, 1);
})