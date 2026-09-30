@echo off
title EstateNexus - Backend Server (Port 5000)
echo ===================================================
echo Starting EstateNexus Python Flask Backend Server
echo API will run on http://127.0.0.1:5000
echo ===================================================
cd /d "%~dp0backend"
if not exist "venv\Scripts\python.exe" (
    echo Python virtual environment not found. Creating venv...
    py -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    python seed.py
)
call venv\Scripts\activate.bat
python run.py
pause
