#!/bin/bash

# Script ini digunakan untuk mempermudah proses pembaruan (deployment) di PythonAnywhere.
# Pastikan Anda mengaktifkan virtualenv yang benar sebelum menjalankan script ini.

echo "🚀 Memulai proses update WebGIS di PythonAnywhere..."

# 1. Menarik kode terbaru dari GitHub
echo "📥 Menarik kode terbaru dari GitHub (main branch)..."
git pull origin main

# 2. Menginstal library baru dari requirements.txt
echo "📦 Mengupdate library Python di Virtual Environment..."
# Ganti path venv di bawah jika nama/lokasi virtualenv Anda berbeda di server
if [ -d "venv" ]; then
    source venv/bin/activate
    pip install -r requirements.txt
else
    echo "⚠️ Folder 'venv' tidak ditemukan. Menginstal library secara global (atau pastikan virtualenv sudah aktif)..."
    pip install -r requirements.txt
fi

# 3. Reload Web App (Trigger restart server PythonAnywhere)
# File WSGI biasanya ada di folder /var/www/
# Script ini mencoba mencari file WSGI Anda untuk melakukan 'touch'
WSGI_FILE="/var/www/$(whoami)_pythonanywhere_com_wsgi.py"

if [ -f "$WSGI_FILE" ]; then
    echo "🔄 Merestart server PythonAnywhere (touching WSGI file)..."
    touch "$WSGI_FILE"
    echo "✅ Berhasil! Silakan cek website Anda."
else
    echo "⚠️ File WSGI tidak ditemukan di $WSGI_FILE"
    echo "💡 Silakan lakukan 'Reload' secara manual melalui Tab 'Web' di Dashboard PythonAnywhere."
fi
