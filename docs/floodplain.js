// Add the floodplain source to the map
map.addSource('floodplain', {
    type: 'vector',
    url: 'mapbox://ese-toh.a7lml4y4'
});

// Add the floodplain layer with styling
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
            /* other */ 0.4
        ],
        'fill-color': [
            'match',
            ['get', 'FLD_ZONE'],
            'AE', '#eb8c34',
            'VE', '#eb3a34',
            'AO', '#F7FE20',
            'X', '#2578F9',
            'A', '#2e4bf0',
            /* other */ '#ff0000'
        ]
    }
});

// When the floodplain layer is clicked, show a popup with info
map.on('click', 'floodplain', function (e) {
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML("Flood Zone: " + '<strong>' + e.features[0].properties.FLD_ZONE + '</strong><br>' +
                 "Elevation: " + '<strong>' + e.features[0].properties.STATIC_BFE + '</strong><br><br>' +
                 "The thick red line is the LiMWA.")
        .addTo(map);
});

// Change the cursor to a pointer when hovering
map.on('mouseenter', 'floodplain', function () {
    map.getCanvas().style.cursor = 'pointer';
});

// Revert the cursor when leaving
map.on('mouseleave', 'floodplain', function () {
    map.getCanvas().style.cursor = '';
});
