map.on('load', function() {
map.addSource('zone II', {
type: 'vector',
url: 'mapbox://ese-toh.9xot04xz'
});
map.addLayer({
'id': 'zone II',
'type': 'fill',
'source': 'zone II',
'source-layer': 'zoneII-01dowh',
'layout': {
// make layer invisible by default
'visibility': 'none'
},
'paint': {
'fill-color': '#2758d6',
'fill-opacity': 0.4
}
});
});


        map.on('click', 'zone II', function (e) {
             new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML("Zone II number: "+'<strong>'+e.features[0].properties.ZII_NUM + '</strong><br>' + "Water Supplier: "+'<strong>'+e.features[0].properties.SUPPLIER + '</strong><br>' + "Town: "+'<strong>'+e.features[0].properties.TOWN + '</strong><br>')
            .addTo(map);
     //(e.features[0].properties.PID + " - " + e.features[0].properties.LINK)  <strong>97 Tilipi Run</strong><p>Parcel ID:14A3-2-B<p>
    });

    // Change the cursor to a pointer when the mouse is over the states layer.
    map.on('mouseenter', 'zone II', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'zone II', function () {
        map.getCanvas().style.cursor = '';
    });
//});
 