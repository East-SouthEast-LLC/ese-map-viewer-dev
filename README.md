# East-SouthEast, LLC Interactive Map Viewer

## 1. Project Overview

The East-SouthEast (ESE) Map Viewer is a professional-grade, interactive web mapping application designed to provide clients and staff with clear, visual access to a rich set of GIS data for various towns, with a primary focus on Chatham, MA.

The application is built to be embedded within a Squarespace website, with its core assets (JavaScript, CSS, and data files) hosted on a GitHub repository and served via GitHub Pages. Its primary goal is to centralize crucial property and environmental data, offering powerful interactive tools and generating professional, multi-page printouts for reports and analysis.

## 2. Key Technologies

* **Mapping Library:** [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)
* **Hosting:**
    * **Frontend Page:** Squarespace (via embedded code blocks).
    * **Asset Hosting:** GitHub Pages.
* **Core Languages:** HTML, CSS, JavaScript
* **Key Libraries:**
    * [Turf.js](https://turfjs.org/) for geospatial calculations (e.g., distance, print area bounding box).
    * [Mapbox GL Geocoder](https://github.com/mapbox/mapbox-gl-geocoder) for address search functionality.
* **Data Format:** Data is primarily served as Mapbox Vector Tiles, with legend information driven by a central JSON file (`legend-data.json`).

## 3. Architecture and File Structure

The project uses a highly modular and organized architecture to ensure maintainability and ease of future development.

* **`pages/by_town/*.html`** (e.g., `chatham.html`, `barnstable.html`): These are the main entry points for the application. The HTML content of these files is intended to be pasted into a Squarespace "Code Block." They are responsible for:
    * Initializing the Mapbox map with a specific center point and zoom level.
    * Loading the global stylesheet (`globals.css`).
    * Importing all necessary JavaScript files for layers and controls from the `/docs/` directory.

* **`css/globals.css`**: This is the single, comprehensive stylesheet that controls the entire visual presentation of the application. It defines the layout and appearance of the map, menus, toolkit, popups, and provides print-specific styles using `@media print` rules for formatted outputs.

* **`/docs/layers/*.js`**: Each file in this directory is responsible for adding a single data source and its corresponding layer(s) to the map. This modular approach keeps layer definitions isolated and easy to manage. For example:
    * `zoning.js` adds the vector tile source for zoning districts and defines the fill color for each `TOWNCODE`.
    * `satellite.js` adds the raster tile source for satellite imagery.

* **`/docs/control-*.js`**: These files contain the logic for the interactive UI components found in the toolkit panel. Key files include:
    * `toggleable-menu.js`: Builds the layer menu on the left and handles the logic for toggling layer visibility. It is also responsible for the dynamic resizing of the map viewport when the toolkit is opened or closed.
    * `control-legend.js`: Manages the dynamic on-screen legend and generates the legend for printouts.
    * `control-custom-print.js`: Contains the logic for the powerful multi-page custom print feature, including the preset configurations.
    * `control-measure.js`: Manages the state and functionality of the distance measurement tool.

* **`docs/legend-data.json`**: This file is the single source of truth for the map's legend. It defines the display name, source layer IDs, colors, and labels for each item that can appear in the legend. This data-driven approach means the legend can be updated without changing any JavaScript code.

## 4. In-Depth Feature Explanations

### 4.1. Dynamic UI and Viewport Management

The application features a sophisticated UI that keeps the map unobscured by the menus.

* **Implementation (`toggleable-menu.js` & `globals.css`):**
    * The layer menu and toolkit panel are absolutely positioned on the page.
    * When the "tools" button is clicked, the `toggleable-menu.js` script dynamically calculates and sets the `width` and `marginLeft` of the main `#map` container using the CSS `calc()` function.
    * A call to `map.resize()` is then made within a `setTimeout` to allow the map to redraw itself to fit the new dimensions smoothly.
    * To handle vertical overflow, both the `#menu` and `#geocoder-container` panels have a `max-height` set to `80vh` (matching the map's height) and `overflow-y: auto`, which enables independent scrolling for each panel.

### 4.2. Dynamic Legend System

The legend is not static; it intelligently displays only what is relevant to the user's view.

* **Implementation (`control-legend.js`):**
    * **On-Screen Legend (`updateLegend`):** This function queries the features currently rendered in the map's viewport using `map.queryRenderedFeatures()`. It then iterates through the `legend-data.json` file, cross-referencing the visible features with their definitions to build the legend HTML.
    * **Print Legend (`getLegendForPrint`):** This function operates similarly but queries features only within the specific print area bounding box.
    * **Special Cases:** Raster layers like the `'satellite'` layer do not return features from the query. The logic contains a special case to check the layer's visibility property directly (`map.getLayoutProperty(...)`) instead of querying its features.
    * **"Not Present" Feature:** For custom prints, the `getLegendForPrint` function accepts an array of "expected" layers for that print. It compares this list to the layers that were actually rendered and appends a "Not Present in Print Area" notice for any expected layers that were not found.

### 4.3. Custom Multi-Page Printing

This is one of the most powerful features of the application, designed to generate professional, multi-page PDF map packages.

* **Implementation (`control-custom-print.js`):**
    * The feature is driven by the `printPresets` object, which defines the specific combination of layers for each page of a given printout (e.g., 'Conservation' preset).
    * When a user submits a custom print job, the `generateMultiPagePrintout` function begins an `async` loop. For each page in the preset, it:
        1.  Programmatically sets the visibility of the required layers using `setLayerVisibility()`.
        2.  Waits for the map to fully render and settle using `await new Promise(resolve => map.once('idle', resolve));`. This is crucial for ensuring the map image is not captured prematurely.
        3.  Captures the map canvas as a base64-encoded image using `map.getCanvas().toDataURL()`.
        4.  Constructs the full HTML for that print page, embedding the map image and dynamically populating the title block with user-provided info and calling `getLegendForPrint()`.
        5.  Hides the layers before moving to the next page in the loop.
    * After the loop completes, the combined HTML for all pages is written to a new browser window, and the `print()` dialog is triggered.

## 5. How to Add a New Layer

The modular architecture makes adding new data layers straightforward.

1.  **Prepare Data:** Upload your new geospatial data (e.g., a Shapefile) to your Mapbox account and create a new vector tileset. Copy the **Tileset ID**.
2.  **Create Layer File:** In the `/docs/layers/` directory, create a new file named `your-layer-name.js`.
3.  **Add Mapbox Code:** In this new file, add the necessary `map.addSource()` and `map.addLayer()` code. Use the Tileset ID from step 1 in your source definition.
    ```javascript
    // Example: docs/layers/your-layer-name.js
    map.on('load', function() {
      map.addSource('your-layer-name', {
        type: 'vector',
        url: 'mapbox://YOUR_TILESET_ID'
      });
      map.addLayer({
        'id': 'your-layer-name',
        'type': 'fill', // or 'line', 'circle', etc.
        'source': 'your-layer-name',
        'source-layer': 'YOUR_SOURCE_LAYER_NAME_FROM_MAPBOX',
        'layout': {
          'visibility': 'none'
        },
        'paint': {
          /* Your paint styles here */
        }
      });
      // Add a map.on('click', ...) event if desired
    });
    ```
4.  **Update Legend (Optional):** If the new layer should appear in the legend, open `docs/legend-data.json` and add a new object to the main array for your layer, defining its `displayName`, `sources`, and legend `items`.
5.  **Add to Toggle Menu:** Open `docs/toggleable-menu.js` and add the `id` of your new layer (e.g., `'your-layer-name'`) to the `toggleableLayerIds` array.
6.  **Include in HTML:** Finally, open the relevant HTML file (e.g., `chatham.html`) and add a new `<script>` tag to include your new layer file:
    ```html
    <script src="[https://east-southeast-llc.github.io/ese-map-viewer/docs/layers/your-layer-name.js?v=2](https://east-southeast-llc.github.io/ese-map-viewer/docs/layers/your-layer-name.js?v=2)"></script>
    ```