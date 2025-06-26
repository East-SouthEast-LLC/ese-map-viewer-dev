// docs/layers/zoning.js

function addZoningLayer() {
    map.addSource('zoning', {
        type: 'vector',
        url: 'mapbox://ese-toh.axftqzuv'
    });
    map.addLayer({
        'id': 'zoning',
        'type': 'fill',
        'source': 'zoning',
        'source-layer': 'Zoning-3yb43g',
        'layout': {
            // make layer invisible by default
            'visibility': 'none'
        },
        'paint': {
            'fill-opacity': 0.4,
            'fill-color': [
                'match',
                ['get', 'TOWNCODE'],
                //nps
                'RC3', '#f1f748',
                'F', '#f1f748',
                'NSP', '#f1f748',
                'S', '#f1f748',
                'SC', '#f1f748',
                'SS', '#f1f748',
                //municipal
                'M', '#60cccc',
                'M/C', '#4ed130',
                //residential
                'R20', '#72a5ed',
                'R20A', '#5877bf',
                'R25', '#877613',
                'R30', '#3d4eeb',
                'R40', '#2c97d1',
                'R40A', '#4836cf',
                'R60', '#842cd1',
                'R80', '#877613',
                //industrial
                'I', '#5f6069',
                //business
                'GB1', '#ab5c46',
                'GB2', '#c24a29',
                'GB3', '#a32807',
                'SB', '#d97b09',
                //to be sorted
                'A', '#bdad55',
                'B', '#bdad55',
                'B1', '#bdad55',
                'B2', '#21A546',
                'B3', '#bdad55',
                'B4', '#bdad55',
                'BL-1', '#bdad55',
                'BL-2', '#bdad55',
                'C', '#bdad55',
                'C1', '#bdad55',
                'C2', '#bdad55',
                'C3', '#bdad55',
                'CD', '#bdad55',
                'CH', '#21A546',
                'CH1', '#bdad55',
                'CH2', '#bdad55',
                'CV', '#bdad55',
                'D', '#bdad55',
                'E', '#bdad55',
                'EB', '#bdad55',
                'FLEX', '#bdad55',
                'G', '#bdad55',
                'GB', '#bdad55',
                'GC', '#bdad55',
                'GC I', '#bdad55',
                'GC II', '#bdad55',
                'GC III', '#bdad55',
                'GD', '#bdad55',
                'H', '#bdad55',
                'HB', '#bdad55',
                'HD', '#bdad55',
                'HG', '#bdad55',
                'HO', '#bdad55',
                'HVB', '#bdad55',
                'I1', '#bdad55',
                'IL', '#bdad55',
                'IN', '#bdad55',
                'IND', '#bdad55',
                'IND L', '#bdad55',
                'LB', '#bdad55',
                'LI', '#bdad55',
                'MAR', '#bdad55',
                'MB', '#bdad55',
                'MB-A1', '#bdad55',
                'MB-A2', '#bdad55',
                'MB-B', '#bdad55',
                'MRD', '#bdad55',
                'MRL', '#bdad55',
                'MRL1', '#bdad55',
                'MS', '#bdad55',
                'MU', '#bdad55',
                'NZ', '#bdad55',
                'OM', '#bdad55',
                'R', '#bdad55',
                'R1', '#bdad55',
                'R-1', '#bdad55',
                'R2', '#bdad55',
                'R-2', '#bdad55',
                'R3', '#bdad55',
                'R5', '#bdad55',
                'R87', '#bdad55',
                'RA', '#bdad55',
                'RAH', '#bdad55',
                'RB', '#bdad55',
                'RC', '#bdad55',
                'RC-1', '#bdad55',
                'RC-2', '#bdad55',
                'RD', '#bdad55',
                'RD-1', '#bdad55',
                'Res1', '#bdad55',
                'Res2', '#bdad55',
                'Res3', '#bdad55',
                'ResB', '#bdad55',
                'RF', '#bdad55',
                'RF-1', '#bdad55',
                'RF-2', '#bdad55',
                'RG', '#bdad55',
                'RH1', '#bdad55',
                'RH2', '#bdad55',
                'RH3', '#bdad55',
                'RL', '#bdad55',
                'RM', '#bdad55',
                'RR', '#bdad55',
                'RS40', '#bdad55',
                'S&D', '#bdad55',
                'SD-1', '#bdad55',
                'SDD', '#bdad55',
                'SF', '#bdad55',
                'TCC', '#bdad55',
                'TD', '#bdad55',
                'UB', '#bdad55',
                'VB', '#bdad55',
                'VB-A', '#bdad55',
                'VB-B', '#bdad55',
                'VC', '#bdad55',
                /* other */ '#ff0000'
            ],
            'fill-outline-color': '#257618'
        }
    });

    map.on('click', 'zoning', function (e) {
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML("Zoning District: " + '<strong>'+e.features[0].properties.TOWNCODE + '</strong><br>' +
'<br>' + "Check with the Town Clerk or Planning Department." + '<br>' + '<strong>' + "This layer is from 2004" + '</strong>')
        .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the states layer.
    map.on('mouseenter', 'zoning', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'zoning', function () {
        map.getCanvas().style.cursor = '';
    });
}

// Call the function to add the layer to the map
addZoningLayer();