// CUSTOM PRINT CONTROL BUTTON SCRIPT

// ============================================================================
// HELPER FUNCTIONS FOR CUSTOM PRINT FUNCTIONALITY
// ============================================================================

/**
 * Helper function to introduce a delay.
 * @param {number} ms - The number of milliseconds to wait.
 * @returns {Promise} A promise that resolves after the specified delay.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Returns the HTML string for the custom print input form.
 * This structure is similar to the getScaleBoxHTML function.
 * @returns {string} The HTML for the form.
 */
function getCustomPrintFormHTML() {
    return `
        <strong style="display:block; text-align:center; margin-bottom:8px;">Custom Print Details</strong>
        
        <input type="text" id="custom-company-name" placeholder="Company Name" style="width: 100%; margin-bottom: 5px; padding: 5px; box-sizing: border-box; border-radius: 3px; border: 1px solid #ccc;">
        <input type="text" id="custom-client-name" placeholder="Client Name" style="width: 100%; margin-bottom: 5px; padding: 5px; box-sizing: border-box; border-radius: 3px; border: 1px solid #ccc;">
        <input type="text" id="custom-address" placeholder="Company Address" style="width: 100%; margin-bottom: 5px; padding: 5px; box-sizing: border-box; border-radius: 3px; border: 1px solid #ccc;">
        <input type="text" id="custom-website" placeholder="Website" style="width: 100%; margin-bottom: 5px; padding: 5px; box-sizing: border-box; border-radius: 3px; border: 1px solid #ccc;">
        <input type="text" id="custom-phone" placeholder="Phone Number" style="width: 100%; margin-bottom: 5px; padding: 5px; box-sizing: border-box; border-radius: 3px; border: 1px solid #ccc;">
        <input type="text" id="custom-property-address" placeholder="Property Address" style="width: 100%; margin-bottom: 10px; padding: 5px; box-sizing: border-box; border-radius: 3px; border: 1px solid #ccc;">
        
        <label for="custom-scale-input" style="display:block; margin-bottom:5px;">Scale (feet per inch):</label>
        <input type="number" id="custom-scale-input" style="width: 100%; margin-bottom: 10px; padding: 5px; box-sizing: border-box; border-radius: 3px; border: 1px solid #ccc;">

        <button id="custom-print-submit" style="display: block; margin: 0 auto 8px auto; width: 90%; height: 24px; padding: 0; font-size: 12px;">Submit</button>
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

    // Validate that a scale was entered
    if (!printData.scale || isNaN(printData.scale) || Number(printData.scale) <= 0) {
        alert('Please enter a valid scale in feet per inch.');
        return;
    }

    console.log("Processing custom print with data:", printData);

    // Hide the form after submission
    const customPrintBox = document.getElementById("custom-print-box");
    if(customPrintBox) customPrintBox.style.display = 'none';

    // Pass the collected data to the print generation function
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
                    ${getLegendForPrint()} 
                </div>
                <div class="inner-frame">
                    <span class="gis-map">GIS Map - Page ${pageNumber}</span>
                    <span class="disclaimer">This map is for illustrative purposes only.</span>
                    <span class="date">${currentDate}</span>
                    ${getPrintScaleBarHTML(map)}
                    <span class="sources">Map sources include: MassGIS, Mapbox, OpenStreetMap</span>
                </div>
            </div>
        </div>
    `;
}


/**
 * Takes the user-provided data and generates the multi-page print preview.
 * This is an async function to allow us to wait for the map to fully render each page.
 * @param {object} printData An object containing all the user-submitted information.
 */
async function generateMultiPagePrintout(printData) {
    console.log("Generating multi-page printout with data:", printData);
    
    const pageConfigs = [
        { page: 1, layers: ['parcel highlight', 'contours', 'floodplain'] },
        { page: 2, layers: ['parcel highlight', 'satellite', 'acec'] },
        { page: 3, layers: ['parcel highlight', 'contours', 'DEP wetland'] },
        { page: 4, layers: ['parcel highlight', 'satellite', 'endangered species'] }
    ];

    let fullHtml = '';

    if (typeof setMapToScale === 'function') {
        setMapToScale(Number(printData.scale));
    } else {
        console.error("setMapToScale function not found. Please ensure control-scale.js is loaded.");
        return;
    }
    
    if(marker) {
        map.setCenter(marker.getLngLat());
    }

    const allToggleableLayers = ['satellite', 'parcels', 'parcel highlight', 'contours', 'agis', 'historic', 'floodplain', 'acec', 'DEP wetland', 'endangered species', 'zone II', 'soils', 'conservancy districts', 'zoning', 'conservation', 'sewer', 'sewer plans', 'stories', 'intersection'];
    const initiallyVisibleLayers = listVisibleLayers(map, allToggleableLayers);
    
    allToggleableLayers.forEach(layerId => {
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', 'none');
        }
    });

    for (const config of pageConfigs) {
        // Toggle the specific layers for the current page
        config.layers.forEach(layerId => {
            if (map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, 'visibility', 'visible');
            }
        });

        // Wait for the map to become idle, ensuring all base tiles are loaded.
        await new Promise(resolve => map.once('idle', resolve));

        // Add a short, extra delay to ensure complex labels are rendered.
        await sleep(500); 

        // Now that the map is fully rendered, capture the canvas
        const mapCanvas = map.getCanvas();
        const mapImageSrc = mapCanvas.toDataURL();
        
        // Generate the HTML for the current page
        fullHtml += getPageHTML(printData, mapImageSrc, config.page);

        // Hide the layers again for the next iteration
        config.layers.forEach(layerId => {
            if (map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, 'visibility', 'none');
            }
        });
    }

    // Restore the layers that were originally visible before we started
    initiallyVisibleLayers.forEach(layerId => {
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', 'visible');
        }
    });

    // Open a new window and print
    const win = window.open('', '_blank');
    if (win) {
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Custom Map Printout</title>
                <link rel="stylesheet" href="https://east-southeast-llc.github.io/ese-map-viewer/css/globals.css?v=2" type="text/css" />
            </head>
            <body class="print-body">
                ${fullHtml}
            </body>
            </html>
        `);
        win.document.close();
        win.onload = () => {
            win.print();
            win.close();
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
