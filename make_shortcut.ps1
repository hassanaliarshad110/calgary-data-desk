# Makes the "Calgary Data Desk" desktop shortcut with Windows' own shortcut maker.
$ErrorActionPreference = 'Stop'
$app = Split-Path -Parent $MyInvocation.MyCommand.Path
$pyw = [IO.Path]::GetFullPath((Join-Path $app '..\ward5-data-desk\.venv\Scripts\pythonw.exe'))
if (-not (Test-Path $pyw)) { throw "Python not found at $pyw" }
$desk = [Environment]::GetFolderPath('Desktop')
$lnk = Join-Path $desk 'Calgary Data Desk.lnk'
if (Test-Path $lnk) { Remove-Item $lnk -Force }
$s = (New-Object -ComObject WScript.Shell).CreateShortcut($lnk)
$s.TargetPath = $pyw
$s.Arguments = '"' + (Join-Path $app 'app.py') + '"'
$s.WorkingDirectory = $app
$s.IconLocation = (Join-Path $app 'ui\logo.ico') + ',0'
$s.Description = 'Calgary Data Desk'
$s.Save()
"Shortcut made: $lnk"
"Target: $pyw"
"Desktop folder: $desk"
