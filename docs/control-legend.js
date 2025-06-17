// control-legend.js
document.addEventListener("DOMContentLoaded", function () {
    const legendButton = document.getElementById("legendButton");
    const legendBox = document.getElementById("legend-box");
    let legendVisibility = false;

    function updateLegend() {
        map.on('load', () => {
            // This code block will only execute after the style has been fully loaded.
            const style = map.getStyle();
            console.log('Map style has loaded:', style);
        });
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