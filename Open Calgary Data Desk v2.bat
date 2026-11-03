@echo off
rem Calgary Data Desk v2 (test copy). Its own saved data in _appdata, so the working Ward 5 app is not touched.
cd /d "%~dp0"
set CDD_DATA_DIR=%~dp0_appdata
if not exist "%CDD_DATA_DIR%" mkdir "%CDD_DATA_DIR%"
if not exist "%CDD_DATA_DIR%\settings.json" if exist "%APPDATA%\Ward5DataDesk\settings.json" copy "%APPDATA%\Ward5DataDesk\settings.json" "%CDD_DATA_DIR%\settings.json" >nul
start "" "%~dp0..\ward5-data-desk\.venv\Scripts\pythonw.exe" "%~dp0app.py"
