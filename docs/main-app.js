// docs/main-app.js

// The single source of truth for the marker and its coordinates
let marker = null;
const markerCoordinates = { lat: null, lng: null };

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

// --- (loadLayerScript and applyUrlParams functions are unchanged) ---
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
            } else if (layerName === "private properties upland") {
                scriptName = "private-properties-upland";
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
    if (!hasParams) return;
    const zoom = parseFloat(urlParams.get('zoom'));
    if (!isNaN(zoom)) map.setZoom(zoom);
    const lat = parseFloat(urlParams.get('lat'));
    const lng = parseFloat(urlParams.get('lng'));
    if (!isNaN(lat) && !isNaN(lng)) {
        marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
        if(markerCoordinates) {
            markerCoordinates.lat = lat;
            markerCoordinates.lng = lng;
        }
        map.setCenter([lng, lat]);
    }
    const layers = urlParams.get('layers')?.split(',') || [];
    layers.forEach(layerId => {
        const decodedLayerId = decodeURIComponent(layerId);
        if (map.getLayer(decodedLayerId)) map.setLayoutProperty(decodedLayerId, 'visibility', 'visible');
    });
    if (marker) map.flyTo({ center: marker.getLngLat(), essential: true });
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
}


map.on('load', function () {
    // --- (The existing map.on('load') logic is mostly unchanged) ---
    loadLayerScript('towns').then(() => {
        fetch('https://east-southeast-llc.github.io/ese-map-viewer/docs/town-config.json')
            .then(response => response.json())
            .then(townConfig => {
                // ... (existing config handling)
            })
    });

    // --- NEW: Centralized Map Click Handler ---
    map.on('click', (e) => {
        // First, check if point placement mode is active
        if (placingPoint) {
            handleMarkerPlacement(e.lngLat);
            return; // Stop further processing
        }

        // Get all visible data layers
        const visibleLayers = window.toggleableLayerIds.filter(id => 
            id !== 'tools' && map.getLayer(id) && map.getLayoutProperty(id, 'visibility') === 'visible'
        );

        // Query for features at the clicked point
        const features = map.queryRenderedFeatures(e.point, { layers: visibleLayers });
        if (!features.length) {
            return; // No features clicked, do nothing
        }
        
        // The first feature in the array is the top-most one
        const topFeature = features[0];
        let popupHTML = '';

        // Generate popup HTML based on the layer of the top-most feature
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
        }

        if (popupHTML) {
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(popupHTML)
                .addTo(map);
        }
    });
});

// Helper function to handle marker placement, moved from control-button.js
function handleMarkerPlacement(lngLat) {
    const { lat, lng } = lngLat;
    setPinPosition(lat, lng);
    if (marker) marker.remove();
    marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
    placingPoint = false;
    document.getElementById('pointButton').classList.remove('active');
    map.getCanvas().style.cursor = '';
}