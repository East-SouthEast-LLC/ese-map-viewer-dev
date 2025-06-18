// control-legend.js

// ============================================================================
// HELPER FUNCTIONS FOR LEGEND FUNCTIONALITY
// ============================================================================

// DEFINE 2D MAP TO STORE LAYER INFO
const layers = new Map([
    ['sewer plans', new Map([
        ['Plan Year: 2014-2019', '#d32f2f'],
        ['Plan Year: 2008-2013', '#b71c1c'],
        ['Plan Year: 2000-2007', '#a31515'],
        ['Plan Year: 1983-1999', '#7f1010'],
        ['Plan Year: 1969-1982', '#4b0707'],
        ['Not on original plan', '#ffcccc']
    ])],
    ['DEP wetland', new Map([
        ['BA', '#F7F124'],
        ['BB', '#DCD609'],
        ['BB-BE', '#D0D041'],
        ['BB-D', '#99F108'],
        ['BB-M', '#24AF0B'],
        ['BB-OW', '#1BB5CA'],
        ['BB-SM', '#24AF0B'],
        ['BB-SS', '#32D34F'],
        ['BB-WS1', '#1F9A35'],
        ['BB-WS2', '#056828'],
        ['BE', '#D7E00F'],
        ['BG', '#0C9955'],
        ['CB', '#BB0418'],
        ['D', '#99F108'],
        ['DM', '#056A56'],
        ['M', '#26A04E'],
        ['OW', '#2B8ACB'],
        ['RS', '#B5C0C8'],
        ['SM', '#389C3F'],
        ['SS', '#24CF31'],
        ['TF', '#F3F4CC'],
        ['WS1', '#1F9A35'],
        ['WS2', '#056828'],
        ['WS3', '#448842']
    ])],
    ['endangered species', new Map([
        ['Vernal Pools', '#0D71F9'],
        ['Priority and Estimated Habitat', '#e7ee1f'],
        ['Priority Habitat', '#1DB708'],
        ['Estimated Habitat', '#A28F06']
    ])]
]);

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
    legendBox.style.display = 'none';

    if (!legendButton || !legendBox) {
        console.error("Required elements not found in the DOM.");
        return;
    }


    legendButton.addEventListener('click', () => {
        legendVisibility = !legendVisibility;
        if (legendVisibility) {
            legendBox.style.display = 'block'; 
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