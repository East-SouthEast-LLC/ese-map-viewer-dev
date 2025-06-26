// docs/toggleable-menu.js

function setupToggleableMenu() {
    // Define the widths for the ad and side menus, including margins
    const adWidth = 130; // 120px for the ad + 10px left margin
    const menuWidth = 180;
    const toolkitWidth = 260;
    
    // Total width when only the menu is open (Ad + Menu + Margins)
    const menuOnlyOffset = adWidth + menuWidth + 20; 
    
    // Total width when the full toolkit is open (Ad + Menu + Toolkit + Margins)
    const fullToolkitOffset = adWidth + menuWidth + toolkitWidth + 30;

    const mapContainer = document.getElementById('map');

    if (window.toggleableLayerIds && window.toggleableLayerIds.length > 0) {
        for (var i = 0; i < window.toggleableLayerIds.length; i++) {
            const id = window.toggleableLayerIds[i];
            const link = document.createElement('a');
            link.href = '#';
            link.className = '';
            link.textContent = id;
            link.dataset.layerId = id;

            link.onclick = function(e) {
                const clickedLayer = this.dataset.layerId; 
                e.preventDefault();
                e.stopPropagation();
    
                if (clickedLayer === "tools") {
                    const geocoderContainer = document.getElementById("geocoder-container");
                    if (getComputedStyle(geocoderContainer).display === "none") {
                        geocoderContainer.style.display = "flex";
                        this.className = 'active';
                        // Adjust map for the full toolkit
                        mapContainer.style.width = `calc(95vw - ${fullToolkitOffset}px)`;
                        mapContainer.style.marginLeft = `${fullToolkitOffset}px`;
                    } else {
                        geocoderContainer.style.display = "none";
                        this.className = '';
                        // Adjust map for the layer menu only
                        mapContainer.style.width = `calc(95vw - ${menuOnlyOffset}px)`;
                        mapContainer.style.marginLeft = `${menuOnlyOffset}px`;
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
                    if (map.getLayer('lidar-contour-labels')) {
                        map.setLayoutProperty('lidar-contour-labels', 'visibility', newVisibility);
                    }
                }
    
                this.className = newVisibility === 'visible' ? 'active' : '';
            };
    
            document.getElementById('menu').appendChild(link);
        }
    }
    
    // Set the initial position of the map
    mapContainer.style.width = `calc(95vw - ${menuOnlyOffset}px)`;
    mapContainer.style.marginLeft = `${menuOnlyOffset}px`;
    map.resize();

    map.addControl(new mapboxgl.ScaleControl({
        maxWidth: 200,
        unit: 'imperial'
    }), 'bottom-right');
}