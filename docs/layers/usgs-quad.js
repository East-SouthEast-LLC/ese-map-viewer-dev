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
        
        // This is the simpler image processing logic that was working previously
        const rgbData = await image.readRasters({ interleave: true });
        if (rgbData.length === width * height * 4) { // RGBA
            for (let i = 0; i < rgbData.length; i++) {
                imageData.data[i] = rgbData[i];
            }
        } else if (rgbData.length === width * height * 3) { // RGB
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

        // This is the coordinate logic from when the image was visible but scaled incorrectly
        const [minLng, minLat, maxLng, maxLat] = bbox;
        const coordinates = [
            [minLng, maxLat],
            [maxLng, maxLat],
            [maxLng, minLat],
            [minLng, minLat]
        ];
        
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