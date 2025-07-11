// docs/layers/panoramas.js

async function addPanoramasLayer() {
    try {
        const response = await fetch('https://east-southeast-llc.github.io/ese-map-viewer/data/correction-data.json');
        const panoData = await response.json();

        proj4.defs("EPSG:26986", "+proj=lcc +lat_1=42.68333333333333 +lat_2=41.71666666666667 +lat_0=41 +lon_0=-71.5 +x_0=200000 +y_0=750000 +ellps=GRS80 +datum=NAD83 +units=m +no_defs");
        proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

        const features = Object.entries(panoData).map(([filename, data]) => {
            const sourceCoords = [data.position.x, data.position.y];
            const destCoords = proj4("EPSG:26986", "EPSG:4326", sourceCoords);
            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: destCoords 
                },
                properties: {
                    filename: filename
                }
            };
        });

        const geojsonData = {
            type: 'FeatureCollection',
            features: features
        };

        map.addSource('panoramas-source', {
            type: 'geojson',
            data: geojsonData,
            promoteId: 'filename' // promote the filename property to be the feature id
        });

        map.addLayer({
            id: 'panoramas',
            type: 'circle',
            source: 'panoramas-source',
            layout: {
                'visibility': 'none'
            },
            paint: {
                // change the circle radius based on the "viewed" state
                'circle-radius': [
                    'case',
                    ['boolean', ['feature-state', 'viewed'], false],
                    10, // radius when viewed
                    6   // default radius
                ],
                // change the circle color based on the "viewed" state
                'circle-color': [
                    'case',
                    ['boolean', ['feature-state', 'viewed'], false],
                    '#ff0000', // red when viewed
                    '#00ffff'  // cyan by default
                ],
                'circle-stroke-color': '#ffffff',
                'circle-stroke-width': 2,
                'circle-opacity': [ // add a fade-in effect
                    'case',
                    ['boolean', ['feature-state', 'viewed'], false],
                    0.9,
                    0.7
                ],
                'circle-pitch-scale': 'map'
            }
        });

        map.on('mouseenter', 'panoramas', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'panoramas', () => {
            map.getCanvas().style.cursor = '';
        });

    } catch (error) {
        console.error("failed to load and create panoramas layer:", error);
    }
}

addPanoramasLayer();