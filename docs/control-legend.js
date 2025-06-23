// control-legend.js

// define the legendData globally
let legendData = [];

// helper function to get printing frame coordinates for an 8x8 inch area
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

    const halfWidthMeters = halfHeightMeters;

    // Convert distances back into lat/lng
    const north = centerLat + (halfHeightMeters / 111320); // Convert meters to lat
    const south = centerLat - (halfHeightMeters / 111320); // Convert meters to lat

    // Convert width (meters) to longitude difference
    const lngDiff = halfWidthMeters / (111320 * Math.cos(centerLat * (Math.PI / 180)));

    const east = center.lng + lngDiff;
    const west = center.lng - lngDiff;
    
    return [[west, north], [east, north], [east, south], [west, south], [west, north]];
}

// helper function for print output
function getLegendForPrint() {
    const geoJsonBounds = getPrintBoundingBox();
    if (!geoJsonBounds) return '<div class="legend-item">Error calculating print area.</div>';
    
    const topLeftGeo = geoJsonBounds[0];
    const bottomRightGeo = geoJsonBounds[2];
    const topLeftPixel = map.project(topLeftGeo);
    const bottomRightPixel = map.project(bottomRightGeo);
    const printPixelBoundingBox = [ [topLeftPixel.x, topLeftPixel.y], [bottomRightPixel.x, bottomRightPixel.y] ];
    const allVisibleFeatures = map.queryRenderedFeatures(printPixelBoundingBox);

    if (allVisibleFeatures.length === 0) {
        return '<div class="legend-grid"></div>';
    }

    const featuresByLayer = allVisibleFeatures.reduce((acc, feature) => {
        const layerId = feature.layer.id;
        if (!acc[layerId]) {
            acc[layerId] = [];
        }
        acc[layerId].push(feature);
        return acc;
    }, {});

    const allItemsToRender = []; 

    legendData.forEach(layerInfo => {
        const sourceLayerIds = layerInfo.sources.map(s => s.id);
        const visibleFeaturesForLayer = sourceLayerIds.flatMap(id => featuresByLayer[id] || []);

        if (visibleFeaturesForLayer.length === 0) {
            return;
        }

        const itemsToShow = new Set();
        const matchedFeatureIds = new Set();

        layerInfo.items.forEach(item => {
            // This block handles simple items (no 'code' for categories, no 'match' for rules)
            if (!item.code && !item.match) {
                // Determine the layer ID for this simple item.
                // Priority 1: Use the item's own 'id' if it exists (e.g., for Vernal Pools, LiMWA).
                // Priority 2: If no item 'id', but the group has only one source, use that source's id (e.g., for ACEC).
                const itemLayerId = item.id || (layerInfo.sources.length === 1 ? layerInfo.sources[0].id : null);

                if (itemLayerId && featuresByLayer[itemLayerId] && featuresByLayer[itemLayerId].length > 0) {
                    itemsToShow.add(item.label);
                }
                return; // Move to the next item in the loop.
            }

            for (const feature of visibleFeaturesForLayer) {
                if (matchedFeatureIds.has(feature.id) && item.code !== "__default__") {
                    continue;
                }
                
                const props = feature.properties;

                if (item.match) { 
                    const rule = item.match;
                    if ((rule.property === "DATE" && (Number(props.DATE) >= rule.min && Number(props.DATE) <= rule.max)) || 
                        (props[rule.property] === rule.value)) {
                        itemsToShow.add(item.label);
                    }
                } else if (item.code && item.code !== "__default__") {
                    const source = layerInfo.sources.find(s => s.id === feature.layer.id);
                    if (source && String(props[source.propertyKey]) === String(item.code)) {
                        itemsToShow.add(item.label);
                        matchedFeatureIds.add(feature.id);
                    }
                } else if (item.code && item.code === "__default__") {
                    itemsToShow.add(item.label);
                }
            }
        });
        
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

    if (allItemsToRender.length === 0) {
        return '<div class="legend-grid"></div>';
    }

    const maxPrintableItems = 13;
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

/**
 * Queries the map to find which unique categories for a layer are currently visible.
 */
function getVisibleLegendItems(layerId, propertyKey) {
    try {
        if (!map.getLayer(layerId) || map.getLayoutProperty(layerId, 'visibility') === 'none') {
            return [];
        }
    } catch (e) {
        return [];
    }

    const features = map.queryRenderedFeatures({ layers: [layerId] });
    const uniqueItems = new Set();

    features.forEach(feature => {
        if (feature.properties && typeof feature.properties[propertyKey] !== 'undefined') {
            uniqueItems.add(feature.properties[propertyKey]);
        }
    });

    return Array.from(uniqueItems);
}

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

    function updateLegend() {
        if (legendBox.style.display === 'none') return;

        let legendHTML = '';

        legendData.forEach(layerInfo => {
            const sourceLayerIds = layerInfo.sources.map(s => s.id);
            const allVisibleFeatures = map.queryRenderedFeatures({ layers: sourceLayerIds });

            if (allVisibleFeatures.length === 0) return;

            const featuresByLayer = allVisibleFeatures.reduce((acc, feature) => {
                const layerId = feature.layer.id;
                if (!acc[layerId]) {
                    acc[layerId] = [];
                }
                acc[layerId].push(feature);
                return acc;
            }, {});

            const itemsToShow = new Set();
            const matchedFeatureIds = new Set();

            layerInfo.items.forEach(item => {
                if (!item.code && !item.match) {
                    const itemLayerId = item.id || (layerInfo.sources.length === 1 ? layerInfo.sources[0].id : null);
                    if (itemLayerId && featuresByLayer[itemLayerId] && featuresByLayer[itemLayerId].length > 0) {
                        itemsToShow.add(item.label);
                    }
                    return; 
                }

                for (const feature of allVisibleFeatures) {
                    if (matchedFeatureIds.has(feature.id)) {
                        continue;
                    }
                    
                    const props = feature.properties;
                    
                    if (item.match) {
                        const rule = item.match;
                        if ((rule.property === "DATE" && (Number(props.DATE) >= rule.min && Number(props.DATE) <= rule.max)) || 
                            (props[rule.property] === rule.value)) {
                            itemsToShow.add(item.label);
                        }
                    } else if (item.code && item.code !== "__default__") {
                        const source = layerInfo.sources.find(s => s.id === feature.layer.id);
                        if (source && String(props[source.propertyKey]) === String(item.code)) {
                            itemsToShow.add(item.label);
                            matchedFeatureIds.add(feature.id);
                        }
                    } else if (item.code && item.code === "__default__") {
                        itemsToShow.add(item.label);
                    }
                }
            });
            
            const hasSpecificItem = layerInfo.items.some(item => item.code !== "__default__" && itemsToShow.has(item.label));
            const defaultItem = layerInfo.items.find(item => item.code === "__default__");
            if (hasSpecificItem && defaultItem && itemsToShow.has(defaultItem.label)) {
                 itemsToShow.delete(defaultItem.label);
            }

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

    window.updateLegend = updateLegend;

    legendButton.addEventListener('click', () => {
        legendVisibility = !legendVisibility;
        if (legendVisibility) {
            legendBox.style.display = 'block';
            updateLegend();
        } else {
            legendBox.style.display = 'none';
        }
    });

    map.on('moveend', updateLegend);
    map.on('zoom', updateLegend);
});