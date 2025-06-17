// control-legend.js

// ============================================================================
// HELPER FUNCTIONS FOR LEGEND FUNCTIONALITY
// ============================================================================

function updateLegend() {
    console.log("Updating legend...");
    const style = map.getStyle();
    console.log('Map style has loaded:', style);
}








// ============================================================================
// MAIN LEGEND FUNCTION (event listener)
// ============================================================================

document.addEventListener("DOMContentLoaded", function () {
    const legendButton = document.getElementById("legendButton");
    const legendBox = document.getElementById("legend-box");
    let legendVisibility = false

    if (!legendButton || !legendBox) {
        console.error("Required elements not found in the DOM.");
        return;
    }


    legendButton.addEventListener('click', () => {
        legendVisibility = !legendVisibility;
        if (legendVisibility) {
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