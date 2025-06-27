// control-button.js

let placingPoint = false; 

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
        marker = new mapboxgl.Marker().setLngLat(map.getCenter()).addTo(map);
        markerCoordinates.lng = map.getCenter().lng;
        markerCoordinates.lat = map.getCenter().lat;
    }
    return markerCoordinates;
}

document.getElementById('pointButton').addEventListener('click', function () {
    placingPoint = true;
    this.classList.add('active');
    map.getCanvas().style.cursor = 'crosshair';
});

// The old map.on('click') handler has been removed from this file.

document.getElementById('pointCButton').addEventListener('click', () => dropPinAtCenter());

document.getElementById('pointOffButton').addEventListener('click', () => {
    if (marker) {
        marker.remove();
        marker = null;
    }
    document.getElementById('pointButton').classList.remove('active');
    markerCoordinates.lat = null;
    markerCoordinates.lng = null;
});

function listVisibleLayers(map, layerIds) {
    if (!Array.isArray(layerIds)) return [];
    return layerIds.filter(id => map.getLayer(id) && map.getLayoutProperty(id, 'visibility') === 'visible');
}

document.addEventListener('DOMContentLoaded', () => {
    // ... (tooltip code is unchanged)
});