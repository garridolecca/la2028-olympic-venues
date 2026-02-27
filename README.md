# LA 2028 Olympic Venue Monitor

An interactive web map built with **ArcGIS JavaScript SDK 4.29** (ESM) that plots all 20 confirmed venues for the Los Angeles 2028 Summer Olympics, with real-time search, venue details, and live area demographics powered by Esri GeoEnrichment.

**Live demo → [garridolecca.github.io/la2028-olympic-venues](https://garridolecca.github.io/la2028-olympic-venues/)**

---

## Screenshot

> _Map renders immediately — no API key required to see venues._

| Map view | Venue sidebar + demographics |
|---|---|
| 20 colour-coded markers on a dark basemap | Venue details + 1-mile radius demographic stats |

---

## Features

| Feature | Detail |
|---|---|
| **20 Olympic venues** | Every confirmed LA 2028 site: stadiums, arenas, beach venues, aquatics, equestrian, athletes' village |
| **Zero-auth map** | CartoDB Dark Matter tiles load with no key — map is always visible |
| **Colour-coded markers** | Gold = Indoor arena · Blue = Outdoor / stadium · Green = Athletes village |
| **Venue list + search** | Left panel filters by name, sport, venue type, or city in real time |
| **Venue detail sidebar** | Type badge, description, sports & events, capacity, year built, address |
| **Tooltip on hover** | Venue name follows the cursor over any marker |
| **Smooth navigation** | Click a marker or list item → map pans & zooms to the venue (700 ms transition) |
| **Esri basemap upgrade** | Paste an ArcGIS API key → basemap switches to `dark-vector` for sharper labels |
| **Live demographics** | GeoEnrichment 1-mile ring buffer: population, median age, income, density, household size, owner vs renter |
| **No build step** | Pure ES modules via browser importmap + ArcGIS ESM CDN — open `index.html` and go |

---

## Venues

| # | Venue | Category | Notable Events |
|---|---|---|---|
| 1 | SoFi Stadium | Outdoor | Opening & Closing Ceremonies, Athletics |
| 2 | Crypto.com Arena | Indoor | Basketball, Boxing |
| 3 | LA Memorial Coliseum | Outdoor | Athletics, Rugby Sevens |
| 4 | Rose Bowl Stadium | Outdoor | Soccer, Field Hockey |
| 5 | Pauley Pavilion | Indoor | Gymnastics, Handball |
| 6 | Intuit Dome | Indoor | 3x3 Basketball, Wheelchair Basketball |
| 7 | Dignity Health Sports Park | Outdoor | Soccer |
| 8 | Long Beach Arena | Indoor | Volleyball, Judo, Wrestling |
| 9 | UCLA Olympic Village | Village | Athletes Village, Media Center |
| 10 | Sepulveda Basin Whitewater | Outdoor | Canoe Slalom, Kayak Cross |
| 11 | Santa Monica State Beach | Outdoor | Beach Volleyball, Open Water Swimming |
| 12 | Venice Beach | Outdoor | Skateboarding, BMX Freestyle, Breaking |
| 13 | Grand Park — Grand Avenue | Outdoor | Cycling Road Race, Marathon, Race Walk |
| 14 | Pomona Fairplex | Outdoor | BMX Racing, Mountain Bike |
| 15 | Long Beach Aquatics Center | Outdoor | Swimming, Diving, Water Polo |
| 16 | El Dorado Regional Park | Outdoor | Archery |
| 17 | BMO Stadium | Outdoor | Soccer |
| 18 | UCLA Tennis Center | Outdoor | Tennis |
| 19 | Long Beach Rowing Venue | Outdoor | Rowing, Canoe/Kayak Sprint |
| 20 | Hansen Dam Equestrian Center | Outdoor | Equestrian, Modern Pentathlon |

---

## Getting Started

### Run locally (VS Code Live Server)

```bash
# 1. Clone the repo
git clone https://github.com/garridolecca/la2028-olympic-venues.git

# 2. Open in VS Code
code la2028-olympic-venues

# 3. Right-click index.html → "Open with Live Server"
```

No `npm install`, no build command, no node_modules — the browser fetches the ArcGIS SDK directly from the CDN via the importmap.

### Run with any static server

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .
```

Then open `http://localhost:8080`.

---

## Optional: ArcGIS API Key

The map works without a key (CartoDB basemap). A free Esri API key unlocks two extras:

1. **Esri dark-vector basemap** — higher-quality vector tiles with better label rendering
2. **GeoEnrichment demographics** — real-time population, income, age, density, and housing stats for a 1-mile radius around every venue

**Get a free key:**
1. Sign up at [location.arcgis.com](https://location.arcgis.com)
2. Create an API key with `geocoding`, `basemaps`, and `GeoEnrichment` scopes
3. Paste the key into the header bar — the indicator dot turns green when applied

---

## Project Structure

```
la2028-olympic-venues/
├── index.html            ← HTML shell, importmap, <link> tags, markup
├── css/
│   └── styles.css        ← All layout and component styles
└── js/
    ├── main.js           ← ES module entry; wires all modules together
    ├── config.js         ← esriConfig.assetsPath + setApiKey()
    ├── data.js           ← VENUES array, CAT_COLORS, mkSymbol()
    ├── map.js            ← MapView, CartoDB basemap, graphics, events
    ├── panel.js          ← Left venue list + real-time search filter
    ├── sidebar.js        ← Right detail panel open / close / render
    └── demographics.js   ← GeoEnrichment fetch, attribute parsing, render
```

### Module responsibilities

| Module | Responsibility |
|---|---|
| `config.js` | Sets `esriConfig.assetsPath` (must be first import); exposes `setApiKey()` |
| `data.js` | Single source of truth for all 20 venues and colour palette |
| `map.js` | Creates the `MapView` with CartoDB Dark Matter basemap; handles click and hover events; exposes `selectGraphic` / `deselectGraphic` / `upgradeBasemap` |
| `panel.js` | Renders the scrollable venue list; filters on every keystroke |
| `sidebar.js` | Shows/hides the detail panel; triggers `loadDemographics` on open |
| `demographics.js` | Calls the Esri GeoEnrichment REST API; parses and displays 10 demographic metrics |
| `main.js` | Orchestrator — owns `currentVenueId`, coordinates all modules via `handleVenueSelect` |

---

## Technology

- **[ArcGIS Maps SDK for JavaScript 4.29](https://developers.arcgis.com/javascript/latest/)** — MapView, GraphicsLayer, WebTileLayer, Basemap, Home, Search, ScaleBar widgets
- **[Esri GeoEnrichment Service](https://developers.arcgis.com/rest/geoenrichment/)** — `KeyGlobalFacts` data collection, 1-mile ring buffer
- **[CARTO Dark Matter](https://carto.com/basemaps/)** — free OpenStreetMap-based dark basemap, no auth required
- **ES Modules + Import Maps** — native browser module resolution, no bundler
- **GitHub Pages** — zero-config static hosting

---

## Deployment

Because the app is pure static files (HTML + CSS + JS), it deploys to any host with a single copy:

| Platform | Command / Steps |
|---|---|
| **GitHub Pages** | Already live — push to `master`, Pages rebuilds automatically |
| **Netlify** | Drag-and-drop the folder at [netlify.com/drop](https://netlify.com/drop) |
| **Vercel** | `vercel --prod` from the project root |
| **Any web server** | Copy files to the web root; serve over HTTPS |

> **Note:** The ArcGIS ESM CDN and GeoEnrichment API require the page to be served over HTTP/HTTPS (not `file://`). Always use a local server or deploy to a host.

---

## License

MIT — use freely, attribution appreciated.

---

*Built with [Claude Code](https://claude.ai/claude-code) · Data sourced from LA28 official venue announcements*
