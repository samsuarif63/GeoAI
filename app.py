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
                "name": "Monumen Nasional (Monas)",
                "description": "Ikon Kota Jakarta"
            },
            "geometry": {"type": "Point", "coordinates": [106.827153, -6.175400]}
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Kota Tua Jakarta",
                "description": "Kawasan Bersejarah di Jakarta"
            },
            "geometry": {"type": "Point", "coordinates": [106.812395, -6.134375]}
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

