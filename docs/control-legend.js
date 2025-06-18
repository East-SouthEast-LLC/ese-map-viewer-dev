// control-legend.js

// ============================================================================
// HELPER FUNCTIONS FOR LEGEND FUNCTIONALITY
// ============================================================================

// DEFINE 2D MAP TO STORE LAYER INFO
const layers = new Map([
    ['sewer plans', new Map([
        ['2014-2019', '#d32f2f'],
        ['2008-2013', '#b71c1c']
    ])]
])


function updateLegend(legendBox) {
    console.log("Updating legend...");

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
    
    // iterate over all the layers and check if they are in the visible set
    for (const layer of layers.keys()) {
        if (visibleLayers.has(layer)) {
            // Use the new class for the title
            legendHTML += `<div class="legend-title">${layer}</div>`;
            if (layers.has(layer)) {
                for (const [key, value] of layers.get(layer)) {
                    legendHTML += `<div class="legend-item-row"><span class="color-box" style="background-color: ${value};"></span><span>${key}</span></div>`;
                }
            }
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