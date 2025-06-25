function addConservancyDistrictsLayer() {
    map.addSource('conservancy districts', {
        type: 'vector',
        url: 'mapbox://ese-toh.7jk998tu'
    });
    map.addLayer({
        'id': 'conservancy districts',
        'type': 'fill',
        'source': 'conservancy districts',
        'source-layer': 'CONS_DIST-2updta',
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'fill-opacity': 0.4,
            'fill-color': [
                'match',
                ['get', 'CONS_TYPE'],
                'BOG', '#239607',
                'DITCH', '#072483',
                'MARSH', '#4FD33F',
                'SWAMP', '#21A546',
                'WATER', '#18A7AA',
                /* other */ '#ff0000'
            ],
            'fill-outline-color': '#257618'
        }
    });

    map.on('click', 'conservancy districts', function (e) {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("Conservancy District: " + '<strong>' + e.features[0].properties.CONS_DIST + '</strong><br>' +
                '<br>' +
                e.features[0].properties.CONS_DIST + " Elevation: " + '<strong>' + e.features[0].properties.CONS_ELEV + " " + e.features[0].properties.CONS_DATUM + '</strong><br>' +
                e.features[0].properties.CONS_DIST + " Water Elevation: " + '<strong>' + e.features[0].properties.WATER_ELEV + " " + e.features[0].properties.CONS_DATUM + '</strong><br>' +
                '<br>' +
                "Conservancy District Contour: " + '<strong>' + e.features[0].properties.CONT_NAVD + " " + e.features[0].properties.CONV_DATUM + '</strong><br>' + '<br>' +
                "Description: " + e.features[0].properties.CONS_DESC)
            .addTo(map);
    });

    map.on('mouseenter', 'conservancy districts', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'conservancy districts', function () {
        map.getCanvas().style.cursor = '';
    });
}

addConservancyDistrictsLayer();