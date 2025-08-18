// src/js/components/skeleton.js

(function() {
    'use strict';

    /**
     * adds the 'is-loading' class and then starts checking for the header
     * to correctly position the skeleton loader.
     */
    function showSkeleton() {
        console.log('skeleton.js: script loaded. adding is-loading class.');
        document.body.classList.add('is-loading');

        const skeleton = document.getElementById('skeleton-loader');
        if (!skeleton) return;

        let headerCheckCount = 0;
        const maxHeaderChecks = 50; // stop checking after 2.5 seconds (50 * 50ms)

        // we need to wait for the squarespace header to be added to the dom.
        // this interval will check for it every 50ms.
        const headerInterval = setInterval(() => {
            const header = document.querySelector('#header');
            headerCheckCount++;

            // check if the header exists and has a rendered height
            if (header && header.offsetHeight > 0) {
                console.log(`skeleton.js: found header after ${headerCheckCount} checks. adjusting layout.`);
                const headerHeight = header.offsetHeight;
                skeleton.style.top = `${headerHeight}px`;
                skeleton.style.height = `calc(100vh - ${headerHeight}px)`;
                
                // once we've positioned it, we can stop checking.
                clearInterval(headerInterval);
            } else if (headerCheckCount > maxHeaderChecks) {
                // as a fallback, stop checking after a while to prevent an infinite loop.
                console.warn('skeleton.js: header not found after 2.5 seconds. stopping check.');
                clearInterval(headerInterval);
            }
        }, 50);
    }

    /**
     * initiates the fade-out of the skeleton screen and reveals the main application content.
     */
    function hideSkeleton() {
        const skeleton = document.getElementById('skeleton-loader');
        if (!skeleton) {
            console.error('skeleton loader element not found.');
            document.body.classList.remove('is-loading');
            return;
        }

        skeleton.classList.add('fade-out');

        setTimeout(() => {
            document.body.classList.remove('is-loading');
            skeleton.style.display = 'none';
        }, 500);
    }

    // run the show function immediately on script load.
    showSkeleton();

    // attach the hide function to the window object to make it globally accessible.
    window.hideSkeleton = hideSkeleton;

})();