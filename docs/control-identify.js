document.addEventListener('DOMContentLoaded', () => {
    const identifyButton = document.getElementById('identifyButton');
    if (!identifyButton) return;

    let identifyMode = false;

    // This function runs when the user clicks a point on the map in identify mode
    function handleIdentifyClick(e) {
        // Get all possible data layers from the toggleable list
        const allQueryableLayers = window.toggleableLayerIds.filter(id => id !== 'tools' && map.getLayer(id));

        let html = '<div style="max-height: 200px; overflow-y: auto; padding-right: 5px;"><strong style="font-size: 14px;">Features at this Point</strong><hr style="margin: 2px 0 5px;">';
        const foundInfo = new Set();
        const clickedPoint = turf.point([e.lngLat.lng, e.lngLat.lat]);

        // Loop through each queryable layer
        allQueryableLayers.forEach(layerId => {
            const sourceId = map.getLayer(layerId).source;
            
            // Use querySourceFeatures to get all features from the source data
            const features = map.querySourceFeatures(sourceId, {
                sourceLayer: map.getLayer(layerId).sourceLayer
            });
            
            // Manually check which features contain the clicked point
            for (const feature of features) {
                // turf.booleanPointInPolygon requires a Polygon or MultiPolygon
                if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                    const isInside = turf.booleanPointInPolygon(clickedPoint, feature.geometry);
                    if (isInside) {
                        let info = '';
                        const props = feature.properties;
                        // Build the popup string for the matched feature
                        switch(layerId) { // Use layerId here for consistency
                            case 'zoning': info = `<strong>Zoning:</strong> ${props.TOWNCODE}`; break;
                            case 'floodplain': info = `<strong>Flood Zone:</strong> ${props.FLD_ZONE}`; break;
                            case 'historic': info = `<strong>Historic District:</strong> ${props.District}`; break;
                            case 'acec': info = `<strong>ACEC:</strong> ${props.NAME}`; break;
                            case 'DEP wetland': info = `<strong>DEP Wetland:</strong> ${props.IT_VALDESC}`; break;
                            case 'endangered species': info = `<strong>NHESP Habitat:</strong> Priority & Estimated`; break;
                            case 'soils': info = `<strong>Soil Unit:</strong> ${props.MUSYM}`; break;
                            case 'parcels': info = `<strong>Parcel Address:</strong> ${props.ADDRESS}`; break;
                            // Add other layer cases here
                        }
                        if (info && !foundInfo.has(info)) {
                            html += info + '<br>';
                            foundInfo.add(info);
                        }
                    }
                }
            }
        });

        if (foundInfo.size === 0) {
            html += 'No data features found at this location.';
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