// control-legend.js

let legendData = [];

function getPrintBoundingBox() {
    if (!map) return;
    const center = map.getCenter();
    const bounds = map.getBounds();
    const northLat = bounds.getNorth();
    const halfHeightMeters = turf.distance([center.lng, center.lat], [center.lng, northLat], { units: 'meters' });
    const halfWidthMeters = halfHeightMeters;
    const north = center.lat + (halfHeightMeters / 111320);
    const south = center.lat - (halfHeightMeters / 111320);
    const lngDiff = halfWidthMeters / (111320 * Math.cos(center.lat * (Math.PI / 180)));
    const east = center.lng + lngDiff;
    const west = center.lng - lngDiff;
    return [[west, north], [east, north], [east, south], [west, south], [west, north]];
}

function getLegendForPrint(expectedLayerIds = []) {
    const geoJsonBounds = getPrintBoundingBox();
    if (!geoJsonBounds) return '<div class="legend-item">Error calculating print area.</div>';
    
    const topLeftGeo = geoJsonBounds[0];
    const bottomRightGeo = geoJsonBounds[2];
    const topLeftPixel = map.project(topLeftGeo);
    const bottomRightPixel = map.project(bottomRightGeo);
    const printPixelBoundingBox = [ [topLeftPixel.x, topLeftPixel.y], [bottomRightPixel.x, bottomRightPixel.y] ];
    const allVisibleFeatures = map.queryRenderedFeatures(printPixelBoundingBox);

    if (allVisibleFeatures.length === 0 && expectedLayerIds.length === 0) {
        return '<div class="legend-grid"></div>';
    }

    const featuresByLayer = allVisibleFeatures.reduce((acc, feature) => {
        const layerId = feature.layer.id;
        if (!acc[layerId]) acc[layerId] = [];
        acc[layerId].push(feature);
        return acc;
    }, {});

    const allItemsToRender = []; 
    const renderedLegendSections = new Set();

    legendData.forEach(layerInfo => {
        if (layerInfo.displayName === "Satellite Imagery") {
            if (expectedLayerIds.includes('satellite')) {
                allItemsToRender.push(`<div class="legend-section">${layerInfo.displayName}</div>`);
                renderedLegendSections.add(layerInfo.displayName);
                const item = layerInfo.items[0];
                const style = `background-color: ${item.color}; opacity: ${item.opacity};`;
                const swatchClass = item.isLine ? 'color-line' : 'color-box';
                allItemsToRender.push(`<div class="legend-item"><span class="${swatchClass}" style="${style}"></span><span>${item.label}</span></div>`);
            }
            return;
        }

        const sourceLayerIds = layerInfo.sources.map(s => s.id);
        const visibleFeaturesForLayer = sourceLayerIds.flatMap(id => featuresByLayer[id] || []);
        if (visibleFeaturesForLayer.length === 0) return;

        const itemsToShow = new Set();
        const matchedFeatureIds = new Set();

        layerInfo.items.forEach(item => {
            if (!item.code && !item.match) {
                const itemLayerId = item.id || (layerInfo.sources.length === 1 ? layerInfo.sources[0].id : null);
                if (itemLayerId && featuresByLayer[itemLayerId] && featuresByLayer[itemLayerId].length > 0) itemsToShow.add(item.label);
                return;
            }

            for (const feature of visibleFeaturesForLayer) {
                if (matchedFeatureIds.has(feature.id) && item.code !== "__default__") continue;
                const props = feature.properties;

                if (item.match) { 
                    const rule = item.match;
                    if (rule.value && props[rule.property] === rule.value) {
                        itemsToShow.add(item.label);
                    } else if (rule.min !== undefined && rule.max !== undefined) {
                        const propValue = Number(props[rule.property]);
                        if (propValue >= rule.min && propValue <= rule.max) {
                            itemsToShow.add(item.label);
                        }
                    }
                } else if (item.code && String(props[layerInfo.sources.find(s => s.id === feature.layer.id)?.propertyKey]) === String(item.code)) {
                    itemsToShow.add(item.label);
                    matchedFeatureIds.add(feature.id);
                } else if (item.code === "__default__") {
                    itemsToShow.add(item.label);
                }
            }
        });
        
        const hasSpecificItem = layerInfo.items.some(item => item.code !== "__default__" && itemsToShow.has(item.label));
        const defaultItem = layerInfo.items.find(item => item.code === "__default__");
        if (hasSpecificItem && defaultItem && itemsToShow.has(defaultItem.label)) itemsToShow.delete(defaultItem.label);

        if (itemsToShow.size > 0) {
            allItemsToRender.push(`<div class="legend-section">${layerInfo.displayName}</div>`);
            renderedLegendSections.add(layerInfo.displayName);
            const visibleItems = layerInfo.items.filter(item => itemsToShow.has(item.label));
            visibleItems.forEach(item => {
                const style = `background-color: ${item.color}; opacity: ${item.opacity};`;
                const swatchClass = item.isLine ? 'color-line' : 'color-box';
                allItemsToRender.push(`<div class="legend-item"><span class="${swatchClass}" style="${style}"></span><span>${item.label}</span></div>`);
            });
        }
    });
    
    if (expectedLayerIds && expectedLayerIds.length > 0) {
        const expectedDisplayNames = new Set(expectedLayerIds.map(id => legendData.find(info => info.sources.some(s => s.id === id) || info.items.some(i => i.id === id))?.displayName).filter(Boolean));
        expectedDisplayNames.forEach(displayName => {
            if (!renderedLegendSections.has(displayName)) allItemsToRender.push(`<div class="legend-item-not-present">${displayName}: Not Present in Print Area</div>`);
        });
    }

    if (allItemsToRender.length === 0) return '<div class="legend-grid"></div>';
    const maxPrintableItems = 13;
    let finalItemsHTML = allItemsToRender.length > maxPrintableItems ? allItemsToRender.slice(0, maxPrintableItems - 1).concat('<div class="legend-item">... and more</div>').join('') : allItemsToRender.join('');
    return `<div class="legend-grid">${finalItemsHTML}</div>`;
}


function getVisibleLegendItems(layerId, propertyKey) {
    try {
        if (!map.getLayer(layerId) || map.getLayoutProperty(layerId, 'visibility') === 'none') return [];
    } catch (e) {
        return [];
    }
    const features = map.queryRenderedFeatures({ layers: [layerId] });
    const uniqueItems = new Set();
    features.forEach(feature => {
        if (feature.properties && typeof feature.properties[propertyKey] !== 'undefined') uniqueItems.add(feature.properties[propertyKey]);
    });
    return Array.from(uniqueItems);
}
window.getVisibleLegendItems = getVisibleLegendItems;


document.addEventListener("DOMContentLoaded", function () {
    const legendButton = document.getElementById("legendButton");
    const legendBox = document.getElementById("legend-box");
    if (!legendButton || !legendBox) return console.error("Required legend elements not found in the DOM.");

    fetch('https://east-southeast-llc.github.io/ese-map-viewer/docs/legend-data.json')
        .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
        .then(data => { legendData = data; })
        .catch(error => {
            console.error('Error fetching legend data:', error);
            legendBox.innerHTML = "Could not load legend data.";
        });

    function updateLegend() {
        if (legendBox.style.display === 'none') return;
        let legendHTML = '';

        legendData.forEach(layerInfo => {
            if (layerInfo.displayName === "Satellite Imagery") {
                if (map.getLayer('satellite')?.getLayoutProperty('visibility') === 'visible') {
                    legendHTML += `<div class="legend-title">${layerInfo.displayName}</div>`;
                    const item = layerInfo.items[0];
                    const style = `background-color: ${item.color}; opacity: ${item.opacity};`;
                    const swatchClass = item.isLine ? 'color-line' : 'color-box';
                    legendHTML += `<div class="legend-item-row"><span class="${swatchClass}" style="${style}"></span><span>${item.label}</span></div>`;
                }
                return;
            }

            const sourceLayerIds = layerInfo.sources.map(s => s.id);
            const allVisibleFeatures = map.queryRenderedFeatures({ layers: sourceLayerIds });
            if (allVisibleFeatures.length === 0) return;

            const featuresByLayer = allVisibleFeatures.reduce((acc, feature) => {
                const layerId = feature.layer.id;
                if (!acc[layerId]) acc[layerId] = [];
                acc[layerId].push(feature);
                return acc;
            }, {});

            const itemsToShow = new Set();
            const matchedFeatureIds = new Set();

            layerInfo.items.forEach(item => {
                if (!item.code && !item.match) {
                    const itemLayerId = item.id || (layerInfo.sources.length === 1 ? layerInfo.sources[0].id : null);
                    if (itemLayerId && featuresByLayer[itemLayerId] && featuresByLayer[itemLayerId].length > 0) itemsToShow.add(item.label);
                    return; 
                }

                for (const feature of allVisibleFeatures) {
                    if (matchedFeatureIds.has(feature.id)) continue;
                    const props = feature.properties;
                    
                    // --- UPDATED LOGIC TO HANDLE GENERIC RANGES ---
                    if (item.match) {
                        const rule = item.match;
                         if (rule.value && props[rule.property] === rule.value) {
                            itemsToShow.add(item.label);
                        } else if (rule.min !== undefined && rule.max !== undefined) {
                            const propValue = Number(props[rule.property]);
                            if (propValue >= rule.min && propValue <= rule.max) {
                                itemsToShow.add(item.label);
                            }
                        }
                    } else if (item.code && item.code !== "__default__") {
                        const source = layerInfo.sources.find(s => s.id === feature.layer.id);
                        if (source && String(props[source.propertyKey]) === String(item.code)) {
                            itemsToShow.add(item.label);
                            matchedFeatureIds.add(feature.id);
                        }
                    } else if (item.code === "__default__") {
                        itemsToShow.add(item.label);
                    }
                }
            });
            
            const hasSpecificItem = layerInfo.items.some(item => item.code !== "__default__" && itemsToShow.has(item.label));
            const defaultItem = layerInfo.items.find(item => item.code === "__default__");
            if (hasSpecificItem && defaultItem && itemsToShow.has(defaultItem.label)) itemsToShow.delete(defaultItem.label);

            if (itemsToShow.size > 0) {
                legendHTML += `<div class="legend-title">${layerInfo.displayName}</div>`;
                const visibleItems = layerInfo.items.filter(item => itemsToShow.has(item.label));
                visibleItems.forEach(item => {
                    const style = `background-color: ${item.color}; opacity: ${item.opacity};`;
                    const swatchClass = item.isLine ? 'color-line' : 'color-box';
                    legendHTML += `<div class="legend-item-row"><span class="${swatchClass}" style="${style}"></span><span>${item.label}</span></div>`;
                });
            }
        });

        legendBox.innerHTML = legendHTML || '<div>No layers with a legend are currently visible.</div>';
    }

    window.updateLegend = updateLegend;
    legendButton.addEventListener('click', () => {
        const isVisible = legendBox.style.display === 'block';
        legendBox.style.display = isVisible ? 'none' : 'block';
        legendButton.classList.toggle('active', !isVisible);
        if (!isVisible) updateLegend();
    });

    map.on('moveend', updateLegend);
    map.on('zoom', updateLegend);
});