// src/js/main.js

(function() {
    // get the townid from the script tag's data attribute
    const thisScript = document.querySelector('script[src*="main.js"]');
    const townId = thisScript.getAttribute('data-town-id');
    
    if (!townId) {
        console.error("town id is not defined in the script tag's data-town-id attribute.");
        return;
    }
    window.townId = townId;

    // central state variables
    let marker = null;
    const markerCoordinates = { lat: null, lng: null };
    let placingPoint = false;
    let lastViewedPanoId = null; 

    // expose variables globally so all control scripts can use them
    window.marker = marker;
    window.markerCoordinates = markerCoordinates;
    window.placingPoint = placingPoint;
    window.lastViewedPanoId = lastViewedPanoId;
    
    /**
     * dynamically creates and appends a script tag to the body.
     * returns a promise that resolves when the script is loaded.
     * @param {string} src - the source url of the script to load.
     * @returns {promise}
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`script load error for ${src}`));
            document.body.appendChild(script);
        });
    }

    /**
     * dynamically builds the html for the toolkit and appends it to the body.
     */
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

    // --- functions from main.js ---

    function adjustLayout() {
        const header = document.querySelector('#header');
        const mapContainer = document.getElementById('map');
        const menuContainer = document.getElementById('menu');
        const geocoderContainer = document.getElementById('geocoder-container');
        if (!header || !mapContainer || !menuContainer) return;
        const headerHeight = header.offsetHeight;
        const buffer = 70;
        const topOffset = headerHeight + 40; // using your 40px buffer
        const availableHeight = window.innerHeight - headerHeight - buffer;
        mapContainer.style.height = `${availableHeight}px`;
        menuContainer.style.maxHeight = `${availableHeight}px`;
        if (geocoderContainer) {
            geocoderContainer.style.maxHeight = `${availableHeight}px`;
            geocoderContainer.style.top = `${topOffset}px`;
        }
    }

    function setupLayoutAdjustments() {
        adjustLayout();
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                adjustLayout();
                if (window.map) {
                    window.map.resize(); // tells the map to resize to its container
                }
            }, 100);
        });
    }

    // --- new: added missing marker placement function ---
    function handleMarkerPlacement(lngLat) {
        const { lat, lng } = lngLat;
        setPinPosition(lat, lng); 
        if (window.marker) window.marker.remove();
        window.marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
        window.placingPoint = false; 
        document.getElementById('pointButton').classList.remove('active');
        map.getCanvas().style.cursor = '';
        trackEvent('place_marker', {});
    }

    // --- main execution logic ---
    document.addEventListener('DOMContentLoaded', () => {
        // 1. build ui and setup layout
        buildToolkit();
        setupLayoutAdjustments();

        // 2. initialize the map and make it global
        mapboxgl.accessToken = 'pk.eyJ1IjoiZXNlLXRvaCIsImEiOiJja2Vhb24xNTEwMDgxMzFrYjVlaTVjOXkxIn0.IsPo5lOndNUc3lDLuBa1ZA';
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/ese-toh/ckh2ss32s06i119paer9mt67h',
        });
        window.map = map; // expose map globally for other scripts

        // 3. add geocoder to the ui
        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl
        });
        document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

        // 4. wait for the map to be fully loaded before doing anything else
        map.on('load', function () {
            console.log("map 'load' event fired. loading scripts...");
            
            function loadLayerScript(layerName) {
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    let scriptName = layerName.replace(/ /g, '-');
                    if (layerName === "DEP wetland") scriptName = "depwetland";
                    else if (layerName === "zone II") scriptName = "zoneii";
                    else if (layerName === "conservancy districts") scriptName = "conservancydistricts";
                    else if (layerName === "endangered species") scriptName = "endangered-species";
                    else if (layerName === "parcel highlight") scriptName = "parcel-highlight";
                    else if (layerName === "lidar contours") scriptName = "lidar-contours";
                    else if (layerName === "sewer plans") scriptName = "sewer-plans";
                    else if (layerName === "private properties upland") scriptName = "private-properties-upland";
                    else if (layerName === "usgs quad") scriptName = "usgs-tile-manager";
                    
                    script.src = `https://east-southeast-llc.github.io/ese-map-viewer/src/js/layers/${scriptName}.js?v=2`;
                    script.onload = resolve;
                    script.onerror = () => reject(new Error(`script load error for ${layerName}`));
                    document.head.appendChild(script);
                });
            }

            // start loading layer and control scripts
            loadLayerScript('towns').then(() => {
                fetch('https://east-southeast-llc.github.io/ese-map-viewer/assets/data/town_config.json')
                    .then(response => response.json())
                    .then(townConfig => {
                        const townData = townConfig.find(town => town.townID === window.townId);
                        if (townData) {
                            const urlParams = new URLSearchParams(window.location.search);
                            if (!urlParams.has('zoom')) {
                                map.setCenter(townData.map.center);
                                map.setZoom(townData.map.zoom);
                            }
                            window.eseMapBaseUrl = townData.baseShareUrl;
                            window.toggleableLayerIds = townData.layers.filter(l => l !== 'towns');
                            window.toggleableLayerIds.unshift('tools');
                            
                            const layerPromises = townData.layers.filter(l => l !== 'towns').map(layer => loadLayerScript(layer));
                            
                            Promise.all(layerPromises).then(() => {
                                console.log("all layer scripts loaded.");
                                
                                // now that layers are ready, load control scripts
                                const controlScripts = [
                                    "https://east-southeast-llc.github.io/ese-map-viewer/src/js/components/control/button.js",
                                    "https://east-southeast-llc.github.io/ese-map-viewer/src/js/components/control/print.js",
                                    "https://east-southeast-llc.github.io/ese-map-viewer/src/js/components/control/custom-print.js",
                                    "https://east-southeast-llc.github.io/ese-map-viewer/src/js/components/control/print-area.js",
                                    "https://east-southeast-llc.github.io/ese-map-viewer/src/js/components/control/share.js",
                                    "https://east-southeast-llc.github.io/ese-map-viewer/src/js/components/control/scale.js",
                                    "https://east-southeast-llc.github.io/ese-map-viewer/src/js/components/control/measure.js",
                                    "https://east-southeast-llc.github.io/ese-map-viewer/src/js/components/control/legend.js",
                                    "https://east-southeast-llc.github.io/ese-map-viewer/src/js/components/control/bookmarks.js",
                                    "https://east-southeast-llc.github.io/ese-map-viewer/src/js/components/control/identify.js",
                                    "https://east-southeast-llc.github.io/ese-map-viewer/src/js/components/disclaimer-popup.js",
                                    "https://east-southeast-llc.github.io/ese-map-viewer/src/js/utils/analytics.js",
                                    "https://east-southeast-llc.github.io/ese-map-viewer/src/js/components/mobile-menu.js",
                                    "https://east-southeast-llc.github.io/ese-map-viewer/src/js/utils/decode-url.js"
                                ];
                                
                                const controlPromises = controlScripts.map(loadScript);

                                Promise.all(controlPromises).then(() => {
                                    console.log("all control scripts loaded.");
                                    loadScript("https://east-southeast-llc.github.io/ese-map-viewer/src/js/components/toggleable-menu.js?v=2")
                                        .then(() => {
                                            setupToggleableMenu();
                                            applyUrlParams(map);
                                            console.log("application is fully loaded and ready.");
                                        });
                                });
                            });
                        }
                    });
            });
            map.on('click', (e) => {
                if (window.placingPoint) {
                    handleMarkerPlacement(e.lngLat);
                    return;
                }
                const visibleLayers = (window.toggleableLayerIds || []).filter(id => 
                    id !== 'tools' && map.getLayer(id) && map.getLayoutProperty(id, 'visibility') === 'visible'
                );
                const features = map.queryRenderedFeatures(e.point, { layers: visibleLayers });
                if (!features.length) return;
                
                const topFeature = features[0];
                let popupHTML = '';
                switch (topFeature.layer.id) {
                    case 'parcels':
                        popupHTML = `Address: <strong>${topFeature.properties.ADDRESS}</strong><br>Webpage: <a href="${topFeature.properties.URL}" target="_blank"><b><u>Link to Page</u></b></a>`;
                        break;
                    case 'floodplain':
                        popupHTML = `Flood Zone: <strong>${topFeature.properties.FLD_ZONE}</strong><br>Elevation: <strong>${topFeature.properties.STATIC_BFE}</strong>`;
                        break;
                    case 'DEP wetland':
                        popupHTML = `Wetland Identifier: <strong>${topFeature.properties.IT_VALDESC}</strong><br>Wetland Code: <strong>${topFeature.properties.IT_VALC}</strong>`;
                        break;
                    case 'zoning':
                        popupHTML = `Zoning District: <strong>${topFeature.properties.TOWNCODE}</strong><br><br>Check with the Town Clerk or Planning Department.<br><strong>This layer is from 2004</strong>`;
                        break;
                    case 'sewer':
                        popupHTML = `Approximate year constructed: ${topFeature.properties.CONTRACT}<br>Address: <strong>${topFeature.properties.ADDRESS}</strong><br>Webpage: <a href="${topFeature.properties.URL}" target="_blank"><b><u>Link to Page</u></b></a>`;
                        break;
                    case 'sewer plans':
                        const props = topFeature.properties;
                        if (props.CONSERV === 'Y') {
                            popupHTML = "Conservation Property<br>Disclaimer: Information may be inaccurate.";
                        } else {
                            popupHTML = `Year of plan: <strong>${props.DATE || 'N/A'}</strong><br>Plan ID: <strong>${props.SHEET || 'N/A'}</strong><br>`;
                            if (props.ADDED === 'Y') {
                                popupHTML += `Website: ${props.URL ? `<a href="${props.URL}" target="_blank"><b><u>Link to page</u></b></a>` : 'N/A'}<br>On sewer but not included in original plans<br>`;
                            } else {
                                popupHTML += `Link to plan: ${props.URL ? `<a href="${props.URL}" target="_blank"><b><u>Link to plan</u></b></a>` : 'N/A'}<br>`;
                            }
                            popupHTML += "Disclaimer: Information may be inaccurate.";
                        }
                        break;
                    case 'acec':
                        popupHTML = `Area of Critical Environmental Concern: <strong>${topFeature.properties.NAME}</strong><br>DEP ACEC Designation: <a href="${topFeature.properties.LINK}" target="_blank"><b><u>Link to Document</u></b></a>`;
                        break;
                    case 'agis':
                        popupHTML = `Address <strong>${topFeature.properties.ADDRESS}</strong><br>Date of photography: <strong>${topFeature.properties.DATE}</strong><br>Link to Page: <a href="${topFeature.properties.URL}" target="_blank"><b><u>Link to Page</u></b></a>`;
                        break;
                    case 'conservancy districts':
                        popupHTML = `Conservancy District: <strong>${topFeature.properties.CONS_DIST}</strong><br><br>${topFeature.properties.CONS_DIST} Elevation: <strong>${topFeature.properties.CONS_ELEV} ${topFeature.properties.CONS_DATUM}</strong><br>${topFeature.properties.CONS_DIST} Water Elevation: <strong>${topFeature.properties.WATER_ELEV} ${topFeature.properties.CONS_DATUM}</strong><br><br>Conservancy District Contour: <strong>${topFeature.properties.CONT_NAVD} ${topFeature.properties.CONV_DATUM}</strong><br><br>Description: ${topFeature.properties.CONS_DESC}`;
                        break;
                    case 'conservation':
                        popupHTML = `CCF Parcel: <strong>${topFeature.properties.CCF_ID}</strong><br><br>The light green parcels are approximate, the dark green parcels are more accurate.`;
                        break;
                    case 'endangered species':
                        popupHTML = `Estimated Habitat ID: <strong>${topFeature.properties.ESTHAB_ID}</strong><br>Priority Habitat ID: <strong>${topFeature.properties.PRIHAB_ID}</strong>`;
                        break;
                    case 'vernal pools': 
                        popupHTML = `Vernal Pool ID: <strong>${topFeature.properties.cvp_num}</strong><br>Certified: <strong>${topFeature.properties.certified}</strong><br>Criteria: <strong>${topFeature.properties.criteria}</strong>`;
                        break;
                    case 'historic':
                        popupHTML = `Historic District: ${topFeature.properties.District}<br>Status / Reference: <strong>${topFeature.properties.Status}</strong><br>Documentation: <a href="${topFeature.properties.URL}" target="_blank"><b><u>Link to Document</u></b></a>`;
                        break;
                    case 'intersection':
                        popupHTML = `Intersection: <strong>${topFeature.properties.Int_Name}</strong><br>Webpage: <a href="${topFeature.properties.Link}" target="_blank"><b><u>Link to Page</u></b></a>`;
                        break;
                    case 'stories':
                        popupHTML = `Number of Stories: <strong>${topFeature.properties.STORIES}</strong><br>Building Description: <strong>${topFeature.properties.BLD_DESC}</strong><br>Zoning: <strong>${topFeature.properties.ZONING}</strong>`;
                        break;
                    case 'zone II':
                        popupHTML = `Zone II number: <strong>${topFeature.properties.ZII_NUM}</strong><br>Water Supplier: <strong>${topFeature.properties.SUPPLIER}</strong><br>Town: <strong>${topFeature.properties.TOWN}</strong>`;
                        break;
                    case 'soils':
                        popupHTML = `Numeric State Legend: <strong>${topFeature.properties.MUSYM}</strong><br>Published Map Unit: <strong>${topFeature.properties.MUS_TXT}</strong><br><strong>${topFeature.properties.MUS_DESC}</strong>`;
                        break;
                }
                if (popupHTML) {
                    new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(popupHTML).addTo(map);
                }
            });
        });
    });
})();