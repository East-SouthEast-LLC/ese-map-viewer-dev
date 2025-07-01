// This async function will be called by main-app.js
async function addUsgsQuadLayer() {
    
    const layerId = 'usgs quad';

    // --- UPDATED: Point to the GeoTIFF file in your GitHub repository ---
    const geoTiffUrl = 'https://east-southeast-llc.github.io/ese-map-viewer/data/USGS-test.tif';

    try {
        // Fetch the GeoTIFF file from the new URL
        const response = await fetch(geoTiffUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();

        // Parse the GeoTIFF to get the image and its bounding box
        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const bbox = image.getBoundingBox();

        const coordinates = [
            [bbox[0], bbox[3]], // Top-left
            [bbox[2], bbox[3]], // Top-right
            [bbox[2], bbox[1]], // Bottom-right
            [bbox[0], bbox[1]]  // Bottom-left
        ];

        // Add the image and raster layers to the map
        map.addSource(layerId, {
            type: 'image',
            url: await image.toDataURL(),
            coordinates: coordinates
        });

        map.addLayer({
            'id': layerId,
            'type': 'raster',
            'source': layerId,
            'layout': {
                'visibility': 'none'
            },
            'paint': {
                'raster-opacity': 0.85,
                'raster-fade-duration': 0
            }
        });

        console.log(`Successfully added GeoTIFF layer: ${layerId}`);

    } catch (error) {
        console.error(`Failed to load GeoTIFF layer: ${layerId}`, error);
    }
}
// NOTE: The automatic call is removed, as it's handled by main-app.js