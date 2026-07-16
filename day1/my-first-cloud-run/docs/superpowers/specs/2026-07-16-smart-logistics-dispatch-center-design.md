# Smart Logistics Dispatch Center - Design Specification

**Date:** 2026-07-16  
**Status:** Approved  
**Topic:** Modern Single-Page Logistics Control Dashboard with Leaflet

---

## 1. Project Goal
Create a professional, dark-themed, single-page logistics control center frontend application. The application will showcase a Leaflet map where a delivery truck dispatches to 20 random orders (optimized via Nearest Neighbor routing) and returns to the warehouse. The path will be drawn dynamically and the truck rotated along the direction of travel, all animated smoothly within 5 seconds.

---

## 2. File Architecture
The project will follow a Multi-File Approach:
- **`index.html`**: Entry point for layout structure, map container, and stats cards.
- **`style.css`**: Styling sheets covering layout, theme colors (slate/obsidian dark mode), dashboard controls, and Leaflet marker animations.
- **`app.js`**: Core logic for map management, routing optimization, interpolating movement using `requestAnimationFrame`, updating UI stats, and resetting state.

---

## 3. UI/UX & Visual Guidelines
- **Theme**: High-tech Logistics Dashboard (Dark Mode).
  - Background: Deep Obsidian Blue (`#0a0f1d`)
  - Panels: Translucent slate-blue glassmorphism (`rgba(16, 24, 48, 0.8)` with `backdrop-filter: blur(10px)`).
  - Primary Accent: Neon Green (`#10b981`) for success and progress.
  - Pending Accent: Warning Orange/Red (`#f59e0b` / `#ef4444`) for active dispatch orders.
- **Layout**:
  - Top header: "Smart Logistics Dispatch Center" with title and dynamic `Dispatch Orders` button.
  - Two-column grid (desktop): Left side holds the map (70% width), right side holds the stats panel (30% width).
  - Responsive: Stacks vertically on mobile.
- **Leaflet Integration**:
  - Dark-themed tile layer (using CartoDB Voyager Dark or similar OSM-based styling to match the theme).

---

## 4. Custom Icon Designs (SVG in CSS/DivIcons)
Using Leaflet `L.divIcon` to render inline SVG icons, avoiding external image dependencies:
1. **Warehouse Marker**: Deep circular badge with a stylized white warehouse icon.
2. **Truck Marker**: An aerodynamic vehicle icon with rotation styles applied directly via CSS `transform: rotate(Ydeg)`.
3. **Pending Order Marker**: A circular badge showing `#01` to `#20` in a high-contrast orange background with a pulsing ring animation.
4. **Completed Order Marker**: A green circular checkmark badge with a transient success halo effect.

---

## 5. Algorithmic & Animation Details
- **Route Planning (Nearest Neighbor)**:
  1. Starting node $P_0$ is the warehouse.
  2. Of the remaining unvisited orders $\{P_1, P_2, ..., P_{20}\}$, select $P_i$ which minimizes the geodesic distance $d(P_0, P_i)$.
  3. Set $P_0 = P_i$, remove $P_i$ from unvisited set, and append it to the planned route.
  4. Repeat until all orders are visited, then append the warehouse at the end to return home.
- **Animation System (requestAnimationFrame)**:
  - Total Duration: 5000 milliseconds (5 seconds).
  - Total path length is calculated by summing the distances of all segments.
  - The animation loops through elapsed time: $t \in [0, 5000]$.
  - The progress ratio $r = t / 5000$ determines the distance traveled.
  - Find the segment containing the current distance.
  - Interpolate the latitude and longitude coordinates.
  - Compute the angle of direction using the Cartesian delta of coordinates: $\theta = \text{atan2}(\Delta \text{lat}, \Delta \text{lng}) \times 180 / \pi$. Note that map projections may distort this slightly, but simple delta-lng/delta-lat works perfectly for local coordinates. We adjust for Leaflet coordinate space (Leaflet uses y-down for display, but lat/lng is standard math).
  - Draw the progressive polyline up to the truck's current position.
  - Detect when the truck crosses an order node, then trigger that node's completion status.

---

## 6. Verification Plan
### Manual Verification
1. Load `index.html` in the browser.
2. Observe initial layout: Map centered on warehouse with parked truck, button active, stats card initialized.
3. Click "Dispatch Orders" button.
4. Verify:
   - Button becomes disabled.
   - 20 markers appear with orange badges and numbers.
   - Truck moves along a clear, non-chaotic path.
   - Line is drawn dynamically behind the truck.
   - As truck reaches each marker, marker changes color to green, displays checkmark, and triggers a pulse effect.
   - Panel numbers, progress bar, and active order updates are synchronized.
   - On returning to warehouse, truck stops, banner displays "All deliveries completed", and button changes to "Dispatch Again" and becomes active.
5. Click "Dispatch Again" to verify that state resets and a new random route runs.
