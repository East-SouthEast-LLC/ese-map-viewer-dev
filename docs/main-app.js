// docs/main-app.js

// The single source of truth for the marker and its coordinates
let marker = null;
const markerCoordinates = { lat: null, lng: null };

mapboxgl.accessToken = 'pk.eyJ1IjoiZXNlLXRvaCIsImEiOiJja2Vhb24xNTEwMDgxMzFrYjVlaTVjOXkxIn0.IsPo5lOndNUc3lDLuBa1ZA';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ese-toh/ckh2ss32s06i119paer9mt67h',
});

const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
});
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

function loadLayerScript(layerName) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        let scriptName = layerName.replace(/ /g, '-');
            if (layerName === "DEP wetland") {
                scriptName = "depwetland";
            } else if (layerName === "zone II") {
                scriptName = "zoneii";
            } else if (layerName === "conservancy districts") {
                scriptName = "conservancydistricts";
            } else if (layerName === "endangered species") {
                scriptName = "endangered-species";
            } else if (layerName === "parcel highlight") {
                scriptName = "parcel-highlight";
            } else if (layerName === "lidar contours") {
                scriptName = "lidar-contours";
            } else if (layerName === "sewer plans") {
                scriptName = "sewer-plans";
            } else if (layerName === "private properties upland") {
                scriptName = "private-properties-upland";
            } else if (layerName === "usgs quad") {
                scriptName = "usgs-tile-manager";
            }
        
        script.src = `https://east-southeast-llc.github.io/ese-map-viewer/docs/layers/${scriptName}.js?v=2`;
        
        script.onload = () => {
            resolve();
        };

        script.onerror = () => reject(new Error(`Script load error for ${layerName}`));
        document.head.appendChild(script);
    });
}

function applyUrlParams(map) {
    const urlParams = new URLSearchParams(window.location.search);
    const hasParams = urlParams.has('zoom') || urlParams.has('lat') || urlParams.has('layers');
    const hasHash = window.location.hash; // Check if a hash exists

    // If there are no parameters to apply AND no hash to clean, we can exit early.
    if (!hasParams && !hasHash) {
        return;
    }

    // Apply parameters if they exist
    if (hasParams) {
        const zoom = parseFloat(urlParams.get('zoom'));
        if (!isNaN(zoom)) map.setZoom(zoom);
        const lat = parseFloat(urlParams.get('lat'));
        const lng = parseFloat(urlParams.get('lng'));
        if (!isNaN(lat) && !isNaN(lng)) {
            marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
            if(markerCoordinates) {
                markerCoordinates.lat = lat;
                markerCoordinates.lng = lng;
            }
            map.setCenter([lng, lat]);
        }
        const layers = urlParams.get('layers')?.split(',') || [];
        layers.forEach(layerId => {
            const decodedLayerId = decodeURIComponent(layerId);
            if (map.getLayer(decodedLayerId)) map.setLayoutProperty(decodedLayerId, 'visibility', 'visible');
        });
        if (marker) map.flyTo({ center: marker.getLngLat(), essential: true });
    }

    // Always clean the URL if there were params or a hash
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
}

map.on('load', function () {
    loadLayerScript('towns').then(() => {
        fetch('https://east-southeast-llc.github.io/ese-map-viewer/docs/town-config.json')
            .then(response => response.json())
            .then(townConfig => {
                const townData = townConfig.find(town => town.townID === townId);
                if (townData) {
                    const urlParams = new URLSearchParams(window.location.search);
                    if (!urlParams.has('zoom')) {
                        map.setCenter(townData.map.center);
                        map.setZoom(townData.map.zoom);
                    }
                    window.eseMapBaseUrl = townData.baseShareUrl;
                    window.toggleableLayerIds = townData.layers.filter(l => l !== 'towns');
                    window.toggleableLayerIds.unshift('tools');
                    const layerPromises = townData.layers.filter(l => l !== 'towns').map(layer => loadLayerScript(layer));
                    Promise.all(layerPromises)
                        .then(() => {
                            const menuScript = document.createElement('script');
                            menuScript.src = 'https://east-southeast-llc.github.io/ese-map-viewer/docs/toggleable-menu.js?v=2';
                            menuScript.onload = function () {
                                setupToggleableMenu();

                                // --- CORRECTED drawOrder ARRAY ---
                                const drawOrder = [
                                    'satellite', 'parcels', 'zoning', 'conservancy districts',
                                    'conservation', 'sewer', 'sewer plans', 'sewer-plans-outline',
                                    'stories', 'intersection', 'soils', 'soils-outline', 'soils-labels',
                                    'zone II', 'zone-ii-outline', 'zone-ii-labels',
                                    'DEP wetland', 'dep-wetland-line', 'dep-wetland-labels',
                                    'endangered species', 'endangered-species-labels', 'vernal-pools', 'vernal-pools-labels',
                                    'acec', 'floodplain', 'LiMWA', 'floodplain-line', 'floodplain-labels',
                                    'agis', 'historic', 'towns', 'private properties upland',
                                    'contours', 'lidar contours', 'lidar-contour-labels', 'parcel highlight'
                                ];

                                drawOrder.forEach(layerId => {
                                    if (map.getLayer(layerId)) {
                                        map.moveLayer(layerId);
                                    }
                                });
                                applyUrlParams(map);
                            };
                            document.body.appendChild(menuScript);
                        })
                        .catch(error => console.error("Error loading layer scripts:", error));
                }
            })
            .catch(error => console.error('Error fetching town config data:', error));
    });

    map.on('click', (e) => {
        if (placingPoint) {
            handleMarkerPlacement(e.lngLat);
            return;
        }
        const visibleLayers = window.toggleableLayerIds.filter(id => 
            id !== 'tools' && map.getLayer(id) && map.getLayoutProperty(id, 'visibility') === 'visible'
        );
        const features = map.queryRenderedFeatures(e.point, { layers: visibleLayers });
        if (!features.length) return;
        
        const topFeature = features[0];
        let popupHTML = '';

        // handle popup content based on the top feature's layer
        switch (topFeature.layer.id) {
            case 'parcels':
                popupHTML = `Address: <strong>${topFeature.properties.ADDRESS}</strong><br>Webpage: <a href="${topFeature.properties.URL}" target="_blank"><b><u>Link to Page</u></b></a>`;
                break;
            case 'floodplain':
                popupHTML = `Flood Zone: <strong>${topFeature.properties.FLD_ZONE}</strong><br>Elevation: <strong>${topFeature.properties.STATIC_BFE}</strong>`;
                break;
            case 'DEP wetland':
                 popupHTML = `Wetland Identifier: <strong>${topFeature.properties.IT_VALDESC}</strong><br>Wetland Code: <strong>${topFeature.properties.IT_VALC}</strong>`;
                break;
            case 'zoning':
                popupHTML = `Zoning District: <strong>${topFeature.properties.TOWNCODE}</strong><br><br>Check with the Town Clerk or Planning Department.<br><strong>This layer is from 2004</strong>`;
                break;
            case 'sewer':
                popupHTML = `Approximate year constructed: ${topFeature.properties.CONTRACT}<br>Address: <strong>${topFeature.properties.ADDRESS}</strong><br>Webpage: <a href="${topFeature.properties.URL}" target="_blank"><b><u>Link to Page</u></b></a>`;
                break;
            case 'sewer plans':
                const props = topFeature.properties;
                if (props.CONSERV === 'Y') {
                    popupHTML = "Conservation Property<br>Disclaimer: Information may be inaccurate.";
                } else {
                    popupHTML = `Year of plan: <strong>${props.DATE || 'N/A'}</strong><br>Plan ID: <strong>${props.SHEET || 'N/A'}</strong><br>`;
                    if (props.ADDED === 'Y') {
                        popupHTML += `Website: ${props.URL ? `<a href="${props.URL}" target="_blank"><b><u>Link to page</u></b></a>` : 'N/A'}<br>On sewer but not included in original plans<br>`;
                    } else {
                        popupHTML += `Link to plan: ${props.URL ? `<a href="${props.URL}" target="_blank"><b><u>Link to plan</u></b></a>` : 'N/A'}<br>`;
                    }
                    popupHTML += "Disclaimer: Information may be inaccurate.";
                }
                break;
            case 'acec':
                popupHTML = `Area of Critical Environmental Concern: <strong>${topFeature.properties.NAME}</strong><br>DEP ACEC Designation: <a href="${topFeature.properties.LINK}" target="_blank"><b><u>Link to Document</u></b></a>`;
                break;
            case 'agis':
                popupHTML = `Address <strong>${topFeature.properties.ADDRESS}</strong><br>Date of photography: <strong>${topFeature.properties.DATE}</strong><br>Link to Page: <a href="${topFeature.properties.URL}" target="_blank"><b><u>Link to Page</u></b></a>`;
                break;
            case 'conservancy districts':
                popupHTML = `Conservancy District: <strong>${topFeature.properties.CONS_DIST}</strong><br><br>${topFeature.properties.CONS_DIST} Elevation: <strong>${topFeature.properties.CONS_ELEV} ${topFeature.properties.CONS_DATUM}</strong><br>${topFeature.properties.CONS_DIST} Water Elevation: <strong>${topFeature.properties.WATER_ELEV} ${topFeature.properties.CONS_DATUM}</strong><br><br>Conservancy District Contour: <strong>${topFeature.properties.CONT_NAVD} ${topFeature.properties.CONV_DATUM}</strong><br><br>Description: ${topFeature.properties.CONS_DESC}`;
                break;
            case 'conservation':
                popupHTML = `CCF Parcel: <strong>${topFeature.properties.CCF_ID}</strong><br><br>The light green parcels are approximate, the dark green parcels are more accurate.`;
                break;
            case 'endangered species':
                popupHTML = `Estimated Habitat ID: <strong>${topFeature.properties.ESTHAB_ID}</strong><br>Priority Habitat ID: <strong>${topFeature.properties.PRIHAB_ID}</strong>`;
                break;
            case 'vernal pools': 
                popupHTML = `Vernal Pool ID: <strong>${topFeature.properties.cvp_num}</strong><br>Certified: <strong>${topFeature.properties.certified}</strong><br>Criteria: <strong>${topFeature.properties.criteria}</strong>`;
                break;
            case 'historic':
                popupHTML = `Historic District: ${topFeature.properties.District}<br>Status / Reference: <strong>${topFeature.properties.Status}</strong><br>Documentation: <a href="${topFeature.properties.URL}" target="_blank"><b><u>Link to Document</u></b></a>`;
                break;
            case 'intersection':
                popupHTML = `Intersection: <strong>${topFeature.properties.Int_Name}</strong><br>Webpage: <a href="${topFeature.properties.Link}" target="_blank"><b><u>Link to Page</u></b></a>`;
                break;
            case 'stories':
                popupHTML = `Number of Stories: <strong>${topFeature.properties.STORIES}</strong><br>Building Description: <strong>${topFeature.properties.BLD_DESC}</strong><br>Zoning: <strong>${topFeature.properties.ZONING}</strong>`;
                break;
            case 'zone II':
                popupHTML = `Zone II number: <strong>${topFeature.properties.ZII_NUM}</strong><br>Water Supplier: <strong>${topFeature.properties.SUPPLIER}</strong><br>Town: <strong>${topFeature.properties.TOWN}</strong>`;
                break;
            case 'soils':
                popupHTML = `Numeric State Legend: <strong>${topFeature.properties.MUSYM}</strong><br>Published Map Unit: <strong>${topFeature.properties.MUS_TXT}</strong><br><strong>${topFeature.properties.MUS_DESC}</strong>`;
                break;
        }

        if (popupHTML) {
            new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(popupHTML).addTo(map);
        }
    });
});

function handleMarkerPlacement(lngLat) {
    const { lat, lng } = lngLat;
    setPinPosition(lat, lng);
    if (marker) marker.remove();
    marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
    placingPoint = false;
    document.getElementById('pointButton').classList.remove('active');
    map.getCanvas().style.cursor = '';
}