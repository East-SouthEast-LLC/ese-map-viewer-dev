document.addEventListener('DOMContentLoaded', () => {
    const identifyButton = document.getElementById('identifyButton');
    if (!identifyButton) return;

    let identifyMode = false;

    function handleIdentifyClick(e) {
        const visibleLayers = window.toggleableLayerIds.filter(id => {
            return id !== 'tools' && map.getLayer(id) && map.getLayoutProperty(id, 'visibility') === 'visible';
        });

        if (visibleLayers.length === 0) {
            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML("<strong>No data layers are active.</strong>")
                .addTo(map);
            exitIdentifyMode();
            return;
        }

        const features = map.queryRenderedFeatures(e.point, { layers: visibleLayers });
        let html = '<div style="max-height: 200px; overflow-y: auto; padding-right: 5px;"><h4>Features at this Point</h4>';
        const foundInfo = new Set();

        if (features.length > 0) {
            features.forEach(feature => {
                let info = '';
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