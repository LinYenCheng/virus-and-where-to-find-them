# Project Overview: virus-and-where-to-find-them

A map-based visualization application for tracking the COVID-19 pandemic and Taipei rat reports. It provides interactive heatmaps, charts, and data tables to help users understand the spread of the virus and local public health issues.

## Technology Stack

-   **Framework:** [Svelte 4](https://svelte.dev/)
-   **Bundler/Build Tool:** [Vite 5](https://vitejs.dev/)
-   **Routing:** [vanilla-router](https://github.com/Kazzkiq/vanilla-router)
-   **Mapping:** [Leaflet](https://leafletjs.com/) (with `Leaflet.heat` and `Leaflet.markercluster`)
-   **Charts:** [C3.js](https://c3js.org/) (D3-based)
-   **UI Utilities:** jQuery, Select2, DataTables
-   **Data Processing:** Custom Node.js scripts (`generateJSON.js`) utilizing `axios` and `csvjson-csv2json`.

## Architecture

-   **`src/index.js`**: Application entry point. Initializes the Svelte root component, configures the router, and handles initial data loading.
-   **`src/components/App.svelte`**: The main UI container. Manages state for map modes (`virus` vs. `rat`) and coordinates between the map, charts, and data tables.
-   **`src/components/Map.svelte`**: Encapsulates Leaflet integration. Manages different map layers, clusters, and heatmaps depending on the selected mode.
-   **`src/charts.js`**: Contains logic for generating global and country-specific charts using C3.js.
-   **`src/dataTable.js`**: Handles the generation and rendering of data tables for different regions and report types.
-   **`generateJSON.js`**: A data pipeline script that fetches COVID-19 and rat report data from external APIs and saves them as local JSON/CSV files in the `data/` directory.

## Building and Running

### Development
```bash
npm run dev
```
Starts the Vite development server on `http://localhost:5000`.

### Production Build
```bash
npm run build
```
Builds the application into the `dist/` directory. This project is configured to deploy from the `dist/` folder for compatibility with GitHub Pages.

### Data Update
```bash
npm run generate
```
Fetches the latest data from external sources and updates local data files. This is also automated via GitHub Actions (`.github/workflows/fetch-rat-data.yml`).

### Preview Production Build
```bash
npm start
```
Serves the `dist/` directory locally using `sirv-cli`.

## Development Conventions

-   **Releases:** Use `npm run release` to handle versioning and changelog generation via `standard-version`.
-   **Data Handling:** Large datasets are processed offline (or via CI) into JSON to minimize client-side processing.
-   **Routing:** Simple hash-based or history-based routing is handled by `vanilla-router`.
-   **Styles:** Global styles are located in `public/global.css`. Component-specific styles (if any) are within `.svelte` files.
-   **Map Modes:** Supported modes are `virus` and `rat`. These can be toggled via the UI or specified in the URL query parameter `?map=mode`.
