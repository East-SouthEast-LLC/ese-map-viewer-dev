
const bookmarkButton = document.getElementById('bookmarkButton');
const bookmarkBox = document.getElementById('bookmark-box');

if (!bookmarkButton || !bookmarkBox) {
    return;
} else {
    function getBookmarks() {
        return JSON.parse(localStorage.getItem('eseMapBookmarks')) || [];
    }

    function saveBookmarks(bookmarks) {
        localStorage.setItem('eseMapBookmarks', JSON.stringify(bookmarks));
    }

    function renderBookmarks() {
        const bookmarks = getBookmarks();
        const list = document.getElementById('bookmark-list');
        if (!list) return;

        list.innerHTML = '';
        bookmarks.forEach((bookmark, index) => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = bookmark.url;
            link.textContent = bookmark.name;
            
            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-bookmark';
            deleteBtn.textContent = '×';
            deleteBtn.title = 'Delete bookmark';
            deleteBtn.onclick = () => deleteBookmark(index);

            li.appendChild(link);
li.appendChild(deleteBtn);
            list.appendChild(li);
        });
    }

    function saveCurrentView() {
        const nameInput = document.getElementById('bookmarkNameInput');
        const bookmarkName = nameInput.value.trim();

        if (!bookmarkName) {
            alert('Please enter a name for the bookmark.');
            return;
        }

        const markerCoords = window.marker ? window.marker.getLngLat() : map.getCenter();
        const zoomLevel = map.getZoom();
        const visibleLayers = listVisibleLayers(map, window.toggleableLayerIds.filter(id => id !== 'tools'));
        
        // This now correctly calls the single, global function
        const shareUrl = generateShareLink(map, zoomLevel, {lat: markerCoords.lat, lng: markerCoords.lng}, visibleLayers);

        const bookmarks = getBookmarks();
        bookmarks.push({ name: bookmarkName, url: shareUrl });
        saveBookmarks(bookmarks);
        
        nameInput.value = '';
        renderBookmarks();
    }

    function deleteBookmark(index) {
        if (confirm('Are you sure you want to delete this bookmark?')) {
            const bookmarks = getBookmarks();
            bookmarks.splice(index, 1);
            saveBookmarks(bookmarks);
            renderBookmarks();
        }
    }

    bookmarkButton.addEventListener('click', () => {
        const isVisible = bookmarkBox.style.display === 'block';
        bookmarkBox.style.display = isVisible ? 'none' : 'block';
        bookmarkButton.classList.toggle('active', !isVisible);

        if (!isVisible) {
            bookmarkBox.innerHTML = `
                <strong style="display:block; text-align:center; margin-bottom:10px;">Saved Views</strong>
                <ul id="bookmark-list"></ul>
                <hr style="margin: 10px 0;">
                <input type="text" id="bookmarkNameInput" placeholder="Enter name for current view">
                <button id="saveBookmarkButton">Save Current View</button>
            `;
            renderBookmarks();
            document.getElementById('saveBookmarkButton').addEventListener('click', saveCurrentView);
        }
    });
};