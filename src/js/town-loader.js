// src/js/town-loader.js

(function() {
    // a function to dynamically create a script tag
    function loadScript(src) {
        const script = document.createElement('script');
        script.src = src;
        script.defer = true;
        document.body.appendChild(script);
    }

    // dynamically build the toolkit html
    function buildToolkit() {
        const geocoderContainer = document.createElement('div');
        geocoderContainer.id = 'geocoder-container';
        geocoderContainer.innerHTML = `
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
        `;
        document.body.appendChild(geocoderContainer);
    }

    // get the townid from the script tag's data attribute
    const thisScript = document.querySelector('script[src*="town-loader.js"]');
    const townId = thisScript.getAttribute('data-town-id');

    if (!townId) {
        console.error("Town ID is not defined. Please set it in the script tag's data-town-id attribute.");
        return;
    }

    // set the townId on the window object so main.js can access it
    window.townId = townId;

    // now that the townId is set, build the rest of the page
    document.addEventListener('DOMContentLoaded', () => {
        buildToolkit();

        // define the scripts to load
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

        // load all the scripts
        scripts.forEach(loadScript);
    });
})();