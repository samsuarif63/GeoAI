# 🌏 My Free WebGIS - Jakarta Landmark

Proyek WebGIS sederhana yang dibangun menggunakan **Flask (Python)** dan **Leaflet.js**. Dirancang khusus untuk dapat berjalan di lingkungan hosting gratis dengan performa tinggi.

## 🚀 Fitur Utama
- **Backend Flask**: API dinamis untuk melayani data geospasial (GeoJSON).
- **Leaflet.js Frontend**: Peta interaktif yang ringan dan responsif.
- **Isolasi Project**: Menggunakan Python Virtual Environment (`venv`).
- **Custom Port**: Berjalan di port `5100` untuk menghindari konflik port.

## 🛠️ Persyaratan Sistem
- Python 3.x
- Pip (Python Package Manager)

## 📥 Cara Instalasi

1. **Clone repositori ini**:
   ```bash
   git clone <url-repo-anda>
   cd webgis_project
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

## 🎮 Cara Menjalankan
Pastikan virtual environment telah aktif, lalu jalankan:
```bash
python app.py
```
Akses di browser melalui: **[http://127.0.0.1:5100](http://127.0.0.1:5100)**

## 🌐 Rencana Deployment (Gratis)
Proyek ini siap di-deploy ke:
- **Hosting**: Render.com atau Railway.app (Gunakan `gunicorn` sesuai yang ada di `requirements.txt`).
- **Database**: Supabase (PostgreSQL + PostGIS) untuk penyimpanan data spasial skala besar.

## 📂 Struktur Folder
```text
webgis_project/
├── app.py             # Server Flask & API
├── requirements.txt   # Daftar Library
├── venv/              # Virtual Environment (Jangan di-upload ke Git)
├── templates/         # File HTML/Frontend
│   └── index.html     # Peta Leaflet
└── README.md          # Dokumentasi Proyek
```

---
*Dibuat dengan bantuan Antigravity AI.*
