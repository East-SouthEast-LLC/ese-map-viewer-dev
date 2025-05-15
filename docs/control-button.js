let placingPoint = false;
let marker = null;
const markerCoordinates = { lat: null, lng: null };

function setPinPosition(lat, lng) {
    markerCoordinates.lat = lat;
    markerCoordinates.lng = lng;
    console.log("Pin position updated:", markerCoordinates);
}

function getMarkerCoordinates() {
    if (marker) {
        let { lng, lat } = marker.getLngLat();
        console.log("Marker coordinates:", { lng, lat });
        return { lng, lat };
    }
    console.log("No marker is currently placed.");
    return null;
}

function dropPinAtCenter() {
    if (marker) {
        // A marker exists, center the map on it
        let { lng, lat } = marker.getLngLat();
        markerCoordinates.lng = lng;  // update the coordinate values
        markerCoordinates.lat = lat;
        map.flyTo({ center: markerCoordinates, essential: true });
    } else {
        // No marker exists, create one at the map's center
        let center = map.getCenter();
        marker = new mapboxgl.Marker().setLngLat(center).addTo(map);
        markerCoordinates.lng = center.lng;
        markerCoordinates.lat = center.lat;
    }

    console.log(`Marker Coordinates: ${markerCoordinates.lng}, ${markerCoordinates.lat}`);
    return markerCoordinates;
}

// Point button: activate placement mode
document.getElementById('pointButton').addEventListener('click', function () {
    placingPoint = true;
    map.getCanvas().style.cursor = 'crosshair';
    console.log("Click on the map to drop a point.");
});

// Map click: drop point if active
map.on('click', function (event) {
    if (!placingPoint) return;
    const { lat, lng } = event.lngLat;
    setPinPosition(lat, lng);

    if (marker) marker.remove();
    marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);

    placingPoint = false;
    map.getCanvas().style.cursor = '';
});

// Center point button
document.getElementById('pointCButton').addEventListener('click', function () {
    const center = dropPinAtCenter();
    console.log("Centered marker at:", center);
});

// Point off button
document.getElementById('pointOffButton').addEventListener('click', function () {
    if (marker) {
        marker.remove();
        marker = null;
    }
    markerCoordinates.lat = null;
    markerCoordinates.lng = null;
    console.log("Marker removed.");
});

// == PRINT AREA ===================================================
document.addEventListener("DOMContentLoaded", function () {
    const pareaButton = document.getElementById('pareaButton');
    const scaleBoxDiv = document.getElementById('scale-box');
    let boundingBoxVisible = false; // Track visibility

    if (!pareaButton || !scaleBoxDiv) {
        console.error("Required elements not found in the DOM");
        return;
    }

    // Hide scale-box on page load
    scaleBoxDiv.style.display = 'none';

    pareaButton.addEventListener('click', () => {
        if (boundingBoxVisible) {
            removeBoundingBox();
            scaleBoxDiv.style.display = 'none'; // Hide scale box
        } else {
            updateBoundingBox();
            scaleBoxDiv.style.display = 'block'; // Show scale box
        }
        boundingBoxVisible = !boundingBoxVisible; // Toggle state
    });

    map.on('moveend', () => {
        if (boundingBoxVisible) {
            updateBoundingBox();
        }
    });

    map.on('zoom', () => {
        if (boundingBoxVisible) {
            updateBoundingBox();
        }
    });
});
function updateBoundingBox() {
    if (!map) return; // Ensure map is ready

    const center = map.getCenter(); // Get the map's center point (lng, lat)
    const bounds = map.getBounds(); // Get the map's bounds

    const northLat = bounds.getNorth(); // North bound of map
    const centerLat = center.lat; // Latitude of the map center

    // Calculate the distance from center to the top of the visible map in meters
    const halfHeightMeters = turf.distance(
        [center.lng, center.lat], // Center point
        [center.lng, northLat], // North point
        { units: 'meters' }
    );

    // Calculate the half-width using the 75/80 ratio in meters
    const halfWidthMeters = halfHeightMeters * 75 / 80;

    // Convert distances back into lat/lng
    const north = centerLat + (halfHeightMeters / 111320); // Convert meters to lat
    const south = centerLat - (halfHeightMeters / 111320); // Convert meters to lat

    // Convert width (meters) to longitude difference
    const lngDiff = halfWidthMeters / (111320 * Math.cos(centerLat * (Math.PI / 180)));

    const east = center.lng + lngDiff;
    const west = center.lng - lngDiff;

    // Compute diagonal distance for scale calculation
    const diagonalMeters = turf.distance(
        [west, north], [east, south], { units: 'meters' }
    );
    const diagonalFeet = diagonalMeters * 3.28084; // Convert meters to feet

    // Compute scale: 1" = X feet
    const mapDiagonalInches = Math.sqrt(7.5 ** 2 + 8.0 ** 2);
    const scaleFeetPerInch = Math.round(diagonalFeet / mapDiagonalInches);

    // Update scale-box text
    document.getElementById('scale-box').innerText = `1" = ${scaleFeetPerInch} feet`;

    // Remove any existing bounding box before adding a new one
    removeBoundingBox();

    // Create a new bounding box using the calculated lat/lng values
    map.addSource('boundingBox', {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [west, north], [east, north], 
                    [east, south], [west, south], 
                    [west, north]  // Close the box
                ]]
            }
        }
    });

    map.addLayer({
        id: 'boundingBox',
        type: 'line',
        source: 'boundingBox',
        layout: {},
        paint: {
            'line-color': '#ff0000',
            'line-width': 2,
            'line-dasharray': [4, 2]
        }
    });
}
function removeBoundingBox() {
    if (map.getLayer('boundingBox')) {
        map.removeLayer('boundingBox');
    }
    if (map.getSource('boundingBox')) {
        map.removeSource('boundingBox');
    }
}


// Add event listener to the SHARE button
document.getElementById('shareButton').addEventListener('click', function() {
    // If a marker exists, center the map on it
    if (window.marker) {
        map.flyTo({ center: window.marker.getLngLat(), essential: true });
    }

    // Drop a new pin at the center (overwriting the existing one)
    let markerCoordinates = dropPinAtCenter();
    let zoomLevel = obtainZoom();  // Get the zoom level

    // Get visible layers dynamically using the listVisibleLayers function
    let allLayerIds = ['satellite', 'parcels', 'parcel highlight', 'contours', 'agis', 'historic', 'floodplain', 'acec', 'DEP wetland', 'endangered species', 'zone II', 'soils', 'conservancy districts', 'zoning', 'conservation', 'sewer', 'stories', 'intersection', 'towns', 'placeholder', 'another placeholder']; // All available layers
    let visibleLayerIds = listVisibleLayers(map, allLayerIds); // Get only the visible layers

    // Generate the shareable link with the visible layers
    let shareLink = generateShareLink(map, zoomLevel, visibleLayerIds);

    console.log("Share this link:", shareLink); // Output the link to console (or show it to the user)
    showSharePopup(shareLink); // Show the share popup
});

// Function to create and display the share link popup
function showSharePopup(shareLink) {
    // Create the modal container
    let modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.padding = "20px";
    modal.style.background = "#fff";
    modal.style.boxShadow = "0px 4px 10px rgba(0,0,0,0.2)";
    modal.style.borderRadius = "10px";
    modal.style.textAlign = "center";
    modal.style.zIndex = "1000";

    // Create the link display
    let linkDisplay = document.createElement("input");
    linkDisplay.type = "text";
    linkDisplay.value = shareLink;
    linkDisplay.style.width = "100%";
    linkDisplay.style.marginBottom = "10px";
    linkDisplay.style.padding = "5px";
    linkDisplay.style.textAlign = "center";
    linkDisplay.readOnly = true;

    // Create the copy button
    let copyButton = document.createElement("button");
    copyButton.innerText = "Copy Link";
    copyButton.style.marginRight = "10px";
    copyButton.onclick = function () {
        navigator.clipboard.writeText(shareLink).then(() => {
        //    alert("Link copied to clipboard!");
        });
        document.body.removeChild(modal); // Close popup
    };

    // Create the close button
    let closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.onclick = function () {
        document.body.removeChild(modal); // Close popup
    };
    if (marker) {
        marker.remove();
        marker = null;  // Nullify the marker reference to ensure it's cleared
    }
    // Add elements to modal
    modal.appendChild(linkDisplay);
    modal.appendChild(copyButton);
    modal.appendChild(closeButton);

    // Add modal to document
    document.body.appendChild(modal);
}

function getFrameCoordinates(map) {
    // Get the map bounds (visible area in coordinates)
    const bounds = map.getBounds();

    // Get the map size in pixels
    const mapContainer = map.getContainer();
    const mapWidth = mapContainer.clientWidth;
    const mapHeight = mapContainer.clientHeight;

    // Define positions in the viewport (normalized for frame points)
    const positions = {
        upperRight: { x: mapWidth, y: 0 }, // Top-right corner
        middle: { x: mapWidth / 2, y: mapHeight / 2 }, // Center
        lowerLeft: { x: 0, y: mapHeight }, // Bottom-left corner
    };

    // Convert viewport positions to geographical coordinates
    const coordinates = {
        upperRight: map.unproject([positions.upperRight.x, positions.upperRight.y]).toArray(),
        middle: map.unproject([positions.middle.x, positions.middle.y]).toArray(),
        lowerLeft: map.unproject([positions.lowerLeft.x, positions.lowerLeft.y]).toArray(),
    };

    return coordinates;
}

function getPrintingFrameCoordinates(map, frameElement) {
    if (!frameElement) {
        console.error("frameElement is not defined or is invalid.");
        return null;
    }

    // Ensure the map container is valid
    if (!map || !map.getContainer()) {
        console.error("Map container is not defined.");
        return null;
    }

    // Get the printing frame dimensions and offsets
    const frameRect = frameElement.getBoundingClientRect();
    const mapRect = map.getContainer().getBoundingClientRect();

    // Calculate relative positions of the frame within the map
    const frameTopLeft = [frameRect.left - mapRect.left, frameRect.top - mapRect.top];
    const frameBottomRight = [
        frameRect.right - mapRect.left,
        frameRect.bottom - mapRect.top,
    ];

    // Define positions in the printing frame (Middle point)
    const positions = {
        middle: {
            x: (frameTopLeft[0] + frameBottomRight[0]) / 2,
            y: (frameTopLeft[1] + frameBottomRight[1]) / 2,
        },
    };

    // Convert printing frame positions to geographical coordinates (map.unproject)
    const coordinates = {
        middle: map.unproject([positions.middle.x, positions.middle.y]).toArray(),
    };

    return coordinates;
}

// get centroids in frame
function getCentroidsInFrame(map, layerId, frameElement) {
    // Step 1: Get the printing frame coordinates (returns pixel coordinates)
    const frameCoordinates = getPrintingFrameCoordinates(map, frameElement);

    // Step 2: Query all features in the specified layer within visible bounds
    const features = map.queryRenderedFeatures({
        layers: [layerId], // Specify the layer (e.g., 'floodplain')
    });

    // Step 3: Process each feature to calculate centroids
    const centroids = features.map(feature => {
        const coordinates = feature.geometry.coordinates;

        // Skip unsupported geometries
        if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon') {
            console.warn(`Unsupported geometry type: ${feature.geometry.type}`);
            return null;
        }

        // Calculate centroid based on geometry type
        let centroid;
        if (feature.geometry.type === 'Polygon') {
            centroid = getPolygonCentroid(coordinates);
        } else if (feature.geometry.type === 'MultiPolygon') {
            centroid = getMultiPolygonCentroid(coordinates);
        }

        // Ensure centroid calculation succeeded
        if (!centroid) {
            console.warn("Centroid calculation failed for feature:", feature.id);
            return null;
        }

        // Step 4: Check if centroid is within the printing frame bounds
        const [centroidX, centroidY] = centroid;
        const centroidPixel = map.project([centroidX, centroidY]); // Convert to pixel coordinates

        const isWithinFrame =
            centroidPixel.x >= frameCoordinates.lowerLeft[0] &&
            centroidPixel.x <= frameCoordinates.upperRight[0] &&
            centroidPixel.y >= frameCoordinates.lowerLeft[1] &&
            centroidPixel.y <= frameCoordinates.upperRight[1];

        if (isWithinFrame) {
            return { centroid, featureId: feature.id };
        }

        return null; // Skip features outside the printing frame
    }).filter(Boolean); // Remove null entries

    return centroids;
}

// Helper function to calculate the centroid of a simple Polygon
function getPolygonCentroid(coordinates) {
    const flatCoords = coordinates[0]; // Use the first ring (outer boundary)
    const xSum = flatCoords.reduce((sum, coord) => sum + coord[0], 0);
    const ySum = flatCoords.reduce((sum, coord) => sum + coord[1], 0);
    const centroidX = xSum / flatCoords.length;
    const centroidY = ySum / flatCoords.length;

    return [centroidX, centroidY];
}

// Helper function to calculate the centroid of a MultiPolygon
function getMultiPolygonCentroid(coordinates) {
    // Return the centroid of the first polygon in the MultiPolygon
    return getPolygonCentroid(coordinates[0]);
}


//**************************************************************** Scale Zoom
document.addEventListener("DOMContentLoaded", function () {
    const scaleZoomButton = document.getElementById("scaleZoom");
    const geocoderContainer = document.getElementById("geocoder-container");

    if (!scaleZoomButton || !geocoderContainer) {
        console.error("Required elements not found in the DOM.");
        return;
    }

    // Create the dropdown element
    const scaleDropdown = document.createElement("div");
    scaleDropdown.id = "scaleDropdown";
    scaleDropdown.style.display = "none"; // Hidden initially
    scaleDropdown.style.background = "white";
    scaleDropdown.style.padding = "5px";
    scaleDropdown.style.borderRadius = "5px";
    scaleDropdown.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
    scaleDropdown.style.width = "200px";
    scaleDropdown.style.boxSizing = "border-box";

    // Dropdown content including scale select and zoom tracking inputs
    scaleDropdown.innerHTML = `
        <select id="scaleSelect" style="width: 100%; margin-bottom: 5px;">
            <option selected>[Current scale]</option>
            <option value="50">1" = 50'</option>
            <option value="100">1" = 100'</option>
            <option value="250">1" = 250'</option>
            <option value="500">1" = 500'</option>
            <option value="1000">1" = 1000'</option>
            <option value="custom">[Custom Scale]</option>
        </select>
        <label for="zoomInput">Current Zoom:</label>
        <input type="text" id="zoomInput" readonly style="width: 100%; text-align: center; margin-bottom: 5px;">
        <input type="range" id="zoomSlider" min="0" max="22" step="0.01" style="width: 100%;">
    `;

    // Create a wrapper div to position the dropdown correctly
    const scaleDropdownWrapper = document.createElement("div");
    scaleDropdownWrapper.id = "scaleDropdownWrapper";
    scaleDropdownWrapper.style.display = "flex";
    scaleDropdownWrapper.style.flexDirection = "column";
    scaleDropdownWrapper.style.width = "100%";
    scaleDropdownWrapper.appendChild(scaleDropdown);

    // Append dropdown inside geocoder-container, below buttons
    geocoderContainer.appendChild(scaleDropdownWrapper);

    // Track if zoom listener was added
    let zoomListenerAdded = false;

    // Toggle dropdown and set up zoom tracking
    scaleZoomButton.addEventListener("click", function () {
        if (scaleDropdown.style.display === "none") {
            scaleDropdown.style.display = "block";

            // Add zoom event listener only once
            if (!zoomListenerAdded) {
                map.on('zoom', () => {
                    const currentZoom = map.getZoom().toFixed(2);
                    document.getElementById("zoomInput").value = currentZoom;
                    document.getElementById("zoomSlider").value = currentZoom;
                });
                zoomListenerAdded = true;
            }
        } else {
            scaleDropdown.style.display = "none";
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!geocoderContainer.contains(event.target) && event.target !== scaleZoomButton) {
            scaleDropdown.style.display = "none";
        }
    });
});


// ********************************** Global zoom functions
function updateZoom(newZoom) {
    const clampedZoom = Math.max(0, Math.min(22, newZoom));
    map.setZoom(clampedZoom);
    document.getElementById("zoomInput").value = clampedZoom.toFixed(2);
    document.getElementById("zoomSlider").value = clampedZoom;
}

function zoomIn(step) {
    updateZoom(map.getZoom() + step);
}

function zoomOut(step) {
    updateZoom(map.getZoom() - step);
}

// Initialize zoom UI
function createZoomDialog() {
    if (document.getElementById("zoomPopup")) return;

    const geocoderContainer = document.getElementById('geocoder-container');
    if (!geocoderContainer) {
        console.error("geocoder-container not found in the DOM.");
        return;
    }

    const zoomDialog = document.createElement("div");
    zoomDialog.id = "zoomPopup";
    zoomDialog.innerHTML = `
        <div style="background: white; padding: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 2000; border-radius: 8px; 
            width: 95%; max-width: 350px; min-width: 200px; position: absolute; bottom: -50px; left: 0; margin: 10px auto;">
            <div style="text-align: center; display: flex; justify-content: center; align-items: center;">
                <button style="font-size: 10px;" onclick="zoomOut(0.01)">-0.01</button>
                <button style="font-size: 10px;" onclick="zoomOut(0.1)">-0.1</button>
                <input type="number" id="zoomInput" value="${map.getZoom().toFixed(2)}" 
                    style="width: 50px; text-align: center;" onchange="updateZoom(parseFloat(this.value))" />
                <button style="font-size: 10px;" onclick="zoomIn(0.1)">+0.1</button>
				<button style="font-size: 10px;" onclick="zoomIn(0.01)">+0.01</button>
            </div>
        </div>`;

    geocoderContainer.appendChild(zoomDialog);

    const sliderDialog = document.createElement("div");
    sliderDialog.id = "sliderPopup";
    sliderDialog.innerHTML = `
        <div style="background: white; padding: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 1500; border-radius: 8px; 
            width: 95%; max-width: 350px; min-width: 200px; position: absolute; bottom: -110px; left: 0; margin: 10px auto;">
            <div style="text-align: center;">
                <div>Zoom Level</div>
                <input type="range" id="zoomSlider" min="0" max="22" step="0.01" 
                    value="${map.getZoom()}" style="width: 100%;" 
                    oninput="updateZoom(parseFloat(this.value))" />
            </div>
        </div>`;

    geocoderContainer.appendChild(sliderDialog);
}

function closeZoomDialog() {
    document.getElementById("zoomPopup")?.remove();
    document.getElementById("sliderPopup")?.remove();
}

map.on('zoom', () => {
    const currentZoom = map.getZoom().toFixed(2);
    document.getElementById("zoomInput").value = currentZoom;
    document.getElementById("zoomSlider").value = currentZoom;
});

// Toggle zoom dialog
let isZoomDialogOpen = false;
document.getElementById("zoomButton").addEventListener("click", function () {
    isZoomDialogOpen ? closeZoomDialog() : createZoomDialog();
    isZoomDialogOpen = !isZoomDialogOpen;
});


function adjustLabelsForPrint(map, frameElement) {
    // Step 1: Get the visible layers
    const visibleLayers = listVisibleLayers(map);
    const toggleableLayerIds = [
        'satellite', 'parcels', 'parcel highlight', 'contours', 'agis', 'historic', 'floodplain', 
        'acec', 'DEP wetland', 'priority habitat', 'estimated habitat', 'vernal pools', 
        'zone II', 'soils', 'conservancy districts', 'zoning', 'conservation', 
        'sewer', 'stories', 'intersection', 'towns'
    ];

    // Step 2: Loop through the main layers
    toggleableLayerIds.forEach(layerId => {
        // Check if the layer is visible
        if (visibleLayers.includes(layerId)) {
            const labelLayerId = `${layerId}-labels`; // Derive the label layer

            // Check if the label layer exists
            if (map.getLayer(labelLayerId)) {
                // Get the coordinates of the printing frame
                const frameCoordinates = getPrintingFrameCoordinates(map, frameElement);

                // Get centroids for features in the layer within the frame
                const centroids = getCentroidsInFrame(map, layerId, frameElement);

                // Step 3: Move the labels to the centroid positions
                centroids.forEach((centroid, index) => {
                    map.setFeatureState({
                        source: map.getLayer(layerId).source,
                        id: centroid.id // Assumes feature IDs are unique
                    }, { centroid: [centroid.x, centroid.y] });

                    // Optional: Add debugging or logging for moved labels
                    console.log(`Moved label for feature ${centroid.id} in ${labelLayerId} to (${centroid.x}, ${centroid.y})`);
                });

                // Update the label layer to use the new positions
                map.setLayoutProperty(labelLayerId, 'text-anchor', 'center'); // Optional adjustment
            } else {
                console.warn(`Label layer "${labelLayerId}" does not exist for layer "${layerId}".`);
            }
        }
    });
}


// List Visible Layers - the major Label IDs
function listVisibleLayers(map, layerIds) {
  if (!Array.isArray(layerIds)) {
    console.error("layerIds must be an array.");
    return [];
  }

  const visibleLayers = [];
  layerIds.forEach(layerId => {
    // Check if the layer exists in the map style
    if (map.getLayer(layerId)) {
      const visibility = map.getLayoutProperty(layerId, 'visibility');
      if (visibility === 'visible') {
        visibleLayers.push(layerId);  // Add visible layers to the array
      }
    } else {
      console.warn(`Layer "${layerId}" not found in the current map style.`);
    }
  });
  return visibleLayers;
}

function generateShareLink(map, zoomLevel, layerIds) {
    let baseUrl = window.location.origin + window.location.pathname; // Current page URL
    // Encode each layer name to avoid issues with special characters and spaces
    let encodedLayerIds = layerIds.map(layerId => encodeURIComponent(layerId));
    // Construct the URL
    let shareUrl = `${baseUrl}?zoom=${zoomLevel}&lat=${markerCoordinates.lat}&lng=${markerCoordinates.lng}&layers=${encodedLayerIds.join(',')}`;
    
    return shareUrl;
}

function obtainZoom() {
    zoom.z = map.getZoom(); // Get the zoom level and store it
    return zoom.z; // Return the zoom level
}



// Updated Print Button Functionality
document.getElementById('printButton').addEventListener('click', () => {
    map.once('render', () => {
        const canvas = map.getCanvas(); // Capture the map canvas
        const frameElement = document.querySelector('.frame'); // Reference to frame element

        // Call the adjustLabelsForPrint function
        adjustLabelsForPrint(map, frameElement);

        const win = window.open('', '_blank');
        const currentDate = new Date().toLocaleDateString(); // Format the date as needed
        if (win) {
            win.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Map Print</title>
                    <style>
                        @media print {
                            @page {
                                size: 8.5in 11in; /* Letter size, portrait orientation */
                                margin: 0; /* No additional margins */
                            }
                            body {
                                margin: 0;
                                padding: 0;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100%;
                            }
                        }
                        body {
                            background-color: transparent;
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            position: relative;
                            width: 8.5in;
                            height: 11in;
                        }
                        .frame {
                            width: calc(100% - 1in); /* 1/2" margins on both sides */
                            position: absolute;
                            left: 0.5in;
                            right: 0.5in;
                        }
                        .top-frame {
                            height: 8.0in;
                            border: 4px solid black; /* Frame border */
                            border-bottom: none; /* Remove bottom border */
                            position: relative;
                        }
                        .middle-line {
                            width: 100%;
                            height: 0px; /* Line thickness */
                            border-top: 4px solid black; /* Set color and thickness */
                            position: absolute;
                            top: 8in; /* Place it below the top frame */
                            left: 0;
                            z-index: 10; /* Ensure it appears above all other elements */
                            margin: 0; /* Remove margin to avoid any spacing issues */
                        }
                        .bottom-frame {
                            height: 2.0in;
                            border: 4px solid black; /* Frame border */
                            border-top: none; /* Remove top border */
                            display: flex;
                            align-items: center;
                            position: relative;
                        }
                        .map-container {
                            width: 100%;
                            height: 100%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .map-container img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover; /* Ensure the map scales properly */
                        }
                        .image-container {
                            width: 2in;
                            height: 100%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            margin-right: 4px; /* Optional space for alignment */
                        }
                        .image-container img {
                            width: 100%;
                            height: 100%;
                            object-fit: contain;
                        }
                        .inner-frame {
                            width: 2in;
                            height: 2in;
                            position: absolute;
                            right: 0; /* Position it to the right */
                            top: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            text-align: center;
                            padding: 4px;
                            border: 0px; /* Border set to 0px */
                            flex-direction: column; /* Stack text vertically */
                        }
                        .inner-frame span {
                            display: block;
                            margin-bottom: 4px; /* Space between lines */
                        }
                        .gis-map {
                            font-family: 'BankGothicMd', sans-serif;
                            font-style: italic;
                            font-size: 14px;
                        }
                        .date, .scale, .base-map {
                            font-family: Arial, sans-serif;
                        }
						.disclaimer {
							font-size: 9px;
						}
                        .date {
                            font-size: 11px;
                        }
                        .scale {
                            font-size: 11px;
                        }
						.sources {
							font-size: 10px;
						}
						.massgis {
							font-size: 10px;
						}
                        .base-map {
                            font-size: 10px;
                        }
                        .inner-frame a {
                            color: black;
                            text-decoration: none;
                        }
                    </style>
                </head>
                <body>
                    <div class="frame">
                        <div class="top-frame">
                            <div class="map-container">
							    <!-- Embed map image with markers -->
                                <img src="${canvas.toDataURL()}" alt="Map Image" />
                            </div>
                        </div>
                        <div class="middle-line"></div>
                        <div class="bottom-frame">
                            <div class="image-container">
                                <img src="https://static1.squarespace.com/static/536cf42ee4b0465238027de5/t/67a783e42bb54b7b434b79f1/1739031525647/ESE-GIS.jpg" alt="Company Logo" />
                            </div>
                            <div class="inner-frame">
                                <span class="gis-map">GIS Map</span>
								<span class="disclaimer">This map is for illustrative purposes only and is not adequate for legal boundary determination or regulatory interpretation.</span>
                                <span class="date">${currentDate}</span></br>
								<span class="sources">Map sources include:</span>
								<span class="massgis">Bureau of Geographic Information (MassGIS), Commonwealth of Massachusetts, Executive Office of Technology and Security Services</span>								
                                <span class="base-map">
                                    © <a href="https://www.mapbox.com/about/maps">Mapbox</a> </br>
                                    © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> </br>
                                    <strong><a href="https://apps.mapbox.com/feedback/" target="_blank">Improve this map, www.apps.mapbox.com/feedback</a></strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `);

            win.document.title = 'Map Print';
            win.document.close();

            win.onload = () => {
                win.print();
                win.close();
            };
        } else {
            alert("Popup blocked! Please allow popups for this site.");
        }
    });

    // Ensure the map fully renders before capturing it
    map.resize();
    map.triggerRepaint();
});

map.on('zoomend', () => {
    zoom.z = map.getZoom();
});