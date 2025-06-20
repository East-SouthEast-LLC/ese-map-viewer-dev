// CUSTOM PRINT CONTROL BUTTON SCRIPT

// ============================================================================
// STATE VARIABLES FOR PRINTING PROCESS
// ============================================================================
let fullHtml = '';
let printDataGlobal = {};
let pageConfigsGlobal = [];
let initiallyVisibleLayersGlobal = [];
let pageCounter = 0;


// ============================================================================
// HELPER FUNCTIONS FOR CUSTOM PRINT FUNCTIONALITY
// ============================================================================

/**
 * Returns the HTML string for the custom print input form.
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
    printDataGlobal = {
        companyName: document.getElementById('custom-company-name').value,
        clientName: document.getElementById('custom-client-name').value,
        address: document.getElementById('custom-address').value,
        website: document.getElementById('custom-website').value,
        phone: document.getElementById('custom-phone').value,
        propertyAddress: document.getElementById('custom-property-address').value,
        scale: document.getElementById('custom-scale-input').value,
    };

    if (!printDataGlobal.scale || isNaN(printDataGlobal.scale) || Number(printDataGlobal.scale) <= 0) {
        alert('Please enter a valid scale in feet per inch.');
        return;
    }

    const customPrintBox = document.getElementById("custom-print-box");
    if(customPrintBox) customPrintBox.style.display = 'none';

    generateMultiPagePrintout();
}

/**
 * Generates the HTML for a single page of the printout.
 * @param {string} mapImageSrc - The base64 encoded image of the map canvas.
 * @param {number} pageNumber - The current page number.
 * @returns {string} The complete HTML for a single print page.
 */
function getPageHTML(mapImageSrc, pageNumber) {
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
                    <span><strong>${printDataGlobal.companyName}</strong></span>
                    <span>${printDataGlobal.address}</span>
                    <span>${printDataGlobal.website} | ${printDataGlobal.phone}</span>
                    <hr style="width:100%; border:.5px solid black; margin:5px 0;">
                    <span><strong>Client:</strong> ${printDataGlobal.clientName}</span>
                    <span><strong>Property:</strong> ${printDataGlobal.propertyAddress}</span>
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
 * Finalizes the print process by opening the print dialog.
 */
function finalizePrint() {
    // Restore the original layer visibility
    initiallyVisibleLayersGlobal.forEach(layerId => {
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', 'visible');
        }
    });

    const win = window.open('', '_blank');
    if (win) {
        win.document.write(`
            <!DOCTYPE html><html><head><title>Custom Map Printout</title>
            <link rel="stylesheet" href="https://east-southeast-llc.github.io/ese-map-viewer/css/globals.css?v=2" type="text/css" />
            </head><body class="print-body">${fullHtml}</body></html>`);
        win.document.close();
        win.onload = () => {
            win.print();
            win.close();
        };
    } else {
        alert("Popup blocked! Please allow popups for this site.");
    }
}

/**
 * Processes a single page for the printout and then calls itself for the next page.
 */
function processPage() {
    // If we've processed all pages, finalize the printout.
    if (pageCounter >= pageConfigsGlobal.length) {
        finalizePrint();
        return;
    }

    const config = pageConfigsGlobal[pageCounter];

    // Set visibility for the current page's layers
    config.layers.forEach(layerId => {
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', 'visible');
        }
    });
    
    map.once('render', () => {
        const mapCanvas = map.getCanvas();
        const mapImageSrc = mapCanvas.toDataURL();
        fullHtml += getPageHTML(mapImageSrc, config.page);

        // Hide the layers for the current page
        config.layers.forEach(layerId => {
            if (map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, 'visibility', 'none');
            }
        });
        
        pageCounter++;
        processPage(); // Process the next page
    });

    map.triggerRepaint();
}

/**
 * Kicks off the multi-page print generation process.
 */
function generateMultiPagePrintout() {
    console.log("Starting multi-page printout with data:", printDataGlobal);
    
    // Reset global state
    fullHtml = '';
    pageCounter = 0;
    pageConfigsGlobal = [
        { page: 1, layers: ['parcel highlight', 'contours', 'floodplain', 'floodplain-labels', 'floodplain-line', 'LiMWA'] },
        { page: 2, layers: ['parcel highlight', 'satellite', 'acec'] },
        { page: 3, layers: ['parcel highlight', 'contours', 'DEP wetland', 'dep-wetland-line', 'dep-wetland-labels'] },
        { page: 4, layers: ['parcel highlight', 'satellite', 'endangered species', 'endangered-species-labels', 'vernal-pools', 'vernal-pools-labels'] }
    ];
    
    if (typeof setMapToScale === 'function') {
        setMapToScale(Number(printDataGlobal.scale));
    } else {
        console.error("setMapToScale function not found.");
        return;
    }
    
    if (marker) {
        map.setCenter(marker.getLngLat());
    }

    const allToggleableLayers = ['satellite', 'parcels', 'parcel highlight', 'contours', 'agis', 'historic', 'floodplain', 'floodplain-labels', 'floodplain-line', 'LiMWA', 'acec', 'DEP wetland', 'dep-wetland-line', 'dep-wetland-labels', 'endangered species', 'endangered-species-labels', 'vernal-pools', 'vernal-pools-labels', 'zone II', 'soils', 'conservancy districts', 'zoning', 'conservation', 'sewer', 'sewer plans', 'stories', 'intersection'];
    initiallyVisibleLayersGlobal = listVisibleLayers(map, allToggleableLayers);
    
    allToggleableLayers.forEach(layerId => {
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', 'none');
        }
    });

    // Start the processing chain
    processPage();
}

// ============================================================================
// MAIN CUSTOM PRINT FUNCTION (event listener)
// ============================================================================

document.addEventListener("DOMContentLoaded", function () {
    const customPrintButton = document.getElementById("customPrintButton");
    const customPrintBox = document.getElementById("custom-print-box");
    let customPrintVisibility = false;
    customPrintBox.style.display = 'none'; // always leave this line here

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
