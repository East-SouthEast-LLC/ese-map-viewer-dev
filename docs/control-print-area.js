// PRINT AREA CONTROL BUTTON SCRIPT

// ============================================================================
// HELPER FUNCTIONS FOR PRINT AREA FUNCTIONALITY
// ============================================================================

function updateBoundingBox() {
    if (!map) return; // Ensure map is ready

    const center = map.getCenter(); // Get the map's center point (lng, lat)
    const bounds = map.getBounds(); // Get the map's bounds

    const northLat = bounds.getNorth(); // North bound of map
    const centerLat = center.lat; // Latitude of the map center

    // Calculate the distance from center to the top of the visible map in meters
    const halfHeightMeters = turf.distance(
        [center.lng, center.lat], // Center point
        [center.lng, northLat], // North point
        { units: 'meters' }
    );

    // Calculate the half-width using the 75/80 ratio in meters
    const halfWidthMeters = halfHeightMeters * 75 / 80;

    // Convert distances back into lat/lng
    const north = centerLat + (halfHeightMeters / 111320); // Convert meters to lat
    const south = centerLat - (halfHeightMeters / 111320); // Convert meters to lat

    // Convert width (meters) to longitude difference
    const lngDiff = halfWidthMeters / (111320 * Math.cos(centerLat * (Math.PI / 180)));

    const east = center.lng + lngDiff;
    const west = center.lng - lngDiff;

    // Compute diagonal distance for scale calculation
    const diagonalMeters = turf.distance(
        [west, north], [east, south], { units: 'meters' }
    );
    const diagonalFeet = diagonalMeters * 3.28084; // Convert meters to feet

    // Compute scale: 1" = X feet
    const mapDiagonalInches = Math.sqrt(7.5 ** 2 + 8.0 ** 2);
    const scaleFeetPerInch = Math.round(diagonalFeet / mapDiagonalInches);

    // Update scale-box text
    document.getElementById('scale-box').innerText = `1" = ${scaleFeetPerInch} feet`;

    // Remove any existing bounding box before adding a new one
    removeBoundingBox();

    // Create a new bounding box using the calculated lat/lng values
    map.addSource('boundingBox', {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [west, north], [east, north], 
                    [east, south], [west, south], 
                    [west, north]  // Close the box
                ]]
            }
        }
    });

    map.addLayer({
        id: 'boundingBox',
        type: 'line',
        source: 'boundingBox',
        layout: {},
        paint: {
            'line-color': '#ff0000',
            'line-width': 2,
            'line-dasharray': [4, 2]
        }
    });
}

function removeBoundingBox() {
    if (map.getLayer('boundingBox')) {
        map.removeLayer('boundingBox');
    }
    if (map.getSource('boundingBox')) {
        map.removeSource('boundingBox');
    }
}

// ============================================================================
// MAIN PRINT AREA FUNCTION (event listener)
// ============================================================================

document.addEventListener("DOMContentLoaded", function () {
    const pareaButton = document.getElementById('pareaButton');
    const scaleBoxDiv = document.getElementById('scale-box');
    let boundingBoxVisible = false; // Track visibility

    if (!pareaButton || !scaleBoxDiv) {
        console.error("Required elements not found in the DOM");
        return;
    }

    // Hide scale-box on page load
    scaleBoxDiv.style.display = 'none';

    pareaButton.addEventListener('click', () => {
        if (boundingBoxVisible) {
            removeBoundingBox();
            scaleBoxDiv.style.display = 'none'; // Hide scale box
        } else {
            updateBoundingBox();
            scaleBoxDiv.style.display = 'block'; // Show scale box
        }
        boundingBoxVisible = !boundingBoxVisible; // Toggle state
    });

    map.on('moveend', () => {
        if (boundingBoxVisible) {
            updateBoundingBox();
        }
    });

    map.on('zoom', () => {
        if (boundingBoxVisible) {
            updateBoundingBox();
        }
    });
});