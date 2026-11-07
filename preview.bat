@echo off
REM Aperçu local du site SOMACOS : http://localhost:8080
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:8080
  npx --yes serve@14.2.4 site -l 8080
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:8080
  python -m http.server 8080 --directory site
  goto :eof
)
echo Node.js ou Python est necessaire pour l'apercu local.
echo Installez Node.js depuis https://nodejs.org puis relancez ce fichier.
pause
