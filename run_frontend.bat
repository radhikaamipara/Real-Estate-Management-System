@echo off
title EstateNexus - Frontend Dev Server (Port 5173)
echo ===================================================
echo Starting EstateNexus React Vite Frontend Server
echo Web App will run on http://127.0.0.1:5173
echo ===================================================
cd /d "%~dp0frontend"
if not exist "node_modules\" (
    echo Installing node dependencies...
    npm install
)
npm run dev -- --host 127.0.0.1
pause
