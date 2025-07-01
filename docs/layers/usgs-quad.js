async function addUsgsQuadLayer() {
    const layerId = 'usgs quad';
    const geoTiffUrl = 'https://east-southeast-llc.github.io/ese-map-viewer/data/USGS-test2.tif'; 

    try {
        console.log(`--- Starting GeoTIFF Debug ---`);
        
        const response = await fetch(geoTiffUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        
        // --- LOGGING THE DATA WE NEED TO INSPECT ---

        // Log the entire file directory to see all metadata
        console.log("1. Full Image File Directory:", image.fileDirectory);

        // Log the color map (palette) specifically
        console.log("2. Color Map (Palette) Data:", image.fileDirectory.ColorMap);
        
        // Log the raw raster data
        const rasters = await image.readRasters();
        console.log("3. Raw Raster Data:", rasters);

        console.log(`--- End of GeoTIFF Debug ---`);

    } catch (error) {
        console.error(`Failed during GeoTIFF debugging:`, error);
    }
}

// We still call the function to trigger the logging.
addUsgsQuadLayer();