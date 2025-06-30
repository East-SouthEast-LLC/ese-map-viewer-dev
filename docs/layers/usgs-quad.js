// This async function will be called by main-app.js
async function addUsgsQuadLayer() {
    
    const layerId = 'usgs quad';
    const googleDriveFileId = '1ZUA-IF3CTE3mPRAVosVlgGHWK0H0I7_U';
    const geoTiffUrl = `https://drive.google.com/uc?export=download&id=${googleDriveFileId}`;

    try {
        const response = await fetch(geoTiffUrl);
        const arrayBuffer = await response.arrayBuffer();
        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const bbox = await image.getBoundingBox();

        const coordinates = [
            [bbox[0], bbox[3]], // Top-left
            [bbox[2], bbox[3]], // Top-right
            [bbox[2], bbox[1]], // Bottom-right
            [bbox[0], bbox[1]]  // Bottom-left
        ];

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

// NOTE: The automatic call to addUsgsQuadLayer() at the end of the file has been removed.