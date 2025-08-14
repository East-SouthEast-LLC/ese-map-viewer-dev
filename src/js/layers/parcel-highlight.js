function addParcelHighlightLayer() {
    map.addSource('parcel highlight', {
        type: 'vector',
        url: 'mapbox://ese-toh.1ya31624'
    });
    map.addLayer({
        'id': 'parcel highlight',
        'type': 'line',
        'source': 'parcel highlight',
        'source-layer': 'CapeTowns-2icvsh',
        'layout': {
            'visibility': 'none',
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#a0fa39',
            'line-width': 1.5
        }
    });
}

addParcelHighlightLayer();