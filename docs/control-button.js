let placingPoint = false;
let marker = null;
const markerCoordinates = { lat: null, lng: null };

function setPinPosition(lat, lng) {
    markerCoordinates.lat = lat;
    markerCoordinates.lng = lng;
    console.log("Pin position updated:", markerCoordinates);
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