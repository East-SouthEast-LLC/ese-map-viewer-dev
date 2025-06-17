// control-legend.js
document.addEventListener("DOMContentLoaded", function () {
    const legendButton = document.getElementById("legendButton");
    const legendBox = document.getElementById("legend-box");
    let legendVisibility = false;

    // --- Customize This List ---
    // Add the layer IDs you want to be able to show in the legend.
    // The text from this list will be used as the legend label.
    const legendLayerIds = [
        'tools', 
        'satellite', 
        'parcels', 
        'parcel highlight', 
        'contours', 
        'agis', 
        'historic', 
        'floodplain', 
        'acec', 
        'DEP wetland', 
        'endangered species', 
        'zone II', 
        'soils', 
        'conservancy districts', 
        'zoning', 
        'conservation', 
        'sewer', 
        'sewer plans', 
        'stories', 
        'intersection'
    ];

    /**
     * Generates the HTML for the legend based on visible layers.
     * @param {Array} visibleLayers - An array of visible layer ID strings.
     * @returns {string} The HTML string for the legend.
     */
    function generateLegendHTML(visibleLayers) {
        if (visibleLayers.length === 0) {
            return "No legendable layers are active.";
        }

        let html = '<h4 style="margin: 0 0 10px 0; text-align: center;">Legend</h4>';

        visibleLayers.forEach(layerId => {
            const color = getLayerColor(layerId);
            
            html += `
                <div style="display: flex; align-items: center; margin-bottom: 5px;">
                    <span style="height: 15px; width: 15px; background-color: ${color}; border: 1px solid #000; margin-right: 5px;"></span>
                    <span>${layerId}</span>
                </div>
            `;
        });
        
        return html;
    }

    /**
     * Gets a representative color for a given layer ID.
     * @param {string} layerId - The ID of the layer.
     * @returns {string} A CSS color string.
     */
    function getLayerColor(layerId) {
        // Try to get fill-color first, then line-color.
        let color = map.getPaintProperty(layerId, 'fill-color') || map.getPaintProperty(layerId, 'line-color');

        if (typeof color === 'string') {
            return color;
        }

        return '#888888'; // Default grey for complex fills
    }


    /**
     * Toggles the legend's visibility and updates its content.
     */
    function updateLegend() {
        // Find which of our specified layers are currently visible
        const visibleLegendLayers = legendLayerIds.filter(layerId => {
            try {
                // Important: Check if layer exists before trying to get its properties
                return map.getLayer(layerId) && map.getLayoutProperty(layerId, 'visibility') === 'visible';
            } catch (e) {
                return false;
            }
        });
        
        // Generate and display the legend
        legendBox.innerHTML = generateLegendHTML(visibleLegendLayers);
    }

    // Main click listener for the button
    if (legendButton) {
        legendButton.addEventListener('click', () => {
            legendVisibility = !legendVisibility; // Toggle the state
            if (legendVisibility) {
                // Update content first, then show
                updateLegend(); 
                legendBox.style.display = 'block';
                // Also listen for map changes to keep the legend in sync while it's open
                map.on('moveend', updateLegend);
            } else {
                legendBox.style.display = 'none';
                // Stop listening for map changes when legend is closed to save resources
                map.off('moveend', updateLegend);
            }
        });
    } else {
        console.error("Legend button not found.");
    }
});