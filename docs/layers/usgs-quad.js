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

        // --- NEW, CORRECTED IMAGE PROCESSING LOGIC ---

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);

        // readRasters() gets the raw pixel data.
        const rasters = await image.readRasters();
        // The photometricInterpretation tells us what kind of image it is.
        const photometricInterpretation = image.fileDirectory.PhotometricInterpretation;

        console.log(`[${layerId}] Photometric Interpretation: ${photometricInterpretation}`);

        // Handle Paletted (indexed-color) images, common for USGS maps
        if (photometricInterpretation === 3) { // 3 means Paletted
            console.log(`[${layerId}] Detected Paletted Image. Using Color Map.`);
            const colorMap = image.fileDirectory.ColorMap;
            const palette = rasters[0];
            let j = 0;
            for (let i = 0; i < palette.length; i++) {
                const index = palette[i];
                // Color map values need to be scaled from 0-65535 to 0-255
                imageData.data[j++] = (colorMap[index][0] / 65535) * 255;
                imageData.data[j++] = (colorMap[index][1] / 65535) * 255;
                imageData.data[j++] = (colorMap[index][2] / 65535) * 255;
                imageData.data[j++] = 255; // Full alpha
            }
        } 
        // Handle standard RGB images
        else if (photometricInterpretation === 2) { // 2 means RGB
            console.log(`[${layerId}] Detected RGB Image.`);
            const [R, G, B] = rasters;
            let j = 0;
            for (let i = 0; i < R.length; i++) {
                imageData.data[j++] = R[i];
                imageData.data[j++] = G[i];
                imageData.data[j++] = B[i];
                imageData.data[j++] = 255; // Full alpha
            }
        } else {
             throw new Error(`Unsupported photometric interpretation: ${photometricInterpretation}`);
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