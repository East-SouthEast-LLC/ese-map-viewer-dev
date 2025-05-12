// JS file for zone II map
map.on('load', function() {
    // add source for zone II
    map.addSource('zone II', {
        type: 'vector',
        url: 'mapbox://ese-toh.9xot04xz'
    });

    // add layer for zone II
    map.addLayer({
        'id': 'zone II',
        'type': 'fill',
        'source': 'zone II',
        'source-layer': 'zoneII-01dowh',
        'layout': {
            // make layer invisible by default
            'visibility': 'none'
        },
        'paint': {
            'fill-color': '#2758d6',
            'fill-opacity': 0.4
        }
    });

    // add layer for zone II outline
    map.addLayer({
        'id': 'zone-ii-outline',
        'type': 'line',
        'source': 'zone II',
        'source-layer': 'zoneII-01dowh',
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'line-color': '#1a3e8c', // Darker blue for contrast
            'line-width': 3, // Adjust this to make it thicker
            'line-opacity': 1
        }
    });

    // add layer for zone II labels
    map.addLayer({
        'id': 'zone-ii-labels',
        'type': 'symbol',
        'source': 'zone II',
        'source-layer': 'zoneII-01dowh',
        'layout': {
            'text-field': ['format', 'Zone II: ', {}, ['get', 'ZII_NUM'], {}], // Prefix "Zone II: " before the number
            'text-size': 10, // Smaller font size for the labels
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'symbol-placement': 'point', // Position the label as a point
            'text-anchor': 'center', // Centered text
            'visibility': 'none', // Default to hidden
            'symbol-spacing': 30, // Reduced spacing for more frequent labels
        },
        'paint': {
            'text-color': '#000000', // Black text color
            'text-halo-color': '#ffffff', // White halo around text
            'text-halo-width': 2 // Make the halo wider for readability
        }
    });
});

map.on('click', 'zone II', function(e) {
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML("Zone II number: " + '<strong>' + e.features[0].properties.ZII_NUM + '</strong><br>' + 
                 "Water Supplier: " + '<strong>' + e.features[0].properties.SUPPLIER + '</strong><br>' + 
                 "Town: " + '<strong>' + e.features[0].properties.TOWN + '</strong><br>')
        .addTo(map);
});

// Change the cursor to a pointer when the mouse is over the states layer.
map.on('mouseenter', 'zone II', function() {
    map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'zone II', function() {
    map.getCanvas().style.cursor = '';
});
