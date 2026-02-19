const map = L.map('map').setView([45.75, 4.85], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
  .addTo(map);

let zonesLayer;
let pointsLayer;
let zonesData;
let pointsData;

const techSelect = document.getElementById("techSelect");
const zoneSelect = document.getElementById("zoneSelect");

// Charger zones
fetch("output/zones_techniciens.geojson")
  .then(res => res.json())
  .then(data => {
    zonesData = data;
    populateFilters();
    drawZones(data.features);
  });

// Charger points
fetch("output/points_techniciens.geojson")
  .then(res => res.json())
  .then(data => {
    pointsData = data;
    drawPoints(data.features);
  });

function drawZones(features) {
  if (zonesLayer) map.removeLayer(zonesLayer);

  zonesLayer = L.geoJSON(features, {
    style: f => ({
      color: f.properties.couleur,
      fillOpacity: 0.3,
      weight: 2
    })
  }).addTo(map);
}

function drawPoints(features) {
  if (pointsLayer) map.removeLayer(pointsLayer);

  pointsLayer = L.geoJSON(features, {
    pointToLayer: (f, latlng) =>
      L.circleMarker(latlng, {
        radius: 4,
        color: "red",
        fillOpacity: 0.8
      })
  }).addTo(map);
}

function populateFilters() {
  const techs = [...new Set(zonesData.features.map(f => f.properties.technicien))];
  techs.forEach(t => {
    const option = document.createElement("option");
    option.value = t;
    option.textContent = t;
    techSelect.appendChild(option);
  });

  const zones = [...new Set(pointsData?.features?.map(f => f.properties.secteur))];
  zones.forEach(z => {
    const option = document.createElement("option");
    option.value = z;
    option.textContent = z;
    zoneSelect.appendChild(option);
  });
}

techSelect.addEventListener("change", () => {
  const selected = [...techSelect.selectedOptions].map(o => o.value);
  const filtered = zonesData.features.filter(f =>
    selected.includes(f.properties.technicien)
  );
  drawZones(filtered);
});

function showIntersection() {
  const selected = [...techSelect.selectedOptions].map(o => o.value);
  if (selected.length !== 2) {
    alert("Sélectionne exactement 2 techniciens");
    return;
  }

  const zone1 = zonesData.features.find(f => f.properties.technicien === selected[0]);
  const zone2 = zonesData.features.find(f => f.properties.technicien === selected[1]);

  const intersection = turf.intersect(zone1, zone2);

  if (intersection) {
    L.geoJSON(intersection, {
      style: {
        color: "yellow",
        fillOpacity: 0.6
      }
    }).addTo(map);
  }
}
