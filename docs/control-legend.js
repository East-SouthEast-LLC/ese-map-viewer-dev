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
    // 1. Get features from the print area
    const geoJsonBounds = getPrintBoundingBox();
    if (!geoJsonBounds) return '<div class="legend-item">Error calculating print area.</div>';
    
    const topLeftGeo = geoJsonBounds[0];
    const bottomRightGeo = geoJsonBounds[2];
    const topLeftPixel = map.project(topLeftGeo);
    const bottomRightPixel = map.project(bottomRightGeo);
    const printPixelBoundingBox = [ [topLeftPixel.x, topLeftPixel.y], [bottomRightPixel.x, bottomRightPixel.y] ];
    const allVisibleFeatures = map.queryRenderedFeatures(printPixelBoundingBox);

    if (allVisibleFeatures.length === 0) {
        return '<div class="legend-item">No layers with a legend are visible in the print area.</div>';
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

    // 2. Loop through legendData to determine which items to show.
    //    This logic now mirrors the live updateLegend function.
    legendData.forEach(layerInfo => {
        const sourceLayerIds = layerInfo.sources.map(s => s.id);
        const visibleFeaturesForLayer = sourceLayerIds.flatMap(id => featuresByLayer[id] || []);

        if (visibleFeaturesForLayer.length === 0) {
            return;
        }

        const itemsToShow = new Set();
        const matchedFeatureIds = new Set();

        layerInfo.items.forEach(item => {
            for (const feature of visibleFeaturesForLayer) {
                if (matchedFeatureIds.has(feature.id) && item.code !== "__default__") {
                    continue;
                }
                
                const props = feature.properties;

                if (item.match) { // Handles Sewer Plans
                    const rule = item.match;
                    if ((rule.property === "DATE" && (Number(props.DATE) >= rule.min && Number(props.DATE) <= rule.max)) || 
                        (props[rule.property] === rule.value)) {
                        itemsToShow.add(item.label);
                    }
                } else if (item.code && item.code !== "__default__") { // Handles specific codes like in DEP Wetlands
                    const source = layerInfo.sources.find(s => s.id === feature.layer.id);
                    if (source && String(props[source.propertyKey]) === String(item.code)) {
                        itemsToShow.add(item.label);
                        matchedFeatureIds.add(feature.id);
                    }
                } else if (item.code && item.code === "__default__") { // Handles the default case for Contours
                    // Add the default item if any feature from this layer group is visible
                    itemsToShow.add(item.label);
                } else if (!item.match && !item.code) { // Handles simple layers like LiMWA
                    itemsToShow.add(item.label);
                }
            }
        });
        
        // This logic ensures the default item doesn't show up if a more specific item does.
        const hasSpecificItem = layerInfo.items.some(item => item.code !== "__default__" && itemsToShow.has(item.label));
        const defaultItem = layerInfo.items.find(item => item.code === "__default__");
        if (hasSpecificItem && defaultItem && itemsToShow.has(defaultItem.label)) {
            itemsToShow.delete(defaultItem.label);
        }

        if (itemsToShow.size > 0) {
            allItemsToRender.push(`<div class="legend-section">${layerInfo.displayName}</div>`);
            const visibleItems = layerInfo.items.filter(item => itemsToShow.has(item.label));
            visibleItems.forEach(item => {
                const style = `background-color: ${item.color}; opacity: ${item.opacity};`;
                const swatchClass = item.isLine ? 'color-line' : 'color-box';
                allItemsToRender.push(
                    `<div class="legend-item">
                        <span class="${swatchClass}" style="${style}"></span>
                        <span>${item.label}</span>
                    </div>`
                );
            });
        }
    });

    // 3. Truncate list and return final HTML
    if (allItemsToRender.length === 0) {
        return '<div class="legend-item">No layers with a legend are visible in the print area.</div>';
    }
    const maxPrintableItems = 30;
    let finalItemsHTML = '';
    if (allItemsToRender.length > maxPrintableItems) {
        const truncatedItems = allItemsToRender.slice(0, maxPrintableItems - 1);
        truncatedItems.push('<div class="legend-item">... and more</div>');
        finalItemsHTML = truncatedItems.join('');
    } else {
        finalItemsHTML = allItemsToRender.join('');
    }
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
        if (legendBox.style.display === 'none') return;

        let legendHTML = '';

        legendData.forEach(layerInfo => {
            const sourceLayerIds = layerInfo.sources.map(s => s.id);
            const visibleFeatures = map.queryRenderedFeatures({ layers: sourceLayerIds });

            if (visibleFeatures.length === 0) return;

            const itemsToShow = new Set();
            // --- NEW: A set to track which features have already been matched to a specific item ---
            const matchedFeatureIds = new Set();

            layerInfo.items.forEach(item => {
                for (const feature of visibleFeatures) {
                    const props = feature.properties;
                    
                    // Skip features that have already been matched by a more specific rule
                    if (matchedFeatureIds.has(feature.id)) {
                        continue;
                    }
                    
                    if (item.match) { // CASE 1: Complex match rule
                        const rule = item.match;
                        if ((rule.property === "DATE" && (Number(props.DATE) >= rule.min && Number(props.DATE) <= rule.max)) || 
                            (props[rule.property] === rule.value)) {
                            itemsToShow.add(item.label);
                            // For this complex type, we don't mark as matched, as multiple might share a feature
                        }
                    } else if (item.code && item.code !== "__default__") { // CASE 2: Specific code match
                        const source = layerInfo.sources.find(s => s.id === feature.layer.id);
                        if (source && String(props[source.propertyKey]) === String(item.code)) {
                            itemsToShow.add(item.label);
                            matchedFeatureIds.add(feature.id); // Mark this feature as matched
                        }
                    } else if (item.code && item.code === "__default__") { // CASE 3: Default/fallback item
                        itemsToShow.add(item.label);
                    } else if (!item.match && !item.code) { // CASE 0: Simple layer presence
                        itemsToShow.add(item.label);
                    }
                }
            });
            
            // This part removes the default item if a more specific item from the same group is also present
            const hasSpecificItem = layerInfo.items.some(item => item.code !== "__default__" && itemsToShow.has(item.label));
            const defaultItem = layerInfo.items.find(item => item.code === "__default__");
            if (hasSpecificItem && defaultItem && itemsToShow.has(defaultItem.label)) {
                // If both a specific item (like "Below Sea Level") and the default item are visible,
                // we only show the specific one for clarity.
                // This logic can be adjusted based on desired behavior.
            }

            // Build the HTML for the items we've identified as visible.
            if (itemsToShow.size > 0) {
                legendHTML += `<div class="legend-title">${layerInfo.displayName}</div>`;
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
