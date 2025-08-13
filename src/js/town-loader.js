// src/js/town-loader.js

(function() {
    /**
     * dynamically injects the body html structure and application scripts for the map viewer.
     */
    function initializeMapViewer() {
        const thisScript = document.querySelector('script[src*="town-loader.js"]');
        const townId = thisScript.getAttribute('data-town-id');

        if (!townId) {
            console.error("town id is not defined in the script tag.");
            document.body.innerHTML = '<p style="color: red; text-align: center; margin-top: 50px;">error: town id is missing.</p>';
            return;
        }
        window.townId = townId;

        // --- build the <body> content ---
        document.body.innerHTML = `
            <div id="disclaimer-popup" class="disclaimer-popup-container">
                <h2>Welcome to the ESE Map Viewer</h2>
                <p class="disclaimer-text">
                    this map is for illustrative purposes only and is not adequate for legal boundary determination, regulatory interpretation, or property conveyance. for official information, please consult the appropriate municipal and state agencies. for any questions regarding property lines, a licensed land surveyor should be consulted.
                </p>
                <div class="disclaimer-actions">
                  <a href="https://www.ese-llc.com/map-viewer-instructions" target="_blank" class="disclaimer-link disclaimer-btn">View Full Instructions</a>
                  <button id="acknowledge-disclaimer-btn" class="disclaimer-button-red disclaimer-btn">Acknowledge</button>
                </div>
            </div>
            <div id="ad-container-vertical">
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"><\/script>
                <ins class="adsbygoogle" style="display:inline-block;width:120px;height:728px" data-ad-client="ca-pub-5235492504361528" data-ad-slot="4276954452"></ins>
                <script>
                     (adsbygoogle = window.adsbygoogle || []).push({});
                <\/script>
            </div>
            <nav id="menu"></nav>
            <button id="hamburger-button" aria-label="Toggle Menu"> &#9776; </button>
            <div id="map"></div>
            <div id="geocoder-container">
                <div id="geocoder" data-tooltip="Search for a location"></div>
                <div> 
                  <button class="mapboxgl-ctrl-point" id="pointButton" aria-label="Point" data-tooltip="Drop a point on the map"></button>
                  <button class="mapboxgl-ctrl-print" id="printButton" aria-label="Print" data-tooltip="Print map"></button>
                  <button class="mapboxgl-ctrl-measure" id="distanceButton" aria-label="Measure" data-tooltip="Measure distances (on/off)"></button>
                  <button class="mapboxgl-ctrl-legend" id="legendButton" aria-label="Legend" data-tooltip="Show/Hide Legend"></button>
                  <button class="mapboxgl-ctrl-bookmark" id="bookmarkButton" aria-label="Bookmarks" data-tooltip="Save or load map views"></button>
                </div>
                <div> 
                  <button class="mapboxgl-ctrl-point-center" id="pointCButton" aria-label="Point Center" data-tooltip="Center the point or centerpoint"></button>
                  <button class="mapboxgl-ctrl-parea" id="pareaButton" aria-label="Print Area" data-tooltip="Print Area"></button>
                  <button class="mapboxgl-ctrl-identify" id="identifyButton" aria-label="Identify" data-tooltip="Identify all features at a point"></button>
                  <button class="mapboxgl-ctrl-four" id="fourButton" aria-label="four" data-tooltip="Placeholder"></button>
                  <button class="mapboxgl-ctrl-sZoom" id="scaleZoom" aria-label="Zoom to Scale" data-tooltip="Zoom to Scale"></button>
                </div>
                <div> 
                  <button class="mapboxgl-ctrl-point-off" id="pointOffButton" aria-label="Point Off" data-tooltip="Remove the point from the map"></button>
                  <button class="mapboxgl-ctrl-custom-print" id="customPrintButton" aria-label="Custom Print" data-tooltip="Create a custom multi-page printout"></button>
                  <button class="mapboxgl-ctrl-clear" id="clearButton" aria-label="eight" data-tooltip="Clear measurements"></button>
                  <button class="mapboxgl-ctrl-nine" id="nineButton" aria-label="nine" data-tooltip="Placeholder"></button>
                  <button class="mapboxgl-ctrl-ten" id="tenButton" aria-label="ten" data-tooltip="Placeholder"></button>
                </div>
                <button class="mapboxgl-ctrl-share" id="shareButton" data-tooltip="Share the map with a URL">Share Map</button>
                <div id="distance-display"></div>
                <div id="scale-box"></div>
                <div id="legend-box"></div>
                <div id="custom-print-box"></div>
                <div id="bookmark-box"></div>
                <div id="identify-box"></div>
            </div>
        `;

        // --- dynamically load all other scripts ---
        const scripts = [
            "https://east-southeast-llc.github.io/ese-map-viewer-dev/src/js/main.js",
            "https://east-southeast-llc.github.io/ese-map-viewer-dev/src/js/components/control/button.js",
            "https://east-southeast-llc.github.io/ese-map-viewer-dev/src/js/components/control/print.js",
            "https://east-southeast-llc.github.io/ese-map-viewer-dev/src/js/components/control/custom-print.js",
            "https://east-southeast-llc.github.io/ese-map-viewer-dev/src/js/components/control/print-area.js",
            "https://east-southeast-llc.github.io/ese-map-viewer-dev/src/js/components/control/share.js",
            "https://east-southeast-llc.github.io/ese-map-viewer-dev/src/js/components/control/scale.js",
            "https://east-southeast-llc.github.io/ese-map-viewer-dev/src/js/components/control/measure.js",
            "https://east-southeast-llc.github.io/ese-map-viewer-dev/src/js/components/control/legend.js",
            "https://east-southeast-llc.github.io/ese-map-viewer-dev/src/js/components/control/bookmarks.js",
            "https://east-southeast-llc.github.io/ese-map-viewer-dev/src/js/components/control/identify.js",
            "https://east-southeast-llc.github.io/ese-map-viewer-dev/src/js/components/disclaimer-popup.js",
            "https://east-southeast-llc.github.io/ese-map-viewer-dev/src/js/utils/analytics.js",
            "https://east-southeast-llc.github.io/ese-map-viewer-dev/src/js/components/mobile-menu.js",
            "https://east-southeast-llc.github.io/ese-map-viewer-dev/src/js/utils/decode-url.js"
        ];
        
        scripts.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.defer = true;
            document.body.appendChild(script);
        });
    }

    // since the loader script itself is deferred, the dom is ready when it runs.
    initializeMapViewer();

})();