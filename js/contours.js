map.on('load', function() {
// add source and layer for contours
map.addSource('contours', {
type: 'vector',
url: 'mapbox://mapbox.mapbox-terrain-v2'
});
map.addLayer({
'id': 'contours',
'type': 'line',
'source': 'contours',
'source-layer': 'contour',
'layout': {
// make layer invisible by default
'visibility': 'none',
'line-join': 'round',
'line-cap': 'round'
},
'paint': {
'line-color': '#26b24f',
'line-width': 2
}
});
});
//
//
