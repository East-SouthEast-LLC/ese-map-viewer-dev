# Workflow: From GeoTIFF DEM to Mapbox Vector Tiles

This document outlines a complete and robust workflow for converting a high-resolution Digital Elevation Model (DEM) into smoothed, web-ready contour lines for Mapbox.

This process was refined after extensive troubleshooting. A summary of failed methods and key lessons learned is included at the end for future reference. The final, successful workflow prioritizes reliability and visual control by generating raw contours first and then cleaning them in the vector domain using the powerful web tool, Mapshaper.

---
## Prerequisites

* **GDAL/OGR**: Must be installed in your command-line environment (e.g., WSL). This provides the `gdal_contour` and `ogr2ogr` tools.
* **Tippecanoe**: The tool for creating `.mbtiles` files. Must be installed in your command-line environment.
* **A Web Browser**: For using the Mapshaper website.

---
## The Successful Workflow (Mapshaper Method)

This workflow is the most reliable and provides the best visual control over the final product.

### Step 1: Generate Raw, Unsmoothed Contours

First, we generate a "draft" version of the contours directly from the original DEM file. These lines will be jagged and cluttered with noise, but this command is very reliable and provides a solid starting point.

Run this from your WSL project directory:
```bash
# Usage: gdal_contour [options] <source_dem> <output_geojson>
gdal_contour -a elev -i 2 -f "GeoJSON" mass_dem_feet.tif contours_raw_original.geojson
```

### Step 2: Clean and Smooth with Mapshaper

This is the most critical step for achieving a high-quality cartographic result. We will use the free and powerful web tool, Mapshaper.

1.  **Open Mapshaper**: Go to **[mapshaper.org](https://mapshaper.org)** in your web browser.
2.  **Import Data**: Find your `contours_raw_original.geojson` file in Windows File Explorer (via the `\\wsl$\...` path) and drag-and-drop it into the Mapshaper window.
3.  **Remove Clutter (Filter)**: The map will be cluttered with tiny, insignificant contour lines.
    * Click the **Console** button in the top right.
    * Run the `filter` command to remove all lines shorter than a certain length. A value between 100-200 feet is a good start. This value is in the units of your source data.
    ```bash
    filter 'this.length > 150'
    ```
4.  **Smooth Jagged Lines (Simplify)**:
    * Click the **Simplify** button in the top right.
    * In the menu, select the **Visvalingam / weighted area** method. This produces the most visually pleasing results.
    * Click **Apply**. A slider will appear at the top of the page.
    * Adjust the slider to apply the desired amount of smoothing. A value around **70%** is often a good balance.
5.  **Export the Result**:
    * Click the **Export** button.
    * Choose **GeoJSON** as the format and download the file.
    * Rename the downloaded file to **`contours_clean_and_smooth.geojson`** and move it into your WSL project folder.

### Step 3: Reproject the Data Correctly

This is a crucial step. Mapshaper may export the file with an incorrect Coordinate Reference System (CRS) tag. This command forces the correct transformation by explicitly defining both the source and target CRS.

-   `-s_srs EPSG:3857`: Overrides the file's incorrect metadata, telling `ogr2ogr` to treat the source data as Web Mercator (meters).
-   `-t_srs EPSG:4326`: Transforms the data to WGS 84 (latitude/longitude), which Mapbox requires.

```bash
ogr2ogr -s_srs EPSG:3857 -t_srs EPSG:4326 -f GeoJSON contours_final.geojson contours_clean_and_smooth.geojson -overwrite
```

### Step 4: Generate Final MBTiles

This is the final command. It takes your clean, smooth, and correctly projected GeoJSON and packages it into the `.mbtiles` format for Mapbox.

```bash
tippecanoe -o contours_final.mbtiles -l contours -Z12 -z16 --drop-densest-as-needed --force contours_final.geojson
```

The resulting `contours_final.mbtiles` file is ready for upload.

---
## Troubleshooting & Failed Approaches

This successful workflow was developed after several other methods failed. Here is a summary of the issues encountered.

### The Raster Smoothing Trap

The initial approach was to smooth the DEM raster *before* generating contours. While a valid technique in theory, it proved to be extremely problematic.

* **Problem:** Smoothing a DEM (using tools like Python scripts, `GDAL Warp`, or GRASS `r.neighbors`) creates a new raster with a massive number of unique floating-point elevation values.
* **Consequences:**
    1.  **`gdal_contour` Failure:** The `gdal_contour` tool consistently failed with an `ERROR 1: ...too many levels` because it couldn't handle the sheer number of new elevation values.
    2.  **NoData Value Corruption:** This was the most catastrophic issue. The processing chain (especially `gdal_calc.py`) repeatedly failed to correctly handle the "NoData" value representing water and empty space. This caused the NoData value to be treated as a real elevation, resulting in bizarre negative elevations and the infamous horizontal lines across water bodies. This was traced back to subtle floating-point precision errors between different tools.
* **Conclusion:** Smoothing in the raster domain for this workflow was abandoned. **Smoothing the vector lines after creation is far more reliable.**

### Command-Line and Data Quirks

* **The Mapshaper CRS Issue:** As noted in Step 3, Mapshaper can export a file with coordinates in one system (meters) but metadata incorrectly claiming it's in another (degrees). This was diagnosed with `ogrinfo` and fixed by using both the `-s_srs` and `-t_srs` flags in `ogr2ogr`.
* **`ogr2ogr` Syntax:** This tool has two quirks:
    1.  The file order is `ogr2ogr <output> <input>`, which is the reverse of many other tools.
    2.  The overwrite flag is `-overwrite` (one dash), and it is not supported by all file drivers (like GeoJSON), often requiring a manual `rm` of the old file first.