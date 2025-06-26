// docs/main-app.js

// This script will have access to the 'townId' constant defined in town.html

mapboxgl.accessToken = 'pk.eyJ1IjoiZXNlLXRvaCIsImEiOiJja2Vhb24xNTEwMDgxMzFrYjVlaTVjOXkxIn0.IsPo5lOndNUc3lDLuBa1ZA';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ese-toh/ckh2ss32s06i119paer9mt67h',
});

const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
});
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

function loadLayerScript(layerName) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        let scriptName = layerName.replace(/ /g, '-');
            if (layerName === "DEP wetland") {
                scriptName = "depwetland";
            } else if (layerName === "zone II") {
                scriptName = "zoneii";
            } else if (layerName === "conservancy districts") {
                scriptName = "conservancydistricts";
            } else if (layerName === "endangered species") {
                scriptName = "endangered-species";
            } else if (layerName === "parcel highlight") {
                scriptName = "parcel-highlight";
            } else if (layerName === "lidar contours") {
                scriptName = "lidar-contours";
            } else if (layerName === "sewer plans") {
                scriptName = "sewer-plans";
            }
        script.src = `https://east-southeast-llc.github.io/ese-map-viewer/docs/layers/${scriptName}.js?v=2`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Script load error for ${layerName}`));
        document.head.appendChild(script);
    });
}

function applyUrlParams(map) {
    const urlParams = new URLSearchParams(window.location.search);
    const hasParams = urlParams.has('zoom') || urlParams.has('lat') || urlParams.has('layers');

    if (!hasParams) {
        return; 
    }

    const zoom = parseFloat(urlParams.get('zoom'));
    if (!isNaN(zoom)) {
        map.setZoom(zoom);
    }

    const lat = parseFloat(urlParams.get('lat'));
    const lng = parseFloat(urlParams.get('lng'));
    if (!isNaN(lat) && !isNaN(lng)) {
        if (typeof dropPinAtCenter === 'function') {
            window.marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
            if(window.markerCoordinates) {
                window.markerCoordinates.lat = lat;
                window.markerCoordinates.lng = lng;
            }
        }
        map.setCenter([lng, lat]);
    }

    const layers = urlParams.get('layers')?.split(',') || [];
    
    layers.forEach(layerId => {
        const decodedLayerId = decodeURIComponent(layerId);
        if (map.getLayer(decodedLayerId)) {
            map.setLayoutProperty(decodedLayerId, 'visibility', 'visible');
            // dependent layer logic...
        }
    });

    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
}

map.on('load', function () {
    fetch('https://east-southeast-llc.github.io/ese-map-viewer/docs/town-config.json')
        .then(response => response.json())
        .then(townConfig => {
        const townData = townConfig.find(town => town.townID === townId);
        if (townData) {
            const urlParams = new URLSearchParams(window.location.search);
            if (!urlParams.has('zoom')) {
                map.setCenter(townData.map.center);
                map.setZoom(townData.map.zoom);
            }

            window.eseMapBaseUrl = townData.baseShareUrl;
            window.toggleableLayerIds = [...townData.layers];
            window.toggleableLayerIds.unshift('tools');

            const layerPromises = townData.layers.map(layer => loadLayerScript(layer));

            Promise.all(layerPromises)
            .then(() => {
                const menuScript = document.createElement('script');
                menuScript.src = 'https://east-southeast-llc.github.io/ese-map-viewer/docs/toggleable-menu.js?v=2';
                menuScript.onload = function () {
                setupToggleableMenu();

                const firstDataLayer = townData.layers.find(l => l !== 'satellite');
                if (map.getLayer('satellite') && map.getLayer(firstDataLayer)) {
                    map.moveLayer('satellite', firstDataLayer);
                }

                if (map.getLayer('parcel highlight')) {
                    map.moveLayer('parcel highlight');
                }

                applyUrlParams(map);
                };
                document.body.appendChild(menuScript);
            })
            .catch(error => console.error("Error loading layer scripts:", error));
        }
        })
        .catch(error => console.error('Error fetching town config data:', error));
});