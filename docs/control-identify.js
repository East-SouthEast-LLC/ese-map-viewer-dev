document.addEventListener('DOMContentLoaded', () => {
    const identifyButton = document.getElementById('identifyButton');
    const identifyBox = document.getElementById('identify-box'); // Get the new container
    if (!identifyButton || !identifyBox) return;

    let identifyMode = false;

    function handleIdentifyClick(e) {
        const allQueryableLayers = window.toggleableLayerIds.filter(id => id !== 'tools' && map.getLayer(id));
        const features = map.queryRenderedFeatures(e.point, { layers: allQueryableLayers });
        
        let html = '<strong style="font-size: 14px;">Features at this Point</strong><hr style="margin: 2px 0 5px;">';
        const foundInfo = new Set();

        if (features.length > 0) {
            features.forEach(feature => {
                let info = '';
                const props = feature.properties;
                switch(feature.layer.id) {
                    case 'zoning': info = `<strong>Zoning:</strong> ${props.TOWNCODE}`; break;
                    case 'floodplain': info = `<strong>Flood Zone:</strong> ${props.FLD_ZONE}`; break;
                    case 'historic': info = `<strong>Historic District:</strong> ${props.District}`; break;
                    case 'acec': info = `<strong>ACEC:</strong> ${props.NAME}`; break;
                    case 'DEP wetland': info = `<strong>DEP Wetland:</strong> ${props.IT_VALDESC}`; break;
                    case 'endangered species': info = `<strong>NHESP Habitat:</strong> Priority & Estimated`; break;
                    case 'soils': info = `<strong>Soil Unit:</strong> ${props.MUSYM}`; break;
                    case 'parcels': info = `<strong>Parcel Address:</strong> ${props.ADDRESS}`; break;
                    // Add more cases here
                }
                if (info && !foundInfo.has(info)) {
                    html += info + '<br>';
                    foundInfo.add(info);
                }
            });
             if (foundInfo.size === 0) {
                html += 'No features found at this location.';
            }
        } else {
            html += 'No features found at this location.';
        }
        
        // --- UPDATED: Populate the panel instead of a popup ---
        identifyBox.innerHTML = html;
        identifyBox.style.display = 'block';
        
        exitIdentifyMode();
    }
    
    function enterIdentifyMode() {
        identifyMode = true;
        map.getCanvas().style.cursor = 'help';
        identifyButton.classList.add('active');
        map.once('click', handleIdentifyClick);
    }

    function exitIdentifyMode() {
        identifyMode = false;
        map.getCanvas().style.cursor = '';
        identifyButton.classList.remove('active');
        map.off('click', handleIdentifyClick);
        // Do not hide the box here, let it stay visible until the tool is toggled off
    }

    identifyButton.addEventListener('click', () => {
        if (identifyMode) {
            // If we are already in identify mode, clicking the button again will exit
            exitIdentifyMode();
            identifyBox.style.display = 'none'; // Also hide the box
        } else {
            // Otherwise, enter identify mode
            enterIdentifyMode();
        }
    });
});