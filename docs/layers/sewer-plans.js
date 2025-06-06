// JS script file for sewer plans layer
map.on('load', function() {
    // add source for sewer plans
    map.addSource('sewer plans', {
        type: 'vector',
        url: 'mapbox://ese-toh.4nsau3uc'
    });

    // add layer for sewer plans
    map.addLayer({
        'id': 'sewer plans',
        'type': 'fill',
        'source': 'sewer plans',
        'source-layer': 'TOC_SEWER_2025-06-06a-0qfkax',
        'layout': {
            // make layer invisible by default
            'visibility': 'none'
        },
        'paint': {
            'fill-color': '#ff7f0e', // Orange color for visibility
            'fill-opacity': 0.4
        }
    });
});

// add popup for sewer plan info
map.on('click', 'sewer plans', function(e) {
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(e.features && e.features.length > 0 && e.features[0].properties ? 
                 "Date: " + '<strong>' + (e.features[0].properties.DATE || 'N/A') + '</strong><br>' + 
                 "Plan ID: " + '<strong>' + (e.features[0].properties.SHEET || 'N/A') + '</strong><br>' + 
                 "Link to plan: " + (e.features[0].properties.URL ? '<a href=\"'+ e.features[0].properties.URL +'" target="_blank"><b><u>Link to plan</u></b></a>' : 'N/A')
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