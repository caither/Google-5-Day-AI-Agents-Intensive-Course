# Smart Logistics Dispatch Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a professional, dark-themed, single-page logistics control center web application using HTML, CSS, JavaScript, and Leaflet to simulate real-time route optimization, progressive drawing, smooth truck movement, and reactive marker updates.

**Architecture:** A three-file frontend app (HTML, CSS, JS) using standard Leaflet for mapping. A custom `requestAnimationFrame` animation system interpolates movement coordinates, computes screen-space heading rotation, and progressively draws path lines and updates marker states via DOM manipulation.

**Tech Stack:** HTML5, CSS3, ES6 JavaScript, Leaflet.js (loaded via standard unpkg CDN), OpenStreetMap (CartoDB Voyager Dark tiles).

## Global Constraints
- Chinese Markdown documents are expected to be UTF-8.
- Respect `prefers-reduced-motion` by disabling CSS pulse/halo animations.
- Direct interaction or double-clicking during simulation must not trigger multiple animation loops.
- Do not use TailwindCSS. Use Vanilla CSS.

---

### Task 1: Basic Structure, Leaflet Initialization & Page Layout

**Files:**
- Create: `g:\01DevG\Google-5-Day-AI-Agents-Intensive-Course\day1\my-first-cloud-run\index.html`
- Create: `g:\01DevG\Google-5-Day-AI-Agents-Intensive-Course\day1\my-first-cloud-run\style.css`
- Create: `g:\01DevG\Google-5-Day-AI-Agents-Intensive-Course\day1\my-first-cloud-run\app.js`

**Interfaces:**
- Consumes: None (initial setup)
- Produces: Base HTML layout, standard dark CSS resets, and a basic Leaflet map initialization centering on the warehouse.

- [ ] **Step 1: Create `index.html`**
  Write the core HTML structure. Set up head imports for Leaflet CSS/JS and the local stylesheet. Build the main layout divisions for header, map container, stats panel, and screen-reader announcer.
  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Logistics Dispatch Center</title>
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    <!-- Local CSS -->
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <header class="app-header">
      <div class="header-container">
        <h1>Smart Logistics Dispatch Center</h1>
        <button id="dispatch-btn" aria-label="Dispatch Orders">Dispatch Orders</button>
      </div>
    </header>

    <main class="dashboard-grid">
      <section class="map-section" aria-label="Interactive Delivery Map">
        <div id="map"></div>
      </section>
      
      <section class="control-panel" aria-label="Logistics Statistics">
        <div class="panel-card">
          <h2>Dispatch Panel</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Total Orders</span>
              <span id="total-orders" class="stat-value">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Completed</span>
              <span id="completed-deliveries" class="stat-value">0</span>
            </div>
          </div>

          <div class="progress-section">
            <div class="progress-info">
              <span>Progress</span>
              <span id="progress-percentage">0%</span>
            </div>
            <div class="progress-bar-container">
              <div id="progress-bar" class="progress-bar" style="width: 0%"></div>
            </div>
          </div>

          <div class="status-section">
            <div class="status-item">
              <span class="status-label">Active Order</span>
              <span id="active-order" class="status-value">-</span>
            </div>
            <div class="status-item">
              <span class="status-label">Vehicle Status</span>
              <span id="vehicle-status" class="status-value idle">IDLE</span>
            </div>
          </div>

          <div id="toast-banner" class="toast-banner hidden" role="status" aria-live="polite">
            All deliveries completed
          </div>
        </div>
      </section>
    </main>

    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <!-- Local JS -->
    <script src="app.js"></script>
  </body>
  </html>
  ```

- [ ] **Step 2: Create initial `style.css`**
  Set up the base styling: dark mode variables, page layouts, map height, and placeholder styles.
  ```css
  :root {
    --bg-dark: #0a0f1d;
    --card-bg: rgba(16, 24, 48, 0.85);
    --text-main: #f0f4f9;
    --text-muted: #8a99ad;
    --accent-blue: #2563eb;
    --accent-blue-hover: #3b82f6;
    --accent-green: #10b981;
    --accent-orange: #f59e0b;
    --border-color: rgba(255, 255, 255, 0.1);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--bg-dark);
    color: var(--text-main);
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .app-header {
    background-color: rgba(10, 15, 29, 0.9);
    border-bottom: 1px solid var(--border-color);
    padding: 1rem 2rem;
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .app-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  #dispatch-btn {
    background-color: var(--accent-blue);
    color: #fff;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  #dispatch-btn:hover {
    background-color: var(--accent-blue-hover);
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
  }

  #dispatch-btn:disabled {
    background-color: #374151;
    color: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 350px;
    flex: 1;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    gap: 1rem;
    padding: 1rem;
    height: calc(100vh - 70px);
  }

  .map-section {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    background-color: #0b0f19;
  }

  #map {
    height: 100%;
    width: 100%;
  }

  .control-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .panel-card {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    height: 100%;
  }

  .panel-card h2 {
    font-size: 1.25rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.75rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .stat-item {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
  }

  .stat-label {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
  }

  .progress-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .progress-bar-container {
    background-color: rgba(255, 255, 255, 0.1);
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-bar {
    background-color: var(--accent-green);
    height: 100%;
    width: 0;
    transition: width 0.1s linear;
  }

  .status-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.03);
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .status-label {
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .status-value {
    font-weight: 600;
  }

  .status-value.idle {
    color: var(--text-muted);
  }

  .status-value.dispatching {
    color: var(--accent-orange);
  }

  .status-value.returning {
    color: var(--accent-blue-hover);
  }

  .status-value.completed {
    color: var(--accent-green);
  }

  .toast-banner {
    background-color: rgba(16, 185, 129, 0.2);
    border: 1px solid var(--accent-green);
    color: #a7f3d0;
    padding: 0.75rem;
    border-radius: 6px;
    text-align: center;
    font-weight: 600;
    margin-top: auto;
    transition: opacity 0.3s ease;
  }

  .toast-banner.hidden {
    opacity: 0;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    body {
      overflow-y: auto;
      height: auto;
    }
    
    .dashboard-grid {
      grid-template-columns: 1fr;
      height: auto;
      min-height: calc(100vh - 70px);
    }

    .map-section {
      height: 400px;
    }
  }
  ```

- [ ] **Step 3: Create initial `app.js`**
  Set up the base JavaScript file. Initialize the Leaflet map centered at a default location representing the warehouse. Set up the Voyager Dark tile layer.
  ```javascript
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
  ```

- [ ] **Step 4: Verify the page loads in the browser**
  Ensure files exist, open `index.html` in a web browser, and confirm the map renders with a dark base layer.
  Expected: A dark-themed web page with the header, map container on the left, statistics panel on the right, and Leaflet attribution in the map corner.

- [ ] **Step 5: Commit changes**
  ```bash
  git add index.html style.css app.js
  git commit -m "feat: initialize page layout and dark mode Leaflet map"
  ```

---

### Task 2: CSS Theme Details, Custom Markers & Animations

**Files:**
- Modify: `g:\01DevG\Google-5-Day-AI-Agents-Intensive-Course\day1\my-first-cloud-run\style.css`

**Interfaces:**
- Consumes: Leaflet CSS stylesheet elements
- Produces: CSS classes for custom map markers (`.warehouse-badge`, `.truck-badge`, `.order-badge`, `.order-badge-completed`, `.pulse`, `.success-halo`, `.truck-rotator`).

- [ ] **Step 1: Add custom marker styles to `style.css`**
  Append custom SVG-oriented CSS styling for Leaflet markers. Configure layout, shadows, pulse effects, success halo animations, and support for accessibility motion reduction.
  ```css
  /* Custom Marker Styles */
  .custom-marker {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100% !important;
    height: 100% !important;
  }

  .marker-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
  }

  /* Warehouse style */
  .warehouse-badge {
    background-color: #ffffff;
    border: 2px solid var(--accent-blue);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .warehouse-badge svg {
    width: 20px;
    height: 20px;
    fill: var(--accent-blue);
  }

  /* Truck style */
  .truck-badge {
    background-color: var(--accent-blue);
    border: 2px solid #ffffff;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* This nested container will be rotated, avoiding overwriting Leaflet's outer coordinate translation */
  .truck-rotator {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    transition: transform 0.08s linear;
  }

  .truck-rotator svg {
    width: 18px;
    height: 18px;
    fill: #ffffff;
  }

  /* Order Badge: Pending */
  .order-badge {
    background-color: var(--accent-orange);
    color: #ffffff;
    border: 2px solid #ffffff;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    transition: background-color 0.3s ease, border-color 0.3s ease;
  }

  /* Pulsing Ring for Pending Markers */
  .order-badge::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border: 2px solid var(--accent-orange);
    border-radius: 50%;
    animation: order-pulse 1.8s infinite ease-out;
  }

  @keyframes order-pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(2.2);
      opacity: 0;
    }
  }

  /* Order Badge: Completed */
  .order-badge-completed {
    background-color: var(--accent-green) !important;
    border-color: #ffffff !important;
  }

  .order-badge-completed::after {
    display: none; /* Turn off orange pulse */
  }

  /* Halo effect on completion */
  .success-halo::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border: 3px solid var(--accent-green);
    border-radius: 50%;
    animation: success-burst 0.6s ease-out forwards;
  }

  @keyframes success-burst {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(3);
      opacity: 0;
    }
  }

  /* Custom Polyline Style */
  .route-polyline {
    stroke-dasharray: 6 6;
    animation: dash-flow 20s linear infinite;
  }

  @keyframes dash-flow {
    to {
      stroke-dashoffset: -20px;
    }
  }

  /* Accessibility focus outline and reduced-motion */
  button:focus-visible {
    outline: 3px solid var(--accent-blue-hover);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .order-badge::after,
    .success-halo::before,
    .route-polyline {
      animation: none !important;
    }
  }
  ```

- [ ] **Step 2: Commit CSS updates**
  ```bash
  git add style.css
  git commit -m "style: add custom markers, pulsing keyframes, and accessibility styling"
  ```

---

### Task 3: Algorithmic Routing, Marker Generation, and State Setup

**Files:**
- Modify: `app.js`

**Interfaces:**
- Consumes: Leaflet map object
- Produces: `orders` array, Nearest Neighbor routing function `solveNearestNeighbor`, custom SVGs for warehouse, order numbers, and truck, and the reset function `resetState`.

- [ ] **Step 1: Replace `app.js` with State, Marker Generation, and Routing code**
  Implement the structure for state management, SVG icon definitions, Nearest Neighbor sorting, random orders generator, map rendering, and reset logic.
  ```javascript
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
  ```

- [ ] **Step 2: Add trigger click event in `app.js` for "Dispatch Orders"**
  Add key logic to prepare coordinate paths, compute total path details, disable the button, zoom to fit all markers, and start the animation setup.
  ```javascript
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
          <div class="order-badge" id="order-badge-${index}">
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
  ```

- [ ] **Step 3: Verify basic generation**
  Open `index.html` in browser. Click `Dispatch Orders`.
  Expected: Button disables, vehicle status changes to "PREPARING", exactly 20 numbered orange badges appear on the map surrounding the warehouse, the map auto-fits bounds, and a blue dotted route polyline starts at the warehouse.

- [ ] **Step 4: Commit state files**
  ```bash
  git add app.js
  git commit -m "feat: add NN algorithm, random generation, and custom SVGs to JS state"
  ```

---

### Task 4: Progressive Animation Loop & State Management

**Files:**
- Modify: `app.js`

**Interfaces:**
- Consumes: `appState`, `requestAnimationFrame` API
- Produces: Movement interpolation logic `startDispatchSimulation`, coordinate segment computation, Heading/Rotation formula, progressive polyline addition, and reset/completion handling.

- [ ] **Step 1: Add Animation Loop and Rotation Math**
  Append the logic to smoothly update the truck marker, compute rotation angles in screen coords, progressively update the route path, and trigger delivery checkmarks when crossed.
  ```javascript
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
      const badge = document.getElementById(`order-badge-${index}`);
      const wrapper = document.getElementById(`order-wrapper-${index}`);
      if (badge && !badge.classList.contains('order-badge-completed')) {
        badge.classList.add('order-badge-completed');
        badge.innerHTML = SVG_CHECK;
        
        wrapper.classList.add('success-halo');
        // Remove halo animation class after completion to save GPU
        setTimeout(() => {
          wrapper.classList.remove('success-halo');
        }, 600);

        appState.completedCount += 1;
        document.getElementById('completed-deliveries').textContent = appState.completedCount;
        announceState(`Order #${String(index + 1).padStart(2, '0')} delivered.`);
      }
    }

    // Triggered at 100% traversal
    function finalizeSimulation() {
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
      dispatchBtn.disabled = false;
    }

    appState.animationFrameId = requestAnimationFrame(animationStep);
  }
  ```

- [ ] **Step 2: Verify animation flow**
  Refresh browser and trigger `Dispatch Orders`.
  Expected:
  - Truck leaves warehouse and moves smoothly along the dotted blue path.
  - Truck rotates facing forward along the segments.
  - The dotted blue line draws progressively along the truck coordinates.
  - Reaching each numbered marker changes it to a green circle containing a white checkmark, accompanied by a 600ms halo burst.
  - Panel statistics updates correctly.
  - Truck returns to warehouse. The screen displays the banner "All deliveries completed", progress reaches 100%, and the action button becomes "Dispatch Again" and is clickable.

- [ ] **Step 3: Verify reset flow**
  Click the "Dispatch Again" button.
  Expected:
  - All old markers, line paths, and statistics clear.
  - Exactly 20 new randomly situated order markers generate on map.
  - Truck starts movement smoothly on the new layout.

- [ ] **Step 4: Commit final animation implementation**
  ```bash
  git add app.js
  git commit -m "feat: implement requestAnimationFrame interpolation, truck rotation, dynamic polyline, and clean resets"
  ```
