// docs/layers/usgs-quad.js

async function addUsgsQuadLayer() {
    
    const layerId = 'usgs quad';
    const geoTiffUrl = 'https://east-southeast-llc.github.io/ese-map-viewer/data/USGS-test.tif'; 

    try {
        const response = await fetch(geoTiffUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const width = image.getWidth();
        const height = image.getHeight();

        const rgbData = await image.readRasters({ interleave: true });
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        
        if (rgbData.length === width * height * 4) { // RGBA
            for (let i = 0; i < rgbData.length; i++) imageData.data[i] = rgbData[i];
        } else if (rgbData.length === width * height * 3) { // RGB
            let j = 0;
            for (let i = 0; i < rgbData.length; i += 3) {
                imageData.data[j++] = rgbData[i];
                imageData.data[j++] = rgbData[i + 1];
                imageData.data[j++] = rgbData[i + 2];
                imageData.data[j++] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        const dataUrl = canvas.toDataURL();

        // --- UPDATED: Using your hard-coded coordinates for this test ---
        // Note: Longitude in the US is negative.
        const north = 36.52073069150;
        const west = -72.6414789222202; // E/W are longitudes
        const south = 36.51592566498;
        const east = -72.62119592406;

        const coordinates = [
            [west, north],    // Top-left
            [east, north],    // Top-right
            [east, south],    // Bottom-right
            [west, south]     // Bottom-left
        ];
        // --- END OF UPDATE ---

        map.addSource(layerId, {
            type: 'image',
            url: dataUrl,
            coordinates: coordinates
        });

        map.addLayer({
            'id': layerId,
            'type': 'raster',
            'source': layerId,
            'layout': { 'visibility': 'none' },
            'paint': {
                'raster-opacity': 0.85,
                'raster-fade-duration': 0
            }
        });

        console.log(`Successfully added GeoTIFF layer with hard-coded coordinates: ${layerId}`);

    } catch (error) {
        console.error(`Failed to load GeoTIFF layer: ${layerId}`, error);
    }
}