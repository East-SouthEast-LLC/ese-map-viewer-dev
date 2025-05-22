// SCALE CONTROL BUTTON SCRIPT

// ============================================================================
// HELPER FUNCTIONS FOR SCALE FUNCTIONALITY
// ============================================================================

function getFeetPerInch() {
    const center = map.getCenter();
    const bounds = map.getBounds();
    const northLat = bounds.getNorth();
    const centerLat = center.lat;

    // Distance from center to top in meters
    const halfHeightMeters = turf.distance(
        [center.lng, center.lat],
        [center.lng, northLat],
        { units: 'meters' }
    );
    const halfWidthMeters = halfHeightMeters * 75 / 80;
    const north = centerLat + (halfHeightMeters / 111320);
    const south = centerLat - (halfHeightMeters / 111320);
    const lngDiff = halfWidthMeters / (111320 * Math.cos(centerLat * (Math.PI / 180)));
    const east = center.lng + lngDiff;
    const west = center.lng - lngDiff;
    const diagonalMeters = turf.distance(
        [west, north], [east, south], { units: 'meters' }
    );
    const diagonalFeet = diagonalMeters * 3.28084;
    const mapDiagonalInches = Math.sqrt(7.5 ** 2 + 8.0 ** 2);
    return diagonalFeet / mapDiagonalInches;
}
// ============================================================================
// MAIN SCALE FUNCTION (event listener)
// ============================================================================

document.addEventListener("DOMContentLoaded", function () {
    const scaleZoomButton = document.getElementById("scaleZoom");
    const geocoderContainer = document.getElementById("geocoder-container");
    const scaleBoxDiv = document.getElementById("scale-box");
    let scaleVisibility = false; // Track visibility


    if (!scaleZoomButton || !geocoderContainer) {
        console.error("Required elements not found in the DOM.");
        return;
    }

    scaleBoxDiv.style.display = 'none';

    scaleZoomButton.addEventListener('click', () => {
        if (scaleVisibility) {
            scaleBoxDiv.style.display = 'none'; // Hide scale box
        } else {
            // update the scale display
            scaleBoxDiv.style.display = 'block'; // Show scale box
        }
    });

    map.on('moveend', () => {
        if (scaleVisibility) {
            // update the scale display
        }
    });

    map.on('zoom', () => {
        if (scaleVisibility) {
            // Update the scale display
        }
    });
});
