function addEndangeredSpeciesLayer() {
    // == ENDANGERED SPECIES SOURCE AND LAYER ===================================
    map.addSource('endangered species', {
        type: 'vector',
        url: 'mapbox://ese-toh.8m58l8et'
    });

    map.addLayer({
        'id': 'endangered species',
        'type': 'fill',
        'source': 'endangered species',
        'source-layer': 'estimated_habitat-7mod86',
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'fill-color': [
                'case',
                ['==', ['get', 'EST_PRI'], 'ESTandPRI'], '#e7ee1f',  // Yellow for ESTandPRI
                ['==', ['get', 'EST_PRI'], 'PRI_ONLY'], '#1DB708',   // Green for PRIonly
                ['==', ['get', 'EST_PRI'], 'EST_ONLY'], '#A28F06',   // Yellow for ESTonly
                '#FFFFFF'
            ],
            'fill-opacity': 0.4
        }
    });
    
    // == ENDANGERED SPECIES LABELS =========================================
    map.addLayer({
        'id': 'endangered-species-labels',
        'type': 'symbol',
        'source': 'endangered species',
        'source-layer': 'estimated_habitat-7mod86', 
        'layout': {
            'text-field': [
                'case',
                ['all', ['has', 'ESTHAB_ID'], ['has', 'PRIHAB_ID']],
                ['concat', ['get', 'ESTHAB_ID'], '\n', ['get', 'PRIHAB_ID']],
                ['coalesce', ['get', 'ESTHAB_ID'], ['get', 'PRIHAB_ID']]
            ],
            'visibility': 'none',
            'text-size': 14,
            'symbol-placement': 'point',
            'symbol-spacing': 80,
            'text-rotation-alignment': 'map',
        },
        'paint': {
            'text-color': '#000000',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
        },
        'filter': [
            'any',
            ['has', 'ESTHAB_ID'], 
            ['has', 'PRIHAB_ID']
        ]
    });

    // == VERNAL POOLS SOURCE AND LAYER =======================================
    map.addSource('vernal-pools', {
        type: 'vector',
        url: 'mapbox://ese-toh.7p4glkq9'
    });
    
    map.addLayer({
        'id': 'vernal-pools',
        'type': 'circle',
        'source': 'vernal-pools',
        'source-layer': 'nhesp-cvp-5xj2xr',
        'layout': {
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
    
    // == VERNAL POOLS LABELS =============================================
    map.addLayer({
        'id': 'vernal-pools-labels',
        'type': 'symbol',
        'source': 'vernal-pools',
        'source-layer': 'nhesp-cvp-5xj2xr',
        'layout': {
            'text-field': ['concat', 'VP: ', ['get', 'cvp_num']],
            'visibility': 'none',
            'text-size': 14,
            'text-anchor': 'left',
            'text-offset': [1, 0],
            'symbol-placement': 'point'
        },
        'paint': {
            'text-color': '#000000',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2
        },
        'filter': ['!=', ['get', 'cvp_num'], null]
    });

    // == ON CLICK AND MOUSE EVENTS FOR ENDANGERED SPECIES =====================
    map.on('click', 'endangered species', function(e) {   
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(
                "Estimated Habitat ID: " + '<strong>' + e.features[0].properties.ESTHAB_ID + '</strong><br>' +
                "Priority Habitat ID: " + '<strong>' + e.features[0].properties.PRIHAB_ID + '</strong><br>'
            )
            .addTo(map);
    });

    map.on('mouseenter', 'endangered species', function() {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'endangered species', function() {
        map.getCanvas().style.cursor = '';
    });

    map.on('click', 'vernal-pools', function(e) {  
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(
                "Vernal Pool ID: " + '<strong>' + e.features[0].properties.cvp_num + '</strong><br>' +
                "Certified: " + '<strong>' + e.features[0].properties.certified + '</strong><br>' +
                "Criteria: " + '<strong>' + e.features[0].properties.criteria + '</strong><br>'
            )
            .addTo(map);
    });

    map.on('mouseenter', 'vernal-pools', function() {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'vernal-pools', function() {
        map.getCanvas().style.cursor = '';
    });
}

addEndangeredSpeciesLayer();