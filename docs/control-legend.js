// control-legend.js

// ============================================================================
// HELPER FUNCTIONS FOR LEGEND FUNCTIONALITY
// ============================================================================

function updateLegend(legendBox) {
    console.log("Updating legend...");

    // define layers to be displayed in the legend
    let toggleableLayers = ['sewer plans'];

    // get a list of the layers visible in the current viewport
    const visibleLayers = new Set();

    // query the rendered features in the current viewport
    const features = map.queryRenderedFeatures();

    // iterate over the features and add the layer ID to the set
    features.forEach(feature => {
        visibleLayers.add(feature.layer.id);
    });

    // create the html
    let legendHTML = '';
    
    // iterate over all the toggelable layers and check if they are in the visible set
    for (let i = 0; i < toggleableLayers.length; i++) {
        if (visibleLayers.has(toggleableLayers[i])) {
            legendHTML += `<div>${toggleableLayers[i]}</div>`;
        }
    }

    // if no layers are visible, show a message
    if (legendHTML === '') {
        legendHTML = '<div>No visible layers</div>';
    }
    legendBox.innerHTML = legendHTML;
}




// ============================================================================
// MAIN LEGEND FUNCTION (event listener)
// ============================================================================

document.addEventListener("DOMContentLoaded", function () {
    const legendButton = document.getElementById("legendButton");
    const legendBox = document.getElementById("legend-box");
    let legendVisibility = false

    if (!legendButton || !legendBox) {
        console.error("Required elements not found in the DOM.");
        return;
    }


    legendButton.addEventListener('click', () => {
        legendVisibility = !legendVisibility;
        if (legendVisibility) {
            updateLegend(legendBox);
        } else {
            legendBox.style.display = 'none';
        }
    });

    map.on('moveend', () => {
        if (legendVisibility) updateLegend(legendBox);
    });

    map.on('zoom', () => {
        if (legendVisibility) updateLegend(legendBox);
    });
});