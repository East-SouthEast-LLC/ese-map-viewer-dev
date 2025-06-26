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

    map.on('click', 'historic', function (e) {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("Historic District: " + e.features[0].properties.District + '<br>' + "Status / Reference: " + '<strong>' + e.features[0].properties.Status + '</strong><br>' +
                "Documentation: " + '<a href=\"' + e.features[0].properties.URL + '\" target="_blank"><b><u>Link to Document</u></b></a>')
            .addTo(map);
    });

    map.on('mouseenter', 'historic', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'historic', function () {
        map.getCanvas().style.cursor = '';
    });
}

addHistoricLayer();