from flask import Flask, render_template, jsonify, request, Response
import os
import zipfile
import geopandas as gpd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import json
import time
import pandas as pd
from datetime import datetime
from shapely.geometry import box, Point
import sqlite3

load_dotenv()

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database Configuration for SQLite/SpatiaLite
DB_PATH = os.path.join(os.path.abspath(os.path.dirname(__file__)), "spatial_database.db")
connection_url = f"sqlite:///{DB_PATH}"
engine = create_engine(connection_url)

def init_spatial_db():
    """Ensure the database has SpatiaLite initialization if needed."""
    if not os.path.exists(DB_PATH):
        # Create empty sqlite
        conn = sqlite3.connect(DB_PATH)
        conn.close()
    
    # We will primarily use GeoPandas for spatial writes/reads 
    # as it's more portable than requiring mod_spatialite in the SQL engine.
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS layer_registry (
                table_name TEXT PRIMARY KEY,
                display_name TEXT,
                created_at TEXT,
                geometry_type TEXT
            )
        """))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    import uuid
    upload_id = str(uuid.uuid4())
    session_folder = os.path.join(UPLOAD_FOLDER, upload_id)
    os.makedirs(session_folder, exist_ok=True)

    filename = file.filename
    file_path = os.path.join(session_folder, filename)
    file.save(file_path)

    try:
        # Menangani ZIP (Shapefile)
        if filename.endswith('.zip'):
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(session_folder)
                shp_file = None
                for root, dirs, files in os.walk(session_folder):
                    for extracted_file in files:
                        if extracted_file.endswith('.shp'):
                            shp_file = os.path.join(root, extracted_file)
                            break
                if not shp_file:
                    return jsonify({"error": "No .shp file found in ZIP"}), 400
                gdf = gpd.read_file(shp_file)
        # Menangani GeoJSON
        elif filename.endswith('.geojson') or filename.endswith('.json'):
            gdf = gpd.read_file(file_path)
        else:
            return jsonify({"error": "Unsupported file format. Use .zip (Shapefile) or .geojson"}), 400

        # Transformasi ke WGS84
        if gdf.crs and str(gdf.crs).lower() != "epsg:4326":
            gdf = gdf.to_crs(epsg=4326)
        
        # Simpan ke SQLite dengan nama tabel unik
        # Kita simpan geometry sebagai WKB agar portable secara manual
        safe_name = "".join([c if c.isalnum() else "_" for c in filename.rsplit('.', 1)[0]]).lower()
        table_name = f"layer_{int(time.time())}_{safe_name}"
        
        # Manually convert geometry to WKB (Well-Known Binary) for SQLite storage
        gdf_to_db = gdf.copy()
        gdf_to_db['geometry'] = gdf_to_db['geometry'].apply(lambda x: x.wkb if x else None)
        
        # Simpan ke SQL via Pandas (karena gdf.to_sql bawaan tidak menangani geometri di SQLite)
        gdf_to_db.to_sql(table_name, engine, if_exists='replace', index=False)

        # SIMPAN KE REGISTRI KATALOG
        layer_display_name = filename.rsplit('.', 1)[0]
        registry_data = {
            "table_name": table_name,
            "display_name": layer_display_name,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "geometry_type": str(gdf.geom_type.iloc[0]) if not gdf.empty else "Unknown"
        }
        pd.DataFrame([registry_data]).to_sql("layer_registry", engine, if_exists='append', index=False)

        return jsonify({
            "success": True,
            "table_name": table_name,
            "display_name": layer_display_name,
            "data": json.loads(gdf.to_json())
        })

    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        print(f"Upload Error: {error_msg}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/tiles/<table_name>/<int:z>/<int:x>/<int:y>.pbf')
def get_mvt(table_name, z, x, y):
    """
    Generate real MVT (Vector Tiles) using GeoPandas and mapbox-vector-tile.
    """
    try:
        from math import pi, atan, sinh, degrees
        import mapbox_vector_tile
        
        # Calculate tile bounds in 4326 for filtering
        def tile_to_4326(z, x, y):
            n = 2.0 ** z
            lon_deg = x / n * 360.0 - 180.0
            lat_rad = atan(sinh(pi * (1 - 2 * y / n)))
            lat_deg = degrees(lat_rad)
            return lon_deg, lat_deg

        west, north = tile_to_4326(z, x, y)
        east, south = tile_to_4326(z, x + 1, y + 1)
        tile_bbox = box(west, south, east, north)

        # Read specific layer from SQLite
        # In a real SpatiaLite setup, we'd use spatial SQL. 
        # Here we use GeoPandas as the "spatial engine".
        gdf = pd.read_sql(f"SELECT * FROM {table_name}", engine)
        
        if 'geometry' in gdf.columns:
            from shapely import wkb, wkt
            def parse_geom(g):
                if isinstance(g, bytes): return wkb.loads(g)
                if isinstance(g, str): return wkt.loads(g)
                return g
            gdf['geometry'] = gdf['geometry'].apply(parse_geom)
            gdf = gpd.GeoDataFrame(gdf, geometry='geometry', crs="EPSG:4326")

        # Filter by tile bbox
        gdf_tile = gdf[gdf.intersects(tile_bbox)].copy()
        
        if gdf_tile.empty:
            return "", 204

        # Convert to MVT
        # Need to convert properties to JSON-friendly format
        for col in gdf_tile.columns:
            if col != 'geometry' and gdf_tile[col].dtype == 'object':
                gdf_tile[col] = gdf_tile[col].astype(str)

        # mapbox-vector-tile expectation:
        # data = [{ 'name': layer_name, 'features': [...] }]
        features = []
        for _, row in gdf_tile.iterrows():
            props = row.drop('geometry').to_dict()
            features.append({
                'geometry': row['geometry'].wkt, # library accepts WKT or shapely
                'properties': props
            })
        
        tile_data = [{
            'name': table_name,
            'features': features
        }]
        
        # Encode
        pbf = mapbox_vector_tile.encode(tile_data, quantize_bounds=(west, south, east, north))
        
        return Response(pbf, mimetype='application/vnd.mapbox-vector-tile')

    except Exception as e:
        import traceback
        print(f"MVT Error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/catalog')
def get_catalog():
    try:
        df = pd.read_sql("SELECT * FROM layer_registry ORDER BY created_at DESC", engine)
        return df.to_json(orient='records')
    except:
        return jsonify([])

@app.route('/api/layers/<table_name>')
def get_specific_layer(table_name):
    try:
        gdf = pd.read_sql(f"SELECT * FROM {table_name}", engine)
        if 'geometry' in gdf.columns:
            from shapely import wkb, wkt
            def parse_geom(g):
                if isinstance(g, bytes): return wkb.loads(g)
                if isinstance(g, str): return wkt.loads(g)
                return g
            gdf['geometry'] = gdf['geometry'].apply(parse_geom)
            gdf = gpd.GeoDataFrame(gdf, geometry='geometry', crs="EPSG:4326")
        return jsonify(json.loads(gdf.to_json()))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/layer-attributes/<table_name>')
def get_layer_attributes(table_name):
    try:
        df = pd.read_sql(f"SELECT * FROM {table_name} LIMIT 1000", engine)
        if 'geometry' in df.columns:
            df = df.drop(columns=['geometry'])
        return df.to_json(orient='records')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/delete-layer', methods=['POST'])
def delete_layer():
    try:
        data = request.json
        table_name = data.get('table_name')
        if not table_name:
            return jsonify({"error": "No table name provided"}), 400

        with engine.begin() as conn:
            conn.execute(text(f"DROP TABLE IF EXISTS {table_name}"))
            conn.execute(text(f"DELETE FROM layer_registry WHERE table_name = :t"), {"t": table_name})
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/create-point-layer', methods=['POST'])
def create_point_layer():
    try:
        data = request.json
        layer_name = data.get('name')
        coordinates = data.get('coordinates')

        if not layer_name or not coordinates:
            return jsonify({"error": "Layer name and coordinates are required"}), 400

        df = pd.DataFrame(coordinates, columns=['lon', 'lat'])
        geometry = [Point(xy) for xy in zip(df['lon'], df['lat'])]
        gdf = gpd.GeoDataFrame(df, geometry=geometry, crs="EPSG:4326")
        gdf['id'] = range(1, len(gdf) + 1)

        table_name = f"layer_{int(time.time())}_points"
        
        # Convert to WKB for SQLite storage
        gdf_to_db = gdf.copy()
        gdf_to_db['geometry'] = gdf_to_db['geometry'].apply(lambda x: x.wkb if x else None)
        gdf_to_db.to_sql(table_name, engine, if_exists='replace', index=False)

        registry_data = {
            "table_name": table_name,
            "display_name": layer_name,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "geometry_type": "Point"
        }
        pd.DataFrame([registry_data]).to_sql("layer_registry", engine, if_exists='append', index=False)

        return jsonify({
            "success": True,
            "table_name": table_name,
            "display_name": layer_name,
            "data": json.loads(gdf.to_json())
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/status')
def status():
    return jsonify({"status": "online", "db": "spatialite_simulated"})

if __name__ == '__main__':
    init_spatial_db()
    app.run(debug=True, port=int(os.getenv("PORT", 5002)))
