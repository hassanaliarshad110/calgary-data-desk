@echo off
rem Makes the "Calgary Data Desk" desktop shortcut with Windows' own shortcut maker, then opens the app.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0make_shortcut.ps1" > "%~dp0_shortcut_log.txt" 2>&1
type "%~dp0_shortcut_log.txt"
if errorlevel 1 (
  echo The shortcut could not be made.
  pause
  exit /b 1
)
timeout /t 3 >nul
