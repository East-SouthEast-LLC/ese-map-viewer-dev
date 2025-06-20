// CUSTOM PRINT CONTROL BUTTON SCRIPT

// ============================================================================
// HELPER FUNCTIONS FOR CUSTOM PRINT FUNCTIONALITY
// ============================================================================

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
 * Takes the user-provided data and generates the multi-page print preview.
 * @param {object} printData An object containing all the user-submitted information.
 */
function generateMultiPagePrintout(printData) {
    // This will be the core function where we build the multi-page printout.
    // For now, it remains a placeholder.
    console.log("Generating multi-page printout with the following data:", printData);
    alert("Multi-page print generation is not yet implemented.");
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
    
    /**
     * Attaches event listeners to the elements inside the custom print form.
     * This is called after the form is created.
     */
    function attachCustomPrintFormListeners() {
        const submitButton = document.getElementById('custom-print-submit');
        if (submitButton) {
            submitButton.addEventListener('click', processCustomPrint);
        }
    }

    /**
     * Creates the form, displays it, and attaches the necessary event listeners.
     */
    function updateCustomPrintBox() {
        customPrintBox.innerHTML = getCustomPrintFormHTML();
        customPrintBox.style.display = 'block';
        attachCustomPrintFormListeners();
    }
    
    // Main event listener for the custom print button
    customPrintButton.addEventListener('click', () => {
        // First, check if a marker has been placed on the map.
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
