# Smart Logistics Clean Minimalist Slate Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the Smart Logistics Dispatch Center color scheme to a Clean Minimalist Slate (light mode) and change the base map to ESRI World Imagery satellite tiles.

**Architecture:** We will update style variables and shadows in `style.css` and swap the tile layer configuration in `app.js`. High contrast borders/shadows will be applied to paths and markers for visibility on satellite tiles.

**Tech Stack:** HTML5, CSS3, ES6 JavaScript, Leaflet.js, ESRI World Imagery.

## Global Constraints
- Chinese Markdown documents are expected to be UTF-8.
- Respect `prefers-reduced-motion` in CSS.
- Ensure all marker and path overlays remain high-contrast on top of satellite imagery.

---

### Task 1: Leaflet Tile Layer Swap to ESRI World Imagery

**Files:**
- Modify: `g:\01DevG\Google-5-Day-AI-Agents-Intensive-Course\day1\my-first-cloud-run\app.js:24-35`

**Interfaces:**
- Consumes: Leaflet map configuration
- Produces: Updated L.tileLayer referencing ESRI World Imagery.

- [ ] **Step 1: Replace map tile initialization in `app.js`**
  Modify `app.js` to swap the dark tile layer with ESRI satellite tile layer.
  ```javascript
  // Use ESRI World Imagery tile layer
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
  }).addTo(map);
  ```

- [ ] **Step 2: Verify layer loading**
  Open `index.html` and verify the map renders with ESRI World Imagery tiles and displays Esri attributions.

- [ ] **Step 3: Commit**
  ```bash
  git commit -am "feat: swap Leaflet tile layer to ESRI World Imagery"
  ```

---

### Task 2: CSS Light Theme Overhaul & Contrast Tuning

**Files:**
- Modify: `g:\01DevG\Google-5-Day-AI-Agents-Intensive-Course\day1\my-first-cloud-run\style.css`

**Interfaces:**
- Consumes: CSS root variables and dashboard layout classes
- Produces: Minimalist light-theme colors, panel outlines, and high-contrast marker outlines.

- [ ] **Step 1: Overwrite root styling variables**
  Update variable definitions at the top of `style.css` to light-mode parameters:
  ```css
  :root {
    --bg-dark: #f8fafc;            /* Crisp light slate gray */
    --card-bg: rgba(255, 255, 255, 0.95); /* Clean white */
    --text-main: #0f172a;          /* Slate 900 */
    --text-muted: #64748b;        /* Slate 500 */
    --accent-blue: #2563eb;        /* Royal Blue */
    --accent-blue-hover: #1d4ed8;  /* Deep Royal Blue */
    --accent-green: #10b981;       /* Emerald Green */
    --accent-orange: #f97316;      /* High-visibility Orange */
    --border-color: #e2e8f0;       /* Slate 200 border */
  }
  ```

- [ ] **Step 2: Update Card & Subitem styling**
  Find card class `.panel-card`, `.stat-item`, and `.status-item` rules, and update to match light mode styles (using borders, soft slate shadows, and soft gray background overlays).
  ```css
  .panel-card {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.05), 0 4px 6px -4px rgba(15, 23, 42, 0.05);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    height: 100%;
  }

  .stat-item {
    background: rgba(15, 23, 42, 0.02);
    border-radius: 8px;
    padding: 1rem;
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(15, 23, 42, 0.02);
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }
  ```

- [ ] **Step 3: Enhance Map & Marker Border contrast**
  Give the map container a clean white border and shadow. Set custom marker badges and path polylines to stand out cleanly on satellite map.
  ```css
  .map-section {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    border: 4px solid #ffffff;
    background-color: #f1f5f9;
    box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.08);
  }

  .warehouse-badge {
    position: relative;
    background-color: #ffffff;
    border: 2.5px solid var(--accent-blue);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .truck-badge {
    position: relative;
    background-color: var(--accent-blue);
    border: 2px solid #ffffff;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .order-badge {
    position: relative;
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
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.25);
    transition: background-color 0.3s ease, border-color 0.3s ease;
  }
  ```

- [ ] **Step 4: Update progressive polyline color**
  Make the polyline high contrast by choosing bright cyan/royal blue (`#3b82f6` or `#00e5ff`). Let's ensure the color is visible on green/brown satellite tiles.

- [ ] **Step 5: Verify light layout**
  Inspect the page layout in the browser. Confirm text readability, button borders, and marker outline contrast.

- [ ] **Step 6: Commit**
  ```bash
  git commit -am "feat: implement clean minimalist slate stylesheet changes"
  ```
