// JS file for satellite layer
map.on('load', function() {
    // add source and layer for raster
    map.addSource('satellite', {
        type: 'raster',
        url: 'mapbox://mapbox.satellite'
    });
    
    map.addLayer({
        'id': 'satellite',
        'type': 'raster',
        'source': 'satellite',
        'layout': {
            // make layer visible by default
            'visibility': 'none'
        },
        'source-layer': 'satellite'
    });
});