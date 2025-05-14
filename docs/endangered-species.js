// JS file for endangered species overlay and vernal pools
map.on('load', function() {
    map.addSource('endangered species', {
        type: 'vector',
        url: 'mapbox://ese-toh.8m58l8et'
    });

    // add layer for endangered species
    map.addLayer({
        'id': 'endangered species',
        'type': 'fill',
        'source': 'endangered species',
        'source-layer': 'estimated_habitat-7mod86',
        'layout': {
            // make layer invisible by default
            'visibility': 'none'
        },
        'paint': {
            'fill-color': [
                'case',
                ['==', ['get', 'EST_PRI'], 'ESTandPRI'], '#e7ee1f',  // Yellow for ESTandPRI
                ['==', ['get', 'EST_PRI'], 'PRI_ONLY'], '#1DB708',   // Green for PRIonly
                ['==', ['get', 'EST_PRI'], 'EST_ONLY'], '#A28F06',   // Yellow for ESTonly - There is not much
                '#FFFFFF'  // Default color (in case of no match)
            ],
            'fill-opacity': 0.3
        }
    });


// map.addLayer({
//     'id': 'endangered species-labels',
//     'type': 'symbol',
//     'source': 'endangered species',
//     'source-layer': 'estimated_habitat-7mod86', 
//     'layout': {
//         'text-field': [
//             'case',
//             ['all', ['has', 'ESTHAB_ID'], ['has', 'PRIHAB_ID']], // If both exist
//             ['concat', ['get', 'ESTHAB_ID'], '\n', ['get', 'PRIHAB_ID']], // Add line break
//             ['coalesce', ['get', 'ESTHAB_ID'], ['get', 'PRIHAB_ID']] // Otherwise, show whichever exists
//         ],
//         'visibility': 'none',
//         'text-size': 14, // Adjusting font size for readability
//         'symbol-placement': 'point', // Treat each symbol as a point
//         'symbol-spacing': 80, // Closer labels for more density
//         'text-rotation-alignment': 'map', // Rotate with the map
//     },
//     'paint': {
//         'text-color': '#000000', // Text color
//         'text-halo-color': '#ffffff', // White halo for text
//         'text-halo-width': 2, // Make halo wider to improve readability
//     },
//     'filter': [
//         'any',
//         ['has', 'ESTHAB_ID'], 
//         ['has', 'PRIHAB_ID']
//     ] // Show labels if either ID exists
// });
});

map.on('click', 'endangered species', function (e) {   
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(
            "Estimated Habitat ID: " + '<strong>' + e.features[0].properties.ESTHAB_ID + '</strong><br>' +
            "Priority Habitat ID: " + '<strong>' + e.features[0].properties.PRIHAB_ID + '</strong><br>'
        )
        .addTo(map);
});
map.on('mouseenter', 'endangered species', function () {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'endangered species', function () {
    map.getCanvas().style.cursor = '';
});


// map.on('load', function() {
// map.addSource('vernal pools', {
// type: 'vector',
// url: 'mapbox://ese-toh.7p4glkq9'
// });
// map.addLayer({
// 'id': 'vernal pools',
// 'type': 'circle',
// 'source': 'vernal pools',
// 'source-layer': 'nhesp-cvp-5xj2xr',
// 'layout': {
// // make layer invisible by default
// 'visibility': 'none'
// },
// 'paint': {
// 'circle-color': '#0D71F9',
// 'circle-radius': {
// 'base': 1.5,
// 'stops': [
// [12, 3],
// [22, 180]
// ]
// }
// }
// });
// map.addLayer({
//     'id': 'vernal pools-labels',
//     'type': 'symbol',
//     'source': 'vernal pools',
//     'source-layer': 'nhesp-cvp-5xj2xr',
//     'layout': {
//         'text-field': ['concat', 'VP: ', ['get', 'cvp_num']], // Prefix VP: before number
//         'visibility': 'none',
//         'text-size': 14,
//         'text-anchor': 'left', // Anchors text to the left of the label point
//         'text-offset': [1, 0], // Moves label to the right of the circle
//         'symbol-placement': 'point'
//     },
//     'paint': {
//         'text-color': '#000000',
//         'text-halo-color': '#ffffff',
//         'text-halo-width': 2
//     },
//     'filter': ['!=', ['get', 'cvp_num'], null] // Exclude null values
// });


// });
//       map.on('click', 'vernal pools', function (e) {  
//           new mapboxgl.Popup()
//             .setLngLat(e.lngLat)
//             .setHTML("Vernal Pool ID: "+'<strong>'+e.features[0].properties.cvp_num + '</strong><br>'+"Certified: "+'<strong>'+e.features[0].properties.certified + '</strong><br>'+"Criteria: "+'<strong>'+e.features[0].properties.criteria + '</strong><br>' )
//             .addTo(map);
//      //(e.features[0].properties.PID + " - " + e.features[0].properties.LINK)  <strong>97 Tilipi Run</strong><p>Parcel ID:14A3-2-B<p>
//     });
//     map.on('mouseenter', 'vernal pools', function () {
//         map.getCanvas().style.cursor = 'pointer';
//     });
//     map.on('mouseleave', 'vernal pools', function () {
//         map.getCanvas().style.cursor = '';
//     });