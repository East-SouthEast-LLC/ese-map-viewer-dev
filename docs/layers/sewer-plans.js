// JS script file for sewer plans layer
map.on('load', function() {
    // add source for sewer plans
    map.addSource('sewer plans', {
        type: 'vector',
        url: 'mapbox://ese-toh.bb22eiot'
    });

    // add layer for sewer plans
    map.addLayer({
        'id': 'sewer plans',
        'type': 'fill',
        'source': 'sewer plans',
        'source-layer': 'TOC_SEWER_2025-06-09a-a4y5hl',
        'layout': {
            // make layer invisible by default
            'visibility': 'none'
        },
        'paint': {
            'fill-opacity': 0.4,

            // map sewer colors based on year of plan
            'fill-color': [
                'match',
                ['get', 'DATE'],
                2019, '#66bb6a', // a medium green
                2017, '#4caf50',
                2013, '#388e3c',
                2010, '#2e7d32',
                2007, '#1b5e20',
                2006, '#104c1a', 
                1996, '#0a3810',
                1982, '#052a08',
                1969, '#001a00', // darkest green
				/* fallback */ '#ff0000'
			]
		}
    });

    // add layer for outline
    map.addLayer({
        'id': 'sewer-plans-outline',
        'type': 'line',
        'source': 'sewer plans',
        'source-layer': 'TOC_SEWER_2025-06-09a-a4y5hl',
        'layout': { 'visibility': 'none' },
        'paint': {
            'line-width': 0.5, 
            'line-color': '#000000', 
            'line-opacity': 0.5 
        }
	});
});

// add popup for sewer plan info
map.on('click', 'sewer plans', function(e) {
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(e.features && e.features.length > 0 && e.features[0].properties ? 
                 "Year of plan: " + '<strong>' + (e.features[0].properties.DATE || 'N/A') + '</strong><br>' + 
                 "Plan ID: " + '<strong>' + (e.features[0].properties.SHEET || 'N/A') + '</strong><br>' + 
                 "Link to plan: " + (e.features[0].properties.URL ? '<a href=\"'+ e.features[0].properties.URL +'" target="_blank"><b><u>Link to plan</u></b></a>' : 'N/A') + '<br>' +
                 "Disclaimer: This is a work in progress, some information may be inaccurate."
                 : "No feature information available.")
        .addTo(map);
});

// Change the cursor to a pointer when the mouse is over the layer
map.on('mouseenter', 'sewer plans', function() {
    map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'sewer plans', function() {
    map.getCanvas().style.cursor = '';
});