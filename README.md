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
    * **Asset Hosting:** GitHub Pages for scripts and configuration; Squarespace for large file assets (e.g., panoramas, map tiles).
* **Core Languages:** HTML, CSS, JavaScript
* **Key Libraries:**
    * **Pannellum:** Used for rendering and displaying 360-degree panoramas.
    * **proj4js:** For on-the-fly coordinate system conversions.
    * **Turf.js:** Used for geospatial calculations.
    * **Mapbox GL Geocoder:** Powers the address search functionality.

---

## 3. System Architecture

The project's architecture is designed for scalability and ease of maintenance, separating the core application logic from the town-specific data configurations.

### 3.1. High-Level Flow

1.  A user navigates to a town-specific page on the `ese-llc.com` Squarespace site.
2.  The Squarespace page contains a **Code Block** with the contents of `src/pages/town-template.html`.
3.  A `data-town-id` attribute in the script tag tells the main application which town to display.
4.  The `src/js/main.js` script, hosted on GitHub Pages, is loaded.
5.  `main.js` fetches two configuration files: `assets/data/town_config.json` and `assets/data/layer_config.json`.
6.  It uses the `townId` to find the correct town profile in `town_config.json`, which specifies the map center, zoom, and a list of layer IDs to load.
7.  It then filters `layer_config.json` to get the full configuration for each required layer.
8.  Based on the `scriptName` in each layer's config, it dynamically loads all necessary JavaScript files for layers and controls.
9.  Once all scripts are loaded, the map is initialized, layers are added, and the UI (menus and toolkits) is rendered.

### 3.2. File Structure Breakdown

* **`/src/pages/town-template.html`**: The universal HTML template. This is the only file that needs to be manually placed into Squarespace. Its primary responsibility is to load the core application script.
* **`/src/pages/pano-viewer.html`**: A dedicated HTML page, embedded in a Squarespace Code Block, that serves as the 360-degree panorama viewer.
* **`/src/js/main.js`**: The central controller of the application. It orchestrates the entire map initialization process.
* **`/assets/data/town_config.json`**: This file defines which layers and map settings are used for each town.
* **`/assets/data/layer_config.json`**: The "brain" of the application. This central file contains a detailed object for each layer, specifying its ID, display name, script file, draw order, dependencies, and configurations for popups, identify behavior, and the legend.
* **`/src/js/layers/`**: This directory contains individual, lightweight JavaScript files for each map layer. They now primarily contain the `map.addSource` and `map.addLayer` logic, with most styling and behavior defined in `layer_config.json`.
* **`/src/js/components/`**: This directory contains the logic for all UI components, such as the layer menu, toolkit controls, popups, and the disclaimer.
* **`/assets/data/pano_correction_data.json`**: This file contains the georeferencing data (position and orientation) for each panorama image.
* **`/src/css/globals.css`**: The single, comprehensive stylesheet for the entire application, including print-specific styles.

---

## 4. Special Features

### Panorama Viewer

The application supports viewing 360-degree panoramic images directly on the map.
* **Dynamic Layer**: The `panoramas.js` script fetches location data from `pano_correction_data.json`, converts the MA State Plane coordinates to WGS 84 using `proj4js`, and plots them on the map as clickable points.
* **Modal Viewer**: When a user clicks a panorama point, `main.js` opens a modal window containing an `iframe`.
* **Cross-Domain Solution**: To avoid CORS issues, the `iframe` loads a dedicated page (`/pano-viewer`), which contains the Pannellum viewer. This ensures both the viewer page and the images are on the same domain.
* **Orientation Correction**: The viewer page script fetches the `pano_correction_data.json` file to read the camera's orientation data and applies pitch and roll corrections, ensuring the panoramas are displayed correctly without tilting.

### Dynamic USGS Tile Loader

The "USGS Quad" layer is not a single data source but a collection of individual JPG tiles. The `usgs-tile-manager.js` script provides a high-performance solution for displaying this large dataset.
1.  **Index Fetch**: On first activation, the manager fetches a central index file (`usgs_tiles.json`) which contains the georeferencing data for every tile.
2.  **Viewport Culling**: It listens for map `moveend` and `zoomend` events. On each event, it calculates the map's current bounding box and determines which map tiles intersect with the user's view.
3.  **Dynamic Loading/Unloading**: It dynamically adds only the necessary tile sources and layers to the map. Tiles that move out of view are removed to conserve browser memory.
4.  **Zoom Restriction**: The entire feature is automatically disabled at zoom levels less than 12 to prevent performance degradation when viewing a large area.

### Custom Multi-Page Printing

The "Custom Print" feature allows users to generate professional, multi-page PDF reports based on pre-defined layer combinations.
* **Presets**: The `control-custom-print.js` file contains a `printPresets` object where different report types (e.g., "Conservation", "Test Hole") are defined with specific layer groupings for each page.
* **Dynamic Legend**: The legend on each printed page is generated by `getLegendForPrint` to only show items that are actually visible within that specific map's print area.
* **State Management**: The print function carefully de-initializes and re-initializes the USGS tile manager to ensure its background processes do not interfere with the print job.

---

## 5. Developer Workflows

### How to Add a New Town

1.  **Add Configuration**: Open `assets/data/town_config.json` and add a new JSON object for the town. Copy the structure from an existing town and update the `townID`, `townName`, `map` settings, and the list of `layers` you want to be available.
2.  **Create Squarespace Page**: Create a new page on the Squarespace site.
3.  **Embed Code**: Add a Code Block, paste in the content from `src/pages/town-template.html`, and set the `data-town-id` attribute in the script tag to match the new `townID`.

### How to Add a New Vector Layer 

1.  **Prepare Data**: Upload your new geospatial data to Mapbox and create a new vector tileset. Copy the **Tileset ID**.
2.  **Create Layer Script**: In the `src/js/layers/` directory, create a new file (e.g., `new-layer.js`). This file should contain a single function that adds the layer(s) and source(s) to the map.
3.  **Update Configuration**: Open `assets/data/layer_config.json` and add a new JSON object for your layer. This is where you'll define all its properties:
    * `"id"`: The unique Mapbox layer ID (e.g., `"my-new-layer"`).
    * `"displayName"`: The user-friendly name that appears in the menu (e.g., `"My New Layer"`).
    * `"scriptName"`: The exact filename of the script you created (e.g., `"new-layer.js"`).
    * `"drawOrder"`: A number to control the layer stacking order (higher numbers are on top).
    * `"dependencies"`: An array of other layer IDs that should be toggled on/off with this one (e.g., `["my-new-layer-labels", "my-new-layer-outline"]`).
    * `"popupConfig"`: An object with a `template` string for the on-click popup. Use `{property_name}` placeholders.
    * `"identifyConfig"`: An object with a `template` string for the Identify tool's output.
    * `"legendConfig"`: An object defining how the layer should appear in the legend.
4.  **Add to Town**: Open `assets/data/town_config.json` and add the new layer's `id` to the `layers` array for any towns that should use it.


### How to Add a New Control

1.  **Create Control File**: Create a new file in the `/docs/control-` directory.
2.  **Connect the On Click Listnener**: Navigate to the town.html file and then find the div with the className `geocoder-container` and replace one of the placeholder buttons with your own.
    ```html (button markup)
      <button class="mapboxgl-ctrl-four" id="fourButton" aria-label="four" data-tooltip="Placeholder"></button>
      ```
      In this example, you would replace the class with a new className of your choice, corresponding to a new set of css styling to define that button's style. Then you would need to give the button a unique ID which will be used to identify the button within your script file.
3.  **Setup the Control File**: Setup a simple event listener for the new button so that some action is performed when the DOM is loaded. Below is an example from `docs/control-scale.js` of how the `DOMContentLoaded` event listener should be setup along with handling for a corresponding popup for the specific button. 
    ```javascript
    document.addEventListener("DOMContentLoaded", function () {
        const scaleZoomButton = document.getElementById("scaleZoom"); // this corresponds to the id set in town.html
        const geocoderContainer = document.getElementById("geocoder-container"); // this gets the container div for the geocoder and other buttons
        const scaleBoxDiv = document.getElementById("scale-box"); // this is for the scale box popup which is hidden by default
        let scaleVisibility = false; // track if scale box is visible

        // ensure required elements exist
        if (!scaleZoomButton || !geocoderContainer) {
            console.error("Required elements not found in the DOM.");
            return;
        }

        scaleBoxDiv.style.display = 'none'; // crucial to make sure popup starts hidden

        // ..... rest of code
    });
    ```
4. **Add Click Event Listener**: The next step is to actually have an event happen when the user clicks the button. This is where a second event listener comes in. Here is the `onClick` event listener for the scale button.   
    ```javascript
        // main button click handler to toggle scale box
        scaleZoomButton.addEventListener('click', () => {
            scaleVisibility = !scaleVisibility; // toggle visibility state
            if (scaleVisibility) { // show scale box
                updateScaleBox(); // call helper function to update scale box content
                scaleZoomButton.classList.add('active');
            } else { // hide scale box
                scaleBoxDiv.style.display = 'none';
                scaleZoomButton.classList.remove('active');
            }
        });
    ```
5. **Style the Button**: Once you have the basic functionality in place, you need to make sure there are style rules for the new button. To do this, open up the `/css/globals.css` file and add your custom background image for the button using the unique class name you assigned earlier. Here is how that might look for the scale button example we have been using.
    ```html
    <!-- if this was your button definition in the town.html file -->
    <button class="mapboxgl-ctrl-sZoom" id="scaleZoom" aria-label="Zoom to Scale" data-tooltip="Zoom to Scale"></button>
    ```
    ```css
    /* then your custom button image would look like this */
    .mapboxgl-ctrl-sZoom { background-image: url('https://www.ese-llc.com/s/scale-zoom.png'); }
    ```
6. **Test the Button**: Finally, make sure to test your new button to ensure it works as expected. Check that the button appears with the correct styling and that the click event triggers the desired functionality.
7. **Note: For Popup Only**: If your button is intended to trigger a popup, ensure that the popup is properly initialized in the town.html document underneath the share button div and that the button's click event is correctly linked to the popup's display logic. For the scale button the HTML looks like this to create the popup container called `scale-box`.
    ```html
        <div id="scale-box"></div>
    ```
    As for the styling of the popup container, you will need to add another css class for the `scale-box` div in your `/css/globals.css` file. Here is an example of how you might style it.
    ```css
        #scale-box {
        font-size: 12px;
        color: #333;
        background: white;
        padding: 5px 10px;
        border-radius: 5px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        margin-top: 5px;
        text-align: left;
        max-width: 240px;
        width: 100%;
        box-sizing: border-box;

        /* to prevent toolkit popups from squashing eachother in the main container, include the following */
        flex-shrink: 0;
        min-height: 50px;
    }
    ```
    Note: You may need to adjust the positioning and other styles based on your specific layout and design requirements.
8.  **Calling the Script**: In order to actually have your button appear and follow your new functionality, you must import the code you just implemented. Open up the `town.html` file and go all the way to the bottom where you will see a bunch of script tags that look like this:
    ```html
      <script src="https://east-southeast-llc.github.io/ese-map-viewer/docs/control-scale.js" defer></script>
    ```
    Simply add another one of these script tags for your new functionality, calling your new JavaScript file. Note that whenever you make production changes to the `town.html` file, you will need to replace all the Squarespace code blocks in every town with your new file. It is easy enough to do this because you can change the townId constant and copy and paste the code from `town.html` into each town code block.

## 6. Git Development Practices

### Git Overview
1. **Version Control**: Git is a version control system that allows multiple people to work on a project simultaneously. It tracks changes to files over time, enabling users to revert to previous versions if needed.
2. **Branching and Merging**: Git encourages using branches to work on new features or bug fixes in isolation. Once work is complete, branches can be merged back into the main codebase. The `main` branch should always contain the working production code.

### ESE Map Viewer Feature Workflow
1.  **Multiple Repositories**: There are two repositories: `ese-map-viewer` for production and `ese-map-viewer-dev` for development. The primary difference is the base URL used for loading scripts, which must be updated when moving code from development to production.
2.  **Cloning Repositories**: Clone both repositories to your local machine:
    ```bash
    git clone [https://github.com/east-southeast-llc/ese-map-viewer.git](https://github.com/east-southeast-llc/ese-map-viewer.git)
    git clone [https://github.com/east-southeast-llc/ese-map-viewer-dev.git](https://github.com/east-southeast-llc/ese-map-viewer-dev.git)
    ```
3.  **Create a Feature Branch**: In the `ese-map-viewer-dev` repository, create a new branch from the `main` branch to work on your feature:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b your-feature-name
    ```
4.  **Implement Your Feature**: Make your code changes. Commit and push your work regularly to your feature branch on GitHub:
    ```bash
    git add .
    git commit -m "add my new feature" 
    git push origin your-feature-name
    ```
5.  **Test Your Changes**: To test, go to the `ese-map-viewer-dev` repository on GitHub, navigate to `Settings > Pages`, and select your feature branch as the deployment source. After the GitHub Action completes, your changes will be live on the development URL for testing.
6.  **Complete Development**: Once testing is complete, merge your feature branch back into the `main` branch of the `ese-map-viewer-dev` repository.
    ```bash
    git checkout main
    git merge your-feature-name
    git push origin main
    ```
7.  **Move to Production**:
    * Navigate to your local `ese-map-viewer` repository.
    * Pull the changes from the development repository's `main` branch into a local branch.
        ```bash
        # create a temporary branch to hold dev changes
        git checkout -b dev-updates
        git pull [https://github.com/East-SouthEast-LLC/ese-map-viewer-dev.git](https://github.com/East-SouthEast-LLC/ese-map-viewer-dev.git) main
        ```
    * **Crucially**, perform a find-and-replace across all files to change all instances of the repository path from `ese-map-viewer-dev` to `ese-map-viewer`.
    * Commit these path changes.
    * Merge the updated branch into your production `main` branch and push.
        ```bash
        git checkout main
        git merge --no-ff dev-updates
        git push origin main
        ```
    * Finally, update the code blocks on the live Squarespace pages with the new content from `src/pages/town-template.html` if it was changed.