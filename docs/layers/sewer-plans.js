function addSewerPlansLayer() {
    map.addSource('sewer plans', {
        type: 'vector',
        url: 'mapbox://ese-toh.7rhkfmk9'
    });

    map.addLayer({
        'id': 'sewer plans',
        'type': 'fill',
        'source': 'sewer plans',
        'source-layer': 'TOC_SEWER_2025-06-13c-dao5gl',
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'fill-opacity': 0.4,
            'fill-color': [
                'case',
                ['==', ['get', 'ADDED'], 'Y'],'#ffcccc',
                [
                    'case',
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2016], ['<=', ['to-number', ['get', 'DATE']], 2019]], '#d32f2f',
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2014], ['<', ['to-number', ['get', 'DATE']], 2016]], '#d32f2f',
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2011], ['<', ['to-number', ['get', 'DATE']], 2014]], '#b71c1c',
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2008], ['<', ['to-number', ['get', 'DATE']], 2011]], '#b71c1c',
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2007], ['<', ['to-number', ['get', 'DATE']], 2008]], '#a31515',
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 2000], ['<', ['to-number', ['get', 'DATE']], 2007]], '#a31515',
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 1983], ['<', ['to-number', ['get', 'DATE']], 2000]], '#7f1010',
                    ['all', ['>=', ['to-number', ['get', 'DATE']], 1969], ['<', ['to-number', ['get', 'DATE']], 1983]], '#4b0707',
                    /* fallback */ '#ffffff'
                ]
            ]
        }
    });

    map.addLayer({
        'id': 'sewer-plans-outline',
        'type': 'line',
        'source': 'sewer plans',
        'source-layer': 'TOC_SEWER_2025-06-13c-dao5gl',
        'layout': { 'visibility': 'none' },
        'paint': {
            'line-width': 0.5, 
            'line-color': '#000000', 
            'line-opacity': 0.5 
        }
    });

    function createSewerPopupHTML(props) {
        if (!props) return "No feature information available.";
        if (props.CONSERV === 'Y') return "Conservation Property<br>Disclaimer: Information may be inaccurate.";

        let html = `Year of plan: <strong>${props.DATE || 'N/A'}</strong><br>
                    Plan ID: <strong>${props.SHEET || 'N/A'}</strong><br>`;

        if (props.ADDED === 'Y') {
            html += `Website: ${props.URL ? `<a href="${props.URL}" target="_blank"><b><u>Link to page</u></b></a>` : 'N/A'}<br>`;
            html += "On sewer but not included in original plans<br>";
        } else {
            html += `Link to plan: ${props.URL ? `<a href="${props.URL}" target="_blank"><b><u>Link to plan</u></b></a>` : 'N/A'}<br>`;
        }
        html += "Disclaimer: Information may be inaccurate.";
        return html;
    }

    map.on('click', 'sewer plans', function(e) {
        const properties = e.features && e.features.length > 0 ? e.features[0].properties : null;
        const popupHTML = createSewerPopupHTML(properties);

        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(popupHTML)
            .addTo(map);
    });

    map.on('mouseenter', 'sewer plans', function() {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'sewer plans', function() {
        map.getCanvas().style.cursor = '';
    });
}

addSewerPlansLayer();