async function addUsgsQuadLayer() {
    const layerId = 'usgs quad';
    const geoTiffUrl = 'https://east-southeast-llc.github.io/ese-map-viewer/data/USGS-test2.tif'; 

    try {
        console.log(`[${layerId}] Starting to fetch GeoTIFF...`);
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

        const rasters = await image.readRasters();
        const photometricInterpretation = image.fileDirectory.PhotometricInterpretation;

        console.log(`[${layerId}] Photometric Interpretation: ${photometricInterpretation}`);

        // Handle Paletted (indexed-color) images
        if (photometricInterpretation === 3) {
            console.log(`[${layerId}] Detected Paletted Image. Using Color Map.`);
            const colorMap = image.fileDirectory.ColorMap;
            // This line was corrected from 'const-palette' to 'const palette'
            const palette = rasters[0]; 
            let j = 0;
            for (let i = 0; i < palette.length; i++) {
                const index = palette[i];
                imageData.data[j++] = (colorMap[index][0] / 65535) * 255;
                imageData.data[j++] = (colorMap[index][1] / 65535) * 255;
                imageData.data[j++] = (colorMap[index][2] / 65535) * 255;
                imageData.data[j++] = 255;
            }
        } 
        // Handle standard RGB images
        else if (photometricInterpretation === 2) {
            console.log(`[${layerId}] Detected RGB Image.`);
            const [R, G, B] = rasters;
            let j = 0;
            for (let i = 0; i < R.length; i++) {
                imageData.data[j++] = R[i];
                imageData.data[j++] = G[i];
                imageData.data[j++] = B[i];
                imageData.data[j++] = 255;
            }
        } else {
             throw new Error(`Unsupported photometric interpretation: ${photometricInterpretation}`);
        }

        ctx.putImageData(imageData, 0, 0);
        const dataUrl = canvas.toDataURL();

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