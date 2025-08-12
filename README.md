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
2.  The Squarespace page contains a **Code Block** with the contents of `pages/town.html`.
3.  A `townId` variable within that HTML file tells the main application which town to display.
4.  The `docs/main-app.js` script, hosted on GitHub Pages, is loaded.
5.  `main-app.js` fetches the `docs/town-config.json` file to get the specific configuration for the requested `townId`.
6.  It then dynamically loads all the necessary JavaScript files for the layers and controls specified in the town's configuration.
7.  Once all scripts are loaded, the map is initialized, layers are added in the correct draw order, and the UI (menus and toolkits) is rendered.

### 3.2. File Structure Breakdown

* **`/pages/town.html`**: The universal HTML template. This is the only file that needs to be manually placed into Squarespace. Its primary responsibility is to load the core application scripts.
* **`/pages/pano-viewer.html`**: A dedicated HTML page, embedded in a Squarespace Code Block, that serves as the 360-degree panorama viewer.
* **`/docs/main-app.js`**: The central controller of the application. It orchestrates the entire map initialization process, including fetching configurations, loading all other necessary scripts, and opening the panorama viewer modal.
* **`/docs/town-config.json`**: This file is the "brain" of the application, defining which layers and map settings are used for each town.
* **`/docs/layers/`**: This directory contains individual JavaScript files for each map layer. This modular approach allows for easy addition or modification of layers without affecting the rest of the application.
    * **`panoramas.js`**: Fetches panorama location data, converts coordinates, and adds the points to the map.
    * **`usgs-tile-manager.js`**: A specialized script that manages the dynamic loading of hundreds of USGS map tiles.
* **`/docs/control-*.js`**: Each file in this directory contains the logic for a specific UI component in the map's toolkit.
* **`/data/correction-data.json`**: This file contains the georeferencing data (position and orientation) for each panorama image.
* **`/css/globals.css`**: The single, comprehensive stylesheet for the entire application, including print-specific styles for generating professional reports.

---

## 4. Special Features

### Panorama Viewer

The application supports viewing 360-degree panoramic images directly on the map.
* **Dynamic Layer**: The `panoramas.js` script fetches location data from `correction-data.json`, converts the MA State Plane coordinates to WGS 84 using `proj4js`, and plots them on the map as clickable points.
* **Modal Viewer**: When a user clicks a panorama point, `main-app.js` opens a modal window containing an `iframe`.
* **Cross-Domain Solution**: To avoid CORS issues, the `iframe` loads a dedicated page on the Squarespace site (`/pano-viewer`), which contains the Pannellum viewer. This ensures both the viewer page and the images (hosted in Squarespace assets) are on the same domain.
* **Orientation Correction**: The viewer page script fetches the `correction-data.json` file to read the camera's orientation data and applies pitch and roll corrections, ensuring the panoramas are displayed correctly without tilting.

### Dynamic USGS Tile Loader

The "USGS Quad" layer is not a single data source but a collection of 225 individual JPG tiles. The `usgs-tile-manager.js` script provides a high-performance solution for displaying this large dataset.
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

1.  **Add Configuration**: Open `docs/town-config.json` and add a new JSON object. Copy the structure from an existing town and update the `townID`, `townName`, `map` settings, and the list of `layers`.
2.  **Create Squarespace Page**: Create a new page on your Squarespace site.
3.  **Embed Code**: Add a Code Block, paste in the content from `pages/town.html`, and set the `townId` variable to match the new `townID`.

### How to Add a New Vector Layer 

1.  **Prepare Data**: Upload your new geospatial data to Mapbox and create a new vector tileset. Copy the **Tileset ID**.
2.  **Create Layer File**: In the `/docs/layers/` directory, create a new file (e.g., `new-layer.js`). Within this new file, add the necessary code to define your layer. For a layer with no dependencies, it will look something like this.
    ```javascript
        function addHistoricLayer() {
            map.addSource('historic', {
                type: 'vector',
                url: 'mapbox://ese-toh.90pe1azb'
            });
            map.addLayer({
                'id': 'historic',
                'type': 'fill',
                'source': 'historic',
                'source-layer': 'TOC_Historic-d4lyva',
                'layout': {
                    'visibility': 'none'
                },
                'paint': {
                    'fill-color': [
                        'match',
                        ['get', 'Status'],
                        'Proposed', '#F2BD67',
                        '1024-0018', '#D75F48',
                        /* other */ '#5c580f'
                    ],
                    'fill-opacity': 0.4
                }
            });

            // the following hover effects are used if the layer has a corresponding popup when clicked
            map.on('mouseenter', 'historic', function () {
                map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', 'historic', function () {
                map.getCanvas().style.cursor = '';
            });
        }

        // add the layer to the map
        addHistoricLayer();
    ```
3.  **Update Legend**: If the layer should have a legend, add a new entry for it in `docs/legend-data.json`.
4.  **Add to Town Config**: Open `docs/town-config.json` and add the new layer's ID to the `layers` array for any towns that should have access to it.
5.  **Update Popup Handling**: 
6.  **Edit Draw Order**: Make sure to find the `drawOrder` variable in the `docs/main-app.js` file and add your new layer in the draw order. Note that the existing draw order is **listed in reverse**.
7.  **Add Layer to Legend**: If your layer should have a legend entry, you will need to add it to the `docs/legend-data.json` file. To do this, copy the format of one of the other entries and create a new entry for your layer. Here is an example of a simple layer, you can also find an example with a legend layer with dependencies in the following section.
    ```json
        {
            "displayName": "Building Stories",
            "sources": [
                { "id": "stories", "propertyKey": "STORIESS" }
            ],
            "items": [
                { "code": "0", "label": "0 Stories", "color": "#e2ffcc", "opacity": 0.4, "isLine": false },
                { "code": "1", "label": "1 Story", "color": "#fffbb3", "opacity": 0.4, "isLine": false },
                { "code": "1.5", "label": "1.5 Stories", "color": "#8cf2ff", "opacity": 0.4, "isLine": false },
                { "code": "2", "label": "2 Stories", "color": "#5e90f2", "opacity": 0.4, "isLine": false },
                { "code": "2.5", "label": "2.5 Stories", "color": "#3b64b8", "opacity": 0.4, "isLine": false },
                { "code": "3", "label": "3 Stories", "color": "#3841e8", "opacity": 0.4, "isLine": false }
            ]
        },
    ```
    The `displayName` corresponds to the header for the layer in the map legend. You will notice that the sources array contains the ID of the source layer and the `propertyKey` which must exactly match the feature property you call `get` on in your layer's paint or filter expressions. Within the items array, you need to create an item with the same `code` as the value you want to match against in the `get` expression. This allows the legend to correctly display the corresponding label and style for each feature based on its properties. You can then choose the display label that is visible to the user in the legend, the hex color for the color swab, and the opacity for the layer which should be the same as your `fill-opacity` value in the layer definition. The `isLine` field is used to indicate whether the layer is a line layer or not.
8.  **Handle Layer Popup**: If your layer has a popup associated with it, you will need to add the necessary code to handle the popup display when the layer is clicked. For centralization purposes, all this logic is located a `switch` block in the `docs/main-app.js` file. Search for `switch (topFeature.layer.id)` and you will find a big block of cases for each different popup. Simply go anywhere in that block and add a new case for your layer following the same logic.
9.  **Handle Layer Name**: It is common to have a file name for a given layer that does not match the layer ID used in the `town-config.json` file. The town config will always use a a version of the name which might include a space for readability, these are the display names that the user sees in the toggleable menu. Because of the way we dynamically load files based on this config data, we need a way to convert the `layerId` to the filename. That is where the `loadLayerScript` function comes into play. There is a block of if statements that maps the layer names to their corresponding script files. You will need to make sure that either your layer name exactly matches your filename, or add an else if block to the `loadLayerScript` function to handle the difference. There are plenty of examples.

<!-- need to add section on adding layers with dependencies to other layers -->
### How to Add a New Layer with Dependencies

1. **Start by Following Normal Layer Setup**: Follow the procedure for adding a new layer as defined in the previous section. The only difference is how your `new_layer.js` script file will look. With multiple layers dependent on eachother, your script file will look something like this example from the floodplain logic. Note how the `floodplain.js` file is structured with its dependencies. 
    ```javascript
        function addFloodplainLayer() {
            // LiMWA Source + Layer
            map.addSource('LiMWA', {
                type: 'vector',
                url: 'mapbox://ese-toh.7h5nwda9'
            });
            
            map.addLayer({
                'id': 'LiMWA',
                'type': 'line',
                'source': 'LiMWA',
                'source-layer': 'LiMWA-dtmi75',
                'layout': { 'visibility': 'none' },
                'paint': {
                    'line-color': '#E70B0B',
                    'line-width': 3.0
                }
            });

            map.addSource('floodplain', {
                type: 'vector',
                url: 'mapbox://ese-toh.a7lml4y4'
            });

            map.addLayer({
                'id': 'floodplain',
                'type': 'fill',
                'source': 'floodplain',
                'source-layer': '25001c-2014-c2ck89',
                'layout': { 'visibility': 'none' },
                'paint': {
                    'fill-opacity': [
                        'match',
                        ['get', 'ZONE_SUBTY'],
                        '0.2 PCT ANNUAL CHANCE FLOOD HAZARD', 0.4,
                        'AREA OF MINIMAL FLOOD HAZARD', 0.001,
                        /* other */ 0.4
                    ],
                    'fill-color': [
                        'match',
                        ['get', 'FLD_ZONE'],
                        'AE', '#eb8c34',
                        'VE', '#eb3a34',
                        'AO', '#F7FE20',
                        'X', '#2578F9',
                        'A', '#2e4bf0',
                        /* fallback */ '#ff0000'
                    ]
                }
            });

            map.addLayer({
                'id': 'floodplain-line',
                'type': 'line',
                'source': 'floodplain',
                'source-layer': '25001c-2014-c2ck89',
                'layout': { 'visibility': 'none' },
                'paint': {
                    'line-width': 0.5, 
                    'line-color': '#000000', 
                    'line-opacity': 0.5 
                }
            });

            map.addLayer({
                'id': 'floodplain-labels',
                'type': 'symbol',
                'source': 'floodplain',
                'source-layer': '25001c-2014-c2ck89',
                'layout': {
                    'text-field': [
                        'case',
                        ['==', ['get', 'FLD_ZONE'], 'AE'], ['concat', 'AE ', ['get', 'STATIC_BFE']],
                        ['==', ['get', 'FLD_ZONE'], 'VE'], ['concat', 'VE ', ['get', 'STATIC_BFE']],
                        ['==', ['get', 'FLD_ZONE'], 'X'], 'X',
                        ['==', ['get', 'FLD_ZONE'], 'A'], 'A',
                        ''
                    ],
                    'visibility': 'none',
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': ['interpolate', ['linear'], ['zoom'], 10, 12, 16, 16],
                    'symbol-placement': 'point',
                    'symbol-spacing': 80,
                    'text-rotation-alignment': 'map',
                },
                'paint': {
                    'text-color': '#202020',
                    'text-opacity': 0.6,
                    'text-halo-color': '#ffffff',
                    'text-halo-width': 1,
                    'text-halo-blur': 0.4
                }
            });
            
            map.on('mouseenter', 'floodplain', function () {
                map.getCanvas().style.cursor = 'pointer';
            });
            
            map.on('mouseleave', 'floodplain', function () {
                map.getCanvas().style.cursor = '';
            });
        }

        addFloodplainLayer();
    ```
    Note how multiple layers and sources are added to the map within the same function. This is how you should structure the new layer creation. Make sure to keep track of your layer IDs because you will need these later to set up your dependency toggling.
2. **Define Layer Dependencies**: Note that for attaching the new layer to the map, you will just need to add the master layer ID of your choice to the `town-config.json` file. There are two places in the codebase where you will need to define the dependencies. First, go to the `docs/decode-url.js` file and find the data structre `dependentLayers` and add your new layer ID there. Second, you will need to open `toggleable-menu.js` and find the section that handles the clicked layer visiblity toggling. You will need to create a new `else if` block to handle the new layer and its dependencies.
3.  **Add Legend Info**: For entering the legend data for your new layers with dependencies, you can follow nearly the same process as you would for a single layer. Here is an example of the Floodplain layer's legend data. 
    ```json
        {
            "displayName": "FEMA Flood Zones",
            "sources": [
                { "id": "floodplain", "propertyKey": "FLD_ZONE" },
                { "id": "LiMWA" }
            ],
            "items": [
                { "id": "LiMWA", "label": "LiMWA", "color": "#E70B0B", "opacity": 1.0, "isLine": true },
                { "code": "AE", "label": "Flood Zone AE", "color": "#eb8c34", "opacity": 0.4, "isLine": false },
                { "code": "VE", "label": "Flood Zone VE", "color": "#eb3a34", "opacity": 0.4, "isLine": false },
                { "code": "AO", "label": "Flood Zone AO", "color": "#F7FE20", "opacity": 0.4, "isLine": false },
                { "code": "X", "label": "Flood Zone X", "color": "#2578F9", "opacity": 0.4, "isLine": false },
                { "code": "A", "label": "Flood Zone A", "color": "#2e4bf0", "opacity": 0.4, "isLine": false }
            ]
        }
    ```
    Note the only difference is that we have a second source for the LiMWA layer and another item in the legend. The LiMWA is listed as an `id` in the legend items because it is a standalone line without specific features that get matched to different colors.

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
1. **Version Control**: At its heart, Git is a version control system that allows multiple people to work on a project simultaneously without interfering with each other's changes. It keeps track of changes made to files over time, enabling users to revert to previous versions if needed.
2. **Branching and Merging**: Git encourages the use of branches to work on new features or bug fixes in isolation. Once the work is complete, branches can be merged back into the main codebase, allowing for a clean and organized development process. Think of Git as a highway system, where each branch is a separate road that can be developed independently before merging back into the main highway. Your main branch is like the main highway, while feature branches are like side roads that eventually merge back in. Your `main` branch should always contain your working code because this is where your production version of the code is deployed from and because it gives you an easy way to revert changes if something goes wrong. 

### ESE Map Viewer Feature Workflow
1.  **Multiple Repositories**: There are two Git repositories involved in the feature development workflow. We have our `ese-map-viewer` repository, which contains the main application code, and the `ese-map-viewer-dev` repository, which is where we develop new features and test changes before merging them into the main repository. We do this because the main repository directly serves the production application on the webpage and thus, any changes done to the production branch affect user experience. There are a couple primary differences between the two repositories which are crucial to remember. Because the development repo has a different name alltogether, everytime we call scripts from GitHub pages in our development repository, we must make sure we are calling the correct development file. The biggest example is the `town.html` file where you can see the big block of script tags calling the control files. 
    ```html
    <!-- here is how it will look in the production repo -->
    <script src="https://east-southeast-llc.github.io/ese-map-viewer/docs/control-scale.js" defer></script>

    <!-- and here is how it looks in the development repo -->
    <script src="https://east-southeast-llc.github.io/ese-map-viewer-dev/docs/control-scale.js" defer></script>
    ```
    The only difference is the repository path. There are several places within the codebase where this distinction is important, wherever the scripts are called. You can always use the search feature on VSCode or GitHub to find all instances of script calls and update them accordingly. This is particuarly important when you bring your development code over to the production repository and vise versa. 

<!-- notes for improvement -->
<!-- have some sort of config file for layers, dependencies, draw order, display name to file name conversions, popup info, maybe even color info for the legend -->
<!-- seperate the popupHTML generation from the main app and put it in its own file -->