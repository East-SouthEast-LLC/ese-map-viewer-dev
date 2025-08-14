// src/js/components/control/identify.js

const identifyButton = document.getElementById('identifyButton');
const identifyBox = document.getElementById('identify-box');

if (!identifyButton || !identifyBox) {
    console.error("Required elements not found for the Identify tool.");
} else {
    let identifyMode = false;

    function handleIdentifyClick(e) {
        const clickCoords = e.lngLat;
        if (marker) {
            marker.remove();
        }
        marker = new mapboxgl.Marker().setLngLat(clickCoords).addTo(map);
        if(markerCoordinates) {
            markerCoordinates.lat = clickCoords.lat;
            markerCoordinates.lng = clickCoords.lng;
        }

        // get the list of layers available for the current town.
        const townLayerIds = window.toggleableLayerIds;

        // from the town's layers, find which ones are identifiable based on the master config.
        const queryableLayers = window.layerConfig
            .filter(l => townLayerIds.includes(l.id) && l.identifyConfig)
            .map(l => l.id);

        const originalVisibilities = {};
        queryableLayers.forEach(layerId => {
            originalVisibilities[layerId] = map.getLayoutProperty(layerId, 'visibility') || 'none';
            map.setLayoutProperty(layerId, 'visibility', 'visible');
        });

        map.once('idle', () => {
            const features = map.queryRenderedFeatures(e.point, { layers: queryableLayers });
            let html = '<strong style="font-size: 14px;">Features at this Point</strong><hr style="margin: 2px 0 5px;">';
            const foundInfo = new Set();

            if (features.length > 0) {
                features.forEach(feature => {
                    const config = window.layerConfig.find(l => l.id === feature.layer.id);
                    if (config && config.identifyConfig) {
                        let info = config.identifyConfig.template;
                        
                        // replace placeholders with feature properties
                        for (const key in feature.properties) {
                            const regex = new RegExp(`{${key}}`, 'g');
                            info = info.replace(regex, feature.properties[key]);
                        }

                        if (info && !foundInfo.has(info)) {
                            html += info + '<br>';
                            foundInfo.add(info);
                        }
                    }
                });
            }

            if (foundInfo.size === 0) {
                html += 'No data features found at this location.';
            }
            
            identifyBox.innerHTML = html;
            identifyBox.style.display = 'block';

            // restore original layer visibilities
            queryableLayers.forEach(layerId => {
                map.setLayoutProperty(layerId, 'visibility', originalVisibilities[layerId]);
            });

            exitIdentifyMode();
        });
    }
    
    function enterIdentifyMode() {
        trackEvent('identify_tool', {});
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
}