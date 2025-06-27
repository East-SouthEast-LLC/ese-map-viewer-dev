// control-button.js

// The marker and markerCoordinates variables are now defined in main-app.js,
// so they are removed from this file to avoid conflicts.

function setPinPosition(lat, lng) {
    markerCoordinates.lat = lat;
    markerCoordinates.lng = lng;
    console.log("Pin position updated:", markerCoordinates);
}

function dropPinAtCenter() {
    if (marker) {
        let { lng, lat } = marker.getLngLat();
        markerCoordinates.lng = lng;
        markerCoordinates.lat = lat;
        map.flyTo({ center: markerCoordinates, essential: true });
    } else {
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
    this.classList.add('active');
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
    document.getElementById('pointButton').classList.remove('active');
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
    document.getElementById('pointButton').classList.remove('active');
    markerCoordinates.lat = null;
    markerCoordinates.lng = null;
    console.log("Marker removed.");
});

function listVisibleLayers(map, layerIds) {
  if (!Array.isArray(layerIds)) {
    console.error("layerIds must be an array.");
    return [];
  }
  const visibleLayers = [];
  layerIds.forEach(layerId => {
    if (map.getLayer(layerId)) {
      const visibility = map.getLayoutProperty(layerId, 'visibility');
      if (visibility === 'visible') {
        visibleLayers.push(layerId);
      }
    } else {
      console.warn(`Layer "${layerId}" not found in the current map style.`);
    }
  });
  return visibleLayers;
}

// Tooltip functionality remains the same
document.addEventListener('DOMContentLoaded', () => {
    const tooltipElement = document.createElement('div');
    tooltipElement.id = 'custom-tooltip';
    document.body.appendChild(tooltipElement);
    const elementsWithTooltip = document.querySelectorAll('[data-tooltip]');
    elementsWithTooltip.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltipText = element.getAttribute('data-tooltip');
            tooltipElement.textContent = tooltipText;
            tooltipElement.style.opacity = '1';
        });
        element.addEventListener('mouseleave', () => {
            tooltipElement.style.opacity = '0';
        });
        element.addEventListener('mousemove', (e) => {
            tooltipElement.style.left = e.pageX + 'px';
            tooltipElement.style.top = (e.pageY + 20) + 'px';
        });
    });
});