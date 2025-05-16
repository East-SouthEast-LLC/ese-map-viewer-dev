// SCALE CONTROL BUTTON SCRIPT

// ============================================================================
// HELPER FUNCTIONS FOR SCALE FUNCTIONALITY
// ============================================================================

// Function to create and configure the scale dropdown
function createScaleDropdown() {
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
    
    return scaleDropdown;
}

// Function to handle scale button click events
function toggleScaleDropdown(scaleDropdown, zoomListenerAdded) {
    if (scaleDropdown.style.display === "none") {
        scaleDropdown.style.display = "block";

        // Add zoom event listener only once
        if (!zoomListenerAdded) {
            map.on('zoom', () => {
                const currentZoom = map.getZoom().toFixed(2);
                document.getElementById("zoomInput").value = currentZoom;
                document.getElementById("zoomSlider").value = currentZoom;
            });
            return true;
        }
    } else {
        scaleDropdown.style.display = "none";
    }
    return zoomListenerAdded;
}

// Function to handle clicks outside the dropdown
function setupOutsideClickHandler(geocoderContainer, scaleZoomButton, scaleDropdown) {
    document.addEventListener("click", function (event) {
        if (!geocoderContainer.contains(event.target) && event.target !== scaleZoomButton) {
            scaleDropdown.style.display = "none";
        }
    });
}

// ============================================================================
// MAIN SCALE FUNCTION (event listener)
// ============================================================================

document.addEventListener("DOMContentLoaded", function () {
    const scaleZoomButton = document.getElementById("scaleZoom");
    const geocoderContainer = document.getElementById("geocoder-container");

    if (!scaleZoomButton || !geocoderContainer) {
        console.error("Required elements not found in the DOM.");
        return;
    }

    // Create the dropdown element
    const scaleDropdown = createScaleDropdown();

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
        zoomListenerAdded = toggleScaleDropdown(scaleDropdown, zoomListenerAdded);
    });

    // Close dropdown when clicking outside
    setupOutsideClickHandler(geocoderContainer, scaleZoomButton, scaleDropdown);
});
