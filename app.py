from flask import Flask, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

# Konkursasi Database SQLite
# File database akan tersimpan sebagai 'database.db' di folder project
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Definisi Tabel Database (Model)
class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

# Fungsi untuk membuat database dan data awal (Seeding)
def init_db():
    with app.app_context():
        db.create_all()
        # Jika database kosong, isi dengan data Makassar
        if Location.query.count() == 0:
            locations = [
                Location(name="Pantai Losari", description="Ikon Kota Makassar", latitude=-5.1441, longitude=119.4082),
                Location(name="Benteng Rotterdam", description="Benteng peninggalan Kerajaan Gowa", latitude=-5.1334, longitude=119.4052),
                Location(name="Pelabuhan Paotere", description="Pelabuhan perahu tradisional Pinisi", latitude=-5.1166, longitude=119.4144)
            ]
            db.session.bulk_save_objects(locations)
            db.session.commit()
            print("Database berhasil dibuat dan diisi data awal!")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    locations = Location.query.all()
    # Ubah data database menjadi GeoJSON agar bisa dibaca Leaflet
    features = []
    for loc in locations:
        feature = {
            "type": "Feature",
            "properties": {
                "name": loc.name,
                "description": loc.description
            },
            "geometry": {
                "type": "Point",
                "coordinates": [loc.longitude, loc.latitude]
            }
        }
        features.append(feature)
    
    return jsonify({
        "type": "FeatureCollection",
        "features": features
    })

if __name__ == '__main__':
    init_db()  # Jalankan inisialisasi database
    app.run(debug=True, port=5100)

