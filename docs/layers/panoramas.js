// docs/layers/panoramas.js

async function addPanoramasLayer() {
    try {
        // fetch the correction data which contains the coordinates
        const response = await fetch('https://east-southeast-llc.github.io/ese-map-viewer/data/correction-data.json');
        const panoData = await response.json();

        // define the source and destination coordinate systems for proj4
        // source: massachusetts state plane, meters (nad83)
        proj4.defs("EPSG:26986", "+proj=lcc +lat_1=42.68333333333333 +lat_2=41.71666666666667 +lat_0=41 +lon_0=-71.5 +x_0=200000 +y_0=750000 +ellps=GRS80 +datum=NAD83 +units=m +no_defs");
        
        // destination: wgs84 longitude/latitude
        proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

        // convert the json data into a geojson featurecollection of points
        const features = Object.entries(panoData).map(([filename, data]) => {
            // get the state plane coordinates
            const sourceCoords = [data.position.x, data.position.y];
            
            // convert them to wgs84
            const destCoords = proj4("EPSG:26986", "EPSG:4326", sourceCoords);

            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    // use the newly converted coordinates for mapbox
                    coordinates: destCoords 
                },
                properties: {
                    // store the filename in the feature's properties
                    filename: filename
                }
            };
        });

        const geojsonData = {
            type: 'FeatureCollection',
            features: features
        };

        // add the geojson data as a source to the map
        map.addSource('panoramas-source', {
            type: 'geojson',
            data: geojsonData
        });

        // add the layer to display the points
        map.addLayer({
            id: 'panoramas',
            type: 'circle',
            source: 'panoramas-source',
            layout: {
                'visibility': 'none' // start with the layer hidden
            },
            paint: {
                'circle-radius': 6,
                'circle-color': '#00ffff', // a bright cyan color
                'circle-stroke-color': '#ffffff',
                'circle-stroke-width': 2
            }
        });

        // make the points clickable
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