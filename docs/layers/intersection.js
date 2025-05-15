map.on('load', function() {
map.addSource('intersection', {
type: 'vector',
url: 'mapbox://ese-toh.9c4wu0zd'
});
map.addLayer({
'id': 'intersection',
'type': 'fill',
'source': 'intersection',
'source-layer': 'Intersections-2d91o8',
'layout': {
// make layer invisible by default
'visibility': 'none'
},
'paint': {
'fill-opacity': 0.5,
'fill-color': '#14B9F7',
'fill-outline-color': '#257618'
}
});
});
        map.on('click', 'intersection', function (e) {
             new mapboxgl.Popup()
            .setLngLat(e.lngLat)
	    .setHTML("Insection: "+'<strong>' + e.features[0].properties.Int_Name + '</strong><br>' + "Webpage: "+'<a href=\"'+ e.features[0].properties.Link +'" target="_blank"><b><u>Link to Page</u></b></a>')
            .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the states layer.
    map.on('mouseenter', 'intersection', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'intersection', function () {
        map.getCanvas().style.cursor = '';
    });
//});
