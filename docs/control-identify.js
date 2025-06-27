// docs/control-identify.js

document.addEventListener('DOMContentLoaded', () => {
    const identifyButton = document.getElementById('identifyButton');
    if (!identifyButton) return;

    let identifyMode = false;

    // This function runs when the user clicks a point on the map in identify mode
    function handleIdentifyClick(e) {
        // Get all possible data layers that could be queried
        const allQueryableLayers = window.toggleableLayerIds.filter(id => id !== 'tools' && map.getLayer(id));
        
        // Store the original visibility of each layer
        const originalVisibilities = {};
        allQueryableLayers.forEach(layerId => {
            originalVisibilities[layerId] = map.getLayoutProperty(layerId, 'visibility') || 'none';
        });

        // --- The "Magic" ---
        // 1. Temporarily make all queryable layers visible
        allQueryableLayers.forEach(layerId => {
            map.setLayoutProperty(layerId, 'visibility', 'visible');
        });

        // 2. Wait for the map to be 'idle' after applying visibility changes
        map.once('idle', () => {
            // 3. Now, perform the fast query on the rendered (now visible) features
            const features = map.queryRenderedFeatures(e.point, { layers: allQueryableLayers });
            let html = '<div style="max-height: 200px; overflow-y: auto; padding-right: 5px;"><strong style="font-size: 14px;">Features at this Point</strong><hr style="margin: 2px 0 5px;">';
            const foundInfo = new Set();

            if (features.length > 0) {
                features.forEach(feature => {
                    let info = '';
                    const props = feature.properties;
                    switch(feature.layer.id) {
                        case 'zoning': info = `<strong>Zoning:</strong> ${props.TOWNCODE}`; break;
                        case 'floodplain': info = `<strong>Flood Zone:</strong> ${props.FLD_ZONE}`; break;
                        case 'historic': info = `<strong>Historic District:</strong> ${props.District}`; break;
                        case 'acec': info = `<strong>ACEC:</strong> ${props.NAME}`; break;
                        case 'DEP wetland': info = `<strong>DEP Wetland:</strong> ${props.IT_VALDESC}`; break;
                        case 'endangered species': info = `<strong>NHESP Habitat:</strong> Priority & Estimated`; break;
                        case 'soils': info = `<strong>Soil Unit:</strong> ${props.MUSYM}`; break;
                        case 'parcels': info = `<strong>Parcel Address:</strong> ${props.ADDRESS}`; break;
                        // Add more cases here
                    }
                    if (info && !foundInfo.has(info)) {
                        html += info + '<br>';
                        foundInfo.add(info);
                    }
                });
            }

            if (foundInfo.size === 0) {
                html += 'No data features found at this location.';
            }
            html += '</div>';

            // 4. Display the popup with the collected info
            new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(html).addTo(map);

            // 5. CRITICAL: Revert all layers back to their original visibility state
            allQueryableLayers.forEach(layerId => {
                map.setLayoutProperty(layerId, 'visibility', originalVisibilities[layerId]);
            });

            // 6. Exit identify mode
            exitIdentifyMode();
        });
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