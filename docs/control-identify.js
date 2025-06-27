document.addEventListener('DOMContentLoaded', () => {
    const identifyButton = document.getElementById('identifyButton');
    const identifyBox = document.getElementById('identify-box');
    if (!identifyButton || !identifyBox) return;

    let identifyMode = false;

    function handleIdentifyClick(e) {
        // Get all possible data layers
        const allQueryableLayers = window.toggleableLayerIds.filter(id => id !== 'tools' && map.getLayer(id));
        
        // Store the original visibility of each layer so we can restore it later
        const originalVisibilities = {};
        allQueryableLayers.forEach(layerId => {
            originalVisibilities[layerId] = map.getLayoutProperty(layerId, 'visibility') || 'none';
        });

        // Temporarily make all queryable layers visible so we can query them
        allQueryableLayers.forEach(layerId => {
            map.setLayoutProperty(layerId, 'visibility', 'visible');
        });

        // Wait for the map to finish re-rendering with the layers turned on
        map.once('idle', () => {
            // Now, perform the fast query on the rendered features
            const features = map.queryRenderedFeatures(e.point, { layers: allQueryableLayers });
            
            // Build the HTML for the results panel
            let html = '<strong style="font-size: 14px;">Features at this Point</strong><hr style="margin: 2px 0 5px;">';
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
                        // Add more cases here as needed
                    }
                    if (info && !foundInfo.has(info)) {
                        html += info + '<br>';
                        foundInfo.add(info);
                    }
                });
            }

            if (foundInfo.size === 0) {
                html += 'No features found at this location.';
            }
            
            // Populate our panel in the toolkit
            identifyBox.innerHTML = html;
            identifyBox.style.display = 'block';

            // CRITICAL: Revert all layers back to their original visibility state
            allQueryableLayers.forEach(layerId => {
                map.setLayoutProperty(layerId, 'visibility', originalVisibilities[layerId]);
            });

            // Exit identify mode
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
            identifyBox.style.display = 'none'; // Hide the box if the tool is turned off
        } else {
            enterIdentifyMode();
        }
    });
});