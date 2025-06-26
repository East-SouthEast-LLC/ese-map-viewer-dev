// docs/toggleable-menu.js

function setupToggleableMenu() {
    const menuOnlyWidth = 220;
    const fullToolkitWidth = 480;
    const mapContainer = document.getElementById('map');

    if (window.toggleableLayerIds && window.toggleableLayerIds.length > 0) {
        for (var i = 0; i < window.toggleableLayerIds.length; i++) {
            const id = window.toggleableLayerIds[i]; // Use const for block scope
            const link = document.createElement('a');
            link.href = '#';
            link.className = '';
            link.textContent = id;
            link.dataset.layerId = id; // Store the original ID in a data attribute

            link.onclick = function(e) {
                // Read the layer ID from the data attribute, not the text content
                const clickedLayer = this.dataset.layerId; 
                e.preventDefault();
                e.stopPropagation();
    
                if (clickedLayer === "tools") {
                    const geocoderContainer = document.getElementById("geocoder-container");
                    if (getComputedStyle(geocoderContainer).display === "none") {
                        geocoderContainer.style.display = "flex";
                        this.className = 'active';
                        mapContainer.style.width = `calc(95vw - ${fullToolkitWidth}px)`;
                        mapContainer.style.marginLeft = `${fullToolkitWidth}px`;
                    } else {
                        geocoderContainer.style.display = "none";
                        this.className = '';
                        mapContainer.style.width = `calc(95vw - ${menuOnlyWidth}px)`;
                        mapContainer.style.marginLeft = `${menuOnlyWidth}px`;
                    }
    
                    setTimeout(function() {
                        map.resize();
                    }, 400); 
    
                    return;
                }
    
                if (!map.getLayer(clickedLayer)) {
                    console.warn("Layer not found:", clickedLayer);
                    return;
                }
    
                const isVisible = map.getLayoutProperty(clickedLayer, 'visibility') === 'visible';
                const newVisibility = isVisible ? 'none' : 'visible';
                
                map.setLayoutProperty(clickedLayer, 'visibility', newVisibility);
    
                // Handle dependent layers
                if (clickedLayer === 'floodplain') {
                    map.setLayoutProperty('LiMWA', 'visibility', newVisibility);
                    map.setLayoutProperty('floodplain-line', 'visibility', newVisibility);
                    map.setLayoutProperty('floodplain-labels', 'visibility', newVisibility);
                } else if (clickedLayer === 'DEP wetland') {
                    map.setLayoutProperty('dep-wetland-line', 'visibility', newVisibility);
                    map.setLayoutProperty('dep-wetland-labels', 'visibility', newVisibility);
                } else if (clickedLayer === 'soils') {
                    map.setLayoutProperty('soils-labels', 'visibility', newVisibility);
                    map.setLayoutProperty('soils-outline', 'visibility', newVisibility);
                } else if (clickedLayer === 'zone II') {
                    map.setLayoutProperty('zone-ii-outline', 'visibility', newVisibility);
                    map.setLayoutProperty('zone-ii-labels', 'visibility', newVisibility);
                } else if (clickedLayer === 'endangered species') {
                    map.setLayoutProperty('endangered-species-labels', 'visibility', newVisibility);
                    map.setLayoutProperty('vernal-pools', 'visibility', newVisibility);
                    map.setLayoutProperty('vernal-pools-labels', 'visibility', newVisibility);
                } else if (clickedLayer === 'sewer plans') {
                    map.setLayoutProperty('sewer-plans-outline', 'visibility', newVisibility);
                } else if (clickedLayer === 'lidar contours') {
                    map.setLayoutProperty('lidar-contour-labels', 'visibility', newVisibility);
                }
    
                this.className = newVisibility === 'visible' ? 'active' : '';

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
    }
    
    mapContainer.style.width = `calc(95vw - ${menuOnlyWidth}px)`;
    mapContainer.style.marginLeft = `${menuOnlyWidth}px`;
    map.resize();

    map.addControl(new mapboxgl.ScaleControl({
        maxWidth: 200,
        unit: 'imperial'
    }), 'bottom-right');
}