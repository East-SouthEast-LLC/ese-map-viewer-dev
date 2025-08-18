// src/js/components/skeleton.js

(function() {
    'use strict';

    /**
     * immediately adds the 'is-loading' class to the body to ensure the skeleton screen is visible
     * and the main content is hidden right from the start. this runs as soon as the script is loaded.
     */
    function showSkeleton() {
        document.body.classList.add('is-loading');
    }

    /**
     * initiates the fade-out of the skeleton screen and reveals the main application content.
     * this function is designed to be called once the map and all its layers are fully loaded.
     */
    function hideSkeleton() {
        const skeleton = document.getElementById('skeleton-loader');
        if (!skeleton) {
            console.error('skeleton loader element not found.');
            // if the skeleton isn't there, just ensure the body class is removed
            document.body.classList.remove('is-loading');
            return;
        }

        // add the fade-out class to trigger the css transition
        skeleton.classList.add('fade-out');

        // wait for the fade-out animation to complete before hiding the element entirely
        // this duration should match the css transition time (0.5s)
        setTimeout(() => {
            document.body.classList.remove('is-loading');
            skeleton.style.display = 'none';
        }, 500);
    }

    // run the show function immediately on script load
    showSkeleton();

    // attach the hide function to the window object to make it globally accessible from main.js
    window.hideSkeleton = hideSkeleton;

})();