function setLayersFromURL(map) {
  // Parse layers param
  const params = new URLSearchParams(window.location.search);
  const layerString = params.get('layers');
  if (!layerString) return;

  const layers = layerString.split(',').map(decodeURIComponent);

  layers.forEach(layerId => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', 'visible');
    }
  });
}

// Call this once all your layers have loaded:
map.on('idle', function() {
  setLayersFromURL(map);
});