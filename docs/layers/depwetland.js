map.on('load', function() {
	// add source and layer for DEP wetland
	map.addSource('DEP wetland', {
		type: 'vector',
		url: 'mapbox://ese-toh.75g1xaec'
	});

	map.addLayer({
		'id': 'DEP wetland',
		'type': 'fill',
		'source': 'DEP wetland',
		'source-layer': 'BARNSTABLEwetlandsDEP_POLY-arr54b',
		'layout': {
			'visibility': 'none'
		},
		'paint': {
			'fill-opacity': [
				'match',
				['get', 'IT_VALC'],
				'BA', 0.5,
				'BB', 0.4,
				'BB-BE', 0.4,
				'BB-D', 0.4,
				'BB-M', 0.4,
				'BB-OW', 0.4,
				'BB-SM', 0.6,
				'BB-SS', 0.6,
				'BB-WS1', 0.6,
				'BB-WS2', 0.6,
				'BE', 0.4,
				'BG', 0.5,
				'CB', 0.5,
				'D', 0.4,
				'DM', 0.5,
				'M', 0.4,
				'OW', 0.4,
				'RS', 0.4,
				'SM', 0.4,
				'SS', 0.4,
				'TF', 0.5,
				'WS1', 0.5,
				'WS2', 0.6,
				'WS3', 0.6,
				/* other */ 0.001
			],
			'fill-color': [
				'match',
				['get', 'IT_VALC'],
				'BA', '#F7F124',
				'BB', '#DCD609',
				'BB-BE', '#D0D041',
				'BB-D', '#99F108',
				'BB-M', '#24AF0B',
				'BB-OW', '#1BB5CA',
				'BB-SM', '#24AF0B',
				'BB-SS', '#32D34F',
				'BB-WS1', '#1F9A35',
				'BB-WS2', '#056828',
				'BE', '#D7E00F',
				'BG', '#0C9955',
				'CB', '#BB0418',
				'D', '#99F108',
				'DM', '#056A56',
				'M', '#26A04E',
				'OW', '#2B8ACB',
				'RS', '#B5C0C8',
				'SM', '#389C3F',
				'SS', '#24CF31',
				'TF', '#F3F4CC',
				'WS1', '#1F9A35',
				'WS2', '#056828',
				'WS3', '#448842',
				/* other */ '#5c580f'
			],
		},
	});

	// add layer for DEP wetland labels
	map.addLayer({
		'id': 'dep-wetland-labels', // Ensure this is unique
		'type': 'symbol',
		'source': 'DEP wetland', // Check if this matches your source name
		'source-layer': 'BARNSTABLEwetlandsDEP_POLY-arr54b', // Check if this matches your source layer
		'layout': {
			'text-field': [
				'case',
				['==', ['get', 'IT_VALC'], 'BA'], 'BA',
				['==', ['get', 'IT_VALC'], 'BB'], 'BB',
				['==', ['get', 'IT_VALC'], 'BB-BE'], 'BB-BE',
				['==', ['get', 'IT_VALC'], 'BB-D'], 'BB-D',
				['==', ['get', 'IT_VALC'], 'BB-M'], 'BB-M',
				['==', ['get', 'IT_VALC'], 'BB-OW'], 'BB-OW',
				['==', ['get', 'IT_VALC'], 'BB-SM'], 'BB-SM',
				['==', ['get', 'IT_VALC'], 'BB-SS'], 'BB-SS',
				['==', ['get', 'IT_VALC'], 'BB-WS1'], 'BB-WS1',
				['==', ['get', 'IT_VALC'], 'BB-WS2'], 'BB-WS2',
				['==', ['get', 'IT_VALC'], 'BE'], 'BE',
				['==', ['get', 'IT_VALC'], 'BG'], 'BG',
				['==', ['get', 'IT_VALC'], 'CB'], 'CB',
				['==', ['get', 'IT_VALC'], 'D'], 'D',
				['==', ['get', 'IT_VALC'], 'DM'], 'DM',
				['==', ['get', 'IT_VALC'], 'M'], 'M',
				['==', ['get', 'IT_VALC'], 'OW'], 'OW',
				['==', ['get', 'IT_VALC'], 'RS'], 'RS',
				['==', ['get', 'IT_VALC'], 'SM'], 'SM',
				['==', ['get', 'IT_VALC'], 'SS'], 'SS',
				['==', ['get', 'IT_VALC'], 'TF'], 'TF',
				['==', ['get', 'IT_VALC'], 'WS1'], 'WS1',
				['==', ['get', 'IT_VALC'], 'WS2'], 'WS2',
				['==', ['get', 'IT_VALC'], 'WS3'], 'WS3',
				'Unknown' // Default to "Unknown" instead of empty string
			],
			'visibility': 'none', // Ensure this is intentional
			'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], // Bold font for better visibility
			'text-size': [
				'interpolate',
				['linear'],
				['zoom'],
				10, 12,
				16, 16
			],
			'symbol-placement': 'point',
			'symbol-spacing': 80,
			'text-rotation-alignment': 'map'
		},
		'paint': {
			'text-color': '#202020',
			'text-opacity': 0.8,
			'text-halo-color': '#ffffff',
			'text-halo-width': 1,
			'text-halo-blur': 0.4
		}
	});

	// add source and layer for DEP wetland line
	map.addSource('dep-wetland-line', {
		type: 'vector',
		url: 'mapbox://ese-toh.2zhgmmx7'
	});

	map.addLayer({
		'id': 'dep-wetland-line',
		'type': 'line',
		'source': 'dep-wetland-line',
		'source-layer': 'BARNSTABLEwetlandsDEP_ARC-1hjeg7',
		'layout': {
			// make layer invisible by default
			'visibility': 'none',
			'line-join': 'round',
			'line-cap': 'round'
		},
		'paint': {
			'line-color': [
				'match',
				['get', 'ARC_CODE'],
				'0', //EDGE OF OCEAN
				'#08ADEF',
				'1', //SHORELINE
				'#EBF90A',
				'2', //CLOSURE
				'#EBECDD',
				'3', //APPARENT WETLAND LIMIT
				'#F2A5EF',
				'7', //HYDRO CONNECTION
				'#0B11F0',
				'8', //MLW
				'#5E87ED',
				'88', //EDGE INTERUPTED
				'#5EE1ED',
				/* other */ '#ff0000'
			],
			'line-width': {
				'base': 2.0,
				'stops': [
					[12, 2],
					[22, 5]
				]
			}
		}
	});
});

map.on('click', 'DEP wetland', function(e) {
	new mapboxgl.Popup()
		.setLngLat(e.lngLat)
		.setHTML("Wetland Identifier: " + '<strong>' + e.features[0].properties.IT_VALDESC + '</strong><br>' +
				"Wetland Code: " + '<strong>' + e.features[0].properties.IT_VALC + '</strong><br>')
		.addTo(map);
});

// Change the cursor to a pointer when the mouse is over the states layer.
map.on('mouseenter', 'DEP wetland', function() {
	map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'DEP wetland', function() {
	map.getCanvas().style.cursor = '';
});
