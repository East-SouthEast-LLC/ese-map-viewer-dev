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

        // --- NEW: Calculate coordinates using data from the .tfw world file ---
        // These values are taken directly from your USGS-test2.tfw file
        const pixelWidth = 0.00001800587499404;
        const pixelHeight = -0.00001800587499403;
        const originLng = -69.9959633755972;
        const originLat = 41.6920999234434;

        // Calculate the full extent of the image
        const minLng = originLng;
        const maxLat = originLat;
        const maxLng = originLng + (width * pixelWidth);
        const minLat = originLat + (height * pixelHeight);

        const coordinates = [
            [minLng, maxLat], // Top-left
            [maxLng, maxLat], // Top-right
            [maxLng, minLat], // Bottom-right
            [minLng, minLat]  // Bottom-left
        ];
        console.log(`[${layerId}] Final coordinates from .tfw data:`, coordinates);
        // --- END OF NEW LOGIC ---

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        const rasters = await image.readRasters();
        
        // This logic for drawing the image pixels is correct
        const [R, G, B] = rasters;
        let j = 0;
        for (let i = 0; i < R.length; i++) {
            imageData.data[j++] = R[i];
            imageData.data[j++] = G[i];
            imageData.data[j++] = B[i];
            imageData.data[j++] = 255;
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