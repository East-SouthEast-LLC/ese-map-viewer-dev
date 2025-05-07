console.log("floodplain.js loaded");

map.on('load', function () {
	console.log("Map loaded — adding floodplain source and layers");

	// LiMWA Source + Layer
	map.addSource('LiMWA', {
		type: 'vector',
		url: 'mapbox://ese-toh.7h5nwda9'
	});
	map.addLayer({
		'id': 'LiMWA',
		'type': 'line',
		'source': 'LiMWA',
		'source-layer': 'LiMWA-dtmi75',
		'layout': { 'visibility': 'none' },
		'paint': {
			'line-color': '#E70B0B',
			'line-width': 3.0
		}
	});

  const floodBtn = document.getElementById('floodplain-btn');
  if (floodBtn) {
    floodBtn.addEventListener('click', function (e) {
      e.preventDefault();

      const current = map.getLayoutProperty('floodplain', 'visibility');
      const newVis = current === 'visible' ? 'none' : 'visible';

      map.setLayoutProperty('floodplain', newVis);
      if (map.getLayer('floodplain-line')) {
        map.setLayoutProperty('floodplain-line', newVis);
      }
      if (map.getLayer('LiMWA')) {
        map.setLayoutProperty('LiMWA', newVis);
      }

	  this.classList.toggle('active', newVis === 'visible');
	});
  }

	map.addSource('floodplain', {
		type: 'vector',
		url: 'mapbox://ese-toh.a7lml4y4'
	});
	console.log("Floodplain source added");

	map.addLayer({
		'id': 'floodplain',
		'type': 'fill',
		'source': 'floodplain',
		'source-layer': '25001c-2014-c2ck89',
		'layout': { 'visibility': 'none' },
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
				/* fallback */ '#ffffff'
			]
		}
	});
	console.log("Floodplain fill layer added");

	map.addLayer({
		'id': 'floodplain-line',
		'type': 'line',
		'source': 'floodplain',
		'source-layer': '25001c-2014-c2ck89',
		'layout': { 'visibility': 'none' },
		'paint': {
			'line-color': '#1460F3',
			'line-width': 1
		}
	});
	console.log("Floodplain line layer added");

	map.on('click', 'floodplain', function (e) {
		console.log("Floodplain clicked:", e.features[0].properties);
		new mapboxgl.Popup()
			.setLngLat(e.lngLat)
			.setHTML(
				"Flood Zone: <strong>" + e.features[0].properties.FLD_ZONE + "</strong><br>" +
				"Zone Subtype: <strong>" + e.features[0].properties.ZONE_SUBTY + "</strong><br>" +
				"Elevation: <strong>" + e.features[0].properties.STATIC_BFE + "</strong><br><br>" +
				"<span style='color:red;'>The thick red line is the LiMWA.</span>"
			)
			.addTo(map);
	});

	map.on('mouseenter', 'floodplain', function () {
		map.getCanvas().style.cursor = 'pointer';
	});
	map.on('mouseleave', 'floodplain', function () {
		map.getCanvas().style.cursor = '';
	});

	console.log("Floodplain event handlers attached");
});