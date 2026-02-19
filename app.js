const map = L.map('map').setView([45.75, 4.85], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
  .addTo(map);

let dataComplete = [];
let zonesSecteurs;
let zonesTechniciens;
let pointsLayer;
let secteursLayer;
let techLayer;

// Chargement de la source complète
fetch("data/data_geocoded.csv")
  .then(res => res.json())
  .then(data => {
    dataComplete = data;
    drawPoints(dataComplete);
    initFilters();
  });

// Charger zones secteurs
fetch("zones_secteurs.geojson")
  .then(res => res.json())
  .then(data => {
    zonesSecteurs = data;
  });

// Charger zones techniciens
fetch("output/zones_techniciens.geojson")
  .then(res => res.json())
  .then(data => {
    zonesTechniciens = data;
  });
  
function drawPoints(data) {
  if (pointsLayer) map.removeLayer(pointsLayer);

  pointsLayer = L.layerGroup();

  data.forEach(d => {
    const marker = L.circleMarker(
      [d.latitude, d.longitude],
      { radius: 4, color: "red", fillOpacity: 0.8 }
    );

    marker.bindPopup(`
      <b>${d["Nom Technicien"]}</b><br>
      Secteur: ${d["Secteur Inter."]}<br>
      ${d.Adresse}<br>
      ${d.Ville}
    `);

    pointsLayer.addLayer(marker);
  });

  pointsLayer.addTo(map);
}

function searchTechnicien(name) {
  const filtered = dataComplete.filter(d =>
    d["Nom Technicien"].toLowerCase().includes(name.toLowerCase())
  );
  drawPoints(filtered);
}

function searchAdresse(text) {
  const filtered = dataComplete.filter(d =>
    (d.Adresse + " " + d.Ville).toLowerCase().includes(text.toLowerCase())
  );
  drawPoints(filtered);
}

function filterBySecteur(secteurCode) {
  const filtered = dataComplete.filter(d =>
    d["Secteur Inter."] == secteurCode
  );
  drawPoints(filtered);

  const secteurZone = zonesSecteurs.features.filter(f =>
    f.properties.secteur == secteurCode
  );

  if (secteursLayer) map.removeLayer(secteursLayer);

  secteursLayer = L.geoJSON(secteurZone, {
    style: { color: "blue", fillOpacity: 0.2 }
  }).addTo(map);
}


function showIntersection(tech1, tech2) {
  const z1 = zonesTechniciens.features.find(f =>
    f.properties.technicien === tech1
  );

  const z2 = zonesTechniciens.features.find(f =>
    f.properties.technicien === tech2
  );

  const intersection = turf.intersect(z1, z2);

  if (intersection) {
    L.geoJSON(intersection, {
      style: { color: "yellow", fillOpacity: 0.5 }
    }).addTo(map);
  }
}
