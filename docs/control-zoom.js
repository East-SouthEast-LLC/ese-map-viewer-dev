// ZOOM CONTROL BUTTON SCRIPT

// ============================================================================
// HELPER FUNCTIONS FOR ZOOM FUNCTIONALITY
// ============================================================================

// Initialize zoom UI
function createZoomDialog() {
    if (document.getElementById("zoomPopup")) return;

    const geocoderContainer = document.getElementById('geocoder-container');
    if (!geocoderContainer) {
        console.error("geocoder-container not found in the DOM.");
        return;
    }

    const zoomDialog = document.createElement("div");
    zoomDialog.id = "zoomPopup";
    zoomDialog.innerHTML = `
        <div style="background: white; padding: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 2000; border-radius: 8px; 
            width: 95%; max-width: 350px; min-width: 200px; position: absolute; bottom: -50px; left: 0; margin: 10px auto;">
            <div style="text-align: center; display: flex; justify-content: center; align-items: center;">
                <button style="font-size: 10px;" onclick="zoomOut(0.01)">-0.01</button>
                <button style="font-size: 10px;" onclick="zoomOut(0.1)">-0.1</button>
                <input type="number" id="zoomInput" value="${map.getZoom().toFixed(2)}" 
                    style="width: 50px; text-align: center;" onchange="updateZoom(parseFloat(this.value))" />
                <button style="font-size: 10px;" onclick="zoomIn(0.1)">+0.1</button>
				<button style="font-size: 10px;" onclick="zoomIn(0.01)">+0.01</button>
            </div>
        </div>`;

    geocoderContainer.appendChild(zoomDialog);

    const sliderDialog = document.createElement("div");
    sliderDialog.id = "sliderPopup";
    sliderDialog.innerHTML = `
        <div style="background: white; padding: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 1500; border-radius: 8px; 
            width: 95%; max-width: 350px; min-width: 200px; position: absolute; bottom: -110px; left: 0; margin: 10px auto;">
            <div style="text-align: center;">
                <div>Zoom Level</div>
                <input type="range" id="zoomSlider" min="0" max="22" step="0.01" 
                    value="${map.getZoom()}" style="width: 100%;" 
                    oninput="updateZoom(parseFloat(this.value))" />
            </div>
        </div>`;

    geocoderContainer.appendChild(sliderDialog);
}

function closeZoomDialog() {
    document.getElementById("zoomPopup")?.remove();
    document.getElementById("sliderPopup")?.remove();
}

map.on('zoom', () => {
    const currentZoom = map.getZoom().toFixed(2);
    document.getElementById("zoomInput").value = currentZoom;
    document.getElementById("zoomSlider").value = currentZoom;
});

// Toggle zoom dialog
let isZoomDialogOpen = false;
document.getElementById("zoomButton").addEventListener("click", function () {
    isZoomDialogOpen ? closeZoomDialog() : createZoomDialog();
    isZoomDialogOpen = !isZoomDialogOpen;
});

function updateZoom(newZoom) {
    const clampedZoom = Math.max(0, Math.min(22, newZoom));
    map.setZoom(clampedZoom);
    document.getElementById("zoomInput").value = clampedZoom.toFixed(2);
    document.getElementById("zoomSlider").value = clampedZoom;
}

function zoomIn(step) {
    updateZoom(map.getZoom() + step);
}

function zoomOut(step) {
    updateZoom(map.getZoom() - step);
}

// ============================================================================
// MAIN ZOOM FUNCTION (event listener)
// ============================================================================
