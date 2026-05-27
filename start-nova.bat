@echo off
title Nova Development Servers
echo Démarrage de Nova...
echo.

REM Ouvrir Terminal 1 pour le Frontend
start "Frontend Nova" cmd /k "cd /d c:\wamp64\www\nova\frontend & npm start"

REM Ouvrir Terminal 2 pour le Backend
start "Backend Nova" cmd /k "cd /d c:\wamp64\www\nova\backend & c:\wamp64\bin\php\php8.4.15\php.exe -S localhost:8000 -t public"

timeout /t 3 /nobreak
echo.
echo ✅ Frontend: http://localhost:3000
echo ✅ Backend:  http://localhost:8000
echo.
pause