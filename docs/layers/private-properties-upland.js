function addPrivatePropertiesUplandLayer() {
    // --- Step 1: Add the Mapbox Layer ---
    map.addSource('private properties upland', {
        type: 'vector',
        url: 'mapbox://ese-toh.7ouj2770'
    });

    map.addLayer({
        'id': 'private properties upland',
        'type': 'fill',
        'source': 'private properties upland',
        'source-layer': 'WELLFLEET_private_upland_2024-8zr5ug',
        'layout': { 'visibility': 'none' },
        'paint': {
            'fill-opacity': 0.5,
            'fill-color': [
                'interpolate', ['linear'], ['get', '_LOT_SIZE'],
                0, '#ffffff', 79999, '#ffffff', 80000, '#81d4fa',
                100000, '#4fc3f7', 150000, '#29b6f6', 200000, '#03a9f4',
                250000, '#039be5', 300000, '#0288d1', 350000, '#0277bd',
                400000, '#01579b', 500000, '#003f7f', 3530102, '#002c5e'
            ],
            'fill-outline-color': '#257618'
        }
    });

    // --- Step 2: Define UI creation and logic ---
    const geocoderContainer = document.getElementById('geocoder-container');
    let allParcels = [];
    let controlsInitialized = false;

    // This function creates the HTML for the panel
    function getControlsHTML() {
        return `
            <div style="margin-bottom: 10px;">
                <label for="lowerLotSizeSlider"><strong>Minimum Lot Size:</strong></label>
            </div>
            <div style="margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
                <button id="lowerLotSizeDecrease" style="padding: 3px 8px; cursor: pointer; font-size: 12px; flex-shrink: 0;">&#9660;</button>
                <input type="range" id="lowerLotSizeSlider" min="0" max="4000000" step="10000" value="80000" style="flex-grow: 1; margin: 0 8px;">
                <button id="lowerLotSizeIncrease" style="padding: 3px 8px; cursor: pointer; font-size: 12px; flex-shrink: 0;">&#9650;</button>
            </div>
            <div style="margin-bottom: 10px;" id="lowerParcelCount">Min Lot Size: 80,000 SF</div>
            <div style="margin-bottom: 10px;">
                <label for="upperLotSizeSlider"><strong>Maximum Lot Size:</strong></label>
            </div>
            <div style="margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
                <button id="upperLotSizeDecrease" style="padding: 3px 8px; cursor: pointer; font-size: 12px; flex-shrink: 0;">&#9660;</button>      
                <input type="range" id="upperLotSizeSlider" min="0" max="4000000" step="10000" value="4000000" style="flex-grow: 1; margin: 0 8px;">
                <button id="upperLotSizeIncrease" style="padding: 3px 8px; cursor: pointer; font-size: 12px; flex-shrink: 0;">&#9650;</button>
            </div>
            <div style="margin-bottom: 10px;" id="upperParcelCount">Max Lot Size: 4,000,000 SF</div>
            <div style="margin-bottom: 10px;">
                <label style="font-weight: normal;"><input type="checkbox" id="cnsToggle" style="margin-right: 10px;"> Include CNS Parcels</label>
            </div>
            <div style="text-align: center; margin-top: 10px;">
                <strong>Total Parcels:</strong> <span id="parcelCount">0</span>
            </div>
        `;
    }

    // This function sets up the event listeners for the controls
    function initializeControls() {
        const lowerLotSizeSlider = document.getElementById('lowerLotSizeSlider');
        const upperLotSizeSlider = document.getElementById('upperLotSizeSlider');
        const cnsToggle = document.getElementById('cnsToggle');
        const lowerParcelCountElement = document.getElementById('lowerParcelCount');
        const upperParcelCountElement = document.getElementById('upperParcelCount');

        function updateMinLotSize() { lowerParcelCountElement.innerText = `Min Lot Size: ${parseInt(lowerLotSizeSlider.value).toLocaleString()} SF`; }
        function updateMaxLotSize() { upperParcelCountElement.innerText = `Max Lot Size: ${parseInt(upperLotSizeSlider.value).toLocaleString()} SF`; }
        function updateParcelFilter() {
             if (!allParcels.length) return;
            const minLotSize = parseInt(lowerLotSizeSlider.value);
            const maxLotSize = parseInt(upperLotSizeSlider.value);
            const includeCNS = cnsToggle.checked;
            const filteredParcels = allParcels.filter(f => f.properties._LOT_SIZE >= minLotSize && f.properties._LOT_SIZE <= maxLotSize && (includeCNS || f.properties._ZONING !== 'CNS'));
            document.getElementById('parcelCount').innerText = filteredParcels.length.toLocaleString();
            let filter = ["all", [">=", ["get", "_LOT_SIZE"], minLotSize], ["<=", ["get", "_LOT_SIZE"], maxLotSize]];
            if (!includeCNS) filter.push(["!=", ["get", "_ZONING"], "CNS"]);
            map.setFilter('private properties upland', filter);
        }
        function adjustSlider(slider, adjustment, updateFunc) {
            slider.value = parseInt(slider.value) + adjustment;
            updateFunc();
            updateParcelFilter();
        }

        lowerLotSizeSlider.addEventListener('input', () => { updateMinLotSize(); updateParcelFilter(); });
        upperLotSizeSlider.addEventListener('input', () => { updateMaxLotSize(); updateParcelFilter(); });
        cnsToggle.addEventListener('change', updateParcelFilter);
        document.getElementById('lowerLotSizeIncrease').addEventListener('click', () => adjustSlider(lowerLotSizeSlider, 10000, updateMinLotSize));
        document.getElementById('lowerLotSizeDecrease').addEventListener('click', () => adjustSlider(lowerLotSizeSlider, -10000, updateMinLotSize));
        document.getElementById('upperLotSizeIncrease').addEventListener('click', () => adjustSlider(upperLotSizeSlider, 10000, updateMaxLotSize));
        document.getElementById('upperLotSizeDecrease').addEventListener('click', () => adjustSlider(upperLotSizeSlider, -10000, updateMaxLotSize));
        
        controlsInitialized = true;
    }

    // Function to show or hide the controls
    window.toggleUplandControls = function(show) {
        let controlsDiv = document.getElementById('parcel-controls');
        if (show) {
            if (!controlsDiv) {
                controlsDiv = document.createElement('div');
                controlsDiv.id = 'parcel-controls';
                controlsDiv.style.backgroundColor = '#f9f9f9';
                controlsDiv.style.padding = '15px';
                controlsDiv.style.borderRadius = '10px';
                controlsDiv.style.marginTop = '10px';
                controlsDiv.innerHTML = getControlsHTML();
                geocoderContainer.appendChild(controlsDiv);
            }
            controlsDiv.style.display = 'block';
            if (!controlsInitialized) {
                initializeControls();
            }
        } else {
            if (controlsDiv) {
                controlsDiv.style.display = 'none';
            }
        }
    };
    
    map.on('idle', () => {
        if (map.getSource('private properties upland')) {
            allParcels = map.querySourceFeatures('private properties upland', { sourceLayer: 'WELLFLEET_private_upland_2024-8zr5ug' });
        }
    });
}

addPrivatePropertiesUplandLayer();