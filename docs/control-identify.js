document.addEventListener('DOMContentLoaded', () => {
    const identifyButton = document.getElementById('identifyButton');
    const identifyBox = document.getElementById('identify-box');
    if (!identifyButton || !identifyBox) return;

    let identifyMode = false;

    function handleIdentifyClick(e) {
        // --- NEW MARKER LOGIC ---
        const clickCoords = e.lngLat;

        // First, clear any existing marker to ensure there's only one.
        if (marker) {
            marker.remove();
        }

        // Create a new marker at the clicked location and assign it to the global variable.
        marker = new mapboxgl.Marker()
            .setLngLat(clickCoords)
            .addTo(map);
        
        // Also update the global coordinate object so other tools can use it.
        if(markerCoordinates) {
            markerCoordinates.lat = clickCoords.lat;
            markerCoordinates.lng = clickCoords.lng;
        }
        // --- END OF NEW MARKER LOGIC ---

        const allQueryableLayers = window.toggleableLayerIds.filter(id => id !== 'tools' && map.getLayer(id));
        
        const originalVisibilities = {};
        allQueryableLayers.forEach(layerId => {
            originalVisibilities[layerId] = map.getLayoutProperty(layerId, 'visibility') || 'none';
        });

        allQueryableLayers.forEach(layerId => {
            map.setLayoutProperty(layerId, 'visibility', 'visible');
        });

        map.once('idle', () => {
            const features = map.queryRenderedFeatures(e.point, { layers: allQueryableLayers });
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
            
            identifyBox.innerHTML = html;
            identifyBox.style.display = 'block';

            allQueryableLayers.forEach(layerId => {
                map.setLayoutProperty(layerId, 'visibility', originalVisibilities[layerId]);
            });

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
            identifyBox.style.display = 'none';
        } else {
            enterIdentifyMode();
        }
    });
});