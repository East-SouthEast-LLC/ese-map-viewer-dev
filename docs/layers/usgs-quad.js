async function addUsgsQuadLayer() {
    const layerId = 'usgs quad';
    const imageName = 'USGS_CC_A_01'; // The base name for the new file set

    // Construct the URLs for the new file formats
    const imageUrl = `https://www.ese-llc.com/s/${imageName}.jpg`;
    const worldFileUrl = `https://east-southeast-llc.github.io/ese-map-viewer/data/${imageName}.jgw`;

    try {
        // STEP 1: Fetch and parse the world file from GitHub
        const jgwResponse = await fetch(worldFileUrl);
        if (!jgwResponse.ok) throw new Error(`Failed to fetch JGW file: ${jgwResponse.status}`);
        const jgwText = await jgwResponse.text();
        const jgwValues = jgwText.split('\n').map(parseFloat);

        const [pixelWidth, , , pixelHeight, originLng, originLat] = jgwValues;

        // STEP 2: Get image dimensions by loading it in the background
        const image = new Image();
        image.src = imageUrl;
        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject; // Handle image loading errors
        });
        const { width, height } = image;

        // STEP 3: Calculate the geographic corners of the image
        const minLng = originLng - (pixelWidth / 2);
        const maxLat = originLat - (pixelHeight / 2); // pixelHeight is negative
        const maxLng = minLng + (width * pixelWidth);
        const minLat = maxLat + (height * pixelHeight);

        const coordinates = [
            [minLng, maxLat], [maxLng, maxLat],
            [maxLng, minLat], [minLng, minLat]
        ];

        // STEP 4: Add the JPG image source directly to the map
        // This completely replaces the previous GeoTIFF and Canvas logic
        if (map.getSource(layerId)) {
            map.removeLayer(layerId);
            map.removeSource(layerId);
        }
        
        map.addSource(layerId, {
            type: 'image',
            url: imageUrl, // Use the direct URL to the JPG
            coordinates: coordinates
        });

        map.addLayer({
            'id': layerId,
            'type': 'raster',
            'source': layerId,
            'layout': { 'visibility': 'none' },
            'paint': { 'raster-opacity': 0.85, 'raster-fade-duration': 0 }
        });
        
        console.log(`%c[${layerId}] Successfully added JPG layer.`, 'color: green; font-weight: bold;');

    } catch (error) {
        console.error(`Failed to load JPG layer: ${layerId}`, error);
    }
}