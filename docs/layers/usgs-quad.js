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

        // Use the .tfw data to calculate the corner coordinates
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

        // --- Corrected logic to handle paletted color ---
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        
        const rasters = await image.readRasters();
        const colorMap = image.fileDirectory.ColorMap;

        // Check if a color map exists
        if (colorMap) {
            console.log(`[${layerId}] Detected Paletted Image. Applying Color Map.`);
            const paletteData = rasters[0]; // The pixel data is an array of indices
            let j = 0;
            for (let i = 0; i < paletteData.length; i++) {
                const index = paletteData[i];
                // The color map values are in a 0-65535 range, so we scale them to 0-255
                imageData.data[j++] = (colorMap[index][0] / 65535) * 255; // Red
                imageData.data[j++] = (colorMap[index][1] / 65535) * 255; // Green
                imageData.data[j++] = (colorMap[index][2] / 65535) * 255; // Blue
                imageData.data[j++] = 255;   // Alpha
            }
        } else {
            // Fallback for standard grayscale images (like our previous version)
            console.log(`[${layerId}] No color map found. Rendering as grayscale.`);
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
        
        // --- Add the source and layer to the map ---
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