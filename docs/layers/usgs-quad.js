async function addUsgsQuadLayer() {
    const layerId = 'usgs quad';
    const geoTiffUrl = 'https://east-southeast-llc.github.io/ese-map-viewer/data/USGS-test2.tif'; 

    try {
        const response = await fetch(geoTiffUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        
        const width = image.getWidth();
        const height = image.getHeight();
        const bbox = image.getBoundingBox();

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);

        // --- NEW, CORRECTED IMAGE PROCESSING LOGIC ---

        // readRasters with interleave: true gives us a single array [R1, G1, B1, R2, G2, B2, ...]
        const rgbData = await image.readRasters({ interleave: true });
        const photometricInterpretation = image.fileDirectory.PhotometricInterpretation;

        console.log(`[${layerId}] Photometric Interpretation: ${photometricInterpretation}`);

        // This single block of logic can now handle both RGB and RGBA interleaved data.
        let j = 0;
        for (let i = 0; i < rgbData.length; i += 3) {
            imageData.data[j++] = rgbData[i];     // Red
            imageData.data[j++] = rgbData[i+1];   // Green
            imageData.data[j++] = rgbData[i+2];   // Blue
            imageData.data[j++] = 255;            // Alpha (fully opaque)
        }
        
        ctx.putImageData(imageData, 0, 0);
        const dataUrl = canvas.toDataURL();
        // --- END OF NEW LOGIC ---

        const [minLng, minLat, maxLng, maxLat] = bbox;
        const coordinates = [[minLng, maxLat], [maxLng, maxLat], [maxLng, minLat], [minLng, minLat]];
        
        map.addSource(layerId, { type: 'image', url: dataUrl, coordinates: coordinates });
        map.addLayer({
            'id': layerId,
            'type': 'raster',
            'source': layerId,
            'layout': { 'visibility': 'none' },
            'paint': { 'raster-opacity': 0.85, 'raster-fade-duration': 0 }
        });
        console.log(`%c[${layerId}] Successfully added GeoTIFF layer to map.`, 'color: green; font-weight: bold;');

    } catch (error) {
        console.error(`Failed to load GeoTIFF layer: ${layerId}`, error);
    }
}