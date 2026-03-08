# 🌏 My Free WebGIS - Makassar Landmark

Proyek WebGIS sederhana yang dibangun menggunakan **Flask (Python)** dan **Leaflet.js**. Dirancang khusus untuk menampilkan lokasi bersejarah di Kota Makassar dan dapat berjalan di lingkungan hosting gratis dengan performa tinggi.

👉 **Live Demo**: [samsu.pythonanywhere.com](http://samsu.pythonanywhere.com)

## 🚀 Fitur Utama
- **Backend Flask**: API dinamis untuk melayani data geospasial (GeoJSON).
- **Leaflet.js Frontend**: Peta interaktif yang ringan dan responsif (OpenStreetMap).
- **Isolasi Project**: Menggunakan Python Virtual Environment (`venv`) untuk menjaga dependensi tetap rapi.
- **Custom Port**: Diatur berjalan di port `5100` untuk menghindari konflik port saat development lokal.

## 🛠️ Persyaratan Sistem
- Python 3.10+
- Pip (Python Package Manager)
- Git

## 📥 Cara Instalasi Lokal

1. **Clone repositori ini**:
   ```bash
   git clone https://github.com/samsuarif63/GeoAI.git
   cd GeoAI
   ```

2. **Buat & Aktifkan Virtual Environment**:
   ```bash
   # Di macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Instal Dependensi**:
   ```bash
   pip install -r requirements.txt
   ```

## 🎮 Cara Menjalankan Lokal
Pastikan virtual environment telah aktif, lalu jalankan:
```bash
python app.py
```
Akses di browser melalui: **[http://127.0.0.1:5100](http://127.0.0.1:5100)**

## 🌐 Deployment (Gratis)
Proyek ini telah berhasil ditayangkan di:
- **Hosting**: [PythonAnywhere](https://www.pythonanywhere.com/) (Gratis selamanya).
- **Repository**: GitHub [samsuarif63/GeoAI](https://github.com/samsuarif63/GeoAI).

## 📂 Struktur Folder
```text
webgis_project/
├── app.py             # Server Flask & API (Makassar Center)
├── requirements.txt   # Daftar Library (Flask, Gunicorn)
├── venv/              # Virtual Environment (Di-ignore oleh git)
├── templates/         # File HTML/Frontend
│   └── index.html     # Peta Leaflet (Custom Center Makassar)
├── .gitignore         # Daftar file/folder yang tidak di-upload ke Git
└── README.md          # Dokumentasi Proyek
```

---
*Dibuat oleh Samsu Arif dengan bantuan Antigravity AI.*
