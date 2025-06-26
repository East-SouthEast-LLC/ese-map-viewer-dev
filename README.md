# East-South-East, LLC Interactive Map Viewer

## 1. Project Overview

The East-South-East (ESE) Map Viewer is a professional-grade, interactive web mapping application designed to provide clients and staff with clear, visual access to a rich set of GIS data for various towns, with a primary focus on Chatham and Barnstable, MA.

The application is built with a dynamic, modular architecture designed to be embedded within a Squarespace website. Its core assets (JavaScript, CSS, and data files) are hosted on a GitHub repository and served via GitHub Pages. Its primary goal is to centralize crucial property and environmental data, offering powerful interactive tools and generating professional, multi-page printouts for reports and analysis.

## 2. Key Technologies

* **Mapping Library:** [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)
* **Hosting:**
    * **Frontend Page:** Squarespace (via embedded code blocks).
    * **Asset Hosting:** GitHub Pages.
* **Core Languages:** HTML, CSS, JavaScript
* **Key Libraries:**
    * [Turf.js](https://turfjs.org/) for geospatial calculations.
    * [Mapbox GL Geocoder](https://github.com/mapbox/mapbox-gl-geocoder) for address search functionality.

## 3. Architecture and File Structure

The project has been refactored into a highly modular and dynamic system that is configured by a central JSON file. This allows for easy management and scalability to include new towns and layers.

* **`pages/town.html`**: This is the universal HTML template. The content of this file is intended to be pasted into a Squarespace "Code Block". Its only role is to define the basic page structure and load the main application script. The only line edited within Squarespace is `const townId = "..."`, which tells the application which town's configuration to load.

* **`docs/main-app.js`**: This new file is the core controller of the application. It is responsible for:
    * Initializing the Mapbox map.
    * Fetching the `town-config.json` file.
    * Based on the `townId` from `town.html`, finding the correct configuration for the current town.
    * Dynamically loading all necessary layer scripts and control scripts in the correct order using Promises to manage asynchronous operations.
    * Orchestrating the setup of the UI, including the toggleable menu and draw order of the layers.

* **`docs/town-config.json`**: This is the single source of truth for town-specific configurations. For each town, it defines:
    * `townID`: A unique identifier (e.g., "chatham").
    * `townName`: The display name (e.g., "Chatham").
    * `map`: The initial center coordinates and zoom level.
    * `layers`: An array of layer IDs that should be available for that specific town.

* **`docs/layers/*.js`**: Each file in this directory is responsible for adding a single data source and its corresponding layer(s) to the map. Following the refactor, each file now follows a "wrap and call" pattern: the `map.addLayer` logic is wrapped in a function which is immediately called within the script. This allows the layers to be loaded dynamically by `main-app.js` after the map is ready.

* **`docs/control-*.js`**: These files contain the logic for the interactive UI components (e.g., legend, custom print, measuring tools). They are loaded by `town.html` and interact with the globally available `map` object.

* **`css/globals.css`**: The single, comprehensive stylesheet that controls the entire visual presentation of the application, including print-specific styles.

* **`archive/`**: This directory contains the old, static HTML pages for each town, which are kept for historical reference.

## 4. Squarespace Integration

The application is designed to be seamlessly embedded into Squarespace.
1.  On the desired Squarespace page, add a **Code Block**.
2.  Copy the entire contents of the `pages/town.html` file and paste it into the Code Block.
3.  In the pasted code, find the line `const townId = "chatham";` and change `"chatham"` to the ID of the town you want to display on that page (e.g., `"barnstable"`). The ID must match an entry in `town-config.json`.
4.  Save the changes. The `main-app.js` script will handle the rest, loading the correct configuration, layers, and map view.

## 5. How to Add a New Town

The new dynamic architecture makes adding new towns incredibly simple:

1.  **Add Configuration**: Open `docs/town-config.json` and add a new JSON object for the new town. Copy the structure from an existing town and update the `townID`, `townName`, `map` settings, and the list of `layers` that should be available.
2.  **Create Page in Squarespace**: Create a new page on your Squarespace site.
3.  **Embed Code**: Add a Code Block to the new page, paste in the content from `pages/town.html`, and set the `townId` variable to match the `townID` you created in the config file.

## 6. How to Add a New Layer

1.  **Prepare Data**: Upload your new geospatial data to your Mapbox account and create a new vector tileset. Copy the **Tileset ID**.
2.  **Create Layer File**: In the `/docs/layers/` directory, create a new file (e.g., `new-layer.js`).
3.  **Add Mapbox Code**: In this new file, wrap your Mapbox logic in a function and call it at the end of the script. This is critical for the dynamic loading to work.

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
      // Add map.on('click', ...) events if desired
    }
    
    addNewLayer(); // Call the function immediately
    ```
4.  **Update Legend**: If the layer needs a legend entry, add a new object for it in `docs/legend-data.json`.
5.  **Add to Town Config**: Open `docs/town-config.json` and add the new layer's ID (e.g., `"new-layer-id"`) to the `layers` array for any towns that should have access to it.