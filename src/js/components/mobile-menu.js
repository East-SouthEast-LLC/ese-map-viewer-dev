// docs/control-mobile-menu.js

const hamburgerButton = document.getElementById('hamburger-button');
const menu = document.getElementById('menu');
const mapContainer = document.getElementById('map');

if (!hamburgerButton || !menu) {
    return;
} else {
    hamburgerButton.addEventListener('click', () => {
        // toggle the 'open' class on the menu
        menu.classList.toggle('open');
    });

    // close the menu if the user clicks on the map
    mapContainer.addEventListener('click', () => {
        if (menu.classList.contains('open')) {
            menu.classList.remove('open');
        }
    });
};