// SHARE CONTROL BUTTON SCRIPT

// ============================================================================
// HELPER FUNCTIONS FOR SHARE FUNCTIONALITY
// ============================================================================

function obtainZoom() {
    zoom.z = map.getZoom(); // Get the zoom level and store it
    return zoom.z; // Return the zoom level
}

function generateShareLink(map, zoomLevel, layerIds) {
    let baseUrl = window.location.origin + window.location.pathname; // Current page URL
    // Encode each layer name to avoid issues with special characters and spaces
    let encodedLayerIds = layerIds.map(layerId => encodeURIComponent(layerId));
    // Construct the URL
    let shareUrl = `${baseUrl}?zoom=${zoomLevel}&lat=${markerCoordinates.lat}&lng=${markerCoordinates.lng}&layers=${encodedLayerIds.join(',')}`;
    
    return shareUrl;
}

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

// ============================================================================
// MAIN SHARE FUNCTION (event listener)
// ============================================================================

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