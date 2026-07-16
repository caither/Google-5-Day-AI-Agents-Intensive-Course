# Smart Logistics Dispatch Center - Design Specification

**Date:** 2026-07-16  
**Status:** Approved with Technical Revisions  
**Topic:** Modern Single-Page Logistics Control Dashboard with Leaflet

---

## 1. Project Goal

Create a professional, light-themed minimalist, single-page logistics control center frontend application. The application will showcase a Leaflet map where a delivery truck dispatches from a warehouse, visits exactly 20 randomly generated orders using a Nearest Neighbor heuristic, and returns to the warehouse.

The truck movement, progressive route drawing, order state changes, and dashboard updates must remain synchronized. The movement animation should complete in approximately 5 seconds under normal foreground-tab conditions. Success halos may overlap and remain visible briefly after their corresponding deliveries.

---

## 2. File Architecture

The project will follow a multi-file approach:

- **`index.html`**: Entry point for semantic layout, map container, controls, status banner, and statistics cards.
- **`style.css`**: Theme, responsive layout, dashboard controls, Leaflet marker styling, and nonessential visual animations.
- **`app.js`**: Map lifecycle, order generation, route planning, cumulative-distance calculations, `requestAnimationFrame` animation, UI synchronization, state management, and reset behavior.

No backend, database, build step, or routing API is required.

---

## 3. UI/UX and Visual Guidelines

- **Theme**: Light Minimalism (Clean Minimalist Slate).
  - Background: Crisp Light Slate (`#f8fafc`).
  - Panels: Clean white overlays (`rgba(255, 255, 255, 0.95)` with a clean border and soft shadow).
  - Primary Accent: Royal Blue (`#2563eb`).
  - Pending Accent: High-visibility Orange (`#f97316`).
- **Header**: Display "Smart Logistics Dispatch Center" and a prominent dynamic `Dispatch Orders` button.
- **Dashboard**: Show total orders, completed deliveries, current order, progress percentage and bar, and truck status.
- **Desktop Layout**: Two-column grid with the map at approximately 70% width and the statistics panel at 30% width.
- **Tablet Layout**: Use a 60/40 split when space permits; otherwise stack the dashboard and map.
- **Mobile Layout**: Stack content vertically, keep controls easy to reach, and give the map a practical height of at least `55vh` or `420px` where viewport size permits.
- **Responsive Leaflet Behavior**: Call `map.invalidateSize()` after layout or breakpoint changes that alter the map container dimensions.

### Leaflet Tile Layer

- Use ESRI World Imagery raster tile layer.
- Preserve all required Leaflet and map-data attribution; attribution must remain visible on every viewport size.
- A tile-loading failure must not prevent the simulated dispatch, dashboard, or reset controls from operating.
- Do not embed API keys or secrets in the frontend.

---

## 4. Custom Icon Designs (Inline SVG in `L.divIcon`)

Use Leaflet `L.divIcon` markers with inline SVG to avoid external marker-image dependencies:

1. **Warehouse Marker**: Deep circular badge with a stylized white warehouse icon.
2. **Truck Marker**: Aerodynamic vehicle icon placed inside a nested rotation wrapper.
3. **Pending Order Marker**: Circular high-contrast orange badge numbered `#01` through `#20`, with an optional pulsing ring.
4. **Completed Order Marker**: Green circular checkmark badge with a transient success halo.

The Leaflet marker root must remain controlled by Leaflet because Leaflet uses its root `transform` for positioning. Truck rotation must be applied only to a nested inner element so it never overwrites the marker root transform:

```html
<div class="truck-marker">
  <div class="truck-rotator">
    <!-- inline truck SVG -->
  </div>
</div>
```

```css
.truck-rotator {
  transform: rotate(var(--truck-angle));
}
```

Marker pulse and halo effects must likewise avoid changing the positioned marker root or shifting its anchor.

---

## 5. Order Generation and Map Framing

- Use a fixed demonstration warehouse and a predefined urban bounding box so all random points remain within a visually suitable area.
- Generate exactly 20 unique order positions.
- Keep each order at least approximately 300 meters from the warehouse.
- Keep orders approximately 150–250 meters apart. Reject and regenerate candidates that violate the selected minimum spacing.
- Set a finite retry limit. If random generation cannot fill all 20 positions, gradually relax spacing within a safe lower bound rather than looping indefinitely.
- Road-level accuracy is not required because the route is a frontend simulation, but points should avoid obviously unsuitable regions when the chosen demonstration bounds make that practical.
- After generation, call `map.fitBounds()` with padding so the warehouse and all orders are visible.
- Complete or disable the fit-bounds transition before starting the timed movement animation. Do not change the map viewpoint automatically while the truck is moving.

---

## 6. Algorithmic and Animation Details

### Route Planning

- Use a Nearest Neighbor heuristic to produce a visually coherent, approximately optimized route. It is not required or claimed to be a globally optimal Traveling Salesperson solution.
- Begin at the warehouse, visit each of the 20 orders exactly once, and append the warehouse as the final destination.
- At each step, select the unvisited order with the smallest geodesic distance from the current node.
- Precompute every segment length, total route length, and cumulative distance at each route node.
- The resulting route array must contain 22 nodes: warehouse start, 20 unique orders, and warehouse return.

### Animation

- Use a single `requestAnimationFrame` loop for the entire dispatch.
- Target truck-movement duration: 5000 milliseconds. Under normal foreground-tab conditions, completion should occur between 4.8 and 5.5 seconds. Background-tab throttling is not considered a defect.
- Calculate normalized progress from elapsed time and derive traveled distance from the total route length, giving approximately constant speed by distance.
- Locate the active segment using cumulative segment distances, then interpolate latitude and longitude within that segment.
- Update the progressive polyline each frame using all fully traversed route nodes plus the truck's current interpolated position. The complete route must never be revealed in advance.
- Mark all uncompleted orders whose cumulative distances are less than or equal to the current traveled distance. Use a loop so skipped frames cannot cause missed deliveries:

```js
while (
  nextOrderIndex < orders.length &&
  traveledDistance >= orders[nextOrderIndex].cumulativeDistance
) {
  completeOrder(nextOrderIndex);
  nextOrderIndex += 1;
}
```

- Each order may transition to completed exactly once. The marker, completed count, current-order label, progress bar, and accessible status message must update together.
- Completion halo animations may last 300–500 milliseconds and overlap so the 5-second movement remains readable.
- After the last order, set the truck state to `returning`. When the truck reaches the warehouse, show "All deliveries completed", set progress to 100%, and enable `Dispatch Again`.

### Truck Rotation

Compute direction in Leaflet layer-point screen coordinates rather than directly from latitude/longitude deltas:

```js
const fromPoint = map.latLngToLayerPoint(fromLatLng);
const toPoint = map.latLngToLayerPoint(toLatLng);
const angle = Math.atan2(
  toPoint.y - fromPoint.y,
  toPoint.x - fromPoint.x
) * 180 / Math.PI;
```

Apply an orientation offset based on the SVG truck's default facing direction. Update only the nested `.truck-rotator`; never set `transform` on the Leaflet marker root.

---

## 7. State Management and Reset Behavior

Use an explicit application state without requiring a state-machine library:

```text
idle -> generating -> dispatching -> returning -> completed
                    \-> resetting -> idle
```

Maintain at least:

```js
let animationFrameId = null;
let dispatchState = 'idle';
```

The button must be disabled while generating, dispatching, returning, or resetting. Starting or resetting a run must cancel any existing animation frame before changing map objects:

```js
if (animationFrameId !== null) {
  cancelAnimationFrame(animationFrameId);
  animationFrameId = null;
}
```

Reset must remove or restore all run-specific state:

- Order markers and their animation classes.
- Progressive polyline.
- Truck position, rotation, and status.
- Route, segment, and cumulative-distance arrays.
- Completed count, current order, percentage, progress bar, and success message.
- Pending timers or callbacks associated with visual effects.

`Dispatch Again` must fully reset the previous run before generating a new set of orders. Rapid or repeated clicks must never create multiple animation loops.

---

## 8. Accessibility and Reduced Motion

- Give the dispatch button a clear accessible name (`aria-label`).
- Announce meaningful dispatch-state changes through an `aria-live="polite"` region.
- Do not rely on red/green color alone. Pending markers include order numbers; completed markers include checkmarks and corresponding text/status changes.
- Maintain readable contrast and visible keyboard focus states.
- Respect `prefers-reduced-motion` by disabling nonessential pulse and halo animations. The core route simulation may continue, but decorative motion should be minimized:

```css
@media (prefers-reduced-motion: reduce) {
  .pulse,
  .success-halo {
    animation: none;
  }
}
```

---

## 9. Verification Plan

### Manual Flow

1. Load `index.html` and confirm the warehouse, parked truck, initialized statistics, active button, and visible attribution.
2. Click `Dispatch Orders` and confirm the button becomes disabled and exactly 20 numbered pending markers appear.
3. Confirm the viewport frames all generated orders before movement begins and remains stable during dispatch.
4. Confirm the truck follows a coherent route, rotates in its travel direction, and does not shift away from its Leaflet anchor.
5. Confirm the polyline extends behind the truck instead of appearing all at once.
6. Confirm each crossed marker changes once to a green checkmark with a short halo and that dashboard values stay synchronized.
7. Confirm the truck returns to the warehouse, all 20 orders are complete, progress reaches 100%, and `Dispatch Again` becomes active.
8. Click `Dispatch Again` and confirm no marker, route, status, timer, or animation from the prior run remains.

### Functional Acceptance Criteria

- Each run creates exactly 20 unique orders.
- The route contains the starting warehouse, all 20 orders exactly once, and the returning warehouse.
- `completedCount` ends at exactly 20; no order completes more than once, including after a delayed or skipped frame.
- The final truck coordinates equal the warehouse coordinates within normal floating-point tolerance.
- Repeated clicks during an active run do not start another animation loop.
- Resetting cancels the prior animation frame and removes all run-specific map layers and UI state.
- Dispatch logic remains usable if the tile layer fails to load.

### Visual and Responsive Acceptance Criteria

- Truck rotation never overwrites Leaflet's marker-position transform.
- Marker animations never move markers away from their anchors.
- The route is progressively drawn and is not fully visible before traversal.
- Attribution remains visible.
- Dashboard panels do not cover map controls at supported breakpoints.
- The mobile map retains a practical height and redraws correctly after responsive layout changes.
- Pending and completed states remain distinguishable without relying only on color.

### Timing Acceptance Criteria

- In a foreground browser tab under normal conditions, truck movement finishes in 4.8–5.5 seconds.
- Completion halos may remain briefly after their delivery event and do not need to finish within the movement window.
- `requestAnimationFrame` throttling in a background tab is acceptable and should not be treated as a failed test.
