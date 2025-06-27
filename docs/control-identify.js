document.addEventListener('DOMContentLoaded', () => {
    const identifyButton = document.getElementById('identifyButton');
    const identifyBox = document.getElementById('identify-box');
    if (!identifyButton || !identifyBox) return;

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
                    
                    // --- COMPLETED SWITCH STATEMENT ---
                    switch(feature.layer.id) {
                        case 'parcels':
                            info = `<strong>Parcel Address:</strong> ${props.ADDRESS}`;
                            break;
                        case 'zoning':
                            info = `<strong>Zoning:</strong> ${props.TOWNCODE}`;
                            break;
                        case 'floodplain':
                            info = `<strong>Flood Zone:</strong> ${props.FLD_ZONE}`;
                            break;
                        case 'soils':
                            info = `<strong>Soil Unit:</strong> ${props.MUSYM}`;
                            break;
                        case 'DEP wetland':
                            info = `<strong>DEP Wetland:</strong> ${props.IT_VALDESC}`;
                            break;
                        case 'endangered species':
                            info = `<strong>NHESP Habitat:</strong> Priority & Estimated`;
                            break;
                        case 'vernal pools':
                             info = `<strong>Vernal Pool:</strong> ID ${props.cvp_num}`;
                             break;
                        case 'acec':
                            info = `<strong>ACEC:</strong> ${props.NAME}`;
                            break;
                        case 'historic':
                            info = `<strong>Historic District:</strong> ${props.District}`;
                            break;
                        case 'zone II':
                            info = `<strong>Zone II:</strong> Wellhead Protection Area`;
                            break;
                        case 'conservancy districts':
                            info = `<strong>Conservancy:</strong> ${props.CONS_DIST}`;
                            break;
                        case 'conservation':
                            info = `<strong>Conservation:</strong> CCF Parcel`;
                            break;
                        case 'sewer':
                            info = `<strong>Sewer Service:</strong> Year ~${props.CONTRACT}`;
                            break;
                        case 'sewer plans':
                            info = `<strong>Sewer Plan:</strong> ID ${props.SHEET || 'N/A'}`;
                            break;
                        case 'stories':
                            info = `<strong>Building:</strong> ${props.STORIES} Stories`;
                            break;
                        case 'intersection':
                            info = `<strong>Intersection Project:</strong> ${props.Int_Name}`;
                            break;
                        case 'agis':
                            info = `<strong>Historic Aerial:</strong> Photo from ${props.DATE}`;
                            break;
                        case 'private properties upland':
                            info = `<strong>Upland Parcel:</strong> Lot Size ${props._LOT_SIZE.toLocaleString()} SF`;
                            break;
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