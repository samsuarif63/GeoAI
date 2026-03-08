# 🌏 Makassar WebGIS - Premium Landmark Edition

Proyek WebGIS interaktif yang menampilkan lokasi bersejarah dan landmark ikonik di Kota Makassar. Dibangun dengan fokus pada estetika modern (**Premium Glassmorphism**) dan performa tinggi menggunakan **Flask** dan **Leaflet.js**.

👉 **Live Demo**: [samsu.pythonanywhere.com](http://samsu.pythonanywhere.com)

## 🚀 Fitur Unggulan
- **💎 Premium UI/UX**: Antarmuka modern dengan efek *Glassmorphism*, tipografi *Outfit* dari Google Fonts, dan desain yang responsif.
- **🗄️ Database SQLite**: Penyimpanan data lokasi yang persisten menggunakan **SQLAlchemy** (tidak lagi hardcoded).
- **🗺️ Layer Switcher**: Kemudahan berpindah antara tampilan peta jalan (OpenStreetMap) dan citra satelit (Esri).
- **🛰️ GeoJSON API**: Backend Flask menyediakan data geospasial secara dinamis untuk konsumsi frontend.
- **⚡ Automated Deployment**: Script khusus untuk pembaruan cepat di server PythonAnywhere.

## 🛠️ Stack Teknologi
- **Backend**: Python, Flask, Flask-SQLAlchemy, SQLite
- **Frontend**: HTML5, Vanilla CSS (Glassmorphism), JavaScript, Leaflet.js
- **Icons & Fonts**: Google Fonts (Outfit)
- **Deployment**: Git, PythonAnywhere

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

3. **Instal Library**:
   ```bash
   pip install -r requirements.txt
   ```

## 🎮 Cara Menjalankan
Jalankan server Flask:
```bash
python app.py
```
Akses di browser: **[http://127.0.0.1:5100](http://127.0.0.1:5100)**

## 🌐 Deployment (PythonAnywhere)
Proyek ini dilengkapi dengan script `deploy_pa.sh` untuk me-refresh aplikasi di hosting secara otomatis:

1. Masuk ke Bash Console PythonAnywhere.
2. Masuk ke folder project, lalu jalankan:
   ```bash
   ./deploy_pa.sh
   ```

## 📂 Struktur Folder
```text
webgis_project/
├── app.py             # Server Flask, Model Database, & API
├── database.db        # Database SQLite (Auto-generated)
├── requirements.txt   # Daftar dependensi (Flask, SQLAlchemy, dll)
├── deploy_pa.sh       # Script otomasi deployment PythonAnywhere
├── templates/
│   └── index.html     # Frontend Peta (Premium UI & Leaflet)
└── README.md          # Dokumentasi Proyek
```

---
*Dibuat dengan ❤️ oleh Samsu Arif dengan dukungan Antigravity AI.*
