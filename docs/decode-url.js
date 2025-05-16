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

                // ---------------------------------------------------------------
                // handle floodplain layers -----------------------------------
                if (layerId === 'floodplain') {
                    // toggle the limwa visibility to the same as the floodplain visibility
                    map.setLayoutProperty('LiMWA', 'visibility', visibility);
                    map.setLayoutProperty('floodplain-line', 'visibility', visibility);
                    map.setLayoutProperty('floodplain-labels', 'visibility', visibility);
                }

                // handle dep wetland layers -----------------------------------
                if (layerId === 'DEP wetland') {
                    // toggle the dep line and labels visibility to the same as the dep wetland visibility
                    map.setLayoutProperty('dep-wetland-line', 'visibility', visibility);
                    map.setLayoutProperty('dep-wetland-labels', 'visibility', visibility);
                }

                // handle soils layers ----------------------------------------
                if (layerId === 'soils') {
                    // toggle the soils line and labels visibility to the same as the soils visibility
                    map.setLayoutProperty('soils-labels', 'visibility', visibility);
                    map.setLayoutProperty('soils-outline', 'visibility', visibility);
                }

                // handle zone II layers ----------------------------------------
                if (layerId === 'zone II') {
                    // toggle the zone II line and labels visibility to the same as the zone II visibility
                    map.setLayoutProperty('zone-ii-outline', 'visibility', visibility);
                    map.setLayoutProperty('zone-ii-labels', 'visibility', visibility);
                }

                // handle endangered species layers -----------------------
                if (clickedLayer === 'endangered species') {
                    // toggle the endangered species labels visibility to the same as the endangered species visibility
                    map.setLayoutProperty('endangered-species-labels', 'visibility', visibility);
                    map.setLayoutProperty('vernal-pools', 'visibility', visibility);
                    map.setLayoutProperty('vernal-pools-labels', 'visibility', visibility);
                }
                // ------------------------------------------------------------

                // Simulate button click for toggling button colors
                let buttonList = document.querySelectorAll('a'); // Get all buttons
                buttonList.forEach(button => {
                    if (button.textContent.trim() === layerId.trim()) {
                        // Ensure the button gets the active class for the "on" state
                        button.classList.add('active');
                    }
                });
            } else {
                console.warn(`[URL] Layer "${layerId}" not found in the map style.`);
            }
        });

        // Nullify the layers array to ensure it's not processed again
        layers = []; // Clear the array or set it to an empty array

        // Clean the URL (remove parameters but keep the base page)
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    });
}
