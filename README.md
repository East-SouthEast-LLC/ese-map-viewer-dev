# East-South-East, LLC Interactive Map Viewer

## 1. Project Overview

The East-South-East (ESE) Map Viewer is a professional-grade, interactive web mapping application designed to provide clients and staff with clear, visual access to a rich set of GIS data for various towns, with a primary focus on Chatham and Barnstable, MA.

The application is built with a dynamic, modular architecture designed to be embedded within a Squarespace website. Its core assets (JavaScript, CSS, and data files) are hosted on a GitHub repository and served via GitHub Pages. This hybrid hosting model allows for easy updates to the application's functionality by simply pushing changes to the GitHub repository, while leveraging Squarespace's content management system for page creation and hosting of large file assets.

Its primary goal is to centralize crucial property and environmental data, offering powerful interactive tools (such as dynamic layer toggling, an address search, measurement tools, and bookmarking) and generating professional, multi-page printouts for reports and analysis.

---

## 2. Key Technologies

* **Mapping Library:** Mapbox GL JS
* **Hosting:**
    * **Frontend Page:** Squarespace (via embedded code blocks).
    * **Asset Hosting:** GitHub Pages for scripts and configuration; Squarespace for large file assets (e.g., JPG map tiles).
* **Core Languages:** HTML, CSS, JavaScript
* **Key Libraries:**
    * **Turf.js:** Used for geospatial calculations, such as determining the map scale for printing.
    * **Mapbox GL Geocoder:** Powers the address search functionality.

---

## 3. System Architecture

The project's architecture is designed for scalability and ease of maintenance, separating the core application logic from the town-specific data configurations.

### 3.1. High-Level Flow

1.  A user navigates to a town-specific page on the `ese-llc.com` Squarespace site.
2.  The Squarespace page contains a **Code Block** with the contents of `pages/town.html`.
3.  A `townId` variable within that HTML file tells the main application which town to display.
4.  The `docs/main-app.js` script, hosted on GitHub Pages, is loaded.
5.  `main-app.js` fetches the `docs/town-config.json` file to get the specific configuration for the requested `townId`.
6.  It then dynamically loads all the necessary JavaScript files for the layers and controls specified in the town's configuration.
7.  Once all scripts are loaded, the map is initialized, layers are added in the correct draw order, and the UI (menus and toolkits) is rendered.

### 3.2. File Structure Breakdown

* **`/pages/town.html`**: The universal HTML template. This is the only file that needs to be manually placed into Squarespace. Its primary responsibility is to load the core application scripts.

* **`/docs/main-app.js`**: The central controller of the application. It orchestrates the entire map initialization process, including fetching configurations and loading all other necessary scripts.

* **`/docs/town-config.json`**: This file is the "brain" of the application, defining which layers and map settings are used for each town.

* **`/docs/layers/`**: This directory contains individual JavaScript files for each map layer. This modular approach allows for easy addition or modification of layers without affecting the rest of the application.
    * **`usgs-tile-manager.js`**: A specialized script that manages the dynamic loading of hundreds of USGS map tiles. It only loads the images that are currently within the user's viewport to ensure high performance.

* **`/docs/control-*.js`**: Each file in this directory contains the logic for a specific UI component in the map's toolkit, such as:
    * `control-legend.js`: Manages the on-screen and print legends.
    * `control-custom-print.js`: Handles the multi-page PDF printing feature.
    * `control-measure.js`: Powers the distance measurement tool.
    * `control-bookmarks.js`: Manages saving and loading map views.

* **`/docs/legend-data.json`**: A central JSON file that defines the symbology, colors, and labels for every layer. This separates the legend's content from its rendering logic.

* **`/css/globals.css`**: The single, comprehensive stylesheet for the entire application, including print-specific styles for generating professional reports.

---

## 4. Special Features

### Dynamic USGS Tile Loader

The "USGS Quad" layer is not a single data source but a collection of 225 individual JPG tiles. The `usgs-tile-manager.js` script provides a high-performance solution for displaying this large dataset.
1.  **Index Fetch**: On first activation, the manager fetches a central index file (`usgs_tiles.json`) which contains the georeferencing data for every tile.
2.  **Viewport Culling**: It listens for map `moveend` and `zoomend` events. On each event, it calculates the map's current bounding box and determines which map tiles intersect with the user's view.
3.  **Dynamic Loading/Unloading**: It dynamically adds only the necessary tile sources and layers to the map. Tiles that move out of view are removed to conserve browser memory.
4.  **Zoom Restriction**: The entire feature is automatically disabled at zoom levels less than 12 to prevent performance degradation when viewing a large area.

### Custom Multi-Page Printing

The "Custom Print" feature allows users to generate professional, multi-page PDF reports based on pre-defined layer combinations.
* **Presets**: The `control-custom-print.js` file contains a `printPresets` object where different report types (e.g., "Conservation", "Test Hole") are defined with specific layer groupings for each page.
* **Dynamic Legend**: The legend on each printed page is generated by `getLegendForPrint` to only show items that are actually visible within that specific map's print area. It contains special logic to correctly handle raster layers like Satellite and the dynamic USGS tiles.
* **State Management**: The print function carefully de-initializes and re-initializes the USGS tile manager to ensure its background processes do not interfere with the print job.

---

## 5. Developer Workflows

### How to Add a New Town

1.  **Add Configuration**: Open `docs/town-config.json` and add a new JSON object. Copy the structure from an existing town and update the `townID`, `townName`, `map` settings, and the list of `layers`.
2.  **Create Squarespace Page**: Create a new page on your Squarespace site.
3.  **Embed Code**: Add a Code Block, paste in the content from `pages/town.html`, and set the `townId` variable to match the new `townID`.

### How to Add a New Vector Layer

1.  **Prepare Data**: Upload your new geospatial data to Mapbox and create a new vector tileset. Copy the **Tileset ID**.
2.  **Create Layer File**: In the `/docs/layers/` directory, create a new file (e.g., `new-layer.js`).
3.  **Add Mapbox Code**: Use the standard function wrapper to add your Mapbox source and layer(s). Ensure the `id` is unique.
    ```javascript
    // Example: docs/layers/new-layer.js
    function addNewLayer() {
      map.addSource('new-layer-id', {
        type: 'vector',
        url: 'mapbox://YOUR_TILESET_ID'
      });
      map.addLayer({
        'id': 'new-layer-id',
        'type': 'fill',
        'source': 'new-layer-id',
        'source-layer': 'YOUR_SOURCE_LAYER_NAME',
        'layout': { 'visibility': 'none' },
        'paint': { /* Your styles here */ }
      });
    }
    addNewLayer();
    ```
4.  **Update Legend**: If the layer should have a legend, add a new entry for it in `docs/legend-data.json`.
5.  **Add to Town Config**: Open `docs/town-config.json` and add the new layer's ID to the `layers` array for any towns that should have access to it.