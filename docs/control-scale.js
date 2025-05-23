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

function setMapToScale(targetFeetPerInch, tolerance = .1) {
    let minZoom = map.getMinZoom();
    let maxZoom = map.getMaxZoom();
    let bestZoom = map.getZoom();
    let bestDiff = Infinity;
    let finalZoom = bestZoom;

    for (let i = 0; i < 20; i++) {
        map.jumpTo({ zoom: bestZoom }); // Use jumpTo for instant update
        let scale = getFeetPerInch();
        let diff = scale - targetFeetPerInch;
        if (Math.abs(diff) < tolerance) break;
        if (diff > 0) minZoom = bestZoom;
        else maxZoom = bestZoom;
        bestZoom = (minZoom + maxZoom) / 2;
        finalZoom = bestZoom;
    }
    map.jumpTo({ zoom: finalZoom }); // Set zoom only once at the end
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
                <strong>1 inch = ${Math.round(feetPerInch)} feet</strong><br>
                <label for="scale-input" style="display:inline-block; margin-bottom:5px;">Set feet per inch:</label>
                <input type="number" id="scale-input" style="width: 70px; display:inline-block; margin-left:5px;" value="${userNumber !== null ? userNumber : ''}">
                <button id="scale-submit" style="display: block; margin: 8px auto 8px auto; width: 90%; height: 24px; padding: 0; font-size: 12px;">Submit</button>
                <label for="scale-dropdown">Or select a preset:</label>
                <select id="scale-dropdown" style="margin-top:5px;">
                    <option value="">-- Select --</option>
                    <option value="100">1" = 100 feet</option>
                    <option value="200">1" = 200 feet</option>
                    <option value="300">1" = 300 feet</option>
                    <option value="400">1" = 400 feet</option>
                    <option value="500">1" = 500 feet</option>
                    <option value="1000">1" = 1000 feet</option>
                </select>
            `;
            scaleBoxDiv.style.display = 'block';

            const scaleInput = document.getElementById('scale-input');
            const scaleSubmit = document.getElementById('scale-submit');
            const scaleDropdown = document.getElementById('scale-dropdown');

            scaleSubmit.addEventListener('click', () => {
                userNumber = scaleInput.value;
                console.log('User number submitted:', userNumber);
                setMapToScale(userNumber);
            });

            scaleDropdown.addEventListener('change', () => {
                if (scaleDropdown.value) {
                    userNumber = scaleDropdown.value;
                    scaleInput.value = userNumber;
                    console.log('User number selected from dropdown:', userNumber);
                    setMapToScale(userNumber);
                }
            });
        } else {
            scaleBoxDiv.style.display = 'none';
        }
    });

    map.on('moveend', () => {
        if (scaleVisibility) {
            const feetPerInch = getFeetPerInch();
            scaleBoxDiv.innerHTML = `
                <strong>1 inch = ${Math.round(feetPerInch)} feet</strong><br>
                <label for="scale-input" style="display:inline-block; margin-bottom:5px;">Set feet per inch:</label>
                <input type="number" id="scale-input" style="width: 70px; display:inline-block; margin-left:5px;" value="${userNumber !== null ? userNumber : ''}">
                <button id="scale-submit" style="display: block; margin: 8px auto 8px auto; width: 90%; height: 24px; padding: 0; font-size: 12px;">Submit</button>
                <label for="scale-dropdown">Or select a preset:</label>
                <select id="scale-dropdown" style="margin-top:5px;">
                    <option value="">-- Select --</option>
                    <option value="100">1" = 100 feet</option>
                    <option value="200">1" = 200 feet</option>
                    <option value="300">1" = 300 feet</option>
                    <option value="400">1" = 400 feet</option>
                    <option value="500">1" = 500 feet</option>
                    <option value="1000">1" = 1000 feet</option>
                </select>
            `;
            scaleBoxDiv.style.display = 'block';

            const scaleInput = document.getElementById('scale-input');
            const scaleSubmit = document.getElementById('scale-submit');
            const scaleDropdown = document.getElementById('scale-dropdown');

            scaleSubmit.addEventListener('click', () => {
                userNumber = scaleInput.value;
                console.log('User number submitted:', userNumber);
                setMapToScale(userNumber);
            });

            scaleDropdown.addEventListener('change', () => {
                if (scaleDropdown.value) {
                    userNumber = scaleDropdown.value;
                    scaleInput.value = userNumber;
                    console.log('User number selected from dropdown:', userNumber);
                    setMapToScale(userNumber);
                }
            });
        }
    });

    map.on('zoom', () => {
        if (scaleVisibility) {
            const feetPerInch = getFeetPerInch();
            scaleBoxDiv.innerHTML = `
                <strong>1 inch = ${Math.round(feetPerInch)} feet</strong><br>
                <label for="scale-input" style="display:inline-block; margin-bottom:5px;">Set feet per inch:</label>
                <input type="number" id="scale-input" style="width: 70px; display:inline-block; margin-left:5px;" value="${userNumber !== null ? userNumber : ''}">
                <button id="scale-submit" style="display: block; margin: 8px auto 8px auto; width: 90%; height: 24px; padding: 0; font-size: 12px;">Submit</button>
                <label for="scale-dropdown">Or select a preset:</label>
                <select id="scale-dropdown" style="margin-top:5px;">
                    <option value="">-- Select --</option>
                    <option value="100">1" = 100 feet</option>
                    <option value="200">1" = 200 feet</option>
                    <option value="300">1" = 300 feet</option>
                    <option value="400">1" = 400 feet</option>
                    <option value="500">1" = 500 feet</option>
                    <option value="1000">1" = 1000 feet</option>
                </select>
            `;
            scaleBoxDiv.style.display = 'block';

            const scaleInput = document.getElementById('scale-input');
            const scaleSubmit = document.getElementById('scale-submit');
            const scaleDropdown = document.getElementById('scale-dropdown');

            scaleSubmit.addEventListener('click', () => {
                userNumber = scaleInput.value;
                console.log('User number submitted:', userNumber);
                setMapToScale(userNumber);
            });

            scaleDropdown.addEventListener('change', () => {
                if (scaleDropdown.value) {
                    userNumber = scaleDropdown.value;
                    scaleInput.value = userNumber;
                    console.log('User number selected from dropdown:', userNumber);
                    setMapToScale(userNumber);
                }
            });
        }
    });
});
