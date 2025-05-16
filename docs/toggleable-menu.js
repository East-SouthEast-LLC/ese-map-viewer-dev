// External js file for toggleable layers menu that appears on the left side of the map
map.on('load', function() {
    // enumerate ids of the layers
    var toggleableLayerIds = ['tools', 'satellite', 'parcels', 'parcel highlight', 'contours', 'agis', 'historic', 'floodplain', 'acec', 'DEP wetland', 'endangered species', 'zone II', 'soils', 'conservancy districts', 'zoning', 'conservation', 'sewer', 'stories', 'intersection', 'towns'];

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
                // Toggle display
                if (getComputedStyle(geocoderContainer).display === "none") {
                    geocoderContainer.style.display = "flex";
                    this.className = 'active';
                } else {
                    geocoderContainer.style.display = "none";
                    this.className = '';
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
                // toggle the limwa visibility to the same as the floodplain visibility
                map.setLayoutProperty('LiMWA', 'visibility', newVisibility);
                map.setLayoutProperty('floodplain-line', 'visibility', newVisibility);
                map.setLayoutProperty('floodplain-labels', 'visibility', newVisibility);
            }

            // handle dep wetland layers -----------------------------------
            if (clickedLayer === 'DEP wetland') {
                // toggle the dep line and labels visibility to the same as the dep wetland visibility
                map.setLayoutProperty('dep-wetland-line', 'visibility', newVisibility);
                map.setLayoutProperty('dep-wetland-labels', 'visibility', newVisibility);
            }

            // handle soils layers ----------------------------------------
            if (clickedLayer === 'soils') {
                // toggle the soils line and labels visibility to the same as the soils visibility
                map.setLayoutProperty('soils-labels', 'visibility', newVisibility);
                map.setLayoutProperty('soils-outline', 'visibility', newVisibility);
            }

            // handle zone II layers ----------------------------------------
            if (clickedLayer === 'zone II') {
                // toggle the zone II line and labels visibility to the same as the zone II visibility
                map.setLayoutProperty('zone-ii-outline', 'visibility', newVisibility);
                map.setLayoutProperty('zone-ii-labels', 'visibility', newVisibility);
            }

            // handle endangered species layers -----------------------
            if (clickedLayer === 'endangered species') {
                // toggle the endangered species labels visibility to the same as the endangered species visibility
                map.setLayoutProperty('endangered-species-labels', 'visibility', newVisibility);
                map.setLayoutProperty('vernal-pools', 'visibility', newVisibility);
                map.setLayoutProperty('vernal-pools-labels', 'visibility', newVisibility);
            }
            // ------------------------------------------------------------

            // Always update button visual state based on new visibility
            this.className = newVisibility === 'visible' ? 'active' : '';
        };

        var layers = document.getElementById('menu');
        layers.appendChild(link);
    }

    map.addControl(new mapboxgl.ScaleControl({
        maxWidth: 200,
        unit: 'imperial'
    }), 'bottom-right');
});
