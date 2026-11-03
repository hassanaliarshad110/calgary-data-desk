@echo off
title Ward 5 Data Desk
cd /d "%~dp0"

rem ---- first run: create a private Python environment and install pywebview ----
if not exist ".venv\Scripts\pythonw.exe" (
  echo Setting up Ward 5 Data Desk for the first time. This takes a minute...
  where py >nul 2>nul && (py -3 -m venv .venv) || (python -m venv .venv)
  if not exist ".venv\Scripts\python.exe" (
    echo.
    echo Python 3 was not found. Install it from https://www.python.org/downloads/
    echo and tick "Add Python to PATH" during setup, then run this file again.
    pause
    exit /b 1
  )
  ".venv\Scripts\python.exe" -m pip install --upgrade pip >nul
  ".venv\Scripts\python.exe" -m pip install -r requirements.txt
  if errorlevel 1 (
    echo Installing failed. Check the internet connection and run this file again.
    pause
    exit /b 1
  )
  rem ---- desktop shortcut ----
  powershell -NoProfile -Command "$d=[Environment]::GetFolderPath('Desktop'); $s=(New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path $d 'Ward 5 Data Desk.lnk')); $s.TargetPath='%~dp0run.bat'; $s.WorkingDirectory='%~dp0'; $s.WindowStyle=7; $s.IconLocation='%~dp0ui\logo.ico'; $s.Save()"
  echo Done. A "Ward 5 Data Desk" shortcut is on your desktop.
)

start "" ".venv\Scripts\pythonw.exe" app.py
