# East-SouthEast, LLC Interactive Map Viewer

## Project Overview

This project is a sophisticated, open-source, interactive web map designed for East-SouthEast, LLC, to provide clear, visual access to GIS information. It is built using the Mapbox GL JS library and allows users to view and interact with a wide range of geospatial data layers relevant to the Chatham, Massachusetts area. The map viewer is embedded within a Squarespace website, with its core assets (JavaScript files, CSS, and data) hosted on GitHub Pages.

The primary goal of this tool is to democratize access to important property and environmental data, serving the needs of surveyors, engineers, and clients who require detailed, printable maps for planning and analysis.

### Key Technologies

* **Mapping Library:** Mapbox GL JS
* **Web Hosting:** Squarespace (for the main pages) and GitHub Pages (for assets)
* **Core Languages:** HTML, CSS, JavaScript
* **Data Format:** GeoJSON and Mapbox Vector Tiles, with legend information served from a central `legend-data.json` file.
* **Styling:** A global stylesheet (`globals.css`) provides a consistent look and feel for both the on-screen map and the printed outputs.

---

## Core Features

The map viewer includes a rich set of features designed to provide a powerful and intuitive user experience for GIS professionals.

### 1. Layer Management

A toggleable menu on the left side of the map allows users to turn a wide variety of data layers on and off. This feature is designed to be highly responsive and includes intelligent handling of dependent layers.

* **Layer Categories:**
    * **Basemaps:** Satellite imagery and a standard Mapbox street map.
    * **Environmental Data:** FEMA Flood Zones (including LiMWA), DEP Wetlands, Endangered Species habitats (including vernal pools), and Areas of Critical Environmental Concern (ACEC).
    * **Land Use & Planning:** Parcels, zoning districts, conservation land, and sewer plans.
    * **Topographical & Historical:** LIDAR contours and historic aerial photos.
    * **Infrastructure:** Sewer service areas and proposed intersection improvements.
* **Dependent Layer Logic:** The application understands that some layers are related. For example, when a user toggles the "Floodplain" layer, the system automatically toggles the associated "LiMWA," "floodplain-line," and "floodplain-labels" layers, ensuring a complete and coherent map view.

### 2. Interactive Tools

A toolbar, located in the upper-left of the map interface, provides users with a suite of professional-grade interactive tools:

* **Geocoding/Search:** A standard search bar to find specific addresses or points of interest.
* **Point Marker:** Allows users to drop a pin on the map. This is a prerequisite for using the Custom Print feature, as the pin serves as the center point for the printouts.
* **Measurement:** A tool to measure distances on the map, providing instant feedback for quick analysis.
* **Print Area Overlay:** A visual guide that shows the 8" x 8" area that will be captured in a printout, ensuring users know exactly what their printed map will look like.
* **Zoom to Scale:** An interface that allows users to set the map to a specific engineering scale (e.g., 1" = 200'), which is critical for creating accurate and professional map documents.
* **Share Map:** A button to generate a URL that saves the current map view, including the center point, zoom level, and all visible layers. This allows users to easily share a specific map configuration with colleagues or clients.
* **Standard & Custom Printing:** Tools to generate single-page and multi-page, formatted printouts suitable for professional use.

### 3. Print Functionality

The application includes two distinct printing features designed to meet the needs of GIS professionals:

* **Standard Print:** Generates a single-page, formatted printout of the current map view, including a dynamic legend, a north arrow, a scale bar, and other standard map elements.
* **Custom Multi-Page Print:** A powerful feature designed for creating detailed, multi-page map packages. It allows users to create a four-page printout with pre-defined layer combinations on each page. A custom input form allows users to add their own company and client information, which is then dynamically added to a custom-designed title block on each page of the printout.

---

## Architecture & File Structure

The project is structured in a modular and organized way, which makes it easy to maintain and extend.

* **HTML Files (`/pages/by_town/*.html`):** These are the main entry points for the map viewer. The HTML code is pasted into a Squarespace code block. `chatham.html` is the primary file we have been working with.
* **CSS (`/css/globals.css`):** A single, comprehensive stylesheet that defines the look and feel of the map, its controls, and the printouts. It includes specific `@media print` rules to ensure high-quality, formatted outputs.
* **JavaScript - Controls (`/docs/control-*.js`):** Each major feature in the geocoder toolbar has its own dedicated JavaScript file (e.g., `control-legend.js`, `control-print-area.js`, `control-custom-print.js`). This makes the code easy to manage and debug, as all the logic for a specific feature is contained in one place.
* **JavaScript - Layers (`/docs/layers/*.js`):** Each data layer is defined in its own file, which handles adding the source and layer(s) to the map. This keeps the layer definitions separate and organized, making it easy to add, remove, or modify layers in the future.
* **Data (`/docs/legend-data.json`):** A central JSON file that defines the content of the legend. It links layer IDs to their display names, colors, opacities, and other properties, creating a single source of truth for the legend's content.

---

## Key Development Concepts

Several key concepts are central to the development of this map viewer:

* **Modularity:** The separation of concerns between HTML, CSS, and JavaScript, as well as the further division of JavaScript into control- and layer-specific files, is a core strength of this project. This makes the codebase easy to understand, maintain, and extend.
* **Data-Driven Legend:** The legend is not hard-coded. It is dynamically generated based on the `legend-data.json` file and the features currently visible in the map view. This is a powerful and flexible approach that allows the legend to be updated by simply modifying the JSON data, without needing to change any of the application's code.
* **Asynchronous Operations:** The application correctly handles the asynchronous nature of web mapping. It uses Mapbox GL JS events like `map.on('load', ...)` and `map.once('render', ...)` to ensure that code that depends on the map being fully loaded and drawn (like generating a printout) only runs when the map is ready.
* **User Experience:** The project prioritizes a clean and intuitive user experience for its target audience of GIS professionals. Features like tooltips, clear error messages, and well-designed controls make the application easy to use and understand.
* **Print Formatting:** The use of `@media print` CSS rules and the dynamic generation of HTML for the printouts demonstrate a sophisticated approach to creating professional, high-quality map outputs that are ready for use in reports and presentations.

---