map.on('load', function() {
map.addSource('stories', {
type: 'vector',
url: 'mapbox://ese-toh.1ma2t07c'
});
map.addLayer({
'id': 'stories',
'type': 'fill',
'source': 'stories',
'source-layer': '55-2018-1wy2zb',
'layout': {
// make layer invisible by default
'visibility': 'none'
},
'paint': {
'fill-opacity': 0.4,
'fill-color': [
	'match',
	['get', 'STORIESS'],
	'0',
	'#e2ffcc',
	'1',
	'#fffbb3',
	'1.1',
	'#b3ffec',
	'1.2',
	'#a5f0dd',
	'1.3',
	'#94e0cd',
	'1.4',
	'#94ebd5',
	'1.5',
	'#8cf2ff',
	'1.6',
	'#7fe8f5',
	'1.7',
	'#72e0ed',
	'1.8',
	'#63cfdb',
	'1.9',
	'#5ac5d1',
	'2',
	'#5e90f2',
	'2.3',
	'#4c7bd9',
	'2.5',
	'#3b64b8',
	'2.8',
	'#2b53a6',
	'3',
	'#3841e8',
	/* other */ '#ffffff'
	],
'fill-outline-color': '#257618'
}
});
});
        map.on('click', 'stories', function (e) {
             new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("Number of Stories: "+'<strong>'+e.features[0].properties.STORIES + '</strong><br>' + "Building Description: "+'<strong>'+e.features[0].properties.BLD_DESC + '</strong><br>' + "Zoning: "+'<strong>'+e.features[0].properties.ZONING + '</strong><br>')
            .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the states layer.
    map.on('mouseenter', 'stories', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'stories', function () {
        map.getCanvas().style.cursor = '';
    });
//});
