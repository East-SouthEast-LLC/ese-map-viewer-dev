// docs/control-bookmarks.js

document.addEventListener('DOMContentLoaded', () => {
    const bookmarkButton = document.getElementById('bookmarkButton');
    const bookmarkBox = document.getElementById('bookmark-box');

    if (!bookmarkButton || !bookmarkBox) return;

    // Function to get bookmarks from localStorage
    function getBookmarks() {
        return JSON.parse(localStorage.getItem('eseMapBookmarks')) || [];
    }

    // Function to save bookmarks to localStorage
    function saveBookmarks(bookmarks) {
        localStorage.setItem('eseMapBookmarks', JSON.stringify(bookmarks));
    }

    // Function to render the list of saved bookmarks
    function renderBookmarks() {
        const bookmarks = getBookmarks();
        const list = document.getElementById('bookmark-list');
        if (!list) return;

        list.innerHTML = ''; // Clear existing list
        bookmarks.forEach((bookmark, index) => {
            const li = document.createElement('li');
            
            // Create a link to load the bookmark
            const link = document.createElement('a');
            link.href = bookmark.url;
            link.textContent = bookmark.name;
            
            // Create a delete button
            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-bookmark';
            deleteBtn.textContent = '×';
            deleteBtn.title = 'Delete bookmark';
            deleteBtn.onclick = () => {
                deleteBookmark(index);
            };

            li.appendChild(link);
            li.appendChild(deleteBtn);
            list.appendChild(li);
        });
    }

    // Function to handle saving the current view
    function saveCurrentView() {
        const nameInput = document.getElementById('bookmarkNameInput');
        const bookmarkName = nameInput.value.trim();

        if (!bookmarkName) {
            alert('Please enter a name for the bookmark.');
            return;
        }

        // Use the existing share function to generate the URL
        const markerCoords = window.marker ? window.marker.getLngLat() : map.getCenter();
        const zoomLevel = map.getZoom();
        const visibleLayers = listVisibleLayers(map, window.toggleableLayerIds.filter(id => id !== 'tools'));
        const shareUrl = generateShareLink(map, zoomLevel, {lat: markerCoords.lat, lng: markerCoords.lng}, visibleLayers);

        const bookmarks = getBookmarks();
        bookmarks.push({ name: bookmarkName, url: shareUrl });
        saveBookmarks(bookmarks);
        
        nameInput.value = ''; // Clear input
        renderBookmarks(); // Re-render the list
    }

    // Function to delete a bookmark by its index
    function deleteBookmark(index) {
        if (confirm('Are you sure you want to delete this bookmark?')) {
            const bookmarks = getBookmarks();
            bookmarks.splice(index, 1);
            saveBookmarks(bookmarks);
            renderBookmarks();
        }
    }

    // Main event listener to toggle the bookmark panel
    bookmarkButton.addEventListener('click', () => {
        const isVisible = bookmarkBox.style.display === 'block';
        bookmarkBox.style.display = isVisible ? 'none' : 'block';
        bookmarkButton.classList.toggle('active', !isVisible);

        if (!isVisible) {
            // Populate the box with its HTML content and render bookmarks
            bookmarkBox.innerHTML = `
                <strong style="display:block; text-align:center; margin-bottom:10px;">Saved Views</strong>
                <ul id="bookmark-list"></ul>
                <hr style="margin: 10px 0;">
                <input type="text" id="bookmarkNameInput" placeholder="Enter name for current view">
                <button id="saveBookmarkButton">Save Current View</button>
            `;
            renderBookmarks();
            // Attach event listener to the save button
            document.getElementById('saveBookmarkButton').addEventListener('click', saveCurrentView);
        }
    });
});

// We need a slightly modified generateShareLink function for this context
// This should be available from control-share.js, but we redefine it here to be safe and explicit
function generateShareLink(map, zoomLevel, coords, layerIds) {
    const baseUrl = window.eseMapBaseUrl || (window.location.origin + window.location.pathname);
    let encodedLayerIds = layerIds.map(layerId => encodeURIComponent(layerId));
    return `${baseUrl}?zoom=${zoomLevel}&lat=${coords.lat}&lng=${coords.lng}&layers=${encodedLayerIds.join(',')}`;
}