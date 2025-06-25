// control-measure.js

// ============================================================================
// HELPER FUNCTIONS FOR MEASUREMENT FUNCTIONALITY
// ============================================================================

// Hide distance display on page load
document.getElementById('distance-display').style.display = 'none';
// Global array to store marker positions and labels
let markerPositions = [];
let markerCounter = 65; // Start with 'A'
let distanceButtonClicked = false; // Flag to prevent multiple clicks
let markers = []; // Array to keep track of marker instances

function addLabel(event) {
    const { lng, lat } = event.lngLat;

    // Create a new label for the marker (A, B, C, etc.)
    const label = String.fromCharCode(markerCounter);  // Convert number to letter (65 -> 'A')
    markerCounter++;  // Increment for the next label

    // Create the label element
    const labelElement = document.createElement('div');
    labelElement.className = 'marker-label'; // Add a class for styling
    labelElement.textContent = label; // Set the label text

    // Create a new Mapbox marker to place the label
    const marker = new mapboxgl.Marker({ element: labelElement })
        .setLngLat([lng, lat]) // Position the marker on the map
        .addTo(map);

    // Store the marker in the markers array so it can be removed later
    markers.push(marker);

    // Store label position with label text in the array
    markerPositions.push({ label, lat, lng });

    // Draw a dashed line between consecutive labels
    if (markerPositions.length > 1) {
        const lastPosition = markerPositions[markerPositions.length - 2];
        drawDashedLine(lastPosition, { label, lat, lng });
    }

    // Update distance display
    updateDistanceDisplay();
}

function drawDashedLine(start, end) {
    const line = new mapboxgl.LngLatBounds(
        [start.lng, start.lat],
        [end.lng, end.lat]
    );

    // Draw a dashed line between the two labels
    map.addLayer({
        id: `line-${start.label}-${end.label}`,
        type: 'line',
        source: {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [start.lng, start.lat],
                        [end.lng, end.lat],
                    ],
                },
            },
        },
        paint: {
            'line-color': '#ff0000',
            'line-width': 2,
            'line-dasharray': [4, 4], // Dashed line
        },
    });
}

function updateDistanceDisplay() {
    const distanceDiv = document.getElementById("distance-display");
    let distancesHTML = "<strong>Measurements are approximate.</strong><br>"; // Add the note here

    // Calculate distances between all labels
    for (let i = 0; i < markerPositions.length - 1; i++) {
        const start = markerPositions[i];
        const end = markerPositions[i + 1];
        const distance = calculateDistance(start.lat, start.lng, end.lat, end.lng);
        distancesHTML += `${start.label} → ${end.label}: ${distance} feet<br>`;
    }

    // Display the distances in the div
    distanceDiv.innerHTML = distancesHTML;
    distanceDiv.style.display = "block"; // Ensure visibility
}

// Helper function to calculate the distance (in feet) between two lat/lng points
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3963; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 5280; // Convert miles to feet
    return distance.toFixed(2); // Round to 2 decimal places
}

// Calculate total distance of all segments
function calculateTotalDistance() {
    let totalDistance = 0;

    for (let i = 0; i < markerPositions.length - 1; i++) {
        const start = markerPositions[i];
        const end = markerPositions[i + 1];
        totalDistance += parseFloat(calculateDistance(start.lat, start.lng, end.lat, end.lng));
    }

    return totalDistance.toFixed(2); // Round to 2 decimal places
}

// ============================================================================
// MAIN MEASUREMENT FUNCTION (event listener)
// ============================================================================

const distanceButton = document.getElementById('distanceButton');
const clearButton = document.getElementById('clearButton');

distanceButton.addEventListener('click', () => {
    if (distanceButtonClicked) {
        // If the button is clicked again, stop adding markers and change the cursor back
        map.off('click', addLabel); // Remove the click event listener
        map.getCanvas().style.cursor = ''; // Reset cursor to default
        distanceButtonClicked = false;
        distanceButton.classList.remove('active'); // Deactivate button

        // Calculate total distance and display at the bottom in bold
        const totalDistance = calculateTotalDistance();
        const distanceDiv = document.getElementById("distance-display");
        distanceDiv.innerHTML += `<br><strong>Total Distance: ${totalDistance} feet</strong>`;

        return; // Stop further execution
    }

    distanceButtonClicked = true; // Mark the button as clicked
    distanceButton.classList.add('active'); // Activate button

    // Change the cursor to crosshairs when the user can click to add labels
    map.getCanvas().style.cursor = 'crosshair';

    // Enable map clicks to add labels
    map.on('click', addLabel);
});

clearButton.addEventListener('click', () => {
    // Clear the markerPositions array
    markerPositions = [];
    markerCounter = 65; // Reset marker labeling to 'A'

    // Remove all markers from the map
    markers.forEach(marker => {
        marker.remove(); // Remove each marker from the map
    });

    // Clear the markers array
    markers = [];

    // Remove all dashed lines from the map
    const allLines = map.getStyle().layers.filter(layer => layer.id.startsWith('line-'));
    allLines.forEach(line => {
        map.removeLayer(line.id);
        map.removeSource(line.id);
    });

    // Hide the distance display
    const distanceDiv = document.getElementById('distance-display');
    distanceDiv.style.display = 'none';

    // Reset the distance button flag to allow reactivating it in the future
    distanceButtonClicked = false;
    distanceButton.classList.remove('active'); // Deactivate button

    // Reset the cursor to default after clearing the labels
    map.getCanvas().style.cursor = '';

    // Disable the map click event after clearing
    map.off('click', addLabel);
});