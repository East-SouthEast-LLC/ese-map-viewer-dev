map.on('load', function() {
map.addSource('estimated habitat', {
type: 'vector',
url: 'mapbox://ese-toh.5x0ao54p'
});
map.addLayer({
'id': 'estimated habitat',
'type': 'fill',
'source': 'estimated habitat',
'source-layer': 'nhesp-esthab-c8ow5w',
'layout': {
// make layer invisible by default
'visibility': 'none'
},
'paint': {
'fill-color': '#A28F06',
'fill-opacity': 0.3
}
});
});

        map.on('click', 'estimated habitat', function (e) {   
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("Estimated Habitat ID: "+'<strong>'+e.features[0].properties.ESTHAB_ID + '</strong><br>' )
            .addTo(map);
     //(e.features[0].properties.PID + " - " + e.features[0].properties.LINK)  <strong>97 Tilipi Run</strong><p>Parcel ID:14A3-2-B<p>
    });

    // Change the cursor to a pointer when the mouse is over the states layer.
    map.on('mouseenter', 'estimated habitat', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'estimated habitat', function () {
        map.getCanvas().style.cursor = '';
    });
//});