// JS script file for sewer plans layer
map.on('load', function() {
    // add source for sewer plans
    map.addSource('sewer plans', {
        type: 'vector',
        url: 'mapbox://ese-toh.9xot04xz'
    });

    // add layer for sewer plans
    map.addLayer({
        'id': 'sewer plans',
        'type': 'fill',
        'source': 'sewer plans',
        'source-layer': 'zoneII-01dowh',
        'layout': {
            // make layer invisible by default
            'visibility': 'none'
        },
        'paint': {
            'fill-color': '#ff7f0e', // Orange color for visibility
            'fill-opacity': 0.4
        }
    });
});

// Change the cursor to a pointer when the mouse is over the layer
map.on('mouseenter', 'sewer plans', function() {
    map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'sewer plans', function() {
    map.getCanvas().style.cursor = '';
});