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

function getScaleBoxHTML(feetPerInch, userNumber) {
    return `
        <strong>1 inch = ${Math.round(feetPerInch)} feet</strong><br>
        <label for="scale-input" style="display:inline-block; margin-bottom:5px;">Set feet per inch:</label>
        <input type="number" id="scale-input" style="width: 70px; display:inline-block; margin-left:5px;" value="${userNumber !== null ? userNumber : ''}">
        <button id="scale-submit" style="display: block; margin: 0 auto 8px auto; width: 90%; height: 24px; padding: 0; font-size: 12px;">Submit</button>
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
}


// ============================================================================
// HELPER FUNCTION TO CREATE SCALE BAR ON PRINT
// ============================================================================

function getPrintScaleBarHTML(map) {
    const feetPerInch = getFeetPerInch();

    // Choose a round bar length (in inches for print); 2" is a good default
    const barInches = 2;
    const totalFeet = feetPerInch * barInches;

    // Round totalFeet to a nice number (nearest 10/50/100 for clarity)
    const niceFeet = Math.round(totalFeet / 10) * 10;

    // Adjust barInches if you want to round the bar itself (optional, for "nice" numbers)
    // e.g., barInches = niceFeet / feetPerInch;

    const halfFeet = Math.round(niceFeet / 2);

    // SVG for 3 ticks: 0, half, full
    // Width: 2in; adjust as needed for your layout
    return `
    <div style="margin-top:4px;">
      <svg width="2in" height="0.3in" viewBox="0 0 200 30">
        <rect x="10" y="15" width="180" height="5" fill="black"/>
        <rect x="10" y="10" width="2" height="15" fill="black"/>
        <rect x="100" y="10" width="2" height="15" fill="black"/>
        <rect x="190" y="10" width="2" height="15" fill="black"/>
        <text x="10" y="28" font-size="10">0</text>
        <text x="100" y="28" font-size="10" text-anchor="middle">${halfFeet}</text>
        <text x="190" y="28" font-size="10" text-anchor="end">${niceFeet} ft</text>
      </svg>
      <div style="font-size:10px; text-align:center;">
        Scale bar: 1 inch = ${feetPerInch.toFixed(0)} ft
      </div>
    </div>
    `;
}


// ============================================================================
// MAIN SCALE FUNCTION (event listener)
// ============================================================================

document.addEventListener("DOMContentLoaded", function () {
    const scaleZoomButton = document.getElementById("scaleZoom");
    const geocoderContainer = document.getElementById("geocoder-container");
    const scaleBoxDiv = document.getElementById("scale-box");
    let scaleVisibility = false;
    let userNumber = null;

    if (!scaleZoomButton || !geocoderContainer) {
        console.error("Required elements not found in the DOM.");
        return;
    }

    scaleBoxDiv.style.display = 'none';

    function attachScaleBoxListeners() {
        const scaleInput = document.getElementById('scale-input');
        const scaleSubmit = document.getElementById('scale-submit');
        const scaleDropdown = document.getElementById('scale-dropdown');

        scaleSubmit.addEventListener('click', () => {
            userNumber = scaleInput.value;
            if (!userNumber || isNaN(userNumber) || Number(userNumber) <= 0) {
                alert('Please enter a valid feet-per-inch value or select a preset.');
                return;
            }
            setMapToScale(userNumber);
        });

        scaleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                userNumber = scaleInput.value;
                if (!userNumber || isNaN(userNumber) || Number(userNumber) <= 0) {
                    alert('Please enter a valid feet-per-inch value or select a preset.');
                    return;
                }
                setMapToScale(userNumber);
            }
        });

        scaleDropdown.addEventListener('change', () => {
            if (scaleDropdown.value) {
                userNumber = scaleDropdown.value;
                scaleInput.value = userNumber;
                setMapToScale(userNumber);
            }
        });
    }

    function updateScaleBox() {
        const feetPerInch = getFeetPerInch();
        scaleBoxDiv.innerHTML = getScaleBoxHTML(feetPerInch, userNumber);
        scaleBoxDiv.style.display = 'block';
        attachScaleBoxListeners();
    }

    scaleZoomButton.addEventListener('click', () => {
        scaleVisibility = !scaleVisibility;
        if (scaleVisibility) {
            updateScaleBox();
        } else {
            scaleBoxDiv.style.display = 'none';
        }
    });

    map.on('moveend', () => {
        if (scaleVisibility) updateScaleBox();
    });

    map.on('zoom', () => {
        if (scaleVisibility) updateScaleBox();
    });
});

