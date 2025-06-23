let placingPoint = false;
let marker = null;
const markerCoordinates = { lat: null, lng: null };

function setPinPosition(lat, lng) {
    markerCoordinates.lat = lat;
    markerCoordinates.lng = lng;
    console.log("Pin position updated:", markerCoordinates);
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

// List Visible Layers - the major Label IDs
function listVisibleLayers(map, layerIds) {
  if (!Array.isArray(layerIds)) {
    console.error("layerIds must be an array.");
    return [];
  }

  const visibleLayers = [];
  layerIds.forEach(layerId => {
    // Check if the layer exists in the map style
    if (map.getLayer(layerId)) {
      const visibility = map.getLayoutProperty(layerId, 'visibility');
      if (visibility === 'visible') {
        visibleLayers.push(layerId);  // Add visible layers to the array
      }
    } else {
      console.warn(`Layer "${layerId}" not found in the current map style.`);
    }
  });
  return visibleLayers;
}


// ============================================================================
// TOOLTIP FUNCTIONALITY
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Create a single tooltip element and add it to the page body.
    const tooltipElement = document.createElement('div');
    tooltipElement.id = 'custom-tooltip';
    document.body.appendChild(tooltipElement);

    // Select all elements that have a 'data-tooltip' attribute.
    const elementsWithTooltip = document.querySelectorAll('[data-tooltip]');

    elementsWithTooltip.forEach(element => {
        // Show the tooltip on mouse enter
        element.addEventListener('mouseenter', (e) => {
            const tooltipText = element.getAttribute('data-tooltip');
            tooltipElement.textContent = tooltipText;
            tooltipElement.style.opacity = '1';
        });

        // Hide the tooltip on mouse leave
        element.addEventListener('mouseleave', () => {
            tooltipElement.style.opacity = '0';
        });

        // Move the tooltip with the mouse
        element.addEventListener('mousemove', (e) => {
            // Position the tooltip slightly below and centered with the cursor.
            tooltipElement.style.left = e.pageX + 'px';
            tooltipElement.style.top = (e.pageY + 20) + 'px'; // 20px below cursor
        });
    });
});