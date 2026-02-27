// config.js MUST be the first import — it sets esriConfig.assetsPath
// before any ArcGIS rendering begins.
import { setApiKey }                               from "./config.js";
import { VENUES }                                  from "./data.js";
import { initMap, selectGraphic, deselectGraphic, upgradeBasemap } from "./map.js";
import { initPanel, setActiveVenue }               from "./panel.js";
import { initSidebar, showSidebar, closeSidebar, isSidebarOpen }   from "./sidebar.js";
import { loadDemographics }                        from "./demographics.js";

let currentVenueId = null;
let mapView        = null;

function handleVenueSelect(id) {
  // Deselect previous
  if (currentVenueId !== null) {
    deselectGraphic(currentVenueId);
  }
  currentVenueId = id;

  // Update map marker + panel highlight
  selectGraphic(id);
  setActiveVenue(id);

  // Open sidebar with venue details (also triggers demographics fetch)
  const venue = VENUES.find(v => v.id === id);
  if (venue) {
    showSidebar(venue);
    if (mapView) {
      mapView.goTo({ center: [venue.lng, venue.lat], zoom: 14 }, { duration: 700 });
    }
  }
}

function handleSidebarClose() {
  if (currentVenueId !== null) {
    deselectGraphic(currentVenueId);
    setActiveVenue(null);
    currentVenueId = null;
  }
}

(async () => {
  const { view } = await initMap("viewDiv", handleVenueSelect);
  mapView = view;

  initPanel(handleVenueSelect);
  initSidebar(handleSidebarClose);

  // API key input handling
  const apiKeyInput = document.getElementById("apiKey");
  const apiDot      = document.getElementById("apiDot");

  apiKeyInput.addEventListener("input", function () {
    const key = this.value.trim();

    // Visual feedback while typing
    apiDot.className = key.length > 0 ? "api-dot typing" : "api-dot";

    // Apply key when it looks like a real key (>20 chars)
    if (key.length > 20) {
      setApiKey(key);
      upgradeBasemap(view);
      apiDot.className = "api-dot ready";

      // Refresh demographics if the sidebar is already showing a venue
      if (isSidebarOpen() && currentVenueId !== null) {
        const venue = VENUES.find(v => v.id === currentVenueId);
        if (venue) loadDemographics(venue);
      }
    }
  });
})();
