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
            count++;

                // iterate over the legend items for a given set
                for (let i = 0; i < layerInfo.items.length; i++) {
                    if (count >= 16) {
                        legendHTML += '<div>...</div>';
                        break;
                    }
                    if (count % 8 === 0) {
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

    function updateLegend() {
        if (legendBox.style.display === 'none') {
            return; 
        }

        const visibleLayerIDs = new Set();
        const features = map.queryRenderedFeatures();
        features.forEach(feature => visibleLayerIDs.add(feature.layer.id));

        let legendHTML = '';

        legendData.forEach(layerInfo => {
            if (visibleLayerIDs.has(layerInfo.id)) {
                legendHTML += `<div class="legend-title">${layerInfo.displayName}</div>`;

                layerInfo.items.forEach(item => {
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