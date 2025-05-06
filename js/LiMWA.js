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

