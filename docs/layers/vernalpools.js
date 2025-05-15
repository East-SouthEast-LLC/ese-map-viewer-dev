map.on('load', function() {
map.addSource('vernal pools', {
type: 'vector',
url: 'mapbox://ese-toh.7p4glkq9'
});
map.addLayer({
'id': 'vernal pools',
'type': 'circle',
'source': 'vernal pools',
'source-layer': 'nhesp-cvp-5xj2xr',
'layout': {
// make layer invisible by default
'visibility': 'none'
},
'paint': {
'circle-color': '#0D71F9',
'circle-radius': {
'base': 1.5,
'stops': [
[12, 3],
[22, 180]
]
}
}
});
});
      map.on('click', 'vernal pools', function (e) {  
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("Vernal Pool ID: "+'<strong>'+e.features[0].properties.cvp_num + '</strong><br>' )
            .addTo(map);
     //(e.features[0].properties.PID + " - " + e.features[0].properties.LINK)  <strong>97 Tilipi Run</strong><p>Parcel ID:14A3-2-B<p>
    });

    // Change the cursor to a pointer when the mouse is over the states layer.
    map.on('mouseenter', 'vernal pools', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'vernal pools', function () {
        map.getCanvas().style.cursor = '';
    });
//});