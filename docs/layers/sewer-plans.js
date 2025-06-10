// JS script file for sewer plans layer
map.on('load', function() {
    // add source for sewer plans
    map.addSource('sewer plans', {
        type: 'vector',
        url: 'mapbox://ese-toh.6t88pujd'
    });

    // add layer for sewer plans
    map.addLayer({
        'id': 'sewer plans',
        'type': 'fill',
        'source': 'sewer plans',
        'source-layer': 'TOC_SEWER_2025-06-10a-7xxql4',
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
                '#f1c40f', 

                // if neither of the above, use the date-based coloring
                [
                    'case',
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2016], ['<=', ['to-number', ['get', 'DATE']], 2019]], '#66bb6a', // 2016-2019
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2014], ['<', ['to-number', ['get', 'DATE']], 2016]], '#4caf50', // 2014-2015
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2011], ['<', ['to-number', ['get', 'DATE']], 2014]], '#388e3c', // 2011-2013
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2008], ['<', ['to-number', ['get', 'DATE']], 2011]], '#2e7d32', // 2008-2010
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2007], ['<', ['to-number', ['get', 'DATE']], 2008]], '#1b5e20', // 2007
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2000], ['<', ['to-number', ['get', 'DATE']], 2007]], '#104c1a', // 2000-2006
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 1983], ['<', ['to-number', ['get', 'DATE']], 2000]], '#0a3810', // 1983-1999
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 1969], ['<', ['to-number', ['get', 'DATE']], 1983]], '#052a08', // 1969-1982
                    /* fallback */ '#ff0000'
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