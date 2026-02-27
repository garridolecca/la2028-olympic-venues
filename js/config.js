import esriConfig from "@arcgis/core/config.js";

// Must be set before any ArcGIS module requests assets (fonts, icons, workers)
esriConfig.assetsPath = "https://js.arcgis.com/4.29/@arcgis/core/assets";

export { esriConfig };

export function setApiKey(key) {
  esriConfig.apiKey = key;
}
