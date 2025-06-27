// docs/control-identify.js

document.addEventListener('DOMContentLoaded', () => {
    const identifyButton = document.getElementById('identifyButton');
    if (!identifyButton) return;

    let identifyMode = false;

    // This function runs when the user clicks a point on the map in identify mode
    function handleIdentifyClick(e) {
        // --- UPDATED: Query ALL available data layers, not just the visible ones ---
        const allQueryableLayers = window.toggleableLayerIds.filter(id => {
            return id !== 'tools' && map.getLayer(id); // Check if the layer exists on the map
        });

        // Query the map for features at the clicked point across all available data layers
        const features = map.queryRenderedFeatures(e.point, { layers: allQueryableLayers });

        // --- UPDATED: Changed title from <h4> to a styled <strong> tag ---
        let html = '<div style="max-height: 200px; overflow-y: auto; padding-right: 5px;"><strong style="font-size: 14px;">Features at this Point</strong><hr style="margin: 2px 0 5px;">';
        
        const foundInfo = new Set();

        if (features.length > 0) {
            features.forEach(feature => {
                let info = '';
                // The switch statement builds the info string based on the layer
                switch(feature.layer.id) {
                    case 'zoning':
                        info = `<strong>Zoning:</strong> ${feature.properties.TOWNCODE}`;
                        break;
                    case 'floodplain':
                        info = `<strong>Flood Zone:</strong> ${feature.properties.FLD_ZONE}`;
                        break;
                    case 'historic':
                        info = `<strong>Historic District:</strong> ${feature.properties.District}`;
                        break;
                    case 'acec':
                        info = `<strong>ACEC:</strong> ${feature.properties.NAME}`;
                        break;
                    case 'DEP wetland':
                        info = `<strong>DEP Wetland:</strong> ${feature.properties.IT_VALDESC}`;
                        break;
                    case 'endangered species':
                        info = `<strong>NHESP Habitat:</strong> Priority & Estimated`;
                        break;
                    case 'soils':
                        info = `<strong>Soil Unit:</strong> ${feature.properties.MUSYM}`;
                        break;
                    case 'parcels':
                        info = `<strong>Parcel Address:</strong> ${feature.properties.ADDRESS}`;
                        break;
                    // Add other layer cases here
                }
                if (info && !foundInfo.has(info)) {
                    html += info + '<br>';
                    foundInfo.add(info);
                }
            });

             if (foundInfo.size === 0) {
                html += 'No features found at this location.';
            }
        } else {
            html += 'No features found at this location.';
        }
        
        html += '</div>';

        new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(html).addTo(map);
        exitIdentifyMode();
    }
    
    function enterIdentifyMode() {
        identifyMode = true;
        map.getCanvas().style.cursor = 'help';
        identifyButton.classList.add('active');
        map.once('click', handleIdentifyClick);
    }

    function exitIdentifyMode() {
        identifyMode = false;
        map.getCanvas().style.cursor = '';
        identifyButton.classList.remove('active');
        map.off('click', handleIdentifyClick);
    }

    identifyButton.addEventListener('click', () => {
        if (identifyMode) {
            exitIdentifyMode();
        } else {
            enterIdentifyMode();
        }
    });
});