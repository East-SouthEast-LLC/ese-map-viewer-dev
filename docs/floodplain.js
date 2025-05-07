map.addSource('floodplain', {
    type: 'vector',
    url: 'mapbox://ese-toh.a7lml4y4'
});

map.addLayer({
    'id': 'floodplain',
    'type': 'fill',
    'source': 'floodplain',
    'source-layer': '25001c-2014-c2ck89',
    'layout': {
        'visibility': 'none'
    },
    'paint': {
        'fill-opacity': [
            'match',
            ['get', 'ZONE_SUBTY'],
            '0.2 PCT ANNUAL CHANCE FLOOD HAZARD', 0.4,
            'AREA OF MINIMAL FLOOD HAZARD', 0.001,
            '1 PCT ANNUAL CHANCE FLOOD HAZARD', 0.3,
            'FLOODWAY', 0.3,
            'COASTAL FLOODWAY', 0.3,
            /* other */ 0.2
        ],
        'fill-color': [
            'match',
            ['get', 'FLD_ZONE'],
            'AE', '#eb8c34',
            'VE', '#eb3a34',
            'AO', '#F7FE20',
            'X', '#2578F9',
            'A', '#2e4bf0',
            'AH', '#1fc1a9',
            '0.2 PCT ANNUAL CHANCE FLOOD HAZARD', '#f5a3d1',
            '1 PCT ANNUAL CHANCE FLOOD HAZARD', '#ae65fa',
            'FLOODWAY', '#4a148c',
            'COASTAL FLOODWAY', '#880e4f',
            /* other */ '#ff0000'
        ]
    }
});

map.on('click', 'floodplain', function (e) {
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(
            "Flood Zone: <strong>" + e.features[0].properties.FLD_ZONE + "</strong><br>" +
            "Zone Subtype: <strong>" + e.features[0].properties.ZONE_SUBTY + "</strong><br>" +
            "Elevation: <strong>" + e.features[0].properties.STATIC_BFE + "</strong><br><br>" +
            "<span style='color:red;'>The thick red line is the LiMWA.</span>"
        )
        .addTo(map);
});

map.on('mouseenter', 'floodplain', function () {
    map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'floodplain', function () {
    map.getCanvas().style.cursor = '';
});
