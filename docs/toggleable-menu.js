// toggleable-menu.js

map.on('load', function() {
    // enumerate ids of the layers
    var toggleableLayerIds = ['tools', 'satellite', 'parcels', 'parcel highlight', 'contours', 'agis', 'historic', 'floodplain', 'acec', 'DEP wetland', 'endangered species', 'zone II', 'soils', 'conservancy districts', 'zoning', 'conservation', 'sewer', 'sewer plans', 'stories', 'intersection'];

    // set up the corresponding toggle button for each layer
    for (var i = 0; i < toggleableLayerIds.length; i++) {
        var id = toggleableLayerIds[i];
        
        var link = document.createElement('a');
        link.href = '#';
        link.className = '';
        link.textContent = id;

        link.onclick = function(e) {
            var clickedLayer = this.textContent;
            e.preventDefault();
            e.stopPropagation();

            // handling for tools/geocoder button and display
            if (clickedLayer === "tools") {
                var geocoderContainer = document.getElementById("geocoder-container");
                // Toggle display and set map padding accordingly
                if (getComputedStyle(geocoderContainer).display === "none") {
                    geocoderContainer.style.display = "flex";
                    this.className = 'active';
                    // Set padding for menu + toolkit
                    map.setPadding({ left: 434 });
                } else {
                    geocoderContainer.style.display = "none";
                    this.className = '';
                    // Set padding for menu only
                    map.setPadding({ left: 164 });
                }
                return;
            }

            if (!map.getLayer(clickedLayer)) {
                console.warn("Layer not found:", clickedLayer);
                return;
            }

            const isVisible = map.getLayoutProperty(clickedLayer, 'visibility') === 'visible';
            const newVisibility = isVisible ? 'none' : 'visible';
            
            // Toggle main layer
            map.setLayoutProperty(clickedLayer, 'visibility', newVisibility);

            // handle floodplain layers -----------------------------------
            if (clickedLayer === 'floodplain') {
                map.setLayoutProperty('LiMWA', 'visibility', newVisibility);
                map.setLayoutProperty('floodplain-line', 'visibility', newVisibility);
                map.setLayoutProperty('floodplain-labels', 'visibility', newVisibility);
            }

            // handle dep wetland layers -----------------------------------
            if (clickedLayer === 'DEP wetland') {
                map.setLayoutProperty('dep-wetland-line', 'visibility', newVisibility);
                map.setLayoutProperty('dep-wetland-labels', 'visibility', newVisibility);
            }

            // handle soils layers ----------------------------------------
            if (clickedLayer === 'soils') {
                map.setLayoutProperty('soils-labels', 'visibility', newVisibility);
                map.setLayoutProperty('soils-outline', 'visibility', newVisibility);
            }

            // handle zone II layers ----------------------------------------
            if (clickedLayer === 'zone II') {
                map.setLayoutProperty('zone-ii-outline', 'visibility', newVisibility);
                map.setLayoutProperty('zone-ii-labels', 'visibility', newVisibility);
            }

            // handle endangered species layers -----------------------
            if (clickedLayer === 'endangered species') {
                map.setLayoutProperty('endangered-species-labels', 'visibility', newVisibility);
                map.setLayoutProperty('vernal-pools', 'visibility', newVisibility);
                map.setLayoutProperty('vernal-pools-labels', 'visibility', newVisibility);
            }

            // handle sewer plans layers -----------------------------------
            if (clickedLayer === 'sewer plans') {
                map.setLayoutProperty('sewer-plans-outline', 'visibility', newVisibility);
            }
            // ------------------------------------------------------------

            // Always update button visual state based on new visibility
            this.className = newVisibility === 'visible' ? 'active' : '';
            // once map renders, update legend
            if (typeof window.updateLegend === 'function') {
                if (!map._legendUpdateListenerAdded) {
                    map.once('idle', function() {
                        window.updateLegend();
                        map._legendUpdateListenerAdded = false; 
                    });
                    map._legendUpdateListenerAdded = true;
                }
            }
        };

        var layers = document.getElementById('menu');
        layers.appendChild(link);
    }
    
    // Set the initial padding to account for the layer menu on the left
    map.setPadding({ left: 164 });

    map.addControl(new mapboxgl.ScaleControl({
        maxWidth: 200,
        unit: 'imperial'
    }), 'bottom-right');
});