// control-legend.js

// ============================================================================
// HELPER FUNCTIONS FOR LEGEND FUNCTIONALITY
// ============================================================================

function updateLegend() {
    console.log("Updating legend...");

    // Get a list of the layers visible in the current viewport
    const visibleLayers = new Set();

    // Query the rendered features in the current viewport
    const features = map.queryRenderedFeatures();

    // Iterate over the features and add the layer ID to the set
    features.forEach(feature => {
        visibleLayers.add(feature.layer.id);
    });

    // Convert the set to an array
    const visibleLayerIds = Array.from(visibleLayers);

    console.log(visibleLayerIds);
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
            updateLegend();
        } else {
            legendBox.style.display = 'none';
        }
    });

    map.on('moveend', () => {
        if (legendVisibility) updateLegend();
    });

    map.on('zoom', () => {
        if (legendVisibility) updateLegend();
    });
});