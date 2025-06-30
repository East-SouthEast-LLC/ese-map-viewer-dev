// This is an async function because reading the remote GeoTIFF is an asynchronous operation
async function addUsgsQuadLayer() {
    
    // --- Configuration ---
    const layerId = 'usgs quad'; // A unique ID for this layer
    const googleDriveFileId = '1ZUA-IF3CTE3mPRAVosVlgGHWK0H0I7_U';
    const geoTiffUrl = `https://drive.google.com/uc?export=download&id=${googleDriveFileId}`;

    try {
        // Step 1: Fetch the GeoTIFF file from the URL
        const response = await fetch(geoTiffUrl);
        const arrayBuffer = await response.arrayBuffer();

        // Step 2: Parse the GeoTIFF file to get the image and its bounding box
        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const bbox = await image.getBoundingBox(); // [minX, minY, maxX, maxY]

        // The coordinates of the four corners of the image
        const coordinates = [
            [bbox[0], bbox[3]], // Top-left
            [bbox[2], bbox[3]], // Top-right
            [bbox[2], bbox[1]], // Bottom-right
            [bbox[0], bbox[1]]  // Bottom-left
        ];

        // Step 3: Add the image as a Mapbox 'image' source
        map.addSource(layerId, {
            type: 'image',
            url: await image.toDataURL(), // We convert the image data to a URL Mapbox can use
            coordinates: coordinates
        });

        // Step 4: Add a 'raster' layer to display the image source on the map
        map.addLayer({
            'id': layerId,
            'type': 'raster',
            'source': layerId,
            'layout': {
                'visibility': 'none' // Initially hidden, to be toggled by the menu
            },
            'paint': {
                'raster-opacity': 0.85, // You can adjust the transparency
                'raster-fade-duration': 0
            }
        });

        console.log(`Successfully added GeoTIFF layer: ${layerId}`);

    } catch (error) {
        console.error(`Failed to load GeoTIFF layer: ${layerId}`, error);
    }
}

// Call the main async function to start the process
addUsgsQuadLayer();