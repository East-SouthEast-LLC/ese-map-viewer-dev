// JS file for satellite layer

// create a mapbox map
mapboxgl.accessToken = 'pk.eyJ1IjoiZXNlLXRvaCIsImEiOiJja2Vhb24xNTEwMDgxMzFrYjVlaTVjOXkxIn0.IsPo5lOndNUc3lDLuBa1ZA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ese-toh/ckh2ss32s06i119paer9mt67h',
    center: [-70.36, 41.660],
    zoom: 12
});

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