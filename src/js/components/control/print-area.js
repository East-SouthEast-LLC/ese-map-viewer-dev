function updateBoundingBox() {
    if (!map) return; // ensure map is ready

    const center = map.getCenter(); // get the map's center point (lng, lat)
    const bounds = map.getBounds(); // get the map's bounds

    const northLat = bounds.getNorth(); // north bound of map
    const centerLat = center.lat; // latitude of the map center

    // calculate the distance from center to the top of the visible map in meters
    const halfHeightMeters = turf.distance(
        [center.lng, center.lat], // center point
        [center.lng, northLat], // north point
        { units: 'meters' }
    );

    // calculate the half-width to be equal to the half-height for an 8x8 aspect ratio
    const halfWidthMeters = halfHeightMeters;

    // convert distances back into lat/lng
    const north = centerLat + (halfHeightMeters / 111320); // convert meters to lat
    const south = centerLat - (halfHeightMeters / 111320); // convert meters to lat

    // convert width (meters) to longitude difference
    const lngDiff = halfWidthMeters / (111320 * Math.cos(centerLat * (Math.PI / 180)));

    const east = center.lng + lngDiff;
    const west = center.lng - lngDiff;

    // compute diagonal distance for scale calculation
    const diagonalMeters = turf.distance(
        [west, north], [east, south], { units: 'meters' }
    );
    const diagonalFeet = diagonalMeters * 3.28084; // convert meters to feet

    // compute scale for an 8x8 inch area
    const mapDiagonalInches = Math.sqrt(8.0 ** 2 + 8.0 ** 2);
    const scaleFeetPerInch = Math.round(diagonalFeet / mapDiagonalInches);

    // update scale-box text
    document.getElementById('scale-box').innerText = `1" = ${scaleFeetPerInch} feet`;

    // remove any existing bounding box before adding a new one
    removeBoundingBox();

    // create a new bounding box using the calculated lat/lng values
    map.addSource('boundingBox', {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [west, north], [east, north], 
                    [east, south], [west, south], 
                    [west, north]  // close the box
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

const pareaButton = document.getElementById('pareaButton');
// renamed the variable to avoid conflict with scale.js
const printArea_scaleBox = document.getElementById('scale-box');
let boundingBoxVisible = false; // track visibility

if (!pareaButton || !printArea_scaleBox) {
    console.error("required elements for print area not found in the dom");
} else {
    // hide scale-box on page load
    printArea_scaleBox.style.display = 'none';

    pareaButton.addEventListener('click', () => {
        boundingBoxVisible = !boundingBoxVisible; // toggle state
        if (boundingBoxVisible) {
            updateBoundingBox();
            printArea_scaleBox.style.display = 'block'; // show scale box
            pareaButton.classList.add('active'); // add active class
        } else {
            removeBoundingBox();
            printArea_scaleBox.style.display = 'none'; // hide scale box
            pareaButton.classList.remove('active'); // remove active class
        }
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
}