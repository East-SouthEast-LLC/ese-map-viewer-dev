// shared helper functions
function getFrameCoordinates(map) {
    const bounds = map.getBounds();
    const mapContainer = map.getContainer();
    const mapWidth = mapContainer.clientWidth;
    const mapHeight = mapContainer.clientHeight;

    const positions = {
        upperRight: { x: mapWidth, y: 0 },
        middle: { x: mapWidth / 2, y: mapHeight / 2 },
        lowerLeft: { x: 0, y: mapHeight }
    };

    const coordinates = {
        upperRight: map.unproject([positions.upperRight.x, positions.upperRight.y]),
        middle: map.unproject([positions.middle.x, positions.middle.y]),
        lowerLeft: map.unproject([positions.lowerLeft.x, positions.lowerLeft.y])
    };

    return coordinates;
}
