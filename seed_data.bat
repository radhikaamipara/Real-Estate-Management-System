@echo off
title EstateNexus - Seed Demo Database
echo ===================================================
echo Resetting and Seeding EstateNexus Database (SQLite)
echo ===================================================
cd /d "%~dp0backend"
call venv\Scripts\activate.bat
python seed.py
python test_api.py
echo ===================================================
echo Database seeded and verified successfully!
echo ===================================================
pause
