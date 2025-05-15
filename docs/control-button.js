let placingPoint = false;
let marker = null;
const markerCoordinates = { lat: null, lng: null };

function setPinPosition(lat, lng) {
    markerCoordinates.lat = lat;
    markerCoordinates.lng = lng;
    console.log("Pin position updated:", markerCoordinates);
}

function getMarkerCoordinates() {
    if (marker) {
        let { lng, lat } = marker.getLngLat();
        console.log("Marker coordinates:", { lng, lat });
        return { lng, lat };
    }
    console.log("No marker is currently placed.");
    return null;
}

function dropPinAtCenter() {
    if (marker) {
        // A marker exists, center the map on it
        let { lng, lat } = marker.getLngLat();
        markerCoordinates.lng = lng;  // update the coordinate values
        markerCoordinates.lat = lat;
        map.flyTo({ center: markerCoordinates, essential: true });
    } else {
        // No marker exists, create one at the map's center
        let center = map.getCenter();
        marker = new mapboxgl.Marker().setLngLat(center).addTo(map);
        markerCoordinates.lng = center.lng;
        markerCoordinates.lat = center.lat;
    }

    console.log(`Marker Coordinates: ${markerCoordinates.lng}, ${markerCoordinates.lat}`);
    return markerCoordinates;
}

// Point button: activate placement mode
document.getElementById('pointButton').addEventListener('click', function () {
    placingPoint = true;
    map.getCanvas().style.cursor = 'crosshair';
    console.log("Click on the map to drop a point.");
});

// Map click: drop point if active
map.on('click', function (event) {
    if (!placingPoint) return;
    const { lat, lng } = event.lngLat;
    setPinPosition(lat, lng);

    if (marker) marker.remove();
    marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);

    placingPoint = false;
    map.getCanvas().style.cursor = '';
});

// Center point button
document.getElementById('pointCButton').addEventListener('click', function () {
    const center = dropPinAtCenter();
    console.log("Centered marker at:", center);
});

// Point off button
document.getElementById('pointOffButton').addEventListener('click', function () {
    if (marker) {
        marker.remove();
        marker = null;
    }
    markerCoordinates.lat = null;
    markerCoordinates.lng = null;
    console.log("Marker removed.");
});

// == PRINT AREA ===================================================
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