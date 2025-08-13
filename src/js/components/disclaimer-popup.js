// In docs/control-disclaimer.js

const disclaimerPopup = document.getElementById('disclaimer-popup');
// Update the script to find the new button by its ID
const acknowledgeButton = document.getElementById('acknowledge-disclaimer-btn');

if (!disclaimerPopup || !acknowledgeButton) {
    console.error("Required elements not found in the DOM");
} else {
    /**
     * Hides the disclaimer popup by removing the 'show' class
     * and sets a flag in sessionStorage.
     */
    const closeDisclaimer = () => {
        disclaimerPopup.classList.remove('show');
        sessionStorage.setItem('eseDisclaimerClosed', 'true');
    };

    // Attach the event listener to the new "Acknowledge" button
    acknowledgeButton.addEventListener('click', closeDisclaimer);

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
};