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
    // Get all features from the current map view
    const allVisibleFeatures = map.queryRenderedFeatures();
    
    if (allVisibleFeatures.length === 0) {
        return '<div class="legend-item">No layers with a legend are visible.</div>';
    }

    // Group features by layer ID for efficiency
    const featuresByLayer = allVisibleFeatures.reduce((acc, feature) => {
        const layerId = feature.layer.id;
        if (!acc[layerId]) {
            acc[layerId] = [];
        }
        acc[layerId].push(feature);
        return acc;
    }, {});

    const allItemsToRender = []; // A flat array to hold all potential HTML strings

    // Loop through legend data to build a complete list of all items that should be shown
    legendData.forEach(layerInfo => {
        const sourceLayerIds = layerInfo.sources.map(s => s.id);
        const visibleFeaturesForLayer = sourceLayerIds.flatMap(id => featuresByLayer[id] || []);

        if (visibleFeaturesForLayer.length === 0) {
            return; // Skip
        }

        const itemsToShow = new Set();
        layerInfo.items.forEach(item => {
            for (const feature of visibleFeaturesForLayer) {
                const props = feature.properties;
                if (item.match) {
                    const rule = item.match;
                    if (rule.property === "DATE") {
                        if (Number(props.DATE) >= rule.min && Number(props.DATE) <= rule.max) {
                            itemsToShow.add(item.label);
                            break;
                        }
                    } else if (props[rule.property] === rule.value) {
                        itemsToShow.add(item.label);
                        break;
                    }
                } else if (item.code) {
                    const source = layerInfo.sources.find(s => s.id === feature.layer.id);
                    if (source && String(props[source.propertyKey]) === String(item.code)) {
                        itemsToShow.add(item.label);
                        break;
                    }
                }
            }
        });
        
        if (itemsToShow.size > 0) {
            allItemsToRender.push(`<div class="legend-section">${layerInfo.displayName}</div>`);
            const visibleItems = layerInfo.items.filter(item => itemsToShow.has(item.label));
            visibleItems.forEach(item => {
                const style = `background-color: ${item.color}; opacity: ${item.opacity};`;
                const swatchClass = item.isLine ? 'color-line' : 'color-box';
                allItemsToRender.push(`
                    <div class="legend-item">
                        <span class="${swatchClass}" style="${style}"></span>
                        <span>${item.label}</span>
                    </div>
                `);
            });
        }
    });

    if (allItemsToRender.length === 0) {
        return '<div class="legend-item">No layers with a legend are currently visible.</div>';
    }

    // --- NEW: Truncation Logic ---
    const maxPrintableItems = 26; // Max items to show (e.g., 2 columns of 13)
    let finalItemsHTML = '';

    if (allItemsToRender.length > maxPrintableItems) {
        // Take the first N-1 items and add a "...and more" message at the end
        const truncatedItems = allItemsToRender.slice(0, maxPrintableItems - 1);
        truncatedItems.push('<div class="legend-item">... and more</div>');
        finalItemsHTML = truncatedItems.join('');
    } else {
        finalItemsHTML = allItemsToRender.join('');
    }

    // Wrap the final list of items in our grid container and return it.
    return `<div class="legend-grid">${finalItemsHTML}</div>`;
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
            // Get all visible features for all sources listed for this legend entry.
            const sourceLayerIds = layerInfo.sources.map(s => s.id);
            const visibleFeatures = map.queryRenderedFeatures({ layers: sourceLayerIds });

            // If there are no visible features for any of the sources, skip this legend section.
            if (visibleFeatures.length === 0) {
                return; // This is like 'continue' in a forEach loop
            }

            const itemsToShow = new Set(); // Use a Set to store the labels of items to show

            // For each legend item defined in the JSON, check if it should be displayed.
            layerInfo.items.forEach(item => {
                // Check all visible features to see if any of them match this item's rule.
                for (const feature of visibleFeatures) {
                    const props = feature.properties;
                    
                    // CASE 1: The item has a complex 'match' rule (for Sewer Plans)
                    if (item.match) {
                        const rule = item.match;
                        if (rule.property === "DATE") {
                            const date = Number(props.DATE);
                            if (date >= rule.min && date <= rule.max) {
                                itemsToShow.add(item.label);
                                break; // Found a match, move to the next legend item
                            }
                        } else if (props[rule.property] === rule.value) {
                            itemsToShow.add(item.label);
                            break; // Found a match
                        }
                    } 
                    // CASE 2: The item has a simple 'code' rule (for DEP Wetlands)
                    else if (item.code) {
                        // Find which property key to check (e.g., IT_VALC or ARC_CODE)
                        const source = layerInfo.sources.find(s => s.id === feature.layer.id);
                        if (source && String(props[source.propertyKey]) === String(item.code)) {
                            itemsToShow.add(item.label);
                            break; // Found a match
                        }
                    }
                }
            });

            // Now, build the HTML for the items we've identified as visible.
            if (itemsToShow.size > 0) {
                legendHTML += `<div class="legend-title">${layerInfo.displayName}</div>`;

                // Filter the original items list to keep the order correct
                const visibleItems = layerInfo.items.filter(item => itemsToShow.has(item.label));

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
