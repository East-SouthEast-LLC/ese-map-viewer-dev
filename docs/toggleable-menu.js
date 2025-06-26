// docs/toggleable-menu.js

function setupToggleableMenu() {
    const menuRightEdge = 305;
    const toolkitRightEdge = 575;
    const desiredGap = 10;
    const menuOnlyOffset = menuRightEdge + desiredGap;
    const fullToolkitOffset = toolkitRightEdge + desiredGap;
    
    const mapContainer = document.getElementById('map');
    const geocoderContainer = document.getElementById("geocoder-container");
    const toolsButton = document.querySelector('[data-layer-id="tools"]');

    function openToolkit() {
        if (getComputedStyle(geocoderContainer).display === "none") {
            geocoderContainer.style.display = "flex";
            if(toolsButton) toolsButton.classList.add('active');
            mapContainer.style.width = `calc(95vw - ${fullToolkitOffset}px)`;
            mapContainer.style.marginLeft = `${fullToolkitOffset}px`;
            setTimeout(() => map.resize(), 400);
        }
    }

    if (window.toggleableLayerIds && window.toggleableLayerIds.length > 0) {
        for (const id of window.toggleableLayerIds) {
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = id;
            link.dataset.layerId = id;

            link.onclick = function(e) {
                const clickedLayer = this.dataset.layerId;
                e.preventDefault();
                e.stopPropagation();

                if (clickedLayer === "tools") {
                    if (getComputedStyle(geocoderContainer).display === "none") {
                        openToolkit();
                    } else {
                        geocoderContainer.style.display = "none";
                        if(toolsButton) toolsButton.classList.remove('active');
                        mapContainer.style.width = `calc(95vw - ${menuOnlyOffset}px)`;
                        mapContainer.style.marginLeft = `${menuOnlyOffset}px`;
                        setTimeout(() => map.resize(), 400);
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

                // --- Special handler for our new layer ---
                if (clickedLayer === 'private properties upland') {
                    window.toggleUplandControls(newVisibility === 'visible');
                    if (newVisibility === 'visible') {
                        openToolkit(); // Auto-open the toolkit
                    }
                }

                // ... (rest of dependent layer logic)
            };
    
            document.getElementById('menu').appendChild(link);
        }
    }
    
    mapContainer.style.width = `calc(95vw - ${menuOnlyOffset}px)`;
    mapContainer.style.marginLeft = `${menuOnlyOffset}px`;
    map.resize();

    map.addControl(new mapboxgl.ScaleControl({ maxWidth: 200, unit: 'imperial' }), 'bottom-right');
}