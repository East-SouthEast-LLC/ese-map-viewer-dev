function addSatelliteLayer() {
    map.addSource('satellite', {
        type: 'raster',
        url: 'mapbox://mapbox.satellite'
    });
    
    map.addLayer({
        'id': 'satellite',
        'type': 'raster',
        'source': 'satellite',
        'layout': {
            'visibility': 'none'
        },
        'source-layer': 'satellite'
    });
}

addSatelliteLayer();