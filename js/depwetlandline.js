map.on('load', function() {
map.addSource('DEP wetland line', {
type: 'vector',
url: 'mapbox://ese-toh.2zhgmmx7'
});
map.addLayer({
'id': 'DEP wetland line',
'type': 'line',
'source': 'DEP wetland line',
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
},
}
});
});
        map.on('click', 'DEP wetland line', function (e) {
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("Wetland Identifier: "+'<strong>'+e.features[0].properties.ARC_CODE_D + '</strong><br>')
            .addTo(map);
     //(e.features[0].properties.PID + " - " + e.features[0].properties.LINK)  <strong>97 Tilipi Run</strong><p>Parcel ID:14A3-2-B<p>
    });

    // Change the cursor to a pointer when the mouse is over the states layer.
    map.on('mouseenter', 'DEP wetland line', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'DEP wetland line', function () {
        map.getCanvas().style.cursor = '';
    });
//});
