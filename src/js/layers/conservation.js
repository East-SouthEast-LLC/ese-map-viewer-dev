function addConservationLayer() {
    map.addSource('conservation', {
        type: 'vector',
        url: 'mapbox://ese-toh.cu9m7vny'
    });
    map.addLayer({
        'id': 'conservation',
        'type': 'fill',
        'source': 'conservation',
        'source-layer': 'ccf-2021-02-25-6ghyhf',
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'fill-opacity': 0.4,
            'fill-color': [
                'match',
                ['get', 'Last_Updat'],
                'CCF_Owned_Parcels_JBedits',
                '#abe356',
                /* other */ '#22c410'
            ],
        },
    });

    map.on('mouseenter', 'conservation', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'conservation', function () {
        map.getCanvas().style.cursor = '';
    });
}

addConservationLayer();