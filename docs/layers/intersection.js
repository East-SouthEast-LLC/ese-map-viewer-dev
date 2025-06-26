function addIntersectionLayer() {
    map.addSource('intersection', {
        type: 'vector',
        url: 'mapbox://ese-toh.9c4wu0zd'
    });
    map.addLayer({
        'id': 'intersection',
        'type': 'fill',
        'source': 'intersection',
        'source-layer': 'Intersections-2d91o8',
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'fill-opacity': 0.5,
            'fill-color': '#14B9F7',
            'fill-outline-color': '#257618'
        }
    });

    map.on('click', 'intersection', function (e) {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("Insection: " + '<strong>' + e.features[0].properties.Int_Name + '</strong><br>' + "Webpage: " + '<a href=\"' + e.features[0].properties.Link + '\" target="_blank"><b><u>Link to Page</u></b></a>')
            .addTo(map);
    });

    map.on('mouseenter', 'intersection', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'intersection', function () {
        map.getCanvas().style.cursor = '';
    });
}

addIntersectionLayer();