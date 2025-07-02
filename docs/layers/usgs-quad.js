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

        // --- Use the robust .tfw data to calculate the corner coordinates ---
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

        // --- Correctly process the single-band raster data ---
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(width, height);
        
        const rasters = await image.readRasters();
        const singleBandData = rasters[0]; // Get the data from the first (and only) band

        // Loop through the data and map each pixel's value to RGBA grayscale
        let j = 0;
        for (let i = 0; i < singleBandData.length; i++) {
            const value = singleBandData[i];
            imageData.data[j++] = value; // Red
            imageData.data[j++] = value; // Green
            imageData.data[j++] = value; // Blue
            imageData.data[j++] = 255;   // Alpha
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