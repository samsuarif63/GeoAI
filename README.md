# 🌏 GeoAI TerraGIS - Spatial Intelligence Platform (SpatiaLite Edition)

Platform WebGIS tingkat lanjut yang menggabungkan kekuatan **GeoPandas**, **SpatiaLite**, dan **Leaflet.js** untuk analisis spasial dan manajemen aset. Proyek ini merupakan migrasi dari platform berbasis PostGIS ke arsitektur **SQLite/SpatiaLite** yang lebih ringan namun tetap memiliki performa tinggi.

👉 **Live Demo**: [samsu.pythonanywhere.com](http://samsu.pythonanywhere.com)

## 🚀 Fitur Unggulan
- **💎 Enterprise UI/UX**: Desain "Dark Matter" yang premium dengan *dynamic toolbars*, *animated sidebar*, dan *inset maps*.
- **🗄️ Spatial Engine (SpatiaLite)**: Menggunakan SQLite dengan kapabilitas spasial untuk penyimpanan data geospasial yang persisten dan cepat.
- **⚡ Real-time Vector Tiles (MVT)**: Mendukung tile geospasial yang digenerate secara dinamis dari database untuk performa visual optimal.
- **📁 Advanced Data Processing**: Fitur upload otomatis untuk Shapefile (.zip) dan GeoJSON langsung ke skema database.
- **📊 Attribute Intelligence**: Tabel atribut interaktif yang terintegrasi dengan peta untuk filtrasi data.
- **📍 Coordinate Plotting**: Alat plotting koordinat massal untuk memetakan titik secara manual.

## 🛠️ Stack Teknologi
- **Backend**: Python, Flask, GeoPandas, SQLAlchemy, SpatiaLite (via SQLite), Mapbox-Vector-Tile
- **Frontend**: HTMX, Leaflet.js, Leaflet.VectorGrid, Vanilla CSS (Premium Dark Mode)
- **Data Format**: SHP, GeoJSON, Vector Tiles (.pbf)

## 📥 Cara Instalasi Lokal

1. **Clone repositori**:
   ```bash
   git clone https://github.com/samsuarif63/GeoAI.git
   cd webgis_project
   ```

2. **Setup Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Instal Library (Termasuk SpatiaLite dependencies)**:
   ```bash
   pip install -r requirements.txt
   ```

## 🎮 Cara Menjalankan
Jalankan server Flask:
```bash
python app.py
```
Akses di browser: **[http://127.0.0.1:5002](http://127.0.0.1:5002)**

## 📂 Struktur Folder
```text
webgis_project/
├── app.py                 # Core Engine (Flask + GeoPandas Logic)
├── spatial_database.db    # Database SpatiaLite (Auto-generated)
├── static/                # Assets: CSS, Premium JS (map.js), Images
├── templates/             # UI Components (index.html)
├── requirements.txt       # Dependencies (Geometric & Web)
└── README.md              # Documentation
```

---
*Dikembangkan oleh Samsu Arif dengan dukungan Antigravity AI - Memberdayakan Intelijen Spasial.*
