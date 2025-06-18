// control-legend.js

// helper function for print output
function getLegendForPrint() {
    const visibleLayerIDs = new Set();
    const printBoundingBox = getPrintingFrameCoordinates();
    const features = map.queryRenderedFeatures(printBoundingBox);

    // create an array of all json items that need space on the legend
    const legendItems = [];
    
    features.forEach(feature => visibleLayerIDs.add(feature.layer.id));
    legendData.forEach(layerInfo => {
        if (visibleLayerIDs.has(layerInfo.id)) {
            layerInfo.items.forEach(item => {
                legendItems.push(item);
                console.log("Legend item added:", item);
            });
        }
    });
    return legendItems;
}

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