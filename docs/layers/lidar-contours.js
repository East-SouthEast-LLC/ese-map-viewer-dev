function addLidarContoursLayer() {
    map.addSource('lidar contours', {
        type: 'vector',
        url: 'mapbox://ese-toh.djcjlqsr'
    });

    map.addLayer({
        id: 'lidar contours',
        type: 'line',
        source: 'lidar contours',
        'source-layer': 'CONT-ELBOW-9gwgnx',
        layout: {
            visibility: 'none',
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': [
                'match',
                ['get', 'Elevation'],
                '-2',
                '#08ADEF',
                /* other */ '#07C327'
            ],
            'line-width': 0.5
        }
    });

    map.addLayer({
        id: 'lidar-contour-labels',
        type: 'symbol',
        source: 'lidar contours',
        'source-layer': 'CONT-ELBOW-9gwgnx',
        layout: {
            'symbol-placement': 'line',
            'symbol-spacing': 100,
            'text-field': ['concat', ['to-string', ['get', 'Elevation']]],
            'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
            'text-size': 10,
            visibility: 'none',
        },
        paint: {
            'text-color': '#07C327',
            'text-halo-color': '#ffffff',
            'text-halo-width': 1,
        }
    });
}

addLidarContoursLayer();