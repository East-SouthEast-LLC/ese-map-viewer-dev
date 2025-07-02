async function addUsgsQuadLayer() {
    const layerId = 'usgs quad';
    
    // URL for the large image file on Squarespace
    const geoTiffUrl = 'https://www.ese-llc.com/s/USGS-test2.tif';
    
    // --- UPDATED: URL for the tiny world file on GitHub ---
    const worldFileUrl = 'https://east-southeast-llc.github.io/ese-map-viewer/data/USGS-test2.tfw';

    try {
        // Fetch and parse the .tfw world file from GitHub
        const tfwResponse = await fetch(worldFileUrl);
        if (!tfwResponse.ok) throw new Error(`Failed to fetch TFW file: ${tfwResponse.status}`);
        const tfwText = await tfwResponse.text();
        const tfwValues = tfwText.split('\n').map(parseFloat);

        const [pixelWidth, , , pixelHeight, originLng, originLat] = tfwValues;

        // Fetch the GeoTIFF image itself from Squarespace
        const response = await fetch(geoTiffUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        
        const width = image.getWidth();
        const height = image.getHeight();

        // Calculate coordinates using dynamic values from .tfw
        const minLng = originLng - (pixelWidth / 2);
        const maxLat = originLat - (pixelHeight / 2); 
        const maxLng = minLng + (width * pixelWidth);
        const minLat = maxLat + (height * pixelHeight);

        const coordinates = [
            [minLng, maxLat], [maxLng, maxLat],
            [maxLng, minLat], [minLng, minLat]
        ];

        // The rest of the function remains the same
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        
        const rasters = await image.readRasters();
        const colorMap = image.fileDirectory.ColorMap;
        const photometricInterpretation = image.fileDirectory.PhotometricInterpretation;
        
        if (photometricInterpretation === 3 && colorMap) {
            console.log(`[${layerId}] Processing paletted image with color map.`);
            const paletteData = rasters[0];
            const numColors = colorMap.length / 3;
            
            let j = 0;
            for (let i = 0; i < paletteData.length; i++) {
                const index = paletteData[i];
                imageData.data[j++] = (colorMap[index] / 65535) * 255;
                imageData.data[j++] = (colorMap[index + numColors] / 65535) * 255;
                imageData.data[j++] = (colorMap[index + numColors * 2] / 65535) * 255;
                imageData.data[j++] = 255;
            }
        } else {
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
        
        if (map.getSource(layerId)) {
            map.getSource(layerId).updateImage({ url: dataUrl, coordinates: coordinates });
        } else {
            map.addSource(layerId, { type: 'image', url: dataUrl, coordinates: coordinates });
        }

        if (!map.getLayer(layerId)) {
            map.addLayer({
                'id': layerId,
                'type': 'raster',
                'source': layerId,
                'layout': { 'visibility': 'none' },
                'paint': { 'raster-opacity': 0.85, 'raster-fade-duration': 0 }
            });
        }
        console.log(`%c[${layerId}] Successfully added GeoTIFF layer from dynamic TFW data.`, 'color: green; font-weight: bold;');

    } catch (error) {
        console.error(`Failed to load GeoTIFF layer: ${layerId}`, error);
    }
}