const map = L.map('map').setView([45.75, 4.85], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
  .addTo(map);

// Zones
fetch("output/zones_techniciens.geojson")
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: feature => ({
        color: feature.properties.couleur,
        fillOpacity: 0.2
      }),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <b>${feature.properties.technicien}</b><br>
          Secteurs : ${feature.properties.secteurs.join(", ")}<br>
          Agences : ${feature.properties.agences.join(", ")}
        `);
      }
    }).addTo(map);
  });

// Points rouges
fetch("output/points_techniciens.geojson")
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 4,
          color: "red"
        });
      }
    }).addTo(map);
  });
