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
  routeCasingPolyline: null,
  orderMarkers: [],      // Leaflet markers representing orders
  timeouts: []           // Active timeout IDs for clearing on reset
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

// Use ESRI World Imagery tile layer
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  maxZoom: 18
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

// Generate 20 random order coordinates within ~1.5km of the warehouse with spacing constraints
function generateOrders() {
  const orders = [];
  const maxRadiusDeg = 0.015; // ~1.5km
  let minWarehouseDist = 300; // 300 meters
  let minOrderDist = 150;     // 150 meters
  
  let attempts = 0;
  const maxAttempts = 2000;
  
  while (orders.length < 20 && attempts < maxAttempts) {
    attempts++;
    
    // Generate candidate around warehouse
    const angle = Math.random() * Math.PI * 2;
    const distDeg = (0.1 + Math.random() * 0.9) * maxRadiusDeg;
    const lat = WAREHOUSE_COORDS[0] + distDeg * Math.sin(angle);
    const lng = WAREHOUSE_COORDS[1] + distDeg * Math.cos(angle);
    const coords = [lat, lng];
    
    // Check distance to warehouse
    const distToWarehouse = getDistance(coords, WAREHOUSE_COORDS);
    if (distToWarehouse < minWarehouseDist) {
      if (attempts > 800) {
        minWarehouseDist = Math.max(100, minWarehouseDist - 10);
      }
      continue;
    }
    
    // Check distance to other existing orders
    let tooClose = false;
    for (const order of orders) {
      const d = getDistance(coords, order.coords);
      if (d < minOrderDist) {
        tooClose = true;
        break;
      }
    }
    
    if (tooClose) {
      if (attempts > 800) {
        minOrderDist = Math.max(50, minOrderDist - 5);
      }
      continue;
    }
    
    const id = String(orders.length + 1).padStart(2, '0');
    orders.push({
      id: `#${id}`,
      coords: coords,
      completed: false,
      cumulativeDistance: 0
    });
  }
  
  // Fallback: fill remaining if retry limit reached
  while (orders.length < 20) {
    const angle = Math.random() * Math.PI * 2;
    const distDeg = (0.2 + Math.random() * 0.8) * maxRadiusDeg;
    const lat = WAREHOUSE_COORDS[0] + distDeg * Math.sin(angle);
    const lng = WAREHOUSE_COORDS[1] + distDeg * Math.cos(angle);
    const id = String(orders.length + 1).padStart(2, '0');
    orders.push({
      id: `#${id}`,
      coords: [lat, lng],
      completed: false,
      cumulativeDistance: 0
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

  // Clear all pending timeouts
  if (appState.timeouts) {
    appState.timeouts.forEach(t => clearTimeout(t));
    appState.timeouts = [];
  }

  // Reset markers
  appState.orderMarkers.forEach(m => map.removeLayer(m));
  appState.orderMarkers = [];
  
  if (appState.routePolyline) {
    map.removeLayer(appState.routePolyline);
    appState.routePolyline = null;
  }
  if (appState.routeCasingPolyline) {
    map.removeLayer(appState.routeCasingPolyline);
    appState.routeCasingPolyline = null;
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
  dispatchBtn.setAttribute('aria-label', 'Dispatch Orders');
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
  dispatchBtn.setAttribute('aria-label', 'Dispatching Orders');
  
  const vehicleStatus = document.getElementById('vehicle-status');
  vehicleStatus.textContent = 'PREPARING';
  vehicleStatus.className = 'status-value dispatching';

  // 1. Generate Orders
  appState.orders = generateOrders();
  document.getElementById('total-orders').textContent = appState.orders.length;

  // 2. Solve Nearest Neighbor Path
  const sortedRoute = solveNearestNeighbor(appState.orders);

  // Re-synchronize the id field of the sorted orders to match their sequential visit index
  sortedRoute.forEach((order, index) => {
    order.id = `#${String(index + 1).padStart(2, '0')}`;
  });

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

  // Initialize progressive route lines
  appState.routeCasingPolyline = L.polyline([WAREHOUSE_COORDS], {
    color: '#ffffff',
    weight: 7,
    opacity: 0.9,
    className: 'route-casing-polyline'
  }).addTo(map);

  appState.routePolyline = L.polyline([WAREHOUSE_COORDS], {
    color: '#2563eb',
    weight: 4,
    opacity: 1,
    className: 'route-polyline'
  }).addTo(map);

  // 6. Start simulation loop after map view has adjusted
  const startTimeout = setTimeout(() => {
    startDispatchSimulation();
  }, 800);
  appState.timeouts.push(startTimeout);
});

function startDispatchSimulation() {
  appState.dispatchState = 'dispatching';
  
  const vehicleStatus = document.getElementById('vehicle-status');
  vehicleStatus.textContent = 'DISPATCHING';
  vehicleStatus.className = 'status-value dispatching';

  const duration = 5000; // Animation duration in milliseconds
  let startTime = null;
  let nextOrderIndex = 0; // Index in the sorted route list

  // Extract sorted orders for distance matching
  const sortedOrders = appState.route.slice(1, appState.route.length - 1);

  function animationStep(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progressRatio = Math.min(elapsed / duration, 1);
    const currentDistance = progressRatio * appState.totalRouteLength;

    // 1. Locate current coordinate segment
    let segmentIndex = 0;
    for (let i = 0; i < appState.segmentDistances.length; i++) {
      if (currentDistance <= appState.cumulativeDistances[i + 1]) {
        segmentIndex = i;
        break;
      }
      segmentIndex = i;
    }

    // 2. Interpolate position within segment
    const segStartDist = appState.cumulativeDistances[segmentIndex];
    const segEndDist = appState.cumulativeDistances[segmentIndex + 1];
    const segLength = appState.segmentDistances[segmentIndex];
    
    let segRatio = 0;
    if (segLength > 0) {
      segRatio = (currentDistance - segStartDist) / segLength;
    }
    segRatio = Math.max(0, Math.min(1, segRatio));

    const fromNode = appState.route[segmentIndex].coords;
    const toNode = appState.route[segmentIndex + 1].coords;

    const lat = fromNode[0] + (toNode[0] - fromNode[0]) * segRatio;
    const lng = fromNode[1] + (toNode[1] - fromNode[1]) * segRatio;
    const currentLatLng = L.latLng(lat, lng);

    // Update Truck Coordinate
    appState.truckMarker.setLatLng(currentLatLng);

    // Update active order label in the panel
    if (segmentIndex < appState.route.length - 2) {
      document.getElementById('active-order').textContent = appState.route[segmentIndex + 1].id;
    } else {
      document.getElementById('active-order').textContent = 'Warehouse';
      if (appState.dispatchState !== 'returning') {
        appState.dispatchState = 'returning';
        vehicleStatus.textContent = 'RETURNING';
        vehicleStatus.className = 'status-value returning';
      }
    }

    // Update general progress bar
    const progressPct = Math.round(progressRatio * 100);
    document.getElementById('progress-percentage').textContent = `${progressPct}%`;
    document.getElementById('progress-bar').style.width = `${progressPct}%`;

    // 3. Compute screen space truck rotation
    const fromPoint = map.latLngToLayerPoint(L.latLng(fromNode));
    const toPoint = map.latLngToLayerPoint(L.latLng(toNode));
    const rotationAngle = Math.atan2(
      toPoint.y - fromPoint.y,
      toPoint.x - fromPoint.x
    ) * 180 / Math.PI;

    const truckRotator = document.getElementById('truck-rotator');
    if (truckRotator) {
      // SVG icon default orientation is facing right, so no offset is needed.
      // We override only the inner rotator wrapper styles
      truckRotator.style.transform = `rotate(${rotationAngle}deg)`;
    }

    // 4. Update Progressive Polyline (traversed nodes + active position)
    const traversedCoords = appState.route.slice(0, segmentIndex + 1).map(n => n.coords);
    traversedCoords.push([lat, lng]);
    appState.routeCasingPolyline.setLatLngs(traversedCoords);
    appState.routePolyline.setLatLngs(traversedCoords);

    // 5. Update completed markers (using loop to handle skipped frames)
    while (
      nextOrderIndex < sortedOrders.length &&
      currentDistance >= sortedOrders[nextOrderIndex].cumulativeDistance
    ) {
      completeOrder(nextOrderIndex);
      nextOrderIndex += 1;
    }

    // 6. Continue loop or finalize
    if (progressRatio < 1) {
      appState.animationFrameId = requestAnimationFrame(animationStep);
    } else {
      // Complete remaining orders if frame skipped
      while (nextOrderIndex < sortedOrders.length) {
        completeOrder(nextOrderIndex);
        nextOrderIndex += 1;
      }
      finalizeSimulation();
    }
  }

  // Function to set marker completed state (green + checkmark SVG)
  function completeOrder(index) {
    const order = sortedOrders[index];
    if (order && !order.completed) {
      order.completed = true;

      const badge = document.getElementById(`order-badge-${index}`);
      const wrapper = document.getElementById(`order-wrapper-${index}`);
      
      if (badge) {
        badge.classList.add('order-badge-completed');
        badge.innerHTML = SVG_CHECK;
      }
      
      if (wrapper) {
        wrapper.classList.add('success-halo');
        // Remove halo animation class after completion to save GPU
        const tId = setTimeout(() => {
          wrapper.classList.remove('success-halo');
        }, 600);
        appState.timeouts.push(tId);
      }

      appState.completedCount += 1;
      document.getElementById('completed-deliveries').textContent = appState.completedCount;
      announceState(`Order #${String(index + 1).padStart(2, '0')} delivered.`);
    }
  }

  // Triggered at 100% traversal
  function finalizeSimulation() {
    appState.animationFrameId = null;
    appState.dispatchState = 'completed';
    
    const vehicleStatus = document.getElementById('vehicle-status');
    vehicleStatus.textContent = 'COMPLETED';
    vehicleStatus.className = 'status-value completed';

    document.getElementById('active-order').textContent = 'Warehouse';
    
    // Rotate truck back to default
    const truckRotator = document.getElementById('truck-rotator');
    if (truckRotator) {
      truckRotator.style.transform = 'rotate(0deg)';
    }

    // Show completion toast
    const toast = document.getElementById('toast-banner');
    toast.classList.remove('hidden');
    announceState("All deliveries completed");

    // Enable Re-Dispatch Button
    const dispatchBtn = document.getElementById('dispatch-btn');
    dispatchBtn.textContent = 'Dispatch Again';
    dispatchBtn.setAttribute('aria-label', 'Dispatch Again');
    dispatchBtn.disabled = false;
  }

  appState.animationFrameId = requestAnimationFrame(animationStep);
}

// Handle window resizing to invalidate map size
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    map.invalidateSize();
  }, 100);
});
