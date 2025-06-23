// CUSTOM PRINT CONTROL BUTTON SCRIPT

// ============================================================================
// HELPER FUNCTIONS FOR CUSTOM PRINT FUNCTIONALITY
// ============================================================================

/**
 * Sets the visibility of a layer and all of its dependent layers.
 * This logic is based on the handling in toggleable-menu.js.
 * @param {string} layerId The main layer to toggle.
 * @param {string} visibility The desired visibility ('visible' or 'none').
 */
function setLayerVisibility(layerId, visibility) {
    if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visibility);
    }

    // Handle dependent layers based on the main layer ID
    if (layerId === 'floodplain') {
        map.setLayoutProperty('LiMWA', 'visibility', visibility);
        map.setLayoutProperty('floodplain-line', 'visibility', visibility);
        map.setLayoutProperty('floodplain-labels', 'visibility', visibility);
    }
    else if (layerId === 'DEP wetland') {
        map.setLayoutProperty('dep-wetland-line', 'visibility', visibility);
        map.setLayoutProperty('dep-wetland-labels', 'visibility', visibility);
    }
    else if (layerId === 'soils') {
        map.setLayoutProperty('soils-labels', 'visibility', visibility);
        map.setLayoutProperty('soils-outline', 'visibility', visibility);
    }
    else if (layerId === 'zone II') {
        map.setLayoutProperty('zone-ii-outline', 'visibility', visibility);
        map.setLayoutProperty('zone-ii-labels', 'visibility', visibility);
    }
    else if (layerId === 'endangered species') {
        map.setLayoutProperty('endangered-species-labels', 'visibility', visibility);
        map.setLayoutProperty('vernal-pools', 'visibility', visibility);
        map.setLayoutProperty('vernal-pools-labels', 'visibility', visibility);
    }
    else if (layerId === 'sewer plans') {
        map.setLayoutProperty('sewer-plans-outline', 'visibility', visibility);
    }
     else if (layerId === 'contours') {
        map.setLayoutProperty('contour-labels', 'visibility', visibility);
    }
}


/**
 * Returns the HTML string for the custom print input form.
 * @returns {string} The HTML for the form.
 */
function getCustomPrintFormHTML() {
    // Inline styles have been moved to globals.css
    return `
        <strong>Custom Print Details</strong>
        <input type="text" id="custom-company-name" placeholder="Company Name">
        <input type="text" id="custom-client-name" placeholder="Client Name">
        <input type="text" id="custom-address" placeholder="Company Address">
        <input type="text" id="custom-website" placeholder="Website">
        <input type="text" id="custom-phone" placeholder="Phone Number">
        <input type="text" id="custom-property-address" placeholder="Property Address">
        <label for="custom-scale-input">Scale (feet per inch):</label>
        <input type="number" id="custom-scale-input" placeholder="e.g., 200">
        <button id="custom-print-submit">Submit</button>
    `;
}

/**
 * Gathers the data from the input form and initiates the print generation process.
 */
function processCustomPrint() {
    const printData = {
        companyName: document.getElementById('custom-company-name').value,
        clientName: document.getElementById('custom-client-name').value,
        address: document.getElementById('custom-address').value,
        website: document.getElementById('custom-website').value,
        phone: document.getElementById('custom-phone').value,
        propertyAddress: document.getElementById('custom-property-address').value,
        scale: document.getElementById('custom-scale-input').value,
    };

    if (!printData.scale || isNaN(printData.scale) || Number(printData.scale) <= 0) {
        alert('Please enter a valid scale in feet per inch.');
        return;
    }

    const customPrintBox = document.getElementById("custom-print-box");
    if(customPrintBox) customPrintBox.style.display = 'none';

    generateMultiPagePrintout(printData);
}

/**
 * Generates the HTML for a single page of the printout.
 * @param {object} printData - The user-submitted information.
 * @param {string} mapImageSrc - The base64 encoded image of the map canvas.
 * @param {number} pageNumber - The current page number.
 * @returns {string} The complete HTML for a single print page.
 */
function getPageHTML(printData, mapImageSrc, pageNumber) {
    const currentDate = new Date().toLocaleDateString();
    return `
        <div class="frame">
            <div class="top-frame">
                <div class="map-container">
                    <img src="${mapImageSrc}" alt="Map Image for Page ${pageNumber}" />
                </div>
            </div>
            <div class="bottom-frame">
                <div class="custom-info-frame">
                    <span><strong>${printData.companyName}</strong></span>
                    <span>${printData.address}</span>
                    <span>${printData.website} | ${printData.phone}</span>
                    <hr style="width:100%; border:.5px solid black; margin:5px 0;">
                    <span><strong>Client:</strong> ${printData.clientName}</span>
                    <span><strong>Property:</strong> ${printData.propertyAddress}</span>
                </div>
                <div class="image-container">
                    <img src="https://static1.squarespace.com/static/536cf42ee4b0465238027de5/t/67a783e42bb54b7b434b79f1/1739031525647/ESE-GIS.jpg" alt="Company Logo" />
                </div>
                <div class="legend-frame">
                    <div class="legend-print-title">Legend & Layers</div>
                    ${getLegendForPrint()} 
                </div>
                <div class="inner-frame">
                    <span class="gis-map">GIS Map</span>
                    <span class="disclaimer">This map is for illustrative purposes only and is not adequate for legal boundary determination or regulatory interpretation.</span>
                    <span class="date">${currentDate}</span>
                    ${getPrintScaleBarHTML(map)}
                    <span class="sources">Map sources include:</span>
                    <span class="massgis">Bureau of Geographic Information (MassGIS), Commonwealth of Massachusetts, Executive Office of Technology and Security Services</span>
                    <span class="base-map">© <a href="https://www.mapbox.com/about/maps">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a><br>
                        <strong><a style="margin-top: 3px" href="https://apps.mapbox.com/feedback/" target="_blank">Improve this map, www.apps.mapbox.com/feedback</a></strong>
                    </span>
                </div>
            </div>
        </div>
    `;
}


/**
 * Takes the user-provided data and generates the multi-page print preview.
 * @param {object} printData An object containing all the user-submitted information.
 */
async function generateMultiPagePrintout(printData) {
    console.log("Generating multi-page printout with data:", printData);
    
    // Define the layer configurations for each page
    const pageConfigs = [
        { page: 1, layers: ['parcel highlight', 'contours', 'floodplain'] },
        { page: 2, layers: ['parcel highlight', 'satellite', 'acec'] },
        { page: 3, layers: ['parcel highlight', 'contours', 'DEP wetland'] },
        { page: 4, layers: ['parcel highlight', 'satellite', 'endangered species'] }
    ];

    let fullHtml = '';
    const allToggleableLayers = ['satellite', 'parcels', 'parcel highlight', 'contours', 'agis', 'historic', 'floodplain', 'acec', 'DEP wetland', 'endangered species', 'zone II', 'soils', 'conservancy districts', 'zoning', 'conservation', 'sewer', 'sewer plans', 'stories', 'intersection'];
    const initiallyVisibleLayers = listVisibleLayers(map, allToggleableLayers);
    
    // Set map scale and center
    if (typeof setMapToScale === 'function') {
        setMapToScale(Number(printData.scale));
    } else {
        console.error("setMapToScale function not found.");
        return;
    }
    if(marker) {
        map.setCenter(marker.getLngLat());
    }
    
    // Hide all toggleable layers to start fresh
    allToggleableLayers.forEach(layerId => setLayerVisibility(layerId, 'none'));


    for (const config of pageConfigs) {
        // Toggle the specific layers for the current page using the helper
        config.layers.forEach(layerId => setLayerVisibility(layerId, 'visible'));

        // Wait for the map to become idle after layer changes
        await new Promise(resolve => map.once('idle', resolve));

        // Capture the canvas
        const mapCanvas = map.getCanvas();
        const mapImageSrc = mapCanvas.toDataURL();
        
        // Generate the HTML for the current page
        fullHtml += getPageHTML(printData, mapImageSrc, config.page);

        // Hide the layers again for the next iteration using the helper
        config.layers.forEach(layerId => setLayerVisibility(layerId, 'none'));
    }

    // Restore original layer visibility
    initiallyVisibleLayers.forEach(layerId => setLayerVisibility(layerId, 'visible'));

    // Open a new window and print
    const win = window.open('', '_blank');
    if (win) {
        win.document.write(`
            <!DOCTYPE html><html><head><title>Custom Map Printout</title>
            <link rel="stylesheet" href="https://east-southeast-llc.github.io/ese-map-viewer/css/globals.css?v=2" type="text/css" />
            </head><body class="print-body">${fullHtml}</body></html>`);
        win.document.close();
        win.onload = () => {
            win.print();
            //win.close();
        };
    } else {
        alert("Popup blocked! Please allow popups for this site.");
    }
}


// ============================================================================
// MAIN CUSTOM PRINT FUNCTION (event listener)
// ============================================================================

document.addEventListener("DOMContentLoaded", function () {
    const customPrintButton = document.getElementById("customPrintButton");
    const customPrintBox = document.getElementById("custom-print-box");
    let customPrintVisibility = false;
    customPrintBox.style.display = 'none';

    if (!customPrintButton || !customPrintBox) {
        console.error("Required custom print elements not found in the DOM.");
        return;
    }
    
    function attachCustomPrintFormListeners() {
        const submitButton = document.getElementById('custom-print-submit');
        if (submitButton) {
            submitButton.addEventListener('click', processCustomPrint);
        }
    }

    function updateCustomPrintBox() {
        customPrintBox.innerHTML = getCustomPrintFormHTML();
        customPrintBox.style.display = 'block';
        attachCustomPrintFormListeners();
    }
    
    customPrintButton.addEventListener('click', () => {
        if (!marker) {
            alert('Please drop a pin on the map to set the center for your printout.');
            return;
        }

        customPrintVisibility = !customPrintVisibility;
        if (customPrintVisibility) {
            updateCustomPrintBox();
        } else {
            customPrintBox.style.display = 'none';
        }
    });    
});
