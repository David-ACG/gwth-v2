' LocalWhisper - Silent launcher (no console window)
' Place a shortcut to this file in shell:startup for auto-start
'
' Uses launch_wrapper.pyw which catches errors and logs them,
' since pythonw.exe silently swallows all exceptions.

Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Projects\LocalWhisper"

' Small delay on startup to let audio services initialize
WScript.Sleep 3000

WshShell.Run """C:\Projects\LocalWhisper\.venv\Scripts\pythonw.exe"" ""C:\Projects\LocalWhisper\scripts\launch_wrapper.pyw""", 0, False
