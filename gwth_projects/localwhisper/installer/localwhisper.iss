; LocalWhisper Inno Setup Script
; Packages the PyInstaller output into a Windows installer.
;
; Prerequisites:
;   1. Build PyInstaller first: pyinstaller installer/localwhisper.spec
;   2. Then run: iscc installer/localwhisper.iss
;
; Output: installer/Output/LocalWhisper-Setup-0.1.0.exe

#define MyAppName "LocalWhisper"
#define MyAppVersion "0.1.0"
#define MyAppPublisher "LocalWhisper"
#define MyAppURL "https://github.com/David-ACG/LocalWhisper"
#define MyAppExeName "localwhisper.exe"

[Setup]
AppId={{E8A2F3D1-7B4C-4E5F-9A1D-3C8B2E6F0D4A}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
; Output to installer/Output/
OutputDir=Output
OutputBaseFilename=LocalWhisper-Setup-{#MyAppVersion}
SetupIconFile=..\assets\icon_idle.ico
UninstallDisplayIcon={app}\localwhisper.exe
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
; Require 64-bit Windows 10+
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0
PrivilegesRequired=lowest
DisableProgramGroupPage=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "startwithwindows"; Description: "Start LocalWhisper when Windows starts"; GroupDescription: "Startup:"

[Files]
; All files from PyInstaller onedir output
Source: "..\dist\localwhisper\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; Start Menu shortcut
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"
; Desktop shortcut (optional)
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Registry]
; Run at Windows startup (optional, user-level)
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "LocalWhisper"; ValueData: """{app}\{#MyAppExeName}"""; Flags: uninsdeletevalue; Tasks: startwithwindows

[Run]
; Option to launch after install
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Dirs]
; Create user data directories in %APPDATA%
Name: "{userappdata}\{#MyAppName}\config"
Name: "{userappdata}\{#MyAppName}\data"
Name: "{userappdata}\{#MyAppName}\models"

[UninstallDelete]
; Clean up log files on uninstall
Type: files; Name: "{userappdata}\{#MyAppName}\data\localwhisper.log*"

[Code]
// Ask user if they want to remove user data on uninstall
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usPostUninstall then
  begin
    if MsgBox('Do you want to remove your LocalWhisper user data?' + #13#10 +
              '(Settings, models, and transcription history in %APPDATA%\LocalWhisper)',
              mbConfirmation, MB_YESNO or MB_DEFBUTTON2) = IDYES then
    begin
      DelTree(ExpandConstant('{userappdata}\{#MyAppName}'), True, True, True);
    end;
  end;
end;
