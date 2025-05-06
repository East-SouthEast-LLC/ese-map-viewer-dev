map.on('load', function() {
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
	'BA',
	0.5,
	'BB',
	0.4,
	'BB-BE',
	0.4,
	'BB-D',
	0.4,
	'BB-M',
	0.4,
	'BB-OW',
	0.4,
	'BB-SM',
	0.6,
	'BB-SS',
	0.6,
	'BB-WS1',
	0.6,
	'BB-WS2',
	0.6,
	'BE',
	0.4,
	'BG',
	0.5,
	'CB',
	0.5,
	'D',
	0.4,
	'DM',
	0.5,
	'M',
	0.4,
	'OW',
	0.4,
	'RS',
	0.4,
	'SM',
	0.4,
	'SS',
	0.4,
	'TF',
	0.5,
	'WS1',
	0.5,
	'WS2',
	0.6,
	'WS3',
	0.6,
	/* other */ 0.001
	],
'fill-color': [
	'match',
	['get', 'IT_VALC'],
	'BA',
	'#F7F124',
	'BB',
	'#DCD609',
	'BB-BE',
	'#D0D041',
	'BB-D',
	'#99F108',
	'BB-M',
	'#24AF0B',
	'BB-OW',
	'#1BB5CA',
	'BB-SM',
	'#24AF0B',
	'BB-SS',
	'#32D34F',
	'BB-WS1',
	'#1F9A35',
	'BB-WS2',
	'#056828',
	'BE',
	'#D7E00F',
	'BG',
	'#0C9955',
	'CB',
	'#BB0418',
	'D',
	'#99F108',
	'DM',
	'#056A56',
	'M',
	'#26A04E',
	'OW',
	'#2B8ACB',
	'RS',
	'#B5C0C8',
	'SM',
	'#389C3F',
	'SS',
	'#24CF31',
	'TF',
	'#F3F4CC',
	'WS1',
	'#1F9A35',
	'WS2',
	'#056828',
	'WS3',
	'#448842',
	/* other */ '#5c580f'
	],
        },
});
});
        map.on('click', 'DEP wetland', function (e) {
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("Wetland Identifier: "+'<strong>'+e.features[0].properties.IT_VALDESC + '</strong><br>' +
"Wetland Code: "+'<strong>'+e.features[0].properties.IT_VALC + '</strong><br>' )
            .addTo(map);
     //(e.features[0].properties.PID + " - " + e.features[0].properties.LINK)  <strong>97 Tilipi Run</strong><p>Parcel ID:14A3-2-B<p>
    });

    // Change the cursor to a pointer when the mouse is over the states layer.
    map.on('mouseenter', 'DEP wetland', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'DEP wetland', function () {
        map.getCanvas().style.cursor = '';
    });
//});