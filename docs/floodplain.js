map.on('load', function() {
	map.addSource('LiMWA', {
		type: 'vector',
		url: 'mapbox://ese-toh.7h5nwda9'
	});
	map.addLayer({
		'id': 'LiMWA',
		'type': 'line',
		'source': 'LiMWA',
		'source-layer': 'LiMWA-dtmi75',
		'layout': {
			'visibility': 'none'
//			'line-join': 'round',
//			'line-cap': 'round'
		},
		'paint': {
			'line-color': '#E70B0B',
			'line-width': 3.0
		},
});
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
			],
		// Add boundary (stroke) properties here
//        'stroke-width': 2, // Adjust stroke width as needed
//        'stroke-color': '#000000', // Set stroke (boundary) color to black
//        'stroke-opacity': 1 // Set stroke opacity to 1 (fully visible)
        },
});

// Stroke (boundary) layer for floodplain
map.addLayer({
    'id': 'floodplain-boundary',
    'type': 'line',
    'source': 'floodplain',
    'source-layer': '25001c-2014-c2ck89',
    'layout': {
        'visibility': 'none'
    },
    'paint': {
        'line-width': 0.5, // Set stroke width
        'line-color': '#000000', // Set stroke color (black in this case)
        'line-opacity': 0.5 // Set stroke opacity (fully visible)
    }
});

// floodplain labels
map.addLayer({
    'id': 'floodplain-labels',
    'type': 'symbol',
    'source': 'floodplain',
    'source-layer': '25001c-2014-c2ck89',
    'layout': {
        'text-field': [
            'case',
            ['==', ['get', 'FLD_ZONE'], 'AE'],
            ['concat', 'AE ', ['get', 'STATIC_BFE']],
            ['==', ['get', 'FLD_ZONE'], 'VE'],
            ['concat', 'VE ', ['get', 'STATIC_BFE']],
            ['==', ['get', 'FLD_ZONE'], 'X'],
            'X',
            ['==', ['get', 'FLD_ZONE'], 'A'],
            'A',
            '' // Default to no label if no match
        ],
        'visibility': 'none',
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], // Bold font for better visibility
        'text-size': [
            'interpolate', 
            ['linear'], 
            ['zoom'],
            10, 12, 
            16, 16
        ], // Slightly larger text at higher zooms
        'symbol-placement': 'point', // Treat each symbol as a point
        'symbol-spacing': 80, // Closer labels for more density
        'text-rotation-alignment': 'map', // Rotate with the map
    },
    'paint': {
        'text-color': [
            'match',
            ['get', 'FLD_ZONE'],
            'AE', '#202020',
            'VE', '#202020',
            'X', '#202020',
            'A', '#202020',
            /* other */ '#aa0000'
        ],
        'text-opacity': 0.6, // Make labels more visible but not overwhelming
        'text-halo-color': '#ffffff', // Add a subtle halo
        'text-halo-width': 1, // Increase halo width for better visibility
        'text-halo-blur': 0.4 // Slightly larger blur for smoother edges
    }
});

// floodplain
});
map.on('click', 'floodplain', function (e) {
	new mapboxgl.Popup()
		.setLngLat(e.lngLat)
		.setHTML("Flood Zone: "+'<strong>'+e.features[0].properties.FLD_ZONE + '</strong><br>' +
"Elevation:"+'<strong>'+e.features[0].properties.STATIC_BFE + '</strong><br>' + '<br>' + "The thick red line is the LiMWA.")
		.addTo(map);
	//(e.features[0].properties.PID + " - " + e.features[0].properties.LINK)  <strong>97 Tilipi Run</strong><p>Parcel ID:14A3-2-B<p>
});
map.on('mouseenter', 'floodplain', function () {
	map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'floodplain', function () {
	map.getCanvas().style.cursor = '';
});