// This script manages the dynamic loading and unloading of USGS image tiles.

// Global state to hold all tile metadata and track loaded tiles
let allUsgsTiles = [];
const loadedUsgsTiles = new Set();
let usgsTilesInitialized = false;

/**
 * Calculates the geographic bounding box for a single tile.
 * @param {object} tile - A tile object from our usgs_tiles.json index.
 * @returns {object} A bounding box object with { south, west, north, east }.
 */
function getTileBounds(tile) {
    const [pixelWidth, , , pixelHeight, originLng, originLat] = tile.jgw;
    const { width, height } = tile;

    const minLng = originLng - (pixelWidth / 2);
    const maxLat = originLat - (pixelHeight / 2); // pixelHeight is negative
    const maxLng = minLng + (width * pixelWidth);
    const minLat = maxLat + (height * pixelHeight);

    return { west: minLng, south: minLat, east: maxLng, north: maxLat };
}

/**
 * Checks the map's current viewport and loads/unloads tiles as needed.
 */
function updateVisibleUsgsTiles() {
    if (!usgsTilesInitialized) return;

    // --- NEW: ZOOM LEVEL CHECK ---
    // Get the current zoom level of the map.
    const currentZoom = map.getZoom();

    // If the user is zoomed out further than level 12, remove all tiles and stop.
    if (currentZoom < 12) {
        // Loop through all loaded tiles and remove them from the map.
        loadedUsgsTiles.forEach(tileName => {
            removeTileFromMap(`usgs-tile-source-${tileName}`);
        });
        // Clear the Set that tracks loaded tiles.
        loadedUsgsTiles.clear();
        return; // Exit the function to prevent loading new tiles.
    }
    // --- END OF NEW LOGIC ---

    const mapBounds = map.getBounds();

    // Loop through all tiles in our index
    allUsgsTiles.forEach(tile => {
        const tileBounds = tile.bounds;
        const sourceId = `usgs-tile-source-${tile.name}`;

        const isVisible =
            mapBounds.getWest() < tileBounds.east &&
            mapBounds.getEast() > tileBounds.west &&
            mapBounds.getSouth() < tileBounds.north &&
            mapBounds.getNorth() > tileBounds.south;

        if (isVisible) {
            // If the tile is visible and not already loaded, add it to the map
            if (!loadedUsgsTiles.has(tile.name)) {
                addTileToMap(tile, sourceId);
                loadedUsgsTiles.add(tile.name);
            }
        } else {
            // If the tile is not visible but is currently loaded, remove it
            if (loadedUsgsTiles.has(tile.name)) {
                removeTileFromMap(sourceId);
                loadedUsgsTiles.delete(tile.name);
            }
        }
    });
}

/**
 * Adds a single tile image and its source to the map.
 * @param {object} tile - The tile object to add.
 * @param {string} sourceId - The unique ID to use for the map source and layer.
 */
function addTileToMap(tile, sourceId) {
    const imageUrl = `https://www.ese-llc.com/s/${tile.name}.jpg`;
    
    if (map.getSource(sourceId)) return; // Already exists, do nothing

    map.addSource(sourceId, {
        type: 'image',
        url: imageUrl,
        coordinates: [
            [tile.bounds.west, tile.bounds.north],
            [tile.bounds.east, tile.bounds.north],
            [tile.bounds.east, tile.bounds.south],
            [tile.bounds.west, tile.bounds.south]
        ]
    });

    map.addLayer({
        id: sourceId, // Layer ID is same as source ID
        type: 'raster',
        source: sourceId,
        paint: { 'raster-opacity': 0.85, 'raster-fade-duration': 0 }
    }, 'satellite'); // Add the tile below the satellite layer for proper ordering
}

/**
 * Removes a tile's layer and source from the map.
 * @param {string} sourceId - The unique ID of the source and layer to remove.
 */
function removeTileFromMap(sourceId) {
    if (map.getLayer(sourceId)) {
        map.removeLayer(sourceId);
    }
    if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
    }
}


/**
 * Main function to start the tile manager. Fetches the index and sets up events.
 */
function initializeUsgsTileManager() {
    // Only run the initialization once
    if (usgsTilesInitialized) {
        updateVisibleUsgsTiles();
        return;
    }

    const indexUrl = 'https://east-southeast-llc.github.io/ese-map-viewer/data/usgs_tiles.json';

    fetch(indexUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            allUsgsTiles = data;
            // Pre-calculate and store the bounds for each tile for efficiency
            allUsgsTiles.forEach(tile => {
                tile.bounds = getTileBounds(tile);
            });

            usgsTilesInitialized = true;
            console.log("USGS Tile Manager Initialized.");

            // Perform the first check to load initial tiles
            updateVisibleUsgsTiles();

            // Add event listeners to update tiles on map move/zoom
            map.on('moveend', updateVisibleUsgsTiles);
            map.on('zoomend', updateVisibleUsgsTiles);
        })
        .catch(error => {
            console.error("Failed to load USGS tile index:", error);
        });
}

/**
 * Hides all currently loaded USGS tiles without removing them from memory.
 */
function hideAllUsgsTiles() {
    if (!usgsTilesInitialized) return;
    loadedUsgsTiles.forEach(tileName => {
        const layerId = `usgs-tile-source-${tileName}`;
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', 'none');
        }
    });
}

/**
 * Shows all currently loaded USGS tiles.
 */
function showAllUsgsTiles() {
    if (!usgsTilesInitialized) return;
    // Check zoom level first before showing tiles
    if (map.getZoom() < 12) {
        hideAllUsgsTiles();
        return;
    }
    loadedUsgsTiles.forEach(tileName => {
        const layerId = `usgs-tile-source-${tileName}`;
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', 'visible');
        }
    });
}