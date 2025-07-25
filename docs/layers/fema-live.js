/**
 * @fileoverview creates and manages the toggleable layer menu.
 * it reads the layer configuration and dynamically builds the menu ui.
 */

/**
 * initializes the toggleable menu with layer groups and layers.
 * @param {object} layerConfig - the configuration object for layers.
 * @param {ol.Map} map - the openlayers map instance.
 */
function initializeToggleableMenu(layerConfig, map) {
  const menu = document.getElementById('toggleable-menu');
  const groups = Object.keys(layerConfig);

  // utility to convert layer names (e.g., 'fema-live') to camelcase (e.g., 'femaLive')
  const camelCase = (str) => {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)?/g, (match, chr) => chr ? chr.toUpperCase() : '').replace(/^\w/, c => c.toLowerCase());
  };

  groups.forEach(groupName => {
    const groupConfig = layerConfig[groupName];
    const layers = Array.isArray(groupConfig) ? groupConfig : groupConfig.layers; // handle both formats

    // create group container
    const groupDiv = document.createElement('div');
    groupDiv.className = 'layer-group';

    // create group header
    const groupHeader = document.createElement('h3');
    groupHeader.textContent = groupName;
    groupDiv.appendChild(groupHeader);
    
    // create layers within the group
    layers.forEach(layerName => {
      const camelCaseLayerName = camelCase(layerName);
      const layerObject = window[camelCaseLayerName + 'Layer'];
      
      const itemDiv = document.createElement('div');
      itemDiv.className = 'layer-item';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `toggle-${layerName}`;
      checkbox.checked = layerObject ? layerObject.getVisible() : false;
      
      const label = document.createElement('label');
      label.htmlFor = `toggle-${layerName}`;
      label.textContent = layerObject ? layerObject.get('title') : layerName;

      // create a link wrapper for the label to handle clicks
      const link = document.createElement('a');
      link.href = '#';
      link.appendChild(label);
      
      itemDiv.appendChild(checkbox);
      itemDiv.appendChild(link);
      groupDiv.appendChild(itemDiv);

      // handle layer visibility toggle
      link.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const layerVariableName = camelCaseLayerName + 'Layer';
        
        // function to find and toggle the layer. it will retry for a short period.
        const findAndToggleLayer = (retries = 20) => {
          const layerObject = window[layerVariableName];

          if (layerObject) {
            // layer found, toggle its visibility
            const isVisible = layerObject.getVisible();
            layerObject.setVisible(!isVisible);
            checkbox.checked = !isVisible;

            // analytics event
            const eventAction = isVisible ? 'off' : 'on';
            trackEvent('layer_toggle', { layer_id: layerName, action: eventAction });
          } else if (retries > 0) {
            // layer not found yet, wait 50ms and try again
            setTimeout(() => findAndToggleLayer(retries - 1), 50);
          } else {
            // still not found after all retries, log an error
            console.error('Layer not found:', layerName);
          }
        };

        // start the process
        findAndToggleLayer();
      };
    });

    menu.appendChild(groupDiv);
  });
}