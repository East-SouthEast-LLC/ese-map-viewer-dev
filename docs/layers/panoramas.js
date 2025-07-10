// docs/layers/panoramas.js

async function addPanoramasLayer() {
    try {
        // Fetch the correction data which contains the coordinates
        const response = await fetch('https://east-southeast-llc.github.io/ese-map-viewer/data/correction-data.json');
        const panoData = await response.json();

        // Convert the JSON data into a GeoJSON FeatureCollection of points
        const features = Object.entries(panoData).map(([filename, data]) => {
            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    // Using the position data from your JSON
                    coordinates: [data.position.x, data.position.y]
                },
                properties: {
                    // Store the filename in the feature's properties
                    filename: filename
                }
            };
        });

        const geojsonData = {
            type: 'FeatureCollection',
            features: features
        };

        // Add the GeoJSON data as a source to the map
        map.addSource('panoramas-source', {
            type: 'geojson',
            data: geojsonData
        });

        // Add the layer to display the points
        map.addLayer({
            id: 'panoramas',
            type: 'circle',
            source: 'panoramas-source',
            layout: {
                'visibility': 'none' // Start with the layer hidden
            },
            paint: {
                'circle-radius': 6,
                'circle-color': '#00FFFF', // A bright cyan color
                'circle-stroke-color': '#FFFFFF',
                'circle-stroke-width': 2
            }
        });

        // Make the points clickable
        map.on('mouseenter', 'panoramas', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'panoramas', () => {
            map.getCanvas().style.cursor = '';
        });

    } catch (error) {
        console.error("Failed to load and create panoramas layer:", error);
    }
}

addPanoramasLayer();