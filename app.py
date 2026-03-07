from flask import Flask, render_template, jsonify

app = Flask(__name__)

# Data koordinat contoh (GeoJSON format)
# Di masa depan, ini diambil dari Database PostGIS (lewat Supabase gratis)
points_data = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Pantai Losari",
                "description": "Ikon Kota Makassar yang terkenal dengan kulinernya."
            },
            "geometry": {"type": "Point", "coordinates": [119.4082, -5.1441]}
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Benteng Rotterdam",
                "description": "Benteng peninggalan Kerajaan Gowa-Tallo."
            },
            "geometry": {"type": "Point", "coordinates": [119.4052, -5.1334]}
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Pelabuhan Paotere",
                "description": "Pelabuhan perahu tradisional Pinisi."
            },
            "geometry": {"type": "Point", "coordinates": [119.4144, -5.1166]}
        }
    ]
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    return jsonify(points_data)

if __name__ == '__main__':
    app.run(debug=True, port=5100)

