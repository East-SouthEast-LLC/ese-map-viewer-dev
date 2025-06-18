// control-legend.js

document.addEventListener("DOMContentLoaded", function () {
    const legendButton = document.getElementById("legendButton");
    const legendBox = document.getElementById("legend-box");
    let legendVisibility = false;
    let legendData = [];
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
        const visibleLayerIDs = new Set();
        const features = map.queryRenderedFeatures();
        features.forEach(feature => visibleLayerIDs.add(feature.layer.id));

        let legendHTML = '';

        legendData.forEach(layerInfo => {
            if (visibleLayerIDs.has(layerInfo.id)) {
                // Use the new "displayName" property for the title
                legendHTML += `<div class="legend-title">${layerInfo.displayName}</div>`;

                layerInfo.items.forEach(item => {
                    const style = `background-color: ${item.color}; opacity: ${item.opacity};`;
                    if (item.isLine) { // set color line
                        legendHTML += `
                            <div class="legend-item-row">
                                <span class="color-line" style="${style}"></span>
                                <span>${item.label}</span>
                            </div>
                        `;
                    } else { // if not line, set color box instead
                        legendHTML += `
                            <div class="legend-item-row">
                                <span class="color-box" style="${style}"></span>
                                <span>${item.label}</span>
                            </div>
                        `;
                    }
                });
            }
        });

        if (legendHTML === '') {
            legendHTML = '<div>No layers with a legend are currently visible.</div>';
        }
        legendBox.innerHTML = legendHTML;
    }

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

    map.on('moveend', () => {
        if (legendVisibility) updateLegend();
    });

    map.on('zoom', () => {
        if (legendVisibility) updateLegend();
    });
});