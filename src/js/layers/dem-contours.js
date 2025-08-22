// src/js/layers/dem-contours.js

function addDemContoursLayer() {
    // add the mapbox source using the unique tileset id
    map.addSource('dem contours', {
        type: 'vector',
        url: 'mapbox://ese-toh.2mi7bdpg' // tileset id for dem contours
    });

    // add the line layer for the contours
    map.addLayer({
        'id': 'dem contours',
        'type': 'line',
        'source': 'dem contours',
        'source-layer': 'cape_cod_contours-0c9jfe', // source layer name from mapbox
        'layout': {
            'visibility': 'none', // hidden by default
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#800080', // purple color for the contour lines
            'line-width': 1
        }
    });

    // add the symbol layer for the contour labels
    map.addLayer({
        'id': 'dem-contour-labels',
        'type': 'symbol',
        'source': 'dem contours',
        'source-layer': 'cape_cod_contours-0c9jfe',
        'layout': {
            'visibility': 'none', // also hidden by default
            'symbol-placement': 'line',
            'text-field': ['get', 'elev'], // property from the data to use as a label
            'text-size': 10,
            'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular']
        },
        'paint': {
            'text-color': '#800080',
            'text-halo-color': '#ffffff',
            'text-halo-width': 1
        }
    });

    // listeners to change the mouse to a pointer on hover
    map.on('mouseenter', 'dem contours', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'dem contours', function () {
        map.getCanvas().style.cursor = '';
    });
}

// call the function to add the layers to the map
addDemContoursLayer();