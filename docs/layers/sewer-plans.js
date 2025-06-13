// JS script file for sewer plans layer
map.on('load', function() {
    // add source for sewer plans
    map.addSource('sewer plans', {
        type: 'vector',
        url: 'mapbox://ese-toh.7oyjjs3d'
    });

    // add layer for sewer plans
    map.addLayer({
        'id': 'sewer plans',
        'type': 'fill',
        'source': 'sewer plans',
        'source-layer': 'TOC_SEWER_2025-06-13a-5r49l0',
        'layout': {
            // make layer invisible by default
            'visibility': 'none'
        },
        'paint': {
            'fill-opacity': 0.4,

            // set fill color based on properties
            'fill-color': [
                'case',

                // handle conservation properties
                ['==', ['get', 'CONSERV'], 'Y'],
                '#9b59b6',

                // handle added parcels
                ['==', ['get', 'ADDED'], 'Y'],
                '#e57373', 

                // if neither of the above, use the date-based coloring (red spectrum, light to dark)
                [
                    'case',
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2016], ['<=', ['to-number', ['get', 'DATE']], 2019]], '#ffebee', // 2016-2019 (very light red)
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2014], ['<', ['to-number', ['get', 'DATE']], 2016]], '#ffcdd2', // 2014-2015 (light red)
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2011], ['<', ['to-number', ['get', 'DATE']], 2014]], '#ef9a9a', // 2011-2013
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2008], ['<', ['to-number', ['get', 'DATE']], 2011]], '#e57373', // 2008-2010
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2007], ['<', ['to-number', ['get', 'DATE']], 2008]], '#ef5350', // 2007
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2000], ['<', ['to-number', ['get', 'DATE']], 2007]], '#f44336', // 2000-2006
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 1983], ['<', ['to-number', ['get', 'DATE']], 2000]], '#d32f2f', // 1983-1999
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 1969], ['<', ['to-number', ['get', 'DATE']], 1983]], '#b71c1c', // 1969-1982
                    /* fallback */ '#ffffff'
                ]
            ]
        }
    });

    // add layer for outline
    map.addLayer({
        'id': 'sewer-plans-outline',
        'type': 'line',
        'source': 'sewer plans',
        'source-layer': 'TOC_SEWER_2025-06-09a-a4y5hl',
        'layout': { 'visibility': 'none' },
        'paint': {
            'line-width': 0.5, 
            'line-color': '#000000', 
            'line-opacity': 0.5 
        }
    });
});

// define parameters
/**
 * @param {object} props The properties object from a clicked map feature.
 * @returns {string} The HTML string for the popup.
 */

// create the popup HTML for sewer plans
function createSewerPopupHTML(props) {
    if (!props) {
        return "No feature information available.";
    }

    // for conservation properties, return a specific message
    if (props.CONSERV === 'Y') {
        return "Conservation Property<br>Disclaimer: Information may be inaccurate.";
    }

    // for all other features, return the standard popup HTML
    let html = `Year of plan: <strong>${props.DATE || 'N/A'}</strong><br>
                Plan ID: <strong>${props.SHEET || 'N/A'}</strong><br>`;

    // handle case of post plan added properties
    if (props.ADDED === 'Y') {
        html += `Website: ${props.URL ? `<a href="${props.URL}" target="_blank"><b><u>Link to page</u></b></a>` : 'N/A'}<br>`;
        html += "On sewer but not included in original plans<br>";
    } else {
        html += `Link to plan: ${props.URL ? `<a href="${props.URL}" target="_blank"><b><u>Link to plan</u></b></a>` : 'N/A'}<br>`;
    }

    // add the disclaimer
    html += "Disclaimer: Information may be inaccurate.";

    return html;
}

// add click event listener for sewer plans popups
map.on('click', 'sewer plans', function(e) {

    // get properties from the clicked feature
    const properties = e.features && e.features.length > 0 ? e.features[0].properties : null;
    // generate the popup HTML
    const popupHTML = createSewerPopupHTML(properties);

    // create the popup
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(popupHTML)
        .addTo(map);
});

// change the cursor to a pointer when the mouse is over the layer
map.on('mouseenter', 'sewer plans', function() {
    map.getCanvas().style.cursor = 'pointer';
});

// change it back to a pointer when it leaves
map.on('mouseleave', 'sewer plans', function() {
    map.getCanvas().style.cursor = '';
});