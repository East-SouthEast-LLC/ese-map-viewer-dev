// docs/main-app.js

/**
 * dynamically adjusts map and menu height to fit the viewport below the site header.
 */
function adjustLayout() {
  const header = document.querySelector('#header'); // gets the squarespace header element
  const mapContainer = document.getElementById('map');
  const menuContainer = document.getElementById('menu');
  const geocoderContainer = document.getElementById('geocoder-container');

  if (!header || !mapContainer || !menuContainer) return;

  const headerHeight = header.offsetHeight;
  const buffer = 70; // a 70px buffer to make the map shorter

  // calculate the available height for the map
  const availableHeight = window.innerHeight - headerHeight - buffer;

  // apply the new height to the map and menus
  mapContainer.style.height = `${availableHeight}px`;
  menuContainer.style.maxHeight = `${availableHeight}px`;
  if (geocoderContainer) {
    geocoderContainer.style.maxHeight = `${availableHeight}px`;
  }
}

/**
 * sets up event listeners to run the layout adjustment
 */
function setupLayoutAdjustments() {
    adjustLayout();
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(adjustLayout, 100);
    });
}

/**
 * navigates to a new panorama by closing the current modal and opening a new one.
 * @param {number} newIndex - the index of the new panorama in the global panoramaorder array.
 */
function navigateToPano(newIndex) {
    const existingModal = document.getElementById('pano-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    openPanoModal(newIndex);
}

/**
 * asynchronously preloads the next and previous panorama images to improve navigation speed.
 * @param {number} currentIndex - the index of the currently viewed panorama.
 */
function preloadPanoImages(currentIndex) {
    if (!window.panoramaOrder || window.panoramaOrder.length === 0) return;

    const totalPanos = window.panoramaOrder.length;
    const nextIndex = (currentIndex + 1) % totalPanos;
    const prevIndex = (currentIndex - 1 + totalPanos) % totalPanos;

    const nextPanoFile = window.panoramaOrder[nextIndex];
    const prevPanoFile = window.panoramaOrder[prevIndex];

    // create image objects to trigger browser caching
    const nextImage = new Image();
    nextImage.src = `https://www.ese-llc.com/s/${nextPanoFile}`;
    
    const prevImage = new Image();
    prevImage.src = `https://www.ese-llc.com/s/${prevPanoFile}`;
}

/**
 * applies a temporary highlight to the viewed panorama dot
 * @param {string} panoId - the filename id of the panorama feature
 */
function highlightViewedPano(panoId) {
    if (panoId && map.getSource('panoramas-source')) {
        map.setFeatureState({ source: 'panoramas-source', id: panoId }, { viewed: true });
        setTimeout(() => {
            map.setFeatureState({ source: 'panoramas-source', id: panoId }, { viewed: false });
        }, 12000); // 12 seconds
    }
}

/**
 * creates and displays the panorama viewer modal
 * @param {number} currentIndex - the index of the panorama to display
 */
function openPanoModal(currentIndex) {
    if (currentIndex < 0 || currentIndex >= window.panoramaOrder.length) return;

    const filename = window.panoramaOrder[currentIndex];
    lastViewedPanoId = filename; 
    
    // Log the panorama view event to Google Analytics.
    trackEvent('view_panorama', {
        pano_id: filename
    });

    const panoViewerUrl = `https://www.ese-llc.com/pano-viewer?pano=${filename}`;

    const modal = document.createElement('div');
    modal.id = 'pano-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 2000; display: flex; justify-content: center; align-items: center;';
    
    const iframeContainer = document.createElement('div');
    iframeContainer.style.cssText = 'position: relative; width: 90%; height: 90%; background: #000;';

    const iframe = document.createElement('iframe');
    iframe.src = panoViewerUrl;
    iframe.style.cssText = 'width: 100%; height: 100%; border: none;';

    const arrowBtnStyle = `position: absolute; top: 50%; transform: translateY(-50%); background-color: rgba(0,0,0,0.5); color: white; border: none; font-size: 30px; cursor: pointer; padding: 10px; z-index: 10;`;
    
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '&lt;';
    prevBtn.style.cssText = arrowBtnStyle + 'left: 10px;';
    prevBtn.onclick = function(event) {
        event.preventDefault();
        event.stopPropagation();
        const newIndex = (currentIndex - 1 + window.panoramaOrder.length) % window.panoramaOrder.length;
        navigateToPano(newIndex);
    };

    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '&gt;';
    nextBtn.style.cssText = arrowBtnStyle + 'right: 10px;';
    nextBtn.onclick = function(event) {
        event.preventDefault();
        event.stopPropagation();
        const newIndex = (currentIndex + 1) % window.panoramaOrder.length;
        navigateToPano(newIndex);
    };

    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'X';
    closeBtn.style.cssText = `position: absolute; top: 10px; right: 10px; z-index: 10; background: white; border: none; font-size: 20px; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;`;
    closeBtn.onclick = function() {
        document.body.removeChild(modal);
        highlightViewedPano(lastViewedPanoId);
    };

    iframeContainer.appendChild(iframe);
    iframeContainer.appendChild(prevBtn);
    iframeContainer.appendChild(nextBtn);
    iframeContainer.appendChild(closeBtn);
    modal.appendChild(iframeContainer);
    document.body.appendChild(modal);

    preloadPanoImages(currentIndex);
}


// --- main application state ---
setupLayoutAdjustments();
let marker = null;
const markerCoordinates = { lat: null, lng: null };
let lastViewedPanoId = null; 

// --- mapbox initialization ---
mapboxgl.accessToken = 'pk.eyJ1IjoiZXNlLXRvaCIsImEiOiJja2Vhb24xNTEwMDgxMzFrYjVlaTVjOXkxIn0.IsPo5lOndNUc3lDLuBa1ZA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ese-toh/ckh2ss32s06i119paer9mt67h',
});

// --- mapbox observers and controls ---
const mapContainer = map.getContainer();
const resizeObserver = new ResizeObserver(() => map.resize());
resizeObserver.observe(mapContainer);

const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
});
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

// --- dynamic script loading ---
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
        
        script.src = `https://east-southeast-llc.github.io/ese-map-viewer-dev/docs/layers/${scriptName}.js?v=2`;
        
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Script load error for ${layerName}`));
        document.head.appendChild(script);
    });
}

// --- map on load logic ---
map.on('load', function () {
    loadLayerScript('towns').then(() => {
        fetch('https://east-southeast-llc.github.io/ese-map-viewer-dev/docs/town-config.json')
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
                            menuScript.src = 'https://east-southeast-llc.github.io/ese-map-viewer-dev/docs/toggleable-menu.js?v=2';
                            menuScript.onload = function () {
                                setupToggleableMenu();
                                const drawOrder = [
                                    'satellite', 'parcels', 'zoning', 'conservancy districts',
                                    'conservation', 'sewer', 'sewer plans', 'sewer-plans-outline',
                                    'stories', 'intersection', 'soils', 'soils-outline', 'soils-labels',
                                    'zone II', 'zone-ii-outline', 'zone-ii-labels',
                                    'DEP wetland', 'dep-wetland-line', 'dep-wetland-labels',
                                    'endangered species', 'endangered-species-labels', 'vernal-pools', 'vernal-pools-labels',
                                    'acec', 'floodplain', 'LiMWA', 'floodplain-line', 'floodplain-labels',
                                    'agis', 'historic', 'towns', 'private properties upland',
                                    'contours', 'lidar contours', 'lidar-contour-labels', 'parcel highlight', 'panoramas'
                                ];
                                drawOrder.forEach(layerId => {
                                    if (map.getLayer(layerId)) map.moveLayer(layerId);
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

    map.on('click', 'panoramas', function(e) {
        if (e.features.length > 0) {
            const feature = e.features[0];
            const currentIndex = window.panoramaOrder.indexOf(feature.id);
            if (currentIndex !== -1) {
                openPanoModal(currentIndex);
            }
        }
    });

    map.on('click', (e) => {
        if (placingPoint) {
            handleMarkerPlacement(e.lngLat);
            return;
        }
        const visibleLayers = (window.toggleableLayerIds || []).filter(id => 
            id !== 'tools' && map.getLayer(id) && map.getLayoutProperty(id, 'visibility') === 'visible'
        );
        const features = map.queryRenderedFeatures(e.point, { layers: visibleLayers });
        if (!features.length) return;
        
        const topFeature = features[0];
        let popupHTML = '';
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

    // Log the point placement event to Google Analytics.
    trackEvent('place_marker', {
    });
}