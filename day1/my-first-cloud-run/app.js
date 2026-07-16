const WAREHOUSE_COORDS = [25.0478, 121.5170];
const ORDER_COUNT = 20;
const ANIMATION_DURATION = 12000;
const ROUTING_TIMEOUT = 10000;
const MAX_ROUTING_ATTEMPTS = 3;
const MAX_SNAP_DISTANCE = 250;
const OSRM_BASE_URL = 'https://router.project-osrm.org';

const CITY_LABELS = {
  taipei: 'Taipei',
  newTaipei: 'New Taipei',
  keelung: 'Keelung'
};

const CITY_WEIGHTS = [
  { city: 'taipei', weight: 0.40 },
  { city: 'newTaipei', weight: 0.45 },
  { city: 'keelung', weight: 0.15 }
];

// Urban demonstration boxes deliberately avoid broad mountain and sea areas.
const CITY_ZONES = {
  taipei: [
    { minLat: 25.025, maxLat: 25.075, minLng: 121.500, maxLng: 121.580 },
    { minLat: 25.075, maxLat: 25.125, minLng: 121.500, maxLng: 121.565 },
    { minLat: 25.025, maxLat: 25.075, minLng: 121.565, maxLng: 121.625 }
  ],
  newTaipei: [
    { minLat: 24.965, maxLat: 25.030, minLng: 121.410, maxLng: 121.480 },
    { minLat: 25.025, maxLat: 25.100, minLng: 121.415, maxLng: 121.505 },
    { minLat: 24.965, maxLat: 25.025, minLng: 121.485, maxLng: 121.555 },
    { minLat: 25.055, maxLat: 25.085, minLng: 121.625, maxLng: 121.690 }
  ],
  keelung: [
    { minLat: 25.118, maxLat: 25.142, minLng: 121.710, maxLng: 121.755 },
    { minLat: 25.120, maxLat: 25.145, minLng: 121.755, maxLng: 121.790 }
  ]
};

// Known urban road-side coordinates used only if the public routing service fails.
const FALLBACK_ROAD_POINTS = {
  taipei: [
    [25.0339, 121.5645], [25.0418, 121.5516], [25.0520, 121.5438], [25.0629, 121.5265],
    [25.0716, 121.5200], [25.0847, 121.5250], [25.0286, 121.5365], [25.0554, 121.6020]
  ],
  newTaipei: [
    [25.0122, 121.4655], [25.0018, 121.4562], [25.0357, 121.4500], [25.0614, 121.4881],
    [25.0804, 121.4808], [25.0084, 121.5152], [24.9826, 121.5415], [25.0682, 121.6620],
    [25.0238, 121.4255]
  ],
  keelung: [
    [25.1283, 121.7419], [25.1318, 121.7446], [25.1260, 121.7615]
  ]
};

const SVG_WAREHOUSE = `<svg viewBox="0 0 24 24"><path d="M4 20h16v-8H4v8zm2-6h4v4H6v-4zm6 0h4v4h-4v-4zM2 9.5l10-7.5 10 7.5V21a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9.5z"/></svg>`;
const SVG_TRUCK = `<svg viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1-5.5h-3V9h3v4z"/></svg>`;
const SVG_CHECK = `<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;

const appState = {
  dispatchState: 'idle',
  animationFrameId: null,
  abortController: null,
  runId: 0,
  orders: [],
  routePoints: [],
  segmentDistances: [],
  cumulativeDistances: [],
  totalRouteLength: 0,
  completedCount: 0,
  truckMarker: null,
  warehouseMarker: null,
  routePolyline: null,
  routeCasingPolyline: null,
  orderMarkers: [],
  timeouts: [],
  isFallback: false
};

const map = L.map('map', { center: WAREHOUSE_COORDS, zoom: 14, zoomControl: true });
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  maxZoom: 18
}).addTo(map);

const warehouseIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="warehouse-badge">${SVG_WAREHOUSE}</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});
appState.warehouseMarker = L.marker(WAREHOUSE_COORDS, { icon: warehouseIcon }).addTo(map);

const truckIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="marker-wrapper"><div class="truck-badge"><div class="truck-rotator" id="truck-rotator">${SVG_TRUCK}</div></div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});
appState.truckMarker = L.marker(WAREHOUSE_COORDS, { icon: truckIcon, zIndexOffset: 1000 }).addTo(map);

function getDistance(a, b) {
  const radius = 6371000;
  const lat1 = a[0] * Math.PI / 180;
  const lat2 = b[0] * Math.PI / 180;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function chooseWeightedCity() {
  const roll = Math.random();
  let cumulative = 0;
  for (const entry of CITY_WEIGHTS) {
    cumulative += entry.weight;
    if (roll <= cumulative) return entry.city;
  }
  return 'keelung';
}

function createCityAssignments() {
  const assignments = ['taipei', 'newTaipei', 'keelung'];
  while (assignments.length < ORDER_COUNT) assignments.push(chooseWeightedCity());
  return assignments.sort(() => Math.random() - 0.5);
}

function randomPointInCity(city) {
  const zones = CITY_ZONES[city];
  const zone = zones[Math.floor(Math.random() * zones.length)];
  return [
    zone.minLat + Math.random() * (zone.maxLat - zone.minLat),
    zone.minLng + Math.random() * (zone.maxLng - zone.minLng)
  ];
}

function generateCandidates() {
  return createCityAssignments().map((city, index) => ({
    sourceIndex: index + 1,
    city,
    coords: randomPointInCity(city),
    completed: false
  }));
}

function buildOsrmUrl(candidates) {
  const coordinates = [WAREHOUSE_COORDS, ...candidates.map(order => order.coords)]
    .map(([lat, lng]) => `${lng.toFixed(6)},${lat.toFixed(6)}`)
    .join(';');
  const query = new URLSearchParams({
    roundtrip: 'true',
    source: 'first',
    steps: 'true',
    geometries: 'geojson',
    overview: 'full'
  });
  return `${OSRM_BASE_URL}/trip/v1/driving/${coordinates}?${query}`;
}

async function fetchRoadRoute(candidates, signal) {
  const response = await fetch(buildOsrmUrl(candidates), { signal });
  if (!response.ok) throw new Error(`OSRM HTTP ${response.status}`);
  const data = await response.json();
  if (data.code !== 'Ok' || !data.trips?.[0] || data.waypoints?.length !== ORDER_COUNT + 1) {
    throw new Error(data.message || data.code || 'Incomplete OSRM response');
  }
  if (data.waypoints.some((waypoint, index) => index > 0 && waypoint.distance > MAX_SNAP_DISTANCE)) {
    const error = new Error('One or more orders are too far from the road network');
    error.retryableSnap = true;
    throw error;
  }

  const trip = data.trips[0];
  if (!trip.legs || trip.legs.length !== ORDER_COUNT + 1) throw new Error('Incomplete route legs');

  const orders = candidates.map((candidate, index) => {
    const waypoint = data.waypoints[index + 1];
    return {
      ...candidate,
      coords: [waypoint.location[1], waypoint.location[0]],
      roadName: waypoint.name || 'Unnamed road',
      visitIndex: waypoint.waypoint_index
    };
  }).sort((a, b) => a.visitIndex - b.visitIndex);

  orders.forEach((order, index) => { order.id = `#${String(index + 1).padStart(2, '0')}`; });
  const { routePoints, orderThresholds } = buildRoadGeometry(trip.legs);
  if (routePoints.length < 2 || orderThresholds.length !== ORDER_COUNT) {
    throw new Error('Incomplete road geometry');
  }
  orders.forEach((order, index) => { order.cumulativeDistance = orderThresholds[index]; });

  return {
    orders,
    routePoints,
    distance: trip.distance,
    duration: trip.duration,
    isFallback: false
  };
}

function appendCoordinates(target, geoJsonCoordinates) {
  for (const [lng, lat] of geoJsonCoordinates || []) {
    const point = [lat, lng];
    const last = target[target.length - 1];
    if (!last || getDistance(last, point) > 0.05) target.push(point);
  }
}

function buildRoadGeometry(legs) {
  const routePoints = [];
  const orderThresholds = [];
  let cumulative = 0;

  legs.forEach((leg, legIndex) => {
    const legPoints = [];
    for (const step of leg.steps || []) appendCoordinates(legPoints, step.geometry?.coordinates);
    if (legPoints.length === 0) throw new Error('A route leg has no road geometry');

    for (const point of legPoints) {
      const last = routePoints[routePoints.length - 1];
      if (!last) {
        routePoints.push(point);
      } else if (getDistance(last, point) > 0.05) {
        cumulative += getDistance(last, point);
        routePoints.push(point);
      }
    }
    if (legIndex < ORDER_COUNT) orderThresholds.push(cumulative);
  });

  return { routePoints, orderThresholds };
}

function shuffled(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function buildFallbackRoute() {
  const orders = [
    ...shuffled(FALLBACK_ROAD_POINTS.taipei).map(coords => ({ city: 'taipei', coords })),
    ...shuffled(FALLBACK_ROAD_POINTS.newTaipei).map(coords => ({ city: 'newTaipei', coords })),
    ...shuffled(FALLBACK_ROAD_POINTS.keelung).map(coords => ({ city: 'keelung', coords }))
  ].map(order => ({ ...order, completed: false }));

  const sorted = solveNearestNeighbor(orders);
  sorted.forEach((order, index) => { order.id = `#${String(index + 1).padStart(2, '0')}`; });
  const routePoints = [WAREHOUSE_COORDS, ...sorted.map(order => order.coords), WAREHOUSE_COORDS];
  let cumulative = 0;
  for (let index = 1; index < routePoints.length; index += 1) {
    cumulative += getDistance(routePoints[index - 1], routePoints[index]);
    if (index <= ORDER_COUNT) sorted[index - 1].cumulativeDistance = cumulative;
  }
  return { orders: sorted, routePoints, distance: cumulative, duration: null, isFallback: true };
}

function solveNearestNeighbor(orders) {
  const unvisited = [...orders];
  const result = [];
  let current = WAREHOUSE_COORDS;
  while (unvisited.length) {
    let nearestIndex = 0;
    for (let index = 1; index < unvisited.length; index += 1) {
      if (getDistance(current, unvisited[index].coords) < getDistance(current, unvisited[nearestIndex].coords)) {
        nearestIndex = index;
      }
    }
    const [next] = unvisited.splice(nearestIndex, 1);
    result.push(next);
    current = next.coords;
  }
  return result;
}

function preparePathMetrics(routePoints) {
  appState.segmentDistances = [];
  appState.cumulativeDistances = [0];
  let total = 0;
  for (let index = 0; index < routePoints.length - 1; index += 1) {
    const distance = getDistance(routePoints[index], routePoints[index + 1]);
    appState.segmentDistances.push(distance);
    total += distance;
    appState.cumulativeDistances.push(total);
  }
  appState.totalRouteLength = total;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return 'estimated time unavailable';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.max(1, Math.round((seconds % 3600) / 60));
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function updateRouteSummary(routeData) {
  const counts = { taipei: 0, newTaipei: 0, keelung: 0 };
  routeData.orders.forEach(order => { counts[order.city] += 1; });
  document.getElementById('city-distribution').textContent =
    `Taipei ${counts.taipei} · New Taipei ${counts.newTaipei} · Keelung ${counts.keelung}`;
  document.getElementById('route-summary').textContent = routeData.isFallback
    ? `${(routeData.distance / 1000).toFixed(1)} km · straight-line fallback`
    : `${(routeData.distance / 1000).toFixed(1)} km · ${formatDuration(routeData.duration)}`;
  document.getElementById('route-warning').classList.toggle('hidden', !routeData.isFallback);
}

function renderOrders(orders) {
  const bounds = L.latLngBounds([WAREHOUSE_COORDS]);
  orders.forEach((order, index) => {
    bounds.extend(order.coords);
    const markerHtml = `<div class="marker-wrapper" id="order-wrapper-${index}"><div class="order-badge pulse" id="order-badge-${index}">${order.id}</div></div>`;
    const icon = L.divIcon({ className: 'custom-marker', html: markerHtml, iconSize: [30, 30], iconAnchor: [15, 15] });
    const marker = L.marker(order.coords, { icon, title: `${order.id} · ${CITY_LABELS[order.city]}` }).addTo(map);
    appState.orderMarkers.push(marker);
  });
  map.fitBounds(bounds, { padding: [50, 50], animate: false });
  appState.routeCasingPolyline = L.polyline([WAREHOUSE_COORDS], { color: '#fff', weight: 7, opacity: 0.9 }).addTo(map);
  appState.routePolyline = L.polyline([WAREHOUSE_COORDS], { color: '#00e5ff', weight: 4, opacity: 1, className: 'route-polyline' }).addTo(map);
}

function announceState(message, visible = false) {
  const toast = document.getElementById('toast-banner');
  toast.textContent = message;
  toast.classList.toggle('hidden', !visible);
}

function clearRunState() {
  appState.runId += 1;
  appState.abortController?.abort();
  appState.abortController = null;
  if (appState.animationFrameId !== null) cancelAnimationFrame(appState.animationFrameId);
  appState.animationFrameId = null;
  appState.timeouts.forEach(clearTimeout);
  appState.timeouts = [];
  appState.orderMarkers.forEach(marker => map.removeLayer(marker));
  appState.orderMarkers = [];
  if (appState.routePolyline) map.removeLayer(appState.routePolyline);
  if (appState.routeCasingPolyline) map.removeLayer(appState.routeCasingPolyline);
  appState.routePolyline = null;
  appState.routeCasingPolyline = null;
  appState.orders = [];
  appState.routePoints = [];
  appState.completedCount = 0;
  appState.isFallback = false;
  appState.truckMarker.setLatLng(WAREHOUSE_COORDS);
  const rotator = document.getElementById('truck-rotator');
  if (rotator) rotator.style.transform = 'rotate(0deg)';
  document.getElementById('total-orders').textContent = '0';
  document.getElementById('completed-deliveries').textContent = '0';
  document.getElementById('progress-percentage').textContent = '0%';
  document.getElementById('progress-bar').style.width = '0%';
  document.getElementById('active-order').textContent = '-';
  document.getElementById('city-distribution').textContent = 'Taipei 0 · New Taipei 0 · Keelung 0';
  document.getElementById('route-summary').textContent = '-';
  document.getElementById('route-warning').classList.add('hidden');
  announceState('', false);
}

async function planDispatchRoute(signal) {
  let lastError;
  for (let attempt = 0; attempt < MAX_ROUTING_ATTEMPTS; attempt += 1) {
    try {
      return await fetchRoadRoute(generateCandidates(), signal);
    } catch (error) {
      if (signal.aborted) throw error;
      lastError = error;
      if (!error.retryableSnap) break;
    }
  }
  console.warn('Live road routing unavailable; using simulation route.', lastError);
  return buildFallbackRoute();
}

document.getElementById('dispatch-btn').addEventListener('click', async () => {
  if (!['idle', 'completed'].includes(appState.dispatchState)) return;
  clearRunState();
  const currentRunId = appState.runId;
  appState.dispatchState = 'routing';
  const button = document.getElementById('dispatch-btn');
  const status = document.getElementById('vehicle-status');
  button.disabled = true;
  button.setAttribute('aria-label', 'Planning delivery route');
  status.textContent = 'PLANNING ROUTE';
  status.className = 'status-value dispatching';
  announceState('Planning a road-network delivery route.');

  const controller = new AbortController();
  appState.abortController = controller;
  const timeoutId = setTimeout(() => controller.abort(), ROUTING_TIMEOUT);
  appState.timeouts.push(timeoutId);

  let routeData;
  try {
    routeData = await planDispatchRoute(controller.signal);
  } catch (error) {
    if (currentRunId !== appState.runId) return;
    routeData = buildFallbackRoute();
    console.warn('Routing request timed out; using simulation route.', error);
  } finally {
    clearTimeout(timeoutId);
    appState.timeouts = appState.timeouts.filter(id => id !== timeoutId);
    if (appState.abortController === controller) appState.abortController = null;
  }

  if (currentRunId !== appState.runId) return;
  appState.orders = routeData.orders;
  appState.routePoints = routeData.routePoints;
  appState.isFallback = routeData.isFallback;
  preparePathMetrics(routeData.routePoints);
  document.getElementById('total-orders').textContent = ORDER_COUNT;
  updateRouteSummary(routeData);
  renderOrders(routeData.orders);
  const startTimeout = setTimeout(() => startDispatchSimulation(currentRunId), 500);
  appState.timeouts.push(startTimeout);
});

function startDispatchSimulation(runId) {
  if (runId !== appState.runId) return;
  appState.dispatchState = 'dispatching';
  const status = document.getElementById('vehicle-status');
  status.textContent = appState.isFallback ? 'SIMULATING' : 'DISPATCHING';
  status.className = 'status-value dispatching';
  let startTime = null;
  let nextOrderIndex = 0;

  function completeOrder(index) {
    const order = appState.orders[index];
    if (!order || order.completed) return;
    order.completed = true;
    const badge = document.getElementById(`order-badge-${index}`);
    const wrapper = document.getElementById(`order-wrapper-${index}`);
    if (badge) {
      badge.classList.add('order-badge-completed');
      badge.innerHTML = SVG_CHECK;
    }
    if (wrapper) {
      wrapper.classList.add('success-halo');
      const timeout = setTimeout(() => wrapper.classList.remove('success-halo'), 600);
      appState.timeouts.push(timeout);
    }
    appState.completedCount += 1;
    document.getElementById('completed-deliveries').textContent = appState.completedCount;
    announceState(`${order.id} delivered in ${CITY_LABELS[order.city]}.`);
  }

  function finish() {
    appState.animationFrameId = null;
    appState.dispatchState = 'completed';
    status.textContent = 'COMPLETED';
    status.className = 'status-value completed';
    document.getElementById('active-order').textContent = 'Warehouse';
    document.getElementById('progress-percentage').textContent = '100%';
    document.getElementById('progress-bar').style.width = '100%';
    appState.truckMarker.setLatLng(WAREHOUSE_COORDS);
    const rotator = document.getElementById('truck-rotator');
    if (rotator) rotator.style.transform = 'rotate(0deg)';
    announceState('All deliveries completed', true);
    const button = document.getElementById('dispatch-btn');
    button.textContent = 'Dispatch Again';
    button.setAttribute('aria-label', 'Dispatch Again');
    button.disabled = false;
  }

  function animationStep(timestamp) {
    if (runId !== appState.runId) return;
    if (startTime === null) startTime = timestamp;
    const ratio = Math.min((timestamp - startTime) / ANIMATION_DURATION, 1);
    const traveled = ratio * appState.totalRouteLength;
    let segmentIndex = appState.segmentDistances.length - 1;
    for (let index = 0; index < appState.segmentDistances.length; index += 1) {
      if (traveled <= appState.cumulativeDistances[index + 1]) {
        segmentIndex = index;
        break;
      }
    }

    const segmentStart = appState.cumulativeDistances[segmentIndex];
    const segmentLength = appState.segmentDistances[segmentIndex] || 1;
    const segmentRatio = Math.max(0, Math.min(1, (traveled - segmentStart) / segmentLength));
    const from = appState.routePoints[segmentIndex];
    const to = appState.routePoints[segmentIndex + 1];
    const current = [
      from[0] + (to[0] - from[0]) * segmentRatio,
      from[1] + (to[1] - from[1]) * segmentRatio
    ];
    appState.truckMarker.setLatLng(current);

    const fromPoint = map.latLngToLayerPoint(from);
    const toPoint = map.latLngToLayerPoint(to);
    const angle = Math.atan2(toPoint.y - fromPoint.y, toPoint.x - fromPoint.x) * 180 / Math.PI;
    const rotator = document.getElementById('truck-rotator');
    if (rotator) rotator.style.transform = `rotate(${angle}deg)`;

    const traversed = appState.routePoints.slice(0, segmentIndex + 1);
    traversed.push(current);
    appState.routeCasingPolyline.setLatLngs(traversed);
    appState.routePolyline.setLatLngs(traversed);

    while (nextOrderIndex < appState.orders.length && traveled >= appState.orders[nextOrderIndex].cumulativeDistance) {
      completeOrder(nextOrderIndex);
      nextOrderIndex += 1;
    }

    const nextOrder = appState.orders[nextOrderIndex];
    document.getElementById('active-order').textContent = nextOrder ? `${nextOrder.id} · ${CITY_LABELS[nextOrder.city]}` : 'Warehouse';
    if (!nextOrder && appState.dispatchState !== 'returning') {
      appState.dispatchState = 'returning';
      status.textContent = 'RETURNING';
      status.className = 'status-value returning';
    }
    const percentage = Math.round(ratio * 100);
    document.getElementById('progress-percentage').textContent = `${percentage}%`;
    document.getElementById('progress-bar').style.width = `${percentage}%`;

    if (ratio < 1) {
      appState.animationFrameId = requestAnimationFrame(animationStep);
    } else {
      while (nextOrderIndex < appState.orders.length) completeOrder(nextOrderIndex++);
      finish();
    }
  }

  appState.animationFrameId = requestAnimationFrame(animationStep);
}

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => map.invalidateSize(), 100);
});
