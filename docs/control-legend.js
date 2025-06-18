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
        ['COASTAL BANK BLUFF OR SEA CLIFF', '#F7F124'],
        ['BARRIER BEACH SYSTEM', '#DCD609'],
        ['BARRIER BEACH-COASTAL BEACH', '#D0D041'],
        ['BARRIER BEACH-COASTAL DUNE', '#99F108'],
        ['BARRIER BEACH-MARSH', '#24AF0B'],
        ['BARRIER BEACH-OPEN WATER', '#1BB5CA'],
        ['BARRIER BEACH-SALT MARSH', '#24AF0B'],
        ['BARRIER BEACH-SHRUB SWAMP', '#32D34F'],
        ['BARRIER BEACH-WOODED SWAMP DECIDUOUS', '#1F9A35'],
        ['BARRIER BEACH-WOODED SWAMP CONIFEROUS', '#056828'],
        ['COASTAL BEACH', '#D7E00F'],
        ['BARRIER BEACH-GRASSLAND', '#0C9955'],
        ['CRANBERRY BOG', '#BB0418'],
        ['COASTAL DUNE', '#99F108'],
        ['DEEP MARSH', '#056A56'],
        ['SHALLOW MARSH MEADOW OR FEN', '#26A04E'],
        ['OPEN WATER', '#2B8ACB'],
        ['ROCKY INTERTIDAL SHORE', '#B5C0C8'],
        ['SALT MARSH', '#389C3F'],
        ['SHRUB SWAMP', '#24CF31'],
        ['TIDAL FLAT', '#F3F4CC'],
        ['WOODED SWAMP DECIDUOUS', '#1F9A35'],
        ['WOODED SWAMP CONIFEROUS', '#056828'],
        ['WOODED SWAMP MIXED TREES', '#448842'],
        ['EDGE OF OCEAN', '#08ADEF'],
        ['SHORELINE', '#EBF90A'],
        ['CLOSURE', '#EBECDD'],
        ['APPARENT WETLAND LIMIT', '#F2A5EF'],
        ['HYDRO CONNECTION', '#0B11F0'],
        ['MLW', '#5E87ED'],
        ['EDGE INTERUPTED', '#5EE1ED'],
    ])],
    ['acec', new Map([
        ['Area of Critical Environmental Concern', '#CD06D8']
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