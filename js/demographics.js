const ENDPOINT =
  "https://geoenrich.arcgis.com/arcgis/rest/services/World/geoenrichmentserver/GeoEnrichment/enrich";

export async function loadDemographics(venue) {
  const token = document.getElementById("apiKey").value.trim();
  const box   = document.getElementById("demoContent");

  if (!token) {
    box.innerHTML = '<div class="no-key-msg">Enter your ArcGIS API Key in the header<br/>to unlock live area demographics</div>';
    return;
  }

  box.innerHTML = '<div class="loading-row"><div class="spinner"></div><span>Fetching GeoEnrichment data\u2026</span></div>';

  try {
    const studyAreas = JSON.stringify([{
      geometry: { x: venue.lng, y: venue.lat, spatialReference: { wkid: 4326 } }
    }]);

    const studyAreasOptions = JSON.stringify({
      areaType: "RingBuffer",
      bufferUnits: "esriMiles",
      bufferRadii: [1]
    });

    const params = new URLSearchParams({
      studyAreas,
      studyAreasOptions,
      dataCollections:  JSON.stringify(["KeyGlobalFacts"]),
      returnGeometry:   "false",
      f:                "json",
      token
    });

    const res  = await fetch(ENDPOINT + "?" + params.toString());
    const data = await res.json();

    if (data.error) throw new Error(data.error.message || ("Error " + data.error.code));

    const attrs = data.results?.[0]?.value?.features?.[0]?.attributes;
    if (!attrs) throw new Error("No demographic data returned for this location.");

    renderDemo(attrs, venue.name);
    document.getElementById("apiDot").className = "api-dot ready";

  } catch (err) {
    box.innerHTML =
      `<div class="demo-error"><strong>Could not load demographics</strong><br/>${err.message}</div>`;
    document.getElementById("apiDot").className = "api-dot typing";
  }
}

// Try key in original, UPPER, and lower case forms
function pick(a, ...keys) {
  for (const k of keys) {
    if (a[k]              != null) return a[k];
    if (a[k.toUpperCase()] != null) return a[k.toUpperCase()];
    if (a[k.toLowerCase()] != null) return a[k.toLowerCase()];
  }
  return null;
}

function fmt(v, opts = {}) {
  if (v == null) return "N/A";
  const n = parseFloat(v);
  if (isNaN(n)) return "N/A";
  if (opts.currency) return "$" + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (opts.dec != null) return n.toLocaleString(undefined, {
    minimumFractionDigits: opts.dec, maximumFractionDigits: opts.dec
  });
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function renderDemo(a, vname) {
  const pop   = pick(a, "TOTPOP",     "TOTPOP_CY",   "totpop");
  const hh    = pick(a, "TOTHH",      "TOTHH_CY",    "tothh");
  const inc   = pick(a, "MEDHINC_CY", "MEDHINC",     "medhinc_cy");
  const age   = pick(a, "MEDAGE_CY",  "MEDAGE",      "medage_cy");
  const dens  = pick(a, "POPDENS_CY", "POPDENS",     "popdens_cy");
  const avgHH = pick(a, "AVGHHSZ_CY", "AVGHHSZ",     "avghhsz_cy");
  const males = pick(a, "MALES",      "MALES_CY",    "males");
  const fems  = pick(a, "FEMALES",    "FEMALES_CY",  "females");
  const owner = pick(a, "OWNER_CY",   "OWNEROCC_CY", "owner_cy");
  const renter= pick(a, "RENTER_CY",  "RENTOCC_CY",  "renter_cy");

  const sexRow = (males != null && fems != null) ?
    `<div class="dcard"><div class="d-lbl">Male Population</div><div class="d-val">${fmt(males)}</div><div class="d-sub">male residents</div></div>
     <div class="dcard"><div class="d-lbl">Female Population</div><div class="d-val">${fmt(fems)}</div><div class="d-sub">female residents</div></div>` : "";

  const housingRow = (owner != null || renter != null) ?
    `<div class="dcard"><div class="d-lbl">Owner Occupied</div><div class="d-val">${fmt(owner)}</div><div class="d-sub">owner households</div></div>
     <div class="dcard"><div class="d-lbl">Renter Occupied</div><div class="d-val">${fmt(renter)}</div><div class="d-sub">renter households</div></div>` : "";

  document.getElementById("demoContent").innerHTML =
    `<div class="dgrid">
      <div class="dcard full">
        <div class="d-lbl">Total Population (1-Mile Radius)</div>
        <div class="d-val">${fmt(pop)}</div>
        <div class="d-sub">residents surrounding ${vname}</div>
      </div>
      <div class="dcard"><div class="d-lbl">Median Age</div><div class="d-val">${fmt(age, {dec:1})}</div><div class="d-sub">years old</div></div>
      <div class="dcard"><div class="d-lbl">Total Households</div><div class="d-val">${fmt(hh)}</div><div class="d-sub">household units</div></div>
      <div class="dcard full">
        <div class="d-lbl">Median Household Income</div>
        <div class="d-val">${fmt(inc, {currency:true})}</div>
        <div class="d-sub">annual household income</div>
      </div>
      <div class="dcard"><div class="d-lbl">Population Density</div><div class="d-val">${fmt(dens)}</div><div class="d-sub">per square mile</div></div>
      <div class="dcard"><div class="d-lbl">Avg Household Size</div><div class="d-val">${fmt(avgHH, {dec:2})}</div><div class="d-sub">persons per household</div></div>
      ${sexRow}
      ${housingRow}
    </div>
    <div class="demo-src">Esri GeoEnrichment Service &bull; 1-mile ring buffer &bull; Current year estimates</div>`;
}
