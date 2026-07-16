// Application State
let appState = {
  dispatchState: 'idle', // idle, generating, dispatching, returning, completed, resetting
  animationFrameId: null,
  orders: [],            // List of generated orders
  route: [],             // Planned route coordinate nodes
  segmentDistances: [],  // Distance of each segment in meters
  cumulativeDistances: [], // Cumulative distance along path in meters
  totalRouteLength: 0,   // Total route length in meters
  completedCount: 0,
  truckMarker: null,
  warehouseMarker: null,
  routePolyline: null,
  orderMarkers: []       // Leaflet markers representing orders
};

const WAREHOUSE_COORDS = [25.0478, 121.5170];

// SVG Markup Templates
const SVG_WAREHOUSE = `<svg viewBox="0 0 24 24"><path d="M4 20h16v-8H4v8zm2-6h4v4H6v-4zm6 0h4v4h-4v-4zM2 9.5l10-7.5 10 7.5V21a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9.5z"/></svg>`;
const SVG_TRUCK = `<svg viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1-5.5h-3V9h3v4z"/></svg>`;
const SVG_CHECK = `<svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: white;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;

// Initialize Map
const map = L.map('map', {
  center: WAREHOUSE_COORDS,
  zoom: 14,
  zoomControl: true
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20
}).addTo(map);

// Initialize Warehouse Marker
const warehouseIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="warehouse-badge">${SVG_WAREHOUSE}</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});
appState.warehouseMarker = L.marker(WAREHOUSE_COORDS, { icon: warehouseIcon }).addTo(map);

// Initialize Truck Marker (parked at warehouse)
const truckIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="marker-wrapper"><div class="truck-badge"><div class="truck-rotator" id="truck-rotator">${SVG_TRUCK}</div></div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});
appState.truckMarker = L.marker(WAREHOUSE_COORDS, { icon: truckIcon }).addTo(map);

// Helper: Geodesic Distance in meters using Haversine Formula
function getDistance(coord1, coord2) {
  const R = 6371000; // Earth radius in meters
  const lat1 = coord1[0] * Math.PI / 180;
  const lat2 = coord2[0] * Math.PI / 180;
  const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
  const dLng = (coord2[1] - coord1[1]) * Math.PI / 180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Generate 20 random order coordinates within ~1.5km of the warehouse
function generateOrders() {
  const orders = [];
  const radius = 0.015; // Roughly 1.5km in degrees lat/lng
  for (let i = 1; i <= 20; i++) {
    // Avoid clustered points, distribute using simple polar translation
    const angle = Math.random() * Math.PI * 2;
    const dist = (0.2 + Math.random() * 0.8) * radius;
    const lat = WAREHOUSE_COORDS[0] + dist * Math.sin(angle);
    const lng = WAREHOUSE_COORDS[1] + dist * Math.cos(angle);
    const id = String(i).padStart(2, '0');
    orders.push({
      id: `#${id}`,
      coords: [lat, lng],
      completed: false,
      cumulativeDistance: 0 // Will populate during route calculation
    });
  }
  return orders;
}

// Solve Nearest Neighbor path
function solveNearestNeighbor(orders) {
  const unvisited = [...orders];
  const path = [];
  let currentPos = WAREHOUSE_COORDS;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const d = getDistance(currentPos, unvisited[i].coords);
      if (d < minDistance) {
        minDistance = d;
        nearestIndex = i;
      }
    }

    const nextNode = unvisited.splice(nearestIndex, 1)[0];
    path.push(nextNode);
    currentPos = nextNode.coords;
  }

  return path;
}

// UI Announcer for screen readers
function announceState(message) {
  const toast = document.getElementById('toast-banner');
  toast.textContent = message;
  toast.setAttribute('aria-live', 'polite');
}

// Clear Map Objects & Panel Details
function resetState() {
  if (appState.animationFrameId !== null) {
    cancelAnimationFrame(appState.animationFrameId);
    appState.animationFrameId = null;
  }

  // Reset markers
  appState.orderMarkers.forEach(m => map.removeLayer(m));
  appState.orderMarkers = [];
  
  if (appState.routePolyline) {
    map.removeLayer(appState.routePolyline);
    appState.routePolyline = null;
  }

  // Park truck
  if (appState.truckMarker) {
    appState.truckMarker.setLatLng(WAREHOUSE_COORDS);
    const truckElement = document.getElementById('truck-rotator');
    if (truckElement) {
      truckElement.style.transform = 'rotate(0deg)';
    }
  }

  // Reset variables
  appState.orders = [];
  appState.route = [];
  appState.segmentDistances = [];
  appState.cumulativeDistances = [];
  appState.totalRouteLength = 0;
  appState.completedCount = 0;
  appState.dispatchState = 'idle';

  // Reset Panel
  document.getElementById('total-orders').textContent = '0';
  document.getElementById('completed-deliveries').textContent = '0';
  document.getElementById('progress-percentage').textContent = '0%';
  document.getElementById('progress-bar').style.width = '0%';
  document.getElementById('active-order').textContent = '-';
  
  const statusVal = document.getElementById('vehicle-status');
  statusVal.textContent = 'IDLE';
  statusVal.className = 'status-value idle';

  const toast = document.getElementById('toast-banner');
  toast.classList.add('hidden');

  const dispatchBtn = document.getElementById('dispatch-btn');
  dispatchBtn.textContent = 'Dispatch Orders';
  dispatchBtn.disabled = false;
}

// Set up button triggers
document.getElementById('dispatch-btn').addEventListener('click', () => {
  if (appState.dispatchState !== 'idle' && appState.dispatchState !== 'completed') return;

  // Reset if we are running again
  resetState();
  
  appState.dispatchState = 'generating';
  const dispatchBtn = document.getElementById('dispatch-btn');
  dispatchBtn.disabled = true;
  
  const vehicleStatus = document.getElementById('vehicle-status');
  vehicleStatus.textContent = 'PREPARING';
  vehicleStatus.className = 'status-value dispatching';

  // 1. Generate Orders
  appState.orders = generateOrders();
  document.getElementById('total-orders').textContent = appState.orders.length;

  // 2. Solve Nearest Neighbor Path
  const sortedRoute = solveNearestNeighbor(appState.orders);

  // 3. Construct Complete Node List: Warehouse -> Orders... -> Warehouse
  appState.route = [
    { id: 'Warehouse', coords: WAREHOUSE_COORDS },
    ...sortedRoute,
    { id: 'Warehouse', coords: WAREHOUSE_COORDS }
  ];

  // 4. Calculate Distance Matrix
  appState.segmentDistances = [];
  appState.cumulativeDistances = [0];
  let totalLength = 0;

  for (let i = 0; i < appState.route.length - 1; i++) {
    const dist = getDistance(appState.route[i].coords, appState.route[i+1].coords);
    appState.segmentDistances.push(dist);
    totalLength += dist;
    appState.cumulativeDistances.push(totalLength);
  }
  appState.totalRouteLength = totalLength;

  // Match order indices to cumulative distance traveled to hit them
  for (let i = 0; i < sortedRoute.length; i++) {
    // index in sortedRoute matches (i+1) index in appState.route
    sortedRoute[i].cumulativeDistance = appState.cumulativeDistances[i + 1];
  }

  // 5. Draw Pending Order Markers on Map
  const bounds = L.latLngBounds([WAREHOUSE_COORDS]);
  
  sortedRoute.forEach((order, index) => {
    bounds.extend(order.coords);
    const markerHtml = `
      <div class="marker-wrapper" id="order-wrapper-${index}">
        <div class="order-badge pulse" id="order-badge-${index}">
          #${String(index + 1).padStart(2, '0')}
        </div>
      </div>
    `;
    const orderIcon = L.divIcon({
      className: 'custom-marker',
      html: markerHtml,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const m = L.marker(order.coords, { icon: orderIcon }).addTo(map);
    appState.orderMarkers.push(m);
  });

  // Fit View to show all coordinates
  map.fitBounds(bounds, { padding: [50, 50] });

  // Initialize progressive route line
  appState.routePolyline = L.polyline([WAREHOUSE_COORDS], {
    color: '#3b82f6',
    weight: 4,
    opacity: 0.8,
    className: 'route-polyline'
  }).addTo(map);

  // 6. Start simulation loop after map view has adjusted
  setTimeout(() => {
    startDispatchSimulation();
  }, 800);
});

// Animation simulation placeholder (to be implemented in Task 4)
function startDispatchSimulation() {
  console.log("startDispatchSimulation: simulation started (stub function).");
}
