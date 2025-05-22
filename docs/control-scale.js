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
    let scaleVisibility = false;
    let userNumber = null; // Variable to store the number

    if (!scaleZoomButton || !geocoderContainer) {
        console.error("Required elements not found in the DOM.");
        return;
    }

    scaleBoxDiv.style.display = 'none';

    scaleZoomButton.addEventListener('click', () => {
        scaleVisibility = !scaleVisibility;
        if (scaleVisibility) {
            const feetPerInch = getFeetPerInch();
            scaleBoxDiv.innerHTML = `
                1 inch = ${feetPerInch.toFixed(2)} feet<br>
                <label for="scale-input">Enter a number:</label>
                <input type="number" id="scale-input" style="width: 60px;" value="${userNumber !== null ? userNumber : ''}">
                <button id="scale-submit" style="margin-left: 5px;">Submit</button>
            `;
            scaleBoxDiv.style.display = 'block';

            const scaleInput = document.getElementById('scale-input');
            const scaleSubmit = document.getElementById('scale-submit');
            scaleSubmit.addEventListener('click', () => {
                userNumber = scaleInput.value;
                console.log('User number submitted:', userNumber);
            });
        } else {
            scaleBoxDiv.style.display = 'none';
        }
    });

    map.on('moveend', () => {
        if (scaleVisibility) {
            const feetPerInch = getFeetPerInch();
            scaleBoxDiv.innerHTML = `
                1 inch = ${feetPerInch.toFixed(2)} feet<br>
                <label for="scale-input">Enter a number:</label>
                <input type="number" id="scale-input" style="width: 60px;" value="${userNumber !== null ? userNumber : ''}">
                <button id="scale-submit" style="margin-left: 5px;">Submit</button>
            `;
            const scaleInput = document.getElementById('scale-input');
            const scaleSubmit = document.getElementById('scale-submit');
            scaleSubmit.addEventListener('click', () => {
                userNumber = scaleInput.value;
                console.log('User number submitted:', userNumber);
            });
        }
    });

    map.on('zoom', () => {
        if (scaleVisibility) {
            const feetPerInch = getFeetPerInch();
            scaleBoxDiv.innerHTML = `
                1 inch = ${feetPerInch.toFixed(2)} feet<br>
                <label for="scale-input">Enter a number:</label>
                <input type="number" id="scale-input" style="width: 60px;" value="${userNumber !== null ? userNumber : ''}">
                <button id="scale-submit" style="margin-left: 5px;">Submit</button>
            `;
            const scaleInput = document.getElementById('scale-input');
            const scaleSubmit = document.getElementById('scale-submit');
            scaleSubmit.addEventListener('click', () => {
                userNumber = scaleInput.value;
                console.log('User number submitted:', userNumber);
            });
        }
    });
});
