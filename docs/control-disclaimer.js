// docs/control-disclaimer.js
document.addEventListener('DOMContentLoaded', () => {
    const disclaimerPopup = document.getElementById('disclaimer-popup');
    const closeButton = document.getElementById('close-disclaimer-btn');

    if (!disclaimerPopup || !closeButton) {
        return;
    }

    /**
     * Hides the disclaimer popup by removing the 'show' class
     * and sets a flag in sessionStorage.
     */
    const closeDisclaimer = () => {
        disclaimerPopup.classList.remove('show');
        sessionStorage.setItem('eseDisclaimerClosed', 'true');
    };

    // Attach an event listener to the close button.
    closeButton.addEventListener('click', closeDisclaimer);

    /**
     * REVISED LOGIC:
     * Check if the popup has been closed during the current session.
     * If it has NOT been closed, add the 'show' class to make it visible.
     */
    if (sessionStorage.getItem('eseDisclaimerClosed') !== 'true') {
        // We use a short timeout to let the main map interface load first,
        // then we fade in the popup for a smoother user experience.
        setTimeout(() => {
            disclaimerPopup.classList.add('show');
        }, 500); // 0.5-second delay before showing
    }
});