function addAcecLayer() {
    map.addSource('acec', {
        type: 'vector',
        url: 'mapbox://ese-toh.2wnv388a'
    });
    map.addLayer({
        'id': 'acec',
        'type': 'fill',
        'source': 'acec',
        'source-layer': 'ACEC-2023-02-26-4wucwh',
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'fill-color': '#CD06D8',
            'fill-opacity': 0.4
        }
    });
    
    map.on('mouseenter', 'acec', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'acec', function () {
        map.getCanvas().style.cursor = '';
    });
}

addAcecLayer();