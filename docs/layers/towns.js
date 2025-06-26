function addTownsLayer() {
    map.addSource('towns', {
        type: 'vector',
        url: 'mapbox://ese-toh.9kac7735'
    });
    map.addLayer({
        'id': 'towns',
        'type': 'line',
        'source': 'towns',
        'source-layer': 'TOWNS-d0onvn',
        'layout': {
            'visibility': 'visible'
        },
        'paint': {
            'line-color': '#08f8fc',
            'line-width': 1
        },
    });
}

addTownsLayer();