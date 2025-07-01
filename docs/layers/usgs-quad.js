async function addUsgsQuadLayer() {
    
    const layerId = 'usgs quad';
    const geoTiffUrl = 'https://east-southeast-llc.github.io/ese-map-viewer/data/USGS-test2.tif'; 

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

        console.log(`[${layerId}] Image Dimensions: ${width}w x ${height}h`);
        console.log(`[${layerId}] Raw Bounding Box: [${bbox.join(', ')}]`);

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

        // --- CORRECTED COORDINATE MAPPING ---
        // Explicitly define the corners from the bounding box values
        const [minLng, minLat, maxLng, maxLat] = bbox;
        const coordinates = [
            [minLng, maxLat], // Top-left corner [West, North]
            [maxLng, maxLat], // Top-right corner [East, North]
            [maxLng, minLat], // Bottom-right corner [East, South]
            [minLng, minLat]  // Bottom-left corner [West, South]
        ];
        // --- END OF CORRECTION ---
        
        console.log(`[${layerId}] Calculated Corner Coordinates:`, coordinates);

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