map.on('load', function () {
    map.addSource('contours', {
        type: 'vector',
        url: 'mapbox://ese-toh.djcjlqsr'
    });

    map.addLayer({
        id: 'contours',
        type: 'line',
        source: 'contours',
        'source-layer': 'CONT-ELBOW-9gwgnx',
        layout: {
            // make layer invisible by default
            visibility: 'none',
            'line-join': 'round',
            'line-cap': 'round'
            // 'symbol-placement': 'line',
            // 'text-field': ['concat', ['to-string', ['get', 'Elevation']], 'ft']
        },
        paint: {
            'line-color': [
                'match',
                ['get', 'Elevation'],
                '-2', //
                '#08ADEF',
                /* other */ '#07C327'
            ],
            'line-width': 0.5
        }
    });

    // Add the contour labels layer
    map.addLayer({
        id: 'contour-labels',
        type: 'symbol',
        source: 'contours', // Ensure this source exists
        'source-layer': 'CONT-ELBOW-9gwgnx', // Ensure this layer exists in the source
        layout: {
            'symbol-placement': 'line', // Align labels along the line
            'symbol-spacing': 100, // Add more labels by reducing spacing (default is 250)
            'text-field': ['concat', ['to-string', ['get', 'Elevation']]],
            'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'], // Font
            'text-size': 10, // Text size
            visibility: 'none', // Initially invisible
        },
        paint: {
            'text-color': '#07C327', // Label color
            'text-halo-color': '#ffffff', // Halo for readability
            'text-halo-width': 1,
        }
    });
});
