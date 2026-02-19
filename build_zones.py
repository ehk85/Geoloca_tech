import pandas as pd
import requests
import time
import random
import geopandas as gpd
from tqdm import tqdm
from shapely.geometry import MultiPoint, Point
from shapely.ops import unary_union


# df = pd.read_csv("data\data.csv")
# df = df.dropna(subset=["Nom Technicien", "Adresse", "Ville"])
# df["adresse_complete"] = df["Adresse"] + ", " + df["Ville"] + ", France"

# print("Nombre de lignes :", len(df))

# def geocode(address):
#     url = "https://nominatim.openstreetmap.org/search"
#     params = {
#         "q" : address,
#         "format" : "json",
#         "limit" : 1
#     }
#     headers = {"User-Agent" : "Zone-tech-app"}

#     response = requests.get(url, params=params, headers=headers)
#     data = response.json()

#     if data:
#         return float(data[0]["lon"]), float(data[0]["lat"])
#     return None, None

# longitudes = []
# latitudes = []

# for adresse in tqdm(df["adresse_complete"]):
#     lon, lat = geocode(adresse)
#     longitudes.append(lon)
#     latitudes.append(lat)
#     time.sleep(1)

# df["longitude"] = longitudes
# df["latitude"] = latitudes

# df = df.dropna(subset=["longitude", "latitude"])


# df.to_csv("data\data_geocoded.csv", index=False)

df = pd.read_csv("data\data_geocoded.csv")

zone_secteurs = {}

for secteur, group in df.groupby("Secteur Inter."):
    points = MultiPoint(list(zip(group["longitude"], group["latitude"])))
    polygon = points.convex_hull
    zone_secteurs[secteur] = polygon


zones_techniciens = []

for tech, group in df.groupby("Nom Technicien"):

    secteurs = group["Secteur Inter."].unique()

    polygones = [zone_secteurs[s] for s in secteurs if s in zone_secteurs]

    zone_finale = unary_union(polygones)

    couleur = "#%06x" % random.randint(0, 0xFFFFFF)

    zones_techniciens.append({
        "technicien": tech,
        "agences": list(group["Agence"].unique()),
        "secteurs": list(secteurs),
        "couleur": couleur,
        "geometry": zone_finale
    })


gdf = gpd.GeoDataFrame(zones_techniciens)
gdf = gdf.set_geometry("geometry")
gdf = gdf.set_crs(epsg=4326)
gdf = gdf.to_crs(epsg=4326)
gdf.to_file("output/zones_techniciens.geojson", driver="GeoJSON")

points = []

for _, row in df.iterrows():
    points.append({
        "technicien": row["Nom Technicien"],
        "secteur": row["Secteur Inter."],
        "geometry": Point(row["longitude"], row["latitude"])
    })

gdf_points = gpd.GeoDataFrame(points)
gdf_points = gdf_points.set_geometry("geometry")
gdf = gdf.set_crs(epsg=4326)
gdf = gdf.to_crs(epsg=4326)
gdf_points.to_file("output/points_techniciens.geojson", driver="GeoJSON")


