async function addUsgsQuadLayer() {
    
    const layerId = 'usgs quad';
    // Make sure this is the correct path to your re-projected test file in your GitHub repo
    const geoTiffUrl = 'https://east-southeast-llc.github.io/ese-map-viewer/data/USGS-test.tif'; 

    try {
        console.log(`[${layerId}] Starting to fetch GeoTIFF from: ${geoTiffUrl}`);
        const response = await fetch(geoTiffUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        console.log(`[${layerId}] GeoTIFF file fetched successfully.`);

        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const bbox = image.getBoundingBox();
        const width = image.getWidth();
        const height = image.getHeight();

        // --- ADDED: Detailed console logs for debugging ---
        console.log(`[${layerId}] Image Dimensions: ${width}w x ${height}h`);
        console.log(`[${layerId}] Raw Bounding Box: [${bbox.join(', ')}]`);
        // ---

        const rgbData = await image.readRasters({ interleave: true });
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        
        if (rgbData.length === width * height * 4) {
            for (let i = 0; i < rgbData.length; i++) imageData.data[i] = rgbData[i];
        } else if (rgbData.length === width * height * 3) {
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

        const coordinates = [
            [bbox[0], bbox[3]],
            [bbox[2], bbox[3]],
            [bbox[2], bbox[1]],
            [bbox[0], bbox[1]]
        ];
        
        // --- ADDED: Log the coordinates being sent to Mapbox ---
        console.log(`[${layerId}] Calculated Corner Coordinates:`, coordinates);
        // ---

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

        console.log(`%c[${layerId}] Successfully added GeoTIFF layer to map.`, 'color: green; font-weight: bold;');

    } catch (error) {
        console.error(`Failed to load GeoTIFF layer: ${layerId}`, error);
    }
}