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

        const pixelWidth = 0.00001800587499404;
        const pixelHeight = -0.00001800587499403;
        const originLng = -69.9959633755972;
        const originLat = 41.6920999234434;

        const minLng = originLng;
        const maxLat = originLat;
        const maxLng = originLng + (width * pixelWidth);
        const minLat = originLat + (height * pixelHeight);

        const coordinates = [
            [minLng, maxLat], [maxLng, maxLat],
            [maxLng, minLat], [minLng, minLat]
        ];

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        
        const rasters = await image.readRasters();
        const colorMap = image.fileDirectory.ColorMap;
        const photometricInterpretation = image.fileDirectory.PhotometricInterpretation;
        
        // --- FINAL CORRECTED LOGIC FOR PALETTED IMAGES ---
        if (photometricInterpretation === 3 && colorMap) {
            console.log(`[${layerId}] Processing paletted image with color map.`);
            const paletteData = rasters[0];
            const numColors = colorMap.length / 3;
            
            let j = 0;
            for (let i = 0; i < paletteData.length; i++) {
                const index = paletteData[i];
                // The colorMap is a single flat array: [R1, R2, ..., G1, G2, ..., B1, B2, ...]
                // The Red value for a given index is at colorMap[index]
                // The Green value is at colorMap[index + numColors]
                // The Blue value is at colorMap[index + numColors * 2]
                imageData.data[j++] = (colorMap[index] / 65535) * 255;
                imageData.data[j++] = (colorMap[index + numColors] / 65535) * 255;
                imageData.data[j++] = (colorMap[index + numColors * 2] / 65535) * 255;
                imageData.data[j++] = 255;
            }
        } else {
             // Fallback for non-paletted images
             console.warn(`[${layerId}] No supported color map found. Rendering as grayscale.`);
             const singleBandData = rasters[0];
             let j = 0;
             for (let i = 0; i < singleBandData.length; i++) {
                const value = singleBandData[i];
                imageData.data[j++] = value;
                imageData.data[j++] = value;
                imageData.data[j++] = value;
                imageData.data[j++] = 255;
             }
        }
        
        ctx.putImageData(imageData, 0, 0);
        const dataUrl = canvas.toDataURL();
        
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