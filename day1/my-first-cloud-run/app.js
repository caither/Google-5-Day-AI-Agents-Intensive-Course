// Application config & initialization
const WAREHOUSE_COORDS = [25.0478, 121.5170]; // Taipei Main Station coordinate as warehouse center

// Initialize Map
const map = L.map('map', {
  center: WAREHOUSE_COORDS,
  zoom: 14,
  zoomControl: true
});

// Use CartoDB Voyager Dark tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20
}).addTo(map);

console.log("Map initialized successfully");
