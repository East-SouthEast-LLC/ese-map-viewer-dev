console.log("floodplain.js loaded");

map.on('load', function () {
  console.log("Map loaded – adding floodplain source and layers");

  // LiMWA Source + Layer
  map.addSource('LiMWA', {
    type: 'vector',
    url: 'mapbox://ese-toh.7h5nwda9'
  });
  map.addLayer({
    'id': 'LiMWA',
    'type': 'line',
    'source': 'LiMWA',
    'source-layer': 'LiMWA-dtmi75',
    'layout': { 'visibility': 'none' },
    'paint': {
      'line-color': '#E70B0B',
      'line-width': 3.0
    }
  });

  // Floodplain Source
  map.addSource('floodplain', {
    type: 'vector',
    url: 'mapbox://ese-toh.d2xro55p'
  });
  console.log("Floodplain source added");

  // Floodplain Fill
  map.addLayer({
    'id': 'floodplain',
    'type': 'fill',
    'source': 'floodplain',
    'source-layer': 'floodplain-6h4jbn',
    'layout': { 'visibility': 'none' },
    'paint': {
      'fill-color': '#1460F3',
      'fill-opacity': 0.25
    }
  });
  console.log("Floodplain fill layer added");

  // Floodplain Outline
  map.addLayer({
    'id': 'floodplain-line',
    'type': 'line',
    'source': 'floodplain',
    'source-layer': 'floodplain-6h4jbn',
    'layout': { 'visibility': 'none' },
    'paint': {
      'line-color': '#1460F3',
      'line-width': 1
    }
  });
  console.log("Floodplain line layer added");

  // Click Popup
  map.on('click', 'floodplain', function (e) {
    console.log("Floodplain clicked", e.features[0].properties);
    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        "Flood Zone: <strong>" + e.features[0].properties.FLD_ZONE + "</strong><br>" +
        "Zone Subtype: <strong>" + e.features[0].properties.ZONE_SUBTY + "</strong><br>" +
        "Elevation: <strong>" + e.features[0].properties.STATIC_BFE + "</strong><br><br>" +
        "<span style='color:red;'>The thick red line is the LiMWA.</span>"
      )
      .addTo(map);
  });
  console.log("Floodplain click handler attached");

  // Cursor on Hover
  map.on('mouseenter', 'floodplain', function () {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'floodplain', function () {
    map.getCanvas().style.cursor = '';
  });
  console.log("Floodplain hover handlers attached");
});
