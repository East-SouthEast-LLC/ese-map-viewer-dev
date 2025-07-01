// docs/layers/usgs-quad.js

async function addUsgsQuadLayer() {
    
    const layerId = 'usgs quad';
    const geoTiffUrl = 'https://east-southeast-llc.github.io/ese-map-viewer/data/USGS-test2.tif'; 

    try {
        const response = await fetch(geoTiffUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const bbox = image.getBoundingBox();
        const width = image.getWidth();
        const height = image.getHeight();

        // --- NEW: Read pixel data and draw to a canvas ---
        const rgbData = await image.readRasters({ interleave: true });
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        
        // The TIFF data might have an alpha channel, so we need to handle it
        if (rgbData.length === width * height * 4) { // RGBA
            for (let i = 0; i < rgbData.length; i++) {
                imageData.data[i] = rgbData[i];
            }
        } else if (rgbData.length === width * height * 3) { // RGB
            let j = 0;
            for (let i = 0; i < rgbData.length; i += 3) {
                imageData.data[j++] = rgbData[i];
                imageData.data[j++] = rgbData[i + 1];
                imageData.data[j++] = rgbData[i + 2];
                imageData.data[j++] = 255; // Full alpha
            }
        }
        ctx.putImageData(imageData, 0, 0);
        const dataUrl = canvas.toDataURL();
        // --- END OF NEW LOGIC ---

        const coordinates = [
            [bbox[0], bbox[3]],
            [bbox[2], bbox[3]],
            [bbox[2], bbox[1]],
            [bbox[0], bbox[1]]
        ];

        map.addSource(layerId, {
            type: 'image',
            url: dataUrl, // Use the Data URL from our canvas
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

        console.log(`Successfully added GeoTIFF layer: ${layerId}`);

    } catch (error) {
        console.error(`Failed to load GeoTIFF layer: ${layerId}`, error);
    }
}