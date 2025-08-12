function addHistoricLayer() {
    map.addSource('historic', {
        type: 'vector',
        url: 'mapbox://ese-toh.90pe1azb'
    });
    map.addLayer({
        'id': 'historic',
        'type': 'fill',
        'source': 'historic',
        'source-layer': 'TOC_Historic-d4lyva',
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'fill-color': [
                'match',
                ['get', 'Status'],
                'Proposed', '#F2BD67',
                '1024-0018', '#D75F48',
                /* other */ '#5c580f'
            ],
            'fill-opacity': 0.4
        }
    });

    // the following hover effects are used if the layer has a corresponding popup when clicked
    map.on('mouseenter', 'historic', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'historic', function () {
        map.getCanvas().style.cursor = '';
    });
}

// add the layer to the map
addHistoricLayer();