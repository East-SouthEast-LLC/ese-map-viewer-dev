// src/js/components/control/legend.js

function getPrintBoundingBox() {
    if (!map) return;
    const center = map.getCenter();
    const bounds = map.getBounds();
    const northLat = bounds.getNorth();
    const centerLat = center.lat;
    const halfHeightMeters = turf.distance([center.lng, center.lat], [center.lng, northLat], { units: 'meters' });
    const halfWidthMeters = halfHeightMeters;
    const north = centerLat + (halfHeightMeters / 111320);
    const south = centerLat - (halfHeightMeters / 111320);
    const lngDiff = halfWidthMeters / (111320 * Math.cos(centerLat * (Math.PI / 180)));
    const east = center.lng + lngDiff;
    const west = center.lng - lngDiff;
    return [[west, north], [east, north], [east, south], [west, south], [west, north]];
}

function getLegendForPrint(expectedLayerIds = []) {
    const geoJsonBounds = getPrintBoundingBox();
    if (!geoJsonBounds) {
        return '<div class="legend-item">Error calculating print area.</div>';
    }
    
    const topLeftGeo = geoJsonBounds[0];
    const bottomRightGeo = geoJsonBounds[2];
    const topLeftPixel = map.project(topLeftGeo);
    const bottomRightPixel = map.project(bottomRightGeo);
    const printPixelBoundingBox = [ [topLeftPixel.x, topLeftPixel.y], [bottomRightPixel.x, bottomRightPixel.y] ];

    const allItemsToRender = []; 
    const renderedLegendSections = new Set();
    
    const allQueryableLayers = (window.layerConfig || [])
        .flatMap(l => l.legendConfig?.sources?.map(s => s.id) || [])
        .filter(id => map.getLayer(id) && map.getLayoutProperty(id, 'visibility') === 'visible');
                                         
    const allVisibleFeatures = allQueryableLayers.length > 0 ? map.queryRenderedFeatures(printPixelBoundingBox, { layers: allQueryableLayers }) : [];

    const featuresByLayer = allVisibleFeatures.reduce((acc, feature) => {
        const layerId = feature.layer.id;
        if (!acc[layerId]) { acc[layerId] = []; }
        acc[layerId].push(feature);
        return acc;
    }, {});

    (window.layerConfig || []).forEach(layerInfo => {
        if (!layerInfo.legendConfig) return;

        const { displayName, legendConfig } = layerInfo;
        const { sources, items } = legendConfig;

        if (layerInfo.id === 'usgs-quad-legend') {
            if (window.usgsTilesInitialized && map.getZoom() >= 12) {
                allItemsToRender.push(`<div class="legend-section">${displayName}</div>`);
                const item = items[0];
                const style = `background-color: ${item.color}; opacity: ${item.opacity};`;
                allItemsToRender.push(
                    `<div class="legend-item"><span class="color-box" style="${style}"></span><span>${item.label}</span></div>`
                );
                renderedLegendSections.add(displayName);
            }
            return;
        }

        // handle simple, non-source-based legend items
        if (!sources) {
            if (map.getLayer(layerInfo.id) && map.getLayoutProperty(layerInfo.id, 'visibility') === 'visible') {
                allItemsToRender.push(`<div class="legend-section">${displayName}</div>`);
                items.forEach(item => {
                    const style = `background-color: ${item.color}; opacity: ${item.opacity};`;
                    const swatchClass = item.isLine ? 'color-line' : 'color-box';
                    allItemsToRender.push(
                        `<div class="legend-item"><span class="${swatchClass}" style="${style}"></span><span>${item.label}</span></div>`
                    );
                });
                renderedLegendSections.add(displayName);
            }
            return;
        }
        
        const sourceLayerIds = sources.map(s => s.id);
        const visibleFeaturesForLayer = sourceLayerIds.flatMap(id => featuresByLayer[id] || []);

        if (visibleFeaturesForLayer.length === 0) return;

        const itemsToShow = new Set();
        const matchedFeatureIds = new Set();

        items.forEach(item => {
            if (!item.code && !item.match) {
                const itemLayerId = item.id || (sources.length === 1 ? sources[0].id : null);
                if (itemLayerId && featuresByLayer[itemLayerId] && featuresByLayer[itemLayerId].length > 0) {
                    itemsToShow.add(item.label);
                }
                return;
            }

            for (const feature of visibleFeaturesForLayer) {
                if (matchedFeatureIds.has(feature.id) && item.code !== "__default__") continue;
                
                const props = feature.properties;

                if (item.match) { 
                    const rule = item.match;
                    if (props[rule.property] === rule.value) itemsToShow.add(item.label); 
                    else if (rule.property === "DATE" && (Number(props.DATE) >= rule.min && Number(props.DATE) <= rule.max)) itemsToShow.add(item.label); 
                    else if (rule.property === "_LOT_SIZE" && (Number(props._LOT_SIZE) >= rule.min && Number(props._LOT_SIZE) <= rule.max)) itemsToShow.add(item.label);
                } else if (item.code && item.code !== "__default__") {
                    const source = sources.find(s => s.id === feature.layer.id);
                    if (source && String(props[source.propertyKey]) === String(item.code)) {
                        itemsToShow.add(item.label);
                        matchedFeatureIds.add(feature.id);
                    }
                } else if (item.code === "__default__") {
                    itemsToShow.add(item.label);
                }
            }
        });
        
        const hasSpecificItem = items.some(item => item.code !== "__default__" && itemsToShow.has(item.label));
        const defaultItem = items.find(item => item.code === "__default__");
        if (hasSpecificItem && defaultItem && itemsToShow.has(defaultItem.label)) {
            itemsToShow.delete(defaultItem.label);
        }

        if (itemsToShow.size > 0) {
            allItemsToRender.push(`<div class="legend-section">${displayName}</div>`);
            renderedLegendSections.add(displayName);
            const visibleItems = items.filter(item => itemsToShow.has(item.label));
            visibleItems.forEach(item => {
                const style = `background-color: ${item.color}; opacity: ${item.opacity};`;
                const swatchClass = item.isLine ? 'color-line' : 'color-box';
                allItemsToRender.push(
                    `<div class="legend-item"><span class="${swatchClass}" style="${style}"></span><span>${item.label}</span></div>`
                );
            });
        }
    });
    
    if (allItemsToRender.length === 0) {
        return '<div class="legend-grid"></div>';
    }

    return `<div class="legend-grid">${allItemsToRender.join('')}</div>`;
}

function updateLegend() {
    const legendBox = document.getElementById("legend-box");
    if (legendBox.style.display === 'none') return;

    let legendHTML = '';

    (window.layerConfig || []).forEach(layerInfo => {
        if (!layerInfo.legendConfig) return;

        const { id, displayName, legendConfig } = layerInfo;
        const { sources, items } = legendConfig;

        if (id === 'usgs-quad-legend') {
            if (window.usgsTilesInitialized && map.getZoom() >= 12) {
                legendHTML += `<div class="legend-title">${displayName}</div>`;
                const item = items[0];
                const style = `background-color: ${item.color}; opacity: ${item.opacity};`;
                legendHTML += `<div class="legend-item-row"><span class="color-box" style="${style}"></span><span>${item.label}</span></div>`;
            }
            return;
        }

        // handle simple layers without sources (like satellite, parcel highlight)
        if (!sources) {
            if (map.getLayer(id) && map.getLayoutProperty(id, 'visibility') === 'visible') {
                legendHTML += `<div class="legend-title">${displayName}</div>`;
                items.forEach(item => {
                    const style = `background-color: ${item.color}; opacity: ${item.opacity};`;
                    const swatchClass = item.isLine ? 'color-line' : 'color-box';
                    legendHTML += `<div class="legend-item-row"><span class="${swatchClass}" style="${style}"></span><span>${item.label}</span></div>`;
                });
            }
            return;
        }

        const sourceIds = sources.map(s => s.id).filter(id => map.getLayer(id));
        if (sourceIds.length === 0) return;
        
        const allVisibleFeatures = map.queryRenderedFeatures({ layers: sourceIds });
        if (allVisibleFeatures.length === 0) return;

        const itemsToShow = new Set();
        const matchedFeatureIds = new Set();

        items.forEach(item => {
            if (!item.code && !item.match) {
                if (map.queryRenderedFeatures({ layers: [item.id] }).length > 0) {
                    itemsToShow.add(item.label);
                }
                return; 
            }

            for (const feature of allVisibleFeatures) {
                if (matchedFeatureIds.has(feature.id)) continue;
                
                const props = feature.properties;
                
                if (item.match) {
                    const rule = item.match;
                    if (props[rule.property] === rule.value) itemsToShow.add(item.label); 
                    else if (rule.property === "DATE" && (Number(props.DATE) >= rule.min && Number(props.DATE) <= rule.max)) itemsToShow.add(item.label); 
                    else if (rule.property === "_LOT_SIZE" && (Number(props._LOT_SIZE) >= rule.min && Number(props._LOT_SIZE) <= rule.max)) itemsToShow.add(item.label); 
                } else if (item.code && item.code !== "__default__") {
                    const source = sources.find(s => s.id === feature.layer.id);
                    if (source && String(props[source.propertyKey]) === String(item.code)) {
                        itemsToShow.add(item.label);
                        matchedFeatureIds.add(feature.id);
                    }
                } else if (item.code === "__default__") {
                    itemsToShow.add(item.label);
                }
            }
        });
        
        const hasSpecificItem = items.some(item => item.code !== "__default__" && itemsToShow.has(item.label));
        const defaultItem = items.find(item => item.code === "__default__");
        if (hasSpecificItem && defaultItem && itemsToShow.has(defaultItem.label)) {
             itemsToShow.delete(defaultItem.label);
        }

        if (itemsToShow.size > 0) {
            legendHTML += `<div class="legend-title">${displayName}</div>`;
            const visibleItems = items.filter(item => itemsToShow.has(item.label));
            visibleItems.forEach(item => {
                const style = `background-color: ${item.color}; opacity: ${item.opacity};`;
                const swatchClass = item.isLine ? 'color-line' : 'color-box';
                legendHTML += `<div class="legend-item-row"><span class="${swatchClass}" style="${style}"></span><span>${item.label}</span></div>`;
            });
        }
    });

    if (legendHTML === '') {
        legendHTML = '<div>No layers with a legend are currently visible.</div>';
    }
    
    legendBox.innerHTML = legendHTML;
}

const legendButton = document.getElementById("legendButton");
const legendBox = document.getElementById("legend-box");
let legendVisibility = false;
legendBox.style.display = 'none';
window.updateLegend = updateLegend;

if (legendButton && legendBox) {
    legendButton.addEventListener('click', () => {
        legendVisibility = !legendVisibility;
        if (legendVisibility) {
            legendBox.style.display = 'block';
            legendButton.classList.add('active');
            updateLegend();
        } else {
            legendBox.style.display = 'none';
            legendButton.classList.remove('active');
        }
    });

    map.on('moveend', updateLegend);
    map.on('zoom', updateLegend);
}