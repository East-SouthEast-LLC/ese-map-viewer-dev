// docs/decode-url.js

function applyUrlParams(map) {
    console.log("Decoding URL parameters..."); // log: start decoding
    const urlParams = new URLSearchParams(window.location.search);
    const hasParams = urlParams.has('zoom') || urlParams.has('lat') || urlParams.has('layers');

    if (!hasParams) {
        console.log("No URL parameters found to apply."); // log: no params
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
    console.log("Layers found in URL:", layers); // log: found layers
    
    function setDependentLayersVisibility(layerId, visibility) {
        const dependentLayers = {
            'floodplain': ['LiMWA', 'floodplain-line', 'floodplain-labels'],
            'DEP wetland': ['dep-wetland-line', 'dep-wetland-labels'],
            'soils': ['soils-labels', 'soils-outline'],
            'zone II': ['zone-ii-outline', 'zone-ii-labels'],
            'endangered species': ['endangered-species-labels', 'vernal-pools', 'vernal-pools-labels'],
            'sewer plans': ['sewer-plans-outline'],
            'lidar contours': ['lidar-contour-labels']
        };

        if (dependentLayers[layerId]) {
            console.log(`Setting dependent layers for "${layerId}" to ${visibility}`); // log: setting dependencies
            dependentLayers[layerId].forEach(depId => {
                if (map.getLayer(depId)) {
                    map.setLayoutProperty(depId, 'visibility', visibility);
                } else {
                    console.warn(`Dependent layer "${depId}" not found.`); // log: dependency not found
                }
            });
        }
    }

    layers.forEach(layerId => {
        const decodedLayerId = decodeURIComponent(layerId);
        if (map.getLayer(decodedLayerId)) {
            console.log(`Setting layer "${decodedLayerId}" to visible.`); // log: setting layer
            map.setLayoutProperty(decodedLayerId, 'visibility', 'visible');

            setDependentLayersVisibility(decodedLayerId, 'visible');

            document.querySelectorAll('#menu a').forEach(button => {
                if (button.dataset.layerId === decodedLayerId) {
                    button.classList.add('active');
                    console.log(`Set button for "${decodedLayerId}" to active.`); // log: updating button
                }
            });
        } else {
            console.warn(`[URL] Layer "${decodedLayerId}" not found in the map style.`);
        }
    });

    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
}