// PRINT CONTROL BUTTON SCRIPT

// ============================================================================
// HELPER FUNCTION FOR PRINT FUNCTIONALITY
// ============================================================================

function getPrintingFrameCoordinates(map, frameElement) {
    if (!frameElement) {
        console.error("frameElement is not defined or is invalid.");
        return null;
    }

    // Ensure the map container is valid
    if (!map || !map.getContainer()) {
        console.error("Map container is not defined.");
        return null;
    }

    // Get the printing frame dimensions and offsets
    const frameRect = frameElement.getBoundingClientRect();
    const mapRect = map.getContainer().getBoundingClientRect();

    // Calculate relative positions of the frame within the map
    const frameTopLeft = [frameRect.left - mapRect.left, frameRect.top - mapRect.top];
    const frameBottomRight = [
        frameRect.right - mapRect.left,
        frameRect.bottom - mapRect.top,
    ];

    // Define positions in the printing frame (Middle point)
    const positions = {
        middle: {
            x: (frameTopLeft[0] + frameBottomRight[0]) / 2,
            y: (frameTopLeft[1] + frameBottomRight[1]) / 2,
        },
    };

    // Convert printing frame positions to geographical coordinates (map.unproject)
    const coordinates = {
        middle: map.unproject([positions.middle.x, positions.middle.y]).toArray(),
    };

    console.log("Printing frame coordinates:", coordinates);
    return coordinates;
}

// Helper function to calculate the centroid of a simple Polygon
function getPolygonCentroid(coordinates) {
    const flatCoords = coordinates[0]; // Use the first ring (outer boundary)
    const xSum = flatCoords.reduce((sum, coord) => sum + coord[0], 0);
    const ySum = flatCoords.reduce((sum, coord) => sum + coord[1], 0);
    const centroidX = xSum / flatCoords.length;
    const centroidY = ySum / flatCoords.length;

    return [centroidX, centroidY];
}

// Helper function to calculate the centroid of a MultiPolygon
function getMultiPolygonCentroid(coordinates) {
    // Return the centroid of the first polygon in the MultiPolygon
    return getPolygonCentroid(coordinates[0]);
}

function adjustLabelsForPrint(map, frameElement) {
    // Step 1: Get the visible layers
    const visibleLayers = listVisibleLayers(map);
    const toggleableLayerIds = [
        'satellite', 'parcels', 'parcel highlight', 'contours', 'agis', 'historic', 'floodplain', 
        'acec', 'DEP wetland', 'priority habitat', 'estimated habitat', 'vernal pools', 
        'zone II', 'soils', 'conservancy districts', 'zoning', 'conservation', 
        'sewer', 'stories', 'intersection', 'towns'
    ];

    // Step 2: Loop through the main layers
    toggleableLayerIds.forEach(layerId => {
        // Check if the layer is visible
        if (visibleLayers.includes(layerId)) {
            const labelLayerId = `${layerId}-labels`; // Derive the label layer

            // Check if the label layer exists
            if (map.getLayer(labelLayerId)) {
                // Get the coordinates of the printing frame
                const frameCoordinates = getPrintingFrameCoordinates(map, frameElement);

                // Get centroids for features in the layer within the frame
                const centroids = getCentroidsInFrame(map, layerId, frameElement);

                // Step 3: Move the labels to the centroid positions
                centroids.forEach((centroid, index) => {
                    map.setFeatureState({
                        source: map.getLayer(layerId).source,
                        id: centroid.id // Assumes feature IDs are unique
                    }, { centroid: [centroid.x, centroid.y] });

                    // Optional: Add debugging or logging for moved labels
                    console.log(`Moved label for feature ${centroid.id} in ${labelLayerId} to (${centroid.x}, ${centroid.y})`);
                });

                // Update the label layer to use the new positions
                map.setLayoutProperty(labelLayerId, 'text-anchor', 'center'); // Optional adjustment
            } else {
                console.warn(`Label layer "${labelLayerId}" does not exist for layer "${layerId}".`);
            }
        }
    });
}

// get centroids in frame
function getCentroidsInFrame(map, layerId, frameElement) {
    // Step 1: Get the printing frame coordinates (returns pixel coordinates)
    const frameCoordinates = getPrintingFrameCoordinates(map, frameElement);

    // Step 2: Query all features in the specified layer within visible bounds
    const features = map.queryRenderedFeatures({
        layers: [layerId], // Specify the layer (e.g., 'floodplain')
    });

    // Step 3: Process each feature to calculate centroids
    const centroids = features.map(feature => {
        const coordinates = feature.geometry.coordinates;

        // Skip unsupported geometries
        if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon') {
            console.warn(`Unsupported geometry type: ${feature.geometry.type}`);
            return null;
        }

        // Calculate centroid based on geometry type
        let centroid;
        if (feature.geometry.type === 'Polygon') {
            centroid = getPolygonCentroid(coordinates);
        } else if (feature.geometry.type === 'MultiPolygon') {
            centroid = getMultiPolygonCentroid(coordinates);
        }

        // Ensure centroid calculation succeeded
        if (!centroid) {
            console.warn("Centroid calculation failed for feature:", feature.id);
            return null;
        }

        // Step 4: Check if centroid is within the printing frame bounds
        const [centroidX, centroidY] = centroid;
        const centroidPixel = map.project([centroidX, centroidY]); // Convert to pixel coordinates

        const isWithinFrame =
            centroidPixel.x >= frameCoordinates.lowerLeft[0] &&
            centroidPixel.x <= frameCoordinates.upperRight[0] &&
            centroidPixel.y >= frameCoordinates.lowerLeft[1] &&
            centroidPixel.y <= frameCoordinates.upperRight[1];

        if (isWithinFrame) {
            return { centroid, featureId: feature.id };
        }

        return null; // Skip features outside the printing frame
    }).filter(Boolean); // Remove null entries

    return centroids;
}

// ============================================================================
// MAIN PRINT FUNCTION (event listener)
// ============================================================================

document.getElementById('printButton').addEventListener('click', () => {
    map.once('render', () => {
        const canvas = map.getCanvas(); // Capture the map canvas
        const frameElement = document.querySelector('.frame'); // Reference to frame element

        // Call the adjustLabelsForPrint function
        adjustLabelsForPrint(map, frameElement);

        const win = window.open('', '_blank');
        const currentDate = new Date().toLocaleDateString(); // Format the date as needed
        if (win) {
            win.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Map Print</title>
                    <style>
                        @media print {
                            @page {
                                size: 8.5in 11in; /* Letter size, portrait orientation */
                                margin: 0; /* No additional margins */
                            }
                            body {
                                margin: 0;
                                padding: 0;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100%;
                            }
                        }
                        body {
                            background-color: transparent;
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            position: relative;
                            width: 8.5in;
                            height: 11in;
                        }
                        .frame {
                            width: calc(100% - .5in); /* 1/2" margins on both sides */
                            position: absolute;
                            left: 0.25in;
                            right: 0.25in;
                            z-index: 1;
                            border: 4px;
                            border-style: solid;
                            border-color: black;
                            box-sizing: border-box; 
                            background: white;
                            padding: 1px;
                        }
                        .top-frame {
                            height: 8in;
                            position: relative;
                        }
                        .bottom-frame {
                            height: 2.5in;
                            display: flex;
                            align-items: center;
                            position: relative;
                        }
                        .map-container {
                            width: 100%;
                            height: 100%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            overflow: hidden;
                            border-bottom: 2px solid black;
                        }
                        .map-container img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover; /* Ensure the map scales properly */
                        }
                        .image-container {
                            width: 2in;
                            height: 100%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            overflow: hidden;
                        }
                        .image-container img {
                            width: 100%;
                            height: 100%;
                            object-fit: contain;
                        }
                        .inner-frame {
                            width: 2.5in;
                            height: 2.5in;
                            position: absolute;
                            right: 0;
                            top: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            text-align: center;
                            padding: 4px;
                            flex-direction: column; /* Stack text vertically */
                        }
                        .inner-frame span {
                            display: block;
                            margin-bottom: 4px; /* Space between lines */
                        }
                        .gis-map {
                            font-family: 'BankGothicMd', sans-serif;
                            font-style: italic;
                            font-size: 14px;
                        }
                        .date, .scale, .base-map {
                            font-family: Arial, sans-serif;
                        }
                        .disclaimer {
                            font-size: 9px;
                        }
                        .date {
                            font-size: 10px;
                            margin-bottom: 0;
                        }
                        .scale {
                            font-size: 11px;
                        }
                        .sources {
                            font-size: 10px;
                        }
                        .massgis {
                            font-size: 10px;
                        }
                        .base-map {
                            font-size: 10px;
                        }
                        .inner-frame a {
                            color: black;
                            text-decoration: none;
                        }
                        legend-container {
                            width: 3.25in;
                            height: 2.4in;
                            display: flex;
                            flex-direction: column; /* This stacks the title on top of the legend */
                            align-items: center;   /* This centers the title and legend grid horizontally */
                        }

                        /* The new static "Legend" title */
                        .legend-main-title {
                            font-family: 'Garamond', 'Times New Roman', serif;
                            font-weight: bold;
                            font-size: 12pt;
                            margin-bottom: 5px; /* Creates space between the title and the legend content */
                        }
                        /* Main container for the legend area in the print layout */
                        .legend-frame {
                            width: 100%; /* Have it fill the new container */
                            height: 100%;
                            padding: 0; /* Padding will now be handled by the grid's gap */
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }

                        /* The grid container that holds all legend items */
                        .legend-grid {
                            display: grid;
                            width: 100%;
                            grid-template-columns: 1fr 1fr; /* 2 equal-width columns */
                            grid-template-rows: repeat(15, auto); /* Allow for more, smaller rows */
                            grid-auto-flow: column; /* Fill columns top-to-bottom */
                            grid-auto-flow: row; /* Fill rows left-to-right */
                            row-gap: 1.5px; /* Tighter row spacing */
                            column-gap: 10px;
                        }

                        /* A title for a legend section (e.g., "DEP Wetlands") */
                        .legend-section {
                            font-size: .12in;
                            font-weight: bold;
                            font-family: Verdana, sans-serif;
                            margin-top: 5px;
                            margin-bottom: 2px;
                            break-after: avoid-page; 
                        }

                        /* An individual item in the legend (swatch + label) */
                        .legend-item {
                            display: flex;
                            font-family: Verdana, sans-serif;
                            align-items: center;
                            font-size: .1in;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }

                        /* Swatch styles can remain the same */
                        .color-box {
                            width: .1in;
                            height: .1in;
                            border: .5px solid #555;
                            margin-right: 5px; /* Tighter margin */
                            flex-shrink: 0;
                        }
                        .color-line {
                            width: .1in;
                            height: 2px;
                            border: .5px solid #555;
                            margin-right: 5px; /* Tighter margin */
                            flex-shrink: 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="frame">
                        <div class="top-frame">
                            <div class="map-container">
                                <!-- Embed map image with markers -->
                                <img src="${canvas.toDataURL()}" alt="Map Image" />
                            </div>
                        </div>
                        <div class="bottom-frame">
                            <div class="image-container">
                                <img src="https://static1.squarespace.com/static/536cf42ee4b0465238027de5/t/67a783e42bb54b7b434b79f1/1739031525647/ESE-GIS.jpg" alt="Company Logo" />
                            </div>
                            <div class="legend-container">
                                <div class="legend-main-title">Legend</div>
                                <div class="legend-frame">
                                    ${getLegendForPrint()} 
                                </div>
                            </div>
                            <div class="inner-frame">
                                <span class="gis-map">GIS Map</span>
                                <span class="disclaimer">This map is for illustrative purposes only and is not adequate for legal boundary determination or regulatory interpretation.</span>
                                <span class="date">${currentDate}</span>
                                ${getPrintScaleBarHTML(map)}
                                <span class="sources">Map sources include:</span>
                                <span class="massgis">Bureau of Geographic Information (MassGIS), Commonwealth of Massachusetts, Executive Office of Technology and Security Services</span>
                                <span class="base-map">© <a href="https://www.mapbox.com/about/maps">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a><br>
                                    <strong><a style="margin-top: 3px" href="https://apps.mapbox.com/feedback/" target="_blank">Improve this map, www.apps.mapbox.com/feedback</a></strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `);

            win.document.title = 'Map Print';
            win.document.close();

            win.onload = () => {
                win.print();
                //win.close();
            };
        } else {
            alert("Popup blocked! Please allow popups for this site.");
        }
    });

    // Ensure the map fully renders before capturing it
    map.resize();
    map.triggerRepaint();
});
