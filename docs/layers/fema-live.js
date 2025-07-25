/**
 * @fileoverview a live, dynamic version of the fema floodplain layer.
 * this layer connects directly to fema's nfhl (national flood hazard layer) arcgis rest service.
 * it dynamically fetches vector data for the current map extent.
 *
 * this approach ensures the data is always up-to-date without needing to pre-process pmtiles.
 * note: this layer is dependent on the availability of the fema gis service.
 *
 * service url: https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer
 */

/**
 * this function initializes the fema live layer.
 * it checks if the openlayers library ('ol') is available before running,
 * preventing a race condition where this script runs before its dependency.
 */
function initializeFemaLiveLayer() {
  // wait until the openlayers library is loaded
  if (typeof ol === 'undefined') {
    setTimeout(initializeFemaLiveLayer, 50);
    return;
  }

  // once 'ol' is available, proceed with creating the layer

  // define the esrijson format reader
  const esriJsonFormat = new ol.format.EsriJSON();

  // define the vector source for the live fema data
  const femaLiveSource = new ol.source.Vector({
    // the loader function is called whenever the map view changes.
    // it constructs a url to query the fema service for features within the current view.
    loader: function (extent, resolution, projection) {
      // reproject the map's extent to the coordinate system required by the fema service (wgs84)
      const projectedExtent = ol.proj.transformExtent(extent, projection, 'EPSG:4326');
      
      // the arcgis rest service url for querying flood hazard zones (layer id 28)
      const url = 'https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query/?f=json&' +
          'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
          encodeURIComponent(
            '{"xmin":' + projectedExtent[0] + ',"ymin":' + projectedExtent[1] +
            ',"xmax":' + projectedExtent[2] + ',"ymax":' + projected[3] +
            ',"spatialReference":{"wkid":4326}}'
          ) +
          '&geometryType=esriGeometryEnvelope&inSR=4326&outFields=FLD_ZONE,ZONE_SUBTY&outSR=102100';

      // use fetch to get the data from the fema server
      fetch(url).then(response => response.json()).then(data => {
        // once the data is fetched, parse the features using the esrijson format.
        // this format reader understands the structure of the json from an arcgis server.
        const features = esriJsonFormat.readFeatures(data, {
          featureProjection: projection // ensures the feature geometries are in the map's projection
        });
        // if features are returned, add them to the source
        if (features.length > 0) {
          femaLiveSource.addFeatures(features);
        }
      }).catch(err => {
        console.error('error fetching fema floodplain data:', err);
        // remove any previously loaded features if the request fails
        femaLiveSource.clear();
      });
    },
    // the bbox strategy tells the source to reload data whenever the map's bounding box changes
    strategy: ol.loadingstrategy.bbox,
  });

  // define the style for the floodplain layer, similar to your existing floodplain layer
  const femaLiveStyle = (feature) => {
    const floodZone = feature.get('FLD_ZONE');
    let color;

    if (floodZone === 'A' || floodZone === 'AE' || floodZone === 'AH' || floodZone === 'AO' || floodZone === 'VE') {
      color = 'rgba(0, 150, 255, 0.4)'; // 100-year floodplain (blue)
    } else if (floodZone === 'X' || floodZone === '0.2 PCT ANNUAL CHANCE FLOOD HAZARD') {
      const subtype = feature.get('ZONE_SUBTY');
      if (subtype === 'AREA OF MINIMAL FLOOD HAZARD') {
        return null; // do not draw areas of minimal hazard
      }
      color = 'rgba(255, 255, 0, 0.4)'; // 500-year floodplain (yellow)
    } else {
      return null; // do not draw other zones
    }

    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: color,
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, 0.6)',
        width: 1,
      }),
    });
  };

  // create the final vector layer and assign it to the window scope
  // so the main application can find it.
  window.femaLiveLayer = new ol.layer.Vector({
    source: femaLiveSource,
    style: femaLiveStyle,
    title: 'FEMA Floodplain (Live)',
    visible: false,
    // set minzoom to prevent trying to load the entire usa at once
    minZoom: 12,
  });
}

// start the initialization process
initializeFemaLiveLayer();