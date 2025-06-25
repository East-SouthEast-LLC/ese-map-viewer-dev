// docs/decode-url.js

function applyUrlParams(map) {
    const urlParams = new URLSearchParams(window.location.search);
    const hasParams = urlParams.has('zoom') || urlParams.has('lat') || urlParams.has('layers');

    if (!hasParams) {
        return; // Exit if no parameters are present
    }

    // Get and set zoom level
    const zoom = parseFloat(urlParams.get('zoom'));
    if (!isNaN(zoom)) {
        map.setZoom(zoom);
    }

    // Get and set marker position
    const lat = parseFloat(urlParams.get('lat'));
    const lng = parseFloat(urlParams.get('lng'));
    if (!isNaN(lat) && !isNaN(lng)) {
        // Ensure control-button.js's marker logic is available
        if (typeof dropPinAtCenter === 'function') {
            window.marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
            if(window.markerCoordinates) {
                window.markerCoordinates.lat = lat;
                window.markerCoordinates.lng = lng;
            }
        }
        map.setCenter([lng, lat]);
    }

    // Get the list of layers from the URL
    const layers = urlParams.get('layers')?.split(',') || [];
    
    layers.forEach(layerId => {
        const decodedLayerId = decodeURIComponent(layerId);
        // Check if the layer exists on the map
        if (map.getLayer(decodedLayerId)) {
            map.setLayoutProperty(decodedLayerId, 'visibility', 'visible');

            // Handle dependent layers
            if (decodedLayerId === 'floodplain') {
                map.setLayoutProperty('LiMWA', 'visibility', 'visible');
                map.setLayoutProperty('floodplain-line', 'visibility', 'visible');
                map.setLayoutProperty('floodplain-labels', 'visibility', 'visible');
            } else if (decodedLayerId === 'DEP wetland') {
                map.setLayoutProperty('dep-wetland-line', 'visibility', 'visible');
                map.setLayoutProperty('dep-wetland-labels', 'visibility', 'visible');
            } else if (decodedLayerId === 'soils') {
                map.setLayoutProperty('soils-labels', 'visibility', 'visible');
                map.setLayoutProperty('soils-outline', 'visibility', 'visible');
            } else if (decodedLayerId === 'zone II') {
                map.setLayoutProperty('zone-ii-outline', 'visibility', 'visible');
                map.setLayoutProperty('zone-ii-labels', 'visibility', 'visible');
            } else if (decodedLayerId === 'endangered species') {
                map.setLayoutProperty('endangered-species-labels', 'visibility', 'visible');
                map.setLayoutProperty('vernal-pools', 'visibility', 'visible');
                map.setLayoutProperty('vernal-pools-labels', 'visibility', 'visible');
            }

            // Update the corresponding button to be active
            document.querySelectorAll('#menu a').forEach(button => {
                if (button.textContent.trim() === decodedLayerId) {
                    button.classList.add('active');
                }
            });
        } else {
            console.warn(`[URL] Layer "${decodedLayerId}" not found in the map style.`);
        }
    });

    // Clean the URL to avoid reprocessing on refresh
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
}