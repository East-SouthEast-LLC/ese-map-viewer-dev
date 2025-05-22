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

function setMapToScale(targetFeetPerInch, tolerance = 1) {
    let minZoom = map.getMinZoom();
    let maxZoom = map.getMaxZoom();
    let zoom = map.getZoom();
    let iterations = 0;
    while (iterations < 20) {
        map.setZoom(zoom);
        let scale = getFeetPerInch();
        let diff = scale - targetFeetPerInch;
        if (Math.abs(diff) < tolerance) break;
        if (diff > 0) minZoom = zoom;
        else maxZoom = zoom;
        zoom = (minZoom + maxZoom) / 2;
        iterations++;
    }
    map.setZoom(zoom);
}

// ============================================================================
// MAIN SCALE FUNCTION (event listener)
// ============================================================================

document.addEventListener("DOMContentLoaded", function () {
    const scaleZoomButton = document.getElementById("scaleZoom");
    const scaleInput = document.getElementById("scaleInput");
    const scaleDisplay = document.getElementById("scaleDisplay");

    if (!scaleZoomButton || !scaleInput || !scaleDisplay) {
        console.error("Required elements not found in the DOM.");
        return;
    }

    function updateScaleDisplay() {
        const scale = Math.round(getFeetPerInch());
        scaleDisplay.innerText = `1" = ${scale} feet`;
    }

    scaleZoomButton.addEventListener("click", () => {
        const target = Number(scaleInput.value);
        if (target > 0) setMapToScale(target);
    });

    map.on('moveend', updateScaleDisplay);
    map.on('zoom', updateScaleDisplay);

    // Initialize
    updateScaleDisplay();
});
