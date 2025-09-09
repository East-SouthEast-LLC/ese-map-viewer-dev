# Workflow: From GeoTIFF DEM to Mapbox Vector Tiles

This document outlines the complete command-line workflow for converting a high-resolution Digital Elevation Model (DEM) in GeoTIFF format into simplified contour lines, packaged as an MBTiles file ready for upload to Mapbox.

---

## Prerequisites

This workflow requires `GDAL` and `Tippecanoe` to be installed in your WSL/Linux environment.

```bash
# Update package list
sudo apt update

# Install GDAL command-line tools
sudo apt install gdal-bin

# Install dependencies to build Tippecanoe
sudo apt install build-essential libsqlite3-dev zlib1g-dev

# Clone and build Tippecanoe
git clone [https://github.com/mapbox/tippecanoe.git](https://github.com/mapbox/tippecanoe.git)
cd tippecanoe
make -j
sudo make install
cd ..
```

---

## The Workflow

### Step 1: Set Up Your Project Directory

To avoid file system permission issues with mounted Windows drives (like Google Drive), it's best to work directly within your WSL home directory.

```bash
# Create a project folder in your home directory
mkdir ~/gis_project

# Navigate into your project folder
cd ~/gis_project

# Copy your DEM file into the folder
cp /path/to/your/dem_file.tif .
```

---

### Step 2: Generate Raw Contours

Use `gdal_contour` to generate the initial contour lines from your DEM.

-   `-a elev`: Names the attribute field that stores the elevation.
-   `-i 2`: Sets the contour interval (e.g., 2 feet or 2 meters, depending on the Z-values of your DEM).

```bash
gdal_contour -a elev -i 2 -f "GeoJSON" dem_file.tif contours_raw.geojson
```

---

### Step 3: Simplify the Contours

Raw contours are too detailed for the web. Use `ogr2ogr` to simplify the geometry, which drastically reduces file size.

-   `-simplify 1.0`: Sets the simplification tolerance. The value is in the source data's units (e.g., meters for EPSG:3857).
-   `-nlt LINESTRING`: Forces the output to be polylines, fixing issues where closed contours are misinterpreted as polygons.

```bash
ogr2ogr -f "GeoJSON" -simplify 1.0 -nlt LINESTRING contours_raw.geojson contours_simplified.geojson
```

---

### Step 4: Reproject to WGS 84 (EPSG:4326)

Tippecanoe and Mapbox require data to be in the standard WGS 84 latitude/longitude coordinate system.

-   `-t_srs EPSG:4326`: Transforms the data to the target spatial reference system.

```bash
ogr2ogr -f GeoJSON -t_srs EPSG:4326 contours_final_wgs84.geojson contours_simplified.geojson
```

---

### Step 5: Generate MBTiles with Tippecanoe

This is the final step, creating the tile package for Mapbox.

-   `-o contours.mbtiles`: Specifies the output filename.
-   `-l contours`: Sets the layer name inside the tileset.
-   `-Z12 -z16`: Sets the min (`Z`) and max (`z`) zoom levels to generate.
-   `--drop-densest-as-needed`: **Crucial flag.** Automatically simplifies or drops features in dense areas to keep tile sizes under the 500KB Mapbox limit.
-   `--force`: Overwrites the output file if it already exists from a previous run.

```bash
tippecanoe -o contours.mbtiles -l contours -Z12 -z16 --drop-densest-as-needed --force contours_final_wgs84.geojson
```

The resulting `contours.mbtiles` file is now ready to be uploaded to your Mapbox account.

---

## Common Troubleshooting

-   **Permission Errors or `No such file or directory` on output:** Always work inside a native WSL directory (`~/...`) instead of a mounted Windows directory (`/mnt/c/...`).
-   **`...not recognized as a supported file format`:** Check the command syntax. Most GDAL tools use the format: `tool [options] <input_file> <output_file>`.
-   **`...driver does not overwrite existing files`:** The output file already exists. Delete it with `rm <filename>` and run the command again.
-   **Tippecanoe Projection Warnings:** Your data is not in `EPSG:4326`. Use `ogr2ogr` to reproject it (Step 4).
-   **Tippecanoe `...already exists` Error:** Use the `--force` flag to allow Tippecanoe to overwrite the old file.