map.on('load', function () {
    applyUrlParams(map);
});

function applyUrlParams(map) {
    const urlParams = new URLSearchParams(window.location.search);

    // Get and set zoom level
    const zoom = parseFloat(urlParams.get('zoom'));
    if (!isNaN(zoom)) {
        map.setZoom(zoom);
    }

    // Get and set marker position
    const lat = parseFloat(urlParams.get('lat'));
    const lng = parseFloat(urlParams.get('lng'));
    if (!isNaN(lat) && !isNaN(lng)) {
        marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map); // Store the marker in the global variable
        map.setCenter([lng, lat]); // Center the map on the marker
    }

    // Ensure the layers are loaded and then simulate the button click for each layer
    let layers = urlParams.get('layers')?.split(',') || [];
    map.on('styledata', function () {
        layers.forEach(layerId => {
            // Check if the layer exists in the map style
            if (map.getLayer(layerId)) {
                // Toggle layer visibility by changing the layout object's visibility property
                let visibility = map.getLayoutProperty(layerId, 'visibility');
                if (visibility === 'none') {
                    map.setLayoutProperty(layerId, 'visibility', 'visible');
                }

                // Simulate button click for toggling button colors
                let buttonList = document.querySelectorAll('a'); // Get all buttons
                buttonList.forEach(button => {
                    if (button.textContent.trim() === layerId.trim()) {
                        // Ensure the button gets the active class for the "on" state
                        button.classList.add('active');
                    }
                });
            }
        });

        // Nullify the layers array to ensure it's not processed again
        layers = []; // Clear the array or set it to an empty array

        // Clean the URL (remove parameters but keep the base page)
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    });
}