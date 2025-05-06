map.on('load', function() {
map.addSource('priority habitat', {
type: 'vector',
url: 'mapbox://ese-toh.256zd2fn'
});
map.addLayer({
'id': 'priority habitat',
'type': 'fill',
'source': 'priority habitat',
'source-layer': 'nhesp-prihab-bajnd6',
'layout': {
// make layer invisible by default
'visibility': 'none'
},
'paint': {
'fill-color': '#1DB708',
'fill-opacity': 0.3
}
});
});
        map.on('click', 'priority habitat', function (e) {     
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("Priority Habitat ID: "+'<strong>'+e.features[0].properties.PRIHAB_ID + '</strong><br>' )
            .addTo(map);
     //(e.features[0].properties.PID + " - " + e.features[0].properties.LINK)  <strong>97 Tilipi Run</strong><p>Parcel ID:14A3-2-B<p>
    });

    // Change the cursor to a pointer when the mouse is over the states layer.
    map.on('mouseenter', 'priority habitat', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'priority habitat', function () {
        map.getCanvas().style.cursor = '';
    });
//});