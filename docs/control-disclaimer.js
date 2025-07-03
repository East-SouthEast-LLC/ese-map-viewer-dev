// docs/control-disclaimer.js
document.addEventListener('DOMContentLoaded', () => {
    const disclaimerPopup = document.getElementById('disclaimer-popup');
    const closeButton = document.getElementById('close-disclaimer-btn');

    // First, check if the required HTML elements for the popup exist on the page.
    if (!disclaimerPopup || !closeButton) {
        // If they don't, stop the script to avoid errors.
        return;
    }

    /**
     * Hides the disclaimer popup and sets a flag in sessionStorage
     * to keep it hidden for the duration of the user's session.
     */
    const closeDisclaimer = () => {
        disclaimerPopup.style.display = 'none';
        sessionStorage.setItem('eseDisclaimerClosed', 'true');
    };

    // Attach an event listener to the close button to hide the popup when clicked.
    closeButton.addEventListener('click', closeDisclaimer);

    // When the page loads, check if the user has already closed the disclaimer in this session.
    if (sessionStorage.getItem('eseDisclaimerClosed') === 'true') {
        // If they have, keep the popup hidden.
        disclaimerPopup.style.display = 'none';
    }
});