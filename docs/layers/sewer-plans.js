// JS script file for sewer plans layer
map.on('load', function() {
    // add source for sewer plans
    map.addSource('sewer plans', {
        type: 'vector',
        url: 'mapbox://ese-toh.6t88pujd'
    });

    // add layer for sewer plans
    map.addLayer({
        'id': 'sewer plans',
        'type': 'fill',
        'source': 'sewer plans',
        'source-layer': 'TOC_SEWER_2025-06-10a-7xxql4',
        'layout': {
            // make layer invisible by default
            'visibility': 'none'
        },
        'paint': {
            'fill-opacity': 0.4,

            // map sewer colors based on year of plan
            'fill-color': [
                'case',
                ['all', ['>=', ['to-number', ['get', 'DATE']], 2016], ['<=', ['to-number', ['get', 'DATE']], 2019]], '#66bb6a', // 2016-2019
                ['all', ['>=', ['to-number', ['get', 'DATE']], 2014], ['<', ['to-number', ['get', 'DATE']], 2016]], '#4caf50', // 2014-2015
                ['all', ['>=', ['to-number', ['get', 'DATE']], 2011], ['<', ['to-number', ['get', 'DATE']], 2014]], '#388e3c', // 2011-2013
                ['all', ['>=', ['to-number', ['get', 'DATE']], 2008], ['<', ['to-number', ['get', 'DATE']], 2011]], '#2e7d32', // 2008-2010
                ['all', ['>=', ['to-number', ['get', 'DATE']], 2007], ['<', ['to-number', ['get', 'DATE']], 2008]], '#1b5e20', // 2007
                ['all', ['>=', ['to-number', ['get', 'DATE']], 2000], ['<', ['to-number', ['get', 'DATE']], 2007]], '#104c1a', // 2000-2006
                ['all', ['>=', ['to-number', ['get', 'DATE']], 1983], ['<', ['to-number', ['get', 'DATE']], 2000]], '#0a3810', // 1983-1999
                ['all', ['>=', ['to-number', ['get', 'DATE']], 1969], ['<', ['to-number', ['get', 'DATE']], 1983]], '#052a08', // 1969-1982
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
        .setHTML(() => {
            const props = e.features && e.features.length > 0 && e.features[0].properties ? e.features[0].properties : null;
            if (props && props.CONSERV) {
                return "Conservation Property<br>Disclaimer: Work in progress, information may be inaccurate.";
            }
            if (props) {
                let html = "Year of plan: <strong>" + (props.DATE || 'N/A') + "</strong><br>" +
                           "Plan ID: <strong>" + (props.SHEET || 'N/A') + "</strong><br>";
                if (props.ADDED) {
                    html += "On sewer but not included in original plans<br>";
                    html += "Website: " + (props.URL ? '<a href="' + props.URL + '" target="_blank"><b><u>Link to page</u></b></a>' : 'N/A') + "<br>";
                } else {
                    html += "Link to plan: " + (props.URL ? '<a href="' + props.URL + '" target="_blank"><b><u>Link to plan</u></b></a>' : 'N/A') + "<br>";
                }
                html += "Disclaimer: Work in progress, information may be inaccurate.";
                return html;
            }
            return "No feature information available.";
        })
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