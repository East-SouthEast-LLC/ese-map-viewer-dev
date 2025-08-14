// src/js/components/toggleable-menu.js

function setupToggleableMenu() {
    const menuRightEdge = 305;
    const toolkitRightEdge = 580;
    const desiredGap = 10;
    const menuOnlyOffset = menuRightEdge + desiredGap;
    const fullToolkitOffset = toolkitRightEdge + desiredGap;
    
    const mapContainer = document.getElementById('map');
    const geocoderContainer = document.getElementById("geocoder-container");

    function openToolkit() {
        if (getComputedStyle(geocoderContainer).display === "none") {
            geocoderContainer.style.display = "flex";
            const toolsButton = document.querySelector('[data-layer-id="tools"]');
            if(toolsButton) toolsButton.classList.add('active');
            
            document.getElementById('bookmark-box').style.display = 'none';
            document.getElementById('bookmarkButton').classList.remove('active');
            document.getElementById('identify-box').style.display = 'none';
            document.getElementById('identifyButton').classList.remove('active');

            mapContainer.style.width = `calc(95vw - ${fullToolkitOffset}px)`;
            mapContainer.style.marginLeft = `${fullToolkitOffset}px`;
            setTimeout(() => map.resize(), 400);
        }
    }

    if (window.toggleableLayerIds && window.toggleableLayerIds.length > 0) {
        // use the master layerConfig to get display names and order
        const menuLayers = window.layerConfig.filter(l => window.toggleableLayerIds.includes(l.id));

        for (const layerInfo of menuLayers) {
            const id = layerInfo.id;
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = layerInfo.displayName; // use display name for the label
            link.dataset.layerId = id; // use the id for logic

            link.onclick = function(e) {
                const clickedLayer = this.dataset.layerId;
                e.preventDefault();
                e.stopPropagation();

                trackEvent('layer_toggle', {
                    layer_id: clickedLayer,
                    action: this.classList.contains('active') ? 'off' : 'on'
                });

                if (clickedLayer === "tools") {
                    if (getComputedStyle(geocoderContainer).display === "none") {
                        openToolkit();
                    } else {
                        geocoderContainer.style.display = "none";
                        this.classList.remove('active');
                        document.getElementById('bookmark-box').style.display = 'none';
                        document.getElementById('bookmarkButton').classList.remove('active');
                        mapContainer.style.width = `calc(95vw - ${menuOnlyOffset}px)`;
                        mapContainer.style.marginLeft = `${menuOnlyOffset}px`;
                        setTimeout(() => map.resize(), 400);
                    }
                    return;
                }
                
                const layerConfig = window.layerConfig.find(l => l.id === clickedLayer);

                // handle special "managed" layers like usgs quad
                if (layerConfig && layerConfig.type === 'managed') {
                    const isActive = this.classList.toggle('active');
                    if (isActive) {
                        if (window.initializeUsgsTileManager) initializeUsgsTileManager();
                    } else {
                        if (window.deinitializeUsgsTileManager) deinitializeUsgsTileManager();
                    }
                    return;
                }

                if (!map.getLayer(clickedLayer)) {
                    return console.warn("Layer not found:", clickedLayer);
                }

                const isVisible = map.getLayoutProperty(clickedLayer, 'visibility') === 'visible';
                const newVisibility = isVisible ? 'none' : 'visible';
                map.setLayoutProperty(clickedLayer, 'visibility', newVisibility);
                this.className = newVisibility === 'visible' ? 'active' : '';

                // ** new dynamic dependency handling **
                if (layerConfig && layerConfig.dependencies) {
                    layerConfig.dependencies.forEach(depId => {
                        if (map.getLayer(depId)) {
                            map.setLayoutProperty(depId, 'visibility', newVisibility);
                        }
                    });
                }
                
                // handle special cases with unique functions
                if (clickedLayer === 'private properties upland') {
                    if (typeof window.toggleUplandControls === 'function') {
                        window.toggleUplandControls(newVisibility === 'visible');
                        if (newVisibility === 'visible') openToolkit();
                    }
                }
                
                // update legend after toggling
                if (typeof window.updateLegend === 'function') {
                    if (!map._legendUpdateListenerAdded) {
                        map._legendUpdateListenerAdded = true;
                        map.once('idle', function() {
                            window.updateLegend();
                            map._legendUpdateListenerAdded = false; 
                        });
                    }
                }
            };
    
            document.getElementById('menu').appendChild(link);
        }
    }
    
    mapContainer.style.width = `calc(95vw - ${menuOnlyOffset}px)`;
    mapContainer.style.marginLeft = `${menuOnlyOffset}px`;
    map.resize();

    map.addControl(new mapboxgl.ScaleControl({ maxWidth: 200, unit: 'imperial' }), 'bottom-right');
}