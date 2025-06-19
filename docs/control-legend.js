// control-legend.js

// define the legendData globally
let legendData = [];


// helper function to get printing frame coordinates
function getPrintBoundingBox() {
    if (!map) return; // Ensure map is ready

    const center = map.getCenter(); // Get the map's center point (lng, lat)
    const bounds = map.getBounds(); // Get the map's bounds

    const northLat = bounds.getNorth(); // North bound of map
    const centerLat = center.lat; // Latitude of the map center

    // Calculate the distance from center to the top of the visible map in meters
    const halfHeightMeters = turf.distance(
        [center.lng, center.lat], // Center point
        [center.lng, northLat], // North point
        { units: 'meters' }
    );

    // Calculate the half-width using the 75/80 ratio in meters
    const halfWidthMeters = halfHeightMeters * 75 / 80;

    // Convert distances back into lat/lng
    const north = centerLat + (halfHeightMeters / 111320); // Convert meters to lat
    const south = centerLat - (halfHeightMeters / 111320); // Convert meters to lat

    // Convert width (meters) to longitude difference
    const lngDiff = halfWidthMeters / (111320 * Math.cos(centerLat * (Math.PI / 180)));

    const east = center.lng + lngDiff;
    const west = center.lng - lngDiff;
    console.log("Print bounding box coordinates:", west, north, east, south);
    return [[west, north], [east, north], [east, south], [west, south], [west, north]];
}

// helper function for print output
function getLegendForPrint() {
    const visibleLayerIDs = new Set();
    const printBoundingBox = getPrintBoundingBox();
    const features = map.queryRenderedFeatures();

    // build legend HTML
    let legendHTML = '<div class="legend-frame-column">';
    let count = 0;

    features.forEach(feature => visibleLayerIDs.add(feature.layer.id));
    legendData.forEach(layerInfo => {
        if (visibleLayerIDs.has(layerInfo.id)) {
            legendHTML += `<div><strong>${layerInfo.displayName}</strong></div>`;
            if (count >= 33) {
                legendHTML += '<div>...</div>';
                return;
            }
            count++;

            // iterate over the legend items for a given set
            for (let i = 0; i < layerInfo.items.length; i++) {
                if (count >= 33) {
                    legendHTML += '<div>...</div>';
                    return;
                }
                if (count % 11 === 0) {
                    legendHTML += '</div><div class="legend-frame-column">';
                }
                const item = layerInfo.items[i];
                const style = `background-color: ${item.color}; opacity: ${item.opacity};`;
                const swatchClass = item.isLine ? 'color-line' : 'color-box';
                legendHTML += `
                    <div>
                        <span class="${swatchClass}" style="${style}"></span>
                        <span>${item.label}</span>
                    </div>
                `;
                count++;
            }
        }
    });
    legendHTML += '</div>';
    console.log("Legend html:", legendHTML);
    return legendHTML;
}

// helper function to get the visible legend items
/**
 * Queries the map to find which unique categories for a layer are currently visible.
 * @param {string} layerId The ID of the map layer to query (e.g., 'DEP wetland').
 * @param {string} propertyKey The key in the feature's properties to check (e.g., 'IT_VALC').
 * @returns {string[]} An array containing the unique string values found (e.g., ['OW', 'SS', 'WS1']).
 */
function getVisibleLegendItems(layerId, propertyKey) {
    // First, check if the layer exists and is visible on the map.
    try {
        if (!map.getLayer(layerId) || map.getLayoutProperty(layerId, 'visibility') === 'none') {
            return []; // Return an empty array if the layer is off.
        }
    } catch (e) {
        // This can happen if the map style is still loading.
        return []; 
    }

    // Query all the rendered features for the specified layer in the current view.
    const features = map.queryRenderedFeatures({ layers: [layerId] });
    
    // Use a Set to automatically store only the unique property values.
    const uniqueItems = new Set();
    
    // Loop through the visible features and collect the values of the specified property.
    features.forEach(feature => {
        // Check if the property exists before adding it.
        if (feature.properties && typeof feature.properties[propertyKey] !== 'undefined') {
            // Add the code (e.g., "OW", "SS", "1") to our Set.
            uniqueItems.add(feature.properties[propertyKey]);
        }
    });
    
    // Convert the Set into a simple array and return it.
    return Array.from(uniqueItems);
}

// Expose the function to the global window object so you can test it in the console.
window.getVisibleLegendItems = getVisibleLegendItems;


document.addEventListener("DOMContentLoaded", function () {
    const legendButton = document.getElementById("legendButton");
    const legendBox = document.getElementById("legend-box");
    let legendVisibility = false;
    legendBox.style.display = 'none';

    if (!legendButton || !legendBox) {
        console.error("Required elements not found in the DOM.");
        return;
    }

    // fetch legend data
    fetch('https://east-southeast-llc.github.io/ese-map-viewer/docs/legend-data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            legendData = data;
        })
        .catch(error => {
            console.error('Error fetching legend data:', error);
            legendBox.innerHTML = "Could not load legend data.";
    });


    // UPDATE LEGEND DRIVER FUNCTION
    function updateLegend() {
    // 1. If the legend box is hidden, do nothing.
    if (legendBox.style.display === 'none') {
        return; 
    }

    let legendHTML = '';

    // 2. Loop through each main entry in your legendData (e.g., "Sewer Plans", "DEP Wetlands").
    legendData.forEach(layerInfo => {

        // 3. Create a master Set to hold all unique codes for VISIBLE features for this section.
        const visibleCodes = new Set();

        // 4. Check all sources listed for this legend entry (e.g., both polygons and lines for wetlands).
        if (layerInfo.sources) {
            layerInfo.sources.forEach(source => {
                // Call our helper function to get the codes for what's on screen.
                const items = getVisibleLegendItems(source.id, source.propertyKey);
                // Add the visible codes from this source to our master Set.
                items.forEach(itemCode => visibleCodes.add(String(itemCode)));
            });
        }
        
        // 5. Only build this legend section if there are items to show.
        if (visibleCodes.size > 0) {
            legendHTML += `<div class="legend-title">${layerInfo.displayName}</div>`;

            // 6. Filter the full list of items from the JSON against the visible codes.
            const visibleItems = layerInfo.items.filter(item => visibleCodes.has(String(item.code)));

            // 7. Build the HTML for each of the visible items.
            visibleItems.forEach(item => {
                const style = `background-color: ${item.color}; opacity: ${item.opacity};`;
                const swatchClass = item.isLine ? 'color-line' : 'color-box';
                legendHTML += `
                    <div class="legend-item-row">
                        <span class="${swatchClass}" style="${style}"></span>
                        <span>${item.label}</span>
                    </div>
                `;
            });
        }
    });

    // If after checking all layers, nothing is visible, show a default message.
    if (legendHTML === '') {
        legendHTML = '<div>No layers with a legend are currently visible.</div>';
    }
    
    legendBox.innerHTML = legendHTML;
    }

    // make updateLegend global
    window.updateLegend = updateLegend;

    // main event listener
    legendButton.addEventListener('click', () => {
        legendVisibility = !legendVisibility;
        if (legendVisibility) {
            legendBox.style.display = 'block';
            updateLegend();
        } else {
            legendBox.style.display = 'none';
        }
    });

    // update on move and zoom
    map.on('moveend', updateLegend);
    map.on('zoom', updateLegend);
});