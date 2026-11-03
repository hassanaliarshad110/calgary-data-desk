@echo off
title Calgary Data Desk v2: live check
cd /d "%~dp0"
set CDD_DATA_DIR=%~dp0_appdata
echo Building the whole city and Wards 5 and 10 live from the City. This takes a few minutes...
"%~dp0..\ward5-data-desk\.venv\Scripts\python.exe" "%~dp0live_check.py" %*
echo.
echo Finished. The results are in _live_check.txt.
pause
