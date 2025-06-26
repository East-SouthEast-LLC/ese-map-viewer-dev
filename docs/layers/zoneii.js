function addZoneIILayer() {
    map.addSource('zone II', {
        type: 'vector',
        url: 'mapbox://ese-toh.9xot04xz'
    });

    map.addLayer({
        'id': 'zone II',
        'type': 'fill',
        'source': 'zone II',
        'source-layer': 'zoneII-01dowh',
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'fill-color': '#2758d6',
            'fill-opacity': 0.4
        }
    });

    map.addLayer({
        'id': 'zone-ii-outline',
        'type': 'line',
        'source': 'zone II',
        'source-layer': 'zoneII-01dowh',
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'line-color': '#1a3e8c',
            'line-width': 3,
            'line-opacity': 1
        }
    });

    map.addLayer({
        'id': 'zone-ii-labels',
        'type': 'symbol',
        'source': 'zone II',
        'source-layer': 'zoneII-01dowh',
        'layout': {
            'text-field': ['format', 'Zone II: ', {}, ['get', 'ZII_NUM'], {}],
            'text-size': 14,
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'symbol-placement': 'point',
            'text-anchor': 'center',
            'visibility': 'none',
            'symbol-spacing': 30,
        },
        'paint': {
            'text-color': '#000000',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2
        }
    });

    map.on('click', 'zone II', function(e) {
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("Zone II number: " + '<strong>' + e.features[0].properties.ZII_NUM + '</strong><br>' + 
                     "Water Supplier: " + '<strong>' + e.features[0].properties.SUPPLIER + '</strong><br>' + 
                     "Town: " + '<strong>' + e.features[0].properties.TOWN + '</strong><br>')
            .addTo(map);
    });

    map.on('mouseenter', 'zone II', function() {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'zone II', function() {
        map.getCanvas().style.cursor = '';
    });
}

addZoneIILayer();