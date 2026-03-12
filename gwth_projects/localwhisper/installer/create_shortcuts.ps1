# Create Desktop and Startup shortcuts for LocalWhisper
# Run: powershell -ExecutionPolicy Bypass -File installer\create_shortcuts.ps1

$ProjectDir = "C:\Projects\LocalWhisper"
$VbsPath = "$ProjectDir\scripts\launch.vbs"
$IconPath = "$ProjectDir\assets\icon_idle.ico"

$WshShell = New-Object -ComObject WScript.Shell

# --- Desktop shortcut ---
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$DesktopLnk = $WshShell.CreateShortcut("$DesktopPath\LocalWhisper.lnk")
$DesktopLnk.TargetPath = "wscript.exe"
$DesktopLnk.Arguments = "`"$VbsPath`""
$DesktopLnk.WorkingDirectory = $ProjectDir
$DesktopLnk.IconLocation = "$IconPath, 0"
$DesktopLnk.Description = "LocalWhisper - Local Speech to Text"
$DesktopLnk.WindowStyle = 7  # Minimized
$DesktopLnk.Save()
Write-Output "Created: $DesktopPath\LocalWhisper.lnk"

# --- Startup shortcut ---
$StartupPath = $WshShell.SpecialFolders("Startup")
$StartupLnk = $WshShell.CreateShortcut("$StartupPath\LocalWhisper.lnk")
$StartupLnk.TargetPath = "wscript.exe"
$StartupLnk.Arguments = "`"$VbsPath`""
$StartupLnk.WorkingDirectory = $ProjectDir
$StartupLnk.IconLocation = "$IconPath, 0"
$StartupLnk.Description = "LocalWhisper - Local Speech to Text (Auto-start)"
$StartupLnk.WindowStyle = 7  # Minimized
$StartupLnk.Save()
Write-Output "Created: $StartupPath\LocalWhisper.lnk"

Write-Output ""
Write-Output "Done! LocalWhisper will now:"
Write-Output "  - Start automatically on Windows login (3s delay)"
Write-Output "  - Be launchable from the Desktop shortcut"
