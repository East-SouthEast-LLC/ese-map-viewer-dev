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
	},
});
//});
map.on('click', 'floodplain', function (e) {
//	   		map.movelayer('satellite','floodplain'),
	new mapboxgl.Popup()
		.setLngLat(e.lngLat)
		.setHTML("Flood Zone: "+'<strong>'+e.features[0].properties.FLD_ZONE + '</strong><br>' +
"Elevation:"+'<strong>'+e.features[0].properties.STATIC_BFE + '</strong><br>' + '<br>' + "The thick red line is the LiMWA.")
		.addTo(map);
 //(e.features[0].properties.PID + " - " + e.features[0].properties.LINK)  <strong>97 Tilipi Run</strong><p>Parcel ID:14A3-2-B<p>
});

// Change the cursor to a pointer when the mouse is over the states layer.
map.on('mouseenter', 'floodplain', function () {
	map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'floodplain', function () {
	map.getCanvas().style.cursor = '';
});