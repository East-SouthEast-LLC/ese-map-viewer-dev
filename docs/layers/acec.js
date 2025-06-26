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

    map.on('click', 'acec', function (e) {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("Area of Critical Environmental Concern: " + '<strong>' + e.features[0].properties.NAME + '</strong><br>' + "DEP ACEC Designation: " + '<a href=\"' + e.features[0].properties.LINK + '\" target="_blank"><b><u>Link to Document</u></b></a>')
            .addTo(map);
    });

    map.on('mouseenter', 'acec', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'acec', function () {
        map.getCanvas().style.cursor = '';
    });
}

addAcecLayer();