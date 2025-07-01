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
        const bbox = image.getBoundingBox();
        const width = image.getWidth();
        const height = image.getHeight();

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        
        // --- NEW, MORE ROBUST DRAWING LOGIC ---

        const colorMap = image.getColorMap();
        const rasters = await image.readRasters();

        if (colorMap) {
            // Handle Paletted/Indexed Color Image
            console.log(`[${layerId}] Detected Paletted Image. Using Color Map.`);
            const A = rasters[0]; 
            let j = 0;
            for (let i = 0; i < A.length; i++) {
                const R = colorMap[A[i]][0];
                const G = colorMap[A[i]][1];
                const B = colorMap[A[i]][2];
                imageData.data[j++] = R;
                imageData.data[j++] = G;
                imageData.data[j++] = B;
                imageData.data[j++] = 255; // Full alpha
            }
        } else {
            // Handle standard RGB/RGBA Image
            console.log(`[${layerId}] Detected RGB/RGBA Image.`);
            const [R, G, B, Alpha] = rasters;
            let j = 0;
            for (let i = 0; i < R.length; i++) {
                imageData.data[j++] = R[i];
                imageData.data[j++] = G[i];
                imageData.data[j++] = B[i];
                imageData.data[j++] = Alpha ? Alpha[i] : 255;
            }
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