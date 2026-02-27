import Map          from "@arcgis/core/Map.js";
import MapView      from "@arcgis/core/views/MapView.js";
import Graphic      from "@arcgis/core/Graphic.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import Point        from "@arcgis/core/geometry/Point.js";
import Basemap      from "@arcgis/core/Basemap.js";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer.js";
import Home         from "@arcgis/core/widgets/Home.js";
import Search       from "@arcgis/core/widgets/Search.js";
import ScaleBar     from "@arcgis/core/widgets/ScaleBar.js";

import { VENUES, mkSymbol } from "./data.js";

// Keyed by venue id — populated in initMap
const byId = {};

export async function initMap(containerId, onVenueClick) {
  // CartoDB Dark Matter — free tiles, no API key required
  const cartoBasemap = new Basemap({
    baseLayers: [
      new WebTileLayer({
        urlTemplate: "https://cartodb-basemaps-{subDomain}.global.ssl.fastly.net/dark_all/{level}/{col}/{row}.png",
        subDomains:  ["a", "b", "c"],
        copyright:   "\u00a9 OpenStreetMap contributors \u00a9 CARTO"
      })
    ]
  });

  const map = new Map({ basemap: cartoBasemap });

  const view = new MapView({
    container: containerId,
    map,
    center: [-118.28, 34.03],
    zoom:    10,
    ui:      { components: ["zoom", "compass"] },
    popup:   { autoOpenEnabled: false }
  });

  const layer = new GraphicsLayer();
  map.add(layer);

  // Add a graphic for every venue
  VENUES.forEach(v => {
    const g = new Graphic({
      geometry:   new Point({ longitude: v.lng, latitude: v.lat }),
      symbol:     mkSymbol(v.cat),
      attributes: { id: v.id }
    });
    layer.add(g);
    byId[v.id] = g;
  });

  await view.when();

  // Widgets
  view.ui.add(new Home({ view }),                           "top-left");
  view.ui.add(new Search({ view }),                        "top-left");
  view.ui.add(new ScaleBar({ view, unit: "dual" }),        "bottom-right");

  // Click — venue selection
  view.on("click", async e => {
    const hit   = await view.hitTest(e);
    const match = hit.results.find(r => r.graphic && r.graphic.layer === layer);
    if (match && onVenueClick) onVenueClick(match.graphic.attributes.id);
  });

  // Pointer-move — tooltip
  const tip = document.getElementById("tip");
  view.on("pointer-move", async e => {
    const hit   = await view.hitTest(e);
    const match = hit.results.find(r => r.graphic && r.graphic.layer === layer);
    if (match) {
      const v = VENUES.find(v => v.id === match.graphic.attributes.id);
      view.container.style.cursor = "pointer";
      tip.textContent = v ? v.name : "";
      tip.style.left  = (e.x + 14) + "px";
      tip.style.top   = (e.y + 10) + "px";
      tip.classList.add("show");
    } else {
      view.container.style.cursor = "default";
      tip.classList.remove("show");
    }
  });

  return { view, map };
}

/** Highlight a venue marker as selected. */
export function selectGraphic(id) {
  const v = VENUES.find(v => v.id === id);
  if (v && byId[id]) byId[id].symbol = mkSymbol(v.cat, true);
}

/** Restore a venue marker to its default (unselected) symbol. */
export function deselectGraphic(id) {
  const v = VENUES.find(v => v.id === id);
  if (v && byId[id]) byId[id].symbol = mkSymbol(v.cat, false);
}

/**
 * Switch from CartoDB Dark Matter to Esri dark-vector basemap.
 * Call this after setting esriConfig.apiKey.
 */
export function upgradeBasemap(view) {
  view.map.basemap = "dark-vector";
}
